import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Users, Server, Monitor, FileText, Clock, Shield } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useLicenses } from "@/hooks/useLicenses";
import { useServiceLicenses } from "@/hooks/useServiceLicenses";
import { useEmployees } from "@/hooks/useEmployees";
import { usePackageConfigs } from "@/hooks/usePackageConfigs";
import { getServicesForPackage, calculatePackageCosts } from "@/lib/costing";
import { getBadgeVariantFromColor, getColorByName, getColorClasses, getPackageColor } from "@/lib/colors";
import { getInclusionLabel, getInclusionVariant, getInclusionIcon, InclusionType } from "@/lib/packageUtils";

interface PackageData {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  services: string[];
  highlighted?: boolean;
}

export function CustomerViewPage() {
  const [selectedPackage, setSelectedPackage] = useState("basis");
  const [config] = useState({
    clients: 10,
    servers: 10,
    users: 10
  });

  // Fetch real data from hooks
  const { services } = useServices();
  const { licenses } = useLicenses();
  const { getAllServiceLicenseRelations } = useServiceLicenses();
  const { employees } = useEmployees();
  const { getConfigByServiceAndPackage } = usePackageConfigs();

  // Calculate average hourly rate per minute
  const activeEmployees = employees.filter(emp => emp.active);
  const avgCostPerMinute = activeEmployees.length > 0
    ? activeEmployees.reduce((sum, emp) => sum + emp.hourly_rate, 0) / activeEmployees.length / 60
    : 0;

  // Calculate package data from real services and licenses with deduplication
  const packages: PackageData[] = useMemo(() => {
    const packageLevels = ['basis', 'gold', 'allin', 'allin black'];
    
    return packageLevels.map((level, index) => {
      // Get services for this package level
      const packageServices = getServicesForPackage(services, level);

      // Calculate package costs with license deduplication
      const packageCosts = calculatePackageCosts(
        packageServices,
        licenses,
        getAllServiceLicenseRelations(),
        avgCostPerMinute,
        config
      );

      // Use VK prices for customer view
      let totalMonthlyPrice = packageCosts.totalPriceVK;

      const descriptions = {
        'basis': 'Grundlegende IT-Services für kleine Unternehmen',
        'gold': 'Erweiterte Services für wachsende Unternehmen',
        'allin': 'Umfassende IT-Betreuung für professionelle Anforderungen',
        'allin black': 'Premium-Services für höchste Ansprüche'
      };

      return {
        name: level === 'allin black' ? 'Allin Black' : level.charAt(0).toUpperCase() + level.slice(1),
        description: descriptions[level as keyof typeof descriptions] || '',
        monthlyPrice: totalMonthlyPrice,
        yearlyPrice: totalMonthlyPrice * 12 * 0.9, // 10% discount for yearly
        services: packageServices.map(s => s.name),
        highlighted: index === 0 // Highlight first package (Basis)
      };
    });
  }, [services, licenses, getAllServiceLicenseRelations, avgCostPerMinute, config]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-cyan-500">
      {/* Header */}
      <div className="text-center text-white py-12">
        <h1 className="text-4xl font-bold mb-4">IT-Service Angebot</h1>
        <p className="text-xl text-teal-100">
          Maßgeschneiderte IT-Lösungen für Ihr Unternehmen
        </p>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Configuration Display */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Monitor className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-600">{config.clients}</div>
                <div className="text-sm text-muted-foreground">Clients</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Server className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-600">{config.servers}</div>
                <div className="text-sm text-muted-foreground">Server</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-600">{config.users}</div>
                <div className="text-sm text-muted-foreground">Benutzer</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Packages Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Unsere Service-Pakete</h2>
          <p className="text-xl text-teal-100">
            Wählen Sie das passende Paket für Ihre Anforderungen
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {packages.map((pkg) => (
            <Card 
              key={pkg.name} 
              className={`relative ${pkg.highlighted ? 'ring-2 ring-teal-400 shadow-xl' : ''} ${
                selectedPackage === pkg.name.toLowerCase() ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    Gewählt
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="mb-3">
                  <Badge 
                    variant={getBadgeVariantFromColor(getPackageColor(pkg.name))} 
                    className="text-sm"
                    style={{ 
                      backgroundColor: getColorByName(getPackageColor(pkg.name))?.hex, 
                      color: getColorClasses(getPackageColor(pkg.name)).text === 'text-white' ? 'white' : 'black',
                      borderColor: getColorByName(getPackageColor(pkg.name))?.hex
                    }}
                  >
                    {pkg.name}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {pkg.description}
                </p>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">
                    {pkg.monthlyPrice.toFixed(2)}€
                  </div>
                  <div className="text-sm text-muted-foreground">pro Monat</div>
                  <div className="text-lg font-semibold">
                    {pkg.yearlyPrice.toFixed(2)}€
                  </div>
                  <div className="text-xs text-muted-foreground">pro Jahr</div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium">Enthaltene Services:</p>
                  <div className="space-y-2">
                    {pkg.services.map((serviceName, index) => {
                      const service = services.find(s => s.name === serviceName);
                      const packageConfig = service ? getConfigByServiceAndPackage(service.id, pkg.name.toLowerCase()) : null;
                      
                      return (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-lg">
                              {packageConfig ? getInclusionIcon(packageConfig.inclusion_type as InclusionType) : '✓'}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{serviceName}</span>
                                {packageConfig && (
                                  <Badge 
                                    variant={getInclusionVariant(packageConfig.inclusion_type as InclusionType)}
                                    className="text-xs"
                                  >
                                    {getInclusionLabel(packageConfig.inclusion_type as InclusionType)}
                                  </Badge>
                                )}
                              </div>
                              
                              {packageConfig && (
                                <div className="space-y-1 text-xs text-muted-foreground">
                                  {packageConfig.sla_response_time && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>Reaktionszeit: {packageConfig.sla_response_time}</span>
                                    </div>
                                  )}
                                  {packageConfig.sla_availability && (
                                    <div className="flex items-center gap-1">
                                      <Shield className="h-3 w-3" />
                                      <span>Verfügbarkeit: {packageConfig.sla_availability}</span>
                                    </div>
                                  )}
                                  {packageConfig.custom_description && (
                                    <div className="text-xs italic">
                                      {packageConfig.custom_description}
                                    </div>
                                  )}
                                  {packageConfig.hourly_rate_surcharge && (
                                    <div className="text-xs">
                                      Stundensatz-Zuschlag: +{packageConfig.hourly_rate_surcharge}%
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    variant={selectedPackage === pkg.name.toLowerCase() ? "default" : "outline"}
                    onClick={() => setSelectedPackage(pkg.name.toLowerCase())}
                  >
                    {selectedPackage === pkg.name.toLowerCase() ? "Ausgewählt" : "Auswählen"}
                  </Button>
                  
                  {selectedPackage === pkg.name.toLowerCase() && (
                    <Button 
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const params = new URLSearchParams({
                          package: pkg.name.toLowerCase(),
                          clients: config.clients.toString(),
                          servers: config.servers.toString(),
                          users: config.users.toString()
                        });
                        window.open(`/contract-appendix?${params.toString()}`, '_blank');
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Vertragsanhang
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Alle Preise verstehen sich netto zzgl. gesetzlicher MwSt.
            </p>
            <p className="text-sm text-muted-foreground">
              Angebot gültig für 30 Tage. Preise basieren auf Ihrer angegebenen Infrastruktur.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}