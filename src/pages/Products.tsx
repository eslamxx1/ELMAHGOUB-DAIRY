
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/types';

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    price: 0
  });

  const filteredProducts = products.filter(product => 
    product.name.includes(searchQuery)
  );

  const handleInputChange = (field: keyof Product, value: any) => {
    setCurrentProduct(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setCurrentProduct({
      name: '',
      price: 0
    });
    setIsEditing(false);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProduct(id);
    }
  };

  const handleSubmit = () => {
    if (!currentProduct.name) {
      alert('يرجى إدخال اسم المنتج');
      return;
    }

    if (typeof currentProduct.price !== 'number' || currentProduct.price <= 0) {
      alert('يرجى إدخال سعر صحيح للمنتج');
      return;
    }

    if (isEditing && currentProduct.id) {
      updateProduct(currentProduct as Product);
      alert('تم تحديث بيانات المنتج بنجاح');
    } else {
      addProduct(currentProduct as Omit<Product, 'id'>);
      alert('تم إضافة المنتج بنجاح');
    }

    resetForm();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
      
      {/* Product form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium">اسم المنتج</label>
              <Input 
                value={currentProduct.name || ''} 
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="أدخل اسم المنتج"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">السعر</label>
              <Input 
                type="number"
                value={currentProduct.price || ''} 
                onChange={e => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="أدخل سعر المنتج"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="bg-dairy-700 hover:bg-dairy-800">
              <Package className="ml-2 h-4 w-4" />
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
      
      {/* Products table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن منتج..."
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
                <TableHead>المنتج</TableHead>
                <TableHead>السعر (ج.م)</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    لا توجد منتجات للعرض
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

export default Products;
