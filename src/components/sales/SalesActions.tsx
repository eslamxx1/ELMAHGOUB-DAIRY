
import { Button } from '@/components/ui/button';
import { Calculator, Save, RotateCcw, Search, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SalesActionsProps {
  showHistoricalData: boolean;
  totalSales: number;
  totalLosses: number;
  hasDateAndRoute: boolean;
  isSyncing: boolean;
  onCalculateTotals: () => void;
  onLoadHistoricalData: () => void;
  onSave: () => void;
  onReset: () => void;
  className?: string;
  showTopButtons?: boolean;
}

export const SalesActions = ({
  showHistoricalData,
  totalSales,
  totalLosses,
  hasDateAndRoute,
  isSyncing,
  onCalculateTotals,
  onLoadHistoricalData,
  onSave,
  onReset,
  className,
  showTopButtons = true
}: SalesActionsProps) => {
  return (
    <div className={cn("", className)}>
      {showTopButtons && (
        <div className="flex justify-between mb-6">
          <Button 
            onClick={onCalculateTotals} 
            className="bg-dairy-700 hover:bg-dairy-800 font-cairo gap-2"
            disabled={showHistoricalData}
          >
            <Calculator className="h-4 w-4" />
            احسب الإجمالي
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onLoadHistoricalData}
            disabled={!hasDateAndRoute}
            className="font-cairo gap-2"
          >
            <Search className="h-4 w-4" />
            عرض بيانات هذا اليوم
          </Button>
        </div>
      )}

      {showHistoricalData && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-md">
          <p className="font-medium text-yellow-800 font-cairo">
            أنت تعرض بيانات مبيعات مسجلة سابقاً. يمكنك إجراء إدخالات جديدة باختيار تاريخ أو خط سير مختلف.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={onSave} 
            className="bg-green-600 hover:bg-green-700 font-cairo gap-2"
            disabled={showHistoricalData || totalSales === 0 || isSyncing}
          >
            <Save className="h-4 w-4" />
            {isSyncing ? 'جاري الحفظ...' : 'حفظ البيانات'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onReset}
            disabled={showHistoricalData}
            className="font-cairo gap-2 border-dairy-200 text-dairy-700 hover:bg-dairy-50"
          >
            <RotateCcw className="h-4 w-4" />
            مسح الخانات
          </Button>
          <Button 
            variant="outline" 
            className="font-cairo gap-2 border-dairy-200 text-dairy-700 hover:bg-dairy-50"
          >
            <FileText className="h-4 w-4" />
            طباعة
          </Button>
        </div>
        
        <div className="bg-dairy-50 p-4 rounded-lg border border-dairy-100 shadow-inner">
          <div className="text-xl font-cairo flex flex-col md:flex-row justify-between">
            <div className="mb-2 md:mb-0">
              <span className="font-cairo">إجمالي المبيعات: </span>
              <span className="font-bold text-green-600 font-cairo">{totalSales.toFixed(2)} ج.م</span>
            </div>
            <div>
              <span className="font-cairo">إجمالي التوالف: </span>
              <span className="font-bold text-red-600 font-cairo">{totalLosses.toFixed(2)} ج.م</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
