
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Package, 
  FileText, 
  Settings, 
  UserSquare,
  Database,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}

// مكون عنصر القائمة
const NavItem = ({ to, label, icon, active, onClick }: NavItemProps) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center px-4 py-3 rounded-lg transition-all duration-150 mb-1 text-sm font-medium", 
      active ? 
        "bg-dairy-700 text-white shadow-sm" : 
        "text-dairy-50 hover:bg-dairy-600/70 hover:text-white hover:shadow-sm"
    )}
    onClick={onClick}
  >
    <span className="w-5 h-5 mr-3">{icon}</span>
    <span>{label}</span>
    {active && <span className="ml-auto w-1.5 h-5 bg-dairy-300 rounded-l-md"></span>}
  </Link>
);

// مكون الشريط الجانبي
const Sidebar = ({ 
  navItems, 
  collapsed, 
  isMobile, 
  onToggleSidebar, 
  mobileOpen, 
  setMobileOpen 
}: { 
  navItems: Array<{ to: string; label: string; icon: React.ReactNode; active: boolean }>;
  collapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) => {
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[280px] p-0 bg-dairy-800 border-dairy-700">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-dairy-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">نظام المحجوب</h2>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
            <div className="flex flex-col p-4 space-y-1 overflow-y-auto flex-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={item.active}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
            <div className="border-t border-dairy-700 p-4 text-xs text-dairy-300 text-center">
              <p>© {new Date().getFullYear()} - نظام المحجوب</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <div className={cn(
      "h-full bg-dairy-800 border-r border-dairy-700 transition-all duration-300 flex flex-col",
      collapsed ? "w-[70px]" : "w-[260px]"
    )}>
      <div className="p-4 border-b border-dairy-700 flex items-center justify-between">
        {!collapsed && <h2 className="text-lg font-bold text-white">نظام المحجوب</h2>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar} 
          className="text-white ml-auto"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          collapsed ? (
            <TooltipProvider key={item.to}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    to={item.to} 
                    className={cn(
                      "flex items-center justify-center p-3 mb-1 rounded-lg transition-all duration-150",
                      item.active ? 
                        "bg-dairy-700 text-white shadow-sm" : 
                        "text-dairy-50 hover:bg-dairy-600/70 hover:text-white"
                    )}
                  >
                    <span className="w-5 h-5">{item.icon}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-dairy-900 text-white border-dairy-700">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={item.active}
            />
          )
        ))}
      </div>
      
      {!collapsed && (
        <div className="border-t border-dairy-700 p-4 text-xs text-dairy-300 text-center">
          <p>© {new Date().getFullYear()} - نظام المحجوب</p>
        </div>
      )}
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: ar });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = useIsMobile();

  // تغيير وضع السمة المظلمة
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // إغلاق القائمة المتحركة عند تغيير المسار
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { to: '/', label: 'الرئيسية', icon: <LayoutDashboard size={18} />, active: location.pathname === '/' },
    { to: '/sales', label: 'المبيعات', icon: <FileText size={18} />, active: location.pathname.startsWith('/sales') },
    { to: '/customers', label: 'العملاء', icon: <Users size={18} />, active: location.pathname.startsWith('/customers') },
    { to: '/employees', label: 'الموظفين', icon: <UserSquare size={18} />, active: location.pathname.startsWith('/employees') },
    { to: '/routes', label: 'خطوط السير', icon: <Truck size={18} />, active: location.pathname.startsWith('/routes') },
    { to: '/products', label: 'المنتجات', icon: <Package size={18} />, active: location.pathname.startsWith('/products') },
    { to: '/settings', label: 'الإعدادات', icon: <Settings size={18} />, active: location.pathname.startsWith('/settings') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 w-full">
      {/* الشريط العلوي */}
      <header className="bg-dairy-800 text-white py-2 px-4 shadow-md z-20 sticky top-0">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white" 
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-dairy-300" />
              <h1 className="text-xl font-bold">نظام المحجوب لمنتجات الألبان</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm hidden md:block">{today}</div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white" 
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "الوضع المضيء" : "الوضع المظلم"}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* الشريط الجانبي */}
        {!isMobile && (
          <Sidebar 
            navItems={navItems} 
            collapsed={sidebarCollapsed} 
            isMobile={isMobile} 
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
            mobileOpen={mobileMenuOpen}
            setMobileOpen={setMobileMenuOpen}
          />
        )}

        {/* زر عائم ثابت لفتح القائمة للأجهزة المحمولة */}
        {isMobile && (
          <Button
            className="fixed right-4 bottom-4 z-40 rounded-full shadow-lg bg-dairy-700 hover:bg-dairy-600"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* المحتوى الرئيسي */}
        <main className="flex-1 overflow-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* الشريط السفلي */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 px-4 text-center text-gray-600 dark:text-gray-300 text-sm shadow-inner">
        <p>© {new Date().getFullYear()} - نظام المحجوب لمنتجات الألبان - جميع الحقوق محفوظة</p>
      </footer>
      
      {/* الشريط الجانبي المتحرك للأجهزة المحمولة */}
      {isMobile && (
        <Sidebar 
          navItems={navItems} 
          collapsed={false} 
          isMobile={true} 
          onToggleSidebar={() => {}} 
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />
      )}
    </div>
  );
};

export default Layout;
