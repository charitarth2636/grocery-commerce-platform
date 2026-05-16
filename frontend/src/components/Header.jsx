import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, MapPin, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore, useCartStore, useLocationStore } from '../store';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { location, detectLocation, isLoading, error } = useLocationStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!location && !error) {
      detectLocation();
    }
  }, [location, error, detectLocation]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm py-3' : 'bg-white py-4 border-b border-gray-100'}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Logo & Location Divider */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-[#22c55e] rounded-xl flex items-center justify-center group-hover:bg-[#16a34a] transition-colors">
                <span className="text-white font-extrabold text-xl font-serif">G</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Local Grocery</h1>
              </div>
            </Link>

            {/* Location Selector (Desktop) */}
            <div className="hidden xl:flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Delivering to</p>
                <div className="flex items-center gap-1 font-bold text-gray-800 text-sm">
                  {isLoading ? (
                    <span className="animate-pulse">Detecting...</span>
                  ) : error ? (
                    <span className="text-red-500 text-xs" title={error}>Set Location</span>
                  ) : location ? (
                    <span className="truncate max-w-[150px]">{location.city} {location.pincode}</span>
                  ) : (
                    <span>Select Location</span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search for fresh vegetables, fruits, dairy, or daily essentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] hover:bg-gray-100 focus:bg-white border focus:border-green-500 border-transparent rounded-2xl outline-none transition-all duration-300 text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal shadow-inner"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 text-white p-2 rounded-xl hover:bg-green-600 transition-colors hidden group-focus-within:block animate-fade-in shadow-sm">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-bold text-gray-800 leading-tight">Account</p>
                    <p className="text-xs text-gray-500 font-medium truncate max-w-[80px]">{user?.name?.split(' ')[0]}</p>
                  </div>
                </button>
                
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-gray-200/50 py-2 z-50 border border-gray-100 animate-fade-in ring-1 ring-gray-900/5">
                      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-green-600 font-bold text-lg">{user?.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate font-medium">{user?.email}</p>
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ShoppingCart className="w-4 h-4 text-green-500" />
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 font-bold text-gray-700 hover:text-green-600 py-2 px-3 hover:bg-green-50 rounded-xl transition-colors"
              >
                Sign In / Sign Up
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="sm:hidden p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"><User className="w-6 h-6"/></Link>
            )}

            {/* Cart Button representing modern e-comm (e.g., Blinkit style) */}
            <Link
              to="/cart"
              className="relative flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl transition-all duration-200 shadow-md shadow-green-200 group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="hidden lg:flex flex-col items-start leading-none min-w-[50px]">
                {cart.itemCount > 0 ? (
                  <>
                    <span className="text-[10px] font-bold tracking-wider opacity-90 uppercase">Cart</span>
                    <span className="text-sm font-extrabold">₹{cart.subtotal}</span>
                  </>
                ) : (
                  <span className="text-sm font-bold">My Cart</span>
                )}
              </div>
              
              {/* Mobile Notification Bubble */}
              {cart.itemCount > 0 && (
                <span className="lg:hidden absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cart.itemCount}
                </span>
              )}
            </Link>

          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="mt-4 md:hidden pb-1">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border focus:border-green-500 border-transparent focus:bg-white rounded-xl outline-none transition-all text-gray-800 font-medium placeholder:text-gray-400"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500" />
          </div>
        </form>
      </div>
    </header>
  );
}
