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

-- Add trigger for automatic timestamp updates on packages
CREATE TRIGGER update_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();