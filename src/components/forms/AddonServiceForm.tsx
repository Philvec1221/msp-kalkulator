import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from 'sonner';
import { useLicenses } from '@/hooks/useLicenses';
import { AddonServiceWithLicenses } from '@/hooks/useAddonServices';

interface AddonServiceFormProps {
  addonService?: AddonServiceWithLicenses;
  onSubmit: (
    data: { name: string; description?: string; active: boolean },
    licenseIds: Array<{ license_id: string; include_cost: boolean }>
  ) => Promise<any>;
  trigger: React.ReactNode;
}

export default function AddonServiceForm({ addonService, onSubmit, trigger }: AddonServiceFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [includeCosts, setIncludeCosts] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { licenses } = useLicenses();

  // Pre-populate form when editing
  useEffect(() => {
    if (addonService && open) {
      setFormData({
        name: addonService.name,
        description: addonService.description || '',
        active: addonService.active
      });
      
      const licenseIds = addonService.licenses.map(l => l.license_id);
      setSelectedLicenses(licenseIds);
      
      const costSettings: Record<string, boolean> = {};
      addonService.licenses.forEach(l => {
        costSettings[l.license_id] = l.include_cost;
      });
      setIncludeCosts(costSettings);
    } else if (!addonService) {
      // Reset form for new addon service
      setFormData({ name: '', description: '', active: true });
      setSelectedLicenses([]);
      setIncludeCosts({});
    }
  }, [addonService, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

    if (selectedLicenses.length === 0) {
      toast.error('Bitte wählen Sie mindestens eine Lizenz aus');
      return;
    }

    setIsSubmitting(true);
    try {
      const licenseData = selectedLicenses.map(licenseId => ({
        license_id: licenseId,
        include_cost: includeCosts[licenseId] ?? true
      }));

      await onSubmit(formData, licenseData);
      setOpen(false);
      
      // Reset form
      setFormData({ name: '', description: '', active: true });
      setSelectedLicenses([]);
      setIncludeCosts({});
    } catch (error) {
      console.error('Error submitting addon service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLicenseChange = (newSelectedLicenses: string[]) => {
    setSelectedLicenses(newSelectedLicenses);
    
    // Initialize include_cost to true for newly selected licenses
    const newIncludeCosts = { ...includeCosts };
    newSelectedLicenses.forEach(licenseId => {
      if (!(licenseId in newIncludeCosts)) {
        newIncludeCosts[licenseId] = true;
      }
    });
    
    // Remove settings for deselected licenses
    Object.keys(newIncludeCosts).forEach(licenseId => {
      if (!newSelectedLicenses.includes(licenseId)) {
        delete newIncludeCosts[licenseId];
      }
    });
    
    setIncludeCosts(newIncludeCosts);
  };

  const licenseOptions = licenses.map(license => ({
    value: license.id,
    label: license.name
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {addonService ? 'Add-On Service bearbeiten' : 'Neuer Add-On Service'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. vectano Mailsicherheitspaket"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreibung des Add-On Services..."
                rows={3}
              />
            </div>

            <div>
              <Label>Lizenzen *</Label>
              <MultiSelect
                options={licenseOptions}
                selected={selectedLicenses}
                onChange={handleLicenseChange}
                placeholder="Lizenzen auswählen..."
                className="mt-1"
              />
            </div>

            {selectedLicenses.length > 0 && (
              <div className="space-y-3">
                <Label>Kostenzuordnung</Label>
                {selectedLicenses.map(licenseId => {
                  const license = licenses.find(l => l.id === licenseId);
                  return (
                    <div key={licenseId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{license?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Kosten: {license?.cost_per_month}€/Monat | Preis: {license?.price_per_month}€/Monat
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`include-cost-${licenseId}`} className="text-sm">
                          Kosten einbeziehen
                        </Label>
                        <Switch
                          id={`include-cost-${licenseId}`}
                          checked={includeCosts[licenseId] ?? true}
                          onCheckedChange={(checked) => 
                            setIncludeCosts(prev => ({ ...prev, [licenseId]: checked }))
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active">Aktiv</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Speichere...' : addonService ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}