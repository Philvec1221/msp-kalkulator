import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Employee {
  id: string;
  name: string;
  hourly_rate: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Fehler",
        description: "Mitarbeiter konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([employee])
        .select()
        .single();

      if (error) throw error;
      
      setEmployees(prev => [data, ...prev]);
      toast({
        title: "Erfolg",
        description: "Mitarbeiter wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Fehler",
        description: "Mitarbeiter konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setEmployees(prev => prev.map(emp => emp.id === id ? data : emp));
      toast({
        title: "Erfolg",
        description: "Mitarbeiter wurde aktualisiert.",
      });
      return data;
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Fehler",
        description: "Mitarbeiter konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      toast({
        title: "Erfolg",
        description: "Mitarbeiter wurde gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Fehler",
        description: "Mitarbeiter konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees
  };
}