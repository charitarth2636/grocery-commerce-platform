import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { useProductStore } from '../store';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { categories, featuredProducts, bestsellerProducts, fetchFeatured, fetchBestsellers } = useProductStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeatured();
    fetchBestsellers();
  }, [fetchFeatured, fetchBestsellers]);

  const dummyProducts = [
    {
      id: 'p1',
      name: 'Farm Fresh Onion (Pyaz)',
      brand: 'Fresh Produce',
      thumbnail: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=300',
      mrp: 40,
      sellingPrice: 28,
      unitValue: 1,
      unit: 'kg',
      stockStatus: 'in_stock',
      isBestseller: true,
      discountPercent: 30,
    },
    {
      id: 'p2',
      name: 'Amul Taaza Homogenised Toned Milk',
      brand: 'Amul',
      thumbnail: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=300',
      mrp: 72,
      sellingPrice: 72,
      unitValue: 1,
      unit: 'L',
      stockStatus: 'in_stock',
      isBestseller: true,
    },
    {
      id: 'p3',
      name: 'Harvest Gold White Bread',
      brand: 'Harvest Gold',
      thumbnail: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?auto=format&fit=crop&q=80&w=300',
      mrp: 45,
      sellingPrice: 40,
      unitValue: 400,
      unit: 'g',
      stockStatus: 'in_stock',
      isBestseller: false,
    },
    {
      id: 'p4',
      name: 'Atta (Whole Wheat Flour)',
      brand: 'Aashirvaad',
      thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300',
      mrp: 265,
      sellingPrice: 235,
      unitValue: 5,
      unit: 'kg',
      stockStatus: 'in_stock',
      isBestseller: true,
    },
    {
      id: 'p5',
      name: 'Maggi 2-Minute Instant Noodles',
      brand: 'Nestle',
      thumbnail: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=300',
      mrp: 140,
      sellingPrice: 135,
      unitValue: 840,
      unit: 'g',
      stockStatus: 'in_stock',
      isBestseller: true,
    },
    {
      id: 'p6',
      name: 'Red Bull Energy Drink',
      brand: 'Red Bull',
      thumbnail: 'https://images.unsplash.com/photo-1510415309060-93fb8b0de80e?auto=format&fit=crop&q=80&w=300',
      mrp: 125,
      sellingPrice: 125,
      unitValue: 250,
      unit: 'ml',
      stockStatus: 'in_stock',
      isBestseller: false,
    },
    {
      id: 'p7',
      name: 'Broccoli',
      brand: 'Fresh Produce',
      thumbnail: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&q=80&w=300',
      mrp: 120,
      sellingPrice: 85,
      unitValue: 1,
      unit: 'pc',
      stockStatus: 'in_stock',
      isBestseller: false,
    },
    {
      id: 'p8',
      name: 'Surf Excel Easy Wash Detergent Powder',
      brand: 'Surf Excel',
      thumbnail: 'https://images.unsplash.com/photo-1582736113105-0a75f1dfab63?auto=format&fit=crop&q=80&w=300',
      mrp: 195,
      sellingPrice: 175,
      unitValue: 1.5,
      unit: 'kg',
      stockStatus: 'in_stock',
      isBestseller: true,
    },
    {
      id: 'p9',
      name: 'Tata Salt',
      brand: 'Tata',
      thumbnail: 'https://images.unsplash.com/photo-1624462966581-bc5d76f56263?auto=format&fit=crop&q=80&w=300',
      mrp: 28,
      sellingPrice: 28,
      unitValue: 1,
      unit: 'kg',
      stockStatus: 'in_stock',
      isBestseller: true,
    },
    {
      id: 'p10',
      name: 'Coca-Cola Soft Drink',
      brand: 'Coca-Cola',
      thumbnail: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300',
      mrp: 95,
      sellingPrice: 90,
      unitValue: 2.25,
      unit: 'L',
      stockStatus: 'in_stock',
      isBestseller: false,
    }
  ];

  const displayBestsellers = bestsellerProducts?.length > 0 ? bestsellerProducts : dummyProducts.slice(0, 10);
  const displayFeatured = featuredProducts?.length > 0 ? featuredProducts : dummyProducts.slice(5, 10).concat(dummyProducts.slice(0, 5));

  const whyChooseUsData = [
    {
      id: 1,
      title: "10-Minute Delivery",
      desc: "Superfast delivery straight to your doorstep, exactly when you need it.",
      icon: <Clock className="w-8 h-8 text-green-500" />
    },
    {
      id: 2,
      title: "Freshness Guaranteed",
      desc: "We source our products directly from farms to ensure maximum freshness and quality.",
      icon: <ShieldCheck className="w-8 h-8 text-green-500" />
    },
    {
      id: 3,
      title: "Wide Assortment",
      desc: "Choose from 5000+ products across daily essentials, fresh produce, and more.",
      icon: <Truck className="w-8 h-8 text-green-500" />
    }
  ];

  return (
    <div className="animate-fade-in bg-gray-50 flex flex-col gap-8 md:gap-12 pb-20">
      
      {/* 1. Modern Hero Section */}
      <section className="relative bg-green-900 overflow-hidden mx-auto w-full max-w-[1920px]">
        {/* Background Image & Gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1974" 
            alt="Grocery background" 
            className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/90 via-green-900/80 to-transparent"></div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10 flex flex-col items-start min-h-[500px] justify-center">
          <div className="max-w-2xl">
            <span className="inline-block py-1.5 px-3 rounded-md bg-green-500/20 text-green-300 font-bold tracking-wider text-xs uppercase mb-6 border border-green-500/30 backdrop-blur-sm">
              100% Fresh & Authentic
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              Groceries delivered in <span className="text-green-400">minutes.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-lg leading-relaxed font-medium">
              Everything you need, right when you need it. Shop fresh produce, daily essentials, and exclusive brands.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/products')}
                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 text-lg flex items-center justify-center gap-2"
              >
                Shop Now
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('categories');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors text-lg flex items-center justify-center"
              >
                Browse Categories
              </button>
            </div>
            
            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10 hidden md:flex">
              <div className="flex items-center gap-2 text-gray-200"><CheckCircle className="w-5 h-5 text-green-400" /><span className="font-semibold text-sm">No minimum order</span></div>
              <div className="flex items-center gap-2 text-gray-200"><CheckCircle className="w-5 h-5 text-green-400" /><span className="font-semibold text-sm">Free delivery on ₹299+</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section id="categories" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding pt-0 shrink-0">
        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="flex flex-col items-center group"
            >
              <div className="w-full aspect-square bg-white rounded-2xl flex items-center justify-center shadow-subtle border border-gray-100 group-hover:border-green-200 group-hover:shadow-md transition-all duration-300 mb-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-4xl md:text-5xl relative z-10 group-hover:scale-110 transition-transform duration-300">{getCategoryEmoji(category.name)}</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 text-center leading-tight group-hover:text-green-600 transition-colors line-clamp-2">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Bestsellers Section (Moved up for priority) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding bg-white rounded-3xl border border-gray-100 shadow-sm shrink-0">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2">Bestsellers</h2>
            <p className="text-gray-500 font-medium">Most loved by our customers</p>
          </div>
          <Link
            to="/products?bestseller=true"
            className="hidden md:flex items-center gap-1 text-green-600 font-bold hover:text-green-700 transition-colors bg-green-50 px-4 py-2 rounded-lg"
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {displayBestsellers.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Link to="/products?bestseller=true" className="md:hidden mt-6 flex items-center justify-center w-full bg-green-50 text-green-600 font-bold py-3 rounded-xl">See all bestsellers</Link>
      </section>

      {/* 4. Featured Products Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding shrink-0">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2">Featured Deals</h2>
            <p className="text-gray-500 font-medium">Handpicked premium selections</p>
          </div>
          <Link
            to="/products?featured=true"
            className="hidden md:flex items-center gap-1 text-green-600 font-bold hover:text-green-700 transition-colors bg-green-50 px-4 py-2 rounded-lg"
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {displayFeatured.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Link to="/products?featured=true" className="md:hidden mt-6 flex items-center justify-center w-full bg-green-50 text-green-600 font-bold py-3 rounded-xl">See all featured</Link>
      </section>

      {/* 5. Why Choose Us Section */}
      <section className="bg-white py-20 border-y border-gray-100 shrink-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Why shop with us?</h2>
            <p className="text-gray-500 text-lg">We are committed to providing the fastest and most reliable grocery shopping experience in the city.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whyChooseUsData.map((feature) => (
              <div key={feature.id} className="text-center p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Download App Promo Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding shrink-0">
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-[2rem] overflow-hidden shadow-xl shadow-green-200">
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-10 md:p-16 text-white z-10">
              <span className="bg-black/20 font-bold tracking-wider text-sm uppercase px-3 py-1.5 rounded-lg inline-block mb-6">Get The App</span>
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                Order faster with <br/>our mobile app
              </h2>
              <p className="text-green-50 text-lg mb-10 font-medium max-w-md">
                Get exclusive app-only deals, track your orders in real-time, and reorder your favorites in 2 clicks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] uppercase font-semibold text-gray-400">Download on the</span>
                    <span className="block text-base leading-none">App Store</span>
                  </div>
                </button>
                <button className="bg-white text-gray-900 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.3,10.84L17.53,12.74L15.4,10.63L20.3,10.84M13.69,12L3.84,2.15L16.81,8.88L14.54,11.15L13.69,12Z"/>
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] uppercase font-semibold text-gray-500">Get it on</span>
                    <span className="block text-base leading-none">Google Play</span>
                  </div>
                </button>
              </div>
            </div>
            {/* Phone Mockup Placeholder */}
            <div className="hidden md:flex items-end justify-center h-full pt-10 px-10 relative">
              <div className="absolute w-[280px] h-[550px] bg-black rounded-[3rem] border-[8px] border-gray-900 shadow-2xl translate-y-16 rotate-12 overflow-hidden">
                {/* Screen Content Mockup */}
                <div className="w-full h-full bg-gray-50 flex flex-col">
                  <div className="h-40 bg-green-500 w-full mb-4"></div>
                  <div className="px-4 grid grid-cols-4 gap-2 mb-4">
                    {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-square bg-white rounded-lg shadow-sm border border-gray-100"></div>)}
                  </div>
                  <div className="px-4 grid grid-cols-2 gap-3 flex-1 overflow-hidden">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-32"></div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function getCategoryEmoji(categoryName) {
  const emojis = {
    'Grocery & Staples': '🌾',
    'Bread & Bakery': '🍞',
    'Dairy': '🥛',
    'Masala & Spices': '🌶️',
    'Sauces & Condiments': '🧂',
    'Snacks & Packaged Food': '🍿',
    'Frozen Items': '🧊',
    'Beverages': '🥤',
    'Household Essentials': '🧹',
    'Personal Care': '🧴',
  };
  return emojis[categoryName] || '📦';
}
