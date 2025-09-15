import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Building } from "lucide-react";
import { useDepartments } from "@/hooks/useDepartments";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export const DepartmentsPage = () => {
  const { departments, loading, addDepartment, deleteDepartment } = useDepartments();
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;

    setIsAdding(true);
    try {
      await addDepartment(newDepartmentName.trim());
      setNewDepartmentName("");
    } catch (error) {
      console.error("Failed to add department:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (window.confirm(`Möchten Sie die Abteilung "${name}" wirklich löschen?`)) {
      await deleteDepartment(id);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Abteilungen verwalten</h1>
      </div>

      {/* Add New Department Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Neue Abteilung hinzufügen
          </CardTitle>
          <CardDescription>
            Erstellen Sie neue Abteilungen für die Mitarbeiterzuordnung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddDepartment} className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="department-name">Abteilungsname</Label>
              <Input
                id="department-name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="z.B. IT, Vertrieb, Marketing"
                disabled={isAdding}
              />
            </div>
            <Button type="submit" disabled={!newDepartmentName.trim() || isAdding}>
              {isAdding ? "Wird hinzugefügt..." : "Hinzufügen"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Departments */}
      <Card>
        <CardHeader>
          <CardTitle>Bestehende Abteilungen ({departments.length})</CardTitle>
          <CardDescription>
            Verwalten Sie alle Abteilungen in Ihrem Unternehmen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Noch keine Abteilungen</p>
              <p>Fügen Sie Ihre erste Abteilung hinzu, um zu beginnen.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{department.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Erstellt: {new Date(department.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      ID: {department.id.slice(0, 8)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDepartment(department.id, department.name)}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Hinweise</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Abteilungen können Mitarbeitern zugeordnet werden</li>
            <li>• Gelöschte Abteilungen werden aus allen Mitarbeiterzuordnungen entfernt</li>
            <li>• Abteilungsnamen sollten eindeutig und aussagekräftig sein</li>
            <li>• Abteilungen werden automatisch alphabetisch sortiert</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
