import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit } from "lucide-react";
import { Employee } from "@/hooks/useEmployees";

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  trigger?: React.ReactNode;
}

export function EmployeeForm({ employee, onSubmit, trigger }: EmployeeFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    hourly_rate: employee?.hourly_rate || 0,
    active: employee?.active ?? true,
    inactive_reason: employee?.inactive_reason || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setOpen(false);
      if (!employee) {
        setFormData({ name: '', hourly_rate: 0, active: true, inactive_reason: '' });
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
            {employee ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {employee ? 'Bearbeiten' : 'Mitarbeiter hinzufügen'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
          </DialogTitle>
          <DialogDescription>
            {employee ? 'Bearbeiten Sie die Mitarbeiterinformationen.' : 'Fügen Sie einen neuen Mitarbeiter hinzu.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Mitarbeitername"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Stundensatz (€) *</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.hourly_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
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

          {!formData.active && (
            <div className="space-y-2">
              <Label htmlFor="inactive_reason">Grund für Inaktivität</Label>
              <Textarea
                id="inactive_reason"
                value={formData.inactive_reason}
                onChange={(e) => setFormData(prev => ({ ...prev, inactive_reason: e.target.value }))}
                placeholder="Warum ist dieser Mitarbeiter inaktiv? (z.B. Krankheit, Urlaub, gekündigt...)"
                rows={3}
              />
            </div>
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