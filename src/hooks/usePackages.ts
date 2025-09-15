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

// Package hierarchy helper functions
export const getPackageHierarchy = (minPackageLevel: string): string[] => {
  const hierarchy = ['Basis', 'Gold', 'Allin', 'Allin Black'];
  const minIndex = hierarchy.indexOf(minPackageLevel);
  return minIndex >= 0 ? hierarchy.slice(minIndex) : hierarchy;
};

export const getAvailablePackagesForService = (packageLevel: string): string[] => {
  return getPackageHierarchy(packageLevel);
};

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
      color: 'Teal',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2', 
      name: 'Gold',
      description: 'Erweiterte Services für wachsende Unternehmen',
      order_index: 2,
      color: 'Amber',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Allin',
      description: 'Umfassende IT-Betreuung für etablierte Unternehmen',
      order_index: 3,
      color: 'Purple',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Allin Black',
      description: 'Premium-Services für höchste Ansprüche',
      order_index: 4,
      color: 'Black',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('active', true)
        .order('order_index');
      
      if (error) throw error;
      
      // Use database data if available, otherwise fall back to sample data
      if (data && data.length > 0) {
        setPackages(data);
      } else {
        // Initialize with sample packages if database is empty
        setPackages(samplePackages);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      // Fall back to sample packages on error
      setPackages(samplePackages);
      toast({
        title: "Fehler",
        description: "Pakete konnten nicht geladen werden. Verwende Standardpakete.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPackage = async (packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([packageData])
        .select()
        .single();
      
      if (error) throw error;
      
      setPackages(prev => [...prev, data]);
      toast({
        title: "Erfolg",
        description: "Paket wurde hinzugefügt.",
      });
      return data;
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
      const { data, error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setPackages(prev => prev.map(pkg => pkg.id === id ? data : pkg));
      toast({
        title: "Erfolg", 
        description: "Paket wurde aktualisiert.",
      });
      return data;
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
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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

  // Helper function to get package by name
  const getPackageByName = (name: string) => {
    return packages.find(pkg => 
      pkg.name.toLowerCase() === name.toLowerCase() ||
      pkg.name.toLowerCase().replace(' ', '_') === name.toLowerCase() ||
      pkg.name.toLowerCase().replace(' ', '') === name.toLowerCase()
    );
  };

  return {
    packages,
    loading,
    addPackage,
    updatePackage,
    deletePackage,
    refetch: fetchPackages,
    getPackageByName
  };
}