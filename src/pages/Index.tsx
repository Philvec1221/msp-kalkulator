import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { TabsContent } from "@/components/ui/tabs";
import { EmployeesPage } from "@/pages/EmployeesPage";
import { LicensesPage } from "@/pages/LicensesPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { PackagesPage } from "@/pages/PackagesPage";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { BackupPage } from "@/pages/BackupPage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("employees");

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <TabsContent value="employees">
        <EmployeesPage />
      </TabsContent>
      <TabsContent value="licenses">
        <LicensesPage />
      </TabsContent>
      <TabsContent value="services">
        <ServicesPage />
      </TabsContent>
      <TabsContent value="packages">
        <PackagesPage />
      </TabsContent>
      <TabsContent value="calculator">
        <CalculatorPage />
      </TabsContent>
      <TabsContent value="backup">
        <BackupPage />
      </TabsContent>
    </MainLayout>
  );
};

export default Index;
