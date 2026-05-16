import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProductStore } from '../store';
import ProductCard from '../components/ProductCard';
import { Filter, X } from 'lucide-react';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, products, isLoading, fetchProducts } = useProductStore();

  const dummyProducts = [
    { id: 'p1', name: 'Farm Fresh Apple', brand: 'Fresh', thumbnail: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&q=80&w=300', mrp: 150, sellingPrice: 120, unitValue: 1, unit: 'kg', stockStatus: 'in_stock', isBestseller: true, discountPercent: 20 },
    { id: 'p2', name: 'Fresh Banana Robusta', brand: 'Fresh', thumbnail: 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?auto=format&fit=crop&q=80&w=300', mrp: 60, sellingPrice: 45, unitValue: 1, unit: 'doz', stockStatus: 'in_stock', isBestseller: true, discountPercent: 25 },
    { id: 'p3', name: 'Amul Taaza Milk', brand: 'Amul', thumbnail: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=300', mrp: 72, sellingPrice: 72, unitValue: 1, unit: 'L', stockStatus: 'in_stock', isBestseller: true },
    { id: 'p4', name: 'Harvest Gold Bread', brand: 'Harvest Gold', thumbnail: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?auto=format&fit=crop&q=80&w=300', mrp: 45, sellingPrice: 40, unitValue: 400, unit: 'g', stockStatus: 'in_stock', isBestseller: false },
    { id: 'p5', name: 'Fresh Tomato', brand: 'Fresh', thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300', mrp: 50, sellingPrice: 35, unitValue: 1, unit: 'kg', stockStatus: 'in_stock', isBestseller: true, discountPercent: 30 },
    { id: 'p6', name: 'Fresh Potato', brand: 'Fresh', thumbnail: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=300', mrp: 40, sellingPrice: 30, unitValue: 1, unit: 'kg', stockStatus: 'in_stock', isBestseller: true, discountPercent: 25 },
    { id: 'p7', name: 'Farm Fresh Onion', brand: 'Fresh', thumbnail: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=300', mrp: 40, sellingPrice: 28, unitValue: 1, unit: 'kg', stockStatus: 'in_stock', isBestseller: true, discountPercent: 30 },
    { id: 'p8', name: 'Farm Fresh Eggs', brand: 'Poultry', thumbnail: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&q=80&w=300', mrp: 90, sellingPrice: 75, unitValue: 6, unit: 'pc', stockStatus: 'in_stock', isBestseller: false, discountPercent: 16 },
    { id: 'p9', name: 'Amul Cheese Slices', brand: 'Amul', thumbnail: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=300', mrp: 135, sellingPrice: 125, unitValue: 200, unit: 'g', stockStatus: 'in_stock', isBestseller: false },
    { id: 'p10', name: 'India Gate Basmati Rice', brand: 'India Gate', thumbnail: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300', mrp: 220, sellingPrice: 185, unitValue: 1, unit: 'kg', stockStatus: 'in_stock', isBestseller: true, discountPercent: 15 },
    { id: 'p11', name: 'Fortune Sunflower Oil', brand: 'Fortune', thumbnail: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300', mrp: 180, sellingPrice: 145, unitValue: 1, unit: 'L', stockStatus: 'in_stock', isBestseller: true, discountPercent: 19 },
    { id: 'p12', name: 'Fresh Spinach', brand: 'Fresh', thumbnail: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=300', mrp: 35, sellingPrice: 20, unitValue: 250, unit: 'g', stockStatus: 'in_stock', isBestseller: false, discountPercent: 42 }
  ];

  const displayProducts = products || [];
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);

  // Sync state when URL params change (e.g. from Home page link)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || '';
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const params = { page };
    if (selectedCategory) params.category_id = selectedCategory; // Match backend query param name
    if (search) params.search = search;
    if (searchParams.get('featured') === 'true') params.featured = true;
    if (searchParams.get('bestseller') === 'true') params.bestseller = true;
    
    fetchProducts(params);
  }, [selectedCategory, search, page, searchParams]);

  const handleCategoryClick = (categoryId) => {
    const newCategory = categoryId === selectedCategory ? '' : categoryId;
    setSelectedCategory(newCategory);
    setPage(1);
    
    // Update URL without full page reload
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) {
      newParams.set('category', newCategory);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearch('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b sticky top-14 md:top-16 z-40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-800">
              {searchParams.get('search') 
                ? `Search: "${searchParams.get('search')}"`
                : searchParams.get('featured')
                ? 'Featured Products'
                : searchParams.get('bestseller')
                ? 'Bestsellers'
                : 'All Products'
              }
            </h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mt-3 scrollbar-hide">
            <button
              onClick={clearFilters}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                !selectedCategory 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === cat.id 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto bg-gray-50 rounded-3xl border border-gray-100 shadow-sm mt-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span className="text-3xl">🛒</span>
            </div>
            <p className="text-gray-900 font-bold text-xl mb-2">No products found</p>
            <p className="text-gray-500 mb-6">We couldn't find any products matching your current filters.</p>
            <button
              onClick={clearFilters}
              className="btn-primary shadow-md"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {displayProducts.length >= 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">Page {page}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={displayProducts.length < 20}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
