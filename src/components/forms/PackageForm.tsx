import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Package } from "@/hooks/usePackages";
import { ColorPicker } from "@/components/ui/color-picker";
import { Plus } from "lucide-react";

interface PackageFormProps {
  package?: Package;
  onSubmit: (data: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  trigger?: React.ReactNode;
}

export function PackageForm({ package: editPackage, onSubmit, trigger }: PackageFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order_index: 1,
    color: 'Gray',
    active: true,
  });

  useEffect(() => {
    if (editPackage) {
      setFormData({
        name: editPackage.name,
        description: editPackage.description,
        order_index: editPackage.order_index,
        color: editPackage.color,
        active: editPackage.active,
      });
    }
  }, [editPackage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      setOpen(false);
      if (!editPackage) {
        setFormData({
          name: '',
          description: '',
          order_index: 1,
          color: 'Gray',
          active: true,
        });
      }
    } catch (error) {
      console.error('Error submitting package:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Neues Paket
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editPackage ? 'Paket bearbeiten' : 'Neues Paket erstellen'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Paket-Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibung des Pakets"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_index">Reihenfolge</Label>
            <Input
              id="order_index"
              type="number"
              min="1"
              value={formData.order_index}
              onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 1 }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Paket-Farbe</Label>
            <ColorPicker
              value={formData.color}
              onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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