-- Extend package_configs table with new columns for service-package configurations
ALTER TABLE public.package_configs
ADD COLUMN inclusion_type text DEFAULT 'effort_based',
ADD COLUMN sla_response_time text,
ADD COLUMN sla_availability text,  
ADD COLUMN hourly_rate_surcharge numeric,
ADD COLUMN custom_description text,
ADD COLUMN notes text;

-- Add check constraint for inclusion_type values
ALTER TABLE public.package_configs
ADD CONSTRAINT package_configs_inclusion_type_check 
CHECK (inclusion_type IN ('inclusive', 'effort_based', 'not_available', 'custom'));

-- Update the updated_at trigger to work with the extended table
CREATE TRIGGER update_package_configs_updated_at
    BEFORE UPDATE ON public.package_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();