-- Entfernen von Dubletten in der employees Tabelle
-- Behalten nur den ältesten Eintrag für jeden Namen
DELETE FROM public.employees 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM public.employees 
  GROUP BY name
);

-- Entfernen von Dubletten in der licenses Tabelle
-- Behalten nur den ältesten Eintrag für jeden Namen
DELETE FROM public.licenses 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM public.licenses 
  GROUP BY name
);