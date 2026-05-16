import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrderStore, useAuthStore, useCartStore } from '../store';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronRight, Copy, RotateCcw, ShoppingBag } from 'lucide-react';

const ORDER_STEPS = [
  { key: 'pending', label: 'Placed' },
  { key: 'accepted', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'accepted': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'preparing': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    case 'out_for_delivery': return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

function OrderCard({ initialOrder, onReorder }) {
  const [order, setOrder] = useState(initialOrder);
  const [isReordering, setIsReordering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentStatus = order.orderStatus || order.status || 'pending';
    if (['delivered', 'cancelled'].includes(currentStatus)) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/orders/${order.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    return () => ws.close();
  }, [order.id, order.orderStatus, order.status]);

  const handleReorder = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isReordering) return;
    setIsReordering(true);
    await onReorder(order);
    setIsReordering(false);
  };

  const status = order.orderStatus || order.status || 'pending';
  const currentStep = ORDER_STEPS.findIndex(s => s.key === status);
  
  // Format Date safely
  let dateFormatted = 'Unknown Date';
  try {
    dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {}

  const isTerminal = ['delivered', 'cancelled'].includes(status);
  const showRiderInfo = !isTerminal && order.deliveryPartnerName;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fade-in relative">
      <Link to={`/orders/${order.id}`} className="block">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 group-hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Order #{order.orderNumber}</h3>
              <p className="text-slate-500 text-sm">{dateFormatted}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-4">
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${getStatusColor(status)}`}>
              {!isTerminal && <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>}
              {String(status).replace(/_/g, ' ').toUpperCase()}
            </div>
            <p className="font-black text-lg text-slate-800">₹{order.totalAmount}</p>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* Items Preview */}
            <div className="xl:w-1/3 flex flex-col justify-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Items ({order.items?.length || 0})</p>
              <div className="flex items-center gap-2">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-xl border border-slate-100 overflow-hidden relative shadow-sm">
                    <img 
                      src={item?.image || item?.productImage || item?.thumbnail || 'https://via.placeholder.com/64'} 
                      alt={item?.productName} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] font-bold px-1.5 rounded-tl-lg">
                      x{item.quantity}
                    </div>
                  </div>
                ))}
                {(order.items?.length || 0) > 3 && (
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-sm shadow-sm">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Stepper */}
            {status !== 'cancelled' ? (
              <div className="xl:w-2/3 flex items-center pt-2">
                <div className="relative w-full">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full z-0 transition-all duration-700 ease-out"
                    style={{ width: `${(Math.max(0, currentStep) / (ORDER_STEPS.length - 1)) * 100}%` }}
                  ></div>
                  
                  <div className="flex justify-between relative z-10">
                    {ORDER_STEPS.map((step, idx) => {
                      const isActive = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 md:border-[3px] transition-colors duration-500 ${
                            isActive ? 'bg-emerald-500 border-white shadow-md' : 'bg-white border-slate-200 text-slate-400'
                          }`}>
                            {isActive && <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                          </div>
                          <span className={`absolute top-10 md:top-12 text-[10px] md:text-xs font-bold whitespace-nowrap transition-colors duration-300 ${
                            isCurrent ? 'text-emerald-600 scale-110 origin-top' : isActive ? 'text-slate-800' : 'text-slate-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
               <div className="xl:w-2/3 flex items-center justify-center pt-2">
                 <div className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl flex items-center gap-3">
                   <XCircle className="w-6 h-6" />
                   <div>
                     <p className="font-bold text-lg">Order Cancelled</p>
                     <p className="text-sm opacity-80">This order has been cancelled.</p>
                   </div>
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Dynamic Footer (Rider Info, OTP, Reorder) */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 md:p-5 flex flex-col lg:flex-row items-center justify-between gap-4 mt-4">
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4">
            {showRiderInfo && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                  {order.deliveryPartnerName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Rider</p>
                  <p className="font-bold text-slate-800 text-sm leading-tight">{order.deliveryPartnerName}</p>
                </div>
              </div>
            )}
            
            {!isTerminal && order.otp && (
              <div 
                className="flex items-center gap-3 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-md shadow-emerald-200 cursor-pointer hover:bg-emerald-700 transition-colors"
                onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(order.otp); }}
                title="Copy OTP"
              >
                <div>
                  <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider leading-tight">Delivery OTP</p>
                  <p className="font-black tracking-widest text-lg leading-none">{order.otp}</p>
                </div>
                <Copy className="w-5 h-5 text-emerald-200" />
              </div>
            )}
          </div>

          <div className="w-full lg:w-auto flex justify-end">
            <button 
              onClick={handleReorder}
              disabled={isReordering}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              {isReordering ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 group-hover/btn:-rotate-180 transition-transform duration-500" />
              )}
              {isReordering ? 'Adding to Cart...' : 'Reorder'}
            </button>
            <div className="hidden lg:flex items-center justify-center ml-4 text-slate-400 group-hover:text-emerald-500 transition-colors">
               <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        </div>

      </Link>
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const { orders, fetchOrders, isLoading } = useOrderStore();
  const { addToCart, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const handleReorder = async (orderToReorder) => {
    if (!orderToReorder.items || orderToReorder.items.length === 0) return;
    
    // Process items sequentially to avoid overwhelming the server, or use Promise.all
    const promises = orderToReorder.items.map(item => 
      addToCart(item.productId, item.quantity)
    );
    
    await Promise.all(promises);
    await fetchCart();
    navigate('/cart');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Premium Header */}
      <div className="bg-slate-900 text-white pt-10 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black z-0"></div>
        <div className="container mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">My Orders</h1>
          <p className="text-slate-400 font-medium">Track, manage, and view your order history.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-64 shadow-sm border border-slate-100 animate-pulse p-6">
                <div className="h-10 bg-slate-200 rounded-lg w-1/3 mb-6"></div>
                <div className="h-4 bg-slate-200 rounded-full w-1/4 mb-10"></div>
                <div className="h-2 bg-slate-200 rounded-full w-full"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 p-12 text-center max-w-2xl mx-auto border border-slate-100">
            <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
              <ShoppingBag className="w-16 h-16 text-emerald-500 relative z-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">No orders yet</h2>
            <p className="text-slate-500 mb-10 text-lg">Looks like you haven't placed an order yet. Discover amazing products and get them delivered to your door.</p>
            <Link to="/products" className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1">
              Start Shopping
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div key={order.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-fade-in-up">
                <OrderCard initialOrder={order} onReorder={handleReorder} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
