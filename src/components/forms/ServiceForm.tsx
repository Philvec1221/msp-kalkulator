import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Edit, Info } from "lucide-react";
import { Service } from "@/hooks/useServices";
import { useLicenses } from "@/hooks/useLicenses";
import { useServiceLicenses } from "@/hooks/useServiceLicenses";
import { usePackages } from "@/hooks/usePackages";
import { usePackageConfigs } from "@/hooks/usePackageConfigs";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'sort_order'>) => Promise<any>;
  trigger?: React.ReactNode;
}

export function ServiceForm({ service, onSubmit, trigger }: ServiceFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    product_name: service?.product_name || '',
    time_in_minutes: service?.time_in_minutes || 0,
    billing_type: service?.billing_type || 'fix',
    package_level: service?.package_level || 'Basis',
    active: service?.active ?? true,
  });
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [includeCosts, setIncludeCosts] = useState<{ [licenseId: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [showPackageConfigs, setShowPackageConfigs] = useState(false);
  
  const { licenses, loading: licensesLoading } = useLicenses();
  const { serviceLicenses, updateServiceLicenses, getLicensesByServiceId, loading: serviceLicensesLoading } = useServiceLicenses();
  const { packages } = usePackages();
  const { packageConfigs, getConfigsByService } = usePackageConfigs();

  // Bereite Lizenzoptionen für MultiSelect vor
  const licenseOptions = (licenses || []).map(license => ({
    value: license.id,
    label: license.name
  }));

  // Lade bestehende Lizenzen wenn Service bearbeitet wird
  useEffect(() => {
    if (service && service.id && !serviceLicensesLoading) {
      const existingLicenses = getLicensesByServiceId(service.id);
      setSelectedLicenses(existingLicenses || []);
      
      // Lade include_cost Flags für bestehende Lizenzen
      const costs: { [licenseId: string]: boolean } = {};
      serviceLicenses
        .filter(sl => sl.service_id === service.id)
        .forEach(sl => {
          costs[sl.license_id] = sl.include_cost;
        });
      setIncludeCosts(costs);
    }
  }, [service?.id, serviceLicensesLoading, serviceLicenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await onSubmit(formData);
      
      // Nach erfolgreichem Speichern die Lizenzen verknüpfen
      if (result && result.id) {
        await updateServiceLicenses(result.id, selectedLicenses, includeCosts);
      } else if (service && service.id) {
        await updateServiceLicenses(service.id, selectedLicenses, includeCosts);
      }
      
      setOpen(false);
      if (!service) {
        setFormData({ name: '', description: '', product_name: '', time_in_minutes: 0, billing_type: 'fix', package_level: 'Basis', active: true });
        setSelectedLicenses([]);
        setIncludeCosts({});
      }
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  const formatTimeDisplay = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')} Std`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            {service ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {service ? 'Bearbeiten' : 'Service hinzufügen'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {service ? 'Service bearbeiten' : 'Neuer Service'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="z.B. Server Monitoring"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibung des Services..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenses">Lizenzen</Label>
            {licensesLoading || !licenses ? (
              <div className="h-10 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                Lade Lizenzen...
              </div>
            ) : licenses.length === 0 ? (
              <div className="h-10 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                Keine Lizenzen verfügbar
              </div>
            ) : (
              <>
                <MultiSelect
                  options={licenseOptions}
                  selected={selectedLicenses}
                  onChange={(newSelection) => {
                    setSelectedLicenses(newSelection);
                    // Für neue Lizenzen include_cost auf true setzen
                    const newCosts = { ...includeCosts };
                    newSelection.forEach(licenseId => {
                      if (!(licenseId in newCosts)) {
                        newCosts[licenseId] = true;
                      }
                    });
                    // Entfernte Lizenzen aus includeCosts entfernen
                    Object.keys(newCosts).forEach(licenseId => {
                      if (!newSelection.includes(licenseId)) {
                        delete newCosts[licenseId];
                      }
                    });
                    setIncludeCosts(newCosts);
                  }}
                  placeholder="Lizenzen auswählen..."
                />
                
                {selectedLicenses.length > 0 && (
                  <div className="mt-3 space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Kostenkalkulation der Lizenzen</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Deaktivieren Sie "Kosten einbeziehen", wenn diese Lizenz bereits in einem anderen Service kalkuliert wird, 
                              um Doppelzählungen zu vermeiden.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="space-y-3">
                      {selectedLicenses.map(licenseId => {
                        const license = licenses.find(l => l.id === licenseId);
                        const isIncluded = includeCosts[licenseId] ?? true;
                        return (
                          <div key={licenseId} className={`flex items-center justify-between p-3 rounded-md border ${isIncluded ? 'bg-background border-primary/20' : 'bg-muted border-muted-foreground/20'}`}>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{license?.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {isIncluded ? '✓ Kostenwirksam in diesem Service' : '○ Nur Zuordnung, Kosten werden woanders kalkuliert'}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className="text-xs font-medium">
                                  {isIncluded ? 'Einbeziehen' : 'Ausschließen'}
                                </div>
                              </div>
                              <Switch
                                checked={isIncluded}
                                onCheckedChange={(checked) => 
                                  setIncludeCosts(prev => ({ ...prev, [licenseId]: checked }))
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing_type">Lizenzierung</Label>
              <Select value={formData.billing_type} onValueChange={(value) => setFormData(prev => ({ ...prev, billing_type: value as 'fix' | 'pro_client' | 'pro_server' | 'pro_user' | 'pro_device' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fix">Fix</SelectItem>
                  <SelectItem value="pro_user">pro User</SelectItem>
                  <SelectItem value="pro_server">pro Server</SelectItem>
                  <SelectItem value="pro_client">pro Client</SelectItem>
                  <SelectItem value="pro_device">pro Device</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="package_level">Ab Paket</Label>
              <Select value={formData.package_level} onValueChange={(value) => setFormData(prev => ({ ...prev, package_level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie..." />
                </SelectTrigger>
                <SelectContent>
                  {packages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.name}>
                      ab {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time_in_minutes">
              Technikzeit in Minuten * 
              {formData.time_in_minutes > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({formatTimeDisplay(formData.time_in_minutes)})
                </span>
              )}
            </Label>
            <Input
              id="time_in_minutes"
              type="number"
              min="0"
              value={formData.time_in_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, time_in_minutes: parseInt(e.target.value) || 0 }))}
              placeholder="120"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">Aktiv</Label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
          </div>

          {!service && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mx-auto mb-2" />
                  <p>Nach dem Erstellen können Sie Package-Konfigurationen hinzufügen,</p>
                  <p>um festzulegen, wie der Service in verschiedenen Paketen verfügbar ist.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {service && service.id && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Package-Konfigurationen</CardTitle>
                    <CardDescription>
                      Konfigurieren Sie, wie dieser Service in verschiedenen Paketen verfügbar ist
                    </CardDescription>
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPackageConfigs(!showPackageConfigs)}
                  >
                    {showPackageConfigs ? 'Ausblenden' : 'Anzeigen'}
                  </Button>
                </div>
              </CardHeader>
              {showPackageConfigs && (
                <CardContent>
                  <div className="space-y-3">
                    {packages.map(pkg => {
                      const config = getConfigsByService(service.id).find(c => c.package_type === pkg.name);
                      return (
                        <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">{pkg.name}</div>
                              {config ? (
                                <div className="flex gap-2 mt-1">
                                  <Badge variant={
                                    config.inclusion_type === 'inclusive' ? 'default' :
                                    config.inclusion_type === 'effort_based' ? 'secondary' :
                                    config.inclusion_type === 'not_available' ? 'destructive' : 'outline'
                                  } className="text-xs">
                                    {config.inclusion_type === 'inclusive' ? 'Inklusive' :
                                     config.inclusion_type === 'effort_based' ? 'Nach Aufwand' :
                                     config.inclusion_type === 'not_available' ? 'Nicht verfügbar' : 'Benutzerdefiniert'}
                                  </Badge>
                                  {config.sla_response_time && (
                                    <Badge variant="outline" className="text-xs">
                                      SLA: {config.sla_response_time}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">Noch nicht konfiguriert</div>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open(`/package-config?service=${service.id}&package=${pkg.name}`, '_blank');
                            }}
                          >
                            {config ? 'Bearbeiten' : 'Konfigurieren'}
                          </Button>
                        </div>
                      );
                    })}
                    <div className="text-xs text-muted-foreground mt-2">
                      💡 Tipp: Konfigurieren Sie für jedes Paket, ob der Service inklusive ist, nach Aufwand abgerechnet wird, oder nicht verfügbar ist.
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}