-- Add workstations column to saved_offers table
ALTER TABLE public.saved_offers 
ADD COLUMN workstations integer NOT NULL DEFAULT 10;

-- Copy data from clients to workstations
UPDATE public.saved_offers 
SET workstations = clients;

-- Drop the old clients column
ALTER TABLE public.saved_offers 
DROP COLUMN clients;