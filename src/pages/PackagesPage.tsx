import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Package, BarChart3 } from "lucide-react";
import { useState } from "react";
import { usePackages } from "@/hooks/usePackages";
import { useServices } from "@/hooks/useServices";
import { PackageForm } from "@/components/forms/PackageForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PackagesPage() {
  const { packages, loading, addPackage, updatePackage, deletePackage } = usePackages();
  const { services } = useServices();

  const getPackageIcon = (packageName: string) => {
    switch (packageName.toLowerCase()) {
      case 'basis':
        return <Package className="h-5 w-5 text-gray-600" />;
      case 'gold':
        return <Package className="h-5 w-5 text-yellow-600" />;
      case 'allin':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'allin black':
        return <Package className="h-5 w-5 text-black" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getServiceStatsForPackage = (packageName: string) => {
    const packageServices = services.filter(service => 
      service.package_level === packageName.toLowerCase().replace(' ', '_')
    );
    const activeServices = packageServices.filter(service => service.active);
    
    return {
      total: packageServices.length,
      active: activeServices.length
    };
  };

  const getBadgeVariant = (color: string) => {
    switch (color) {
      case 'primary': return 'default';
      case 'warning': return 'secondary';
      case 'destructive': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Lade Pakete...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Paketverwaltung</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre IT-Service-Pakete und deren Konfiguration
          </p>
        </div>
        <PackageForm onSubmit={addPackage} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {packages
          .sort((a, b) => a.order_index - b.order_index)
          .map((pkg) => {
            const stats = getServiceStatsForPackage(pkg.name);
            return (
              <Card key={pkg.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getPackageIcon(pkg.name)}
                      <Badge variant={getBadgeVariant(pkg.color)} className="text-sm font-medium">
                        {pkg.name}
                      </Badge>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive p-1 h-8 w-8"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Paket löschen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sind Sie sicher, dass Sie das Paket "{pkg.name}" löschen möchten? 
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePackage(pkg.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Service-Statistiken</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Services gesamt: <span className="text-foreground font-medium">{stats.total}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Aktive Services: <span className="text-green-600 font-medium">{stats.active}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Reihenfolge: <span className="font-medium">{pkg.order_index}</span>
                      </span>
                      <PackageForm
                        package={pkg}
                        onSubmit={(data) => updatePackage(pkg.id, data)}
                        trigger={
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4 mr-1" />
                            Bearbeiten
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {packages.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Keine Pakete vorhanden</h3>
              <p className="mb-4">Erstellen Sie Ihr erstes Service-Paket um zu beginnen.</p>
              <PackageForm onSubmit={addPackage} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}