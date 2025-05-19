
import { Product, Route, Customer, Employee, SaleRecord } from '@/types';

export interface StoreContextType {
  products: Product[];
  routes: Route[];
  customers: Customer[];
  employees: Employee[];
  salesRecords: SaleRecord[];
  isLoading: boolean;
  isConnectedToDb: boolean;
  lastSyncTime: string | null;
  
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  addRoute: (route: Omit<Route, 'id'>) => void;
  updateRoute: (route: Route) => void;
  deleteRoute: (id: string) => void;
  
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addEmployeeAdvance: (employeeId: string, amount: number, date: string, notes?: string) => void;
  resetEmployeeAdvances: (employeeId: string) => void;
  
  addSaleRecord: (record: Omit<SaleRecord, 'id'>) => void;
  getSaleRecordsByDate: (date: string) => SaleRecord[];
  getSaleRecordsByRoute: (routeId: string) => SaleRecord[];

  exportData: () => Promise<any>;
  importData: (data: any) => Promise<boolean>;
  importFromFile: () => Promise<boolean>;
  syncAllData: () => Promise<boolean>;
}
