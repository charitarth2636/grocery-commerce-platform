import { create } from 'zustand';
import { authAPI, productsAPI, cartAPI, ordersAPI } from '../api';

const getInitialUser = () => {
  const isIndependent = sessionStorage.getItem('is_independent') === 'true';
  const user = isIndependent 
    ? sessionStorage.getItem('user') 
    : (localStorage.getItem('user') || sessionStorage.getItem('user'));
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

const getInitialAuth = () => {
  const isIndependent = sessionStorage.getItem('is_independent') === 'true';
  if (isIndependent) {
    return !!sessionStorage.getItem('token');
  }
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
};

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  isAuthenticated: getInitialAuth(),
  isLoading: false,
  
  // Password-based login
  login: async (email, password, rememberMe = true) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(email, password);
      if (!response.success) throw new Error(response.message || 'Login failed');
      
      if (!rememberMe) {
        sessionStorage.setItem('is_independent', 'true');
        // Clear anything in localStorage to prevent cross-tab leaks in THIS session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        sessionStorage.removeItem('is_independent');
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', response.data.accessToken);
      storage.setItem('user', JSON.stringify(response.data.user));
      
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      return { success: true, user: response.data.user };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message || 'Login failed' };
    }
  },
  
  // Password-based signup
  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.signup({ name, email, password });
      if (!response.success) throw new Error(response.message || 'Signup failed');
      
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      return { success: true, user: response.data.user };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message || 'Signup failed' };
    }
  },
  
  logout: () => {
    const isIndependent = sessionStorage.getItem('is_independent') === 'true';
    if (isIndependent) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('is_independent');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
    set({ user: null, isAuthenticated: false });
  },
  
  fetchProfile: async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data;
      set({ user: userData });
      
      const isIndependent = sessionStorage.getItem('is_independent') === 'true';
      if (isIndependent || !localStorage.getItem('token')) {
        sessionStorage.setItem('user', JSON.stringify(userData));
      } else {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  },

  updateAvailability: async (isAvailable) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch('/api/delivery/status', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ isAvailable })
      });
      const data = await res.json();
      if (data.success) {
        const newUser = { ...get().user, isAvailable };
        set({ user: newUser });
        
        const isIndependent = sessionStorage.getItem('is_independent') === 'true';
        if (isIndependent || !localStorage.getItem('token')) {
          sessionStorage.setItem('user', JSON.stringify(newUser));
        } else {
          localStorage.setItem('user', JSON.stringify(newUser));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update availability:', error);
      return false;
    }
  }
}));

export const useProductStore = create((set) => ({
  categories: [],
  products: [],
  featuredProducts: [],
  bestsellerProducts: [],
  currentProduct: null,
  isLoading: false,
  
  fetchCategories: async () => {
    try {
      const response = await productsAPI.getCategories();
      set({ categories: response.data });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },
  
  fetchProducts: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await productsAPI.getProducts(params);
      set({ products: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch products:', error);
    }
  },
  
  fetchFeatured: async () => {
    try {
      const response = await productsAPI.getFeatured();
      set({ featuredProducts: response.data });
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    }
  },
  
  fetchBestsellers: async () => {
    try {
      const response = await productsAPI.getBestsellers();
      set({ bestsellerProducts: response.data });
    } catch (error) {
      console.error('Failed to fetch bestseller products:', error);
    }
  },
  
  fetchProduct: async (id) => {
    set({ isLoading: true });
    try {
      const response = await productsAPI.getProduct(id);
      set({ currentProduct: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch product:', error);
    }
  },
}));

export const useCartStore = create((set, get) => ({
  cart: { items: [], subtotal: 0, itemCount: 0 },
  isLoading: false,
  
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartAPI.getCart();
      set({ cart: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch cart:', error);
    }
  },
  
  addToCart: async (productId, quantity = 1) => {
    try {
      await cartAPI.addToCart(productId, quantity);
      await get().fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  updateQuantity: async (productId, quantity) => {
    try {
      await cartAPI.updateCartItem(productId, quantity);
      await get().fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  removeItem: async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      await get().fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  clearCart: async () => {
    try {
      await cartAPI.clearCart();
      set({ cart: { items: [], subtotal: 0, itemCount: 0 } });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  },
}));

export const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  
  createOrder: async (orderData) => {
    set({ isLoading: true });
    try {
      const response = await ordersAPI.createOrder(orderData);
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
  
  fetchOrders: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await ordersAPI.getOrders(params);
      set({ orders: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch orders:', error);
    }
  },
  
  fetchOrder: async (id) => {
    set({ isLoading: true });
    try {
      const response = await ordersAPI.getOrder(id);
      set({ currentOrder: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch order:', error);
    }
  },
  
  cancelOrder: async (id, reason) => {
    set({ isLoading: true });
    try {
      await ordersAPI.cancelOrder(id, reason);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
}));

export const useLocationStore = create((set) => ({
  location: JSON.parse(localStorage.getItem('user_location')) || null,
  isLoading: false,
  error: null,
  
  detectLocation: async () => {
    set({ isLoading: true, error: null });
    
    if (!navigator.geolocation) {
      set({ isLoading: false, error: 'Geolocation is not supported by your browser' });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding using OpenStreetMap Nominatim API
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.address?.state_district || 'Unknown Location';
          const pincode = data.address?.postcode || '';
          
          const newLocation = { lat: latitude, lng: longitude, city, pincode };
          
          localStorage.setItem('user_location', JSON.stringify(newLocation));
          set({ location: newLocation, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: 'Failed to detect location details' });
        }
      },
      (error) => {
        set({ isLoading: false, error: 'Location permission denied. Please set manually.' });
      }
    );
  },
  
  setLocation: (location) => {
    localStorage.setItem('user_location', JSON.stringify(location));
    set({ location });
  }
}));
