import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit, Info, Search, X, ChevronDown, Check } from "lucide-react";
import { Service } from "@/hooks/useServices";
import { useLicenses } from "@/hooks/useLicenses";
import { useServiceLicenses } from "@/hooks/useServiceLicenses";
import { usePackages } from "@/hooks/usePackages";
import { usePackageConfigs } from "@/hooks/usePackageConfigs";
import { useServices } from "@/hooks/useServices";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
  
  // License Selection State
  const [licenseSearch, setLicenseSearch] = useState('');
  const [isLicenseSelectOpen, setIsLicenseSelectOpen] = useState(false);
  
  const { licenses, loading: licensesLoading } = useLicenses();
  const { serviceLicenses, updateServiceLicenses, getLicensesByServiceId, getAllServiceLicenseRelations, loading: serviceLicensesLoading } = useServiceLicenses();
  const { packages } = usePackages();
  const { packageConfigs, getConfigsByService } = usePackageConfigs();
  const { services } = useServices();

  // Gefilterte Lizenzen basierend auf Suchbegriff
  const filteredLicenses = (licenses || []).filter(license =>
    license.name.toLowerCase().includes(licenseSearch.toLowerCase()) ||
    license.category.toLowerCase().includes(licenseSearch.toLowerCase())
  );

  // Hilfsfunktion um zu prüfen, ob eine Lizenz bereits in anderen Services verwendet wird
  const getLicenseUsageInOtherServices = (licenseId: string) => {
    const allRelations = getAllServiceLicenseRelations();
    const currentServiceId = service?.id;
    
    return allRelations
      .filter(rel => rel.license_id === licenseId && rel.service_id !== currentServiceId)
      .map(rel => {
        const relatedService = services.find(s => s.id === rel.service_id);
        return {
          serviceName: relatedService?.name || 'Unbekannter Service',
          includeCost: rel.include_cost
        };
      });
  };

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

  const handleLicenseToggle = (licenseId: string) => {
    const isSelected = selectedLicenses.includes(licenseId);
    const newSelection = isSelected
      ? selectedLicenses.filter(id => id !== licenseId)
      : [...selectedLicenses, licenseId];
    
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
  };

  const handleLicenseRemove = (licenseId: string) => {
    const newSelection = selectedLicenses.filter(id => id !== licenseId);
    setSelectedLicenses(newSelection);
    
    // Entfernte Lizenz aus includeCosts entfernen
    const newCosts = { ...includeCosts };
    delete newCosts[licenseId];
    setIncludeCosts(newCosts);
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
        <TooltipProvider>
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
              <div className="space-y-2">
                <Popover open={isLicenseSelectOpen} onOpenChange={setIsLicenseSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isLicenseSelectOpen}
                      className="w-full justify-between"
                    >
                      {selectedLicenses.length === 0 
                        ? "Lizenzen auswählen..." 
                        : `${selectedLicenses.length} Lizenz${selectedLicenses.length === 1 ? '' : 'en'} ausgewählt`
                      }
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Lizenzen suchen..."
                          value={licenseSearch}
                          onChange={(e) => setLicenseSearch(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-60">
                      <div className="p-2 space-y-1">
                        {filteredLicenses.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            Keine Lizenzen gefunden
                          </div>
                        ) : (
                          filteredLicenses.map((license) => {
                            const isSelected = selectedLicenses.includes(license.id);
                            return (
                              <div
                                key={license.id}
                                className={cn(
                                  "flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                  isSelected && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => handleLicenseToggle(license.id)}
                              >
                                <div className="flex items-center space-x-2 flex-1">
                                  <Check
                                    className={cn(
                                      "h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium">{license.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {license.category} • {license.cost_per_month}€/Monat
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                
                {/* Ausgewählte Lizenzen als Badges anzeigen */}
                {selectedLicenses.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-md">
                    {selectedLicenses.map(licenseId => {
                      const license = licenses.find(l => l.id === licenseId);
                      if (!license) return null;
                      return (
                        <Badge
                          key={licenseId}
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          {license.name}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleLicenseRemove(licenseId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
                
                {selectedLicenses.length > 0 && (
                  <div className="mt-3 space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Kostenkalkulation der Lizenzen</Label>
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
                    </div>
                    
                    {/* Warnungen für bereits verwendete Lizenzen */}
                    {selectedLicenses.some(licenseId => getLicenseUsageInOtherServices(licenseId).length > 0) && (
                      <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Achtung:</strong> Einige Lizenzen werden bereits in anderen Services verwendet. 
                          Prüfen Sie die Kostenzuordnung, um Doppelzählungen zu vermeiden.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-3">
                      {selectedLicenses.map(licenseId => {
                        const license = licenses.find(l => l.id === licenseId);
                        const isIncluded = includeCosts[licenseId] ?? true;
                        const otherUsages = getLicenseUsageInOtherServices(licenseId);
                        const hasConflict = otherUsages.length > 0;
                        
                        return (
                          <div key={licenseId} className="space-y-2">
                            <div className={`flex items-center justify-between p-3 rounded-md border ${
                              hasConflict 
                                ? 'border-amber-200 bg-amber-50' 
                                : isIncluded 
                                  ? 'bg-background border-primary/20' 
                                  : 'bg-muted border-muted-foreground/20'
                            }`}>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{license?.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {isIncluded ? '✓ Kostenwirksam in diesem Service' : '○ Nur Zuordnung, Kosten werden woanders kalkuliert'}
                                </div>
                                {hasConflict && (
                                  <div className="text-xs text-amber-700 mt-1">
                                    ⚠️ Bereits verwendet in: {otherUsages.map(usage => 
                                      `${usage.serviceName} ${usage.includeCost ? '(kostenwirksam)' : '(nicht kostenwirksam)'}`
                                    ).join(', ')}
                                  </div>
                                )}
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
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
                              window.open(`/package-config`, '_blank');
                            }}
                          >
                            Matrix öffnen
                          </Button>
                        </div>
                      );
                    })}
                    <div className="text-xs text-muted-foreground mt-2">
                      💡 Tipp: Nutzen Sie die Package-Matrix für eine bessere Übersicht aller Konfigurationen.
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
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}