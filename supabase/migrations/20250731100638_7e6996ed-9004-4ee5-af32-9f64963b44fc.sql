-- Hinzufügen des billing_unit Feldes zur licenses Tabelle
ALTER TABLE public.licenses 
ADD COLUMN billing_unit TEXT NOT NULL DEFAULT 'Fix';