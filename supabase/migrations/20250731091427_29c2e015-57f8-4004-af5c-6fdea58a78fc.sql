-- Add additional columns to services table for enhanced functionality
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'fix',
ADD COLUMN IF NOT EXISTS package_level TEXT DEFAULT 'basis';

-- Update the updated_at trigger for services if it doesn't exist
CREATE OR REPLACE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();