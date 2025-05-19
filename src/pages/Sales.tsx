
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesForm } from '@/components/sales/SalesForm';
import { ProductSalesTable } from '@/components/sales/ProductSalesTable';
import { SalesActions } from '@/components/sales/SalesActions';
import { useSalesForm } from '@/hooks/useSalesForm';

const Sales = () => {
  const { products, routes, employees, addSaleRecord, salesRecords, syncAllData } = useStore();

  const {
    routeId,
    setRouteId,
    employeeId,
    setEmployeeId,
    saleDate,
    setSaleDate,
    entries,
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
  } = useSalesForm({ products, salesRecords, addSaleRecord, syncAllData });
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-cairo">تسجيل المبيعات</h1>
      
      <Card className="border border-dairy-100 shadow-md">
        <CardHeader className="bg-dairy-50 rounded-t-lg">
          <CardTitle className="font-cairo text-dairy-800 text-xl">بيانات البيع</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <SalesForm
            routes={routes}
            employees={employees}
            saleDate={saleDate}
            routeId={routeId}
            employeeId={employeeId}
            onDateChange={(date) => setSaleDate(date || new Date())}
            onRouteChange={setRouteId}
            onEmployeeChange={setEmployeeId}
            setShowHistoricalData={setShowHistoricalData}
          />

          <SalesActions
            showHistoricalData={showHistoricalData}
            totalSales={totalSales}
            totalLosses={totalLosses}
            hasDateAndRoute={!!saleDate && !!routeId}
            isSyncing={isSyncing}
            onCalculateTotals={calculateTotals}
            onLoadHistoricalData={loadHistoricalData}
            onSave={handleSave}
            onReset={resetForm}
            className="mb-6"
          />

          <ProductSalesTable
            products={products}
            entries={entries}
            showHistoricalData={showHistoricalData}
            onEntryChange={handleEntryChange}
          />

          <SalesActions
            showHistoricalData={showHistoricalData}
            totalSales={totalSales}
            totalLosses={totalLosses}
            hasDateAndRoute={!!saleDate && !!routeId}
            isSyncing={isSyncing}
            onCalculateTotals={calculateTotals}
            onLoadHistoricalData={loadHistoricalData}
            onSave={handleSave}
            onReset={resetForm}
            className="mt-6"
            showTopButtons={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
