
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Pencil, Trash2, DollarSign, Plus, Eye, Calendar, Clock, EyeOff } from 'lucide-react';
import { Employee } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface EmployeeTableProps {
  employees: Employee[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onAddAdvance: (id: string) => void;
  onViewAdvances: (employee: Employee) => void;
}

const EmployeeTable = ({
  employees,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onAddAdvance,
  onViewAdvances
}: EmployeeTableProps) => {
  const [hideData, setHideData] = useState(false);
  const [visibleEmployeeId, setVisibleEmployeeId] = useState<string | null>(null);
  
  const calculateTotalAdvances = (employee: Employee) => {
    return employee.advances.reduce((total, advance) => total + advance.amount, 0);
  };

  const calculateRemainingBalance = (employee: Employee) => {
    const totalAdvances = calculateTotalAdvances(employee);
    return employee.salary - totalAdvances;
  };

  const toggleDataVisibility = () => {
    setHideData(!hideData);
    setVisibleEmployeeId(null);
  };

  const toggleEmployeeVisibility = (id: string) => {
    if (visibleEmployeeId === id) {
      setVisibleEmployeeId(null);
    } else {
      setVisibleEmployeeId(id);
    }
  };

  const isEmployeeVisible = (id: string) => {
    return !hideData || visibleEmployeeId === id;
  };

  const maskData = (text: string) => {
    return hideData ? '•••••••' : text;
  };

  const maskNumber = (number: number) => {
    return hideData ? '•••••' : number.toFixed(2);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-cairo text-2xl mb-4">قائمة الموظفين</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDataVisibility}
            className={hideData ? "border-red-500 text-red-500 hover:bg-red-50" : "border-green-500 text-green-500 hover:bg-green-50"}
          >
            {hideData ? (
              <>
                <Eye className="h-4 w-4 ml-2" />
                إظهار البيانات
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 ml-2" />
                إخفاء البيانات
              </>
            )}
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن موظف..."
              className="pr-9 font-cairo"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-dairy-50">
                <TableHead className="font-cairo text-dairy-800">الكود</TableHead>
                <TableHead className="font-cairo text-dairy-800">الاسم</TableHead>
                <TableHead className="font-cairo text-dairy-800">رقم الهاتف</TableHead>
                <TableHead className="font-cairo text-dairy-800">الراتب</TableHead>
                <TableHead className="font-cairo text-dairy-800">شهر الراتب</TableHead>
                <TableHead className="font-cairo text-dairy-800">حالة الدفع</TableHead>
                <TableHead className="font-cairo text-dairy-800">إجمالي السلف</TableHead>
                <TableHead className="font-cairo text-dairy-800">المتبقي</TableHead>
                <TableHead className="font-cairo text-dairy-800">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 font-cairo">
                    لا يوجد موظفين للعرض
                  </TableCell>
                </TableRow>
              ) : (
                employees.map(employee => (
                  <TableRow key={employee.id} className="hover:bg-dairy-50/50 transition-colors">
                    <TableCell className="font-cairo">
                      {isEmployeeVisible(employee.id) ? employee.code : maskData(employee.code)}
                    </TableCell>
                    <TableCell className="font-cairo font-medium">{employee.name}</TableCell>
                    <TableCell className="font-cairo">
                      {isEmployeeVisible(employee.id) ? employee.phone : maskData(employee.phone)}
                    </TableCell>
                    <TableCell className="font-cairo">
                      {isEmployeeVisible(employee.id) 
                        ? `${employee.salary.toFixed(2)} ج.م` 
                        : maskData(`${employee.salary.toFixed(2)} ج.م`)}
                    </TableCell>
                    <TableCell className="font-cairo">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 ml-1" />
                        {isEmployeeVisible(employee.id) 
                          ? `${employee.salaryMonth || 'غير محدد'} ${employee.salaryYear || new Date().getFullYear()}`
                          : maskData(`${employee.salaryMonth || 'غير محدد'} ${employee.salaryYear || new Date().getFullYear()}`)}
                      </div>
                    </TableCell>
                    <TableCell className="font-cairo">
                      <Badge 
                        variant={employee.salaryPaid ? "dairy" : "secondary"}
                      >
                        <Clock className="h-3 w-3 ml-1" />
                        {isEmployeeVisible(employee.id) 
                          ? (employee.salaryPaid ? "تم الدفع" : "لم يتم الدفع")
                          : maskData(employee.salaryPaid ? "تم الدفع" : "لم يتم الدفع")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="dairy" className="font-cairo">
                        {isEmployeeVisible(employee.id) 
                          ? `${calculateTotalAdvances(employee).toFixed(2)} ج.م`
                          : maskData(`${calculateTotalAdvances(employee).toFixed(2)} ج.م`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={calculateRemainingBalance(employee) < 0 ? "destructive" : "secondary"}
                        className="font-cairo"
                      >
                        {isEmployeeVisible(employee.id) 
                          ? `${calculateRemainingBalance(employee).toFixed(2)} ج.م`
                          : maskData(`${calculateRemainingBalance(employee).toFixed(2)} ج.م`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {hideData && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleEmployeeVisibility(employee.id)}
                            className={
                              visibleEmployeeId === employee.id 
                                ? "text-red-600 border-red-600 hover:bg-red-50" 
                                : "text-blue-600 border-blue-600 hover:bg-blue-50"
                            }
                          >
                            {visibleEmployeeId === employee.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onAddAdvance(employee.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Plus className="h-3 w-3 ml-1" /> 
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewAdvances(employee)}
                          className="text-dairy-600 border-dairy-600 hover:bg-dairy-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEdit(employee)}
                          className="hover:bg-dairy-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(employee.id)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeTable;
