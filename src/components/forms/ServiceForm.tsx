import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit } from "lucide-react";
import { Service } from "@/hooks/useServices";
import { useLicenses } from "@/hooks/useLicenses";
import { useServiceLicenses } from "@/hooks/useServiceLicenses";
import { usePackages } from "@/hooks/usePackages";
import { MultiSelect } from "@/components/ui/multi-select";

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
  
  const { licenses, loading: licensesLoading } = useLicenses();
  const { serviceLicenses, updateServiceLicenses, getLicensesByServiceId, loading: serviceLicensesLoading } = useServiceLicenses();
  const { packages } = usePackages();

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
      <DialogContent className="sm:max-w-[425px]">
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
                  <div className="mt-3 space-y-2">
                    <Label className="text-sm font-medium">Kostenkalkulation</Label>
                    <div className="space-y-2">
                      {selectedLicenses.map(licenseId => {
                        const license = licenses.find(l => l.id === licenseId);
                        return (
                          <div key={licenseId} className="flex items-center justify-between py-1">
                            <span className="text-sm">{license?.name}</span>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={includeCosts[licenseId] ?? true}
                                onCheckedChange={(checked) => 
                                  setIncludeCosts(prev => ({ ...prev, [licenseId]: checked }))
                                }
                              />
                              <Label className="text-xs text-muted-foreground">
                                {includeCosts[licenseId] ?? true ? 'Kosten einbeziehen' : 'Kosten ausschließen'}
                              </Label>
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