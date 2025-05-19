
export interface Product {
  id: string;
  name: string;
  price: number;
}

// Route type
export interface Route {
  id: string;
  name: string;
}

// Customer type
export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  routeId?: string;
  notes?: string;
}

export interface Advance {
  date: string;
  amount: number;
  notes?: string;
}

// Employee types
export interface Employee {
  id: string;
  code: string;
  name: string;
  phone: string;
  salary: number;
  advances: Advance[];
  notes?: string;
  salaryMonth?: string;
  salaryYear?: number;
  salaryPaid?: boolean;
}

// Sale entry for form handling
export interface SaleEntry {
  productId: string;
  count: number;
  returned?: number;
  damaged?: number;
  net?: number;
  price?: number;
  saleValue?: number;
  lossValue?: number;
}

// Sale record types
export interface SaleRecord {
  id: string;
  date: string;
  routeId: string;
  employeeId?: string;  // Adding the employeeId field
  totalPrice: number;
  items: SaleItem[];
  // Additional fields needed in the app
  entries?: SaleEntry[];
  totalSales?: number;
  totalLosses?: number;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}
