import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Save, Eye, FileText, ExternalLink } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useServices } from "@/hooks/useServices";
import { useEmployees } from "@/hooks/useEmployees";
import { useLicenses } from "@/hooks/useLicenses";
import { useServiceLicenses } from "@/hooks/useServiceLicenses";
import { usePackages } from "@/hooks/usePackages";
import { useSavedOffers } from "@/hooks/useSavedOffers";
import { getServicesForPackage, calculatePackageCosts } from "@/lib/costing";
import { getPackageBadgeProps } from "@/lib/colors";
import { useToast } from "@/hooks/use-toast";

interface QuoteData {
  customerNumber: string;
  quoteTitle: string;
  clients: number;
  servers: number;
  users: number;
  markup: number;
  allPackages: { [packageName: string]: { ekTotal: number; vkTotal: number; services: any[] } };
}

interface SaveOfferData {
  name: string;
}

export function CalculatorPage() {
  const { services } = useServices();
  const { employees } = useEmployees();
  const { licenses } = useLicenses();
  const { getAllServiceLicenseRelations } = useServiceLicenses();
  const { packages } = usePackages();
  const { createSavedOffer } = useSavedOffers();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [quoteData, setQuoteData] = useState<QuoteData>({
    customerNumber: "z.B. K-2024-001",
    quoteTitle: "IT-Services Angebot",
    clients: 10,
    servers: 2,
    users: 25,
    markup: 25,
    allPackages: {}
  });

  const [saveOfferData, setSaveOfferData] = useState<SaveOfferData>({
    name: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const activeEmployees = employees.filter(emp => emp.active);
  const averageCostPerMinute = activeEmployees.length > 0 
    ? activeEmployees.reduce((sum, emp) => sum + emp.hourly_rate, 0) / activeEmployees.length / 60
    : 0;

  // Available package levels
  const packageLevels = ['Basis', 'Gold', 'Allin', 'Allin Black'];

  // Calculate all packages
  useEffect(() => {
    if (services.length > 0 && licenses.length > 0) {
      const allPackagesData: { [packageName: string]: { ekTotal: number; vkTotal: number; services: any[] } } = {};
      
      packageLevels.forEach(packageLevel => {
        const packageServices = getServicesForPackage(services, packageLevel);
        const packageCosts = calculatePackageCosts(
          packageServices,
          licenses,
          getAllServiceLicenseRelations(),
          averageCostPerMinute,
          { clients: quoteData.clients, servers: quoteData.servers, users: quoteData.users }
        );
        
        const totalEK = packageCosts.totalCostEK;
        const totalVK = totalEK * (1 + quoteData.markup / 100);
        
        allPackagesData[packageLevel] = {
          ekTotal: totalEK,
          vkTotal: totalVK,
          services: packageServices // Store complete service objects instead of just IDs
        };
      });
      
      setQuoteData(prev => ({
        ...prev,
        allPackages: allPackagesData
      }));
    }
  }, [services, licenses, averageCostPerMinute, quoteData.clients, quoteData.servers, quoteData.users, quoteData.markup]);

  const handleSaveOffer = async () => {
    // Use existing customer number and title if no custom name is provided
    const offerName = saveOfferData.name.trim() || `${quoteData.customerNumber} - ${quoteData.quoteTitle}`;

    const offerId = await createSavedOffer({
      name: offerName,
      company_name: quoteData.customerNumber,
      clients: quoteData.clients,
      servers: quoteData.servers,
      users: quoteData.users,
      selected_packages: packageLevels,
      calculation_results: {
        markup: quoteData.markup,
        allPackages: quoteData.allPackages
      }
    });

    if (offerId) {
      setIsDialogOpen(false);
      setSaveOfferData({ name: "" });
      toast({
        title: "Angebot gespeichert",
        description: `Das Angebot "${offerName}" wurde erfolgreich gespeichert.`
      });
    }
  };

  const handleSendToCustomerView = async () => {
    // Auto-generate name from existing data
    const autoName = `${quoteData.customerNumber} - ${quoteData.quoteTitle}`;

    const offerId = await createSavedOffer({
      name: autoName,
      company_name: quoteData.customerNumber,
      clients: quoteData.clients,
      servers: quoteData.servers,
      users: quoteData.users,
      selected_packages: packageLevels,
      calculation_results: {
        markup: quoteData.markup,
        allPackages: quoteData.allPackages
      }
    });

    if (offerId) {
      // Navigate to kundenview with offer parameter
      navigate(`/?offer=${offerId}#kundenview`);
      toast({
        title: "Kundenview geöffnet",
        description: "Das Angebot wurde gespeichert und zur Kundenansicht gewechselt."
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguration</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clients">Anzahl Clients</Label>
              <Input
                id="clients"
                type="number"
                value={quoteData.clients}
                onChange={(e) => setQuoteData(prev => ({ ...prev, clients: parseInt(e.target.value) || 0 }))}
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servers">Anzahl Server</Label>
              <Input
                id="servers"
                type="number"
                value={quoteData.servers}
                onChange={(e) => setQuoteData(prev => ({ ...prev, servers: parseInt(e.target.value) || 0 }))}
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="users">Anzahl User</Label>
              <Input
                id="users"
                type="number"
                value={quoteData.users}
                onChange={(e) => setQuoteData(prev => ({ ...prev, users: parseInt(e.target.value) || 0 }))}
                className="text-center"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
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
          </div>
        </CardContent>
      </Card>

      {/* Paket-Berechnungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-blue-600">📦</span>
            Paket-Berechnungen (Alle Optionen)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Alle verfügbaren Pakete werden automatisch berechnet und stehen dem Kunden zur Auswahl
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {packageLevels.map(packageLevel => {
              const packageData = quoteData.allPackages[packageLevel];
              if (!packageData) return null;
              
              return (
                <div key={packageLevel} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge {...getPackageBadgeProps(packages || [], packageLevel)}>
                      {packageLevel}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground">EK: </span>
                      <span className="font-medium">{packageData.ekTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">VK: </span>
                      <span className="font-semibold text-primary">{packageData.vkTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
                Standard: 25% - kann pro Angebot angepasst werden
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Aktueller Aufschlag</p>
              <div className="text-4xl font-bold text-orange-600">{quoteData.markup}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preisübersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-green-600">💰</span>
            Preisübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-lg font-semibold text-muted-foreground mb-4">
              Preisrahmen aller Pakete (mit {quoteData.markup}% Aufschlag)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {packageLevels.map(packageLevel => {
                const packageData = quoteData.allPackages[packageLevel];
                if (!packageData) return null;
                
                return (
                  <div key={packageLevel} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{packageLevel}</p>
                    <p className="text-lg font-bold text-primary">
                      {packageData.vkTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                );
              })}
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
                placeholder="z.B. IT-Services Angebot"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
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
              <span className="text-sm text-muted-foreground">Aufschlag: </span>
              <span className="font-semibold text-orange-600">{quoteData.markup}%</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Angebot speichern
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Angebot speichern</DialogTitle>
                  <DialogDescription>
                    Speichern Sie das Angebot mit allen berechneten Paketen. Der Name wird automatisch aus Kundennummer und Titel generiert, kann aber angepasst werden.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="offer-name">Angebot Name (optional)</Label>
                    <Input
                      id="offer-name"
                      value={saveOfferData.name}
                      onChange={(e) => setSaveOfferData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={`${quoteData.customerNumber} - ${quoteData.quoteTitle}`}
                    />
                    <div className="text-xs text-muted-foreground">
                      Leer lassen für automatischen Namen: {quoteData.customerNumber} - {quoteData.quoteTitle}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
                  <Button onClick={handleSaveOffer}>Speichern</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={handleSendToCustomerView}
            >
              <ExternalLink className="h-4 w-4" />
              An Kundenview senden
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2" disabled>
              <FileText className="h-4 w-4" />
              Druckansicht
            </Button>
            <Button variant="outline" className="flex items-center gap-2" disabled>
              <Eye className="h-4 w-4" />
              PDF Vorschau
            </Button>
            <Button variant="outline" className="flex items-center gap-2" disabled>
              <Download className="h-4 w-4" />
              PDF Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Berechnungsgrundlagen */}
        <Card>
          <CardHeader>
            <CardTitle>Berechnungsgrundlagen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Durchschnittliche Kosten/Min:</span>
              <span className="font-semibold">{averageCostPerMinute.toFixed(2)}€</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Aktive Mitarbeiter:</span>
              <span className="font-semibold">{activeEmployees.length}</span>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              Diese Werte bilden die Grundlage für alle Berechnungen in der Angebotserstellung.
            </p>
          </CardContent>
        </Card>

        {/* Berechnungshinweise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-yellow-600">💡</span>
              Berechnungshinweise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              <strong>Kundenorientiert:</strong> Alle Pakete werden automatisch berechnet - der Kunde kann frei wählen.
            </p>
            <p className="text-sm">
              <strong>Flexibel:</strong> Konfiguration und Aufschlag können jederzeit angepasst werden.
            </p>
            <p className="text-sm">
              <strong>Transparent:</strong> EK- und VK-Preise für alle Pakete auf einen Blick.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}