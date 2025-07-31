import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BackupData {
  employees: any[];
  licenses: any[];
  services: any[];
  package_configs: any[];
  metadata: {
    version: string;
    created_at: string;
    total_records: number;
  };
}

export function useBackup() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exportData = async (): Promise<BackupData | null> => {
    setLoading(true);
    try {
      const [employeesResult, licensesResult, servicesResult, packagesResult] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('licenses').select('*'),
        supabase.from('services').select('*'),
        supabase.from('package_configs').select('*')
      ]);

      if (employeesResult.error) throw employeesResult.error;
      if (licensesResult.error) throw licensesResult.error;
      if (servicesResult.error) throw servicesResult.error;
      if (packagesResult.error) throw packagesResult.error;

      const employees = employeesResult.data || [];
      const licenses = licensesResult.data || [];
      const services = servicesResult.data || [];
      const package_configs = packagesResult.data || [];

      const backupData: BackupData = {
        employees,
        licenses,
        services,
        package_configs,
        metadata: {
          version: "1.1.0",
          created_at: new Date().toISOString(),
          total_records: employees.length + licenses.length + services.length + package_configs.length
        }
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `msp-kalkulator-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export erfolgreich",
        description: `Backup mit ${backupData.metadata.total_records} Einträgen erstellt.`,
      });

      return backupData;
    } catch (error) {
      console.error('Backup export error:', error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Fehler beim Erstellen des Backups.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const importData = async (file: File): Promise<boolean> => {
    setLoading(true);
    try {
      const text = await file.text();
      const data: BackupData = JSON.parse(text);

      if (!data.employees || !data.licenses || !data.services) {
        throw new Error('Ungültiges Backup-Format');
      }

      let importedCount = 0;

      // Import employees
      if (data.employees.length > 0) {
        const { error } = await supabase
          .from('employees')
          .upsert(data.employees.map(emp => ({
            ...emp,
            updated_at: new Date().toISOString()
          })));
        if (error) throw error;
        importedCount += data.employees.length;
      }

      // Import licenses
      if (data.licenses.length > 0) {
        const { error } = await supabase
          .from('licenses')
          .upsert(data.licenses.map(lic => ({
            ...lic,
            updated_at: new Date().toISOString()
          })));
        if (error) throw error;
        importedCount += data.licenses.length;
      }

      // Import services
      if (data.services.length > 0) {
        const { error } = await supabase
          .from('services')
          .upsert(data.services.map(svc => ({
            ...svc,
            updated_at: new Date().toISOString()
          })));
        if (error) throw error;
        importedCount += data.services.length;
      }

      // Import package configs
      if (data.package_configs && data.package_configs.length > 0) {
        const { error } = await supabase
          .from('package_configs')
          .upsert(data.package_configs.map(pkg => ({
            ...pkg,
            updated_at: new Date().toISOString()
          })));
        if (error) throw error;
        importedCount += data.package_configs.length;
      }

      toast({
        title: "Import erfolgreich",
        description: `${importedCount} Einträge wurden importiert. Seite wird aktualisiert...`,
      });

      // Reload page to refresh all data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      return true;
    } catch (error) {
      console.error('Backup import error:', error);
      toast({
        title: "Import fehlgeschlagen",
        description: error instanceof Error ? error.message : "Fehler beim Importieren der Daten.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDataSummary = async () => {
    try {
      const [employeesResult, licensesResult, servicesResult, packagesResult] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact' }),
        supabase.from('licenses').select('id', { count: 'exact' }),
        supabase.from('services').select('id', { count: 'exact' }),
        supabase.from('package_configs').select('id', { count: 'exact' })
      ]);

      return {
        employees: employeesResult.count || 0,
        licenses: licensesResult.count || 0,
        services: servicesResult.count || 0,
        packages: packagesResult.count || 0,
        quotes: 0 // Will be implemented later
      };
    } catch (error) {
      console.error('Error getting data summary:', error);
      return {
        employees: 0,
        licenses: 0,
        services: 0,
        packages: 0,
        quotes: 0
      };
    }
  };

  return {
    loading,
    exportData,
    importData,
    getDataSummary
  };
}