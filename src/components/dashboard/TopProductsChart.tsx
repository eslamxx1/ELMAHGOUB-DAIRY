
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Product, SaleRecord } from '@/types';

interface TopProductsChartProps {
  products: Product[];
  salesRecords: SaleRecord[];
}

const TopProductsChart = ({ products, salesRecords }: TopProductsChartProps) => {
  const CHART_COLORS = ['#6190ea', '#33C3F0', '#D946EF', '#F97316', '#0EA5E9'];

  // تحسين حساب مبيعات المنتجات
  const productSalesCount = products.map(product => {
    let totalCount = 0;
    salesRecords.forEach(record => {
      const entry = record.entries.find(e => e.productId === product.id);
      if (entry && entry.net) {
        totalCount += entry.net;
      }
    });
    return {
      name: product.name,
      value: totalCount
    };
  }).filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <Card className="col-span-1 border border-dairy-100 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-dairy-50">
        <CardTitle className="font-cairo text-dairy-800">أكثر المنتجات مبيعاً</CardTitle>
        <CardDescription className="font-cairo text-dairy-600">
          توزيع المنتجات حسب الكمية المباعة
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {productSalesCount.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={productSalesCount}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                paddingAngle={2}
              >
                {productSalesCount.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Legend 
                formatter={(value) => <span className="font-cairo">{value}</span>}
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
              <Tooltip 
                formatter={(value) => [`${value} وحدة`, 'المبيعات']}
                contentStyle={{ fontFamily: 'Cairo', padding: '10px', borderRadius: '4px' }}
              />
            </PieChart>
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

export default TopProductsChart;
