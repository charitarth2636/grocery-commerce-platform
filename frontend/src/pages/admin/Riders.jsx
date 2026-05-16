import { useState, useEffect } from 'react';
import { Truck, Search, Phone, Mail, Calendar, ShieldCheck, Plus, X, Edit2, Power, Trash2 } from 'lucide-react';
import { adminAPI } from '../../api';

export default function AdminRiders() {
    const [riders, setRiders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRider, setEditingRider] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleType: 'bike'
    });

    useEffect(() => {
        fetchRiders();
    }, []);

    const fetchRiders = async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getRiders();
            if (response.success) {
                setRiders(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch riders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (rider = null) => {
        if (rider) {
            setEditingRider(rider);
            setFormData({
                name: rider.name || '',
                email: rider.email || '',
                phone: rider.phone || '',
                password: '',
                vehicleType: rider.vehicleType || 'bike'
            });
        } else {
            setEditingRider(null);
            setFormData({ name: '', email: '', phone: '', password: '', vehicleType: 'bike' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = editingRider 
                ? await adminAPI.updateRider(editingRider.id, formData)
                : await adminAPI.createRider(formData);
            
            if (response.success) {
                setIsModalOpen(false);
                fetchRiders();
                setFormData({ name: '', email: '', phone: '', password: '', vehicleType: 'bike' });
                alert(editingRider ? 'Rider updated!' : 'Rider created!');
            } else {
                alert(response.message || 'Failed to save rider');
            }
        } catch (error) {
            console.error("Error saving rider:", error);
            alert(error.message || 'Error saving rider');
        }
    };

    const toggleStatus = async (rider) => {
        try {
            const response = await adminAPI.updateRider(rider.id, { isActive: !rider.isActive });
            if (response.success) fetchRiders();
        } catch (error) {
            console.error("Failed to toggle status:", error);
        }
    };

    const deleteRider = async (id) => {
        if (!window.confirm("Are you sure you want to remove this rider?")) return;
        try {
            const response = await adminAPI.deleteUser(id);
            if (response.success) fetchRiders();
        } catch (error) {
            console.error("Failed to delete rider:", error);
        }
    };

    const filteredRiders = riders.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm)
    );

    return (
        <div className="animate-fade-in h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Truck className="w-8 h-8 text-indigo-600" /> Delivery Fleet
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage your delivery partners, track their activity and performance.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleOpenModal()}
                        className="btn-primary py-3 px-6 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Add New Rider
                    </button>
                    <button 
                        onClick={fetchRiders}
                        className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Refresh List
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name or phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        {filteredRiders.length} Registered Riders
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl h-48 animate-pulse border border-slate-100"></div>
                        ))
                    ) : filteredRiders.length > 0 ? (
                        filteredRiders.map((rider) => (
                            <div key={rider.id} className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-100 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 transition-colors uppercase ${
                                            rider.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {rider.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-slate-900 truncate">{rider.name}</h3>
                                                {rider.isActive && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-0.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Since {new Date(rider.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleOpenModal(rider)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => toggleStatus(rider)} className={`p-2 rounded-lg transition-colors ${rider.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`} title={rider.isActive ? "Deactivate" : "Activate"}><Power className="w-4 h-4" /></button>
                                        <button onClick={() => deleteRider(rider.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                <div className="space-y-2.5 mb-5">
                                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {rider.email || 'No Email'}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {rider.phone}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-indigo-600 bg-indigo-50 w-max px-3 py-1 rounded-full uppercase text-[10px]">
                                        <Truck className="w-3.5 h-3.5" />
                                        {rider.vehicleType || 'Bike'}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md ${
                                        rider.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                        {rider.isActive ? 'Active' : 'Disabled'}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">
                                        {rider.totalOrders || 0} Deliveries
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <Truck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Riders Found</h3>
                            <p className="text-slate-500">Create a delivery partner to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">{editingRider ? 'Edit Rider' : 'Add New Rider'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                    placeholder="e.g. Rahul Kumar"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                                <input 
                                    required
                                    type="email" 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                    placeholder="rider@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                                <input 
                                    required
                                    type="tel" 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                    placeholder="10 digit number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            {!editingRider && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Initial Password</label>
                                    <input 
                                        required
                                        type="password" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Vehicle Type</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium"
                                    value={formData.vehicleType}
                                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                                >
                                    <option value="bike">Bike</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="cycle">Cycle</option>
                                    <option value="van">Van</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                    {editingRider ? 'Save Changes' : 'Create Rider'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
