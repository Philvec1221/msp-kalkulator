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
        .order('created_at', { ascending: true });

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
      // Get current service to compare min_package_level changes
      const currentService = services.find(s => s.id === id);
      
      // Map package_level to min_package_level if needed
      const updateData = { ...updates };
      if (updates.package_level) {
        updateData.min_package_level = updates.package_level;
      }
      
      const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // If min_package_level changed, update service_packages
      const newMinPackageLevel = updateData.min_package_level || updateData.package_level;
      const currentMinPackageLevel = currentService?.min_package_level || currentService?.package_level;
      
      if (newMinPackageLevel && newMinPackageLevel !== currentMinPackageLevel) {
        console.log(`🔄 Updating service packages for service ${data.name}: ${currentMinPackageLevel} → ${newMinPackageLevel}`);
        
        // Delete existing service_packages entries
        await supabase
          .from('service_packages')
          .delete()
          .eq('service_id', id);
        
        // Create new service_packages entries based on hierarchy
        const applicablePackages = getPackageHierarchy(newMinPackageLevel);
        if (applicablePackages.length > 0) {
          const servicePackageEntries = applicablePackages.map(packageName => ({
            service_id: id,
            package_name: packageName
          }));

          const { error: servicePackagesError } = await supabase
            .from('service_packages')
            .insert(servicePackageEntries);

          if (servicePackagesError) {
            console.error('Error updating service packages:', servicePackagesError);
          } else {
            console.log(`✅ Service packages updated for ${data.name}:`, applicablePackages);
          }
        }
      }
      
      setServices(prev => prev.map(svc => svc.id === id ? data as Service : svc));
      
      // Force refetch to ensure PackagesPage gets updated data
      await fetchServices();
      
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
    const { error } = await supabase
      .from('services')
      .update({ sort_order: newSortOrder })
      .eq('id', serviceId);

    if (error) throw error;
  };

  const updateServiceOrder = async (draggedServiceId: string, targetServiceId: string, insertAfter: boolean) => {
    try {
      console.log('🔄 Starting updateServiceOrder:', { draggedServiceId, targetServiceId, insertAfter });
      
      const draggedService = services.find(s => s.id === draggedServiceId);
      const targetService = services.find(s => s.id === targetServiceId);
      
      if (!draggedService || !targetService) {
        console.log('❌ Service not found');
        throw new Error('Service not found');
      }

      console.log('📊 Services before reorder:', {
        dragged: { id: draggedService.id, name: draggedService.name, sort_order: draggedService.sort_order },
        target: { id: targetService.id, name: targetService.name, sort_order: targetService.sort_order }
      });

      // Create a new array with the reordered services
      const servicesCopy = [...services];
      const draggedIndex = servicesCopy.findIndex(s => s.id === draggedServiceId);
      const targetIndex = servicesCopy.findIndex(s => s.id === targetServiceId);
      
      // Remove dragged service from its current position
      const [draggedItem] = servicesCopy.splice(draggedIndex, 1);
      
      // Insert at new position
      const newIndex = insertAfter ? targetIndex + 1 : targetIndex;
      servicesCopy.splice(newIndex, 0, draggedItem);
      
      // Update sort_order for all services in batch
      const updates = servicesCopy.map((service, index) => ({
        id: service.id,
        sort_order: index + 1
      }));
      
      console.log('📝 Batch updating sort orders:', updates);
      
      // Update all services with their new sort order
      for (const { id, sort_order } of updates) {
        await reorderServices(id, sort_order);
      }
      
      // Update local state
      setServices(servicesCopy.map((service, index) => ({
        ...service,
        sort_order: index + 1
      })));
      
      console.log('✅ Service order updated successfully');
      
    } catch (error) {
      console.error('❌ Error updating service order:', error);
      toast({
        title: "Fehler",
        description: "Service-Reihenfolge konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      // Refetch to restore correct order
      fetchServices();
      throw error;
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