import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import ContractAppendixPage from "./pages/ContractAppendixPage";
import AddonServicesPage from "./pages/AddonServicesPage";
import PackageConfigPage from "./pages/PackageConfigPage";
import { PackagesPage } from "./pages/PackagesPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Protected routes with layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Index />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/packages" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PackagesPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/addon-services" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AddonServicesPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/package-config" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PackageConfigPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/contract-appendix" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ContractAppendixPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Admin-only routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AppLayout>
                    <AdminPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
