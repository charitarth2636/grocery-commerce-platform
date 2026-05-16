import { Link } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../store';

export default function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product.id, quantity);
    setIsAdding(false);
    setQuantity(1);
  };

  const discountPercent = product.discountPercent || Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

  return (
    <div className="card overflow-hidden group flex flex-col h-full bg-white relative">
      <Link to={`/products/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-50 p-4 shrink-0">
        <img
          src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply drop-shadow-sm"
        />
        <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/5 transition-colors duration-300 z-10" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {product.isBestseller && (
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              Bestseller
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm max-w-max">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        
        {/* Wishlist Toggle */}
        <button 
            onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
            className={`absolute top-3 right-3 p-2 rounded-full z-20 backdrop-blur-md transition-all shadow-sm ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 text-slate-400 hover:text-red-500 hover:bg-white'}`}
        >
            <Heart className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{product.brand}</p>
          <Link to={`/products/${product.id}`} className="group-hover:text-emerald-600 transition-colors">
            <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="text-xs font-semibold text-slate-500 mb-auto bg-slate-100 inline-block px-2 py-1 rounded w-max">
          {product.unitValue} {product.unit}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            {product.mrp > product.sellingPrice && (
              <span className="text-xs font-medium text-slate-400 line-through block mb-0.5">₹{product.mrp}</span>
            )}
            <span className="text-xl font-extrabold text-slate-900 leading-none block">₹{product.sellingPrice}</span>
          </div>

          {product.stockStatus === 'out_of_stock' || product.stockQuantity <= 0 ? (
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">
              Out of Stock
            </span>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 group/btn relative overflow-hidden"
              aria-label="Add to cart"
            >
              <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative z-10">
                {isAdding ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
