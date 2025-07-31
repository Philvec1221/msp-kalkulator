import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, Upload, Database, Clock, Users, FileText, Settings, Package, Cloud, Trash, RotateCcw, Calendar } from "lucide-react";
import { useBackup } from "@/hooks/useBackup";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BackupPage() {
  const { 
    loading, 
    exportData, 
    importData, 
    getDataSummary,
    saveBackupToCloud,
    getStoredBackups,
    downloadStoredBackup,
    deleteStoredBackup,
    restoreFromStoredBackup
  } = useBackup();
  
  const [dataSummary, setDataSummary] = useState({
    employees: 0,
    licenses: 0,
    services: 0,
    packages: 0,
    quotes: 0
  });
  
  const [storedBackups, setStoredBackups] = useState<any[]>([]);
  const [backupDescription, setBackupDescription] = useState("");
  const [cloudBackupDialogOpen, setCloudBackupDialogOpen] = useState(false);

  useEffect(() => {
    loadDataSummary();
    loadStoredBackups();
  }, []);

  const loadDataSummary = async () => {
    const summary = await getDataSummary();
    setDataSummary(summary);
  };

  const loadStoredBackups = async () => {
    const backups = await getStoredBackups();
    setStoredBackups(backups);
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

  const handleCloudBackup = async () => {
    const backupData = await exportData();
    if (backupData) {
      const success = await saveBackupToCloud(backupData, backupDescription || undefined);
      if (success) {
        setBackupDescription("");
        setCloudBackupDialogOpen(false);
        await loadStoredBackups();
      }
    }
  };

  const handleDownloadBackup = async (backup: any) => {
    await downloadStoredBackup(backup);
  };

  const handleDeleteBackup = async (backup: any) => {
    const success = await deleteStoredBackup(backup);
    if (success) {
      await loadStoredBackups();
    }
  };

  const handleRestoreBackup = async (backup: any) => {
    const success = await restoreFromStoredBackup(backup);
    if (success) {
      await loadDataSummary();
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

        {/* Cloud Backup */}
        <Card>
          <CardHeader>
            <CardTitle>Cloud-Backup erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Backup in der Cloud speichern für sicheren Zugriff von überall.
            </p>
            <Dialog open={cloudBackupDialogOpen} onOpenChange={setCloudBackupDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={loading}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Cloud className="h-4 w-4" />
                  Cloud-Backup erstellen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cloud-Backup erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Beschreibung (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="z.B. Backup vor großem Update..."
                      value={backupDescription}
                      onChange={(e) => setBackupDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCloudBackupDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleCloudBackup} disabled={loading}>
                      {loading ? 'Erstelle...' : 'Backup erstellen'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

      {/* Gespeicherte Cloud-Backups */}
      {storedBackups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              Gespeicherte Cloud-Backups ({storedBackups.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storedBackups.map((backup) => (
                <div key={backup.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{backup.filename}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(backup.created_at)}
                        </span>
                        <span>{formatFileSize(backup.file_size)}</span>
                        <span>{backup.records_count} Datensätze</span>
                      </div>
                      {backup.description && (
                        <p className="text-sm text-muted-foreground italic">
                          {backup.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadBackup(backup)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Backup wiederherstellen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sind Sie sicher, dass Sie alle aktuellen Daten mit diesem Backup überschreiben möchten? 
                              Diese Aktion kann nicht rückgängig gemacht werden.
                              <br /><br />
                              <strong>Backup:</strong> {backup.filename}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRestoreBackup(backup)}
                              className="bg-green-600 text-white hover:bg-green-700"
                            >
                              Wiederherstellen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Backup löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sind Sie sicher, dass Sie das Backup "{backup.filename}" löschen möchten? 
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBackup(backup)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}