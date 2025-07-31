import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function LicensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lizenzverwaltung</h2>
          <p className="text-muted-foreground">Verwalten Sie Software-Lizenzen und deren Kosten</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Lizenz hinzufügen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lizenzen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Noch keine Lizenzen vorhanden. Fügen Sie die erste Lizenz hinzu.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}