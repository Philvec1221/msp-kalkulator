-- ==============================================================================
-- PHASE 1: CRITICAL SECURITY - FIX RLS POLICIES
-- ==============================================================================

-- First, DROP all existing permissive "Allow all operations" policies
DROP POLICY IF EXISTS "Allow all operations on employees" ON public.employees;
DROP POLICY IF EXISTS "Allow all operations on licenses" ON public.licenses;
DROP POLICY IF EXISTS "Allow all operations on services" ON public.services;
DROP POLICY IF EXISTS "Allow all operations on packages" ON public.packages;
DROP POLICY IF EXISTS "Allow all operations on departments" ON public.departments;
DROP POLICY IF EXISTS "Allow all operations on package_configs" ON public.package_configs;
DROP POLICY IF EXISTS "Allow all operations on service_packages" ON public.service_packages;
DROP POLICY IF EXISTS "Allow all operations on employee_departments" ON public.employee_departments;
DROP POLICY IF EXISTS "Allow all operations on addon_services" ON public.addon_services;
DROP POLICY IF EXISTS "Allow all operations on addon_service_licenses" ON public.addon_service_licenses;
DROP POLICY IF EXISTS "Allow all operations on service_licenses" ON public.service_licenses;

-- Drop existing stored_backups policies (they were allowing too much access)
DROP POLICY IF EXISTS "Jeder kann stored_backups anzeigen" ON public.stored_backups;
DROP POLICY IF EXISTS "Jeder kann stored_backups erstellen" ON public.stored_backups;
DROP POLICY IF EXISTS "Jeder kann stored_backups löschen" ON public.stored_backups;

-- ==============================================================================
-- NEW SECURE RLS POLICIES
-- ==============================================================================

-- EMPLOYEES: CRITICAL - Contains salary data (hourly_rate)
-- Only admins can read/write employee data including salaries
CREATE POLICY "Admins can view all employees" ON public.employees
  FOR SELECT USING (public.has_role('admin'));

CREATE POLICY "Admins can create employees" ON public.employees
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update employees" ON public.employees
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete employees" ON public.employees
  FOR DELETE USING (public.has_role('admin'));

-- LICENSES: CRITICAL - Contains cost and pricing data
-- Only authenticated users can read, only admins can modify
CREATE POLICY "Authenticated users can view licenses" ON public.licenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create licenses" ON public.licenses
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update licenses" ON public.licenses
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete licenses" ON public.licenses
  FOR DELETE USING (public.has_role('admin'));

-- SERVICES: Contains business logic and pricing
-- Only authenticated users can read, only admins can modify
CREATE POLICY "Authenticated users can view services" ON public.services
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create services" ON public.services
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update services" ON public.services
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete services" ON public.services
  FOR DELETE USING (public.has_role('admin'));

-- PACKAGES: Contains business structure
-- Only authenticated users can read, only admins can modify
CREATE POLICY "Authenticated users can view packages" ON public.packages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create packages" ON public.packages
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update packages" ON public.packages
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete packages" ON public.packages
  FOR DELETE USING (public.has_role('admin'));

-- PACKAGE_CONFIGS: Contains pricing multipliers and business logic
-- Only authenticated users can read, only admins can modify
CREATE POLICY "Authenticated users can view package_configs" ON public.package_configs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create package_configs" ON public.package_configs
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update package_configs" ON public.package_configs
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete package_configs" ON public.package_configs
  FOR DELETE USING (public.has_role('admin'));

-- DEPARTMENTS: Basic organizational data
-- Only authenticated users can read, only admins can modify
CREATE POLICY "Authenticated users can view departments" ON public.departments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create departments" ON public.departments
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update departments" ON public.departments
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete departments" ON public.departments
  FOR DELETE USING (public.has_role('admin'));

-- STORED_BACKUPS: CRITICAL - Contains system metadata
-- Only admins can access backup information
CREATE POLICY "Admins can view stored_backups" ON public.stored_backups
  FOR SELECT USING (public.has_role('admin'));

CREATE POLICY "Admins can create stored_backups" ON public.stored_backups
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can delete stored_backups" ON public.stored_backups
  FOR DELETE USING (public.has_role('admin'));

-- JUNCTION TABLES: Follow the same pattern
-- SERVICE_PACKAGES
CREATE POLICY "Authenticated users can view service_packages" ON public.service_packages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create service_packages" ON public.service_packages
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update service_packages" ON public.service_packages
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete service_packages" ON public.service_packages
  FOR DELETE USING (public.has_role('admin'));

-- EMPLOYEE_DEPARTMENTS
CREATE POLICY "Authenticated users can view employee_departments" ON public.employee_departments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create employee_departments" ON public.employee_departments
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update employee_departments" ON public.employee_departments
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete employee_departments" ON public.employee_departments
  FOR DELETE USING (public.has_role('admin'));

-- ADDON_SERVICES
CREATE POLICY "Authenticated users can view addon_services" ON public.addon_services
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create addon_services" ON public.addon_services
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update addon_services" ON public.addon_services
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete addon_services" ON public.addon_services
  FOR DELETE USING (public.has_role('admin'));

-- ADDON_SERVICE_LICENSES
CREATE POLICY "Authenticated users can view addon_service_licenses" ON public.addon_service_licenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create addon_service_licenses" ON public.addon_service_licenses
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update addon_service_licenses" ON public.addon_service_licenses
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete addon_service_licenses" ON public.addon_service_licenses
  FOR DELETE USING (public.has_role('admin'));

-- SERVICE_LICENSES
CREATE POLICY "Authenticated users can view service_licenses" ON public.service_licenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create service_licenses" ON public.service_licenses
  FOR INSERT WITH CHECK (public.has_role('admin'));

CREATE POLICY "Admins can update service_licenses" ON public.service_licenses
  FOR UPDATE USING (public.has_role('admin'));

CREATE POLICY "Admins can delete service_licenses" ON public.service_licenses
  FOR DELETE USING (public.has_role('admin'));

-- ==============================================================================
-- FIX DATABASE FUNCTIONS SECURITY (search_path)
-- ==============================================================================

-- Fix the security definer functions to have immutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Only admins can promote users to admin';
  END IF;
  
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE email = user_email;
END;
$function$;