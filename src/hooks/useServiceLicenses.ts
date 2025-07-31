import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ServiceLicense {
  id: string;
  service_id: string;
  license_id: string;
  include_cost: boolean;
  created_at: string;
}

export function useServiceLicenses() {
  const [serviceLicenses, setServiceLicenses] = useState<ServiceLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServiceLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from('service_licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServiceLicenses(data || []);
    } catch (error) {
      console.error('Error fetching service licenses:', error);
      toast({
        title: "Fehler",
        description: "Service-Lizenzen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addServiceLicense = async (serviceId: string, licenseId: string, includeCost: boolean = true) => {
    try {
      const { data, error } = await supabase
        .from('service_licenses')
        .insert([{ service_id: serviceId, license_id: licenseId, include_cost: includeCost }])
        .select()
        .single();

      if (error) throw error;
      
      setServiceLicenses(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding service license:', error);
      toast({
        title: "Fehler",
        description: "Service-Lizenz konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeServiceLicense = async (serviceId: string, licenseId: string) => {
    try {
      const { error } = await supabase
        .from('service_licenses')
        .delete()
        .eq('service_id', serviceId)
        .eq('license_id', licenseId);

      if (error) throw error;
      
      setServiceLicenses(prev => 
        prev.filter(sl => !(sl.service_id === serviceId && sl.license_id === licenseId))
      );
    } catch (error) {
      console.error('Error removing service license:', error);
      toast({
        title: "Fehler",
        description: "Service-Lizenz konnte nicht entfernt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateServiceLicenses = async (serviceId: string, licenseIds: string[], includeCosts: { [licenseId: string]: boolean } = {}) => {
    try {
      // Erst alle bestehenden Lizenzen für diesen Service entfernen
      await supabase
        .from('service_licenses')
        .delete()
        .eq('service_id', serviceId);

      // Dann die neuen Lizenzen hinzufügen mit include_cost Flag
      if (licenseIds.length > 0) {
        const insertData = licenseIds.map(licenseId => ({
          service_id: serviceId,
          license_id: licenseId,
          include_cost: includeCosts[licenseId] ?? true // Default true wenn nicht angegeben
        }));

        const { error } = await supabase
          .from('service_licenses')
          .insert(insertData);

        if (error) throw error;
      }

      // Daten neu laden
      await fetchServiceLicenses();
    } catch (error) {
      console.error('Error updating service licenses:', error);
      toast({
        title: "Fehler",
        description: "Service-Lizenzen konnten nicht aktualisiert werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getLicensesByServiceId = (serviceId: string): string[] => {
    return serviceLicenses
      .filter(sl => sl.service_id === serviceId)
      .map(sl => sl.license_id);
  };

  useEffect(() => {
    fetchServiceLicenses();
  }, []);

  return {
    serviceLicenses,
    loading,
    addServiceLicense,
    removeServiceLicense,
    updateServiceLicenses,
    getLicensesByServiceId,
    refetch: fetchServiceLicenses
  };
}