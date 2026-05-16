import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, IndianRupee, TrendingUp, AlertCircle, Grid, AlertOctagon } from 'lucide-react';
import { adminAPI } from '../../api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    lowStockProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real application, we would call the /api/admin/dashboard/analytics endpoint here
    // For now we will mock the response structure as defined in our Pydantic schema previously.
    const fetchAnalytics = async () => {
      try {
        const data = await adminAPI.getAnalytics();
        if (data.success) {
            setMetrics(data.data.metrics);
            setRecentOrders(data.data.recentOrders);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `₹${metrics.totalRevenue.toLocaleString()}`, icon: <IndianRupee className="w-6 h-6 text-emerald-600" />, trend: '+12%', color: 'from-emerald-50 to-teal-50', border: 'border-emerald-100' },
    { title: 'Total Orders', value: metrics.totalOrders.toLocaleString(), icon: <ShoppingCart className="w-6 h-6 text-blue-600" />, trend: '+8%', color: 'from-blue-50 to-indigo-50', border: 'border-blue-100' },
    { title: 'Total Customers', value: metrics.totalUsers.toLocaleString(), icon: <Users className="w-6 h-6 text-purple-600" />, trend: '+5%', color: 'from-purple-50 to-pink-50', border: 'border-purple-100' },
    { title: 'Total Products', value: metrics.totalProducts.toLocaleString(), icon: <Package className="w-6 h-6 text-amber-600" />, trend: '0%', color: 'from-amber-50 to-orange-50', border: 'border-amber-100' },
    { title: 'Low Stock Alerts', value: metrics.lowStockProducts.toLocaleString(), icon: <AlertOctagon className="w-6 h-6 text-red-600" />, trend: 'Live', color: 'from-red-50 to-rose-50', border: 'border-red-100' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1 font-medium">Welcome back, here's what's happening with your store today.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">{stat.icon}</div>
                <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-white px-2 py-1 rounded-lg shadow-sm">
                  <TrendingUp className="w-3 h-3" /> {stat.trend}
                </span>
              </div>
              <h3 className="text-slate-600 font-semibold mb-1">{stat.title}</h3>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-4 pr-4">Order ID</th>
                  <th className="pb-4 px-4">Customer</th>
                  <th className="pb-4 px-4">Amount</th>
                  <th className="pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.length > 0 ? recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 pr-4 font-mono text-sm text-slate-600 font-medium">{order.orderNumber}</td>
                    <td className="py-4 px-4 font-semibold text-slate-900">{order.userName}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">₹{order.totalAmount}</td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                        order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.orderStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                        <p>No recent orders found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
                <Link to="/admin/products" className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-100 group transition-colors">
                    <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Add New Product</span>
                    <Package className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                </Link>
                <Link to="/admin/categories" className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-100 group transition-colors">
                    <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Manage Categories</span>
                    <Grid className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                </Link>
                <Link to="/admin/orders" className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 group transition-colors">
                    <span className="font-semibold text-red-700">View Cancelled Orders</span>
                    <AlertCircle className="w-5 h-5 text-red-400 group-hover:text-red-600" />
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
