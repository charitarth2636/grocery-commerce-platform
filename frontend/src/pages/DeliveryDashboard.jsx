import { useState, useEffect } from 'react';
import { Truck, MapPin, Package, CheckCircle2, Navigation, LogOut, TrendingUp, Star, DollarSign, Power, Bell, Phone, Clock, ChevronRight, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

export default function DeliveryDashboard() {
    const { user, logout, updateAvailability } = useAuthStore();
    const navigate = useNavigate();
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpValue, setOtpValue] = useState(['', '', '', '']);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [view, setView] = useState('dashboard'); // 'dashboard', 'history', 'earnings'

    useEffect(() => {
        if (!user || (user.role !== 'delivery_partner' && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        fetchAssignedOrders();
    }, [user, navigate]);

    const fetchAssignedOrders = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await fetch('/api/delivery/assigned', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAssignedOrders(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch assigned orders", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async () => {
        setIsUpdatingStatus(true);
        const success = await updateAvailability(!user?.isAvailable);
        setIsUpdatingStatus(false);
        if (!success) alert("Failed to update status. Please try again.");
    };

    const updateOrderStatus = async (orderId, newStatus, otp = null) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const payload = { status: newStatus, note: `Updated by rider ${user?.name}` };
            if (otp) payload.otp = otp;

            const res = await fetch(`/api/delivery/orders/${orderId}/status`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setAssignedOrders(assignedOrders.map(o => 
                    o.id === orderId ? { ...o, orderStatus: newStatus } : o
                ));
                if (newStatus === 'delivered') {
                    setIsOtpModalOpen(false);
                    setOtpValue(['', '', '', '']);
                    fetchAssignedOrders(); // Refresh to update earnings/history
                }
            } else {
                alert(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error("Status update error", error);
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otpValue];
        newOtp[index] = value.slice(-1);
        setOtpValue(newOtp);
        
        // Auto focus next
        if (value && index < 3) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleVerifyOtp = () => {
        const fullOtp = otpValue.join('');
        if (fullOtp.length !== 4) return;
        updateOrderStatus(selectedOrderId, 'delivered', fullOtp);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const activeOrders = assignedOrders.filter(o => !['delivered', 'cancelled'].includes(o.orderStatus));
    const completedOrders = assignedOrders.filter(o => o.orderStatus === 'delivered');
    
    // Stats calculation
    const currentEarnings = user?.earnings || completedOrders.length * 25;
    const todayCount = completedOrders.length;
    const progress = Math.min((todayCount / 20) * 100, 100);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-24">
            {/* Top Navigation */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">Rider Pro</h1>
                        <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-0.5">PLATINUM PARTNER</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setView('profile')}
                        className={`p-2 rounded-xl transition-all ${view === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
                    >
                        <User className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setView('dashboard')}
                        className={`p-2 rounded-xl transition-all ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
                    >
                        <Bell className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-5 max-w-lg mx-auto w-full space-y-6">
                
                {view === 'dashboard' && (
                    <>
                        {/* Status Card */}
                        <div className={`relative overflow-hidden rounded-[2rem] p-6 shadow-2xl transition-all duration-500 ${user?.isAvailable ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-900 border border-slate-200 shadow-slate-200'}`}>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${user?.isAvailable ? 'text-indigo-200' : 'text-slate-400'}`}>Current Status</p>
                                    <h2 className="text-3xl font-black">{user?.isAvailable ? 'Online' : 'Offline'}</h2>
                                    <p className={`text-sm mt-2 font-medium ${user?.isAvailable ? 'text-indigo-100' : 'text-slate-500'}`}>
                                        {user?.isAvailable ? 'You are receiving new orders' : 'Go online to start earning'}
                                    </p>
                                </div>
                                <button 
                                    onClick={toggleStatus}
                                    disabled={isUpdatingStatus}
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg ${user?.isAvailable ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white shadow-indigo-300'}`}
                                >
                                    {isUpdatingStatus ? (
                                        <div className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Power className="w-8 h-8" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Performance Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Profit</p>
                                <h4 className="text-2xl font-black text-slate-900">₹{currentEarnings}</h4>
                                <p className="text-[10px] font-bold text-indigo-600 mt-2 flex items-center gap-1">
                                    Total Commission
                                </p>
                            </div>
                            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Today's Pay</p>
                                <h4 className="text-2xl font-black text-emerald-600">₹{todayCount * 25}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> {todayCount} Deliveries
                                </p>
                            </div>
                        </div>

                        {/* Active Tasks */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2 pt-2">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Deliveries</h3>
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">{activeOrders.length} In Progress</span>
                            </div>

                            {isLoading ? (
                                <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                            ) : activeOrders.length === 0 ? (
                                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200 shadow-sm">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-black text-slate-900">All Caught Up!</h3>
                                    <p className="text-slate-500 text-sm mt-1">Waiting for incoming orders...</p>
                                </div>
                            ) : (
                                activeOrders.map(order => (
                                    <div key={order.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Order #{order.orderNumber}</p>
                                                <h4 className="text-2xl font-black text-slate-900 leading-tight">{order.userName}</h4>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <a href={`tel:${order.userPhone}`} className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95">
                                                        <Phone className="w-4 h-4" /> Call Customer
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-slate-900">₹{order.totalAmount}</span>
                                                <p className={`text-[10px] font-black uppercase mt-1 ${order.paymentMethod === 'cod' ? 'text-orange-600' : 'text-emerald-600'}`}>
                                                    {order.paymentMethod === 'cod' ? 'Collect Cash' : 'Prepaid'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{order.deliveryAddress?.address}, {order.deliveryAddress?.city}</p>
                                                        <a 
                                                            href={`https://www.google.com/maps?q=${encodeURIComponent(order.deliveryAddress?.address + ', ' + order.deliveryAddress?.city)}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-indigo-600 text-xs font-bold flex items-center gap-1 mt-2 hover:underline"
                                                        >
                                                            <Navigation className="w-3 h-3" /> Get Directions
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            {order.specialInstructions && (
                                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                                                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Delivery Notes</p>
                                                    <p className="text-sm text-amber-900 font-medium italic">"{order.specialInstructions}"</p>
                                                </div>
                                            )}
                                        </div>
                                        {/* Pro Rider Workflow Actions */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-3">
                                                {order.orderStatus === 'assigned' && (
                                                    <button 
                                                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                                                        className="flex-1 py-5 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                                    >
                                                        Accept Task
                                                    </button>
                                                )}
                                                
                                                {order.orderStatus === 'accepted' && (
                                                    <button 
                                                        onClick={() => updateOrderStatus(order.id, 'picked_up')}
                                                        className="flex-1 py-5 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                                                    >
                                                        Confirm Pickup
                                                    </button>
                                                )}

                                                {order.orderStatus === 'picked_up' && (
                                                    <button 
                                                        onClick={() => { setSelectedOrderId(order.id); setIsOtpModalOpen(true); }}
                                                        className="flex-1 py-5 bg-emerald-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                                    >
                                                        Verify OTP & Deliver
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <a 
                                                    href={`https://www.google.com/maps?q=${encodeURIComponent(order.deliveryAddress?.address + ', ' + order.deliveryAddress?.city)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                                                >
                                                    <Navigation className="w-4 h-4" /> Navigation
                                                </a>
                                                <a 
                                                    href={`tel:${order.userPhone}`}
                                                    className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold transition-colors"
                                                >
                                                    <Phone className="w-4 h-4" /> Call Customer
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {view === 'history' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight px-2">Delivery History</h3>
                        {completedOrders.length === 0 ? (
                            <p className="text-center py-20 text-slate-400 font-bold">No completed tasks yet.</p>
                        ) : (
                            completedOrders.map(order => (
                                <div key={order.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-slate-900">{order.userName}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{new Date(order.deliveredAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900">₹{order.totalAmount}</p>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Commission: ₹25</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {view === 'profile' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm text-center">
                            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                                <User className="w-12 h-12 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">{user?.name}</h3>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                            <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-indigo-600" /> Professional Details
                            </h4>
                            
                            <form 
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const phone = e.target.phone.value;
                                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                                    const res = await fetch('/api/auth/profile', {
                                        method: 'PUT',
                                        headers: { 
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ phone })
                                    });
                                    if (res.ok) {
                                        alert("Profile updated successfully!");
                                        window.location.reload();
                                    }
                                }} 
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Registered Mobile</label>
                                    <input 
                                        name="phone"
                                        defaultValue={user?.phone || ''}
                                        type="tel" 
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold"
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 mt-2">
                                    Update Details
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm">
                             <div className="flex items-center gap-4 mb-4">
                                 <div className="p-3 bg-emerald-50 rounded-2xl">
                                     <Star className="w-6 h-6 text-emerald-600" />
                                 </div>
                                 <div className="flex-1">
                                     <h5 className="font-bold text-slate-900 text-sm">Rating & Performance</h5>
                                     <p className="text-xs text-slate-500 font-medium">Top 5% of riders in your city</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-lg font-black text-slate-900">4.9</p>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}
            </main>

            {/* OTP Modal */}
            {isOtpModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[2.5rem] p-8 pb-12 shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Verify Delivery</h3>
                                <p className="text-sm font-medium text-slate-500">Ask the customer for the 4-digit OTP</p>
                            </div>
                            <button onClick={() => setIsOtpModalOpen(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>

                        <div className="flex justify-center gap-4 mb-10">
                            {otpValue.map((digit, i) => (
                                <input 
                                    key={i}
                                    id={`otp-${i}`}
                                    type="tel"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    className="w-16 h-20 text-center text-4xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                />
                            ))}
                        </div>

                        <button 
                            onClick={handleVerifyOtp}
                            disabled={otpValue.join('').length !== 4}
                            className="w-full py-5 bg-indigo-600 disabled:bg-slate-200 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
                        >
                            Complete & Get Paid ₹25
                        </button>
                    </div>
                </div>
            )}
            
            {/* Bottom Navigation */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-xs bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-3xl flex justify-between items-center z-50 shadow-2xl">
                 <button onClick={() => setView('dashboard')} className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-all ${view === 'dashboard' ? 'text-white' : 'text-slate-500'}`}>
                    <Truck className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Tasks</span>
                 </button>
                 <button onClick={() => setView('history')} className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-all ${view === 'history' ? 'text-white' : 'text-slate-500'}`}>
                    <Clock className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">History</span>
                 </button>
                 <div className="w-px h-8 bg-white/10 mx-1"></div>
                 <div className="flex-1 py-3 px-2 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Total</p>
                    <p className="text-sm font-black text-emerald-400">₹{currentEarnings}</p>
                 </div>
            </div>
        </div>
    );
}
