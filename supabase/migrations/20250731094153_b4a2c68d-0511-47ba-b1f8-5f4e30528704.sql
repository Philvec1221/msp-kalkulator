-- Entfernen von Dubletten in der employees Tabelle
-- Verwende created_at um den ältesten Eintrag zu identifizieren
DELETE FROM public.employees 
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM public.employees 
  ORDER BY name, created_at ASC
);

-- Entfernen von Dubletten in der licenses Tabelle
-- Verwende created_at um den ältesten Eintrag zu identifizieren
DELETE FROM public.licenses 
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM public.licenses 
  ORDER BY name, created_at ASC
);