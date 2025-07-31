-- Aktiviere pg_cron und pg_net Extensions für geplante Backups
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Lösche eventuell vorhandene Cron-Jobs
SELECT cron.unschedule('automatic-backup-12h');
SELECT cron.unschedule('automatic-backup-18h');

-- Erstelle Cron-Job für 12:00 Uhr täglich
SELECT cron.schedule(
  'automatic-backup-12h',
  '0 12 * * *', -- Täglich um 12:00 Uhr
  $$
  SELECT
    net.http_post(
        url:='https://trzsgpkepzpmtyqalnba.supabase.co/functions/v1/automatic-backup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyenNncGtlcHpwbXR5cWFsbmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDc5OTIsImV4cCI6MjA2OTUyMzk5Mn0.6VcYaibvUbAOLn7vY_CYn1zejKuzEKPtKZz87aCxTv4"}'::jsonb,
        body:='{"trigger": "cron", "time": "12:00"}'::jsonb
    ) as request_id;
  $$
);

-- Erstelle Cron-Job für 18:00 Uhr täglich  
SELECT cron.schedule(
  'automatic-backup-18h',
  '0 18 * * *', -- Täglich um 18:00 Uhr
  $$
  SELECT
    net.http_post(
        url:='https://trzsgpkepzpmtyqalnba.supabase.co/functions/v1/automatic-backup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyenNncGtlcHpwbXR5cWFsbmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDc5OTIsImV4cCI6MjA2OTUyMzk5Mn0.6VcYaibvUbAOLn7vY_CYn1zejKuzEKPtKZz87aCxTv4"}'::jsonb,
        body:='{"trigger": "cron", "time": "18:00"}'::jsonb
    ) as request_id;
  $$
);