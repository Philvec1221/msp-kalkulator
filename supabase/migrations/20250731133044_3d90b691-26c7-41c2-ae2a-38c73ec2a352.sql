-- Erweitere service_licenses Tabelle um include_cost Flag
ALTER TABLE public.service_licenses 
ADD COLUMN include_cost boolean NOT NULL DEFAULT true;

-- Erweitere licenses Tabelle um zentrale Kostenzuteilung
ALTER TABLE public.licenses 
ADD COLUMN cost_allocation_service_id uuid REFERENCES public.services(id);

-- Kommentar für die neue Spalte
COMMENT ON COLUMN public.licenses.cost_allocation_service_id IS 'Referenz auf den Service, der die Lizenzkosten trägt. Wenn NULL, wird die Lizenz bei allen zugeordneten Services berechnet.';

-- Aktualisiere billing_type in services Tabelle für erweiterte Optionen
-- Derzeit nur 'fix', erweitern um 'pro_client', 'pro_server', 'pro_user'
ALTER TABLE public.services 
DROP CONSTRAINT IF EXISTS services_billing_type_check;

-- Füge neue Check Constraint für erweiterte billing_type Optionen hinzu
ALTER TABLE public.services 
ADD CONSTRAINT services_billing_type_check 
CHECK (billing_type IN ('fix', 'pro_client', 'pro_server', 'pro_user', 'pro_device'));