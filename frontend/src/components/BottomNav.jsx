import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isActive('/') && location.pathname === '/' 
              ? 'text-green-600' 
              : 'text-gray-500'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link
          to="/products"
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isActive('/products') ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-xs font-medium">Shop</span>
        </Link>

        <Link
          to="/cart"
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isActive('/cart') ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-xs font-medium">Cart</span>
        </Link>

        <Link
          to={isActive('/orders') ? '#' : '/login'}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            isActive('/orders') || isActive('/profile') ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Account</span>
        </Link>
      </div>
    </nav>
  );
}
