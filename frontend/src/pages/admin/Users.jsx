import { useState, useEffect } from 'react';
import { Users, Search, MoreHorizontal, Trash2, X, Shield, Clock, MapPin, Phone, Mail, ShoppingBag } from 'lucide-react';
import { adminAPI } from '../../api';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Drawer State
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getUsers('customer');
            if (response.success) {
                // Filter out soft deleted users or show them as deleted, let's filter them if backend doesn't, but backend query now filters them.
                setUsers(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDrawer = (user) => {
        setSelectedUser(user);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedUser(null);
    };

    const handleToggleStatus = async () => {
        if (!selectedUser) return;
        const newStatus = !selectedUser.isActive;
        const actionText = newStatus ? 'Activate' : 'Deactivate/Block';
        
        if (!window.confirm(`Are you sure you want to ${actionText} this user account?`)) return;

        setIsUpdating(true);
        try {
            const response = await adminAPI.updateUserStatus(selectedUser.id, { isActive: newStatus, isBlocked: !newStatus });
            if (response.success) {
                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, isActive: newStatus, isBlocked: !newStatus } : u));
                setSelectedUser({ ...selectedUser, isActive: newStatus, isBlocked: !newStatus });
            } else {
                alert(response.message || `Failed to ${actionText} user`);
            }
        } catch (error) {
            console.error("Status update failed:", error);
            alert(`Error: ${error.message || 'Could not update status'}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) return;

        try {
            const response = await adminAPI.deleteUser(userId);
            if (response.success) {
                setUsers(users.filter(u => u.id !== userId));
                if (selectedUser && selectedUser.id === userId) {
                    handleCloseDrawer();
                }
            } else {
                alert(response.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert(error.message || 'Error deleting user');
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
    );

    return (
        <div className="animate-fade-in h-full flex flex-col relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-600" /> Customers
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage user accounts, view histories, and update profiles.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        {filteredUsers.length} Accounts
                    </div>
                </div>

                <div className="overflow-x-auto flex-1 border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="text-sm text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4">Customer</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Account Status</th>
                                <th className="p-4">Total Orders</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Loading customer database...</td></tr>
                            ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 leading-tight">{user.name}</div>
                                                <div className="text-xs font-semibold text-slate-500 mt-0.5">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-700 leading-tight">{user.email || 'N/A'}</div>
                                        <div className="text-xs font-semibold text-slate-500">{user.phone || 'N/A'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                            user.isActive === false || user.isBlocked 
                                                ? 'bg-red-50 text-red-700 border border-red-200' 
                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        }`}>
                                            {user.isActive === false || user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                            <ShoppingBag className="w-4 h-4 text-slate-400" /> {user.totalOrders || 0}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleOpenDrawer(user)} 
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" 
                                                title="Manage User"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Users className="w-12 h-12 text-slate-200 mb-3" />
                                            <p className="font-medium text-lg text-slate-600">No customers found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Drawer for User Management */}
            {isDrawerOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={handleCloseDrawer}></div>
                    <div className="bg-white w-full max-w-md h-full shadow-2xl relative z-10 flex flex-col animate-slide-left border-l border-slate-200">
                        {/* Drawer Header */}
                        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg border border-indigo-200">
                                    {selectedUser.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{selectedUser.name}</h2>
                                    <span className={`inline-block mt-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                        selectedUser.isActive === false || selectedUser.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {selectedUser.isActive === false || selectedUser.isBlocked ? 'Blocked Account' : 'Active Account'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={handleCloseDrawer} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            
                            {/* Contact Details */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Mail className="w-5 h-5 text-slate-400" /> {selectedUser.email || 'No email provided'}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Phone className="w-5 h-5 text-slate-400" /> {selectedUser.phone || 'No phone provided'}
                                    </div>
                                </div>
                            </div>

                            {/* Account Stats */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Account Overview</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-center">
                                        <ShoppingBag className="w-6 h-6 text-indigo-500 mb-2" />
                                        <span className="text-2xl font-black text-slate-900 leading-none">{selectedUser.totalOrders || 0}</span>
                                        <span className="text-xs font-bold text-slate-500 mt-1">Total Orders</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-center">
                                        <Clock className="w-6 h-6 text-emerald-500 mb-2" />
                                        <span className="text-sm font-bold text-slate-900 leading-tight">
                                            {new Date(selectedUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500 mt-1">Joined Date</span>
                                    </div>
                                </div>
                            </div>

                            {/* Addresses (Assuming available or show placeholder) */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Saved Addresses</h3>
                                {selectedUser.addresses?.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedUser.addresses.map((addr, idx) => (
                                            <div key={idx} className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-medium text-slate-700">
                                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                                <div>
                                                    <span className="block font-bold text-slate-900">{addr.label || 'Home'}</span>
                                                    {addr.address}, {addr.city} - {addr.pincode}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">No addresses saved.</p>
                                )}
                            </div>
                        </div>

                        {/* Drawer Footer Actions */}
                        <div className="p-6 border-t border-slate-100 bg-white space-y-3 pb-8">
                            <button 
                                onClick={handleToggleStatus}
                                disabled={isUpdating}
                                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                                    selectedUser.isActive === false || selectedUser.isBlocked
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                }`}
                            >
                                <Shield className="w-5 h-5" /> 
                                {isUpdating ? 'Updating...' : (selectedUser.isActive === false || selectedUser.isBlocked ? 'Unblock / Activate Account' : 'Block / Deactivate Account')}
                            </button>

                            <button 
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all"
                            >
                                <Trash2 className="w-5 h-5" /> Delete User Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
