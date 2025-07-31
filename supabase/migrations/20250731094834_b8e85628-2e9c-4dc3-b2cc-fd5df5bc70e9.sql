-- Erstelle eine Junction-Tabelle für Service-Lizenz-Beziehungen (many-to-many)
CREATE TABLE public.service_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id, license_id)
);

-- Enable RLS
ALTER TABLE public.service_licenses ENABLE ROW LEVEL SECURITY;

-- Create policy for service_licenses
CREATE POLICY "Allow all operations on service_licenses" 
ON public.service_licenses 
FOR ALL 
USING (true);