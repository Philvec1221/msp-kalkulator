import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download, Save, Eye, FileText } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useEmployees } from "@/hooks/useEmployees";
import { useLicenses } from "@/hooks/useLicenses";
import { useServiceLicenses } from "@/hooks/useServiceLicenses";
import { usePackages } from "@/hooks/usePackages";
import { getServicesForPackage, calculatePackageCosts } from "@/lib/costing";
import { getPackageBadgeProps } from "@/lib/colors";

interface QuoteData {
  customerNumber: string;
  quoteTitle: string;
  clients: number;
  servers: number;
  users: number;
  selectedPackage: string;
  markup: number;
  ekTotal: number;
  vkTotal: number;
}

export function CalculatorPage() {
  const { services } = useServices();
  const { employees } = useEmployees();
  const { licenses } = useLicenses();
  const { getAllServiceLicenseRelations } = useServiceLicenses();
  const { packages } = usePackages();
  
  const [quoteData, setQuoteData] = useState<QuoteData>({
    customerNumber: "z.B. K-2024-001",
    quoteTitle: "z.B. MSP Basis Paket Q1 2024",
    clients: 10,
    servers: 10,
    users: 10,
    selectedPackage: "Basis",
    markup: 50,
    ekTotal: 2278.00,
    vkTotal: 3417.00
  });

  const activeEmployees = employees.filter(emp => emp.active);
  const averageCostPerMinute = activeEmployees.length > 0 
    ? activeEmployees.reduce((sum, emp) => sum + emp.hourly_rate, 0) / activeEmployees.length / 60
    : 0;

  // Calculate package services based on selected package
  const getPackageServices = () => {
    return getServicesForPackage(services, quoteData.selectedPackage);
  };


  const packageServices = getPackageServices();
  
  // Calculate costs with license deduplication
  const packageCosts = calculatePackageCosts(
    packageServices,
    licenses,
    getAllServiceLicenseRelations(),
    averageCostPerMinute,
    { clients: quoteData.clients, servers: quoteData.servers, users: quoteData.users }
  );
  
  const totalEK = packageCosts.totalCostEK;
  const totalVK = totalEK * (1 + quoteData.markup / 100);

  useEffect(() => {
    setQuoteData(prev => ({
      ...prev,
      ekTotal: totalEK,
      vkTotal: totalVK
    }));
  }, [totalEK, totalVK]);

  return (
    <div className="space-y-6">
      {/* Paket-Auswahl */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-blue-600">📦</span>
            Paket-Auswahl
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="selectedPackage">Paket wählen</Label>
              <Select 
                value={quoteData.selectedPackage} 
                onValueChange={(value) => setQuoteData(prev => ({ ...prev, selectedPackage: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Paket auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.name}>{pkg.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Bestimmt welche Services im Angebot enthalten sind
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Aktuelles Paket</p>
              <Badge 
                {...getPackageBadgeProps(packages || [], quoteData.selectedPackage)}
              >
                {quoteData.selectedPackage}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {packageServices.length} Services enthalten
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aufschlag-Verwaltung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-orange-600">%</span>
            Aufschlag-Verwaltung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="markup">Aufschlag (%)</Label>
              <Input
                id="markup"
                type="number"
                value={quoteData.markup}
                onChange={(e) => setQuoteData(prev => ({ ...prev, markup: parseInt(e.target.value) || 0 }))}
                className="text-center text-2xl font-bold"
              />
              <p className="text-xs text-muted-foreground">
                Standard: 50% - kann pro Angebot angepasst werden
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Aktueller Aufschlag</p>
              <div className="text-4xl font-bold text-orange-600">{quoteData.markup}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktuelles Angebot speichern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-green-600" />
            Aktuelles Angebot speichern
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerNumber">Kundennummer</Label>
              <Input
                id="customerNumber"
                value={quoteData.customerNumber}
                onChange={(e) => setQuoteData(prev => ({ ...prev, customerNumber: e.target.value }))}
                placeholder="z.B. K-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteTitle">Angebot Titel</Label>
              <Input
                id="quoteTitle"
                value={quoteData.quoteTitle}
                onChange={(e) => setQuoteData(prev => ({ ...prev, quoteTitle: e.target.value }))}
                placeholder="z.B. MSP Basis Paket Q1 2024"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <div>
              <span className="text-sm text-muted-foreground">Clients: </span>
              <span className="font-semibold">{quoteData.clients}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Server: </span>
              <span className="font-semibold">{quoteData.servers}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">User: </span>
              <span className="font-semibold">{quoteData.users}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Paket: </span>
              <Badge 
                {...getPackageBadgeProps(packages || [], quoteData.selectedPackage)}
              >
                {quoteData.selectedPackage}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Aufschlag: </span>
              <span className="font-semibold text-orange-600">{quoteData.markup}%</span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div>
              <span className="text-sm text-muted-foreground">EK (Einkauf): </span>
              <span className="font-semibold text-lg">{totalEK.toFixed(2)}€</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">VK (Verkauf): </span>
              <span className="font-semibold text-lg text-blue-600">{totalVK.toFixed(2)}€</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Angebot speichern
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Druckansicht
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              PDF Vorschau
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              PDF Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gespeicherte Angebote */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Gespeicherte Angebote
            </CardTitle>
            <span className="text-sm text-teal-600">0 Angebote</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>Noch keine Angebote gespeichert.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}