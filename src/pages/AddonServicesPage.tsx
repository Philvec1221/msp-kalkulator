import React from 'react';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAddonServices } from '@/hooks/useAddonServices';
import AddonServiceForm from '@/components/forms/AddonServiceForm';

export default function AddonServicesPage() {
  const { addonServices, loading, addAddonService, updateAddonService, deleteAddonService } = useAddonServices();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Add-On Services</h1>
          <p className="text-muted-foreground">
            Verwalten Sie zusammengestellte Service-Pakete aus Lizenzen
          </p>
        </div>
        <AddonServiceForm
          onSubmit={addAddonService}
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Add-On Service
            </Button>
          }
        />
      </div>

      {addonServices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Add-On Services vorhanden</h3>
            <p className="text-muted-foreground text-center mb-4">
              Erstellen Sie Ihren ersten Add-On Service aus einer Kombination von Lizenzen.
            </p>
            <AddonServiceForm
              onSubmit={addAddonService}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ersten Add-On Service erstellen
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {addonServices.map((addonService) => (
            <Card key={addonService.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{addonService.name}</CardTitle>
                    {addonService.description && (
                      <CardDescription className="mt-1">
                        {addonService.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={addonService.active ? 'default' : 'secondary'}>
                    {addonService.active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Enthaltene Lizenzen ({addonService.licenses.length})
                  </h4>
                  <div className="space-y-2">
                    {addonService.licenses.map((license) => (
                      <div 
                        key={license.license_id} 
                        className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                      >
                        <span className="font-medium">{license.license_name}</span>
                        <Badge 
                          variant={license.include_cost ? 'default' : 'outline'}
                        >
                          {license.include_cost ? 'Kosten inkl.' : 'Kosten exkl.'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <AddonServiceForm
                    addonService={addonService}
                    onSubmit={(data, licenseIds) => updateAddonService(addonService.id, data, licenseIds)}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Bearbeiten
                      </Button>
                    }
                  />
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Löschen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Add-On Service löschen</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sind Sie sicher, dass Sie den Add-On Service "{addonService.name}" löschen möchten?
                          Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAddonService(addonService.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}