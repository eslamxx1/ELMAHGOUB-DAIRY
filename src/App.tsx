
import { BrowserRouter as Router, Routes as RouterRoutes, Route, Navigate, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ElectronStoreProvider } from './context/ElectronStoreContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';

import Dashboard from './pages/Index';
import Products from './pages/Products';
import RoutesPage from './pages/Routes';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Sales from './pages/Sales';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import DatabaseStatus from './components/dashboard/DatabaseStatus';

import './App.css';

// إنشاء مثيل جديد لعميل الاستعلام مع إعدادات السلسلة
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoreProvider>
          <ElectronStoreProvider>
            <Router>
              <div className="flex flex-col min-h-screen">
                <RouterRoutes>
                  <Route path="/" element={<Layout>{<Outlet />}</Layout>}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<Products />} />
                    <Route path="routes" element={<RoutesPage />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="sales" element={<Sales />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Route>
                </RouterRoutes>
                <Toaster position="top-center" expand={false} richColors closeButton />
                <DatabaseStatus />
              </div>
            </Router>
          </ElectronStoreProvider>
        </StoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
