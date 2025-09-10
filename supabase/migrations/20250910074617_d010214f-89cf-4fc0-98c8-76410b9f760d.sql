-- Add sort_order column to services table
ALTER TABLE public.services 
ADD COLUMN sort_order INTEGER;

-- Set initial sort_order values based on created_at timestamp
UPDATE public.services 
SET sort_order = row_number() OVER (ORDER BY created_at)
WHERE sort_order IS NULL;

-- Add default value for new services
ALTER TABLE public.services 
ALTER COLUMN sort_order SET DEFAULT 1;