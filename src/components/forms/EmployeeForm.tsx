import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Edit } from "lucide-react";
import { Employee } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import { useEmployeeDepartments } from "@/hooks/useEmployeeDepartments";

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>, departmentIds: string[]) => Promise<any>;
  trigger?: React.ReactNode;
}

export function EmployeeForm({ employee, onSubmit, trigger }: EmployeeFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    hourly_rate: 0,
    active: true,
    inactive_reason: ''
  });
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  
  const { departments, addDepartment } = useDepartments();
  const { getDepartmentsByEmployee } = useEmployeeDepartments();

  // Initialize form data when dialog opens and employee changes
  useEffect(() => {
    if (open && !isInitialized) {
      console.log('🚀 Initializing form for employee:', employee?.id || 'NEW');
      if (employee) {
        const newFormData = {
          name: employee.name,
          hourly_rate: employee.hourly_rate,
          active: employee.active,
          inactive_reason: employee.inactive_reason || ''
        };
        console.log('📝 Setting initial formData:', newFormData);
        setFormData(newFormData);
        
        // Load existing departments for this employee
        const employeeDepartments = getDepartmentsByEmployee(employee.id);
        const departmentIds = employeeDepartments.map(d => d.id);
        console.log('🏢 Setting initial departments:', departmentIds);
        setSelectedDepartmentIds(departmentIds);
      } else {
        // Reset for new employee
        console.log('🆕 Resetting for new employee');
        setFormData({
          name: '',
          hourly_rate: 0,
          active: true,
          inactive_reason: ''
        });
        setSelectedDepartmentIds([]);
      }
      setIsInitialized(true);
    }
  }, [open, employee, getDepartmentsByEmployee, isInitialized]);

  // Reset initialization when dialog closes
  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started with formData:', formData);
    console.log('👤 Employee being edited:', employee?.id ? 'UPDATE' : 'CREATE', employee?.id);
    
    // Validate inactive reason if employee is inactive
    if (!formData.active && !formData.inactive_reason.trim()) {
      console.log('❌ Validation failed: inactive reason required');
      alert('Bitte geben Sie einen Grund für die Inaktivität an.');
      return;
    }

    setLoading(true);

    try {
      const employeeData = {
        ...formData,
        // Clear inactive_reason if employee is active
        inactive_reason: formData.active ? '' : formData.inactive_reason
      };

      console.log('📤 Sending to onSubmit:', { employeeData, selectedDepartmentIds });
      await onSubmit(employeeData, selectedDepartmentIds);
      
      // Reset form only if not editing
      if (!employee) {
        setFormData({
          name: '',
          hourly_rate: 0,
          active: true,
          inactive_reason: ''
        });
        setSelectedDepartmentIds([]);
      }
      setOpen(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (newDepartmentName.trim()) {
      try {
        const newDepartment = await addDepartment(newDepartmentName.trim());
        setSelectedDepartmentIds(prev => [...prev, newDepartment.id]);
        setNewDepartmentName('');
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const toggleDepartment = (departmentId: string) => {
    console.log('🏢 Toggling department:', departmentId);
    setSelectedDepartmentIds(prev => {
      const newSelection = prev.includes(departmentId)
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId];
      console.log('📋 Department selection updated:', newSelection);
      return newSelection;
    });
  };

  const removeDepartment = (departmentId: string) => {
    setSelectedDepartmentIds(prev => prev.filter(id => id !== departmentId));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            {employee ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {employee ? 'Bearbeiten' : 'Mitarbeiter hinzufügen'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
          </DialogTitle>
          <DialogDescription>
            {employee ? 'Bearbeiten Sie die Mitarbeiterinformationen und Abteilungs-Zuordnungen.' : 'Fügen Sie einen neuen Mitarbeiter hinzu und ordnen Sie ihn Abteilungen zu.'}
          </DialogDescription>
        </DialogHeader>
        
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Mitarbeitername"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Stundensatz (€) *</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.hourly_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="active">Status</Label>
              <Badge variant={formData.active ? "default" : "destructive"} className="text-xs">
                {formData.active ? "Aktiv" : "Inaktiv"}
              </Badge>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => {
                console.log('🔄 Switch clicked - current:', formData.active, 'new:', checked);
                if (checked !== formData.active) {
                  setFormData(prev => {
                    const newData = { 
                      ...prev, 
                      active: checked,
                      inactive_reason: checked ? '' : prev.inactive_reason
                    };
                    console.log('📝 Switch updated formData:', newData);
                    return newData;
                  });
                }
              }}
            />
          </div>

          {!formData.active && (
            <div className="space-y-2">
              <Label htmlFor="inactive_reason" className="text-destructive">
                Grund für Inaktivität *
              </Label>
              <Textarea
                id="inactive_reason"
                value={formData.inactive_reason}
                onChange={(e) => setFormData(prev => ({ ...prev, inactive_reason: e.target.value }))}
                placeholder="Bitte geben Sie den Grund für die Inaktivität an..."
                className="border-destructive focus-visible:ring-destructive"
                required={!formData.active}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="departments">Abteilungen</Label>
            
            {/* Selected Departments */}
            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-md">
              {selectedDepartmentIds.length > 0 ? (
                selectedDepartmentIds.map(departmentId => {
                  const department = departments.find(d => d.id === departmentId);
                  if (!department) return null;
                  return (
                    <Badge key={departmentId} variant="secondary" className="flex items-center gap-1">
                      {department.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeDepartment(departmentId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })
              ) : (
                <span className="text-sm text-muted-foreground">Keine Abteilungen ausgewählt</span>
              )}
            </div>

            {/* Available Departments */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Verfügbare Abteilungen:</Label>
              <div className="flex flex-wrap gap-2">
                {departments
                  .filter(dept => !selectedDepartmentIds.includes(dept.id))
                  .map(department => (
                    <Button
                      key={department.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🏢 Adding department:', department.name);
                        toggleDepartment(department.id);
                      }}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {department.name}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Add New Department */}
            <div className="flex gap-2">
              <Input
                placeholder="Neue Abteilung hinzufügen..."
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDepartment())}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDepartment}
                disabled={!newDepartmentName.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Speichern..." : (employee ? "Aktualisieren" : "Hinzufügen")}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
);
}