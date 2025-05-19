
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee } from '@/types';

interface SystemSummaryProps {
  totalSales: number;
  totalLosses: number;
  employees: Employee[];
  customersCount: number;
  routesCount: number;
  productsCount: number;
}

const SystemSummary = ({ 
  totalSales, 
  totalLosses, 
  employees, 
  customersCount, 
  routesCount, 
  productsCount 
}: SystemSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ملخص النظام</CardTitle>
        <CardDescription>
          نظرة عامة على حالة النظام والبيانات المسجلة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dairy-50 rounded-lg p-4">
              <h3 className="text-dairy-800 font-medium mb-2">المبيعات والتوالف</h3>
              <p className="text-sm">إجمالي المبيعات: <span className="font-bold text-green-600">{totalSales.toFixed(2)} ج.م</span></p>
              <p className="text-sm">إجمالي التوالف: <span className="font-bold text-red-600">{totalLosses.toFixed(2)} ج.م</span></p>
              <p className="text-sm">نسبة التوالف: <span className="font-bold text-dairy-700">
                {totalSales > 0 ? ((totalLosses / totalSales) * 100).toFixed(1) : 0}%
              </span></p>
            </div>
            
            <div className="bg-dairy-50 rounded-lg p-4">
              <h3 className="text-dairy-800 font-medium mb-2">الموظفين</h3>
              <p className="text-sm">عدد الموظفين: <span className="font-bold text-dairy-700">{employees.length}</span></p>
              <p className="text-sm">إجمالي الرواتب: <span className="font-bold text-dairy-700">
                {employees.reduce((sum, emp) => sum + emp.salary, 0).toFixed(2)} ج.م / شهرياً
              </span></p>
              <p className="text-sm">إجمالي السلف: <span className="font-bold text-dairy-700">
                {employees.reduce((sum, emp) => sum + emp.advances.reduce((s, adv) => s + adv.amount, 0), 0).toFixed(2)} ج.م
              </span></p>
            </div>
            
            <div className="bg-dairy-50 rounded-lg p-4">
              <h3 className="text-dairy-800 font-medium mb-2">العمليات</h3>
              <p className="text-sm">عدد العملاء: <span className="font-bold text-dairy-700">{customersCount}</span></p>
              <p className="text-sm">عدد خطوط السير: <span className="font-bold text-dairy-700">{routesCount}</span></p>
              <p className="text-sm">عدد المنتجات: <span className="font-bold text-dairy-700">{productsCount}</span></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSummary;
