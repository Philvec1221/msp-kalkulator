-- Update the billing_type check constraint to include all valid billing types
ALTER TABLE public.services 
DROP CONSTRAINT IF EXISTS services_billing_type_check;

ALTER TABLE public.services 
ADD CONSTRAINT services_billing_type_check 
CHECK (billing_type = ANY (ARRAY['fix', 'pro_user', 'pro_server', 'pro_device', 'pro_site', 'per_tb']));