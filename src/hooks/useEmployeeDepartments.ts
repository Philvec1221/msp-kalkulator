import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmployeeDepartment {
  id: string;
  employee_id: string;
  department_id: string;
  created_at: string;
  departments: {
    id: string;
    name: string;
  };
  employees: {
    id: string;
    name: string;
    hourly_rate: number;
    active: boolean;
  };
}

export function useEmployeeDepartments() {
  const [employeeDepartments, setEmployeeDepartments] = useState<EmployeeDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployeeDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_departments')
        .select(`
          *,
          departments(id, name),
          employees(id, name, hourly_rate, active)
        `);

      if (error) throw error;
      setEmployeeDepartments(data || []);
    } catch (error) {
      console.error('Error fetching employee departments:', error);
      toast({
        title: "Fehler",
        description: "Mitarbeiter-Abteilungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignEmployeeToDepartments = async (employeeId: string, departmentIds: string[]) => {
    try {
      // First, remove existing assignments
      const { error: deleteError } = await supabase
        .from('employee_departments')
        .delete()
        .eq('employee_id', employeeId);

      if (deleteError) throw deleteError;

      // Then, add new assignments
      if (departmentIds.length > 0) {
        const assignments = departmentIds.map(departmentId => ({
          employee_id: employeeId,
          department_id: departmentId
        }));

        const { error: insertError } = await supabase
          .from('employee_departments')
          .insert(assignments);

        if (insertError) throw insertError;
      }

      // Refresh data
      await fetchEmployeeDepartments();
      
      toast({
        title: "Erfolg",
        description: "Abteilungs-Zuordnungen wurden aktualisiert.",
      });
    } catch (error) {
      console.error('Error assigning employee to departments:', error);
      toast({
        title: "Fehler",
        description: "Abteilungs-Zuordnungen konnten nicht aktualisiert werden.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getDepartmentsByEmployee = (employeeId: string) => {
    return employeeDepartments
      .filter(ed => ed.employee_id === employeeId)
      .map(ed => ed.departments);
  };

  const getEmployeesByDepartment = (departmentId: string) => {
    return employeeDepartments
      .filter(ed => ed.department_id === departmentId)
      .map(ed => ed.employees);
  };

  const getDepartmentAverageHourlyRate = (departmentId: string) => {
    const employees = getEmployeesByDepartment(departmentId).filter(emp => emp.active);
    if (employees.length === 0) return 0;

    // Calculate distributed hourly rate for each employee
    const totalDistributedRate = employees.reduce((sum, employee) => {
      const employeeDepartmentCount = getDepartmentsByEmployee(employee.id).length;
      const distributedRate = employee.hourly_rate / employeeDepartmentCount;
      return sum + distributedRate;
    }, 0);

    return totalDistributedRate / employees.length;
  };

  useEffect(() => {
    fetchEmployeeDepartments();
  }, []);

  return {
    employeeDepartments,
    loading,
    assignEmployeeToDepartments,
    getDepartmentsByEmployee,
    getEmployeesByDepartment,
    getDepartmentAverageHourlyRate,
    refetch: fetchEmployeeDepartments
  };
}