import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AddonService {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddonServiceLicense {
  id: string;
  addon_service_id: string;
  license_id: string;
  include_cost: boolean;
  created_at: string;
}

export interface AddonServiceWithLicenses extends AddonService {
  licenses: Array<{
    license_id: string;
    license_name: string;
    include_cost: boolean;
  }>;
}

export function useAddonServices() {
  const [addonServices, setAddonServices] = useState<AddonServiceWithLicenses[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddonServices = async () => {
    try {
      setLoading(true);
      
      // Fetch addon services with their licenses
      const { data: services, error: servicesError } = await supabase
        .from('addon_services')
        .select(`
          *,
          addon_service_licenses!inner (
            license_id,
            include_cost,
            licenses (
              name
            )
          )
        `)
        .eq('active', true)
        .order('name');

      if (servicesError) throw servicesError;

      // Transform data to include license information
      const transformedServices: AddonServiceWithLicenses[] = services?.map(service => ({
        ...service,
        licenses: service.addon_service_licenses?.map(asl => ({
          license_id: asl.license_id,
          license_name: asl.licenses?.name || 'Unknown License',
          include_cost: asl.include_cost
        })) || []
      })) || [];

      setAddonServices(transformedServices);
    } catch (error) {
      console.error('Error fetching addon services:', error);
      toast.error('Fehler beim Laden der Add-On Services');
    } finally {
      setLoading(false);
    }
  };

  const addAddonService = async (
    addonServiceData: Omit<AddonService, 'id' | 'created_at' | 'updated_at'>,
    licenseIds: Array<{ license_id: string; include_cost: boolean }>
  ): Promise<AddonService> => {
    try {
      // Insert addon service
      const { data: service, error: serviceError } = await supabase
        .from('addon_services')
        .insert(addonServiceData)
        .select()
        .single();

      if (serviceError) throw serviceError;

      // Insert license associations
      if (licenseIds.length > 0) {
        const licensesToInsert = licenseIds.map(({ license_id, include_cost }) => ({
          addon_service_id: service.id,
          license_id,
          include_cost
        }));

        const { error: licensesError } = await supabase
          .from('addon_service_licenses')
          .insert(licensesToInsert);

        if (licensesError) throw licensesError;
      }

      await fetchAddonServices();
      toast.success('Add-On Service erfolgreich erstellt');
      return service;
    } catch (error) {
      console.error('Error adding addon service:', error);
      toast.error('Fehler beim Erstellen des Add-On Services');
      throw error;
    }
  };

  const updateAddonService = async (
    id: string, 
    updates: Partial<AddonService>,
    licenseIds?: Array<{ license_id: string; include_cost: boolean }>
  ): Promise<AddonService> => {
    try {
      // Update addon service
      const { data: service, error: serviceError } = await supabase
        .from('addon_services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (serviceError) throw serviceError;

      // If license associations are provided, update them
      if (licenseIds !== undefined) {
        // Delete existing associations
        await supabase
          .from('addon_service_licenses')
          .delete()
          .eq('addon_service_id', id);

        // Insert new associations
        if (licenseIds.length > 0) {
          const licensesToInsert = licenseIds.map(({ license_id, include_cost }) => ({
            addon_service_id: id,
            license_id,
            include_cost
          }));

          const { error: licensesError } = await supabase
            .from('addon_service_licenses')
            .insert(licensesToInsert);

          if (licensesError) throw licensesError;
        }
      }

      await fetchAddonServices();
      toast.success('Add-On Service erfolgreich aktualisiert');
      return service;
    } catch (error) {
      console.error('Error updating addon service:', error);
      toast.error('Fehler beim Aktualisieren des Add-On Services');
      throw error;
    }
  };

  const deleteAddonService = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('addon_services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAddonServices(prev => prev.filter(service => service.id !== id));
      toast.success('Add-On Service erfolgreich gelöscht');
    } catch (error) {
      console.error('Error deleting addon service:', error);
      toast.error('Fehler beim Löschen des Add-On Services');
      throw error;
    }
  };

  useEffect(() => {
    fetchAddonServices();
  }, []);

  return {
    addonServices,
    loading,
    addAddonService,
    updateAddonService,
    deleteAddonService,
    refetch: fetchAddonServices
  };
}