import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Package, Settings, Edit } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { usePackages } from "@/hooks/usePackages";
import { usePackageConfigs, PackageConfig } from "@/hooks/usePackageConfigs";
import { useState } from "react";
import { getInclusionLabel, getInclusionVariant, getInclusionIcon } from "@/lib/packageUtils";
import { toast } from "sonner";

export default function PackageConfigPage() {
  const { services, loading: servicesLoading } = useServices();
  const { packages, loading: packagesLoading } = usePackages();
  const { packageConfigs, upsertPackageConfig, loading: configsLoading } = usePackageConfigs();
  
  const [editingConfig, setEditingConfig] = useState<{ serviceId: string; packageType: string; config?: PackageConfig } | null>(null);
  const [configForm, setConfigForm] = useState<{
    inclusion_type: 'inclusive' | 'effort_based' | 'not_available' | 'custom';
    multiplier: number;
    sla_response_time: string;
    sla_availability: string;
    hourly_rate_surcharge?: number;
    custom_description: string;
    notes: string;
  }>({
    inclusion_type: 'effort_based',
    multiplier: 1.0,
    sla_response_time: '',
    sla_availability: '',
    hourly_rate_surcharge: undefined,
    custom_description: '',
    notes: ''
  });

  const getConfigByServiceAndPackage = (serviceId: string, packageType: string) => {
    return packageConfigs.find(
      config => config.service_id === serviceId && config.package_type === packageType
    );
  };

  const handleCellClick = (serviceId: string, packageType: string) => {
    const existingConfig = getConfigByServiceAndPackage(serviceId, packageType);
    setEditingConfig({ serviceId, packageType, config: existingConfig });
    
    if (existingConfig) {
      setConfigForm({
        inclusion_type: existingConfig.inclusion_type,
        multiplier: existingConfig.multiplier,
        sla_response_time: existingConfig.sla_response_time || '',
        sla_availability: existingConfig.sla_availability || '',
        hourly_rate_surcharge: existingConfig.hourly_rate_surcharge,
        custom_description: existingConfig.custom_description || '',
        notes: existingConfig.notes || ''
      });
    } else {
      setConfigForm({
        inclusion_type: 'effort_based',
        multiplier: 1.0,
        sla_response_time: '',
        sla_availability: '',
        hourly_rate_surcharge: undefined,
        custom_description: '',
        notes: ''
      });
    }
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;
    
    try {
      await upsertPackageConfig({
        service_id: editingConfig.serviceId,
        package_type: editingConfig.packageType,
        ...configForm
      });
      
      toast.success("Konfiguration gespeichert");
      setEditingConfig(null);
    } catch (error) {
      // Error handling in hook
    }
  };

  if (servicesLoading || packagesLoading || configsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lade Package-Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">Package-Matrix</h1>
            <p className="text-muted-foreground">
              Übersicht und Konfiguration aller Services pro Package-Typ
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service × Package Matrix</CardTitle>
            <CardDescription>
              Klicken Sie auf eine Zelle, um die Konfiguration zu bearbeiten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Service</TableHead>
                    {packages.map(pkg => (
                      <TableHead key={pkg.id} className="text-center font-semibold">
                        {pkg.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.filter(s => s.active).map(service => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{service.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ab {service.package_level}
                          </div>
                        </div>
                      </TableCell>
                      {packages.map(pkg => {
                        const config = getConfigByServiceAndPackage(service.id, pkg.name);
                        const isAvailableInPackage = service.package_level === pkg.name || 
                          packages.findIndex(p => p.name === service.package_level) <= 
                          packages.findIndex(p => p.name === pkg.name);
                        
                        return (
                          <TableCell key={pkg.id} className="text-center">
                            <Button
                              variant="ghost"
                              className="h-auto p-2 w-full"
                              onClick={() => handleCellClick(service.id, pkg.name)}
                              disabled={!isAvailableInPackage}
                            >
                              {!isAvailableInPackage ? (
                                <Badge variant="outline" className="text-xs">
                                  Nicht verfügbar
                                </Badge>
                              ) : config ? (
                                <div className="space-y-1">
                                  <Badge 
                                    variant={getInclusionVariant(config.inclusion_type)} 
                                    className="text-xs"
                                  >
                                    {getInclusionIcon(config.inclusion_type)} {getInclusionLabel(config.inclusion_type)}
                                  </Badge>
                                  {config.sla_response_time && (
                                    <div className="text-xs text-muted-foreground">
                                      SLA: {config.sla_response_time}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-xs">
                                  <Edit className="h-3 w-3 mx-auto mb-1" />
                                  Konfigurieren
                                </div>
                              )}
                            </Button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Konfiguration bearbeiten
              </DialogTitle>
              {editingConfig && (
                <p className="text-sm text-muted-foreground">
                  {services.find(s => s.id === editingConfig.serviceId)?.name} → {editingConfig.packageType}
                </p>
              )}
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Inklusionstyp</Label>
                <Select 
                  value={configForm.inclusion_type}
                  onValueChange={(value: 'inclusive' | 'effort_based' | 'not_available' | 'custom') => 
                    setConfigForm(prev => ({ ...prev, inclusion_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inclusive">Inklusive</SelectItem>
                    <SelectItem value="effort_based">Nach Aufwand</SelectItem>
                    <SelectItem value="not_available">Nicht verfügbar</SelectItem>
                    <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SLA Reaktionszeit</Label>
                  <Input
                    value={configForm.sla_response_time}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, sla_response_time: e.target.value }))}
                    placeholder="z.B. 4 Stunden"
                  />
                </div>
                <div>
                  <Label>SLA Verfügbarkeit</Label>
                  <Input
                    value={configForm.sla_availability}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, sla_availability: e.target.value }))}
                    placeholder="z.B. Mo-Fr 8-17"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Multiplikator</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={configForm.multiplier}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, multiplier: parseFloat(e.target.value) || 1.0 }))}
                  />
                </div>
                <div>
                  <Label>Zuschlag (%)</Label>
                  <Input
                    type="number"
                    value={configForm.hourly_rate_surcharge || ''}
                    onChange={(e) => setConfigForm(prev => ({ 
                      ...prev, 
                      hourly_rate_surcharge: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    placeholder="50"
                  />
                </div>
              </div>

              {configForm.inclusion_type === 'custom' && (
                <div>
                  <Label>Benutzerdefinierte Beschreibung</Label>
                  <Input
                    value={configForm.custom_description}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, custom_description: e.target.value }))}
                    placeholder="Beschreibung für Custom-Option"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveConfig} className="flex-1">
                  Speichern
                </Button>
                <Button variant="outline" onClick={() => setEditingConfig(null)}>
                  Abbrechen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}