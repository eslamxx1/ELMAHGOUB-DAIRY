
import { useMemo } from 'react';
import { Product, SaleRecord } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';

interface ProductGrowthWidgetProps {
  products: Product[];
  salesRecords: SaleRecord[];
}

const ProductGrowthWidget = ({ products, salesRecords }: ProductGrowthWidgetProps) => {
  // حساب أكثر المنتجات نمواً في الأسابيع الأخيرة
  const productGrowthData = useMemo(() => {
    // حساب الفترة الزمنية (14 يوم)
    const today = new Date();
    const twoWeeksAgo = subDays(today, 14);
    const fourWeeksAgo = subDays(today, 28);
    
    // حساب مبيعات المنتجات في الفترتين
    const result = products.map(product => {
      // مبيعات آخر أسبوعين
      const recentSales = salesRecords
        .filter(record => parseISO(record.date) >= twoWeeksAgo)
        .reduce((sum, record) => {
          const entry = record.entries.find(e => e.productId === product.id);
          return sum + (entry?.net || 0);
        }, 0);
        
      // مبيعات الأسبوعين قبل الأخيرين
      const previousSales = salesRecords
        .filter(record => parseISO(record.date) >= fourWeeksAgo && parseISO(record.date) < twoWeeksAgo)
        .reduce((sum, record) => {
          const entry = record.entries.find(e => e.productId === product.id);
          return sum + (entry?.net || 0);
        }, 0);
      
      // حساب نسبة النمو
      const growthRate = previousSales === 0
        ? recentSales > 0 ? 100 : 0
        : ((recentSales - previousSales) / previousSales) * 100;
      
      return {
        id: product.id,
        name: product.name,
        recentSales,
        previousSales,
        growthRate,
        isGrowing: growthRate > 0
      };
    })
    .filter(p => p.recentSales > 0 || p.previousSales > 0) // إزالة المنتجات بدون مبيعات
    .sort((a, b) => Math.abs(b.growthRate) - Math.abs(a.growthRate)) // ترتيب حسب نسبة النمو المطلقة
    .slice(0, 5); // أخذ أعلى 5 منتجات نمواً أو انخفاضاً
    
    return result;
  }, [products, salesRecords]);

  // حساب إجمالي المبيعات الأسبوعية
  const weeklySalesData = useMemo(() => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = subDays(new Date(), i * 7 + 7);
      const weekEnd = subDays(new Date(), i * 7);
      
      const weekSales = salesRecords
        .filter(record => {
          const recordDate = parseISO(record.date);
          return recordDate >= weekStart && recordDate <= weekEnd;
        })
        .reduce((sum, record) => sum + (record.totalSales || 0), 0);
        
      weeks.push({
        week: i === 0 ? 'الأسبوع الحالي' : `قبل ${i} أسابيع`,
        sales: weekSales
      });
    }
    
    return weeks;
  }, [salesRecords]);
  
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-cairo">نمو المبيعات</CardTitle>
        <CardDescription>تحليل أداء المنتجات والنمو الأسبوعي</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-dairy-800 mb-3">أداء المنتجات (آخر 4 أسابيع)</h3>
            {productGrowthData && productGrowthData.length > 0 ? (
              <div className="space-y-3">
                {productGrowthData.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{product.name}</span>
                    <div className="flex items-center">
                      <span 
                        className={`text-sm font-semibold ${product.isGrowing ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {product.growthRate > 0 ? '+' : ''}{Math.round(product.growthRate)}%
                      </span>
                      {product.isGrowing ? 
                        <TrendingUp className="w-4 h-4 text-green-600 ml-1" /> : 
                        <TrendingDown className="w-4 h-4 text-red-600 ml-1" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                لا توجد بيانات كافية لتحليل نمو المنتجات
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-dairy-800 mb-3">المبيعات الأسبوعية</h3>
            <div className="space-y-3">
              {weeklySalesData.map((week, index) => (
                <div key={index} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{week.week}</span>
                    <span className="text-sm font-mono">{week.sales.toFixed(2)} ج.م</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-dairy-600 h-2.5 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (week.sales / Math.max(...weeklySalesData.map(w => w.sales))) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductGrowthWidget;
