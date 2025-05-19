
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { SaleRecord, Product, Route, Customer, Employee, SaleItem, Advance } from '@/types';

// Interfaces for Supabase tables structure
interface SupabaseSaleRecord {
  id: string;
  date: string;
  product: string;
  route: string;
  quantity: number;
  unit_price: number;
  returned?: number;
  damaged?: number;
}

interface SupabaseProduct {
  id: string;
  name: string;
  price: number;
}

interface SupabaseRoute {
  id: string;
  name: string;
}

interface SupabaseCustomer {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  address: string | null;
  route_id: string | null;
  notes: string | null;
}

interface SupabaseEmployee {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  salary: number;
  notes: string | null;
  salary_month: string | null;
  salary_year: number | null;
  salary_paid: boolean | null;
}

interface SupabaseAdvance {
  id?: string;
  employee_id: string;
  date: string;
  amount: number;
  notes: string | null;
}

// Generic sync result type
interface SyncResult {
  success: boolean;
  syncedCount: number;
  errorCount: number;
}

export class SupabaseSyncService {
  /**
   * تحقق من حالة الاتصال بقاعدة البيانات
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('sales').select('count');
      if (error) {
        console.error('خطأ في الاتصال بقاعدة البيانات:', error);
        return false;
      }
      
      console.log('تم الاتصال بقاعدة البيانات بنجاح');
      return true;
    } catch (error) {
      console.error('فشل في الاتصال بقاعدة البيانات:', error);
      return false;
    }
  }

  /**
   * مزامنة المنتجات مع قاعدة بيانات Supabase
   */
  static async syncProducts(products: Product[]): Promise<SyncResult> {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        return { success: false, syncedCount: 0, errorCount: 0 };
      }

      let successCount = 0;
      let errorCount = 0;
      
      // تحويل المنتجات إلى تنسيق Supabase
      const supabaseProducts: SupabaseProduct[] = products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price
      }));
      
      // مزامنة البيانات على دفعات
      const BATCH_SIZE = 100;
      
      for (let i = 0; i < supabaseProducts.length; i += BATCH_SIZE) {
        const batch = supabaseProducts.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
          .from('products')
          .upsert(batch, { onConflict: 'id' });
          
        if (error) {
          console.error(`خطأ في مزامنة المنتجات (دفعة ${i / BATCH_SIZE + 1}):`, error);
          console.error("تفاصيل الخطأ:", error.message);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }
      
      return { 
        success: errorCount === 0, 
        syncedCount: successCount, 
        errorCount 
      };
    } catch (error) {
      console.error("خطأ في مزامنة المنتجات:", error);
      return { success: false, syncedCount: 0, errorCount: products.length };
    }
  }

  /**
   * مزامنة المسارات مع قاعدة بيانات Supabase
   */
  static async syncRoutes(routes: Route[]): Promise<SyncResult> {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        return { success: false, syncedCount: 0, errorCount: 0 };
      }

      let successCount = 0;
      let errorCount = 0;
      
      // تحويل المسارات إلى تنسيق Supabase
      const supabaseRoutes: SupabaseRoute[] = routes.map(route => ({
        id: route.id,
        name: route.name
      }));
      
      // مزامنة البيانات على دفعات
      const BATCH_SIZE = 100;
      
      for (let i = 0; i < supabaseRoutes.length; i += BATCH_SIZE) {
        const batch = supabaseRoutes.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
          .from('routes')
          .upsert(batch, { onConflict: 'id' });
          
        if (error) {
          console.error(`خطأ في مزامنة المسارات (دفعة ${i / BATCH_SIZE + 1}):`, error);
          console.error("تفاصيل الخطأ:", error.message);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }
      
      return { 
        success: errorCount === 0, 
        syncedCount: successCount, 
        errorCount 
      };
    } catch (error) {
      console.error("خطأ في مزامنة المسارات:", error);
      return { success: false, syncedCount: 0, errorCount: routes.length };
    }
  }

  /**
   * مزامنة العملاء مع قاعدة بيانات Supabase
   */
  static async syncCustomers(customers: Customer[]): Promise<SyncResult> {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        return { success: false, syncedCount: 0, errorCount: 0 };
      }

      let successCount = 0;
      let errorCount = 0;
      
      // تحويل العملاء إلى تنسيق Supabase
      const supabaseCustomers: SupabaseCustomer[] = customers.map(customer => ({
        id: customer.id,
        code: customer.code,
        name: customer.name,
        phone: customer.phone || null,
        address: customer.address || null,
        route_id: customer.routeId || null,
        notes: customer.notes || null
      }));
      
      // مزامنة البيانات على دفعات
      const BATCH_SIZE = 100;
      
      for (let i = 0; i < supabaseCustomers.length; i += BATCH_SIZE) {
        const batch = supabaseCustomers.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
          .from('customers')
          .upsert(batch, { onConflict: 'id' });
          
        if (error) {
          console.error(`خطأ في مزامنة العملاء (دفعة ${i / BATCH_SIZE + 1}):`, error);
          console.error("تفاصيل الخطأ:", error.message);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }
      
      return { 
        success: errorCount === 0, 
        syncedCount: successCount, 
        errorCount 
      };
    } catch (error) {
      console.error("خطأ في مزامنة العملاء:", error);
      return { success: false, syncedCount: 0, errorCount: customers.length };
    }
  }

  /**
   * مزامنة الموظفين وسلفهم مع قاعدة بيانات Supabase
   */
  static async syncEmployees(employees: Employee[]): Promise<SyncResult> {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        return { success: false, syncedCount: 0, errorCount: 0 };
      }

      let employeeSuccessCount = 0;
      let employeeErrorCount = 0;
      let advanceSuccessCount = 0;
      let advanceErrorCount = 0;
      
      // تحويل الموظفين إلى تنسيق Supabase
      const supabaseEmployees: SupabaseEmployee[] = employees.map(employee => ({
        id: employee.id,
        code: employee.code,
        name: employee.name,
        phone: employee.phone || null,
        salary: employee.salary,
        notes: employee.notes || null,
        salary_month: employee.salaryMonth || null,
        salary_year: employee.salaryYear || null,
        salary_paid: employee.salaryPaid || null
      }));
      
      // جمع جميع السلف من جميع الموظفين
      const allAdvances: SupabaseAdvance[] = [];
      employees.forEach(employee => {
        if (employee.advances && employee.advances.length > 0) {
          const employeeAdvances = employee.advances.map(advance => ({
            employee_id: employee.id,
            date: advance.date,
            amount: advance.amount,
            notes: advance.notes || null
          }));
          allAdvances.push(...employeeAdvances);
        }
      });
      
      // مزامنة بيانات الموظفين على دفعات
      const BATCH_SIZE = 100;
      
      for (let i = 0; i < supabaseEmployees.length; i += BATCH_SIZE) {
        const batch = supabaseEmployees.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
          .from('employees')
          .upsert(batch, { onConflict: 'id' });
          
        if (error) {
          console.error(`خطأ في مزامنة الموظفين (دفعة ${i / BATCH_SIZE + 1}):`, error);
          console.error("تفاصيل الخطأ:", error.message);
          employeeErrorCount += batch.length;
        } else {
          employeeSuccessCount += batch.length;
        }
      }
      
      // مزامنة السلف على دفعات
      // بالنسبة للسلف، لا يمكننا استخدام upsert لأننا لا نملك معرفات فريدة محلياً
      // لذلك سنحذف السلف القديمة ثم نضيف الجديدة
      
      // حذف جميع السلف الحالية (سيتم إضافتها مرة أخرى)
      for (const employee of employees) {
        if (employee.advances && employee.advances.length > 0) {
          const { error } = await supabase
            .from('employee_advances')
            .delete()
            .eq('employee_id', employee.id);
            
          if (error) {
            console.error(`خطأ في حذف سلف الموظف ${employee.name}:`, error);
          }
        }
      }
      
      // إضافة السلف الجديدة
      for (let i = 0; i < allAdvances.length; i += BATCH_SIZE) {
        const batch = allAdvances.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
          .from('employee_advances')
          .insert(batch);
          
        if (error) {
          console.error(`خطأ في مزامنة السلف (دفعة ${i / BATCH_SIZE + 1}):`, error);
          console.error("تفاصيل الخطأ:", error.message);
          advanceErrorCount += batch.length;
        } else {
          advanceSuccessCount += batch.length;
        }
      }
      
      return { 
        success: employeeErrorCount === 0 && advanceErrorCount === 0, 
        syncedCount: employeeSuccessCount + advanceSuccessCount, 
        errorCount: employeeErrorCount + advanceErrorCount
      };
    } catch (error) {
      console.error("خطأ في مزامنة الموظفين:", error);
      return { success: false, syncedCount: 0, errorCount: employees.length };
    }
  }

  /**
   * تحويل سجل مبيعات من النموذج الداخلي إلى نموذج قاعدة البيانات مع معرف UUID صحيح
   */
  private static transformSaleToSupabaseFormat(
    sale: SaleRecord,
    productsMap: Map<string, Product>,
    routesMap: Map<string, Route>
  ): SupabaseSaleRecord[] {
    // تحويل كل عنصر في السجل إلى سجل منفصل في قاعدة البيانات
    return sale.items.map(item => {
      const product = productsMap.get(item.productId);
      const route = routesMap.get(sale.routeId);
      
      if (!product || !route) {
        console.warn(`Missing product (${item.productId}) or route (${sale.routeId}) for sale ${sale.id}`);
        return null;
      }
      
      // حساب الكمية الصافية والتالف والمرتجع من الصفقة إذا كانت موجودة
      let returned = 0;
      let damaged = 0;
      
      // إذا كان هناك إدخالات إضافية، استخدمها لاستخراج البيانات الإضافية
      if (sale.entries) {
        const entry = sale.entries.find(e => e.productId === item.productId);
        if (entry) {
          returned = entry.returned || 0;
          damaged = entry.damaged || 0;
        }
      }
      
      // إنشاء معرف UUID صحيح باستخدام الدالة gen_random_uuid() من Postgres
      // نستخدم مزيجاً من معرّف البيع ومعرّف المنتج لضمان التفرد
      const saleUuid = this.generateUUID(`${sale.id}_${item.productId}`);
      
      // إنشاء السجل بدون الحقول المحسوبة (net_quantity و total)
      return {
        id: saleUuid,
        date: sale.date,
        product: product.name,
        route: route.name,
        quantity: item.quantity,
        unit_price: item.price,
        returned: returned,
        damaged: damaged
      };
    }).filter(Boolean) as SupabaseSaleRecord[];
  }

  /**
   * إنشاء UUID v4 من نص
   * هذه وظيفة مساعدة لتحويل السلاسل النصية إلى UUID v4 صالح
   */
  private static generateUUID(input: string): string {
    // استخدام خوارزمية بسيطة لتحويل النص إلى UUID v4
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    
    // تنسيق UUID v4 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
    // حيث y هو 8 أو 9 أو A أو B
    const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    let uuid = "";
    let random = Math.abs(hash);
    
    for (let i = 0; i < template.length; i++) {
      if (template[i] === "-") {
        uuid += "-";
      } else if (template[i] === "4") {
        uuid += "4";
      } else if (template[i] === "y") {
        // y يجب أن تكون 8 أو 9 أو a أو b
        const y = random % 4;
        random = Math.floor(random / 4);
        uuid += (y + 8).toString(16);
      } else {
        const r = random % 16;
        random = Math.floor(random / 16);
        uuid += r.toString(16);
      }
    }
    
    return uuid;
  }

  /**
   * مزامنة سجلات المبيعات مع قاعدة بيانات Supabase
   */
  static async syncSalesRecords(
    salesRecords: SaleRecord[],
    products: Product[],
    routes: Route[],
    isFullSync = false
  ): Promise<SyncResult> {
    try {
      // التحقق من الاتصال
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        toast.error("غير متصل بقاعدة البيانات");
        return { success: false, syncedCount: 0, errorCount: 0 };
      }
      
      // إنشاء خرائط للمنتجات والمسارات للوصول السريع
      const productsMap = new Map(products.map(p => [p.id, p]));
      const routesMap = new Map(routes.map(r => [r.id, r]));
      
      let successCount = 0;
      let errorCount = 0;
      
      // إذا كان مطلوب مزامنة كاملة، امسح البيانات الحالية أولا
      if (isFullSync) {
        const { error: deleteError } = await supabase.from('sales').delete().lt('id', 'z'); // حذف كل السجلات
        
        if (deleteError) {
          console.error("خطأ في مسح سجلات المبيعات القديمة:", deleteError);
          toast.error("فشل في مسح سجلات المبيعات القديمة");
          return { success: false, syncedCount: 0, errorCount: 1 };
        }
      }
      
      // تحويل السجلات وإعدادها للإرسال
      const allSupabaseRecords: SupabaseSaleRecord[] = [];
      
      for (const sale of salesRecords) {
        const supabaseRecords = this.transformSaleToSupabaseFormat(sale, productsMap, routesMap);
        allSupabaseRecords.push(...supabaseRecords);
      }
      
      // مزامنة البيانات على دفعات لتجنب حدود الطلبات
      const BATCH_SIZE = 100; // حجم الدفعة
      
      for (let i = 0; i < allSupabaseRecords.length; i += BATCH_SIZE) {
        const batch = allSupabaseRecords.slice(i, i + BATCH_SIZE);
        
        // استخدام upsert لتحديث السجلات الموجودة أو إضافة سجلات جديدة
        const { error } = await supabase
          .from('sales')
          .upsert(batch, { onConflict: 'id' });
          
        if (error) {
          console.error(`خطأ في مزامنة الدفعة ${i / BATCH_SIZE + 1}:`, error);
          console.error("تفاصيل الخطأ:", error.message);
          console.error("البيانات المرسلة:", JSON.stringify(batch[0])); // سجل البيانات الأولى كمثال
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }
      
      return { 
        success: errorCount === 0, 
        syncedCount: successCount, 
        errorCount 
      };
    } catch (error) {
      console.error("خطأ في مزامنة سجلات المبيعات:", error);
      toast.error("فشل في مزامنة البيانات مع قاعدة البيانات");
      return { success: false, syncedCount: 0, errorCount: 1 };
    }
  }
  
  /**
   * مزامنة جميع البيانات مع قاعدة بيانات Supabase
   */
  static async syncAllData(
    products: Product[],
    routes: Route[],
    customers: Customer[],
    employees: Employee[],
    salesRecords: SaleRecord[]
  ): Promise<{[key: string]: SyncResult}> {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        toast.error("غير متصل بقاعدة البيانات");
        return {
          products: { success: false, syncedCount: 0, errorCount: 0 },
          routes: { success: false, syncedCount: 0, errorCount: 0 },
          customers: { success: false, syncedCount: 0, errorCount: 0 },
          employees: { success: false, syncedCount: 0, errorCount: 0 },
          salesRecords: { success: false, syncedCount: 0, errorCount: 0 }
        };
      }
      
      // مزامنة كل نوع من البيانات في شكل متوازٍ
      const [
        productsResult,
        routesResult,
        customersResult,
        employeesResult,
        salesResult
      ] = await Promise.all([
        this.syncProducts(products),
        this.syncRoutes(routes),
        this.syncCustomers(customers),
        this.syncEmployees(employees),
        this.syncSalesRecords(salesRecords, products, routes, false)
      ]);
      
      return {
        products: productsResult,
        routes: routesResult,
        customers: customersResult,
        employees: employeesResult,
        salesRecords: salesResult
      };
    } catch (error) {
      console.error("خطأ في مزامنة جميع البيانات:", error);
      toast.error("فشل في مزامنة البيانات مع قاعدة البيانات");
      return {
        products: { success: false, syncedCount: 0, errorCount: products.length },
        routes: { success: false, syncedCount: 0, errorCount: routes.length },
        customers: { success: false, syncedCount: 0, errorCount: customers.length },
        employees: { success: false, syncedCount: 0, errorCount: employees.length },
        salesRecords: { success: false, syncedCount: 0, errorCount: salesRecords.length }
      };
    }
  }
}
