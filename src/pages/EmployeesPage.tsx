import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mitarbeiterverwaltung</h2>
          <p className="text-muted-foreground">Verwalten Sie Ihre Mitarbeiter und deren Stundensätze</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Mitarbeiter hinzufügen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mitarbeiter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Noch keine Mitarbeiter vorhanden. Fügen Sie den ersten Mitarbeiter hinzu.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}