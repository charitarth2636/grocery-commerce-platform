import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 md:pb-16 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 shrink-0 mb-6 group">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <span className="text-white font-extrabold text-xl font-serif">G</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Local Grocery</h1>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Your one-stop destination for fresh groceries, daily essentials, and household items delivered right to your doorstep in minutes.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-6">Explore</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">About Us</Link></li>
              <li><Link to="/products" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">All Products</Link></li>
              <li><Link to="/products?featured=true" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Featured Items</Link></li>
              <li><Link to="/products?bestseller=true" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Bestsellers</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-6">Customer Service</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Help & FAQs</a></li>
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Shipping & Delivery</a></li>
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Returns & Refunds</a></li>
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-6">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-gray-500 text-sm">
                <MapPin className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>123 Fresh Market Street, Grocery Lane, Food City, FC 12345</span>
              </li>
              <li className="flex items-center gap-4 text-gray-500 text-sm">
                <Phone className="w-5 h-5 text-green-500 shrink-0" />
                <span>+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center gap-4 text-gray-500 text-sm">
                <Mail className="w-5 h-5 text-green-500 shrink-0" />
                <span>support@localgrocery.com</span>
              </li>
              <li className="flex items-start gap-4 text-gray-500 text-sm">
                <Clock className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-gray-700">Operating Hours</span>
                  <span>Mon - Sun: 7:00 AM - 11:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Local Grocery. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Secure Payments via</span>
            <div className="flex gap-2 opacity-60">
              <div className="w-10 h-6 bg-gray-200 rounded"></div>
              <div className="w-10 h-6 bg-gray-200 rounded"></div>
              <div className="w-10 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
