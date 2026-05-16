import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const deliveryFee = cart.subtotal >= 500 ? 0 : 50;
  const isFreeDelivery = deliveryFee === 0;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in bg-slate-50/30">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200/50 mx-auto mb-8 border-4 border-slate-50">
          <ShoppingBag className="w-16 h-16 text-slate-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 text-lg max-w-md text-center">Looks like you haven't added any fresh groceries to your cart yet.</p>
        <Link to="/products" className="btn-primary py-4 px-8 text-lg shadow-lg shadow-emerald-200/50">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-8 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
            <p className="text-slate-500 mt-2 text-lg">You have {cart.itemCount} items in your cart</p>
          </div>
          <Link to="/products" className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-colors w-max">
            Continue Shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-2 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-semibold text-slate-500 pb-4 border-b border-slate-100 px-4">
                <div className="col-span-6">Product Details</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total Price</div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {cart.items.map((item) => (
                  <div key={item.productId} className="group p-4 sm:py-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center hover:bg-slate-50/50 transition-colors rounded-2xl">
                    <div className="sm:col-span-6 flex gap-5">
                      <div className="shrink-0 flex items-center justify-center">
                        <img 
                          src={item.image || item.productImage || item.product?.image || item.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150'} 
                          alt={item.name || item.productName || 'Product'} 
                          className="w-16 h-16 object-cover rounded-lg shadow-sm border border-slate-100 bg-white p-0.5" 
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 line-clamp-2 md:line-clamp-none">{item.productName}</h3>
                        <p className="text-sm font-medium text-slate-500 mb-3">{item.brand}</p>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-slate-900 text-lg">₹{item.sellingPrice}</span>
                          {item.mrp > item.sellingPrice && <span className="text-sm font-semibold text-slate-400 line-through">₹{item.mrp}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-6 flex sm:hidden items-center justify-between border-t border-slate-100 pt-4 mt-2">
                       <div className="text-lg font-bold text-slate-900">₹{item.totalPrice}</div>
                       <div className="flex items-center gap-4">
                         <div className="flex items-center bg-slate-100 rounded-xl p-1 shadow-inner">
                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all shadow-sm hover:text-emerald-600 disabled:opacity-50" disabled={item.quantity <= 1}><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 w-8 h-8 flex items-center justify-center bg-white hover:text-emerald-600 rounded-lg shadow-sm"><Plus className="w-4 h-4" /></button>
                          </div>
                          <button onClick={() => removeItem(item.productId)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                       </div>
                    </div>

                    <div className="hidden sm:flex sm:col-span-3 items-center justify-center">
                      <div className="flex items-center bg-slate-100 rounded-xl p-1 shadow-inner ring-1 ring-slate-200/50">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${item.quantity > 1 ? 'hover:bg-white shadow-sm hover:text-emerald-600' : 'opacity-50 cursor-not-allowed'}`} disabled={item.quantity <= 1}><Minus className="w-4 h-4" /></button>
                        <span className="w-10 text-center font-bold text-slate-900 text-lg">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-emerald-600 transition-all text-slate-700"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className="hidden sm:flex sm:col-span-3 items-center justify-end gap-6 relative">
                      <span className="font-extrabold text-xl text-slate-900">₹{item.totalPrice}</span>
                      <button onClick={() => removeItem(item.productId)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors absolute -right-2 opacity-0 group-hover:opacity-100 focus:opacity-100" title="Remove item"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5 border border-transparent ${isFreeDelivery ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className={`w-14 h-14 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border ${isFreeDelivery ? 'text-emerald-500 border-emerald-50' : 'text-orange-500 border-orange-50'}`}><Truck className="w-7 h-7" /></div>
              <div className="text-center sm:text-left">
                {isFreeDelivery ? (
                    <>
                        <h4 className="font-bold text-emerald-900 text-lg">Free Delivery Unlocked!</h4>
                        <p className="text-emerald-800 text-sm mt-1">Your order qualifies for FREE standard delivery.</p>
                    </>
                ) : (
                    <>
                        <h4 className="font-bold text-orange-900 text-lg">Add ₹{500 - cart.subtotal} more</h4>
                        <p className="text-orange-800 text-sm mt-1">reach the ₹500 threshold to unlock FREE delivery!</p>
                    </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 sticky top-28">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-base">
                <div className="flex justify-between items-center"><span className="text-slate-600 font-medium">Subtotal</span><span className="font-bold text-slate-900">₹{cart.subtotal}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-600 font-medium">Delivery Charges</span>
                    {isFreeDelivery ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg text-sm">Free</span>
                    ) : (
                        <span className="font-bold text-slate-900">₹{deliveryFee}</span>
                    )}
                </div>
                <div className="flex justify-between items-center"><span className="text-slate-600 font-medium">Taxes</span><span className="font-bold text-slate-900">₹0</span></div>
              </div>

              <div className="border-t border-slate-200 mt-6 pt-6">
                <div className="flex justify-between items-end mb-8"><span className="text-xl font-bold text-slate-900">Total Amount</span><div className="text-right"><span className="text-3xl font-extrabold text-emerald-600 block leading-none mb-1">₹{cart.subtotal + deliveryFee}</span></div></div>

                <button onClick={handleCheckout} className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 group shadow-xl shadow-emerald-200/50">
                  Proceed to Checkout <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {!isAuthenticated && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center"><p className="text-sm text-slate-600 font-medium">Already have an account? <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold ml-1">Log in</Link></p></div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center gap-2 text-center p-3 bg-slate-50 rounded-xl"><ShieldCheck className="w-6 h-6 text-slate-400" /><span className="text-xs font-semibold text-slate-600">Secure<br/>Payments</span></div>
                <div className="flex flex-col items-center justify-center gap-2 text-center p-3 bg-slate-50 rounded-xl"><Truck className="w-6 h-6 text-slate-400" /><span className="text-xs font-semibold text-slate-600">Fast<br/>Delivery</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
