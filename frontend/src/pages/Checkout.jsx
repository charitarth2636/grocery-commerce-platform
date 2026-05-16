import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore, useAuthStore, useOrderStore } from '../store';
import { authAPI } from '../api';
import { MapPin, Clock, CreditCard, ArrowLeft, Check, Plus, Home, ShieldCheck, Lock, Tag, X, Loader2 } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { createOrder } = useOrderStore();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' or 'pickup'
  const [timeSlot, setTimeSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  // Coupons and Pricing
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const deliveryFee = (cart?.subtotal || 0) >= 500 ? 0 : 50;
  const isFreeDelivery = deliveryFee === 0;

  const calculateTotal = () => {
      let total = (cart?.subtotal || 0) + deliveryFee;
      if (appliedCoupon) {
          total -= appliedCoupon.discountAmount;
      }
      return Math.max(0, total);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && (!cart?.items || cart?.items?.length === 0)) {
      navigate('/cart');
    }
  }, [cart?.items, isAuthenticated, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await authAPI.getAddresses();
      setAddresses(response.data || []);
      if (response.data?.length > 0) {
        setSelectedAddress(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    try {
      const payload = {
        name: user?.name || 'Customer',
        phone: '9999999999', // Placeholder to satisfy schema
        address: newAddress.street,
        landmark: newAddress.landmark,
        city: newAddress.city,
        state: newAddress.state || 'Local State',
        pincode: newAddress.pincode,
        addressType: newAddress.label.toLowerCase() === 'home' ? 'home' : 'other',
        isDefault: true
      };
      
      const response = await authAPI.addAddress(payload);
      setShowAddAddress(false);
      setNewAddress({ label: 'Home', street: '', city: '', state: '', pincode: '', landmark: '' });
      await fetchAddresses();
      
      // Auto-select the newly created address
      if (response && response.data && response.data.id) {
          setSelectedAddress(response.data.id);
      }
    } catch (error) {
      console.error('Failed to add address:', error);
      // Safely extract error message if it's an object (FastAPI validation error)
      const errorMessage = error?.detail ? (Array.isArray(error.detail) ? error.detail[0].msg : error.detail) : (error?.message || 'Failed to save address');
      setAddressError(errorMessage);
    }
  };

  const handleApplyCoupon = async () => {
      if (!couponCode.trim()) return;
      setIsValidatingCoupon(true);
      setCouponError('');
      
      try {
          const res = await fetch('/api/coupons/validate', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ code: couponCode, cartTotal: cart?.subtotal || 0 })
          });
          const data = await res.json();
          if (data.success) {
              setAppliedCoupon({
                  code: data.data.code,
                  discountAmount: data.data.discount_amount
              });
              setCouponError('');
          } else {
              setCouponError(data.error || 'Invalid coupon code');
              setAppliedCoupon(null);
          }
      } catch (err) {
          setCouponError('Failed to validate coupon');
      } finally {
          setIsValidatingCoupon(false);
      }
  };

  const handlePlaceOrder = async () => {
    setOrderError('');
    if (!selectedAddress && deliveryType === 'delivery') {
      setOrderError('Please select a delivery address');
      return;
    }
    if (!timeSlot) {
      setOrderError('Please select a delivery time');
      return;
    }

    setIsSubmitting(true);
    
    // Construct the backend schema conformant order details
    const selAddr = addresses.find(a => a.id === selectedAddress);
    
    const orderData = {
      deliveryType,
      timeSlot: { date: new Date().toISOString().split('T')[0], slot: timeSlot },
      deliveryAddress: deliveryType === 'delivery' && selAddr ? {
         addressId: selAddr.id,
         name: selAddr.name || 'Customer',
         phone: selAddr.phone || '999999',
         address: selAddr.address,
         city: selAddr.city,
         pincode: selAddr.pincode,
         landmark: selAddr.landmark,
         addressType: selAddr.addressType || 'home'
      } : null,
      paymentMethod,
      couponCode: appliedCoupon?.code,
      items: cart?.items?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.sellingPrice
      })) || []
    };

    const result = await createOrder(orderData);
    
    if (result.success) {
      await clearCart();
      navigate(`/orders/${result.data.id}`);
    } else {
      setOrderError(result.error || 'Failed to place order');
    }
    setIsSubmitting(false);
  };



  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM',
    '7:00 PM - 9:00 PM'
  ];

  if (!isAuthenticated) {
    return null;
  }

  if (!cart?.items || cart?.items?.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-8 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/cart" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 w-max hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Secure Checkout</h1>
            <p className="text-slate-500 mt-2 text-lg">Complete your order details below</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-8 space-y-8">
            {/* Delivery Type */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Delivery Preference</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setDeliveryType('delivery')} className={`relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${deliveryType === 'delivery' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-md ring-4 ring-emerald-50' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                  {deliveryType === 'delivery' && <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-100 rounded-full p-1"><Check className="w-4 h-4" /></div>}
                  <MapPin className="w-8 h-8 opacity-80" />
                  <span className="font-semibold text-lg">Home Delivery</span>
                </button>
                <button onClick={() => setDeliveryType('pickup')} className={`relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${deliveryType === 'pickup' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-md ring-4 ring-emerald-50' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                  {deliveryType === 'pickup' && <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-100 rounded-full p-1"><Check className="w-4 h-4" /></div>}
                  <Home className="w-8 h-8 opacity-80" />
                  <span className="font-semibold text-lg">Store Pickup</span>
                </button>
              </div>
            </section>

            {/* Address */}
            {deliveryType === 'delivery' && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner"><Home className="w-6 h-6" /></div>
                    <h2 className="text-xl font-bold text-slate-900">Delivery Address</h2>
                  </div>
                  <button onClick={() => setShowAddAddress(!showAddAddress)} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium px-4 py-2 rounded-xl hover:bg-emerald-50 transition-all text-sm border border-emerald-200 hover:border-emerald-500">
                    {showAddAddress ? 'Cancel' : <><Plus className="w-4 h-4" /> Add New</>}
                  </button>
                </div>
                {showAddAddress && (
                  <form onSubmit={handleAddAddress} className="mb-8 p-6 sm:p-8 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-inner">
                    <h3 className="font-bold text-slate-800 mb-6 text-lg">New Address Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2"><label className="block text-sm font-semibold text-slate-700 mb-2">Address Label</label><input type="text" placeholder="e.g. Home, Office, Parents" value={newAddress.label} onChange={(e) => setNewAddress({...newAddress, label: e.target.value})} className="input-field bg-white shadow-sm" required /></div>
                      <div className="md:col-span-2"><label className="block text-sm font-semibold text-slate-700 mb-2">Street Address</label><input type="text" placeholder="House/Flat No., Building Name, Street" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} className="input-field bg-white shadow-sm" required /></div>
                      <div><label className="block text-sm font-semibold text-slate-700 mb-2">City</label><input type="text" placeholder="Your City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="input-field bg-white shadow-sm" required /></div>
                      <div><label className="block text-sm font-semibold text-slate-700 mb-2">Pincode</label><input type="text" placeholder="6-digit Postal Code" value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} className="input-field bg-white shadow-sm" required /></div>
                      <div className="md:col-span-2"><label className="block text-sm font-semibold text-slate-700 mb-2">Landmark (Optional)</label><input type="text" placeholder="Nearby recognizable place" value={newAddress.landmark} onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})} className="input-field bg-white shadow-sm" /></div>
                    </div>
                    {addressError && (
                      <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-2">
                        {addressError}
                      </div>
                    )}
                    <div className="mt-8 flex justify-end"><button type="submit" className="btn-primary w-full sm:w-auto shadow-md">Save Address & Continue</button></div>
                  </form>
                )}
                <div className="space-y-4">
                  {addresses.length === 0 && !showAddAddress ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><MapPin className="w-8 h-8" /></div>
                      <p className="text-slate-500 mb-4 text-lg">You don't have any saved addresses.</p>
                      <button onClick={() => setShowAddAddress(true)} className="btn-primary shadow-sm">Add your first address</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {addresses.map((addr) => (
                        <div key={addr.id} onClick={() => setSelectedAddress(addr.id)} className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${selectedAddress === addr.id ? 'border-emerald-500 bg-emerald-50/40 shadow-md ring-4 ring-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedAddress === addr.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}>
                              {selectedAddress === addr.id && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-slate-900 text-lg capitalize">{addr.addressType || 'Address'}</span>
                                {String(addr.addressType || '').toLowerCase() === 'home' && <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold">Default</span>}
                              </div>
                              <p className="text-slate-600 leading-relaxed"><span className="block mb-1 font-medium text-slate-700">{addr.address}</span>{addr.city} - {addr.pincode}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Time Slot */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-inner"><Clock className="w-6 h-6" /></div><h2 className="text-xl font-bold text-slate-900">Preferred Time Slot</h2></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {timeSlots.map((slot) => (
                  <button key={slot} onClick={() => setTimeSlot(slot)} className={`p-4 border-2 rounded-2xl text-sm font-semibold transition-all duration-300 ${timeSlot === slot ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-md ring-2 ring-emerald-100' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>{slot}</button>
                ))}
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner"><CreditCard className="w-6 h-6" /></div><h2 className="text-xl font-bold text-slate-900">Payment Method</h2></div>
              <div className="space-y-4">
                <button onClick={() => setPaymentMethod('cod')} className={`w-full p-6 border-2 rounded-2xl flex items-center gap-5 transition-all duration-300 ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50/40 shadow-md ring-4 ring-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                  <div className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}>
                    {paymentMethod === 'cod' && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex flex-col items-start gap-1"><span className="font-bold text-slate-900 text-lg">Cash on Delivery</span><span className="text-slate-500">Pay directly when your order arrives</span></div>
                </button>
                <div className="w-full p-6 border-2 border-slate-100 bg-slate-50 rounded-2xl flex items-center gap-5 opacity-60">
                  <div className="shrink-0 w-7 h-7 rounded-full border-2 border-slate-200 bg-white" />
                  <div className="flex flex-col items-start gap-1"><span className="font-bold text-slate-900 text-lg">Credit/Debit Cards & UPI</span><span className="text-slate-500 font-medium">Coming soon in next update</span></div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200 border border-slate-200/80 sticky top-28 mt-8 lg:mt-0">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 mb-6 space-y-5 custom-scrollbar">
                {cart?.items?.map(item => (
                  <div key={item.productId} className="flex gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm p-1">
                      <img src={item?.image || item?.productImage || item?.thumbnail || item?.product?.thumbnail || 'https://via.placeholder.com/64'} alt={item?.productName} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item?.productName}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Qty: {item?.quantity}</p>
                    </div>
                    <div className="text-right shrink-0 flex items-center">
                      <span className="text-base text-slate-900 font-bold">₹{item?.totalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center text-slate-600"><span className="font-medium">Subtotal ({cart?.itemCount || 0} items)</span><span className="font-bold text-slate-900 text-lg">₹{cart?.subtotal || 0}</span></div>
                <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium">Delivery Fee</span>
                    {isFreeDelivery ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">Free</span>
                    ) : (
                        <span className="font-bold text-slate-900">₹{deliveryFee}</span>
                    )}
                </div>
                {appliedCoupon && (
                    <div className="flex justify-between items-center text-emerald-600">
                        <span className="font-medium">Coupon Discount ({appliedCoupon.code})</span>
                        <span className="font-bold">-₹{appliedCoupon.discountAmount}</span>
                    </div>
                )}
              </div>

              {/* Coupon Input */}
              <div className="mt-6">
                  {appliedCoupon ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between animate-fade-in shadow-inner">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                  <Tag className="w-5 h-5" />
                              </div>
                              <div>
                                  <p className="font-bold text-emerald-800">{appliedCoupon.code}</p>
                                  <p className="text-xs font-semibold text-emerald-600">Coupon applied successfully!</p>
                              </div>
                          </div>
                          <button 
                              onClick={() => {
                                  setAppliedCoupon(null);
                                  setCouponCode('');
                              }}
                              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors"
                              title="Remove Coupon"
                          >
                              <X className="w-5 h-5" />
                          </button>
                      </div>
                  ) : (
                      <div>
                          <div className="flex gap-2">
                               <input 
                                   type="text" 
                                   placeholder="Enter Coupon Code" 
                                   value={couponCode}
                                   onChange={(e) => {
                                       setCouponCode(e.target.value.toUpperCase());
                                       setCouponError('');
                                   }}
                                   className="flex-1 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm px-4 py-3 uppercase font-medium text-slate-900"
                               />
                               <button 
                                   onClick={handleApplyCoupon}
                                   disabled={isValidatingCoupon || !couponCode.trim()}
                                   className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                               >
                                   {isValidatingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
                               </button>
                          </div>
                          {couponError && (
                              <div className="mt-2 text-red-500 text-sm font-medium flex items-center gap-1.5 animate-fade-in">
                                  <X className="w-4 h-4" /> {couponError}
                              </div>
                          )}
                      </div>
                  )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex justify-between items-end mb-8"><span className="text-xl font-bold text-slate-900">Total</span><div className="text-right"><span className="text-3xl font-extrabold text-emerald-600 block leading-none mb-1">₹{calculateTotal()}</span><span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Includes all applicable taxes</span></div></div>

                {orderError && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {orderError}
                  </div>
                )}

                <button onClick={handlePlaceOrder} disabled={isSubmitting || (deliveryType === 'delivery' && !selectedAddress) || !timeSlot} className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 group shadow-xl shadow-emerald-200/50">
                  {isSubmitting ? (
                    <><svg className="animate-spin w-6 h-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing Order...</>
                  ) : (
                    <><Lock className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform" />Confirm & Place Order</>
                  )}
                </button>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 bg-slate-50 rounded-xl p-3"><ShieldCheck className="w-5 h-5 text-emerald-500" /><span className="text-sm font-medium">Safe & Secure Ordering</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20" />
    </div>
  );
}
