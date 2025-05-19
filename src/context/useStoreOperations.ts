import { useState } from 'react';
import { Product, Route, Customer, Employee, SaleRecord } from '@/types';
import { generateId, generateCustomerCode, generateEmployeeCode } from './storeUtils';

export function useStoreOperations(
  initialProducts: Product[],
  initialRoutes: Route[],
  initialCustomers: Customer[],
  initialEmployees: Employee[],
  initialSalesRecords: SaleRecord[],
) {
  // تحديث قائمة المنتجات الافتراضية
  const updatedInitialProducts = initialProducts.length === 0 ? [
    { id: "1", name: "زبادي كبير", price: 5.5 },
    { id: "2", name: "زبادي صغير", price: 4.75 },
    { id: "3", name: "زبادي جامبو", price: 6.25 },
    { id: "4", name: "أرز باللبن", price: 8.5 },
    { id: "5", name: "أرز فرن", price: 8.5 },
    { id: "6", name: "أرز نوتيلا", price: 12.5 },
    { id: "7", name: "رايب", price: 9.5 },
    { id: "8", name: "جيلي", price: 8.5 },
    { id: "9", name: "قشطوطة", price: 40 },
    { id: "10", name: "كاب كيك صغير", price: 15 },
    { id: "11", name: "كاب كيك كبير", price: 20 },
    { id: "12", name: "تشيز كيك", price: 20 },
    { id: "13", name: "كريمة", price: 120 },
    { id: "14", name: "قريش", price: 70 },
    { id: "15", name: "قشطة", price: 230 },
  ] : initialProducts;
  
  // State for products, routes, customers, employees, and sales
  const [products, setProducts] = useState<Product[]>(updatedInitialProducts);
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>(initialSalesRecords);
  
  // Product CRUD operations
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct = { ...productData, id: generateId() };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => 
      prev.map(product => product.id === updatedProduct.id ? updatedProduct : product)
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Route CRUD operations
  const addRoute = (routeData: Omit<Route, 'id'>) => {
    const newRoute = { ...routeData, id: generateId() };
    setRoutes(prev => [...prev, newRoute]);
  };

  const updateRoute = (updatedRoute: Route) => {
    setRoutes(prev => 
      prev.map(route => route.id === updatedRoute.id ? updatedRoute : route)
    );
  };

  const deleteRoute = (id: string) => {
    setRoutes(prev => prev.filter(route => route.id !== id));
  };

  // Customer CRUD operations
  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer = { 
      ...customerData, 
      id: generateId(),
      code: customerData.code || generateCustomerCode(customers)
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => 
      prev.map(customer => customer.id === updatedCustomer.id ? updatedCustomer : customer)
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  // Employee CRUD operations
  const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee = { 
      ...employeeData, 
      id: generateId(),
      code: employeeData.code || generateEmployeeCode(employees),
      advances: employeeData.advances || []
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => 
      prev.map(employee => employee.id === updatedEmployee.id ? updatedEmployee : employee)
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(employee => employee.id !== id));
  };

  const addEmployeeAdvance = (employeeId: string, amount: number, date: string, notes?: string) => {
    setEmployees(prev => 
      prev.map(employee => {
        if (employee.id === employeeId) {
          return {
            ...employee,
            advances: [...employee.advances, { date, amount, notes }]
          };
        }
        return employee;
      })
    );
  };

  const resetEmployeeAdvances = (employeeId: string) => {
    setEmployees(prev =>
      prev.map(employee => {
        if (employee.id === employeeId) {
          return {
            ...employee,
            advances: [],
            salaryPaid: true
          };
        }
        return employee;
      })
    );
  };

  // Sales operations
  const addSaleRecord = (recordData: Omit<SaleRecord, 'id'>) => {
    const newRecord = { ...recordData, id: generateId() };
    setSalesRecords(prev => [...prev, newRecord]);
  };

  const getSaleRecordsByDate = (date: string) => {
    return salesRecords.filter(record => record.date === date);
  };

  const getSaleRecordsByRoute = (routeId: string) => {
    return salesRecords.filter(record => record.routeId === routeId);
  };

  return {
    // State
    products,
    routes,
    customers,
    employees,
    salesRecords,
    setProducts,
    setRoutes,
    setCustomers,
    setEmployees,
    setSalesRecords,
    
    // Operations
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
    addEmployeeAdvance,
    resetEmployeeAdvances,
    addSaleRecord,
    getSaleRecordsByDate,
    getSaleRecordsByRoute
  };
}
