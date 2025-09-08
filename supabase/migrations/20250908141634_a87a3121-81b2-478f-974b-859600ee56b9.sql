-- Create addon_services table
CREATE TABLE public.addon_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.addon_services ENABLE ROW LEVEL SECURITY;

-- Create policy for addon_services
CREATE POLICY "Allow all operations on addon_services" 
ON public.addon_services 
FOR ALL 
USING (true);

-- Create addon_service_licenses table to link addon services with licenses
CREATE TABLE public.addon_service_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  addon_service_id UUID NOT NULL REFERENCES public.addon_services(id) ON DELETE CASCADE,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  include_cost BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(addon_service_id, license_id)
);

-- Enable Row Level Security
ALTER TABLE public.addon_service_licenses ENABLE ROW LEVEL SECURITY;

-- Create policy for addon_service_licenses
CREATE POLICY "Allow all operations on addon_service_licenses" 
ON public.addon_service_licenses 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates on addon_services
CREATE TRIGGER update_addon_services_updated_at
BEFORE UPDATE ON public.addon_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();