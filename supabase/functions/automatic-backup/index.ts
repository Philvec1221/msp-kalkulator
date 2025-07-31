import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting automatic backup creation...')

    // Sammle alle Daten
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

    // Generiere Dateiname mit aktueller Zeit
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const filename = `backup-${dateStr}-${timeStr}-automatisch.json`;

    // Erstelle Backup-Blob
    const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    
    console.log(`Creating backup: ${filename} with ${backupData.metadata.total_records} records`)

    // Upload zu Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('backups')
      .upload(filename, backupBlob);

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError;
    }

    console.log('Backup uploaded successfully, saving metadata...')

    // Metadata in Datenbank speichern
    const { error: metadataError } = await supabase
      .from('stored_backups')
      .insert({
        filename,
        file_path: uploadData.path,
        file_size: backupBlob.size,
        records_count: backupData.metadata.total_records,
        backup_type: 'automatic',
        description: `Automatisches Backup vom ${now.toLocaleDateString('de-DE')} um ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`,
        created_by: 'system'
      });

    if (metadataError) {
      console.error('Metadata error:', metadataError)
      throw metadataError;
    }

    console.log('Automatic backup completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        filename,
        records: backupData.metadata.total_records,
        message: 'Automatisches Backup erfolgreich erstellt'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Automatic backup failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Automatisches Backup fehlgeschlagen'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})