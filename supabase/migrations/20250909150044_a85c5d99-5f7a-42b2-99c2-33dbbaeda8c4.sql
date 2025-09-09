-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policy for departments
CREATE POLICY "Allow all operations on departments" 
ON public.departments 
FOR ALL 
USING (true);

-- Create employee_departments junction table
CREATE TABLE public.employee_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, department_id)
);

-- Enable Row Level Security
ALTER TABLE public.employee_departments ENABLE ROW LEVEL SECURITY;

-- Create policy for employee_departments
CREATE POLICY "Allow all operations on employee_departments" 
ON public.employee_departments 
FOR ALL 
USING (true);

-- Create trigger for departments updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();