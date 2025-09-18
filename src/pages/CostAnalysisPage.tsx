import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, Clock, Users, Layers } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useLicenses } from "@/hooks/useLicenses";
import { useServiceLicenses } from "@/hooks/useServiceLicenses";
import { useEmployees } from "@/hooks/useEmployees";
import { getServicesForPackageWithConfig, calculateEnhancedPackageCosts } from "@/lib/enhancedCosting";
import { usePackageConfigs } from "@/hooks/usePackageConfigs";

interface PackageCostBreakdown {
  packageName: string;
  totalCost: number;
  totalPrice: number;
  margin: number;
  marginPercent: number;
  serviceCosts: Array<{
    serviceName: string;
    timeCost: number;
    licenseCosts: number;
    totalServiceCost: number;
  }>;
}

export function CostAnalysisPage() {
  const { services } = useServices();
  const { licenses } = useLicenses();
  const { serviceLicenses } = useServiceLicenses();
  const { employees } = useEmployees();
  const { packageConfigs } = usePackageConfigs();

  // Configuration state - matching CalculatorPage defaults
  const [config, setConfig] = useState({
    workstations: 10,
    servers: 2,
    users: 25
  });

  // Standard markup from calculator (100%)
  const standardMarkup = 100;

  // Calculate average cost per minute from active employees
  const activeEmployees = employees.filter(emp => emp.active);
  const avgCostPerMinute = activeEmployees.length > 0
    ? activeEmployees.reduce((sum, emp) => sum + Number(emp.hourly_rate), 0) / activeEmployees.length / 60
    : 0;

  // Calculate cost breakdown for each package with enhanced costing
  const packageAnalysis: PackageCostBreakdown[] = useMemo(() => {
    const packageLevels = ['basis', 'gold', 'allin', 'allin black'];
    
    return packageLevels.map(level => {
      const packageServices = getServicesForPackageWithConfig(services, packageConfigs, level);

      // Calculate package costs with enhanced costing
      const packageCosts = calculateEnhancedPackageCosts(
        packageServices,
        licenses,
        serviceLicenses,
        packageConfigs,
        avgCostPerMinute,
        level,
        config
      );

      // Build service costs breakdown
      const serviceCosts: PackageCostBreakdown['serviceCosts'] = [];
      packageServices.forEach(service => {
        let timeCost = 0;
        if (service.time_in_minutes) {
          timeCost = service.time_in_minutes * avgCostPerMinute;
        }

        serviceCosts.push({
          serviceName: service.name,
          timeCost,
          licenseCosts: 0, // Individual service license costs are now deduplicated
          totalServiceCost: timeCost
        });
      });

      // Calculate margin based on standard markup
      const totalVK = packageCosts.totalCostEK * (1 + standardMarkup / 100);
      const margin = totalVK - packageCosts.totalCostEK;
      const marginPercent = standardMarkup; // Show the standard markup percentage

      return {
        packageName: level.charAt(0).toUpperCase() + level.slice(1),
        totalCost: packageCosts.totalCostEK,
        totalPrice: totalVK,
        margin,
        marginPercent,
        serviceCosts
      };
    });
  }, [services, licenses, avgCostPerMinute, serviceLicenses, packageConfigs, standardMarkup, config]);

  const getPackageColor = (packageName: string) => {
    switch (packageName.toLowerCase()) {
      case 'basis': return 'bg-blue-500';
      case 'gold': return 'bg-yellow-500';
      case 'allin': return 'bg-purple-500';
      case 'allin black': return 'bg-gray-800';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Interne Kostenanalyse</h1>
        <p className="text-muted-foreground">Detaillierte Aufschlüsselung der Kosten und Margen pro Paket</p>
      </div>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguration für Kostenanalyse</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workstations">Anzahl Arbeitsplätze</Label>
              <Input
                id="workstations"
                type="number"
                value={config.workstations}
                onChange={(e) => setConfig(prev => ({ ...prev, workstations: parseInt(e.target.value) || 0 }))}
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servers">Anzahl Server</Label>
              <Input
                id="servers"
                type="number"
                value={config.servers}
                onChange={(e) => setConfig(prev => ({ ...prev, servers: parseInt(e.target.value) || 0 }))}
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="users">Anzahl Benutzer</Label>
              <Input
                id="users"
                type="number"
                value={config.users}
                onChange={(e) => setConfig(prev => ({ ...prev, users: parseInt(e.target.value) || 0 }))}
                className="text-center"
              />
            </div>
          </div>
          
          {/* Configuration Overview */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <strong>Aktuelle Konfiguration:</strong> {config.workstations} Arbeitsplätze, {config.servers} Server, {config.users} Benutzer
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Aktive Mitarbeiter</div>
                <div className="text-xl font-bold">{activeEmployees.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Ø Kosten/Min</div>
                <div className="text-xl font-bold">{avgCostPerMinute.toFixed(2)}€</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Aktive Services</div>
                <div className="text-xl font-bold">{services.filter(s => s.active).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Aktive Lizenzen</div>
                <div className="text-xl font-bold">{licenses.filter(l => l.active).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Analysis */}
      <div className="grid gap-6">
        {packageAnalysis.map((pkg) => (
          <Card key={pkg.packageName}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${getPackageColor(pkg.packageName)}`}></div>
                  Paket {pkg.packageName}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant={pkg.marginPercent > 30 ? "default" : pkg.marginPercent > 15 ? "secondary" : "destructive"}>
                    {pkg.marginPercent.toFixed(1)}% Marge
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Gesamtkosten</div>
                  <div className="text-lg font-bold text-red-600">{pkg.totalCost.toFixed(2)}€</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Verkaufspreis</div>
                  <div className="text-lg font-bold text-green-600">{pkg.totalPrice.toFixed(2)}€</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Gewinn</div>
                  <div className={`text-lg font-bold ${pkg.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pkg.margin.toFixed(2)}€
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Marge</div>
                  <div className={`text-lg font-bold ${pkg.marginPercent > 15 ? 'text-green-600' : 'text-red-600'}`}>
                    {pkg.marginPercent.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Service Breakdown */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Service-Aufschlüsselung
                </h4>
                <div className="space-y-2">
                  {pkg.serviceCosts.length > 0 ? (
                    pkg.serviceCosts.map((service, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg">
                        <div className="font-medium">{service.serviceName}</div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Arbeitszeit: </span>
                          <span className="font-mono">{service.timeCost.toFixed(2)}€</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Lizenzen: </span>
                          <span className="font-mono">{service.licenseCosts.toFixed(2)}€</span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span className="text-muted-foreground">Gesamt: </span>
                          <span className="font-mono">{service.totalServiceCost.toFixed(2)}€</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      Keine Services für dieses Paket konfiguriert
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information Footer */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Hinweise zur Kostenanalyse:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Arbeitskosten basieren auf dem Durchschnitt aller aktiven Mitarbeiter</li>
              <li>Lizenzkosten berücksichtigen nur die Einkaufspreise (cost_per_month)</li>
              <li>Verkaufspreise stammen aus den konfigurierten Lizenzpreisen (price_per_month)</li>
              <li>Margen unter 15% sollten überprüft werden</li>
              <li>Paket-Preise berücksichtigen noch keine Infrastruktur-Multiplikatoren</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}