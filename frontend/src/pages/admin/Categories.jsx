import { useState, useEffect } from 'react';
import { Layers, Plus, Search, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { adminAPI } from '../../api';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: '',
        image: '',
        isActive: true,
        isFeatured: false
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getCategories();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        
        try {
            const response = await adminAPI.deleteCategory(id);
            if (response.success) {
                setCategories(categories.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const isEditing = !!editingCategory;
            
            // Auto generate slug if empty
            const submissionData = { ...formData };
            if (!submissionData.slug && submissionData.name) {
                submissionData.slug = submissionData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }

            const response = isEditing 
                ? await adminAPI.updateCategory(editingCategory.id, submissionData)
                : await adminAPI.createCategory(submissionData);
            
            if (response.success) {
                closeModal();
                fetchCategories();
            } else {
                alert(response.message || "Failed to save category");
            }
        } catch (error) {
            console.error("Save failed", error);
            alert(error.message || "Error saving category");
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                description: category.description || '',
                icon: category.icon || '',
                image: category.image || '',
                isActive: category.isActive ?? true,
                isFeatured: category.isFeatured ?? false
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                slug: '',
                description: '',
                icon: '',
                image: '',
                isActive: true,
                isFeatured: false
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-fade-in h-full flex flex-col relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Layers className="w-8 h-8 text-indigo-600" /> Categories
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Organize products into meaningful collections for shoppers.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="btn-primary py-3 px-6 shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="w-5 h-5" /> Add Category
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search categories..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        {filteredCategories.length} Categories
                    </div>
                </div>

                <div className="overflow-x-auto flex-1 border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="text-sm text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4">Category</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Products</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Loading categories...</td></tr>
                            ) : filteredCategories.length > 0 ? filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {category.image ? (
                                                    <img src={category.image} alt={category.name} className="max-w-full max-h-full object-cover" />
                                                ) : category.icon ? (
                                                    <span className="text-2xl">{category.icon}</span>
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-indigo-300" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-tight mb-0.5">{category.name}</p>
                                                <p className="text-xs font-semibold text-slate-400">/{category.slug}</p>
                                                {category.isFeatured && <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">Featured</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">
                                        {category.description || '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                                            {category.productCount || 0}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${category.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                            {category.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openModal(category)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                                                title="Edit Category"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(category.id)} 
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                                title="Delete Category"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Layers className="w-12 h-12 text-slate-200 mb-3" />
                                            <p className="font-medium text-lg text-slate-600">No categories found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white w-full max-w-md h-full shadow-2xl relative z-10 flex flex-col animate-slide-left border-l border-slate-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                    {editingCategory ? <Edit2 className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-indigo-500" />}
                                    {editingCategory ? 'Edit Category' : 'Create Category'}
                                </h2>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">Manage category details and visibility</p>
                            </div>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <form id="categoryForm" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                            
                            {/* Basic Details */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Category Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        required 
                                        value={formData.name} 
                                        onChange={handleChange}
                                        placeholder="e.g. Fresh Vegetables"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-900 outline-none transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Slug URL</label>
                                    <input 
                                        type="text" 
                                        name="slug" 
                                        value={formData.slug} 
                                        onChange={handleChange}
                                        placeholder="Auto-generated if empty"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-900 outline-none transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                    <textarea 
                                        name="description" 
                                        rows="3" 
                                        value={formData.description} 
                                        onChange={handleChange}
                                        placeholder="Briefly describe this category..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-900 outline-none transition-all resize-none" 
                                    ></textarea>
                                </div>
                            </div>

                            {/* Media Section */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                                    <ImageIcon className="w-4 h-4 text-indigo-500" /> Category Media
                                </label>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Icon (Emoji/Text)</label>
                                        <input 
                                            type="text" 
                                            name="icon" 
                                            value={formData.icon} 
                                            onChange={handleChange}
                                            placeholder="e.g. 🥦"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all font-medium" 
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Image Preview</label>
                                        <div className="w-full h-[52px] rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                            {formData.image ? (
                                                <img src={formData.image} alt="Preview" className="max-h-full object-contain" />
                                            ) : (
                                                <span className="text-xs text-slate-400 font-medium">No Image</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Image URL</label>
                                        <input 
                                            type="url" 
                                            name="image" 
                                            value={formData.image} 
                                            onChange={handleChange}
                                            placeholder="https://example.com/image.png"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all font-medium text-sm" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Settings Section */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            name="isActive" 
                                            checked={formData.isActive} 
                                            onChange={handleChange}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-700 text-sm">Active Status</span>
                                        <span className="block text-xs text-slate-500">Make category visible to customers</span>
                                    </div>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            name="isFeatured" 
                                            checked={formData.isFeatured} 
                                            onChange={handleChange}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-700 text-sm">Feature Category</span>
                                        <span className="block text-xs text-slate-500">Highlight on the homepage</span>
                                    </div>
                                </label>
                            </div>
                        </form>
                        
                        <div className="bg-white border-t border-slate-100 p-6 sticky bottom-0 z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex gap-3">
                            <button 
                                type="button" 
                                onClick={closeModal}
                                className="flex-1 py-4 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                form="categoryForm"
                                className="flex-[2] py-4 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                            >
                                {editingCategory ? 'Save Changes' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
