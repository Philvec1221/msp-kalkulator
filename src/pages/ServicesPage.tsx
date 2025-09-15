import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Edit, Trash, Search, Filter, Clock, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useServices } from "@/hooks/useServices";
import { useLicenses } from "@/hooks/useLicenses";
import { useServiceLicenses } from "@/hooks/useServiceLicenses";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { BulkImportDialog } from "@/components/forms/BulkImportDialog";
import { toast } from "sonner";
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

export function ServicesPage() {
  const { services, loading, addService, updateService, deleteService, updateServiceOrder } = useServices();
  const { licenses } = useLicenses();
  const { serviceLicenses, getLicensesByServiceId } = useServiceLicenses();
  const [searchTerm, setSearchTerm] = useState("");
  const [packageFilter, setPackageFilter] = useState("all");
  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [isDragOverId, setIsDragOverId] = useState<string | null>(null);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')} Std`;
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPackage = packageFilter === "all"; // Will be implemented with package configs
    return matchesSearch && matchesPackage;
  });

  const getBillingTypeDisplay = (billingType: string) => {
    const types = {
      'fix': 'fix',
      'pro_user': 'pro User',
      'pro_server': 'pro Server', 
      'pro_client': 'pro Client'
    };
    return types[billingType as keyof typeof types] || billingType;
  };

  const getPackageLevelDisplay = (packageLevel: string) => {
    const levels = {
      'basis': 'ab Basis',
      'gold': 'ab Gold',
      'allin': 'ab Allin',
      'allin_black': 'ab Allin Black'
    };
    return levels[packageLevel as keyof typeof levels] || packageLevel;
  };

  const getPackageBadgeVariant = (packageLevel: string) => {
    switch (packageLevel) {
      case 'basis': return 'default';
      case 'gold': return 'secondary';
      case 'allin': return 'outline';
      case 'allin_black': return 'destructive';
      default: return 'default';
    }
  };

  const getBillingTypeBadgeVariant = (billingType: string) => {
    switch (billingType) {
      case 'pro_server': return 'default';
      case 'pro_user': return 'secondary';
      case 'pro_client': return 'outline';
      case 'fix': return 'destructive';
      default: return 'default';
    }
  };

  const handleDragStart = (e: React.DragEvent, serviceId: string) => {
    console.log('🚀 Drag started:', serviceId);
    setDraggedServiceId(serviceId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', serviceId);
    
    // Add ghost image styling
    const dragImg = document.createElement('div');
    dragImg.innerHTML = `<div style="background: white; padding: 8px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">Verschiebe Service...</div>`;
    dragImg.style.position = 'absolute';
    dragImg.style.top = '-1000px';
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 0, 0);
    setTimeout(() => document.body.removeChild(dragImg), 0);
  };

  const handleDragOver = (e: React.DragEvent, targetServiceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverId(targetServiceId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetServiceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverId(null);
    
    console.log('📍 Drop on:', targetServiceId, 'from:', draggedServiceId);
    
    if (draggedServiceId && draggedServiceId !== targetServiceId) {
      try {
        // Determine if we should insert after based on drop position
        const targetElement = e.currentTarget as HTMLElement;
        const rect = targetElement.getBoundingClientRect();
        const dropY = e.clientY;
        const insertAfter = dropY > rect.top + rect.height / 2;
        
        console.log('🔄 Updating order - dragged:', draggedServiceId, 'target:', targetServiceId, 'insertAfter:', insertAfter);
        
        await updateServiceOrder(draggedServiceId, targetServiceId, insertAfter);
        toast.success("Service-Reihenfolge wurde aktualisiert");
      } catch (error) {
        console.error('❌ Error updating service order:', error);
        toast.error("Fehler beim Aktualisieren der Reihenfolge");
      }
    }
    setDraggedServiceId(null);
  };

  const handleDragEnd = () => {
    console.log('🏁 Drag ended');
    setDraggedServiceId(null);
    setIsDragOverId(null);
  };

  const moveServiceUp = async (serviceId: string) => {
    const currentIndex = filteredServices.findIndex(s => s.id === serviceId);
    if (currentIndex > 0) {
      const targetService = filteredServices[currentIndex - 1];
      try {
        await updateServiceOrder(serviceId, targetService.id, false);
        toast.success("Service nach oben verschoben");
      } catch (error) {
        console.error('Error moving service up:', error);
        toast.error("Fehler beim Verschieben");
      }
    }
  };

  const moveServiceDown = async (serviceId: string) => {
    const currentIndex = filteredServices.findIndex(s => s.id === serviceId);
    if (currentIndex < filteredServices.length - 1) {
      const targetService = filteredServices[currentIndex + 1];
      try {
        await updateServiceOrder(serviceId, targetService.id, true);
        toast.success("Service nach unten verschoben");
      } catch (error) {
        console.error('Error moving service down:', error);
        toast.error("Fehler beim Verschieben");
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Lade Services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Services verwalten</h2>
          <p className="text-muted-foreground">
            Erstellen und verwalten Sie Ihre Service-Angebote.
          </p>
        </div>
        <div className="flex gap-2">
          <BulkImportDialog onImportComplete={() => window.location.reload()} />
          <ServiceForm onSubmit={addService} />
        </div>
      </div>

      {services.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filter</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, Beschreibung oder Produkt suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={packageFilter} onValueChange={setPackageFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Alle Pakete" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Pakete</SelectItem>
                  <SelectItem value="basis">Alle Abrechnungseinheiten</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {filteredServices.length} Services gesamt
            </p>
          </CardHeader>
        </Card>
      )}

      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              {services.length === 0 
                ? "Noch keine Services vorhanden. Fügen Sie den ersten Service hinzu."
                : "Keine Services gefunden. Überprüfen Sie Ihre Suchkriterien."}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service, index) => (
            <Card 
              key={service.id}
              onDragOver={(e) => handleDragOver(e, service.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, service.id)}
              className={`transition-all duration-200 ${
                draggedServiceId === service.id ? 'opacity-50 scale-95' : ''
              } ${isDragOverId === service.id && draggedServiceId !== service.id ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''} ${
                draggedServiceId && draggedServiceId !== service.id ? 'border-primary/30' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, service.id)}
                        onDragEnd={handleDragEnd}
                        className="flex flex-col gap-1 cursor-grab active:cursor-grabbing"
                        title="Zum Verschieben ziehen"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveServiceUp(service.id)}
                          disabled={index === 0}
                          title="Nach oben"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveServiceDown(service.id)}
                          disabled={index === filteredServices.length - 1}
                          title="Nach unten"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Settings className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <div className="flex gap-2">
                          <Badge variant={getBillingTypeBadgeVariant(service.billing_type)}>
                            {getBillingTypeDisplay(service.billing_type)}
                          </Badge>
                          <Badge variant={getPackageBadgeVariant(service.package_level)}>
                            {getPackageLevelDisplay(service.package_level)}
                          </Badge>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                      )}
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Lizenzen:</span>
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              const serviceLicenseIds = getLicensesByServiceId(service.id) || [];
                              const filteredLicenses = (licenses || []).filter(license => serviceLicenseIds.includes(license.id));
                              return filteredLicenses.length > 0 ? (
                                filteredLicenses.map(license => {
                                  const serviceLicense = serviceLicenses.find(sl => 
                                    sl.service_id === service.id && sl.license_id === license.id
                                  );
                                  const includeCost = serviceLicense?.include_cost ?? true;
                                  
                                  return (
                                    <Badge 
                                      key={license.id} 
                                      variant={includeCost ? "outline" : "secondary"} 
                                      className={`text-xs ${!includeCost ? 'opacity-60' : ''}`}
                                      title={includeCost ? 'Kosten werden einbezogen' : 'Kosten werden ausgeschlossen'}
                                    >
                                      {license.name}
                                      {!includeCost && (
                                        <span className="ml-1 text-muted-foreground">⊘</span>
                                      )}
                                    </Badge>
                                  );
                                })
                              ) : (
                                <span className="text-muted-foreground italic">Keine Lizenzen zugeordnet</span>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Technikzeit: {formatTime(service.time_in_minutes)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ServiceForm
                      service={service}
                      onSubmit={(data) => updateService(service.id, data)}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Service löschen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sind Sie sicher, dass Sie {service.name} löschen möchten? 
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteService(service.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}