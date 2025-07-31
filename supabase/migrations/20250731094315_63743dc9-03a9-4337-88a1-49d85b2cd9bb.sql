-- Hinzufügen von UNIQUE Constraints um Dubletten zu verhindern

-- UNIQUE Constraint für Mitarbeiternamen
ALTER TABLE public.employees 
ADD CONSTRAINT employees_name_unique UNIQUE (name);

-- UNIQUE Constraint für Lizenznamen  
ALTER TABLE public.licenses 
ADD CONSTRAINT licenses_name_unique UNIQUE (name);