import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BackupData {
  employees: any[];
  licenses: any[];
  services: any[];
  package_configs: any[];
  service_licenses?: any[];
  metadata: {
    version: string;
    created_at: string;
    total_records: number;
  };
}

interface StoredBackup {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  records_count: number;
  backup_type: string;
  description: string | null;
  created_at: string;
  created_by: string;
}

export function useBackup() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exportData = async (): Promise<BackupData | null> => {
    setLoading(true);
    try {
      const [employeesResult, licensesResult, servicesResult, packagesResult, serviceLicensesResult] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('licenses').select('*'),
        supabase.from('services').select('*'),
        supabase.from('package_configs').select('*'),
        supabase.from('service_licenses').select('*')
      ]);

      if (employeesResult.error) throw employeesResult.error;
      if (licensesResult.error) throw licensesResult.error;
      if (servicesResult.error) throw servicesResult.error;
      if (packagesResult.error) throw packagesResult.error;
      if (serviceLicensesResult.error) throw serviceLicensesResult.error;

      const employees = employeesResult.data || [];
      const licenses = licensesResult.data || [];
      const services = servicesResult.data || [];
      const package_configs = packagesResult.data || [];
      const service_licenses = serviceLicensesResult.data || [];

      const backupData: BackupData = {
        employees,
        licenses,
        services,
        package_configs,
        service_licenses,
        metadata: {
          version: "1.2.0",
          created_at: new Date().toISOString(),
          total_records: employees.length + licenses.length + services.length + package_configs.length + service_licenses.length
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

      // Clear existing data first
      await Promise.all([
        supabase.from('service_licenses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('licenses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('package_configs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);

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

      // Import service licenses
      if (data.service_licenses && data.service_licenses.length > 0) {
        const { error } = await supabase
          .from('service_licenses')
          .insert(data.service_licenses);
        if (error) throw error;
        importedCount += data.service_licenses.length;
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
      const [employeesResult, licensesResult, servicesResult, packagesResult, serviceLicensesResult] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact' }),
        supabase.from('licenses').select('id', { count: 'exact' }),
        supabase.from('services').select('id', { count: 'exact' }),
        supabase.from('package_configs').select('id', { count: 'exact' }),
        supabase.from('service_licenses').select('id', { count: 'exact' })
      ]);

      return {
        employees: employeesResult.count || 0,
        licenses: licensesResult.count || 0,
        services: servicesResult.count || 0,
        packages: packagesResult.count || 0,
        service_licenses: serviceLicensesResult.count || 0,
        quotes: 0 // Will be implemented later
      };
    } catch (error) {
      console.error('Error getting data summary:', error);
      return {
        employees: 0,
        licenses: 0,
        services: 0,
        packages: 0,
        service_licenses: 0,
        quotes: 0
      };
    }
  };

  
  // Neue Funktionen für Cloud-Backup
  const generateBackupFilename = (isAutomatic: boolean = false) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const type = isAutomatic ? 'automatisch' : 'manuell';
    return `backup-${dateStr}-${timeStr}-${type}.json`;
  };

  const saveBackupToCloud = async (backupData: BackupData, description?: string, isAutomatic: boolean = false): Promise<boolean> => {
    setLoading(true);
    try {
      const filename = generateBackupFilename(isAutomatic);
      const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      
      // Upload zu Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('backups')
        .upload(filename, backupBlob);

      if (uploadError) throw uploadError;

      // Metadata in Datenbank speichern
      const { error: metadataError } = await supabase
        .from('stored_backups')
        .insert({
          filename,
          file_path: uploadData.path,
          file_size: backupBlob.size,
          records_count: backupData.metadata.total_records,
          backup_type: isAutomatic ? 'automatic' : 'manual',
          description: description || null,
          created_by: isAutomatic ? 'system' : 'user'
        });

      if (metadataError) throw metadataError;

      toast({
        title: "Cloud-Backup erfolgreich",
        description: `${isAutomatic ? 'Automatisches' : 'Manuelles'} Backup "${filename}" wurde in der Cloud gespeichert.`,
      });

      return true;
    } catch (error) {
      console.error('Cloud backup error:', error);
      toast({
        title: "Cloud-Backup fehlgeschlagen",
        description: "Fehler beim Speichern des Backups in der Cloud.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getStoredBackups = async (): Promise<StoredBackup[]> => {
    try {
      const { data, error } = await supabase
        .from('stored_backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stored backups:', error);
      toast({
        title: "Fehler",
        description: "Gespeicherte Backups konnten nicht geladen werden.",
        variant: "destructive",
      });
      return [];
    }
  };

  const downloadStoredBackup = async (backup: StoredBackup): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('backups')
        .download(backup.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download erfolgreich",
        description: `Backup "${backup.filename}" wurde heruntergeladen.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download fehlgeschlagen",
        description: "Fehler beim Herunterladen des Backups.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteStoredBackup = async (backup: StoredBackup): Promise<boolean> => {
    setLoading(true);
    try {
      // Datei aus Storage löschen
      const { error: storageError } = await supabase.storage
        .from('backups')
        .remove([backup.file_path]);

      if (storageError) throw storageError;

      // Metadaten aus Datenbank löschen
      const { error: dbError } = await supabase
        .from('stored_backups')
        .delete()
        .eq('id', backup.id);

      if (dbError) throw dbError;

      toast({
        title: "Backup gelöscht",
        description: `Backup "${backup.filename}" wurde gelöscht.`,
      });

      return true;
    } catch (error) {
      console.error('Delete backup error:', error);
      toast({
        title: "Löschen fehlgeschlagen",
        description: "Fehler beim Löschen des Backups.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restoreFromStoredBackup = async (backup: StoredBackup): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('backups')
        .download(backup.file_path);

      if (error) throw error;

      const text = await data.text();
      const backupData: BackupData = JSON.parse(text);

      // Daten importieren
      const success = await importDataFromBackup(backupData);
      
      if (success) {
        toast({
          title: "Wiederherstellung erfolgreich",
          description: `Daten von "${backup.filename}" wurden wiederhergestellt.`,
        });
      }

      return success;
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: "Wiederherstellung fehlgeschlagen",
        description: "Fehler bei der Wiederherstellung der Daten.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const importDataFromBackup = async (data: BackupData): Promise<boolean> => {
    try {
      // Clear existing data first
      await Promise.all([
        supabase.from('service_licenses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('licenses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('package_configs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);

      let importedCount = 0;

      // Import employees
      if (data.employees.length > 0) {
        const { error } = await supabase
          .from('employees')
          .insert(data.employees);
        if (error) throw error;
        importedCount += data.employees.length;
      }

      // Import licenses  
      if (data.licenses.length > 0) {
        const { error } = await supabase
          .from('licenses')
          .insert(data.licenses);
        if (error) throw error;
        importedCount += data.licenses.length;
      }

      // Import services
      if (data.services.length > 0) {
        const { error } = await supabase
          .from('services')
          .insert(data.services);
        if (error) throw error;
        importedCount += data.services.length;
      }

      // Import package configs
      if (data.package_configs && data.package_configs.length > 0) {
        const { error } = await supabase
          .from('package_configs')
          .insert(data.package_configs);
        if (error) throw error;
        importedCount += data.package_configs.length;
      }

      // Import service licenses
      if (data.service_licenses && data.service_licenses.length > 0) {
        const { error } = await supabase
          .from('service_licenses')
          .insert(data.service_licenses);
        if (error) throw error;
        importedCount += data.service_licenses.length;
      }

      return true;
    } catch (error) {
      console.error('Import data error:', error);
      return false;
    }
  };

  return {
    loading,
    exportData,
    importData,
    getDataSummary,
    saveBackupToCloud,
    getStoredBackups,
    downloadStoredBackup,
    deleteStoredBackup,
    restoreFromStoredBackup
  };
}