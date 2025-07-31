import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Edit, Trash, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [billingTypeFilter, setBillingTypeFilter] = useState("");

  const sampleLicenses = [
    { name: "IT Glue - Network Glue (OI)", category: "Kaseya", cost_per_month: 185.52, price_per_month: 278.28, active: true },
    { name: "IT Glue - MyGlue", category: "Kaseya", cost_per_month: 62.50, price_per_month: 93.75, active: true },
    { name: "Dark Web ID Domains", category: "Kaseya", cost_per_month: 4.48, price_per_month: 6.72, active: true },
    { name: "RMM Advanced Software Management", category: "Datto", cost_per_month: 0.17, price_per_month: 0.26, active: true },
    { name: "RMM Managed Endpoint", category: "Datto", cost_per_month: 0.77, price_per_month: 1.16, active: true },
    { name: "Protect Advanced", category: "ESET", cost_per_month: 1.55, price_per_month: 2.33, active: true },
    { name: "Ultra Subscription", category: "PA File Sight", cost_per_month: 18.00, price_per_month: 27.00, active: true },
    { name: "AutoElevate 750 Agent Plan Advanced", category: "CyberFox", cost_per_month: 1.65, price_per_month: 2.48, active: true },
    { name: "EL_Storage pro TB", category: "Wasabi", cost_per_month: 5.80, price_per_month: 8.70, active: true },
    { name: "Backup Radar", category: "Scalepad", cost_per_month: 0.65, price_per_month: 0.98, active: true },
    { name: "Cloud Connect", category: "Veeam", cost_per_month: 3.35, price_per_month: 5.03, active: true },
    { name: "Enterprise Standard", category: "Keeper", cost_per_month: 3.00, price_per_month: 4.50, active: true },
    { name: "Enterprise Plus", category: "Keeper", cost_per_month: 4.80, price_per_month: 7.20, active: true },
    { name: "Schwachstellenscan", category: "ConnectSecure", cost_per_month: 0.26, price_per_month: 0.39, active: true },
    { name: "Legacy Plan (40000 Operations/...)", category: "Make", cost_per_month: 29.00, price_per_month: 43.50, active: true },
    { name: "Microsoft 365 Business Basic", category: "Microsoft", cost_per_month: 5.60, price_per_month: 8.40, active: true },
    { name: "Microsoft 365 Business Standard", category: "Microsoft", cost_per_month: 11.70, price_per_month: 17.55, active: true },
    { name: "Microsoft 365 Business Premium", category: "Microsoft", cost_per_month: 20.60, price_per_month: 30.90, active: true },
    { name: "Cyber Backup Standard Server", category: "Acronis", cost_per_month: 89.00, price_per_month: 133.50, active: true },
    { name: "Windows Defender ATP", category: "Microsoft", cost_per_month: 3.50, price_per_month: 5.25, active: true },
    { name: "Backup & Replication", category: "Veeam", cost_per_month: 150.00, price_per_month: 225.00, active: true },
    { name: "Endpoint Security", category: "ESET", cost_per_month: 2.80, price_per_month: 4.20, active: true },
    { name: "Test2", category: "Test", cost_per_month: 2.00, price_per_month: 3.00, active: true }
  ];

  // Mapping für Abrechnungseinheiten basierend auf den Bildern
  const getBillingType = (licenseName: string) => {
    if (licenseName.includes("MyGlue") || licenseName.includes("Enterprise") || licenseName.includes("Business")) return "pro User";
    if (licenseName.includes("Advanced") || licenseName.includes("Endpoint") || licenseName.includes("Radar") || licenseName.includes("ATP") || licenseName.includes("Test")) return "pro Client";
    if (licenseName.includes("Ultra") || licenseName.includes("Cloud Connect") || licenseName.includes("Cyber Backup")) return "pro Server";
    return "Fix";
  };

  const addSampleLicenses = async () => {
    for (const lic of sampleLicenses) {
      try {
        await addLicense(lic);
      } catch (error) {
        console.error('Error adding license:', lic.name, error);
      }
    }
  };

  // Entfernt: Automatische Hinzufügung von Beispieldaten
  // useEffect(() => {
  //   if (licenses.length === 0) {
  //     addSampleLicenses();
  //   }
  // }, [licenses.length]);

  const filteredLicenses = licenses.filter(license => {
    const billingType = getBillingType(license.name);
    const matchesSearch = license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "all" || license.category === categoryFilter;
    const matchesBillingType = !billingTypeFilter || billingTypeFilter === "all" || billingType === billingTypeFilter;
    return matchesSearch && matchesCategory && matchesBillingType;
  });

  const uniqueCategories = [...new Set(licenses.map(license => license.category))];
  const uniqueBillingTypes = [...new Set(licenses.map(license => getBillingType(license.name)))];

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
                  <SelectItem value="all">Alle Hersteller</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={billingTypeFilter} onValueChange={setBillingTypeFilter}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Alle Abrechnungseinheiten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abrechnungseinheiten</SelectItem>
                  {uniqueBillingTypes.map((billingType) => (
                    <SelectItem key={billingType} value={billingType}>
                      {billingType}
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
                    <Badge 
                      variant={getBillingType(license.name) === "Fix" ? "secondary" : "default"} 
                      className="text-xs"
                    >
                      {getBillingType(license.name)}
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