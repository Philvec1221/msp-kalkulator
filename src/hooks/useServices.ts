import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getPackageHierarchy } from '@/hooks/usePackages';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  product_name: string | null;
  time_in_minutes: number;
  billing_type: string;
  package_level: string;
  min_package_level?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Fehler",
        description: "Services konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Determine min_package_level from package_level for backward compatibility
      const minPackageLevel = service.package_level || 'Basis';
      
      const serviceData = {
        ...service,
        min_package_level: minPackageLevel
      };

      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select()
        .single();

      if (error) throw error;
      
      // Create service_packages entries based on hierarchy
      const applicablePackages = getPackageHierarchy(minPackageLevel);
      if (applicablePackages.length > 0) {
        const servicePackageEntries = applicablePackages.map(packageName => ({
          service_id: data.id,
          package_name: packageName
        }));

        const { error: servicePackagesError } = await supabase
          .from('service_packages')
          .insert(servicePackageEntries);

        if (servicePackagesError) {
          console.error('Error creating service packages:', servicePackagesError);
        }
      }
      
      setServices(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Service wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Fehler",
        description: "Service konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setServices(prev => prev.map(svc => svc.id === id ? data : svc));
      toast({
        title: "Erfolg",
        description: "Service wurde aktualisiert.",
      });
      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Fehler",
        description: "Service konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setServices(prev => prev.filter(svc => svc.id !== id));
      toast({
        title: "Erfolg",
        description: "Service wurde gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Fehler",
        description: "Service konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    refetch: fetchServices
  };
}