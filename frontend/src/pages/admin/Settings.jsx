import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Truck, CreditCard, Store } from 'lucide-react';
import { adminAPI } from '../../api';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        deliveryCharge: 40,
        freeDeliveryThreshold: 500,
        storePickupEnabled: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getSettings();
            if (response.success) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        
        try {
            const response = await adminAPI.updateSettings(settings);
            if (response.success) {
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to update settings' });
            }
        } catch (error) {
            console.error("Save error:", error);
            setMessage({ type: 'error', text: 'An error occurred while saving.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading global configurations...</div>;

    return (
        <div className="animate-fade-in h-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-slate-600" /> Store Settings
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Configure delivery charges, thresholds, and operational flags.</p>
                </div>
                <button onClick={fetchSettings} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Refresh"><RefreshCw className="w-5 h-5" /></button>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-2xl font-bold flex items-center gap-3 animate-slide-up ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 rounded-lg"><Truck className="w-5 h-5 text-indigo-600" /></div>
                        <h3 className="font-bold text-slate-900">Delivery Logic</h3>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Always Free Delivery</p>
                            <p className="text-xs text-slate-500 font-medium">Ignore threshold and charge 0</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={settings.deliveryCharge === 0}
                                onChange={(e) => setSettings({...settings, deliveryCharge: e.target.checked ? 0 : 40})}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Delivery Charge (₹)</label>
                        <input 
                            type="number" 
                            disabled={settings.deliveryCharge === 0}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold disabled:opacity-50"
                            value={settings.deliveryCharge}
                            onChange={(e) => setSettings({...settings, deliveryCharge: parseInt(e.target.value) || 0})}
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">Charged when order is below threshold</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Free Delivery Threshold (₹)</label>
                        <input 
                            type="number" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                            value={settings.freeDeliveryThreshold}
                            onChange={(e) => setSettings({...settings, freeDeliveryThreshold: parseInt(e.target.value) || 0})}
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">Orders above this amount get 0 delivery charge</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg"><Store className="w-5 h-5 text-emerald-600" /></div>
                        <h3 className="font-bold text-slate-900">Operational Flags</h3>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Enable Store Pickup</p>
                            <p className="text-xs text-slate-500 font-medium">Allow customers to collect from store</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={settings.storePickupEnabled}
                                onChange={(e) => setSettings({...settings, storePickupEnabled: e.target.checked})}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-indigo-500" />
                            <p className="text-xs font-bold text-indigo-700 uppercase tracking-tight">Financial Impact</p>
                        </div>
                        <p className="text-xs text-indigo-600/70 leading-relaxed font-medium">
                            Changes take effect immediately for all new orders. Existing orders in the queue will maintain their original charges.
                        </p>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="btn-primary py-4 px-10 flex items-center justify-center gap-3 text-lg"
                    >
                        {isSaving ? 'Updating...' : (
                            <>
                                <Save className="w-5 h-5" /> Save Global Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
