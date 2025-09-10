-- Add sort_order column to services table
ALTER TABLE public.services 
ADD COLUMN sort_order INTEGER;

-- Create a temporary sequence to set initial sort_order values
DO $$
DECLARE
    service_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR service_record IN 
        SELECT id FROM public.services ORDER BY created_at
    LOOP
        UPDATE public.services 
        SET sort_order = counter 
        WHERE id = service_record.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- Add default value for new services
ALTER TABLE public.services 
ALTER COLUMN sort_order SET DEFAULT 1;