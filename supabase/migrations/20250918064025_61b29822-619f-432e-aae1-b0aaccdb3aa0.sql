-- Add 'pro_benutzer' to billing_type enum and update existing data
-- First, add the new enum value
ALTER TYPE billing_type ADD VALUE 'pro_benutzer';

-- Update existing 'pro_user' entries to 'pro_benutzer' in services table
UPDATE public.services 
SET billing_type = 'pro_benutzer' 
WHERE billing_type = 'pro_user';

-- Update existing 'pro_user' entries to 'pro_benutzer' in licenses table  
UPDATE public.licenses 
SET billing_unit = 'pro_benutzer' 
WHERE billing_unit = 'pro_user';