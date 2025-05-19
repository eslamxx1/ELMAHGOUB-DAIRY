
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Route, SaleRecord } from '@/types';

interface RouteSalesChartProps {
  routes: Route[];
  salesRecords: SaleRecord[];
}

const RouteSalesChart = ({ routes, salesRecords }: RouteSalesChartProps) => {
  const CHART_COLORS = ['#6190ea', '#33C3F0', '#D946EF', '#F97316', '#0EA5E9'];

  const routeSalesData = routes.map(route => {
    const routeRecords = salesRecords.filter(record => record.routeId === route.id);
    const sales = routeRecords.reduce((sum, record) => sum + record.totalSales, 0);
    return {
      name: route.name,
      sales
    };
  }).sort((a, b) => b.sales - a.sales);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="font-cairo">المبيعات حسب خط السير</CardTitle>
        <CardDescription className="font-cairo">
          إجمالي المبيعات موزعة على خطوط السير المختلفة
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {routeSalesData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={routeSalesData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `${value} ج.م`}
                fontSize={12}
                fontFamily="Cairo"
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120}
                fontSize={12}
                fontFamily="Cairo"
              />
              <Tooltip 
                formatter={(value) => [`${value} ج.م`, 'المبيعات']}
                contentStyle={{ fontFamily: 'Cairo' }}
              />
              <Bar 
                dataKey="sales" 
                fill="#6190ea"
                radius={[0, 4, 4, 0]}
              >
                {routeSalesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground font-cairo">
            لا توجد بيانات مبيعات بعد
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteSalesChart;
