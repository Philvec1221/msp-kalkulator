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
            <Card key={license.id} className="relative">
              <CardContent className="p-6">
                {/* Header with Icon and Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-600 text-sm">
                      {license.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <LicenseForm
                      license={license}
                      onSubmit={(data) => updateLicense(license.id, data)}
                      trigger={
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3 text-blue-600" />
                        </Button>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Trash className="h-3 w-3 text-red-600" />
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
                
                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Hersteller</p>
                    <p className="font-medium">{license.category}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Einkaufspreis</p>
                    <p className="text-lg font-semibold text-green-600">
                      {license.cost_per_month.toFixed(2)}€
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Abrechnungseinheit</p>
                    <Badge variant="secondary" className="text-xs">
                      fix
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}