import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Grid, ShoppingCart, Users, LogOut, Truck, Store, Settings } from 'lucide-react';
import { useAuthStore } from '../store';

export default function AdminLayout() {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { name: 'Categories', path: '/admin/categories', icon: <Grid className="w-5 h-5" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Riders', path: '/admin/riders', icon: <Truck className="w-5 h-5" /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <Store className="w-5 h-5" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">Admin<span className="text-emerald-600">Portal</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold shadow-sm ${
                location.pathname === item.path 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent cursor-pointer'
              }`}
            >
              <span className={location.pathname === item.path ? 'text-emerald-600' : 'text-slate-400'}>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-4">
             <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600">
               {user?.name?.charAt(0) || 'A'}
             </div>
             <div>
               <p className="text-sm font-bold text-slate-900">{user?.name || 'Admin User'}</p>
               <p className="text-xs font-semibold text-slate-500">{user?.email || 'admin@admin.com'}</p>
             </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
           <span className="font-extrabold text-xl text-slate-900 tracking-tight">Admin<span className="text-emerald-600">Portal</span></span>
           {/* Add Mobile Menu Toggle if needed later */}
        </header>

        <div className="p-6 md:p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
