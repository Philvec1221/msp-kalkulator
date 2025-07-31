import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Trash } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
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

export function EmployeesPage() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();

  if (loading) {
    return <div className="flex justify-center py-8">Lade Mitarbeiter...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mitarbeiterverwaltung</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Mitarbeiter und deren Stundensätze ({employees.length} Mitarbeiter)
          </p>
        </div>
        <EmployeeForm onSubmit={addEmployee} />
      </div>

      {employees.length === 0 ? (
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
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <Card key={employee.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Stundensatz: {employee.hourly_rate.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <EmployeeForm
                      employee={employee}
                      onSubmit={(data) => updateEmployee(employee.id, data)}
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
                          <AlertDialogTitle>Mitarbeiter löschen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sind Sie sicher, dass Sie {employee.name} löschen möchten? 
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteEmployee(employee.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={employee.active ? "default" : "secondary"}>
                    {employee.active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}