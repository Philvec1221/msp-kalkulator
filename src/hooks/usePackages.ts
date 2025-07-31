import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Package {
  id: string;
  name: string;
  description: string;
  order_index: number;
  color: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Temporäre Pakete bis Datenbank implementiert ist
  const samplePackages: Package[] = [
    {
      id: '1',
      name: 'Basis',
      description: 'Grundlegende IT-Services für kleine Unternehmen',
      order_index: 1,
      color: 'default',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2', 
      name: 'Gold',
      description: 'Erweiterte Services für wachsende Unternehmen',
      order_index: 2,
      color: 'warning',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Allin',
      description: 'Umfassende IT-Betreuung für etablierte Unternehmen',
      order_index: 3,
      color: 'primary',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Allin Black',
      description: 'Premium-Services für höchste Ansprüche',
      order_index: 4,
      color: 'destructive',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // Für jetzt verwenden wir Sample-Daten
      setPackages(samplePackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Fehler",
        description: "Pakete konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPackage = async (packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newPackage: Package = {
        ...packageData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setPackages(prev => [...prev, newPackage]);
      toast({
        title: "Erfolg",
        description: "Paket wurde hinzugefügt.",
      });
      return newPackage;
    } catch (error) {
      console.error('Error adding package:', error);
      toast({
        title: "Fehler",
        description: "Paket konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    try {
      const updatedPackage = packages.find(pkg => pkg.id === id);
      if (!updatedPackage) throw new Error('Package not found');
      
      const newPackage = { ...updatedPackage, ...updates, updated_at: new Date().toISOString() };
      setPackages(prev => prev.map(pkg => pkg.id === id ? newPackage : pkg));
      toast({
        title: "Erfolg", 
        description: "Paket wurde aktualisiert.",
      });
      return newPackage;
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Fehler",
        description: "Paket konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePackage = async (id: string) => {
    try {
      setPackages(prev => prev.filter(pkg => pkg.id !== id));
      toast({
        title: "Erfolg",
        description: "Paket wurde gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Fehler",
        description: "Paket konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return {
    packages,
    loading,
    addPackage,
    updatePackage,
    deletePackage,
    refetch: fetchPackages
  };
}