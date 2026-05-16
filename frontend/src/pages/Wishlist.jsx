import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mocking the wishlist fetch
        const fetchWishlist = async () => {
             setIsLoading(true);
             try {
                 // In reality: await fetch('/api/wishlist', ...)
                 setTimeout(() => {
                     setWishlistItems([
                         { id: "1", name: "Fresh Organic Apples", price: 120, image: "https://via.placeholder.com/300", stockQuantity: 50 },
                         { id: "2", name: "Whole Wheat Bread", price: 45, image: "https://via.placeholder.com/300", stockQuantity: 0 }
                     ]);
                     setIsLoading(false);
                 }, 500);
             } catch (error) {
                 console.error("Failed to load wishlist");
                 setIsLoading(false);
             }
        };
        fetchWishlist();
    }, []);

    return (
        <div className="animate-fade-in max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 mb-8">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
                <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-sm ml-2">
                    {wishlistItems.length} Items
                </span>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>)}
                </div>
            ) : wishlistItems.length > 0 ? (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* We use ProductCard to reuse logic, but here we can just map and pass data */}
                        {wishlistItems.map((product) => (
                            <div key={product.id} className="relative group">
                                <ProductCard product={product} />
                                <button className="absolute top-2 left-2 z-30 p-2 bg-white/90 text-slate-400 hover:text-red-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" title="Remove from wishlist">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl py-16 px-6 text-center shadow-sm border border-slate-200 flex flex-col items-center">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-10 h-10 text-red-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Your wishlist is currently empty</h2>
                    <p className="text-slate-500 mb-8 max-w-md">Save your favorite grocery items here to quickly find them and add them to your cart later.</p>
                    <Link to="/products" className="btn-primary py-3 px-8 shadow-lg shadow-emerald-200/50">
                        Explore Products
                    </Link>
                </div>
            )}
        </div>
    );
}
