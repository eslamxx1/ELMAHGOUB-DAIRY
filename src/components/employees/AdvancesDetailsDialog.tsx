
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Employee, Advance } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isValid, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Printer } from "lucide-react";
import { useRef } from "react";
import { Separator } from "@/components/ui/separator";

interface AdvancesDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

const AdvancesDetailsDialog = ({
  open,
  onOpenChange,
  employee,
}: AdvancesDetailsDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  if (!employee) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'dd/MM/yyyy', { locale: ar });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }
    return dateString;
  };

  const totalAdvances = employee.advances.reduce(
    (sum, advance) => sum + advance.amount,
    0
  );

  const printContent = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    
    if (printWindow && contentRef.current) {
      printWindow.document.write('<html><head><title>تفاصيل السلف</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
        h2 { color: #333; text-align: center; margin-bottom: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .advance-item { background-color: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .advance-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .amount { font-weight: bold; font-size: 16px; }
        .date { color: #666; }
        .notes { font-size: 14px; color: #555; margin-top: 10px; border-top: 1px dashed #ddd; padding-top: 10px; }
      `);
      printWindow.document.write('</style></head><body>');
      
      printWindow.document.write(`<h2>تفاصيل السلف - ${employee.name}</h2>`);
      printWindow.document.write(`
        <div class="info-row"><span>كود الموظف:</span><span>${employee.code}</span></div>
        <div class="info-row"><span>هاتف:</span><span>${employee.phone}</span></div>
        <div class="info-row"><span>الراتب الشهري:</span><span>${employee.salary.toFixed(2)} ج.م</span></div>
        <div class="info-row"><span>إجمالي السلف:</span><span>${totalAdvances.toFixed(2)} ج.م</span></div>
        <div class="info-row"><span>المتبقي:</span><span>${(employee.salary - totalAdvances).toFixed(2)} ج.م</span></div>
      `);
      
      printWindow.document.write('<h3>سجل السلف:</h3>');
      
      if (employee.advances.length === 0) {
        printWindow.document.write('<p style="text-align:center; color:#666">لا يوجد سلف مسجلة</p>');
      } else {
        // Sort advances by date in descending order
        const sortedAdvances = [...employee.advances].sort((a, b) => {
          try {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          } catch {
            return 0;
          }
        });
        
        sortedAdvances.forEach((advance, index) => {
          printWindow.document.write(`
            <div class="advance-item">
              <div class="advance-header">
                <span class="amount">${advance.amount.toFixed(2)} ج.م</span>
                <span class="date">${formatDate(advance.date)}</span>
              </div>
              ${advance.notes ? `<div class="notes">${advance.notes}</div>` : ''}
            </div>
          `);
        });
      }
      
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            تفاصيل السلف - {employee.name}
          </DialogTitle>
          <DialogDescription>
            سجل السلف التي حصل عليها الموظف
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4" ref={contentRef}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">كود الموظف:</label>
              <p className="font-medium">{employee.code}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">رقم الهاتف:</label>
              <p className="font-medium">{employee.phone || 'غير مسجل'}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span>إجمالي الراتب:</span>
            <Badge variant="secondary" className="text-md">
              {employee.salary.toFixed(2)} ج.م
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span>إجمالي السلف:</span>
            <Badge variant="destructive" className="text-md">
              {totalAdvances.toFixed(2)} ج.م
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span>المتبقي:</span>
            <Badge
              variant={
                employee.salary - totalAdvances >= 0 ? "secondary" : "destructive"
              }
              className="text-md"
            >
              {(employee.salary - totalAdvances).toFixed(2)} ج.م
            </Badge>
          </div>
          
          <Separator />

          <h3 className="font-semibold text-lg">سجل السلف:</h3>

          <ScrollArea className="h-[250px] rounded-md border p-4">
            {employee.advances.length === 0 ? (
              <div className="text-center text-muted-foreground">
                لا يوجد سلف مسجلة حتى الآن
              </div>
            ) : (
              <div className="space-y-3">
                {/* Sort the advances by date in descending order */}
                {[...employee.advances]
                  .sort((a, b) => {
                    try {
                      return new Date(b.date).getTime() - new Date(a.date).getTime();
                    } catch {
                      return 0;
                    }
                  })
                  .map((advance, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-md bg-gray-50"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">المبلغ:</span>
                        <span className="font-bold">{advance.amount.toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>التاريخ:</span>
                        <span dir="ltr">{formatDate(advance.date)}</span>
                      </div>
                      {advance.notes && (
                        <div className="mt-2 text-sm border-t pt-2">
                          <p className="text-muted-foreground">{advance.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={printContent} className="flex items-center gap-1">
              <Printer size={16} />
              طباعة التفاصيل
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancesDetailsDialog;
