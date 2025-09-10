import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, AlertCircle } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { usePackages, getPackageHierarchy } from '@/hooks/usePackages';
import { useToast } from '@/hooks/use-toast';

interface BulkImportDialogProps {
  onImportComplete: () => void;
}

export function BulkImportDialog({ onImportComplete }: BulkImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [defaultBillingType, setDefaultBillingType] = useState('fix');
  const [defaultPackageLevel, setDefaultPackageLevel] = useState('Basis');
  const [defaultTime, setDefaultTime] = useState('0');
  const [isImporting, setIsImporting] = useState(false);
  const [previewServices, setPreviewServices] = useState<Array<{name: string, description?: string}>>([]);
  
  const { addService } = useServices();
  const { packages } = usePackages();
  const { toast } = useToast();

  const parseInput = () => {
    if (!inputText.trim()) {
      setPreviewServices([]);
      return;
    }

    // Split by double line breaks to separate service blocks
    const serviceBlocks = inputText.trim().split(/\n\s*\n/);
    
    const services = serviceBlocks
      .filter(block => block.trim())
      .map(block => {
        const lines = block.trim().split('\n');
        const name = lines[0]?.trim() || '';
        const description = lines.slice(1).join('\n').trim();
        
        return {
          name,
          description: description || undefined
        };
      });
    
    setPreviewServices(services);
  };

  const handleImport = async () => {
    if (previewServices.length === 0) {
      toast({
        title: "Fehler",
        description: "Keine Services zum Importieren gefunden.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    // Import services sequentially to maintain order
    for (const service of previewServices) {
      try {
        await addService({
          name: service.name,
          description: service.description || null,
          product_name: null,
          time_in_minutes: parseInt(defaultTime),
          billing_type: defaultBillingType as 'fix' | 'pro_client' | 'pro_server' | 'pro_user' | 'pro_device',
          package_level: defaultPackageLevel,
          active: true,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error('Error importing service:', service.name, error);
      }
    }

    setIsImporting(false);
    
    if (successCount > 0) {
      toast({
        title: "Import erfolgreich",
        description: `${successCount} Services erfolgreich importiert.${errorCount > 0 ? ` ${errorCount} Fehler.` : ''}`,
      });
      onImportComplete();
      setOpen(false);
      setInputText('');
      setPreviewServices([]);
    } else {
      toast({
        title: "Import fehlgeschlagen",
        description: "Es konnten keine Services importiert werden.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setInputText('');
    setPreviewServices([]);
    setDefaultBillingType('fix');
    setDefaultPackageLevel('Basis');
    setDefaultTime('0');
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Services Bulk Import</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Services eingeben</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="services-input">
                  Services (eine Zeile pro Service)
                </Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Services durch Leerzeilen trennen. Erste Zeile = Service-Name, folgende Zeilen = Beschreibung.
                </div>
                <Textarea
                  id="services-input"
                  placeholder={`24-7 5min Takt Remote Monitoring / Überwachung Ihrer IT
- Serverstabilität und - performance
- Benachrichtigung bei Unregelmäßigkeiten
- Überwachung & Neustart von definierten Diensten bei Fehlern

Bereitstellung einer einfachen sicheren Fernwartungslösung

Mobile Device Management
- Geräte Management für Smartphone und Tablets
- Mobile App Management
- Advanced Features
bei Buchung Managed Total Secure Microsoft 365 Business Premium - EU bereits enthalten`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              
              <Button
                type="button"
                onClick={parseInput}
                variant="secondary"
                disabled={!inputText.trim()}
              >
                Vorschau erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Default Values Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Standard-Werte</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="billing-type">Abrechnungsart</Label>
                <Select value={defaultBillingType} onValueChange={setDefaultBillingType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fix">Fix</SelectItem>
                    <SelectItem value="pro_client">Pro Client</SelectItem>
                    <SelectItem value="pro_server">Pro Server</SelectItem>
                    <SelectItem value="pro_user">Pro User</SelectItem>
                    <SelectItem value="pro_device">Pro Device</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="package-level">Package Level</Label>
                <Select value={defaultPackageLevel} onValueChange={setDefaultPackageLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.name}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="default-time">Technikzeit (Minuten)</Label>
                <input
                  id="default-time"
                  type="number"
                  min="0"
                  value={defaultTime}
                  onChange={(e) => setDefaultTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {previewServices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Vorschau
                  <Badge variant="secondary">{previewServices.length} Services</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {previewServices.map((service, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                              {service.description}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Badge variant="outline">{defaultBillingType}</Badge>
                          <Badge variant="outline">{defaultPackageLevel}</Badge>
                          <Badge variant="outline">{defaultTime}min</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Hinweis:</strong> Die Services werden mit den Standard-Werten erstellt. 
                      Sie können Technikzeiten, Lizenzen und weitere Details nach dem Import einzeln bearbeiten.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isImporting}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleImport}
              disabled={previewServices.length === 0 || isImporting}
              className="gap-2"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importiere...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {previewServices.length} Services importieren
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}