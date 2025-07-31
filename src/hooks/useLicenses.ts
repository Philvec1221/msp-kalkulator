import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface License {
  id: string;
  name: string;
  category: string;
  cost_per_month: number;
  price_per_month: number;
  billing_unit: string;
  cost_allocation_service_id?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useLicenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLicenses(data || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast({
        title: "Fehler",
        description: "Lizenzen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addLicense = async (license: Omit<License, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .insert([license])
        .select()
        .single();

      if (error) throw error;
      
      setLicenses(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Lizenz wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding license:', error);
      toast({
        title: "Fehler",
        description: "Lizenz konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateLicense = async (id: string, updates: Partial<License>) => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setLicenses(prev => prev.map(lic => lic.id === id ? data : lic));
      toast({
        title: "Erfolg",
        description: "Lizenz wurde aktualisiert.",
      });
      return data;
    } catch (error) {
      console.error('Error updating license:', error);
      toast({
        title: "Fehler",
        description: "Lizenz konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteLicense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('licenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setLicenses(prev => prev.filter(lic => lic.id !== id));
      toast({
        title: "Erfolg",
        description: "Lizenz wurde gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting license:', error);
      toast({
        title: "Fehler",
        description: "Lizenz konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  return {
    licenses,
    loading,
    addLicense,
    updateLicense,
    deleteLicense,
    refetch: fetchLicenses
  };
}