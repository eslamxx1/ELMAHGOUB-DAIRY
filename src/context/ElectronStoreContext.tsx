
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Employee, Product, Route, SaleRecord } from '@/types';
import { fileSystemService } from '@/services/FileSystemService';

interface StoreContextType {
  products: Product[];
  routes: Route[];
  customers: Customer[];
  employees: Employee[];
  salesRecords: SaleRecord[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addRoute: (route: Route) => void;
  updateRoute: (route: Route) => void;
  deleteRoute: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addSaleRecord: (record: SaleRecord) => void;
  updateSaleRecord: (record: SaleRecord) => void;
  deleteSaleRecord: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const ElectronStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);

  // Load data on initialization
  useEffect(() => {
    const loadData = async () => {
      const loadedProducts = await fileSystemService.readFile<Product[]>('products.json') || [];
      const loadedRoutes = await fileSystemService.readFile<Route[]>('routes.json') || [];
      const loadedCustomers = await fileSystemService.readFile<Customer[]>('customers.json') || [];
      const loadedEmployees = await fileSystemService.readFile<Employee[]>('employees.json') || [];
      const loadedSalesRecords = await fileSystemService.readFile<SaleRecord[]>('salesRecords.json') || [];

      setProducts(loadedProducts);
      setRoutes(loadedRoutes);
      setCustomers(loadedCustomers);
      setEmployees(loadedEmployees);
      setSalesRecords(loadedSalesRecords);
    };

    loadData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    const saveData = async () => {
      await fileSystemService.writeFile('products.json', products);
      await fileSystemService.writeFile('routes.json', routes);
      await fileSystemService.writeFile('customers.json', customers);
      await fileSystemService.writeFile('employees.json', employees);
      await fileSystemService.writeFile('salesRecords.json', salesRecords);
    };

    saveData();
  }, [products, routes, customers, employees, salesRecords]);

  // Product operations
  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Route operations
  const addRoute = (route: Route) => {
    setRoutes([...routes, route]);
  };

  const updateRoute = (route: Route) => {
    setRoutes(routes.map(r => r.id === route.id ? route : r));
  };

  const deleteRoute = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
  };

  // Customer operations
  const addCustomer = (customer: Customer) => {
    setCustomers([...customers, customer]);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  // Employee operations
  const addEmployee = (employee: Employee) => {
    setEmployees([...employees, employee]);
  };

  const updateEmployee = (employee: Employee) => {
    setEmployees(employees.map(e => e.id === employee.id ? employee : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  // Sale record operations
  const addSaleRecord = (record: SaleRecord) => {
    setSalesRecords([...salesRecords, record]);
  };

  const updateSaleRecord = (record: SaleRecord) => {
    setSalesRecords(salesRecords.map(r => r.id === record.id ? record : r));
  };

  const deleteSaleRecord = (id: string) => {
    setSalesRecords(salesRecords.filter(r => r.id !== id));
  };

  const value = {
    products,
    routes,
    customers,
    employees,
    salesRecords,
    addProduct,
    updateProduct,
    deleteProduct,
    addRoute,
    updateRoute,
    deleteRoute,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addSaleRecord,
    updateSaleRecord,
    deleteSaleRecord,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useElectronStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useElectronStore must be used within an ElectronStoreProvider');
  }
  return context;
};
