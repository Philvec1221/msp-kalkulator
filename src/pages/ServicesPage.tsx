import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Edit, Trash, Search, Filter, Clock, GripVertical, ChevronUp, ChevronDown, X, ArrowUpDown, Star, Zap } from "lucide-react";
import { useState } from "react";
import { useServices } from "@/hooks/useServices";
import { useLicenses } from "@/hooks/useLicenses";
import { useServiceLicenses } from "@/hooks/useServiceLicenses";
import { useEmployees } from "@/hooks/useEmployees";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { BulkImportDialog } from "@/components/forms/BulkImportDialog";
import { toast } from "sonner";
import { formatDescription } from "@/lib/formatDescription";
import { getPackageBadgeProps } from "@/lib/colors";
import { usePackages } from "@/hooks/usePackages";
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
  const { packages } = usePackages();
  const { licenses } = useLicenses();
  const { serviceLicenses, getLicensesByServiceId } = useServiceLicenses();
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [packageFilter, setPackageFilter] = useState("all");
  const [billingTypeFilter, setBillingTypeFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("sort_order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [isDragOverId, setIsDragOverId] = useState<string | null>(null);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')} Std`;
  };

  // Calculate average cost per minute from all active employees
  const avgCostPerMinute = employees
    .filter(emp => emp.active)
    .reduce((sum, emp) => sum + emp.hourly_rate, 0) / 
    (employees.filter(emp => emp.active).length || 1) / 60;

  // Default configuration for service cost calculation
  const defaultConfig = { workstations: 10, servers: 2, users: 25 };

  // Calculate service costs (technical time + base license costs)
  const calculateServiceCosts = (service: any) => {
    // Technical time cost
    const timeCost = service.time_in_minutes * avgCostPerMinute;
    
    // License costs - only base costs per license unit (no customer quantity multiplication)
    const serviceLicenseIds = getLicensesByServiceId(service.id) || [];
    const licenseCost = serviceLicenseIds.reduce((total, licenseId) => {
      const license = licenses.find(l => l.id === licenseId);
      const serviceLicense = serviceLicenses.find(sl => 
        sl.service_id === service.id && sl.license_id === licenseId
      );
      
      if (!license || !serviceLicense?.include_cost) return total;
      
      // Use base cost per month (cost per unit for "pro X" licenses, full cost for "Fix" licenses)
      return total + license.cost_per_month;
    }, 0);
    
    return {
      timeCost,
      licenseCost,
      totalCost: timeCost + licenseCost
    };
  };

  const filteredServices = services
    .filter(service => {
      // Search filter - enhanced to include product name
      const matchesSearch = searchTerm === "" || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.product_name && service.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Package filter - based on min_package_level
      const matchesPackage = packageFilter === "all" || 
        (packageFilter === "basis" && (service.min_package_level === "basis" || service.min_package_level === "Basis")) ||
        (packageFilter === "gold" && ["gold", "Gold", "basis", "Basis"].includes(service.min_package_level || "")) ||
        (packageFilter === "allin" && ["allin", "Allin", "gold", "Gold", "basis", "Basis"].includes(service.min_package_level || "")) ||
        (packageFilter === "allin_black" && ["allin_black", "Allin Black", "allin", "Allin", "gold", "Gold", "basis", "Basis"].includes(service.min_package_level || ""));
      
      // Billing type filter
      const matchesBillingType = billingTypeFilter === "all" || service.billing_type === billingTypeFilter;
      
      // Activity filter
      const matchesActivity = activityFilter === "all" || 
        (activityFilter === "active" && service.active) ||
        (activityFilter === "inactive" && !service.active);
      
      // License filter
      const serviceLicenseIds = getLicensesByServiceId(service.id) || [];
      const hasLicenses = serviceLicenseIds.length > 0;
      const matchesLicense = licenseFilter === "all" ||
        (licenseFilter === "with_licenses" && hasLicenses) ||
        (licenseFilter === "without_licenses" && !hasLicenses);
      
      // Time filter
      const matchesTime = timeFilter === "all" ||
        (timeFilter === "0-30" && service.time_in_minutes <= 30) ||
        (timeFilter === "30-60" && service.time_in_minutes > 30 && service.time_in_minutes <= 60) ||
        (timeFilter === "60-120" && service.time_in_minutes > 60 && service.time_in_minutes <= 120) ||
        (timeFilter === "120+" && service.time_in_minutes > 120);
      
      return matchesSearch && matchesPackage && matchesBillingType && matchesActivity && matchesLicense && matchesTime;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "time":
          aValue = a.time_in_minutes;
          bValue = b.time_in_minutes;
          break;
        case "package_level":
          const packageOrder = { "basis": 1, "gold": 2, "allin": 3, "allin_black": 4 };
          aValue = packageOrder[a.min_package_level as keyof typeof packageOrder] || 0;
          bValue = packageOrder[b.min_package_level as keyof typeof packageOrder] || 0;
          break;
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "sort_order":
        default:
          aValue = a.sort_order || 0;
          bValue = b.sort_order || 0;
          break;
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const getBillingTypeDisplay = (billingType: string) => {
    const types = {
      'fix': 'fix',
      'pro_user': 'pro Benutzer',
      'pro_server': 'pro Server', 
      'pro_client': 'pro Device'
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

  // Get package badge props using real package data with fallback
  const getPackageBadgePropsForService = (packageLevel: string) => {
    // Always include packages even if empty array - function will handle fallback
    return getPackageBadgeProps(packages || [], packageLevel);
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
    
    if (draggedServiceId && draggedServiceId !== targetServiceId) {
      try {
        // Determine if we should insert after based on drop position
        const targetElement = e.currentTarget as HTMLElement;
        const rect = targetElement.getBoundingClientRect();
        const dropY = e.clientY;
        const insertAfter = dropY > rect.top + rect.height / 2;
        
        await updateServiceOrder(draggedServiceId, targetServiceId, insertAfter);
        
        // Auto-switch to sort_order view after successful drag & drop
        if (sortBy !== "sort_order") {
          setSortBy("sort_order");
          setSortOrder("asc");
          toast.success("Service-Reihenfolge wurde aktualisiert. Sortierung auf 'Reihenfolge' umgestellt.");
        } else {
          toast.success("Service-Reihenfolge wurde aktualisiert");
        }
      } catch (error) {
        console.error('Error updating service order:', error);
        // Error toast is already shown in useServices hook
      }
    }
    setDraggedServiceId(null);
  };

  const handleDragEnd = () => {
    setDraggedServiceId(null);
    setIsDragOverId(null);
  };

  const moveServiceUp = async (serviceId: string) => {
    const currentIndex = services.findIndex(s => s.id === serviceId);
    if (currentIndex > 0) {
      const targetService = services[currentIndex - 1];
      try {
        await updateServiceOrder(serviceId, targetService.id, false);
        toast.success("Service nach oben verschoben");
      } catch (error) {
        console.error('Error moving service up:', error);
        // Error toast is already shown in useServices hook
      }
    }
  };

  const moveServiceDown = async (serviceId: string) => {
    const currentIndex = services.findIndex(s => s.id === serviceId);
    if (currentIndex < services.length - 1) {
      const targetService = services[currentIndex + 1];
      try {
        await updateServiceOrder(serviceId, targetService.id, true);
        toast.success("Service nach unten verschoben");
      } catch (error) {
        console.error('Error moving service down:', error);
        // Error toast is already shown in useServices hook
      }
    }
  };

  // Quick filter functions
  const resetFilters = () => {
    setSearchTerm("");
    setPackageFilter("all");
    setBillingTypeFilter("all");
    setActivityFilter("all");
    setLicenseFilter("all");
    setTimeFilter("all");
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (packageFilter !== "all") count++;
    if (billingTypeFilter !== "all") count++;
    if (activityFilter !== "all") count++;
    if (licenseFilter !== "all") count++;
    if (timeFilter !== "all") count++;
    return count;
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filter & Sortierung</span>
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary">{getActiveFilterCount()}</Badge>
                )}
              </div>
              {getActiveFilterCount() > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Filter zurücksetzen
                </Button>
              )}
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={activityFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivityFilter(activityFilter === "active" ? "all" : "active")}
              >
                <Zap className="h-3 w-3 mr-1" />
                Aktive
              </Button>
              <Button
                variant={licenseFilter === "with_licenses" ? "default" : "outline"}
                size="sm"
                onClick={() => setLicenseFilter(licenseFilter === "with_licenses" ? "all" : "with_licenses")}
              >
                <Star className="h-3 w-3 mr-1" />
                Mit Lizenzen
              </Button>
              <Button
                variant={billingTypeFilter === "fix" ? "default" : "outline"}
                size="sm"
                onClick={() => setBillingTypeFilter(billingTypeFilter === "fix" ? "all" : "fix")}
              >
                Fix-Preis
              </Button>
              <Button
                variant={timeFilter === "0-30" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter(timeFilter === "0-30" ? "all" : "0-30")}
              >
                ≤ 30min
              </Button>
            </div>

            {/* Main Filter Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, Beschreibung oder Produkt suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={packageFilter} onValueChange={setPackageFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Paket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Pakete</SelectItem>
                    <SelectItem value="basis">ab Basis</SelectItem>
                    <SelectItem value="gold">ab Gold</SelectItem>
                    <SelectItem value="allin">ab Allin</SelectItem>
                    <SelectItem value="allin_black">ab Allin Black</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={billingTypeFilter} onValueChange={setBillingTypeFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Abrechnung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    <SelectItem value="fix">Fix</SelectItem>
                    <SelectItem value="pro_user">pro Benutzer</SelectItem>
                    <SelectItem value="pro_server">pro Server</SelectItem>
                    <SelectItem value="pro_client">pro Device</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Lizenzen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="with_licenses">Mit Lizenzen</SelectItem>
                    <SelectItem value="without_licenses">Ohne Lizenzen</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Zeit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Zeiten</SelectItem>
                    <SelectItem value="0-30">0-30 Min</SelectItem>
                    <SelectItem value="30-60">30-60 Min</SelectItem>
                    <SelectItem value="60-120">60-120 Min</SelectItem>
                    <SelectItem value="120+">120+ Min</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sort_order">Reihenfolge</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="time">Zeitaufwand</SelectItem>
                      <SelectItem value="package_level">Paket-Level</SelectItem>
                      <SelectItem value="created_at">Erstellungsdatum</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={toggleSort}>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground mr-2">Aktive Filter:</span>
                {searchTerm && (
                  <Badge variant="outline" className="gap-1">
                    Suche: "{searchTerm}"
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                  </Badge>
                )}
                {packageFilter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Paket: {packageFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setPackageFilter("all")} />
                  </Badge>
                )}
                {billingTypeFilter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Abrechnung: {getBillingTypeDisplay(billingTypeFilter)}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setBillingTypeFilter("all")} />
                  </Badge>
                )}
                {activityFilter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Status: {activityFilter === "active" ? "Aktiv" : "Inaktiv"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setActivityFilter("all")} />
                  </Badge>
                )}
                {licenseFilter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Lizenzen: {licenseFilter === "with_licenses" ? "Mit Lizenzen" : "Ohne Lizenzen"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setLicenseFilter("all")} />
                  </Badge>
                )}
                {timeFilter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Zeit: {timeFilter === "120+" ? "120+ Min" : timeFilter + " Min"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setTimeFilter("all")} />
                  </Badge>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              {filteredServices.length} von {services.length} Services 
              {sortBy !== "sort_order" && ` • Sortiert nach ${sortBy} (${sortOrder === "asc" ? "aufsteigend" : "absteigend"})`}
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
                          <Badge 
                            {...getPackageBadgePropsForService(service.package_level)}
                          >
                            {getPackageLevelDisplay(service.package_level)}
                          </Badge>
                        </div>
                      </div>
                      {service.description && (
                        <div className="text-sm text-muted-foreground mb-3">
                          {formatDescription(service.description)}
                        </div>
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
                            Technikzeit pro Monat: {formatTime(service.time_in_minutes)}
                          </span>
                        </div>
                        {(() => {
                          const serviceCosts = calculateServiceCosts(service);
                          return (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">
                                EK gesamt pro Monat: <strong>{serviceCosts.totalCost.toFixed(2)} €</strong>
                              </span>
                              <span className="text-xs text-muted-foreground/70">
                                (Technikzeit: {serviceCosts.timeCost.toFixed(2)} € + Lizenzen: {serviceCosts.licenseCost.toFixed(2)} €)
                              </span>
                            </div>
                          );
                        })()}
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