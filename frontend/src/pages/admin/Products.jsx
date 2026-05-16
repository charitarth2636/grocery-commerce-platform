import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2, Trash2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { adminAPI } from '../../api';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', description: '', categoryId: '', brand: '',
        mrp: '', sellingPrice: '', unit: 'g', unitValue: '',
        stockQuantity: '', images: '', isActive: true, isFeatured: false
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await adminAPI.getAdminProducts({ limit: 50 });
            if (res.data) setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await adminAPI.getCategories();
            if (res.success) setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                description: product.description || '',
                categoryId: product.categoryId || '',
                brand: product.brand || '',
                mrp: product.mrp || '',
                sellingPrice: product.sellingPrice || '',
                unit: product.unit || 'g',
                unitValue: product.unitValue || '',
                stockQuantity: product.stockQuantity || '',
                images: product.images?.[0] || '',
                isActive: product.isActive !== false,
                isFeatured: product.isFeatured || false
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', description: '', categoryId: categories[0]?.id || '', brand: '',
                mrp: '', sellingPrice: '', unit: 'g', unitValue: '',
                stockQuantity: '', images: '', isActive: true, isFeatured: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                mrp: Number(formData.mrp),
                sellingPrice: Number(formData.sellingPrice),
                unitValue: Number(formData.unitValue),
                stockQuantity: Number(formData.stockQuantity),
                images: [formData.images]
            };

            const response = editingProduct 
                ? await adminAPI.updateProduct(editingProduct.id, payload)
                : await adminAPI.createProduct(payload);

            if (response.success) {
                fetchProducts();
                setIsModalOpen(false);
            } else {
                alert(response.message || "Failed to save product");
            }
        } catch (error) {
            console.error("Save error", error);
            alert(error.message || "Error saving product");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            const response = await adminAPI.deleteProduct(id);
            if (response.success) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert(response.message || "Failed to delete product");
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert(error.message || "Error deleting product");
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="animate-fade-in h-full flex flex-col relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-emerald-600" /> Product Mastery
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage your grocery inventory, pricing, and stock levels.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-primary py-3 px-6 shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Add New Product
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search completely by name or brand..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        {filteredProducts.length} Items Listed
                    </div>
                </div>

                <div className="overflow-x-auto flex-1 border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="text-sm text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4">Product Info</th>
                                <th className="p-4">Brand</th>
                                <th className="p-4">Price / MRP</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-medium">Loading inventory data securely...</td></tr>
                            ) : filteredProducts.length > 0 ? filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm p-1 flex items-center justify-center overflow-hidden shrink-0">
                                                <img src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/100'} alt={product.name} className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-tight mb-0.5">{product.name}</p>
                                                <p className="text-xs font-semibold text-slate-500">{product.unitValue} {product.unit}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-semibold text-slate-600">{product.brand || 'Generic'}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-slate-900">₹{product.sellingPrice}</span>
                                            {product.mrp > product.sellingPrice && <span className="text-xs font-bold text-slate-400 line-through">₹{product.mrp}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${product.stockQuantity > 20 ? 'text-emerald-600' : product.stockQuantity > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                                {product.stockQuantity || 0}
                                            </span>
                                            {product.stockQuantity <= (product.lowStockThreshold || 10) && <AlertCircle className="w-4 h-4 text-amber-500" title="Low Stock Warning" />}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                            {product.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Product"><Edit2 className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Product"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="w-12 h-12 text-slate-200 mb-3" />
                                            <p className="font-medium text-lg text-slate-600">No products found matching your search</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Product Right Drawer */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={() => setIsModalOpen(false)}></div>
                    
                    <div className="bg-slate-50 w-full max-w-4xl h-[100dvh] shadow-2xl relative z-10 flex flex-col animate-slide-left border-l border-slate-200">
                        {/* Header */}
                        <div className="px-8 py-6 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                                    {editingProduct ? <Edit2 className="w-6 h-6 text-emerald-600" /> : <Plus className="w-6 h-6 text-emerald-600" />}
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <p className="text-sm font-semibold text-slate-500 mt-1">
                                    {editingProduct ? 'Update product details and manage inventory' : 'Create a new product listing in your catalog'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        
                        {/* Form Body */}
                        <form id="productForm" onSubmit={handleSave} className="flex-1 overflow-y-auto">
                            <div className="p-8 space-y-8">
                                
                                {/* Basic Info Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 text-lg">Basic Information</h3>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                                            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-medium focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" placeholder="e.g. Organic Farm Fresh Apples" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                            <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-medium focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all">
                                                <option value="" disabled>Select Category</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Brand</label>
                                            <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-medium focus:border-emerald-500 focus:bg-white outline-none transition-all" placeholder="e.g. Farm Fresh" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                            <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-medium focus:border-emerald-500 focus:bg-white outline-none transition-all resize-none" placeholder="Provide a rich description highlighting quality and features..."></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing & Inventory */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 text-lg">Pricing & Inventory</h3>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">MRP (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input required type="number" value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})} className="w-full pl-8 bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-extrabold focus:border-emerald-500 focus:bg-white outline-none text-slate-500 transition-all" placeholder="0.00" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-emerald-700 mb-2">Selling Price (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₹</span>
                                                <input required type="number" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} className="w-full pl-8 bg-emerald-50/50 border border-emerald-200 px-4 py-3.5 rounded-xl font-extrabold focus:border-emerald-500 focus:bg-white outline-none text-emerald-900 transition-all shadow-inner" placeholder="0.00" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Stock Quantity</label>
                                            <input required type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-extrabold focus:border-emerald-500 focus:bg-white outline-none transition-all" placeholder="0" />
                                        </div>
                                        <div className="flex gap-4 md:col-span-3">
                                            <div className="flex-1">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Unit Value (Weight/Size)</label>
                                                <input required type="number" step="0.01" value={formData.unitValue} onChange={e => setFormData({...formData, unitValue: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-medium focus:border-emerald-500 focus:bg-white outline-none transition-all" placeholder="e.g. 500" />
                                            </div>
                                            <div className="w-32">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Unit</label>
                                                <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-bold text-slate-700 focus:border-emerald-500 focus:bg-white outline-none transition-all cursor-pointer">
                                                    <option value="g">g</option>
                                                    <option value="kg">kg</option>
                                                    <option value="ml">ml</option>
                                                    <option value="L">L</option>
                                                    <option value="pc">pc</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Media & Visibility */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 text-lg">Media & Visibility</h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Product Image URL</label>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100"><ImageIcon className="w-5 h-5 text-emerald-600" /></div>
                                                        <input required type="url" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl font-medium focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" placeholder="https://example.com/image.jpg" />
                                                    </div>
                                                    <p className="text-xs font-semibold text-slate-500 px-1">Paste a direct image link (JPG, PNG, WEBP). Preview will appear automatically.</p>
                                                </div>
                                                <div className="w-full md:w-40 shrink-0">
                                                    <div className="aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                                        {formData.images ? (
                                                            <img src={formData.images} alt="Preview" className="w-full h-full object-contain p-2" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL'; e.target.className = 'w-full h-full object-contain opacity-50 p-4' }} />
                                                        ) : (
                                                            <div className="text-center p-4">
                                                                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                                <span className="text-xs font-bold text-slate-400">No Image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <label className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors group">
                                                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-6 h-6 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500" />
                                                <div>
                                                    <span className="block font-bold text-slate-800">Active Listing</span>
                                                    <span className="text-xs font-medium text-slate-500">Visible to customers</span>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors group">
                                                <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-6 h-6 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500" />
                                                <div>
                                                    <span className="block font-bold text-slate-800">Featured Product</span>
                                                    <span className="text-xs font-medium text-slate-500">Show on homepage</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </form>
                        
                        {/* Footer Actions */}
                        <div className="px-8 py-5 bg-white border-t border-slate-200 sticky bottom-0 z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex items-center justify-end gap-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="py-3 px-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition-colors">Cancel</button>
                            <button type="submit" form="productForm" className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2">
                                {editingProduct ? 'Save Changes' : 'Create Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
