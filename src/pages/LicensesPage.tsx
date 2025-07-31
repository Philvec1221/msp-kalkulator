import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Edit, Trash, Search, Filter } from "lucide-react";
import { useState } from "react";
import { useLicenses } from "@/hooks/useLicenses";
import { LicenseForm } from "@/components/forms/LicenseForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function LicensesPage() {
  const { licenses, loading, addLicense, updateLicense, deleteLicense } = useLicenses();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || license.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = [...new Set(licenses.map(license => license.category))];

  if (loading) {
    return <div className="flex justify-center py-8">Lade Lizenzen...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lizenz-Verwaltung</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Lizenz-Datenbank mit Hersteller, Produkt, EK und Abrechnungseinheit.
          </p>
        </div>
        <LicenseForm onSubmit={addLicense} />
      </div>

      {licenses.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filter</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hersteller oder Produkt suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Alle Hersteller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Hersteller</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {filteredLicenses.length} Lizenzen gesamt
            </p>
          </CardHeader>
        </Card>
      )}

      {filteredLicenses.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              {licenses.length === 0 
                ? "Noch keine Lizenzen vorhanden. Fügen Sie die erste Lizenz hinzu."
                : "Keine Lizenzen gefunden. Überprüfen Sie Ihre Suchkriterien."}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLicenses.map((license) => (
            <Card key={license.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{license.name}</h3>
                      <p className="text-sm text-muted-foreground">Hersteller</p>
                      <p className="text-sm font-medium">{license.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LicenseForm
                      license={license}
                      onSubmit={(data) => updateLicense(license.id, data)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Lizenz löschen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sind Sie sicher, dass Sie {license.name} löschen möchten? 
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteLicense(license.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Einkaufspreis</span>
                    <span className="font-medium text-primary">{license.cost_per_month.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Abrechnungseinheit</span>
                    <Badge variant="outline">fix</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant={license.active ? "default" : "secondary"}>
                    {license.active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}