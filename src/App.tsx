import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  PackageX,
  Phone,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { SettingsProvider, useSettings } from './context/SettingsContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailsModal } from './components/ProductDetailsModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CustomerDashboardModal } from './components/CustomerDashboardModal.tsx';
import { AdminLogin } from './admin/AdminLogin.tsx';
import { AdminDashboard } from './admin/AdminDashboard.tsx';
import { getProducts, getCategories } from './services/db.ts';
import { Product, Category } from './types/index.ts';

type AppView = 'store' | 'admin_login' | 'admin_dashboard';

function Storefront() {
  const { settings } = useSettings();
  const { isCartOpen, setIsCartOpen, addToCart } = useCart();
  const { user, isAdmin } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (window.location.pathname.startsWith('/admin/login')) return 'admin_login';
    if (window.location.pathname.startsWith('/admin')) return 'admin_dashboard';
    return 'store';
  });

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);
  const [successOrderAmount, setSuccessOrderAmount] = useState(0);

  // Products and Categories
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  // Popstate listener
  useEffect(() => {
    const handlePop = () => {
      if (window.location.pathname.startsWith('/admin/login')) {
        setCurrentView('admin_login');
      } else if (window.location.pathname.startsWith('/admin')) {
        setCurrentView('admin_dashboard');
      } else {
        setCurrentView('store');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    const path = view === 'admin_dashboard' ? '/admin' : view === 'admin_login' ? '/admin/login' : '/';
    window.history.pushState(null, '', path);
  };

  const loadData = async () => {
    setLoadingProducts(true);
    try {
      const [prods, cats] = await Promise.all([
        getProducts(true),
        getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.warn('Failed to load products or categories', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentView]);

  // Handle Buy Now (adds to cart and triggers checkout immediately)
  const handleBuyNow = (prod: Product, quantity = 1) => {
    addToCart(prod, quantity);
    setIsCartOpen(false);
    setCheckoutOpen(true);
  };

  // Filtered and Sorted Products
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'all' || p.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // If Admin views are active
  if (currentView === 'admin_login') {
    return (
      <AdminLogin
        onLoginSuccess={() => navigateTo('admin_dashboard')}
        onBackToStore={() => navigateTo('store')}
      />
    );
  }

  if (currentView === 'admin_dashboard') {
    if (!isAdmin) {
      return (
        <AdminLogin
          onLoginSuccess={() => navigateTo('admin_dashboard')}
          onBackToStore={() => navigateTo('store')}
        />
      );
    }
    return <AdminDashboard onBackToStore={() => navigateTo('store')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100 selection:bg-emerald-600 selection:text-white">
      {/* Site Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onNavigateAdmin={() => navigateTo(isAdmin ? 'admin_dashboard' : 'admin_login')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1">
        {/* Dynamic Luxury Hero Banner (Split Layout) */}
        {settings.banner_active && !searchQuery && (
          <section className="bg-gradient-to-b from-slate-950 via-[#0C1222] to-[#090D16] border-b border-slate-800/80 py-12 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient emerald & teal glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left 7 Columns: Editorial Copy & CTA */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 shadow-xs">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span>ক্যাশ অন ডেলিভারি সুবিধা সারা দেশে</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] text-balance">
                    {settings.banner_title || 'বাশার শপ - আভিজাত্য ও বিশ্বাসের মেলবন্ধন'}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    {settings.banner_subtitle ||
                      'প্রিমিয়াম কোয়ালিটি পণ্য ও ক্যাশ অন ডেলিভারি সুবিধা সারা বাংলাদেশে। পণ্য হাতে পেয়ে নিশ্চিত হয়ে মূল্য পরিশোধ করুন।'}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <button
                      onClick={() => {
                        const el = document.getElementById('products-catalog');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
                    >
                      <span>পণ্য দেখুন ও অর্ডার করুন</span>
                      <ArrowRight size={16} />
                    </button>

                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                      <Truck size={16} className="text-emerald-400" />
                      <span>ডেলিভারি চার্জ মাত্র ৳ {settings.delivery_fee || 70}</span>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Luxury Visual Showcase */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-4/3 lg:aspect-square bg-slate-950">
                    <img
                      src="/src/assets/images/hero_ecommerce_banner_1791816202365.jpg"
                      alt="Bashar Shop Luxury Lifestyle Showcase"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                      <div className="text-white">
                        <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                          {settings.website_name || 'Bashar Shop'}
                        </p>
                        <p className="text-base font-bold mt-0.5">
                          {settings.store_tagline || 'আসল পণ্যের শতভাগ নিশ্চয়তা'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4-Pillar Trust Strip */}
        <section className="bg-slate-950/70 border-b border-slate-850 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">ক্যাশ অন ডেলিভারি</h4>
                <p className="text-[11px] text-slate-400">পণ্য হাতে পেয়ে টাকা দিন</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">শতভাগ আসল পণ্য</h4>
                <p className="text-[11px] text-slate-400">কোয়ালিটি গ্যারান্টি</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">দ্রুততম ডেলিভারি</h4>
                <p className="text-[11px] text-slate-400">সারা দেশে ২-৩ দিনে</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">সার্বক্ষণিক সাপোর্ট</h4>
                <p className="text-[11px] text-slate-400">{settings.contact_phone || 'সরাসরি হেল্পলাইন'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Section */}
        <section id="products-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {searchQuery ? `"${searchQuery}" এর অনুসন্ধান ফলাফল` : 'আমাদের পণ্য সম্ভার'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {products.length > 0
                  ? `${filteredProducts.length} টি পণ্য প্রদর্শিত হচ্ছে`
                  : 'ক্যাটালগ পণ্য'}
              </p>
            </div>

            {/* Sorting control */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <SlidersHorizontal size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-300">বাছাই করুন:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-xs"
              >
                <option value="newest" className="bg-slate-900 text-white">নতুন পণ্য আগে</option>
                <option value="price_low" className="bg-slate-900 text-white">মূল্য: কম থেকে বেশি</option>
                <option value="price_high" className="bg-slate-900 text-white">মূল্য: বেশি থেকে কম</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills (if categories exist) */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
                }`}
              >
                সকল পণ্য ({products.length})
              </button>
              {categories.map((c) => {
                const count = products.filter((p) => p.category_id === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    {c.name} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
          )}

          {/* Product Grid or Clean Empty State */}
          {loadingProducts ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-400">পণ্য লোড হচ্ছে...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* EXACT REQUIRED NON-NEGOTIABLE EMPTY STATE MESSAGE */
            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 md:p-16 text-center max-w-lg mx-auto shadow-2xl space-y-4 my-8 backdrop-blur-xs">
              <div className="w-20 h-20 rounded-full bg-slate-800/80 text-slate-500 border border-slate-700/80 flex items-center justify-center mx-auto">
                <PackageX size={36} className="text-slate-400" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                এখনো কোনো প্রোডাক্ট যোগ করা হয়নি। নতুন পণ্য শিগগিরই আসছে।
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                আমাদের স্টোর ডাটাবেজ প্রস্তুত রয়েছে। স্টোর অ্যাডমিনিস্ট্রেটর অ্যাডমিন প্যানেল থেকে বাস্তব পণ্য যোগ করার সাথে সাথে পণ্যগুলো এখানে প্রদর্শিত হবে।
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigateTo(isAdmin ? 'admin_dashboard' : 'admin_login')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-950"
                >
                  {isAdmin ? 'অ্যাডমিন প্যানেল থেকে পণ্য যোগ করুন' : 'অ্যাডমিন পোর্টাল'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenDetails={(p) => setSelectedProduct(p)}
                  onBuyNow={(p) => handleBuyNow(p, 1)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer
        onNavigateAdmin={() => navigateTo(isAdmin ? 'admin_dashboard' : 'admin_login')}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={(prod, qty) => handleBuyNow(prod, qty)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={(orderNum, total) => {
          setSuccessOrderNumber(orderNum);
          setSuccessOrderAmount(total);
        }}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        orderNumber={successOrderNumber}
        totalAmount={successOrderAmount}
        onClose={() => setSuccessOrderNumber(null)}
        onViewOrders={() => {
          setSuccessOrderNumber(null);
          if (user) {
            setProfileModalOpen(true);
          } else {
            setAuthModalOpen(true);
          }
        }}
      />

      {/* Customer Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Customer Dashboard Modal */}
      <CustomerDashboardModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <AuthProvider>
          <Storefront />
        </AuthProvider>
      </CartProvider>
    </SettingsProvider>
  );
}
