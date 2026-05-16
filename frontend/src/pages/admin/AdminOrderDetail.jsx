import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, MapPin, Edit3, User, CreditCard } from 'lucide-react';
import { ordersAPI, adminAPI } from '../../api';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deliveryAgents, setDeliveryAgents] = useState([]);

  useEffect(() => {
    fetchOrderDetails();
    fetchDeliveryAgents();
  }, [id]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const response = await ordersAPI.getOrder(id);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch admin order details", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveryAgents = async () => {
    try {
      const response = await adminAPI.getRiders();
      if (response.success) {
        setDeliveryAgents(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch delivery agents:", error);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
    
    // Optimistic Update
    const previousStatus = order.orderStatus;
    setOrder({ ...order, orderStatus: newStatus });
    setIsUpdating(true);

    try {
      const response = await adminAPI.updateOrderStatus(id, newStatus);
      if (!response.success) {
        // Rollback on logic failure
        setOrder({ ...order, orderStatus: previousStatus });
        alert(response.message || 'Failed to update status');
      } else {
        // Refetch to get updated timeline
        fetchOrderDetails();
      }
    } catch (error) {
      // Rollback on network failure
      setOrder({ ...order, orderStatus: previousStatus });
      console.error("Failed to update status", error);
      alert('An error occurred while updating the status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignRider = async (partnerId) => {
    if (!partnerId) return;
    setIsUpdating(true);
    try {
      const response = await adminAPI.assignRider(id, partnerId);
      if (response.success) {
        const agent = deliveryAgents.find(a => a.id === partnerId);
        setOrder({ ...order, deliveryPartnerId: partnerId, deliveryPartnerName: agent?.name });
      } else {
        alert(response.message || "Assignment failed");
      }
    } catch (error) {
      console.error("Agent assignment failed", error);
      alert("Error assigning rider");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-6 h-6" />;
      case 'accepted': return <CheckCircle className="w-5 h-5 text-indigo-500" />;
      case 'preparing': return <Package className="w-6 h-6" />;
      case 'out_for_delivery': return <Truck className="w-6 h-6" />;
      case 'delivered': return <CheckCircle className="w-6 h-6" />;
      case 'cancelled': return <XCircle className="w-6 h-6" />;
      default: return <Clock className="w-6 h-6" />;
    }
  };

  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const statuses = ['pending', 'assigned', 'accepted', 'preparing', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Package className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-xl font-bold text-slate-500">Order not found</p>
        <button onClick={() => navigate('/admin/orders')} className="text-indigo-600 hover:underline mt-4 font-semibold">
          Return to Admin Orders
        </button>
      </div>
    );
  }

  const currentStatus = order.orderStatus || 'pending';
  const currentStep = steps.findIndex(s => s.key === currentStatus);

  return (
    <div className="animate-fade-in pb-10 h-full">
      {/* Breadcrumb Navigation - Fixes Bug 2 */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Header & Status Timeline */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order #{order.orderNumber}</h1>
                <p className="text-slate-500 font-medium mt-1">
                  Placed on {new Date(order.createdAt).toLocaleString(undefined, {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-xl text-sm font-bold capitalize border ${
                  currentStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  currentStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {currentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pt-4 pb-8 overflow-x-auto">
              <div className="flex items-start justify-between min-w-[500px]">
                {steps.map((step, index) => {
                  const timelineEntry = order.timeline?.find(t => t.status === step.key);
                  const isCompleted = index <= currentStep && currentStatus !== 'cancelled';
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10 w-24 text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-3 transition-colors ${
                        isCompleted 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isCompleted && index < currentStep ? <CheckCircle className="w-6 h-6" /> : getStatusIcon(step.key)}
                      </div>
                      <span className={`text-xs font-bold leading-tight ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      {timelineEntry && (
                        <span className="text-[10px] font-semibold text-slate-500 mt-1">
                          {new Date(timelineEntry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-10 left-12 right-12 h-1.5 bg-slate-100 -z-10 rounded-full min-w-[400px]">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${currentStatus === 'cancelled' ? 'bg-red-500' : 'bg-indigo-600'}`}
                  style={{ width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-500" /> Order Items ({order.itemCount})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
                  <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-200 p-1">
                    <img
                      src={item?.image || item?.productImage || item?.thumbnail || item?.product?.thumbnail || 'https://via.placeholder.com/80'}
                      alt={item?.productName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{item?.productName}</h3>
                    <p className="text-sm font-semibold text-slate-500">
                      ₹{item?.price} <span className="mx-2 text-slate-300">|</span> Qty: {item?.quantity}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-extrabold text-slate-900 text-lg">₹{item?.totalPrice || (item?.quantity * item?.price)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-sm font-bold text-slate-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm font-bold text-emerald-600">
                  <span>Discount ({order.couponCode})</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-600">
                <span>Delivery Charge</span>
                <span>{order.deliveryCharge > 0 ? `₹${order.deliveryCharge}` : <span className="text-emerald-600">Free</span>}</span>
              </div>
              <div className="flex justify-between text-xl font-extrabold text-slate-900 pt-4 border-t border-slate-200">
                <span>Total Amount</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Admin Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 mb-5 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-500" /> Admin Controls
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Update Order Status</label>
                <select 
                  value={currentStatus}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={isUpdating}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 font-bold cursor-pointer outline-none disabled:opacity-50"
                >
                  {statuses.map(s => (
                    <option key={s} value={s} disabled={
                      (currentStatus === 'delivered' && s !== 'delivered') || 
                      (currentStatus === 'cancelled' && s !== 'cancelled')
                    }>
                      {s.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assign Delivery Rider</label>
                <select
                  value={order.deliveryPartnerId || ''}
                  onChange={(e) => handleAssignRider(e.target.value)}
                  disabled={isUpdating || currentStatus === 'delivered' || currentStatus === 'cancelled'}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 font-bold cursor-pointer outline-none disabled:opacity-50"
                >
                  <option value="" disabled>Select a Rider</option>
                  {deliveryAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>

              {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={isUpdating}
                  className="w-full py-3 mt-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Force Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Customer Details
            </h2>
            <div className="space-y-1">
              <p className="font-bold text-slate-900">{order.userName}</p>
              <p className="text-sm font-semibold text-slate-500">{order.userPhone}</p>
              <p className="text-sm font-semibold text-slate-500 text-xs">ID: {order.userId}</p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" /> Delivery Address
            </h2>
            {order.deliveryAddress ? (
              <div className="text-sm font-semibold text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">{order.deliveryAddress.label || 'Home'}</span>
                {order.deliveryAddress.street || order.deliveryAddress.address}<br />
                {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                {order.deliveryAddress.landmark && <><br />Landmark: {order.deliveryAddress.landmark}</>}
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium">No address provided</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" /> Payment Details
            </h2>
            <div className="flex justify-between items-center text-sm font-semibold mb-2">
              <span className="text-slate-500">Method</span>
              <span className="uppercase text-slate-900 font-bold">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-500">Status</span>
              <span className={`capitalize font-bold ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
          
          {/* OTP Box */}
          {order.otp && (
             <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
               <h2 className="text-sm font-extrabold text-indigo-900 mb-1 uppercase tracking-wider">Delivery OTP</h2>
               <div className="text-3xl font-black text-indigo-600 tracking-[0.2em]">{order.otp}</div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
