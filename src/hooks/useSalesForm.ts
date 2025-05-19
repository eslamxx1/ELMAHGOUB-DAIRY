
import { useState, useCallback } from 'react';
import { Product, SaleEntry, SaleRecord } from '@/types';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';

interface UseSalesFormProps {
  products: Product[];
  salesRecords: SaleRecord[];
  addSaleRecord: (record: Omit<SaleRecord, 'id'>) => void;
  syncAllData: () => Promise<boolean>;
}

export const useSalesForm = ({ products, salesRecords, addSaleRecord, syncAllData }: UseSalesFormProps) => {
  const [routeId, setRouteId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<SaleEntry[]>(
    products.map(product => ({
      productId: product.id,
      count: undefined,
      returned: undefined,
      damaged: undefined
    }))
  );
  const [totalSales, setTotalSales] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);
  const [showHistoricalData, setShowHistoricalData] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleEntryChange = useCallback((index: number, field: keyof SaleEntry, value: number) => {
    setEntries(prev => {
      const newEntries = [...prev];
      newEntries[index] = { ...newEntries[index], [field]: value !== 0 ? value : undefined };
      return newEntries;
    });
  }, []);

  const calculateTotals = useCallback(() => {
    let salesTotal = 0;
    let lossesTotal = 0;
    
    const calculatedEntries = entries.map(entry => {
      const product = products.find(p => p.id === entry.productId);
      
      if (!product) return entry;
      
      const count = entry.count || 0;
      const returned = entry.returned || 0;
      const damaged = entry.damaged || 0;
      
      const net = Math.max(0, count - returned - damaged);
      const saleValue = net * product.price;
      const lossValue = damaged * product.price;
      
      salesTotal += saleValue;
      lossesTotal += lossValue;
      
      return {
        ...entry,
        net,
        price: product.price,
        saleValue,
        lossValue
      };
    });
    
    setEntries(calculatedEntries);
    setTotalSales(salesTotal);
    setTotalLosses(lossesTotal);
  }, [entries, products]);

  const resetForm = useCallback(() => {
    setEntries(
      products.map(product => ({
        productId: product.id,
        count: undefined,
        returned: undefined,
        damaged: undefined
      }))
    );
    setTotalSales(0);
    setTotalLosses(0);
  }, [products]);

  const getSalesForDateAndRoute = useCallback(() => {
    if (!saleDate || !routeId) return null;
    
    const formattedDate = format(saleDate, 'yyyy-MM-dd');
    return salesRecords.find(
      record => record.date === formattedDate && record.routeId === routeId
    );
  }, [saleDate, routeId, salesRecords]);

  const loadHistoricalData = useCallback(() => {
    const record = getSalesForDateAndRoute();
    
    if (record && record.entries) {
      // Initialize empty entries for all products
      const initialEntries = products.map(product => ({
        productId: product.id,
        count: undefined,
        returned: undefined,
        damaged: undefined
      }));
      
      // Update with historical data
      const updatedEntries = initialEntries.map(entry => {
        const historicalEntry = record.entries?.find(e => e.productId === entry.productId);
        return historicalEntry || entry;
      });
      
      setEntries(updatedEntries);
      setTotalSales(record.totalSales || 0);
      setTotalLosses(record.totalLosses || 0);
      setShowHistoricalData(true);
      toast.info('تم تحميل بيانات المبيعات السابقة');
    } else {
      resetForm();
      setShowHistoricalData(false);
      toast.info('لا توجد بيانات مبيعات لهذا التاريخ وخط السير');
    }
  }, [getSalesForDateAndRoute, products, resetForm]);

  const handleSave = useCallback(async () => {
    if (!routeId) {
      toast.error('يرجى اختيار خط السير أولاً');
      return;
    }

    const formattedDate = format(saleDate, 'yyyy-MM-dd');
    
    // Check if a record already exists for this date and route
    const existingRecord = salesRecords.find(
      record => record.date === formattedDate && record.routeId === routeId
    );
    
    if (existingRecord) {
      toast.warning('يوجد بالفعل سجل مبيعات لهذا التاريخ وخط السير. يرجى تعديل التاريخ أو اختيار خط سير آخر');
      return;
    }
    
    // Create SaleItem[] from SaleEntry[]
    const items = entries
      .filter(entry => entry.count && entry.count > 0)
      .map(entry => {
        const product = products.find(p => p.id === entry.productId);
        return {
          productId: entry.productId,
          quantity: (entry.count || 0) - (entry.returned || 0) - (entry.damaged || 0),
          price: product?.price || 0
        };
      });
    
    // Calculate total price as sum of all product prices
    const totalPrice = entries.reduce((sum, entry) => {
      const product = products.find(p => p.id === entry.productId);
      if (!product) return sum;
      
      const count = entry.count || 0;
      const returned = entry.returned || 0;
      const damaged = entry.damaged || 0;
      
      const net = Math.max(0, count - returned - damaged);
      return sum + (net * product.price);
    }, 0);
    
    addSaleRecord({
      date: formattedDate,
      routeId,
      employeeId,
      totalPrice,
      items,
      totalSales,
      totalLosses,
      entries
    });
    
    toast.success('تم حفظ بيانات المبيعات بنجاح');
    
    // مزامنة البيانات مع قاعدة البيانات بعد الحفظ
    try {
      setIsSyncing(true);
      await syncAllData();
      toast.success('تم مزامنة البيانات مع قاعدة البيانات');
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('حدث خطأ أثناء مزامنة البيانات');
    } finally {
      setIsSyncing(false);
    }
    
    resetForm();
  }, [routeId, saleDate, employeeId, entries, salesRecords, products, totalSales, totalLosses, addSaleRecord, syncAllData, resetForm]);

  return {
    routeId,
    setRouteId,
    employeeId,
    setEmployeeId,
    saleDate,
    setSaleDate,
    entries,
    setEntries,
    totalSales,
    totalLosses,
    showHistoricalData,
    setShowHistoricalData,
    isSyncing,
    handleEntryChange,
    calculateTotals,
    resetForm,
    loadHistoricalData,
    handleSave
  };
};
