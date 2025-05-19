
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Product, SaleEntry } from '@/types';

interface ProductSalesTableProps {
  products: Product[];
  entries: SaleEntry[];
  showHistoricalData: boolean;
  onEntryChange: (index: number, field: keyof SaleEntry, value: number) => void;
}

export const ProductSalesTable = ({
  products,
  entries,
  showHistoricalData,
  onEntryChange,
}: ProductSalesTableProps) => {
  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <Table>
        <TableHeader className="bg-dairy-50">
          <TableRow>
            <TableHead className="font-cairo w-[20%] text-dairy-800">المنتج</TableHead>
            <TableHead className="font-cairo text-center text-dairy-800 w-[10%]">السعر</TableHead>
            <TableHead className="font-cairo text-center text-dairy-800 w-[15%]">العدد</TableHead>
            <TableHead className="font-cairo text-center text-dairy-800 w-[15%]">المرتجع</TableHead>
            <TableHead className="font-cairo text-center text-dairy-800 w-[15%]">التالف</TableHead>
            <TableHead className="font-cairo text-center text-dairy-800 w-[10%]">الصافي</TableHead>
            <TableHead className="font-cairo text-center text-dairy-800 w-[15%]">القيمة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const entry = entries[index];
            const count = entry?.count || 0;
            const returned = entry?.returned || 0;
            const damaged = entry?.damaged || 0;
            const net = entry?.net !== undefined ? entry.net : Math.max(0, count - returned - damaged);
            const value = entry?.saleValue !== undefined ? entry.saleValue : net * product.price;
            
            return (
              <TableRow key={product.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-dairy-50/20"}>
                <TableCell className="font-bold text-dairy-800 font-cairo py-3">
                  {product.name}
                </TableCell>
                
                <TableCell className="text-center text-dairy-600 font-cairo">
                  {product.price} ج.م
                </TableCell>
                
                <TableCell className="p-2">
                  <div className="flex items-center justify-center">
                    <Input 
                      type="number" 
                      min="0"
                      value={count === 0 ? '' : count}
                      onChange={e => onEntryChange(index, 'count', parseInt(e.target.value) || 0)}
                      disabled={showHistoricalData}
                      placeholder="0"
                      className="text-center h-9 font-cairo w-20 p-1 focus-visible:ring-dairy-400"
                    />
                  </div>
                </TableCell>
                
                <TableCell className="p-2">
                  <div className="flex items-center justify-center">
                    <Input 
                      type="number" 
                      min="0"
                      value={returned === 0 ? '' : returned}
                      onChange={e => onEntryChange(index, 'returned', parseInt(e.target.value) || 0)}
                      disabled={showHistoricalData}
                      placeholder="0"
                      className="text-center h-9 font-cairo w-20 p-1 focus-visible:ring-dairy-400"
                    />
                  </div>
                </TableCell>
                
                <TableCell className="p-2">
                  <div className="flex items-center justify-center">
                    <Input 
                      type="number" 
                      min="0"
                      value={damaged === 0 ? '' : damaged}
                      onChange={e => onEntryChange(index, 'damaged', parseInt(e.target.value) || 0)}
                      disabled={showHistoricalData}
                      placeholder="0"
                      className="text-center h-9 font-cairo w-20 p-1 focus-visible:ring-dairy-400"
                    />
                  </div>
                </TableCell>
                
                <TableCell className="text-center font-bold font-cairo text-dairy-700">
                  {net}
                </TableCell>
                
                <TableCell className="text-center font-bold text-green-600 font-cairo">
                  {value.toFixed(2)} ج.م
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
