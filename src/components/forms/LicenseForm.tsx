import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit } from "lucide-react";
import { License } from "@/hooks/useLicenses";

interface LicenseFormProps {
  license?: License;
  onSubmit: (data: Omit<License, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  trigger?: React.ReactNode;
}

export function LicenseForm({ license, onSubmit, trigger }: LicenseFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: license?.name || '',
    category: license?.category || '',
    cost_per_month: license?.cost_per_month || 0,
    price_per_month: license?.price_per_month || 0,
    active: license?.active ?? true,
    billing_unit: 'fix', // Default billing unit
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setOpen(false);
      if (!license) {
        setFormData({ name: '', category: '', cost_per_month: 0, price_per_month: 0, active: true, billing_unit: 'fix' });
      }
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            {license ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {license ? 'Bearbeiten' : 'Lizenz hinzufügen'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {license ? 'Lizenz bearbeiten' : 'Neue Lizenz'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Produkt *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="z.B. Microsoft 365 Business"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Hersteller/Kategorie *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="z.B. Microsoft"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_per_month">Einkaufspreis (€) *</Label>
              <Input
                id="cost_per_month"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_per_month}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_per_month: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_per_month">Verkaufspreis (€) *</Label>
              <Input
                id="price_per_month"
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_month}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_month: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>
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