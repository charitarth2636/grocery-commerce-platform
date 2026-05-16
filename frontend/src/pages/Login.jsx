import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Mail, Lock, User, ArrowLeft, ShoppingBag, Eye, EyeOff, ShieldCheck, Truck, Clock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuthStore();
  
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRider, setIsRider] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    const result = await login(email, password, rememberMe);
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else if (result.user?.role === 'delivery_partner') {
        navigate('/delivery');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await signup(name, email, password, isRider ? 'delivery_partner' : 'customer');
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else if (result.user?.role === 'delivery_partner') {
        navigate('/delivery');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Column - Image & Branding (Hidden on mobile wrapper) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-900 overflow-hidden isolate">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1974" 
            alt="Fresh produce" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-16 h-full w-full">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 text-white hover:text-emerald-200 transition-colors">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <ShoppingBag className="w-6 h-6 text-emerald-300" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Local Grocery</span>
            </Link>
          </div>

          <div className="max-w-md animate-slide-up">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Farm-fresh groceries, <br/>delivered to your door.
            </h2>
            <p className="text-emerald-100/80 text-lg mb-10 leading-relaxed">
              Experience the best quality everyday essentials, handpicked and delivered exactly when you need them.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-emerald-50">
                <div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center border border-emerald-700">
                  <Truck className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-semibold">Free Delivery</h4>
                  <p className="text-sm text-emerald-200/70">On orders above ₹500</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-emerald-50">
                <div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center border border-emerald-700">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-semibold">Quality Guaranteed</h4>
                  <p className="text-sm text-emerald-200/70">100% fresh or replaced</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-emerald-50">
                <div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center border border-emerald-700">
                  <Clock className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-semibold">Scheduled Delivery</h4>
                  <p className="text-sm text-emerald-200/70">Pick a slot that works for you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Subtle background decoration for form side */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10 animate-fade-in">
          
          <Link 
            to="/" 
            className="lg:hidden inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-8 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm w-max"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="bg-white/70 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-8 lg:p-0 rounded-3xl shadow-xl shadow-slate-200/50 lg:shadow-none border border-white/50 lg:border-none">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {mode === 'login' ? 'Welcome back' : 'Create an account'}
              </h1>
              <p className="text-slate-500 mt-3 text-sm lg:text-base">
                {mode === 'login' 
                  ? 'Please enter your details to sign in.' 
                  : 'Start shopping for fresh groceries today.'
                }
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3 animate-fade-in">
                <div className="mt-0.5"><ShieldCheck className="w-4 h-4 text-red-500" /></div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-6">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="input-field pl-12"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {mode === 'login' ? (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer" 
                      checked={!rememberMe}
                      onChange={(e) => setRememberMe(!e.target.checked)}
                    />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">Independent Tab Session</span>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-wider"
                  >
                    Forgot password?
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="animate-slide-up" style={{ animationDuration: '0.3s' }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field pl-12 pr-12"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer" 
                        checked={isRider}
                        onChange={(e) => setIsRider(e.target.checked)}
                      />
                      <div className="flex items-center gap-2">
                        <Truck className={`w-4 h-4 ${isRider ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">Register as Delivery Partner</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 text-base mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-200">
              {mode === 'login' ? (
                <p className="text-slate-500 text-center">
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setMode('signup'); setError(''); }}
                    className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-slate-500 text-center">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
            
            <p className="text-xs text-center text-slate-400 mt-8">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
