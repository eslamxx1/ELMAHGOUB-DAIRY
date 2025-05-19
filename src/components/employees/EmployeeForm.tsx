
import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Calendar, Clock, BadgeDollarSign, Trash, Save } from 'lucide-react';
import { Employee } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface EmployeeFormProps {
  currentEmployee: Partial<Employee>;
  isEditing: boolean;
  onInputChange: (field: keyof Employee, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const EmployeeForm = ({ 
  currentEmployee, 
  isEditing, 
  onInputChange, 
  onSubmit,
  onCancel
}: EmployeeFormProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", 
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  
  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>{isEditing ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <i className={`i-lucide-chevron-${isOpen ? 'up' : 'down'} h-4 w-4`}></i>
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-sm font-medium">الكود</label>
                <Input 
                  value={currentEmployee.code || ''} 
                  onChange={e => onInputChange('code', e.target.value)}
                  disabled
                  placeholder="يتم توليده تلقائياً"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">الاسم</label>
                <Input 
                  value={currentEmployee.name || ''} 
                  onChange={e => onInputChange('name', e.target.value)}
                  placeholder="أدخل اسم الموظف"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">رقم الهاتف</label>
                <Input 
                  value={currentEmployee.phone || ''} 
                  onChange={e => onInputChange('phone', e.target.value)}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium flex items-center">
                  <BadgeDollarSign className="ml-1 h-4 w-4" />
                  الراتب الشهري
                </label>
                <Input 
                  type="number"
                  value={currentEmployee.salary || 0} 
                  onChange={e => onInputChange('salary', parseFloat(e.target.value) || 0)}
                  placeholder="أدخل قيمة الراتب"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium flex items-center">
                  <Calendar className="ml-1 h-4 w-4" />
                  شهر الراتب
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={currentEmployee.salaryMonth || months[new Date().getMonth()]}
                    onValueChange={(value) => onInputChange('salaryMonth', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الشهر" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={currentEmployee.salaryYear?.toString() || currentYear.toString()}
                    onValueChange={(value) => onInputChange('salaryYear', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="السنة" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium flex items-center">
                  <Clock className="ml-1 h-4 w-4" />
                  حالة الراتب
                </label>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2 flex-row-reverse">
                    <Label htmlFor="salary-paid" className="ml-2 font-semibold text-green-600">
                      {currentEmployee.salaryPaid ? 'تم التسليم' : 'لم يتم التسليم'}
                    </Label>
                    <Switch
                      id="salary-paid"
                      checked={currentEmployee.salaryPaid || false}
                      onCheckedChange={(checked) => onInputChange('salaryPaid', checked)}
                    />
                  </div>
                  
                  {isEditing && currentEmployee.advances && currentEmployee.advances.length > 0 && (
                    <div className={cn(
                      "text-xs py-1 px-2 rounded-md",
                      currentEmployee.salaryPaid ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                    )}>
                      {currentEmployee.salaryPaid 
                        ? "سيتم تصفير جميع السلف بعد الحفظ إذا اخترت تسليم الراتب"
                        : `إجمالي السلف: ${currentEmployee.advances.reduce((sum, adv) => sum + adv.amount, 0).toFixed(2)} ج.م`}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">ملاحظات</label>
              <Textarea 
                value={currentEmployee.notes || ''} 
                onChange={e => onInputChange('notes', e.target.value)}
                placeholder="أدخل ملاحظات إضافية"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={onSubmit} 
                className="bg-dairy-700 hover:bg-dairy-800"
              >
                {isEditing ? (
                  <>
                    <Save className="ml-2 h-4 w-4" />
                    حفظ التغييرات
                  </>
                ) : (
                  <>
                    <UserPlus className="ml-2 h-4 w-4" />
                    إضافة موظف
                  </>
                )}
              </Button>
              
              {isEditing && (
                <Button variant="outline" onClick={onCancel}>
                  إلغاء
                </Button>
              )}
              
              {isEditing && (
                <Button variant="destructive" onClick={onCancel} className="mr-auto">
                  <Trash className="ml-2 h-4 w-4" />
                  إلغاء التعديل
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default EmployeeForm;
