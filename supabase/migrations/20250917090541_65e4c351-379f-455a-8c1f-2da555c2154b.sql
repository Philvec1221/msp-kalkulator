-- Create saved_offers table for storing customer offers
CREATE TABLE public.saved_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT,
  clients INTEGER NOT NULL DEFAULT 10,
  servers INTEGER NOT NULL DEFAULT 10,
  users INTEGER NOT NULL DEFAULT 10,
  selected_packages JSONB NOT NULL DEFAULT '[]'::jsonb,
  calculation_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_offers ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_offers
CREATE POLICY "Authenticated users can view saved_offers" 
ON public.saved_offers 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Admins can create saved_offers" 
ON public.saved_offers 
FOR INSERT 
WITH CHECK (has_role('admin'::app_role));

CREATE POLICY "Admins can update saved_offers" 
ON public.saved_offers 
FOR UPDATE 
USING (has_role('admin'::app_role));

CREATE POLICY "Admins can delete saved_offers" 
ON public.saved_offers 
FOR DELETE 
USING (has_role('admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_saved_offers_updated_at
BEFORE UPDATE ON public.saved_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();