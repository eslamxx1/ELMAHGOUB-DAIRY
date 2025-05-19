
import { useState, useMemo } from 'react';
import { SaleRecord } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ComposedChart, Area } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format, parseISO, subMonths, startOfMonth, endOfMonth, isBefore, isAfter, subDays, isSameMonth } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

interface SalesAnalyticsChartProps {
  salesRecords: SaleRecord[];
}

const SalesAnalyticsChart = ({ salesRecords }: SalesAnalyticsChartProps) => {
  const [timeRange, setTimeRange] = useState('6');
  const [chartType, setChartType] = useState('line');
  
  // إنشاء بيانات المبيعات الشهرية
  const monthlySalesData = useMemo(() => {
    // تاريخ اليوم
    const today = new Date();
    
    // حساب كم شهر نحتاج للعرض
    const monthsToShow = parseInt(timeRange);
    
    // إنشاء مجموعة من الأشهر حتى العدد المطلوب
    const months = Array.from({ length: monthsToShow }, (_, i) => {
      const date = subMonths(today, i);
      return {
        month: format(date, 'yyyy-MM'),
        label: format(date, 'MMM yyyy', { locale: ar }),
        startDate: startOfMonth(date),
        endDate: endOfMonth(date)
      };
    }).reverse(); // عكس الترتيب ليكون من الأقدم للأحدث
    
    // حساب إجمالي المبيعات لكل شهر
    return months.map(monthData => {
      // تجميع السجلات الخاصة بهذا الشهر
      const monthRecords = salesRecords.filter(record => {
        const recordDate = parseISO(record.date);
        return isAfter(recordDate, monthData.startDate) && isBefore(recordDate, monthData.endDate);
      });
      
      // حساب المبيعات والتوالف
      const sales = monthRecords.reduce((sum, record) => sum + (record.totalSales || 0), 0);
      const losses = monthRecords.reduce((sum, record) => sum + (record.totalLosses || 0), 0);
      const count = monthRecords.length;
      
      return {
        name: monthData.label,
        month: monthData.month,
        sales,
        losses,
        count,
        net: sales - losses
      };
    });
  }, [salesRecords, timeRange]);

  // إنشاء بيانات المبيعات الأسبوعية
  const weeklySalesData = useMemo(() => {
    // تاريخ اليوم
    const today = new Date();
    const days = parseInt(timeRange) * 7; // عدد الأيام بناءً على عدد الأسابيع
    
    // تقسيم البيانات إلى أسابيع
    const weeks = [];
    for (let i = 0; i < days; i += 7) {
      const endDate = subDays(today, i);
      const startDate = subDays(endDate, 6);
      
      const weekRecords = salesRecords.filter(record => {
        const recordDate = parseISO(record.date);
        return isAfter(recordDate, startDate) && isBefore(recordDate, endDate);
      });
      
      const sales = weekRecords.reduce((sum, record) => sum + (record.totalSales || 0), 0);
      const losses = weekRecords.reduce((sum, record) => sum + (record.totalLosses || 0), 0);
      
      weeks.push({
        name: `${format(startDate, 'dd/MM')} - ${format(endDate, 'dd/MM')}`,
        sales,
        losses,
        net: sales - losses
      });
    }
    
    return weeks.reverse();
  }, [salesRecords, timeRange]);
  
  // حساب نسبة النمو
  const getMonthlyGrowth = () => {
    if (monthlySalesData.length < 2) return { percentage: 0, isPositive: true };
    
    const currentMonth = monthlySalesData[monthlySalesData.length - 1].sales;
    const previousMonth = monthlySalesData[monthlySalesData.length - 2].sales;
    
    if (previousMonth === 0) return { percentage: currentMonth > 0 ? 100 : 0, isPositive: currentMonth > 0 };
    
    const growthPercentage = ((currentMonth - previousMonth) / previousMonth) * 100;
    return {
      percentage: Math.abs(growthPercentage),
      isPositive: growthPercentage >= 0
    };
  };
  
  // حساب إجمالي المبيعات والمتوسط
  const calculateSalesSummary = () => {
    if (monthlySalesData.length === 0) return { total: 0, average: 0 };
    
    const total = monthlySalesData.reduce((sum, month) => sum + month.sales, 0);
    const average = total / monthlySalesData.length;
    
    return { total, average };
  };
  
  const growth = getMonthlyGrowth();
  const { total: totalSales, average: averageSales } = calculateSalesSummary();

  const getBestSellingMonth = () => {
    if (monthlySalesData.length === 0) return null;
    
    let bestMonth = monthlySalesData[0];
    for (const month of monthlySalesData) {
      if (month.sales > bestMonth.sales) {
        bestMonth = month;
      }
    }
    
    return bestMonth;
  };
  
  const bestMonth = getBestSellingMonth();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-xl font-cairo">تحليل اتجاهات المبيعات</CardTitle>
          <CardDescription>تطور المبيعات على مدار الوقت</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="المدة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 أشهر</SelectItem>
              <SelectItem value="6">6 أشهر</SelectItem>
              <SelectItem value="12">12 شهر</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 font-cairo">
            <TabsTrigger value="monthly">عرض شهري</TabsTrigger>
            <TabsTrigger value="weekly">عرض أسبوعي</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="col-span-1 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm text-muted-foreground font-medium font-cairo">النمو الشهري</h3>
                <div className="flex items-center mt-1">
                  <span className={`text-2xl font-bold font-cairo ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {growth.percentage.toFixed(1)}%
                  </span>
                  <span className={`ms-1 ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {growth.isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-cairo">
                  مقارنة بالشهر السابق
                </p>
              </div>
              
              <div className="col-span-1 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm text-muted-foreground font-medium font-cairo">متوسط المبيعات الشهري</h3>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold text-dairy-600 font-cairo">{averageSales.toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-cairo">
                  خلال {timeRange} أشهر الماضية
                </p>
              </div>
              
              <div className="col-span-1 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm text-muted-foreground font-medium font-cairo">أفضل شهر للمبيعات</h3>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold text-green-600 font-cairo">
                    {bestMonth?.name || '-'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-cairo">
                  {bestMonth ? `بمبيعات ${bestMonth.sales.toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م` : 'لا توجد بيانات كافية'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="bg-white rounded-lg p-2 mb-4">
                <Tabs defaultValue="line">
                  <TabsList className="mb-2">
                    <TabsTrigger value="line" onClick={() => setChartType('line')} className="font-cairo">
                      <LineChartIcon className="w-4 h-4 mr-1" /> رسم بياني خطي
                    </TabsTrigger>
                    <TabsTrigger value="bar" onClick={() => setChartType('bar')} className="font-cairo">
                      <BarChart3 className="w-4 h-4 mr-1" /> رسم بياني شريطي
                    </TabsTrigger>
                  </TabsList>
                
                  <TabsContent value="line">
                    <div className="h-[350px]">
                      {monthlySalesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={monthlySalesData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="name" 
                              fontSize={12}
                              fontFamily="Cairo" 
                            />
                            <YAxis 
                              tickFormatter={(value) => `${value} ج.م`}
                              fontSize={12}
                              fontFamily="Cairo"
                            />
                            <Tooltip 
                              formatter={(value) => [`${Number(value).toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م`, '']}
                              labelFormatter={(label) => `شهر: ${label}`}
                              contentStyle={{ fontFamily: 'Cairo', direction: 'rtl' }}
                            />
                            <Legend 
                              formatter={(value) => (
                                <span style={{ fontFamily: 'Cairo', fontSize: '12px', color: '#666' }}>
                                  {value === 'sales' ? 'المبيعات' : value === 'losses' ? 'التوالف' : 'صافي الربح'}
                                </span>
                              )}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="sales" 
                              fill="rgba(97, 144, 234, 0.2)"
                              stroke="#6190ea" 
                              strokeWidth={2}
                              name="sales"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="losses" 
                              stroke="#f97316" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              name="losses"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="net" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={{ r: 4, fill: "#10b981", stroke: '#fff', strokeWidth: 1 }}
                              activeDot={{ r: 6 }}
                              name="net"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground font-cairo">
                          لا توجد بيانات مبيعات كافية لعرض الرسم البياني
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="bar">
                    <div className="h-[350px]">
                      {monthlySalesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={monthlySalesData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="name" 
                              fontSize={12}
                              fontFamily="Cairo" 
                            />
                            <YAxis 
                              tickFormatter={(value) => `${value} ج.م`}
                              fontSize={12}
                              fontFamily="Cairo"
                            />
                            <Tooltip 
                              formatter={(value) => [`${Number(value).toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م`, '']}
                              labelFormatter={(label) => `شهر: ${label}`}
                              contentStyle={{ fontFamily: 'Cairo', direction: 'rtl' }}
                            />
                            <Legend 
                              formatter={(value) => (
                                <span style={{ fontFamily: 'Cairo', fontSize: '12px', color: '#666' }}>
                                  {value === 'sales' ? 'المبيعات' : value === 'losses' ? 'التوالف' : 'صافي الربح'}
                                </span>
                              )}
                            />
                            <Bar dataKey="sales" fill="#6190ea" name="sales" />
                            <Bar dataKey="losses" fill="#f97316" name="losses" />
                            <Bar dataKey="net" fill="#10b981" name="net" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground font-cairo">
                          لا توجد بيانات مبيعات كافية لعرض الرسم البياني
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <div className="h-[350px]">
              {weeklySalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={weeklySalesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={12}
                      fontFamily="Cairo" 
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value} ج.م`}
                      fontSize={12}
                      fontFamily="Cairo"
                    />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م`, '']}
                      labelFormatter={(label) => `أسبوع: ${label}`}
                      contentStyle={{ fontFamily: 'Cairo', direction: 'rtl' }}
                    />
                    <Legend 
                      formatter={(value) => (
                        <span style={{ fontFamily: 'Cairo', fontSize: '12px', color: '#666' }}>
                          {value === 'sales' ? 'المبيعات' : value === 'losses' ? 'التوالف' : 'صافي الربح'}
                        </span>
                      )}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      fill="rgba(97, 144, 234, 0.2)"
                      stroke="#6190ea" 
                      strokeWidth={2}
                      name="sales"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="losses" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="losses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#10b981", stroke: '#fff', strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                      name="net"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground font-cairo">
                  لا توجد بيانات مبيعات كافية لعرض الرسم البياني
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SalesAnalyticsChart;
