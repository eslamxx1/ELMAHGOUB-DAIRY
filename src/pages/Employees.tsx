import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { toast } from '@/components/ui/sonner';
import { Employee } from '@/types';
import { useAutoSave } from '@/hooks/useAutoSave';
import { fileSystemService } from '@/services/FileSystemService';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

// Import components
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeTable from '@/components/employees/EmployeeTable';
import AdvanceDialog from '@/components/employees/AdvanceDialog';
import AdvancesDetailsDialog from '@/components/employees/AdvancesDetailsDialog';

const Employees = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, addEmployeeAdvance, resetEmployeeAdvances } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({
    code: '',
    name: '',
    phone: '',
    salary: 0,
    advances: [],
    notes: '',
    salaryMonth: new Date().getMonth().toString(),
    salaryYear: new Date().getFullYear(),
    salaryPaid: false
  });

  // Employee advance dialog state
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState('');
  
  // Advances details dialog state
  const [advanceDetailsOpen, setAdvanceDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Set up auto-save hook for employees
  useAutoSave('employees', employees, { interval: 30000, onBeforeUnload: true });

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    employee.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    employee.phone.includes(searchQuery)
  );

  const handleInputChange = (field: keyof Employee, value: any) => {
    setCurrentEmployee(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setCurrentEmployee({
      code: '',
      name: '',
      phone: '',
      salary: 0,
      advances: [],
      notes: '',
      salaryMonth: new Date().getMonth().toString(),
      salaryYear: new Date().getFullYear(),
      salaryPaid: false
    });
    setIsEditing(false);
  };

  const handleEditEmployee = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsEditing(true);
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      deleteEmployee(id);
      toast.success('تم حذف الموظف بنجاح');
    }
  };

  const handleSubmit = () => {
    if (!currentEmployee.name) {
      toast.error('يرجى إدخال اسم الموظف');
      return;
    }

    if (isEditing && currentEmployee.id) {
      // إذا تم تحديد أن الراتب مدفوع، قم بتصفير السلف
      if (currentEmployee.salaryPaid && !employees.find(e => e.id === currentEmployee.id)?.salaryPaid) {
        if (window.confirm('هل تريد تصفير سلف الموظف بعد دفع الراتب؟')) {
          resetEmployeeAdvances(currentEmployee.id);
          toast.success('تم تصفير السلف بنجاح');
        }
      }
      
      updateEmployee(currentEmployee as Employee);
      toast.success('تم تحديث بيانات الموظف بنجاح');
    } else {
      addEmployee(currentEmployee as Omit<Employee, 'id'>);
      toast.success('تم إضافة الموظف بنجاح');
    }

    resetForm();
  };

  const handleAddAdvance = (amount: number, date: string, notes: string) => {
    if (!currentEmployeeId || !amount) {
      toast.error('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    addEmployeeAdvance(currentEmployeeId, amount, date, notes);
    toast.success('تم تسجيل السلفة بنجاح');
    setAdvanceDialogOpen(false);
  };

  const openAdvanceDialog = (id: string) => {
    setCurrentEmployeeId(id);
    setAdvanceDialogOpen(true);
  };

  const openAdvanceDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setAdvanceDetailsOpen(true);
  };

  // Export employee data to JSON file
  const handleExportEmployees = async () => {
    try {
      if (window.electronAPI) {
        // Electron environment - use file system API
        const result = await fileSystemService.selectExportPath('employees_data.json');
        
        if (result.success && result.filePath) {
          const exportResult = await fileSystemService.exportDataToFile(result.filePath, employees);
          
          if (exportResult.success) {
            toast.success('تم تصدير بيانات الموظفين بنجاح');
          } else {
            toast.error('فشل تصدير البيانات: ' + (exportResult.error || 'خطأ غير معروف'));
          }
        }
      } else {
        // Web environment - use download link
        const dataStr = JSON.stringify(employees, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'employees_data.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        linkElement.remove();
        
        toast.success('تم تصدير بيانات الموظفين بنجاح');
      }
    } catch (error) {
      console.error('Error exporting employees data:', error);
      toast.error('حدث خطأ أثناء تصدير البيانات');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="title-large">إدارة الموظفين والرواتب</h1>
        <Button 
          onClick={handleExportEmployees} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <FileText size={16} />
          تصدير البيانات
        </Button>
      </div>
      
      {/* Employee form */}
      <EmployeeForm
        currentEmployee={currentEmployee}
        isEditing={isEditing}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />
      
      {/* Employees table */}
      <EmployeeTable 
        employees={filteredEmployees}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onAddAdvance={openAdvanceDialog}
        onViewAdvances={openAdvanceDetails}
      />

      {/* Advance Dialog */}
      <AdvanceDialog
        open={advanceDialogOpen}
        onOpenChange={setAdvanceDialogOpen}
        onAddAdvance={handleAddAdvance}
        employeeId={currentEmployeeId}
      />
      
      {/* Advances Details Dialog */}
      <AdvancesDetailsDialog
        open={advanceDetailsOpen}
        onOpenChange={setAdvanceDetailsOpen}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default Employees;
