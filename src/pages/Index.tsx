
import { useStore } from '@/context/StoreContext';
import { Users, Truck, Package, DollarSign, Calendar, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RouteSalesChart from '@/components/dashboard/RouteSalesChart';
import TopProductsChart from '@/components/dashboard/TopProductsChart';
import SystemSummary from '@/components/dashboard/SystemSummary';
import SalesAnalyticsChart from '@/components/dashboard/SalesAnalyticsChart';
import ProductGrowthWidget from '@/components/dashboard/ProductGrowthWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { products, routes, customers, employees, salesRecords } = useStore();

  // حساب إجمالي المبيعات والتوالف
  const totalSales = salesRecords.reduce((sum, record) => sum + (record.totalSales || 0), 0);
  const totalLosses = salesRecords.reduce((sum, record) => sum + (record.totalLosses || 0), 0);

  // حساب مبيعات الشهر الحالي
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthSales = salesRecords
    .filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    })
    .reduce((sum, record) => sum + (record.totalSales || 0), 0);

  // حساب مبيعات الشهر السابق
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const lastMonthSales = salesRecords
    .filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === lastMonth && recordDate.getFullYear() === lastMonthYear;
    })
    .reduce((sum, record) => sum + (record.totalSales || 0), 0);

  // حساب نسبة التغير في المبيعات
  const salesChange = lastMonthSales !== 0 
    ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100 
    : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-cairo">لوحة تحكم المحجوب لمنتجات الألبان</h1>
        <div className="bg-dairy-50 rounded-lg px-4 py-2 flex items-center gap-2 border border-dairy-100 mt-2 md:mt-0">
          <Calendar className="text-dairy-600" size={18} />
          <span className="text-sm text-dairy-700">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-dairy-50 to-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-cairo">ملخص الأداء</CardTitle>
          <CardDescription>نظرة عامة على أداء النظام والمبيعات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي المبيعات"
              value={`${totalSales.toFixed(2)} ج.م`}
              description={`يشمل ${salesRecords.length} عملية بيع`}
              icon={DollarSign}
              iconColor="text-green-600"
            />
            <StatCard
              title="العملاء"
              value={customers.length}
              description="عميل مسجل في النظام"
              icon={Users}
              iconColor="text-blue-600"
            />
            <StatCard
              title="خطوط السير"
              value={routes.length}
              description="خط توزيع نشط"
              icon={Truck}
              iconColor="text-amber-600"
            />
            <StatCard
              title="المنتجات"
              value={products.length}
              description="منتج في النظام"
              icon={Package}
              iconColor="text-purple-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* إضافة مكون تحليل المبيعات الجديد */}
      <SalesAnalyticsChart salesRecords={salesRecords} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-cairo">أداء المبيعات</CardTitle>
            <CardDescription>مقارنة بالشهر السابق</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">المبيعات الشهرية</span>
                  <span className={`text-sm flex items-center ${salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {salesChange >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {Math.abs(salesChange).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${salesChange >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(salesChange), 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الشهر الحالي</p>
                    <p className="text-2xl font-bold text-dairy-800">{currentMonthSales.toFixed(2)} ج.م</p>
                  </div>
                  <div className={`p-3 rounded-full ${salesChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">الشهر السابق</p>
                  <p className="text-lg font-medium">{lastMonthSales.toFixed(2)} ج.م</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-cairo">تحليل المبيعات</CardTitle>
            <CardDescription>مبيعات خطوط التوزيع</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <RouteSalesChart routes={routes} salesRecords={salesRecords} />
          </CardContent>
        </Card>
      </div>
      
      {/* إضافة مكون نمو المنتجات الجديد */}
      <ProductGrowthWidget products={products} salesRecords={salesRecords} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-cairo">أفضل المنتجات</CardTitle>
            <CardDescription>تحليل المنتجات الأكثر مبيعاً</CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsChart products={products} salesRecords={salesRecords} />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-cairo">ملخص الموظفين</CardTitle>
            <CardDescription>معلومات الموظفين والرواتب</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dairy-50 rounded-lg p-4 text-center">
                  <p className="text-dairy-800 font-medium">عدد الموظفين</p>
                  <p className="text-2xl font-bold text-dairy-700">{employees.length}</p>
                </div>
                <div className="bg-dairy-50 rounded-lg p-4 text-center">
                  <p className="text-dairy-800 font-medium">إجمالي الرواتب</p>
                  <p className="text-2xl font-bold text-dairy-700">
                    {employees.reduce((sum, emp) => sum + emp.salary, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">جنيه / شهرياً</p>
                </div>
              </div>
              
              <div className="bg-dairy-50 rounded-lg p-4">
                <h3 className="text-dairy-800 font-medium mb-2">إجمالي السلف</h3>
                <p className="text-xl font-bold text-dairy-700">
                  {employees.reduce((sum, emp) => sum + emp.advances.reduce((s, adv) => s + adv.amount, 0), 0).toFixed(2)} ج.م
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <SystemSummary
        totalSales={totalSales}
        totalLosses={totalLosses}
        employees={employees}
        customersCount={customers.length}
        routesCount={routes.length}
        productsCount={products.length}
      />
    </div>
  );
};

export default Dashboard;
