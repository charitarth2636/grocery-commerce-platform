import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Eye, RefreshCw, Filter, Plus, X, Package, User } from 'lucide-react';
import { adminAPI, productsAPI } from '../../api';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deliveryAgents, setDeliveryAgents] = useState([]);
    
    // Add Order Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [newOrder, setNewOrder] = useState({
        userId: '',
        items: [], // { productId, quantity, price, name }
        deliveryAddress: { label: 'Home', address: '', city: '', pincode: '' },
        paymentMethod: 'cod',
        timeSlot: 'Standard Delivery'
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchDeliveryAgents();

        const handleFocus = () => fetchOrders();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [statusFilter]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const params = statusFilter !== 'all' ? { status: statusFilter } : {};
            const response = await adminAPI.getOrders(params);
            if (response.success) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
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

    const fetchDropdownData = async () => {
        try {
            const [usersRes, productsRes] = await Promise.all([
                adminAPI.getUsers('customer'),
                productsAPI.getProducts({ limit: 100 })
            ]);
            if (usersRes.success) setUsers(usersRes.data.filter(u => u.isActive !== false));
            if (productsRes.data) setProducts(productsRes.data.filter(p => p.isActive !== false && p.stockQuantity > 0));
        } catch (error) {
            console.error("Failed to fetch data for add order modal");
        }
    };

    const handleOpenAddModal = () => {
        fetchDropdownData();
        setNewOrder({
            userId: '',
            items: [],
            deliveryAddress: { label: 'Home', address: '', city: '', pincode: '' },
            paymentMethod: 'cod',
            timeSlot: 'Standard Delivery'
        });
        setIsAddModalOpen(true);
    };

    const handleAddItem = () => {
        setNewOrder(prev => ({ ...prev, items: [...prev.items, { productId: '', quantity: 1, price: 0, name: '' }] }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...newOrder.items];
        if (field === 'productId') {
            const selectedProduct = products.find(p => p.id === value);
            newItems[index] = { 
                ...newItems[index], 
                productId: value, 
                price: selectedProduct ? selectedProduct.sellingPrice : 0,
                name: selectedProduct ? selectedProduct.name : ''
            };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setNewOrder(prev => ({ ...prev, items: newItems }));
    };

    const handleRemoveItem = (index) => {
        const newItems = newOrder.items.filter((_, i) => i !== index);
        setNewOrder(prev => ({ ...prev, items: newItems }));
    };

    const calculateTotal = () => {
        return newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!newOrder.userId || newOrder.items.length === 0 || !newOrder.items[0].productId) {
            return alert("Please select a user and at least one valid product.");
        }

        setIsCreating(true);
        try {
            const orderPayload = {
                userId: newOrder.userId,
                items: newOrder.items.map(item => ({
                    productId: item.productId,
                    quantity: Number(item.quantity)
                })),
                deliveryAddress: newOrder.deliveryAddress,
                paymentMethod: newOrder.paymentMethod,
                timeSlot: newOrder.timeSlot
            };

            const response = await adminAPI.createOrder(orderPayload);
            if (response.success) {
                setIsAddModalOpen(false);
                fetchOrders(); // Refresh list
            } else {
                alert(response.message || "Failed to create order");
            }
        } catch (error) {
            console.error("Create order failed", error);
            alert("Error creating order");
        } finally {
            setIsCreating(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        const currentOrder = orders.find(o => o.id === orderId);
        if ((currentOrder.orderStatus === 'delivered' && newStatus !== 'delivered') ||
            (currentOrder.orderStatus === 'cancelled' && newStatus !== 'cancelled')) {
            return alert("Cannot change status of a delivered or cancelled order.");
        }

        if (!window.confirm(`Update order status to ${newStatus}?`)) return;
        
        // Optimistic UI update
        const previousOrders = [...orders];
        setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));

        try {
            const response = await adminAPI.updateOrderStatus(orderId, newStatus);
            if (!response.success) {
                setOrders(previousOrders);
                alert(response.message || 'Update failed');
            }
        } catch (error) {
            setOrders(previousOrders);
            console.error("Status update failed", error);
            alert("Error updating status");
        }
    };

    const assignPartner = async (orderId, partnerId) => {
        if (!partnerId) return;
        const previousOrders = [...orders];
        try {
            setOrders(orders.map(o => {
                if (o.id === orderId) {
                    const agent = deliveryAgents.find(a => a.id === partnerId);
                    return { ...o, deliveryPartnerId: partnerId, deliveryPartnerName: agent?.name };
                }
                return o;
            }));

            const response = await adminAPI.assignRider(orderId, partnerId);
            if (!response.success) {
                setOrders(previousOrders);
                alert(response.message || "Assignment failed");
            }
        } catch (error) {
            setOrders(previousOrders);
            console.error("Agent assignment failed", error);
            alert("Error assigning rider");
        }
    };

    const filteredOrders = orders.filter(o => 
        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statuses = ['pending', 'assigned', 'accepted', 'preparing', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'];

    return (
        <div className="animate-fade-in h-full flex flex-col relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-indigo-600" /> Order Fulfillment
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Monitor active orders, assign riders, and manage deliveries.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchOrders} className="btn-secondary py-3 px-5 flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5" /> Refresh
                    </button>
                    <button onClick={handleOpenAddModal} className="btn-primary py-3 px-6 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-5 h-5" /> Add Order
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Order ID or Customer..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 shrink-0">
                            <Filter className="w-4 h-4" /> Filter
                        </div>
                        <select 
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-bold cursor-pointer outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                        </select>
                        <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 shrink-0">
                            {filteredOrders.length} Orders
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto flex-1 border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="text-sm text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4">Order ID & Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status & Assignment</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-medium">Loading live order queue...</td></tr>
                            ) : filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-mono text-sm font-bold text-slate-900 mb-1">{order.orderNumber}</div>
                                        <div className="text-xs font-semibold text-slate-500">
                                            {new Date(order.createdAt).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 leading-tight mb-0.5">{order.userName}</div>
                                        <div className="text-xs font-semibold text-slate-500">{order.userPhone}</div>
                                    </td>
                                    <td className="p-4 font-semibold text-slate-600">{order.itemCount} items</td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-slate-900">₹{order.totalAmount}</span>
                                            <span className="text-xs font-bold text-slate-400 capitalize">{order.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2 max-w-[160px]">
                                            <select 
                                                value={order.orderStatus}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                disabled={order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                                                className={`text-xs font-bold rounded-lg border-2 px-2 py-1.5 outline-none cursor-pointer transition-colors disabled:opacity-50 ${
                                                    order.orderStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-500' :
                                                    order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-500' :
                                                    order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200 focus:border-red-500' :
                                                    'bg-indigo-50 text-indigo-700 border-indigo-200 focus:border-indigo-500'
                                                }`}
                                            >
                                                {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                                            </select>
                                            
                                            <select
                                                value={order.deliveryPartnerId || ''}
                                                onChange={(e) => assignPartner(order.id, e.target.value)}
                                                disabled={order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                                                className="text-xs font-semibold rounded-lg border border-slate-200 bg-white shadow-sm px-2 py-1.5 text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-50"
                                            >
                                                <option value="" disabled>Assign Rider</option>
                                                {deliveryAgents.map(agent => (
                                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/admin/orders/${order.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Manage Order">
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <ShoppingCart className="w-12 h-12 text-slate-200 mb-3" />
                                            <p className="font-medium text-lg text-slate-600">No recent orders matching criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Order Right Sidebar Drawer */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="bg-slate-50 w-full max-w-2xl h-[100dvh] shadow-2xl relative z-10 flex flex-col animate-slide-left border-l border-slate-200">
                        {/* Header */}
                        <div className="px-8 py-6 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                                    <Plus className="w-6 h-6 text-indigo-600" /> Create Manual Order
                                </h2>
                                <p className="text-sm font-semibold text-slate-500 mt-1">Process a new order on behalf of a customer</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                        </div>

                        {/* Form Body */}
                        <form id="orderForm" onSubmit={handleCreateOrder} className="flex-1 overflow-y-auto">
                            <div className="p-8 space-y-8">
                                
                                {/* Customer Selection */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                        <User className="w-5 h-5 text-indigo-500" />
                                        <h3 className="font-bold text-slate-800 text-lg">Customer Details</h3>
                                    </div>
                                    <div className="p-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Customer</label>
                                        <select required value={newOrder.userId} onChange={e => setNewOrder({...newOrder, userId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer">
                                            <option value="" disabled>Search and select customer...</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.phone || u.email})</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Order Items Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5 text-indigo-500" />
                                            <h3 className="font-bold text-slate-800 text-lg">Order Items</h3>
                                        </div>
                                        <button type="button" onClick={handleAddItem} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> Add Item
                                        </button>
                                    </div>
                                    
                                    <div className="p-6 space-y-4">
                                        {newOrder.items.map((item, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200 relative group">
                                                <button type="button" onClick={() => handleRemoveItem(index)} className="absolute -top-3 -right-3 bg-white text-red-500 border border-slate-200 p-1.5 rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors z-10 hidden group-hover:block">
                                                    <X className="w-4 h-4" />
                                                </button>
                                                
                                                <div className="flex-1">
                                                    <label className="text-xs font-bold text-slate-500 block mb-1.5">Product</label>
                                                    <select required value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none cursor-pointer">
                                                        <option value="" disabled>Select Product...</option>
                                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.sellingPrice}</option>)}
                                                    </select>
                                                </div>
                                                
                                                <div className="flex gap-4 sm:w-48">
                                                    <div className="w-20">
                                                        <label className="text-xs font-bold text-slate-500 block mb-1.5">Qty</label>
                                                        <input required type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-bold focus:border-indigo-500 outline-none text-center" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs font-bold text-slate-500 block mb-1.5">Total</label>
                                                        <div className="bg-indigo-50 border border-indigo-100 px-3 py-2.5 rounded-lg text-sm font-extrabold text-indigo-900 flex items-center justify-center">
                                                            ₹{(item.price * item.quantity).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {newOrder.items.length === 0 && (
                                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                                <p className="text-sm font-bold text-slate-500">No items added to this order</p>
                                                <p className="text-xs font-medium text-slate-400 mt-1">Click "Add Item" to start building the order.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Delivery Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 text-lg">Delivery Information</h3>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Street Address</label>
                                            <input required type="text" placeholder="House/Flat No., Street Name, Area" value={newOrder.deliveryAddress.address} onChange={e => setNewOrder({...newOrder, deliveryAddress: {...newOrder.deliveryAddress, address: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                                                <input required type="text" placeholder="City" value={newOrder.deliveryAddress.city} onChange={e => setNewOrder({...newOrder, deliveryAddress: {...newOrder.deliveryAddress, city: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Pincode</label>
                                                <input required type="text" placeholder="6-digit Pincode" value={newOrder.deliveryAddress.pincode} onChange={e => setNewOrder({...newOrder, deliveryAddress: {...newOrder.deliveryAddress, pincode: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Sticky Footer */}
                        <div className="px-8 py-5 bg-white border-t border-slate-200 sticky bottom-0 z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between">
                            <div className="flex gap-6 items-center">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                                    <p className="text-3xl font-black text-slate-900 leading-none">₹{calculateTotal().toFixed(2)}</p>
                                </div>
                                <div className="h-10 w-px bg-slate-200"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Method</p>
                                    <select value={newOrder.paymentMethod} onChange={e => setNewOrder({...newOrder, paymentMethod: e.target.value})} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold focus:border-indigo-500 outline-none cursor-pointer text-slate-700">
                                        <option value="cod">Cash on Delivery</option>
                                        <option value="online">Online Paid</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition-colors">Cancel</button>
                                <button 
                                    type="submit"
                                    form="orderForm"
                                    disabled={isCreating || newOrder.items.length === 0}
                                    className="py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                                >
                                    {isCreating ? 'Creating Order...' : 'Confirm Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
