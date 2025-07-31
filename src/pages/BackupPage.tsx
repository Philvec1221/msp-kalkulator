import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Upload, Database, Clock, Users, FileText, Settings, Package } from "lucide-react";
import { useBackup } from "@/hooks/useBackup";

export function BackupPage() {
  const { loading, exportData, importData, getDataSummary } = useBackup();
  const [dataSummary, setDataSummary] = useState({
    employees: 0,
    licenses: 0,
    services: 0,
    packages: 0,
    quotes: 0
  });

  useEffect(() => {
    loadDataSummary();
  }, []);

  const loadDataSummary = async () => {
    const summary = await getDataSummary();
    setDataSummary(summary);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = await importData(file);
      if (success) {
        await loadDataSummary();
      }
    }
    // Reset input
    event.target.value = '';
  };

  const handleExport = async () => {
    await exportData();
  };

  const currentDate = new Date();
  const nextBackup = new Date(currentDate);
  nextBackup.setDate(nextBackup.getDate() + 1);
  nextBackup.setHours(12, 30, 0, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-6 w-6" />
            Daten-Backup Verwaltung
          </h2>
        </div>
      </div>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Daten-Übersicht:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dataSummary.services}</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dataSummary.packages}</div>
              <div className="text-sm text-muted-foreground">Pakete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dataSummary.licenses}</div>
              <div className="text-sm text-muted-foreground">Lizenzen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{dataSummary.employees}</div>
              <div className="text-sm text-muted-foreground">Mitarbeiter</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{dataSummary.quotes}</div>
              <div className="text-sm text-muted-foreground">Angebote</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automatic Backup Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Automatischer Backup-Zeitplan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default">Täglich um 12:30 und 18:00 Uhr automatisch</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Nächstes Backup: {nextBackup.toLocaleDateString('de-DE')} {nextBackup.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Backup Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle>Daten exportieren</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Alle Daten als JSON-Datei exportieren und herunterladen.
            </p>
            <Button 
              onClick={handleExport} 
              disabled={loading}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? 'Exportieren...' : 'Exportieren'}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Backup */}
        <Card>
          <CardHeader>
            <CardTitle>Manuelles Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sofort ein Backup aller Daten in der Cloud erstellen.
            </p>
            <Button 
              onClick={handleExport}
              disabled={loading}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Backup erstellen
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle>Daten importieren</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              JSON-Backup-Datei importieren. <span className="text-red-600 font-medium">Überschreibt alle Daten!</span>
            </p>
            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                disabled={loading}
                className="cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-3 w-3" />
              Nur JSON-Dateien werden akzeptiert
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}