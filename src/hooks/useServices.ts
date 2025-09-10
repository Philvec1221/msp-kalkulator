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
  billing_type: 'fix' | 'pro_client' | 'pro_server' | 'pro_user' | 'pro_device';
  package_level: string;
  min_package_level?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  sort_order: number;
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
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setServices((data || []) as Service[]);
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

  const addService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'sort_order'>) => {
    try {
      // Determine min_package_level from package_level for backward compatibility
      const minPackageLevel = service.package_level || 'Basis';
      
      // Get the maximum sort_order and add 1
      const { data: maxOrderData } = await supabase
        .from('services')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextSortOrder = (maxOrderData?.[0]?.sort_order || 0) + 1;
      
      const serviceData = {
        ...service,
        min_package_level: minPackageLevel,
        sort_order: nextSortOrder
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
      
      setServices(prev => [...prev, data as Service].sort((a, b) => a.sort_order - b.sort_order));
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
      
      setServices(prev => prev.map(svc => svc.id === id ? data as Service : svc));
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

  const reorderServices = async (serviceId: string, newSortOrder: number) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ sort_order: newSortOrder })
        .eq('id', serviceId);

      if (error) throw error;
      
      // Update local state
      setServices(prev => prev.map(svc => 
        svc.id === serviceId ? { ...svc, sort_order: newSortOrder } : svc
      ).sort((a, b) => a.sort_order - b.sort_order));
      
    } catch (error) {
      console.error('Error reordering service:', error);
      toast({
        title: "Fehler",
        description: "Service-Reihenfolge konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateServiceOrder = async (draggedServiceId: string, targetServiceId: string, insertAfter: boolean) => {
    try {
      const draggedService = services.find(s => s.id === draggedServiceId);
      const targetService = services.find(s => s.id === targetServiceId);
      
      if (!draggedService || !targetService) return;

      // Calculate new sort order
      const targetOrder = targetService.sort_order;
      const newOrder = insertAfter ? targetOrder + 0.5 : targetOrder - 0.5;
      
      // Update the dragged service
      await reorderServices(draggedServiceId, newOrder);
      
      // Normalize all sort orders to integers
      const sortedServices = services
        .map(s => s.id === draggedServiceId ? { ...s, sort_order: newOrder } : s)
        .sort((a, b) => a.sort_order - b.sort_order);
      
      // Update all services with normalized sort orders
      for (let i = 0; i < sortedServices.length; i++) {
        const service = sortedServices[i];
        const normalizedOrder = i + 1;
        if (service.sort_order !== normalizedOrder) {
          await reorderServices(service.id, normalizedOrder);
        }
      }
      
    } catch (error) {
      console.error('Error updating service order:', error);
      // Refetch to restore correct order
      fetchServices();
    }
  };

  return {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    updateServiceOrder,
    refetch: fetchServices
  };
}