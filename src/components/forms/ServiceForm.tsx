import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit } from "lucide-react";
import { Service } from "@/hooks/useServices";

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
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
    package_level: service?.package_level || 'basis',
    active: service?.active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setOpen(false);
      if (!service) {
        setFormData({ name: '', description: '', product_name: '', time_in_minutes: 0, billing_type: 'fix', package_level: 'basis', active: true });
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
            <Label htmlFor="product_name">Produkt</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
              placeholder="z.B. Monitoring Suite"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing_type">Lizenzierung</Label>
              <Select value={formData.billing_type} onValueChange={(value) => setFormData(prev => ({ ...prev, billing_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fix">Fix</SelectItem>
                  <SelectItem value="pro_user">pro User</SelectItem>
                  <SelectItem value="pro_server">pro Server</SelectItem>
                  <SelectItem value="pro_client">pro Client</SelectItem>
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
                  <SelectItem value="basis">ab Basis</SelectItem>
                  <SelectItem value="gold">ab Gold</SelectItem>
                  <SelectItem value="allin">ab Allin</SelectItem>
                  <SelectItem value="allin_black">ab Allin Black</SelectItem>
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