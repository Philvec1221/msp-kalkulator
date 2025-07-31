-- Create packages table
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER NOT NULL,
  color TEXT NOT NULL DEFAULT 'default',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on packages" 
ON public.packages 
FOR ALL 
USING (true);

-- Insert default packages with correct hierarchy
INSERT INTO public.packages (name, description, order_index, color) VALUES
('Basis', 'Grundlegende IT-Services für kleine Unternehmen', 1, 'default'),
('Gold', 'Erweiterte Services für wachsende Unternehmen', 2, 'warning'),
('Allin', 'Umfassende IT-Betreuung für etablierte Unternehmen', 3, 'primary'),
('Allin Black', 'Premium-Services für höchste Ansprüche', 4, 'destructive');

-- Create service_packages junction table for many-to-many relationship
CREATE TABLE public.service_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL REFERENCES public.packages(name) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on service_packages" 
ON public.service_packages 
FOR ALL 
USING (true);

-- Add unique constraint to prevent duplicate service-package combinations
ALTER TABLE public.service_packages ADD CONSTRAINT unique_service_package UNIQUE (service_id, package_name);

-- Add min_package_level column to services table
ALTER TABLE public.services ADD COLUMN min_package_level TEXT DEFAULT 'Basis';

-- Migrate existing services to use the new package system
-- For each existing service, create entries in service_packages based on their current package_level
DO $$
DECLARE
    service_record RECORD;
    package_names TEXT[];
BEGIN
    FOR service_record IN SELECT id, package_level FROM public.services WHERE package_level IS NOT NULL LOOP
        -- Determine which packages this service should be in based on hierarchy
        CASE service_record.package_level
            WHEN 'basis' THEN 
                package_names := ARRAY['Basis', 'Gold', 'Allin', 'Allin Black'];
            WHEN 'gold' THEN 
                package_names := ARRAY['Gold', 'Allin', 'Allin Black'];
            WHEN 'allin' THEN 
                package_names := ARRAY['Allin', 'Allin Black'];
            WHEN 'allin_black' THEN 
                package_names := ARRAY['Allin Black'];
            ELSE 
                package_names := ARRAY['Basis', 'Gold', 'Allin', 'Allin Black']; -- Default to all packages
        END CASE;
        
        -- Insert into service_packages for each applicable package
        FOREACH package_names[1] IN ARRAY package_names LOOP
            INSERT INTO public.service_packages (service_id, package_name) 
            VALUES (service_record.id, package_names[1])
            ON CONFLICT (service_id, package_name) DO NOTHING;
        END LOOP;
        
        -- Update min_package_level
        CASE service_record.package_level
            WHEN 'basis' THEN 
                UPDATE public.services SET min_package_level = 'Basis' WHERE id = service_record.id;
            WHEN 'gold' THEN 
                UPDATE public.services SET min_package_level = 'Gold' WHERE id = service_record.id;
            WHEN 'allin' THEN 
                UPDATE public.services SET min_package_level = 'Allin' WHERE id = service_record.id;
            WHEN 'allin_black' THEN 
                UPDATE public.services SET min_package_level = 'Allin Black' WHERE id = service_record.id;
            ELSE 
                UPDATE public.services SET min_package_level = 'Basis' WHERE id = service_record.id;
        END CASE;
    END LOOP;
END $$;

-- Add trigger for automatic timestamp updates on packages
CREATE TRIGGER update_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();