
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Truck, Pencil, Trash2 } from 'lucide-react';
import { Route } from '@/types';

const Routes = () => {
  const { routes, addRoute, updateRoute, deleteRoute } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Partial<Route>>({
    name: ''
  });

  const filteredRoutes = routes.filter(route => 
    route.name.includes(searchQuery)
  );

  const handleInputChange = (field: keyof Route, value: string) => {
    setCurrentRoute(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setCurrentRoute({
      name: ''
    });
    setIsEditing(false);
  };

  const handleEditRoute = (route: Route) => {
    setCurrentRoute(route);
    setIsEditing(true);
  };

  const handleDeleteRoute = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف خط السير هذا؟')) {
      deleteRoute(id);
    }
  };

  const handleSubmit = () => {
    if (!currentRoute.name) {
      alert('يرجى إدخال اسم خط السير');
      return;
    }

    if (isEditing && currentRoute.id) {
      updateRoute(currentRoute as Route);
      alert('تم تحديث بيانات خط السير بنجاح');
    } else {
      addRoute(currentRoute as Omit<Route, 'id'>);
      alert('تم إضافة خط السير بنجاح');
    }

    resetForm();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إدارة خطوط السير</h1>
      
      {/* Route form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'تعديل بيانات خط السير' : 'إضافة خط سير جديد'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">اسم خط السير</label>
            <Input 
              value={currentRoute.name || ''} 
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="أدخل اسم خط السير"
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="bg-dairy-700 hover:bg-dairy-800">
                <Truck className="ml-2 h-4 w-4" />
                {isEditing ? 'تحديث' : 'إضافة'}
              </Button>
              {isEditing && (
                <Button variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Routes table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة خطوط السير</CardTitle>
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن خط سير..."
                className="pr-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم خط السير</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map(route => (
                <TableRow key={route.id}>
                  <TableCell>{route.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditRoute(route)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRoute(route.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRoutes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    لا توجد خطوط سير للعرض
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Routes;
