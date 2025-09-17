import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Erlaubte E-Mail-Domains
  const allowedDomains = ["vectano.de"]; // Nur vectano.de Domain erlaubt

  const isEmailDomainAllowed = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return allowedDomains.includes(domain);
  };

  useEffect(() => {
    // Handle auth state changes and recovery tokens
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);
        
        if (event === 'PASSWORD_RECOVERY') {
          toast({
            title: "Passwort-Recovery aktiv",
            description: "Sie können jetzt Ihr Passwort ändern. Geben Sie Ihr neues Passwort ein.",
          });
        } else if (event === 'SIGNED_IN' && session) {
          navigate("/");
        }
      }
    );

    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        navigate("/");
      }
    };
    
    // Handle URL parameters for recovery
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const type = urlParams.get('type');
    
    if (type === 'recovery' && accessToken && refreshToken) {
      // Set the session from URL parameters
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    } else {
      checkAuth();
    }
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Domain-Validierung vor der Registrierung
    if (!isEmailDomainAllowed(email)) {
      setError("Registrierung ist nur mit erlaubten E-Mail-Domains möglich.");
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      toast({
        title: "Registrierung erfolgreich!",
        description: "Bitte überprüfen Sie Ihre E-Mail, um Ihr Konto zu bestätigen.",
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(error.message || "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Bitte geben Sie Ihre E-Mail-Adresse ein.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Always use the production URL to avoid localhost issues
      const redirectUrl = 'https://msp-kalkulator.lovable.app/auth';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) throw error;

      toast({
        title: "Neue Passwort-Reset E-Mail gesendet!",
        description: "Überprüfen Sie Ihre E-Mail für den neuen Reset-Link. Ignorieren Sie alte E-Mails.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Fehler beim Passwort-Reset");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Anmeldung erfolgreich!",
          description: "Willkommen zurück!",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error.message || "Anmeldung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">MSP Calculator</h1>
          <p className="text-muted-foreground mt-2">Melden Sie sich an, um fortzufahren</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentifizierung</CardTitle>
            <CardDescription>Anmelden oder neues Konto erstellen</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Anmelden</TabsTrigger>
                <TabsTrigger value="signup">Registrieren</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">E-Mail</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="ihre@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Passwort</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Wird angemeldet..." : "Anmelden"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handlePasswordReset}
                    disabled={loading}
                  >
                    Passwort zurücksetzen
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <div className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription>
                      Registrierung ist nur mit @vectano.de E-Mail-Adressen möglich.
                    </AlertDescription>
                  </Alert>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">E-Mail</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="ihr.name@vectano.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Passwort</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mindestens 6 Zeichen"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Wird registriert..." : "Registrieren"}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;