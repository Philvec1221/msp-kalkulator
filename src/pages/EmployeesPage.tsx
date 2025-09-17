import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Search, Plus, X } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import { useEmployeeDepartments } from "@/hooks/useEmployeeDepartments";
import { EmployeeForm } from "@/components/forms/EmployeeForm";

export function EmployeesPage() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { departments, addDepartment, deleteDepartment } = useDepartments();
  const { assignEmployeeToDepartments, getDepartmentsByEmployee, getDepartmentAverageHourlyRate } = useEmployeeDepartments();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newDepartmentName, setNewDepartmentName] = useState('');

  const handleSubmit = async (employeeData: any, departmentIds: string[], existingEmployee?: any) => {
    let result;
    
    console.log('handleSubmit called with:', { employeeData, departmentIds, existingEmployee });
    
    if (existingEmployee?.id) {
      // Update existing employee
      console.log('Updating employee:', existingEmployee.id);
      result = await updateEmployee(existingEmployee.id, employeeData);
    } else {
      // Create new employee
      console.log('Creating new employee');
      result = await addEmployee(employeeData);
    }
    
    // Assign departments
    if (result && result.id) {
      await assignEmployeeToDepartments(result.id, departmentIds);
    }
    
    return result;
  };

  const handleAddDepartment = async () => {
    if (newDepartmentName.trim()) {
      try {
        await addDepartment(newDepartmentName.trim());
        setNewDepartmentName('');
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || 
      getDepartmentsByEmployee(employee.id).some(dept => dept.id === departmentFilter);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? employee.active : !employee.active);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate department statistics
  const departmentStats = departments.map(department => {
    const employeesInDept = employees.filter(emp => 
      emp.active && getDepartmentsByEmployee(emp.id).some(d => d.id === department.id)
    );
    const avgRate = getDepartmentAverageHourlyRate(department.id);
    
    return {
      ...department,
      employeeCount: employeesInDept.length,
      avgHourlyRate: avgRate
    };
  }).filter(dept => dept.employeeCount > 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Lade Mitarbeiter...</div>
      </div>
    );
  }

  const activeEmployees = employees.filter(emp => emp.active);
  const averageRate = activeEmployees.length > 0 
    ? activeEmployees.reduce((sum, emp) => sum + Number(emp.hourly_rate), 0) / activeEmployees.length 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mitarbeiter ({employees.length} gesamt, {activeEmployees.length} aktiv)</h1>
          <p className="text-muted-foreground">
            Durchschnittlicher Stundensatz: {averageRate.toFixed(2)} €
          </p>
        </div>
        
        <EmployeeForm onSubmit={(data, deptIds) => handleSubmit(data, deptIds)} trigger={
          <Button>+ Mitarbeiter hinzufügen</Button>
        } />
      </div>

      {/* Department Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Abteilungen verwalten</CardTitle>
          <CardDescription>Erstellen und verwalten Sie Abteilungen für die Mitarbeiter-Zuordnung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Department */}
          <div className="flex gap-2">
            <Input
              placeholder="Neue Abteilung hinzufügen..."
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDepartment())}
              className="flex-1"
            />
            <Button
              onClick={handleAddDepartment}
              disabled={!newDepartmentName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>

          {/* Existing Departments */}
          {departments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Bestehende Abteilungen:</h4>
              <div className="flex flex-wrap gap-2">
                {departments.map(department => {
                  const employeesInDept = employees.filter(emp => 
                    getDepartmentsByEmployee(emp.id).some(d => d.id === department.id)
                  );
                  return (
                    <div key={department.id} className="flex items-center gap-1">
                      <Badge variant="outline" className="flex items-center gap-2">
                        <span>{department.name}</span>
                        <span className="text-xs text-muted-foreground">({employeesInDept.length})</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Abteilung löschen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sind Sie sicher, dass Sie die Abteilung "{department.name}" löschen möchten? 
                                {employeesInDept.length > 0 && (
                                  <span className="block mt-2 text-orange-600">
                                    Warnung: {employeesInDept.length} Mitarbeiter sind dieser Abteilung zugeordnet.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteDepartment(department.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mitarbeiter suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Abteilung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            {departments.map(department => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="inactive">Inaktiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Department Statistics */}
      {departmentStats.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Abteilungsstatistiken</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentStats.map(dept => (
              <Card key={dept.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Mitarbeiter:</span>
                      <span className="font-medium">{dept.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Ø Stundensatz:</span>
                      <span className="font-medium">{dept.avgHourlyRate.toFixed(2)} €</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        {filteredEmployees.length} von {employees.length} Mitarbeitern angezeigt
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {employees.length === 0 
              ? "Noch keine Mitarbeiter hinzugefügt."
              : "Keine Mitarbeiter entsprechen den Filterkriterien."
            }
          </p>
          {employees.length === 0 && (
            <EmployeeForm onSubmit={(data, deptIds) => handleSubmit(data, deptIds)} trigger={
              <Button>Ersten Mitarbeiter hinzufügen</Button>
            } />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => {
            const employeeDepartments = getDepartmentsByEmployee(employee.id);
            return (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{employee.name}</CardTitle>
                    <CardDescription>
                      Stundensatz: {Number(employee.hourly_rate).toFixed(2)} €
                    </CardDescription>
                  </div>
                  <Badge variant={employee.active ? "default" : "secondary"}>
                    {employee.active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
                
                {/* Departments */}
                {employeeDepartments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {employeeDepartments.map(dept => (
                      <Badge key={dept.id} variant="outline" className="text-xs">
                        {dept.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {!employee.active && employee.inactive_reason && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Grund: </span>
                      {employee.inactive_reason}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <EmployeeForm 
                      employee={employee} 
                      onSubmit={(data, deptIds) => handleSubmit(data, deptIds, employee)} 
                      trigger={
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      } 
                    />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Mitarbeiter löschen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sind Sie sicher, dass Sie {employee.name} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteEmployee(employee.id)}>
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}