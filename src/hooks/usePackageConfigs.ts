import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PackageConfig {
  id: string;
  service_id: string;
  package_type: string;
  multiplier: number;
  inclusion_type: 'inclusive' | 'effort_based' | 'not_available' | 'custom';
  sla_response_time?: string;
  sla_availability?: string;
  hourly_rate_surcharge?: number;
  custom_description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function usePackageConfigs() {
  const [packageConfigs, setPackageConfigs] = useState<PackageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPackageConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('package_configs')
        .select('*')
        .order('package_type');
      
      if (error) throw error;
      setPackageConfigs((data || []) as PackageConfig[]);
    } catch (error) {
      console.error('Error fetching package configs:', error);
      toast({
        title: "Fehler",
        description: "Package-Konfigurationen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfigByServiceAndPackage = (serviceId: string, packageType: string): PackageConfig | undefined => {
    return packageConfigs.find(
      config => config.service_id === serviceId && config.package_type === packageType
    );
  };

  const getConfigsByService = (serviceId: string): PackageConfig[] => {
    return packageConfigs.filter(config => config.service_id === serviceId);
  };

  const getConfigsByPackage = (packageType: string): PackageConfig[] => {
    return packageConfigs.filter(config => config.package_type === packageType);
  };

  const upsertPackageConfig = async (config: Omit<PackageConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('package_configs')
        .upsert(config, {
          onConflict: 'service_id,package_type'
        });
      
      if (error) throw error;
      await fetchPackageConfigs();
    } catch (error) {
      console.error('Error upserting package config:', error);
      toast({
        title: "Fehler",
        description: "Package-Konfiguration konnte nicht gespeichert werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePackageConfig = async (id: string) => {
    try {
      const { error } = await supabase
        .from('package_configs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchPackageConfigs();
    } catch (error) {
      console.error('Error deleting package config:', error);
      toast({
        title: "Fehler",
        description: "Package-Konfiguration konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPackageConfigs();
  }, []);

  return {
    packageConfigs,
    loading,
    getConfigByServiceAndPackage,
    getConfigsByService,
    getConfigsByPackage,
    upsertPackageConfig,
    deletePackageConfig,
    refetch: fetchPackageConfigs
  };
}