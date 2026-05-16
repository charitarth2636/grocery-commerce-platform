import { useState, useEffect } from 'react';
import { Tag, Plus, X, Edit2, Trash2, Search, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminAPI } from '../../api';

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'flat',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        isActive: true,
        description: ''
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getCoupons();
            if (response.success) {
                setCoupons(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minOrderAmount: coupon.minOrderAmount || 0,
                maxDiscountAmount: coupon.maxDiscountAmount || 0,
                isActive: coupon.isActive,
                description: coupon.description || ''
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                discountType: 'flat',
                discountValue: 0,
                minOrderAmount: 0,
                maxDiscountAmount: 0,
                isActive: true,
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = editingCoupon 
                ? await adminAPI.updateCoupon(editingCoupon.id, formData)
                : await adminAPI.createCoupon(formData);
            
            if (response.success) {
                setIsModalOpen(false);
                fetchCoupons();
            } else {
                alert(response.message || "Failed to save coupon");
            }
        } catch (error) {
            console.error("Error saving coupon:", error);
            alert(error.message || "Error saving coupon");
        }
    };

    const deleteCoupon = async (id) => {
        if (!window.confirm("Delete this coupon?")) return;
        try {
            const response = await adminAPI.deleteCoupon(id);
            if (response.success) fetchCoupons();
        } catch (error) {
            console.error("Failed to delete coupon:", error);
        }
    };

    return (
        <div className="animate-fade-in h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Tag className="w-8 h-8 text-emerald-600" /> Coupon Management
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Create promotional codes to drive sales and customer loyalty.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="btn-primary py-3 px-6 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Create New Coupon
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-40 bg-slate-50 rounded-2xl animate-pulse border border-slate-100"></div>
                        ))}
                    </div>
                ) : coupons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coupons.map((coupon) => (
                            <div key={coupon.id} className="relative group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-100 transition-all overflow-hidden isolate">
                                {/* Decorative Tag Background */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full -z-10 group-hover:bg-emerald-100 transition-colors"></div>
                                <div className="absolute right-4 top-4">
                                    <Tag className="w-10 h-10 text-emerald-100 group-hover:text-emerald-200" />
                                </div>

                                <div className="mb-4">
                                    <div className="inline-block px-3 py-1 bg-emerald-600 text-white rounded-lg font-mono font-bold text-lg tracking-wider mb-2">
                                        {coupon.code}
                                    </div>
                                    <h3 className="font-bold text-slate-900 line-clamp-1">{coupon.description || 'No description'}</h3>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Discount</span>
                                        <span className="font-bold text-emerald-600">
                                            {coupon.discountType === 'flat' ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`} OFF
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Min. Order</span>
                                        <span className="font-bold text-slate-700">₹{coupon.minOrderAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Usage</span>
                                        <span className="font-bold text-slate-700">{coupon.usedCount} used</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest ${coupon.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {coupon.isActive ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {coupon.isActive ? 'Active' : 'Paused'}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(coupon)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <Tag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Coupons Created</h3>
                        <p className="text-slate-500">Launch your first promotional campaign today.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Coupon Code</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono font-bold text-lg"
                                        placeholder="E.G. SAVE50"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Discount Type</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-slate-700"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                                    >
                                        <option value="flat">Flat Amount (₹)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Discount Value</label>
                                    <input 
                                        required
                                        type="number" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-bold"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Min Order Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-bold"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({...formData, minOrderAmount: parseFloat(e.target.value) || 0})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Max Discount (₹)</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-bold"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({...formData, maxDiscountAmount: parseFloat(e.target.value) || 0})}
                                        placeholder="0 for no limit"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                                    <textarea 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-medium text-sm"
                                        rows="2"
                                        placeholder="e.g. Save ₹50 on orders above ₹500"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                        />
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">Coupon is currently active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
