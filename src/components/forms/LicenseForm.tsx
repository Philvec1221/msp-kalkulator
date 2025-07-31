import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    billing_unit: license?.billing_unit || 'Fix',
    active: license?.active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setOpen(false);
      if (!license) {
        setFormData({ name: '', category: '', cost_per_month: 0, price_per_month: 0, billing_unit: 'Fix', active: true });
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
           {/* Hersteller */}
           <div className="space-y-2">
             <Label htmlFor="category">Hersteller</Label>
             <Input
               id="category"
               value={formData.category}
               onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
               placeholder="z.B. Microsoft, ESET, Veeam"
               required
             />
           </div>
           
           {/* Produkt */}
           <div className="space-y-2">
             <Label htmlFor="name">Produkt</Label>
             <Input
               id="name"
               value={formData.name}
               onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
               placeholder="z.B. Windows Defender ATP"
               required
             />
           </div>

           {/* Einkaufspreis */}
           <div className="space-y-2">
             <Label htmlFor="cost_per_month">Einkaufspreis (€)</Label>
             <Input
               id="cost_per_month"
               type="number"
               step="0.01"
               min="0"
               value={formData.cost_per_month || ''}
               onChange={(e) => setFormData(prev => ({ ...prev, cost_per_month: parseFloat(e.target.value) || 0 }))}
               placeholder="0"
               required
             />
           </div>

           {/* Abrechnungseinheit */}
           <div className="space-y-2">
             <Label htmlFor="billing_unit">Abrechnungseinheit</Label>
             <Select 
               value={formData.billing_unit} 
               onValueChange={(value) => setFormData(prev => ({ ...prev, billing_unit: value }))}
             >
               <SelectTrigger>
                 <SelectValue placeholder="Wählen Sie..." />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="Fix">Fix</SelectItem>
                 <SelectItem value="pro User">pro User</SelectItem>
                 <SelectItem value="pro Client">pro Client</SelectItem>
                 <SelectItem value="pro Server">pro Server</SelectItem>
               </SelectContent>
             </Select>
           </div>

           {/* Buttons */}
           <div className="flex justify-end gap-2 pt-4">
             <Button type="button" variant="outline" onClick={() => setOpen(false)}>
               Abbrechen
             </Button>
             <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
               {loading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
             </Button>
           </div>
         </form>
      </DialogContent>
    </Dialog>
  );
}