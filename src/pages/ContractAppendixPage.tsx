import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Copy, Check } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useLicenses } from "@/hooks/useLicenses";
import { useServiceLicenses } from "@/hooks/useServiceLicenses";
import { useServicePackages } from "@/hooks/useServicePackages";
import { useToast } from "@/hooks/use-toast";
import { formatDescription } from "@/lib/formatDescription";

export default function ContractAppendixPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Get URL parameters
  const packageName = searchParams.get("package") || "basis";
  const workstations = parseInt(searchParams.get("workstations") || "10");
  const servers = parseInt(searchParams.get("servers") || "10");
  const users = parseInt(searchParams.get("users") || "10");

  // Fetch data
  const { services } = useServices();
  const { licenses } = useLicenses();
  const { serviceLicenses } = useServiceLicenses();
  const { getPackagesByServiceId } = useServicePackages();

  // Get services for this package
  const packageServices = services.filter(service => {
    const servicePackages = getPackagesByServiceId(service.id);
    return service.active && servicePackages.some(pkg => 
      pkg.toLowerCase() === packageName.toLowerCase()
    );
  });

  // Package descriptions
  const packageDescriptions = {
    'basis': 'Grundlegende IT-Services für kleine Unternehmen mit essentiellen Funktionen.',
    'gold': 'Erweiterte Services für wachsende Unternehmen mit zusätzlichen Sicherheits- und Management-Features.',
    'allin': 'Umfassende IT-Betreuung für professionelle Anforderungen mit allen wichtigen Services.',
    'allin black': 'Premium-Services für höchste Ansprüche mit 24/7 Support und erweiterten Sicherheitsfunktionen.'
  };

  const formatPackageName = (name: string) => {
    return name === 'allin black' ? 'Allin Black' : name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getBillingTypeDescription = (billingType: string) => {
    switch (billingType) {
      case 'fix': return 'Pauschal';
      case 'pro_client': return 'Pro Client';
      case 'pro_server': return 'Pro Server';
      case 'pro_user': return 'Pro Benutzer';
      case 'pro_device': return 'Pro Gerät';
      default: return billingType;
    }
  };

  const getServiceLicenses = (serviceId: string) => {
    const serviceLicenseRelations = serviceLicenses.filter(sl => sl.service_id === serviceId);
    return serviceLicenseRelations.map(sl => {
      const license = licenses.find(l => l.id === sl.license_id);
      return license ? { 
        ...license, 
        includeCost: sl.include_cost,
        isCentrallyAllocated: !!license.cost_allocation_service_id
      } : null;
    }).filter(Boolean);
  };

  const handlePrint = () => {
    window.print();
  };

  const generateTextContent = () => {
    const formattedName = formatPackageName(packageName);
    const description = packageDescriptions[packageName.toLowerCase() as keyof typeof packageDescriptions];
    
    let content = `VERTRAGSANHANG - ${formattedName.toUpperCase()}\n\n`;
    content += `Paketbeschreibung:\n${description}\n\n`;
    content += `Konfiguration:\n`;
    content += `- Arbeitsplätze: ${workstations}\n`;
    content += `- Server: ${servers}\n`;
    content += `- Benutzer: ${users}\n\n`;
    content += `ENTHALTENE SERVICES:\n\n`;

    packageServices.forEach((service, index) => {
      content += `${index + 1}. ${service.name}\n`;
      if (service.description) {
        content += `   Beschreibung: ${service.description}\n`;
      }
      content += `   Abrechnung: ${getBillingTypeDescription(service.billing_type || 'fix')}\n`;
      content += `   Zeitaufwand: ${service.time_in_minutes} Minuten\n`;
      
      const serviceLicenseList = getServiceLicenses(service.id);
      if (serviceLicenseList.length > 0) {
        content += `   Lizenzen:\n`;
        serviceLicenseList.forEach(license => {
          if (license) {
            const costNote = license.includeCost ? '' : ' (Kosten nicht inkludiert)';
            const centralNote = license.isCentrallyAllocated ? ' (zentrale Kostenzuordnung)' : '';
            content += `   - ${license.name}${costNote}${centralNote}\n`;
          }
        });
      }
      content += '\n';
    });

    content += `\nDokument erstellt am: ${new Date().toLocaleDateString('de-DE')}\n`;
    return content;
  };

  const handleCopyToClipboard = async () => {
    try {
      const content = generateTextContent();
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Kopiert",
        description: "Vertragsanhang wurde in die Zwischenablage kopiert.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Kopieren in die Zwischenablage.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .print-page {
            margin: 0;
            padding: 20px;
            font-size: 12pt;
            line-height: 1.4;
          }
          
          .print-header {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          
          .print-service {
            break-inside: avoid;
            margin-bottom: 15px;
          }
        }
      `}</style>

      {/* Navigation - hidden in print */}
      <div className="no-print bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Kundenansicht
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 print-page">
        {/* Header */}
        <div className="print-header mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Vertragsanhang - {formatPackageName(packageName)}
          </h1>
          <p className="text-muted-foreground">
            {packageDescriptions[packageName.toLowerCase() as keyof typeof packageDescriptions]}
          </p>
        </div>

        {/* Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Konfiguration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-muted rounded">
                <div className="font-semibold text-lg">{workstations}</div>
                <div className="text-muted-foreground">Arbeitsplätze</div>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <div className="font-semibold text-lg">{servers}</div>
                <div className="text-muted-foreground">Server</div>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <div className="font-semibold text-lg">{users}</div>
                <div className="text-muted-foreground">Benutzer</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions - hidden in print */}
        <div className="no-print flex gap-2 mb-8">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Als PDF drucken
          </Button>
          <Button 
            onClick={handleCopyToClipboard} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Kopiert!" : "In Zwischenablage"}
          </Button>
        </div>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle>Enthaltene Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {packageServices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Keine Services für das Paket "{formatPackageName(packageName)}" gefunden.
              </p>
            ) : (
              packageServices.map((service, index) => {
                const serviceLicenseList = getServiceLicenses(service.id);
                
                return (
                  <div key={service.id} className="print-service">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {index + 1}. {service.name}
                        </h3>
                        {service.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatDescription(service.description)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Abrechnung:</span>
                          <Badge variant="outline">
                            {getBillingTypeDescription(service.billing_type || 'fix')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Zeitaufwand:</span>
                          <span>{service.time_in_minutes} Minuten</span>
                        </div>
                      </div>
                      
                      {serviceLicenseList.length > 0 && (
                        <div>
                          <div className="font-medium text-sm mb-2">Lizenzkomponenten:</div>
                          <div className="space-y-1">
                            {serviceLicenseList.map((license) => {
                              if (!license) return null;
                              
                              return (
                                <div key={license.id} className="flex items-center gap-2 text-xs">
                                  <span>{license.name}</span>
                                  {!license.includeCost && (
                                    <Badge variant="secondary" className="text-xs">
                                      Kosten nicht inkludiert
                                    </Badge>
                                  )}
                                  {license.isCentrallyAllocated && (
                                    <Badge variant="outline" className="text-xs">
                                      Zentrale Zuordnung
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {index < packageServices.length - 1 && <Separator className="mt-6" />}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-sm text-muted-foreground text-center">
          <p>Dokument erstellt am: {new Date().toLocaleDateString('de-DE')}</p>
          <p className="mt-1">
            Alle Angaben ohne Gewähr. Änderungen vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
}