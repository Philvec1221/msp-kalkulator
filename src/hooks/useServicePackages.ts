import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ServicePackage {
  id: string;
  service_id: string;
  package_name: string;
  created_at: string;
}

export function useServicePackages() {
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServicePackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_packages')
        .select('*');
      
      if (error) throw error;
      setServicePackages(data || []);
    } catch (error) {
      console.error('Error fetching service packages:', error);
      toast({
        title: "Fehler",
        description: "Service-Package-Zuordnungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPackagesByServiceId = (serviceId: string): string[] => {
    return servicePackages
      .filter(sp => sp.service_id === serviceId)
      .map(sp => sp.package_name);
  };

  const updateServicePackages = async (serviceId: string, packageNames: string[]) => {
    try {
      // First, delete existing service packages for this service
      const { error: deleteError } = await supabase
        .from('service_packages')
        .delete()
        .eq('service_id', serviceId);
      
      if (deleteError) throw deleteError;

      // Then, insert new service packages
      if (packageNames.length > 0) {
        const { error: insertError } = await supabase
          .from('service_packages')
          .insert(
            packageNames.map(packageName => ({
              service_id: serviceId,
              package_name: packageName,
            }))
          );
        
        if (insertError) throw insertError;
      }

      // Refresh the data
      await fetchServicePackages();
    } catch (error) {
      console.error('Error updating service packages:', error);
      toast({
        title: "Fehler",
        description: "Service-Package-Zuordnungen konnten nicht aktualisiert werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchServicePackages();
  }, []);

  return {
    servicePackages,
    loading,
    getPackagesByServiceId,
    updateServicePackages,
    refetch: fetchServicePackages
  };
}