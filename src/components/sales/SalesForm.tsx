
import { useState } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Route, Employee } from '@/types';
import { format } from 'date-fns';

interface SalesFormProps {
  routes: Route[];
  employees: Employee[];
  saleDate: Date;
  routeId: string;
  employeeId: string;
  onDateChange: (date: Date | undefined) => void;
  onRouteChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  setShowHistoricalData: (value: boolean) => void;
}

export const SalesForm = ({
  routes,
  employees,
  saleDate,
  routeId,
  employeeId,
  onDateChange,
  onRouteChange,
  onEmployeeChange,
  setShowHistoricalData
}: SalesFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white p-5 rounded-lg shadow-sm border border-dairy-100">
      <div>
        <label className="block mb-2 text-sm font-medium font-cairo text-dairy-700">التاريخ</label>
        <DatePicker 
          date={saleDate} 
          setDate={date => {
            onDateChange(date);
            setShowHistoricalData(false);
          }} 
          placeholder="اختر تاريخ البيع"
          className="w-full font-cairo"
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium font-cairo text-dairy-700">خط السير</label>
        <Select 
          value={routeId} 
          onValueChange={value => {
            onRouteChange(value);
            setShowHistoricalData(false);
          }}
        >
          <SelectTrigger className="w-full font-cairo">
            <SelectValue placeholder="اختر خط السير" />
          </SelectTrigger>
          <SelectContent>
            {routes.map(route => (
              <SelectItem key={route.id} value={route.id} className="font-cairo">
                {route.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium font-cairo text-dairy-700">المندوب</label>
        <Select 
          value={employeeId} 
          onValueChange={onEmployeeChange}
        >
          <SelectTrigger className="w-full font-cairo">
            <SelectValue placeholder="اختر المندوب" />
          </SelectTrigger>
          <SelectContent>
            {employees.map(employee => (
              <SelectItem key={employee.id} value={employee.id} className="font-cairo">
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
