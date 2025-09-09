import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Trash } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { useEffect } from "react";
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

  // Calculate average hourly rate for active employees
  const activeEmployees = employees.filter(emp => emp.active);
  const averageHourlyRate = activeEmployees.length > 0 
    ? activeEmployees.reduce((sum, emp) => sum + emp.hourly_rate, 0) / activeEmployees.length
    : 0;

  const sampleEmployees = [
    { name: "PG", hourly_rate: 57.03, active: true },
    { name: "KB", hourly_rate: 74.67, active: true },
    { name: "WS", hourly_rate: 42.81, active: true },
    { name: "DRJ", hourly_rate: 51.95, active: true },
    { name: "MS", hourly_rate: 28.74, active: true },
    { name: "RAH", hourly_rate: 55.42, active: true },
    { name: "MK", hourly_rate: 42.77, active: true },
    { name: "LB", hourly_rate: 33.17, active: true },
    { name: "WRM", hourly_rate: 61.62, active: true },
    { name: "MAR", hourly_rate: 39.83, active: true },
    { name: "HW", hourly_rate: 27.6, active: true },
    { name: "SK", hourly_rate: 31.62, active: true },
    { name: "CSP", hourly_rate: 71.82, active: true },
    { name: "TB", hourly_rate: 18.43, active: true },
    { name: "JR", hourly_rate: 16.63, active: true },
    { name: "SMS", hourly_rate: 17.86, active: true },
    { name: "FG", hourly_rate: 50.8, active: true },
    { name: "AS", hourly_rate: 19.85, active: true },
    { name: "AP", hourly_rate: 33, active: true },
    { name: "KK", hourly_rate: 8.83, active: true },
    { name: "PM", hourly_rate: 64.65, active: true },
    { name: "Jackob", hourly_rate: 64.65, active: true },
    { name: "Rewst.io", hourly_rate: 11.3, active: true },
    { name: "DH", hourly_rate: 43.73, active: true }
  ];

  const addSampleEmployees = async () => {
    for (const emp of sampleEmployees) {
      try {
        await addEmployee(emp);
      } catch (error) {
        console.error('Error adding employee:', emp.name, error);
      }
    }
  };

  // Entfernt: Automatische Hinzufügung von Beispieldaten
  // useEffect(() => {
  //   if (employees.length === 0) {
  //     addSampleEmployees();
  //   }
  // }, [employees.length]);

  if (loading) {
    return <div className="flex justify-center py-8">Lade Mitarbeiter...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mitarbeiterverwaltung</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Mitarbeiter und deren Stundensätze ({employees.length} gesamt, {activeEmployees.length} aktiv)
            {activeEmployees.length > 0 && (
              <span className="ml-2">• Ø {averageHourlyRate.toFixed(2)} €/h</span>
            )}
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
                  <div className="flex flex-col gap-1">
                    <Badge variant={employee.active ? "default" : "secondary"}>
                      {employee.active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    {!employee.active && (
                      <div className="text-xs text-muted-foreground">
                        <p>Wird nicht in Berechnungen einbezogen</p>
                        {employee.inactive_reason && (
                          <p className="mt-1 italic">Grund: {employee.inactive_reason}</p>
                        )}
                      </div>
                    )}
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