import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmployeesPage } from "@/pages/EmployeesPage";
import { LicensesPage } from "@/pages/LicensesPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { PackagesPage } from "@/pages/PackagesPage";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { BackupPage } from "@/pages/BackupPage";
import { ConfigPage } from "@/pages/ConfigPage";
import { CustomerViewPage } from "@/pages/CustomerViewPage";
import { CostAnalysisPage } from "@/pages/CostAnalysisPage";
import AddonServicesPage from "@/pages/AddonServicesPage";

const Index = () => {
  const [activeMainTab, setActiveMainTab] = useState("angebote");
  const [activeSubTab, setActiveSubTab] = useState("kalkulation");

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
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-12">
              <TabsTrigger 
                value="verwaltung" 
                className="data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white border-0 rounded-t-lg"
              >
                Verwaltung
              </TabsTrigger>
              <TabsTrigger 
                value="angebote"
                className="data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white border-0 rounded-t-lg"
              >
                Angebote
              </TabsTrigger>
              <TabsTrigger 
                value="kundenview"
                className="data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white border-0 rounded-t-lg"
              >
                Kundenview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Sub Navigation */}
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
          
          {activeMainTab === "angebote" && (
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-transparent h-12">
                <TabsTrigger value="konfig" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                  Konfig
                </TabsTrigger>
                <TabsTrigger value="kalkulation" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                  Kalkulation
                </TabsTrigger>
                <TabsTrigger value="kostenanalyse" className="border-b-2 border-transparent data-[state=active]:border-teal-500">
                  Kostenanalyse
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Verwaltung Content */}
        {activeMainTab === "verwaltung" && activeSubTab === "mitarbeiter" && <EmployeesPage />}
        {activeMainTab === "verwaltung" && activeSubTab === "lizenzen" && <LicensesPage />}
        {activeMainTab === "verwaltung" && activeSubTab === "services" && <ServicesPage />}
        {activeMainTab === "verwaltung" && activeSubTab === "pakete" && <PackagesPage />}
        {activeMainTab === "verwaltung" && activeSubTab === "addons" && <AddonServicesPage />}
        {activeMainTab === "verwaltung" && activeSubTab === "backup" && <BackupPage />}
        
        {/* Angebote Content */}
        {activeMainTab === "angebote" && activeSubTab === "konfig" && <ConfigPage />}
        {activeMainTab === "angebote" && activeSubTab === "kalkulation" && <CalculatorPage />}
        {activeMainTab === "angebote" && activeSubTab === "kostenanalyse" && <CostAnalysisPage />}
        
        {/* Kundenview Content */}
        {activeMainTab === "kundenview" && <CustomerViewPage />}
      </div>
    </div>
  );
};

export default Index;
