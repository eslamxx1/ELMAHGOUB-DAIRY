
import { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, Pencil, Trash2, Route, Map } from 'lucide-react';
import { Customer } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Customers = () => {
  const { customers, routes, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('all');
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({
    code: '',
    name: '',
    phone: '',
    address: '',
    routeId: '',
    notes: ''
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => 
      (customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      customer.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      customer.phone.includes(searchQuery)) &&
      (selectedRouteFilter === 'all' || customer.routeId === selectedRouteFilter)
    );
  }, [customers, searchQuery, selectedRouteFilter]);

  // Group customers by route
  const customersByRoute = useMemo(() => {
    const grouped = routes.map(route => ({
      route,
      customers: customers.filter(customer => 
        customer.routeId === route.id &&
        (searchQuery === '' || 
         customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         customer.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
         customer.phone.includes(searchQuery))
      )
    }));
    
    // Add unassigned group
    const unassignedCustomers = customers.filter(customer => 
      !customer.routeId &&
      (searchQuery === '' || 
       customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       customer.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
       customer.phone.includes(searchQuery))
    );
    
    if (unassignedCustomers.length > 0) {
      grouped.push({
        route: { id: 'unassigned', name: 'غير مخصص' },
        customers: unassignedCustomers
      });
    }
    
    return grouped;
  }, [customers, routes, searchQuery]);

  const handleInputChange = (field: keyof Customer, value: string) => {
    setCurrentCustomer(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setCurrentCustomer({
      code: '',
      name: '',
      phone: '',
      address: '',
      routeId: '',
      notes: ''
    });
    setIsEditing(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsEditing(true);
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteCustomer(id);
    }
  };

  const handleSubmit = () => {
    if (!currentCustomer.name) {
      alert('يرجى إدخال اسم العميل');
      return;
    }

    if (isEditing && currentCustomer.id) {
      updateCustomer(currentCustomer as Customer);
      alert('تم تحديث بيانات العميل بنجاح');
    } else {
      addCustomer(currentCustomer as Omit<Customer, 'id'>);
      alert('تم إضافة العميل بنجاح');
    }

    resetForm();
  };

  const getRouteName = (routeId?: string) => {
    if (!routeId) return 'غير مخصص';
    const route = routes.find(route => route.id === routeId);
    return route ? route.name : 'غير مخصص';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إدارة العملاء</h1>
      
      {/* Customer form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium">الكود</label>
              <Input 
                value={currentCustomer.code || ''} 
                onChange={e => handleInputChange('code', e.target.value)}
                disabled
                placeholder="يتم توليده تلقائياً"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">الاسم</label>
              <Input 
                value={currentCustomer.name || ''} 
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="أدخل اسم العميل"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">رقم الهاتف</label>
              <Input 
                value={currentCustomer.phone || ''} 
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">العنوان</label>
              <Input 
                value={currentCustomer.address || ''} 
                onChange={e => handleInputChange('address', e.target.value)}
                placeholder="أدخل العنوان"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium flex items-center">
                <Route className="ml-1 h-4 w-4" />
                خط السير
              </label>
              <Select
                value={currentCustomer.routeId || 'unassigned'}
                onValueChange={(value) => handleInputChange('routeId', value === 'unassigned' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر خط السير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">غير مخصص</SelectItem>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">ملاحظات</label>
            <Textarea 
              value={currentCustomer.notes || ''} 
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder="أدخل ملاحظات إضافية"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="bg-dairy-700 hover:bg-dairy-800">
              <UserPlus className="ml-2 h-4 w-4" />
              {isEditing ? 'تحديث' : 'إضافة'}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Customers table with filtering */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>قائمة العملاء</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن عميل..."
                className="pr-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="grouped" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="grouped">عرض حسب خط السير</TabsTrigger>
              <TabsTrigger value="all">عرض الكل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grouped">
              {customersByRoute.length === 0 ? (
                <div className="text-center py-8 border rounded-md">
                  <p className="text-muted-foreground">لا يوجد عملاء للعرض</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {customersByRoute.map(group => (
                    <div key={group.route.id} className="border rounded-md overflow-hidden">
                      <div className="bg-dairy-50 p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <Map className="h-5 w-5 text-dairy-600 ml-2" />
                          <h3 className="font-medium">{group.route.name}</h3>
                        </div>
                        <Badge>{group.customers.length} عميل</Badge>
                      </div>
                      {group.customers.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>الكود</TableHead>
                              <TableHead>الاسم</TableHead>
                              <TableHead>رقم الهاتف</TableHead>
                              <TableHead>العنوان</TableHead>
                              <TableHead>ملاحظات</TableHead>
                              <TableHead>الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.customers.map(customer => (
                              <TableRow key={customer.id}>
                                <TableCell>{customer.code}</TableCell>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{customer.address}</TableCell>
                                <TableCell>{customer.notes}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          لا يوجد عملاء في هذا الخط
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all">
              <div className="mb-4">
                <Select 
                  value={selectedRouteFilter} 
                  onValueChange={setSelectedRouteFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="فلترة حسب خط السير" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الخطوط</SelectItem>
                    {routes.map(route => (
                      <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                    ))}
                    <SelectItem value="unassigned">غير مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الكود</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>رقم الهاتف</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>خط السير</TableHead>
                      <TableHead>ملاحظات</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map(customer => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.code}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.address}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRouteName(customer.routeId)}</Badge>
                        </TableCell>
                        <TableCell>{customer.notes}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          لا يوجد عملاء للعرض
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
