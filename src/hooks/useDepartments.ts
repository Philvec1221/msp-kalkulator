import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Department {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Fehler",
        description: "Abteilungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      
      setDepartments(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Erfolg",
        description: "Abteilung wurde hinzugefügt.",
      });
      return data;
    } catch (error) {
      console.error('Error adding department:', error);
      toast({
        title: "Fehler",
        description: "Abteilung konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      toast({
        title: "Erfolg",
        description: "Abteilung wurde gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Fehler",
        description: "Abteilung konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    addDepartment,
    deleteDepartment,
    refetch: fetchDepartments
  };
}