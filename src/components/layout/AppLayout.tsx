import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, profile, signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <div className="flex items-center">
            <SidebarTrigger className="ml-2" />
            <h1 className="ml-2 font-semibold text-lg">MSP Calculator</h1>
          </div>
          
          <div className="flex items-center gap-2 mr-4">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                  {profile?.role === 'admin' && (
                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </header>

        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 pt-12">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};