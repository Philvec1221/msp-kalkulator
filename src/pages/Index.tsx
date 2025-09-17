import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { EmployeesPage } from "@/pages/EmployeesPage";
import { LicensesPage } from "@/pages/LicensesPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { PackagesPage } from "@/pages/PackagesPage";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { BackupPage } from "@/pages/BackupPage";
import { SavedOffersPage } from "@/pages/SavedOffersPage";
import { CustomerViewPage } from "@/pages/CustomerViewPage";
import { CostAnalysisPage } from "@/pages/CostAnalysisPage";
import AddonServicesPage from "@/pages/AddonServicesPage";

const Index = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Default tabs based on user role
  const [activeMainTab, setActiveMainTab] = useState(isAdmin ? "kalkulation" : "kalkulator");
  const [activeSubTab, setActiveSubTab] = useState("berechnung");

  // Handle navigation from hash and offer parameter
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove # from hash
    const offerParam = searchParams.get('offer');
    
    if (hash === 'kundenview' || offerParam) {
      setActiveMainTab('kundenview');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold">vectano MSP Calculator</h1>
              <p className="text-teal-100 mt-2">Professionelle Enterprise-Lösung für MSP-Kalkulation</p>
              <p className="text-teal-200 text-sm mt-1">Version 1.1.0 - Produktionsbereit für Enterprise-Einsatz</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <div className="bg-teal-400">
        <div className="container mx-auto px-4">
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
            {isAdmin ? (
              // Admin Navigation - All 3 tabs
              <TabsList className="grid w-full grid-cols-3 bg-transparent h-12">
                <TabsTrigger 
                  value="verwaltung" 
                  className="data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white border-0 rounded-t-lg"
                >
                  Verwaltung
                </TabsTrigger>
                <TabsTrigger 
                  value="kalkulation"
                  className="data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white border-0 rounded-t-lg"
                >
                  Kalkulation
                </TabsTrigger>
                <TabsTrigger 
                  value="kundenview"
                  className="data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white border-0 rounded-t-lg"
                >
                  Kundenview
                </TabsTrigger>
              </TabsList>
            ) : (
              // User Navigation - Only 2 tabs
              <TabsList className="grid w-full grid-cols-2 bg-transparent h-12">
                <TabsTrigger 
                  value="kalkulator"
                  className="data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white border-0 rounded-t-lg"
                >
                  Kalkulator
                </TabsTrigger>
                <TabsTrigger 
                  value="kundenview"
                  className="data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white border-0 rounded-t-lg"
                >
                  Kundenview
                </TabsTrigger>
              </TabsList>
            )}
          </Tabs>
        </div>
      </div>

      {/* Sub Navigation - Only for Admin */}
      {isAdmin && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4">
            {activeMainTab === "verwaltung" && (
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-transparent h-12">
                  <TabsTrigger value="mitarbeiter" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                    Mitarbeiter
                  </TabsTrigger>
                  <TabsTrigger value="lizenzen" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                    Lizenzen
                  </TabsTrigger>
                  <TabsTrigger value="services" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                    Services
                  </TabsTrigger>
                  <TabsTrigger value="pakete" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                    Pakete
                  </TabsTrigger>
                  <TabsTrigger value="addons" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                    Add-Ons
                  </TabsTrigger>
                  <TabsTrigger value="backup" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                    Backup
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            {activeMainTab === "kalkulation" && (
              <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-12">
                  <TabsTrigger value="berechnung" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                    Berechnung
                  </TabsTrigger>
                  <TabsTrigger value="gespeicherte-angebote" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                    Gespeicherte Angebote
                  </TabsTrigger>
                  <TabsTrigger value="kostenanalyse" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                    Kostenanalyse
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Admin Content */}
        {isAdmin && (
          <>
            {/* Verwaltung Content */}
            {activeMainTab === "verwaltung" && activeSubTab === "mitarbeiter" && <EmployeesPage />}
            {activeMainTab === "verwaltung" && activeSubTab === "lizenzen" && <LicensesPage />}
            {activeMainTab === "verwaltung" && activeSubTab === "services" && <ServicesPage />}
            {activeMainTab === "verwaltung" && activeSubTab === "pakete" && <PackagesPage />}
            {activeMainTab === "verwaltung" && activeSubTab === "addons" && <AddonServicesPage />}
            {activeMainTab === "verwaltung" && activeSubTab === "backup" && <BackupPage />}
            
            {/* Kalkulation Content */}
            {activeMainTab === "kalkulation" && activeSubTab === "berechnung" && <CalculatorPage />}
            {activeMainTab === "kalkulation" && activeSubTab === "gespeicherte-angebote" && <SavedOffersPage />}
            {activeMainTab === "kalkulation" && activeSubTab === "kostenanalyse" && <CostAnalysisPage />}
          </>
        )}
        
        {/* User Content - Direct page display */}
        {!isAdmin && activeMainTab === "kalkulator" && <CalculatorPage />}
        
        {/* Kundenview Content - Available to both Admin and User */}
        {activeMainTab === "kundenview" && <CustomerViewPage />}
      </div>
    </div>
  );
};

export default Index;
