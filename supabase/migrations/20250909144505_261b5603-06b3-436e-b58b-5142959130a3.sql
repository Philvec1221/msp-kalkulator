-- Add inactive_reason column to employees table
ALTER TABLE public.employees 
ADD COLUMN inactive_reason TEXT;