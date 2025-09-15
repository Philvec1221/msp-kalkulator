import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password }: CreateUserRequest = await req.json();

    console.log('Creating user with email:', email);

    // Validate email domain
    const allowedDomains = ['vectano.de'];
    const emailDomain = email.split('@')[1];
    
    if (!allowedDomains.includes(emailDomain)) {
      return new Response(
        JSON.stringify({ 
          error: 'Nur E-Mail-Adressen mit @vectano.de Domain sind erlaubt' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Supabase admin client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create the user using admin client
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Auto-confirm email
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return new Response(
        JSON.stringify({ 
          error: userError.message || 'Fehler beim Erstellen des Benutzers' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('User created successfully:', userData.user?.id);

    // The trigger should automatically create the profile, but let's verify
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userData.user?.id)
      .single();

    if (profileError) {
      console.log('Profile not found, creating manually:', profileError);
      
      // Create profile manually if trigger failed
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userData.user?.id,
          email: userData.user?.email,
          role: 'user'
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Benutzer erfolgreich erstellt',
        user: {
          id: userData.user?.id,
          email: userData.user?.email
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Unexpected error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Unerwarteter Fehler beim Erstellen des Benutzers' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);