import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { UserManagement } from "@/components/admin/UserManagement";

const AdminPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Domain-Validierung
  const isEmailDomainAllowed = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain === "vectano.de";
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Domain-Validierung
    if (!isEmailDomainAllowed(email)) {
      setError("Nur vectano.de E-Mail-Adressen sind erlaubt.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein");
      setLoading(false);
      return;
    }

    try {
      // Call the edge function instead of direct auth
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: email,
          password: password,
        },
      });
      
      if (error) {
        setError(error.message || 'Fehler beim Erstellen des Benutzers');
        return;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      toast({
        title: "Erfolg",
        description: "Neuer Benutzer wurde erfolgreich erstellt",
      });

      // Reset form
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Create user error:", error);
      setError(error.message || "Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwörter stimmen nicht überein.");
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Passwort muss mindestens 6 Zeichen lang sein.");
      setPasswordLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;

      toast({
        title: "Passwort erfolgreich geändert!",
        description: "Ihr neues Passwort ist jetzt aktiv.",
      });

      // Reset form
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password change error:", error);
      setPasswordError(error.message || "Fehler beim Ändern des Passworts");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Passwort ändern Sektion */}
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Passwort ändern</CardTitle>
            <CardDescription>Aktueller Nutzer: {user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={passwordLoading}>
                {passwordLoading ? "Wird geändert..." : "Passwort ändern"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Neue Nutzer erstellen Sektion */}
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Neuen Benutzer erstellen</CardTitle>
            <CardDescription>Neuen Benutzer mit @vectano.de E-Mail anlegen</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@vectano.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wird erstellt..." : "Nutzer erstellen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Benutzerverwaltung */}
      <div className="max-w-6xl mx-auto">
        <UserManagement />
      </div>
    </div>
  );
};

export default AdminPage;