import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrderStore, useAuthStore } from '../store';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, MapPin } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrder, fetchOrder, cancelOrder, isLoading } = useOrderStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrder(id);

    // Initialize WebSocket connection for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the API base URL port (usually same as window.location.host in production, but handled via proxy in dev)
    // To handle Vite proxy properly, we can connect to ws://localhost:8000/api/ws/orders/id directly if in dev, 
    // or just use relative wss path if proxy supports WS. Vite proxy supports WS.
    const wsUrl = `${protocol}//${window.location.host}/api/ws/orders/${id}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.order) {
          useOrderStore.setState({ currentOrder: data.order });
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [id, isAuthenticated]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await cancelOrder(id, 'Customer requested cancellation');
      fetchOrder(id);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-indigo-500" />;
      case 'preparing':
        return <Package className="w-6 h-6" />;
      case 'out_for_delivery':
        return <Truck className="w-6 h-6" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const getCurrentStep = (status) => {
    return steps.findIndex(s => s.key === status);
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Order not found</p>
        <Link to="/orders" className="text-green-600 hover:underline mt-4 block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStatus = currentOrder.status || currentOrder.orderStatus || 'pending';
  const currentStep = getCurrentStep(currentStatus);

  return (
    <div className="animate-fade-in pb-10">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order #{currentOrder.orderNumber}</h1>
              <p className="text-gray-500">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
              <button
                onClick={handleCancel}
                className="text-red-500 text-sm hover:underline"
              >
                Cancel Order
              </button>
            )}
          </div>

          {/* Status Timeline */}
          <div className="relative pt-4 pb-8">
            <div className="flex items-start justify-between">
              {steps.map((step, index) => {
                const timelineEntry = currentOrder.timeline?.find(t => t.status === step.key);
                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10 w-24 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-3 transition-colors ${
                      index <= currentStep 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {index < currentStep ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        getStatusIcon(step.key)
                      )}
                    </div>
                    <span className={`text-xs font-bold leading-tight ${index <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                    {timelineEntry && (
                      <span className="text-[10px] font-semibold text-slate-500 mt-1">
                          {new Date(timelineEntry.timestamp.endsWith('Z') ? timelineEntry.timestamp : `${timelineEntry.timestamp}Z`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="absolute top-10 left-12 right-12 h-1 bg-slate-100 -z-10 rounded-full">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {currentOrder.items?.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={item?.image || item?.productImage || item?.thumbnail || item?.product?.thumbnail || 'https://via.placeholder.com/64'}
                    alt={item?.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item?.productName}</h3>
                  <p className="text-sm text-gray-500">Qty: {item?.quantity} x ₹{item?.price || item?.sellingPrice || item?.totalPrice/item?.quantity}</p>
                </div>
                <div className="font-semibold">₹{item?.totalPrice || (item?.quantity * (item?.price || item?.sellingPrice))}</div>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{currentOrder.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>₹{currentOrder.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery OTP - Prominent for Customer */}
        {['accepted', 'assigned', 'preparing', 'picked_up', 'out_for_delivery'].includes(currentStatus) && currentOrder.otp && (
          <div className="bg-emerald-600 rounded-2xl p-6 shadow-lg shadow-emerald-200 mb-6 text-white overflow-hidden relative isolate animate-fade-in">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full -z-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-[0.2em] mb-1">Security OTP</p>
                <h3 className="text-lg font-black leading-tight">Share with Rider</h3>
                <p className="text-emerald-50 text-xs mt-1 font-medium opacity-90">Share this OTP with your delivery rider upon delivery.</p>
              </div>
              <div className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-mono text-3xl font-black tracking-[0.2em] shadow-inner cursor-pointer hover:bg-emerald-50 transition-colors" title="Copy OTP" onClick={() => navigator.clipboard.writeText(currentOrder.otp)}>
                {currentOrder.otp}
              </div>
            </div>
          </div>
        )}

        {/* Rider Information */}
        {currentOrder.orderStatus !== 'pending' && currentOrder.deliveryPartnerId && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Rider Information
            </h2>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {currentOrder.deliveryPartnerName?.charAt(0) || 'R'}
               </div>
               <div>
                 <p className="font-bold text-indigo-900">{currentOrder.deliveryPartnerName}</p>
                 <p className="text-indigo-600 font-semibold">{currentOrder.deliveryPartnerPhone}</p>
               </div>
               <div className="ml-auto">
                  <a href={`tel:${currentOrder.deliveryPartnerPhone}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-md shadow-indigo-200">
                    Call Rider
                  </a>
               </div>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {currentOrder.deliveryAddress && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </h2>
            <p className="text-gray-600">
              {currentOrder.deliveryAddress.label || currentOrder.deliveryAddress.name || currentOrder.deliveryAddress.addressType || 'Home'}<br />
              {currentOrder.deliveryAddress.street || currentOrder.deliveryAddress.address || ''}<br />
              {currentOrder.deliveryAddress.city} - {currentOrder.deliveryAddress.pincode}
              {currentOrder.deliveryAddress.landmark && (
                <><br />Landmark: {currentOrder.deliveryAddress.landmark}</>
              )}
            </p>
          </div>
        )}

        {/* Time Slot */}
        {currentOrder.timeSlot && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Delivery Time</h2>
            <p className="text-gray-600">{typeof currentOrder.timeSlot === 'string' ? currentOrder.timeSlot : currentOrder.timeSlot?.slot || 'Standard Delivery'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
