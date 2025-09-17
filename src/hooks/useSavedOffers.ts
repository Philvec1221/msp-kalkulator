import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface SavedOffer {
  id: string;
  name: string;
  company_name?: string;
  clients: number;
  servers: number;
  users: number;
  selected_packages: Json;
  calculation_results: Json;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface CreateSavedOfferData {
  name: string;
  company_name?: string;
  clients: number;
  servers: number;
  users: number;
  selected_packages: any[];
  calculation_results: any;
  notes?: string;
}

export const useSavedOffers = () => {
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSavedOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedOffers(data || []);
    } catch (error: any) {
      console.error('Error fetching saved offers:', error);
      toast({
        title: 'Fehler beim Laden der Angebote',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createSavedOffer = async (offerData: CreateSavedOfferData): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('saved_offers')
        .insert([{
          ...offerData,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Angebot gespeichert',
        description: `Das Angebot "${offerData.name}" wurde erfolgreich gespeichert.`,
      });
      
      await fetchSavedOffers();
      return data.id;
    } catch (error: any) {
      console.error('Error creating saved offer:', error);
      toast({
        title: 'Fehler beim Speichern',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateSavedOffer = async (id: string, updates: Partial<CreateSavedOfferData>) => {
    try {
      const { error } = await supabase
        .from('saved_offers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Angebot aktualisiert',
        description: 'Das Angebot wurde erfolgreich aktualisiert.',
      });
      
      await fetchSavedOffers();
    } catch (error: any) {
      console.error('Error updating saved offer:', error);
      toast({
        title: 'Fehler beim Aktualisieren',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteSavedOffer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Angebot gelöscht',
        description: 'Das Angebot wurde erfolgreich gelöscht.',
      });
      
      await fetchSavedOffers();
    } catch (error: any) {
      console.error('Error deleting saved offer:', error);
      toast({
        title: 'Fehler beim Löschen',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getSavedOffer = async (id: string): Promise<SavedOffer | null> => {
    try {
      const { data, error } = await supabase
        .from('saved_offers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching saved offer:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchSavedOffers();
  }, []);

  return {
    savedOffers,
    loading,
    createSavedOffer,
    updateSavedOffer,
    deleteSavedOffer,
    getSavedOffer,
    refreshSavedOffers: fetchSavedOffers,
  };
};