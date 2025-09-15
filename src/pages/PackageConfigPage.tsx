import { PackageConfigForm } from "@/components/forms/PackageConfigForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, FileText } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { usePackages } from "@/hooks/usePackages";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PackageConfigPage() {
  const { services } = useServices();
  const { packages } = usePackages();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedPackageType, setSelectedPackageType] = useState<string>('');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Package-Konfiguration</h1>
            <p className="text-muted-foreground">
              Verwalten Sie Service-Package-Zuordnungen, SLA-Zeiten und Inklusionstypen
            </p>
          </div>
        </div>

        <Tabs defaultValue="manage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="manage">
              <Settings className="h-4 w-4 mr-2" />
              Konfigurationen verwalten
            </TabsTrigger>
            <TabsTrigger value="overview">
              <Package className="h-4 w-4 mr-2" />
              Übersicht
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filter</CardTitle>
                <CardDescription>
                  Filtern Sie nach Service oder Package-Typ für eine fokussierte Ansicht
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Service</Label>
                    <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alle Services" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Alle Services</SelectItem>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Package-Typ</Label>
                    <Select value={selectedPackageType} onValueChange={setSelectedPackageType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alle Package-Typen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Alle Package-Typen</SelectItem>
                        {packages.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.name}>
                            {pkg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <PackageConfigForm 
              selectedServiceId={selectedServiceId || undefined}
              selectedPackageType={selectedPackageType || undefined}
            />
          </TabsContent>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Package-Matrix Übersicht</CardTitle>
                <CardDescription>
                  Übersicht aller Services und ihre Konfiguration pro Package-Typ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Package-Matrix Ansicht wird in einer zukünftigen Version implementiert</p>
                  <p className="text-sm">Ähnlich der Excel-Tabelle mit allen Services und Package-Typen</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}