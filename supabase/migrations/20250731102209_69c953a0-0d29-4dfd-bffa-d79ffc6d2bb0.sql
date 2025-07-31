-- Erstelle Storage-Bucket für Backups
INSERT INTO storage.buckets (id, name, public) 
VALUES ('backups', 'backups', false);

-- Erstelle RLS-Policies für Backup-Storage
CREATE POLICY "Jeder kann Backups hochladen" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'backups');

CREATE POLICY "Jeder kann eigene Backups anzeigen" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'backups');

CREATE POLICY "Jeder kann eigene Backups löschen" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'backups');

-- Erstelle Tabelle für Backup-Metadaten
CREATE TABLE public.stored_backups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    records_count INTEGER NOT NULL,
    backup_type TEXT NOT NULL DEFAULT 'manual',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by TEXT DEFAULT 'system'
);

-- Enable RLS
ALTER TABLE public.stored_backups ENABLE ROW LEVEL SECURITY;

-- RLS Policy für stored_backups
CREATE POLICY "Jeder kann stored_backups anzeigen" 
ON public.stored_backups 
FOR SELECT 
USING (true);

CREATE POLICY "Jeder kann stored_backups erstellen" 
ON public.stored_backups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Jeder kann stored_backups löschen" 
ON public.stored_backups 
FOR DELETE 
USING (true);

-- Index für bessere Performance
CREATE INDEX idx_stored_backups_created_at ON public.stored_backups(created_at DESC);