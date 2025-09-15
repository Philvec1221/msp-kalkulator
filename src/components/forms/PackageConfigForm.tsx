import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useServices } from "@/hooks/useServices";
import { usePackageConfigs, PackageConfig } from "@/hooks/usePackageConfigs";
import { usePackages } from "@/hooks/usePackages";
import { Trash2, Plus, Save } from "lucide-react";

const INCLUSION_TYPES = [
  { value: 'inclusive', label: 'Inklusive' },
  { value: 'effort_based', label: 'Nach Aufwand' },
  { value: 'not_available', label: 'Nicht verfügbar' },
  { value: 'custom', label: 'Benutzerdefiniert' }
] as const;

interface PackageConfigFormProps {
  selectedServiceId?: string;
  selectedPackageType?: string;
}

export function PackageConfigForm({ selectedServiceId, selectedPackageType }: PackageConfigFormProps) {
  const { services } = useServices();
  const { packages } = usePackages();
  const { packageConfigs, upsertPackageConfig, deletePackageConfig, loading } = usePackageConfigs();
  
  const [editingConfig, setEditingConfig] = useState<Partial<PackageConfig> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const packageTypes = packages.map(pkg => pkg.name);

  const handleCreateNew = () => {
    setEditingConfig({
      service_id: selectedServiceId || '',
      package_type: selectedPackageType || '',
      multiplier: 1.0,
      inclusion_type: 'effort_based'
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editingConfig?.service_id || !editingConfig?.package_type) {
      toast.error("Service und Package-Typ sind erforderlich");
      return;
    }

    try {
      await upsertPackageConfig({
        service_id: editingConfig.service_id,
        package_type: editingConfig.package_type,
        multiplier: editingConfig.multiplier || 1.0,
        inclusion_type: editingConfig.inclusion_type || 'effort_based',
        sla_response_time: editingConfig.sla_response_time,
        sla_availability: editingConfig.sla_availability,
        hourly_rate_surcharge: editingConfig.hourly_rate_surcharge,
        custom_description: editingConfig.custom_description,
        notes: editingConfig.notes
      });

      toast.success("Package-Konfiguration gespeichert");
      setEditingConfig(null);
      setIsCreating(false);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Sind Sie sicher, dass Sie diese Konfiguration löschen möchten?")) {
      try {
        await deletePackageConfig(id);
        toast.success("Package-Konfiguration gelöscht");
      } catch (error) {
        // Error already handled in hook
      }
    }
  };

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Unbekannter Service';
  };

  const filteredConfigs = packageConfigs.filter(config => {
    if (selectedServiceId && config.service_id !== selectedServiceId) return false;
    if (selectedPackageType && config.package_type !== selectedPackageType) return false;
    return true;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Package-Konfigurationen</h3>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Konfiguration
        </Button>
      </div>

      {(editingConfig || isCreating) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Neue Package-Konfiguration' : 'Konfiguration bearbeiten'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service">Service</Label>
                <Select 
                  value={editingConfig?.service_id} 
                  onValueChange={(value) => setEditingConfig({...editingConfig, service_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Service auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="package_type">Package-Typ</Label>
                <Select 
                  value={editingConfig?.package_type} 
                  onValueChange={(value) => setEditingConfig({...editingConfig, package_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Package-Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {packageTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inclusion_type">Inklusionstyp</Label>
                <Select 
                  value={editingConfig?.inclusion_type} 
                  onValueChange={(value) => setEditingConfig({...editingConfig, inclusion_type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inklusionstyp auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCLUSION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="multiplier">Multiplikator</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editingConfig?.multiplier || ''}
                  onChange={(e) => setEditingConfig({...editingConfig, multiplier: parseFloat(e.target.value) || 1.0})}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sla_response_time">SLA Reaktionszeit</Label>
                <Input
                  value={editingConfig?.sla_response_time || ''}
                  onChange={(e) => setEditingConfig({...editingConfig, sla_response_time: e.target.value})}
                  placeholder="z.B. 4 Stunden, 1 Stunde"
                />
              </div>

              <div>
                <Label htmlFor="sla_availability">SLA Verfügbarkeit</Label>
                <Input
                  value={editingConfig?.sla_availability || ''}
                  onChange={(e) => setEditingConfig({...editingConfig, sla_availability: e.target.value})}
                  placeholder="z.B. Mo-Fr 8-17, 24/7"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hourly_rate_surcharge">Stundensatz-Zuschlag (%)</Label>
              <Input
                type="number"
                value={editingConfig?.hourly_rate_surcharge || ''}
                onChange={(e) => setEditingConfig({...editingConfig, hourly_rate_surcharge: parseFloat(e.target.value) || undefined})}
                placeholder="z.B. 50, 100"
              />
            </div>

            <div>
              <Label htmlFor="custom_description">Benutzerdefinierte Beschreibung</Label>
              <Input
                value={editingConfig?.custom_description || ''}
                onChange={(e) => setEditingConfig({...editingConfig, custom_description: e.target.value})}
                placeholder="z.B. Jährliches Meeting"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                value={editingConfig?.notes || ''}
                onChange={(e) => setEditingConfig({...editingConfig, notes: e.target.value})}
                placeholder="Zusätzliche Anmerkungen"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
              <Button variant="outline" onClick={() => {setEditingConfig(null); setIsCreating(false);}}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {filteredConfigs.map((config) => (
          <Card key={config.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{getServiceName(config.service_id)}</span>
                    <Badge variant="outline">{config.package_type}</Badge>
                    <Badge variant={
                      config.inclusion_type === 'inclusive' ? 'default' :
                      config.inclusion_type === 'effort_based' ? 'secondary' :
                      config.inclusion_type === 'not_available' ? 'destructive' : 'outline'
                    }>
                      {INCLUSION_TYPES.find(t => t.value === config.inclusion_type)?.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    {config.sla_response_time && (
                      <div>Reaktionszeit: {config.sla_response_time}</div>
                    )}
                    {config.sla_availability && (
                      <div>Verfügbarkeit: {config.sla_availability}</div>
                    )}
                    {config.hourly_rate_surcharge && (
                      <div>Zuschlag: +{config.hourly_rate_surcharge}%</div>
                    )}
                    {config.custom_description && (
                      <div>Beschreibung: {config.custom_description}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {setEditingConfig(config); setIsCreating(false);}}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConfigs.length === 0 && !isCreating && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Keine Package-Konfigurationen gefunden. Erstellen Sie eine neue Konfiguration.
          </CardContent>
        </Card>
      )}
    </div>
  );
}