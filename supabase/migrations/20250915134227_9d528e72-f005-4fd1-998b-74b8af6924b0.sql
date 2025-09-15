-- Set ph.gessner@vectano.de as admin
-- First, try to update existing profile
UPDATE public.profiles 
SET role = 'admin'::app_role 
WHERE email = 'ph.gessner@vectano.de';

-- If the profile doesn't exist but the user exists in auth.users, create the profile
INSERT INTO public.profiles (id, email, role)
SELECT au.id, au.email, 'admin'::app_role
FROM auth.users au
WHERE au.email = 'ph.gessner@vectano.de'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.email = 'ph.gessner@vectano.de'
  );

-- Remove the temporary admin user if it exists
DELETE FROM public.profiles WHERE email = 'admin@vectano.de';