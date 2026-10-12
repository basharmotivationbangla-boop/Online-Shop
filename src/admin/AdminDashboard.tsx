import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Settings as SettingsIcon,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  LogOut,
  Save,
  DollarSign,
  AlertCircle,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Printer,
  ChevronRight,
  Menu,
  X,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getOrders,
  updateOrderStatus,
  getAdminStats,
} from '../services/db.ts';
import {
  Product,
  Category,
  Order,
  OrderStatus,
  AdminStats,
  SiteSettings,
} from '../types/index.ts';
import { BD_DISTRICTS, formatBDT, formatDateBD } from '../utils/constants.ts';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

type AdminTab = 'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { settings, updateSettings } = useSettings();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Stats State
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    publishedProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });

  // Data Collections
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals & Forms
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Logo Quick Modal State
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [quickLogoSaving, setQuickLogoSaving] = useState(false);
  const [logoSaveSuccess, setLogoSaveSuccess] = useState('');

  // Product Form State
  const [pName, setPName] = useState('');
  const [pSlug, setPSlug] = useState('');
  const [pSku, setPSku] = useState('');
  const [pCategoryId, setPCategoryId] = useState('');
  const [pPrice, setPPrice] = useState<number>(0);
  const [pComparePrice, setPComparePrice] = useState<number | undefined>(undefined);
  const [pStock, setPStock] = useState<number>(10);
  const [pDescription, setPDescription] = useState('');
  const [pImages, setPImages] = useState<string[]>([]);
  const [pImageInput, setPImageInput] = useState('');
  const [pIsActive, setPIsActive] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

  // Category Form State
  const [cName, setCName] = useState('');
  const [cSlug, setCSlug] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cIsActive, setCIsActive] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);

  // Settings Form State
  const [sWebsiteName, setSWebsiteName] = useState(settings.website_name || 'Bashar Shop');
  const [sLogoUrl, setSLogoUrl] = useState(settings.logo_url || '');
  const [sTagline, setSTagline] = useState(settings.store_tagline || '');
  const [sPhone, setSPhone] = useState(settings.contact_phone || '');
  const [sEmail, setSEmail] = useState(settings.contact_email || '');
  const [sAddress, setSAddress] = useState(settings.store_address || '');
  const [sDeliveryFee, setSDeliveryFee] = useState(settings.delivery_fee || 70);
  const [sBannerTitle, setSBannerTitle] = useState(settings.banner_title || '');
  const [sBannerSubtitle, setSBannerSubtitle] = useState(settings.banner_subtitle || '');
  const [sBannerActive, setSBannerActive] = useState(settings.banner_active ?? true);
  const [sAnnouncement, setSAnnouncement] = useState(settings.announcement || '');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Quick Save Logo to Firestore
  const handleQuickSaveLogo = async (overrideUrl?: string) => {
    const target = overrideUrl !== undefined ? overrideUrl : sLogoUrl;
    setQuickLogoSaving(true);
    setLogoSaveSuccess('');
    try {
      await updateSettings({
        logo_url: target.trim() || undefined,
      });
      setSLogoUrl(target);
      setLogoSaveSuccess('ওয়েবসাইটের লোগো সফলভাবে সংরক্ষিত ও সাইটজুড়ে আপডেট হয়েছে!');
      setTimeout(() => {
        setLogoSaveSuccess('');
      }, 3500);
    } catch (err) {
      console.error('Failed to save logo:', err);
    } finally {
      setQuickLogoSaving(false);
    }
  };

  // Initial Data Load
  const refreshAll = async () => {
    setLoadingData(true);
    try {
      const [prods, cats, ords, st] = await Promise.all([
        getProducts(false),
        getCategories(),
        getOrders(),
        getAdminStats(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setStats(st);
    } catch (e) {
      console.error('Error refreshing admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Sync settings state when context changes
  useEffect(() => {
    setSWebsiteName(settings.website_name || 'Bashar Shop');
    setSLogoUrl(settings.logo_url || '');
    setSTagline(settings.store_tagline || '');
    setSPhone(settings.contact_phone || '');
    setSEmail(settings.contact_email || '');
    setSAddress(settings.store_address || '');
    setSDeliveryFee(settings.delivery_fee || 70);
    setSBannerTitle(settings.banner_title || '');
    setSBannerSubtitle(settings.banner_subtitle || '');
    setSBannerActive(settings.banner_active ?? true);
    setSAnnouncement(settings.announcement || '');
  }, [settings]);

  // ================= LOGO UPLOAD HANDLER =================
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ================= PRODUCT HANDLERS =================
  const openNewProductModal = () => {
    setEditingProduct(null);
    setPName('');
    setPSlug('');
    setPSku('');
    setPCategoryId(categories[0]?.id || '');
    setPPrice(0);
    setPComparePrice(undefined);
    setPStock(10);
    setPDescription('');
    setPImages([]);
    setPImageInput('');
    setPIsActive(true);
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPSlug(prod.slug);
    setPSku(prod.sku || '');
    setPCategoryId(prod.category_id || '');
    setPPrice(prod.price);
    setPComparePrice(prod.compare_at_price);
    setPStock(prod.stock_quantity);
    setPDescription(prod.description);
    setPImages(prod.images || []);
    setPImageInput('');
    setPIsActive(prod.is_active);
    setProductModalOpen(true);
  };

  const handleAddImage = () => {
    if (pImageInput.trim()) {
      setPImages((prev) => [...prev, pImageInput.trim()]);
      setPImageInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    setSavingProduct(true);
    try {
      const categoryObj = categories.find((c) => c.id === pCategoryId);
      const slugVal =
        pSlug.trim() ||
        pName
          .toLowerCase()
          .replace(/[^\w\u0980-\u09FF\s-]/g, '')
          .replace(/\s+/g, '-');

      const payload = {
        name: pName.trim(),
        slug: slugVal,
        sku: pSku.trim() || undefined,
        category_id: pCategoryId || undefined,
        category_name: categoryObj?.name || undefined,
        price: Number(pPrice),
        compare_at_price: pComparePrice ? Number(pComparePrice) : undefined,
        stock_quantity: Number(pStock),
        description: pDescription.trim(),
        images: pImages.length > 0 ? pImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
        is_active: pIsActive,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setProductModalOpen(false);
      await refreshAll();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান? পূর্ববর্তী অর্ডারের রেকর্ড নিরাপদ থাকবে।')) {
      await deleteProduct(id);
      await refreshAll();
    }
  };

  const handleTogglePublish = async (prod: Product) => {
    await updateProduct(prod.id, { is_active: !prod.is_active });
    await refreshAll();
  };

  // ================= CATEGORY HANDLERS =================
  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCName('');
    setCSlug('');
    setCDescription('');
    setCIsActive(true);
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCName(cat.name);
    setCSlug(cat.slug);
    setCDescription(cat.description || '');
    setCIsActive(cat.is_active);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;

    setSavingCategory(true);
    try {
      const slugVal =
        cSlug.trim() ||
        cName
          .toLowerCase()
          .replace(/[^\w\u0980-\u09FF\s-]/g, '')
          .replace(/\s+/g, '-');

      const payload = {
        name: cName.trim(),
        slug: slugVal,
        description: cDescription.trim() || undefined,
        is_active: cIsActive,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }

      setCategoryModalOpen(false);
      await refreshAll();
    } catch (err) {
      console.error('Failed to save category:', err);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('এই ক্যাটাগরিটি মুছে ফেলতে চান?')) {
      await deleteCategory(id);
      await refreshAll();
    }
  };

  // ================= ORDER STATUS HANDLER =================
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
      await refreshAll();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // ================= SETTINGS SAVE HANDLER =================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess('');
    try {
      await updateSettings({
        website_name: sWebsiteName.trim(),
        logo_url: sLogoUrl.trim() || undefined,
        store_tagline: sTagline.trim() || undefined,
        contact_phone: sPhone.trim() || undefined,
        contact_email: sEmail.trim() || undefined,
        store_address: sAddress.trim() || undefined,
        delivery_fee: Number(sDeliveryFee),
        banner_title: sBannerTitle.trim() || undefined,
        banner_subtitle: sBannerSubtitle.trim() || undefined,
        banner_active: sBannerActive,
        announcement: sAnnouncement.trim() || undefined,
      });
      setSettingsSuccess('সাইট সেটিংস ও লোগো সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
    const matchCat =
      productCategoryFilter === 'all' || p.category_id === productCategoryFilter;
    return matchSearch && matchCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_phone.includes(orderSearch);
    const matchStatus =
      orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  // Customers extraction
  const customerMap = new Map<string, { name: string; phone: string; address: string; orderCount: number; totalSpent: number }>();
  orders.forEach((o) => {
    const key = o.customer_phone || o.customer_name;
    const existing = customerMap.get(key);
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += o.total_amount || 0;
    } else {
      customerMap.set(key, {
        name: o.customer_name,
        phone: o.customer_phone,
        address: `${o.shipping_address}, ${o.area}, ${o.district}`,
        orderCount: 1,
        totalSpent: o.total_amount || 0,
      });
    }
  });
  const customersList = Array.from(customerMap.values());

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 text-white shrink-0 p-5 justify-between">
        <div className="space-y-6">
          {/* Admin Header & Dynamic Logo */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <button
              onClick={() => setLogoModalOpen(true)}
              className="flex items-center gap-3 group text-left cursor-pointer transition-transform hover:scale-[1.02]"
              title="ওয়েবসাইট লোগো পরিবর্তন ও আপলোড করুন"
            >
              {settings.logo_url ? (
                <div className="relative">
                  <img
                    src={settings.logo_url}
                    alt={settings.website_name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-md group-hover:border-emerald-400 transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-[9px] text-white shadow-xs">
                    +
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:ring-2 group-hover:ring-emerald-400">
                  {settings.website_name ? settings.website_name.charAt(0) : 'B'}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-black text-sm text-white truncate group-hover:text-emerald-400 transition-colors">
                  {settings.website_name || 'Bashar Shop'}
                </h2>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>লোগো পরিবর্তন</span>
                </span>
              </div>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>ড্যাশবোর্ড ওভারভিউ</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Package size={18} />
              <span>পণ্য ব্যবস্থাপনা ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FolderTree size={18} />
              <span>ক্যাটাগরি সমূহ ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} />
                <span>অর্ডার সমূহ</span>
              </div>
              {stats.pendingOrders > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {stats.pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users size={18} />
              <span>গ্রাহক তালিকা ({customersList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <SettingsIcon size={18} />
              <span>ওয়েবসাইট ও লোগো সেটিংস</span>
            </button>
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <ExternalLink size={16} />
            <span>ওয়েবসাইটে ফিরে যান</span>
          </button>

          <button
            onClick={() => {
              logout();
              onBackToStore();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden bg-slate-950 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              {settings.website_name ? settings.website_name.charAt(0) : 'B'}
            </div>
          )}
          <span className="font-bold text-sm">{settings.website_name} অ্যাডমিন</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
        >
          {mobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {/* Top Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeTab === 'overview' && 'ড্যাশবোর্ড ওভারভিউ ও রিপোর্ট'}
              {activeTab === 'products' && 'পণ্য ক্যাটালগ ও স্টক ব্যবস্থাপনা'}
              {activeTab === 'categories' && 'ক্যাটাগরি ও বিভাগ সমূহ'}
              {activeTab === 'orders' && 'ক্যাশ অন ডেলিভারি অর্ডার তালিকা'}
              {activeTab === 'customers' && 'নিবন্ধিত ও ক্রেতা গ্রাহক ডিরেক্টরি'}
              {activeTab === 'settings' && 'ডাইনামিক ওয়েবসাইট ও লোগো সেটিংস'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ডাটাবেজ: রিয়েলটাইম ক্লাউড ফায়ারস্টোর • ক্যাশ অন ডেলিভারি মোড
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setLogoModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600/25 via-emerald-600/25 to-teal-600/25 hover:from-amber-600/40 hover:to-emerald-600/40 border border-emerald-500/50 hover:border-emerald-400 rounded-xl text-xs font-bold text-emerald-300 shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Upload size={14} className="text-amber-400" />
              <span>ওয়েবসাইটের লোগো পরিবর্তন</span>
            </button>
            <button
              onClick={refreshAll}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-semibold text-slate-200 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>রিফ্রেশ</span>
            </button>
            <button
              onClick={onBackToStore}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>ওয়েবসাইট দেখুন</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 pt-6">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট অর্ডার</span>
                <p className="text-2xl font-black text-white mt-1 tabular-nums">{stats.totalOrders}</p>
                <span className="text-[10px] text-slate-500">ডাটাবেজে সংরক্ষিত অর্ডার</span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/30">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">অপেক্ষমান অর্ডার</span>
                <p className="text-2xl font-black text-amber-300 mt-1 tabular-nums">{stats.pendingOrders}</p>
                <span className="text-[10px] text-amber-500/80">অনুমোদনের অপেক্ষায়</span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-blue-500/30">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">নিশ্চিত অর্ডার</span>
                <p className="text-2xl font-black text-blue-300 mt-1 tabular-nums">{stats.confirmedOrders}</p>
                <span className="text-[10px] text-blue-500/80">প্রসেসিং ও শিপিং</span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/30">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">ডেলিভারি সম্পন্ন</span>
                <p className="text-2xl font-black text-emerald-300 mt-1 tabular-nums">{stats.deliveredOrders}</p>
                <span className="text-[10px] text-emerald-500/80">সফল ডেলিভারি</span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট পণ্য</span>
                <p className="text-2xl font-black text-white mt-1 tabular-nums">{stats.totalProducts}</p>
                <span className="text-[10px] text-slate-500">ক্যাটালগ পণ্য</span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/30">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">প্রকাশিত পণ্য</span>
                <p className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">{stats.publishedProducts}</p>
                <span className="text-[10px] text-slate-500">ওয়েবসাইটে লাইভ</span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-rose-500/30">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">বাতিল অর্ডার</span>
                <p className="text-2xl font-black text-rose-400 mt-1 tabular-nums">{stats.cancelledOrders}</p>
                <span className="text-[10px] text-rose-500/80">বাতিলকৃত</span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/40">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">মোট ডেলিভারি আয়</span>
                <p className="text-2xl font-black text-emerald-300 mt-1 tabular-nums">{formatBDT(stats.totalRevenue)}</p>
                <span className="text-[10px] text-slate-400">ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white">দ্রুত শর্টকাট</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      openNewProductModal();
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus size={16} /> নতুন পণ্য যোগ করুন
                    </span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('categories');
                      openNewCategoryModal();
                    }}
                    className="w-full py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FolderTree size={16} /> নতুন ক্যাটাগরি তৈরি
                    </span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <SettingsIcon size={16} /> লোগো ও দোকানের নাম পরিবর্তন
                    </span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Recent Orders table */}
              <div className="lg:col-span-2 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">সাম্প্রতিক অর্ডার</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    সব দেখুন ({orders.length})
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    এখনও কোনো অর্ডার পাওয়া যায়নি। গ্রাহক চেকআউট করলে এখানে প্রদর্শিত হবে।
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-bold">
                          <th className="pb-2">অর্ডার নং</th>
                          <th className="pb-2">গ্রাহক</th>
                          <th className="pb-2">মূল্য</th>
                          <th className="pb-2">অবস্থা</th>
                          <th className="pb-2">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-850/60">
                            <td className="py-2.5 font-mono font-bold text-emerald-400">
                              #{ord.order_number}
                            </td>
                            <td className="py-2.5">
                              <p className="font-semibold text-white">{ord.customer_name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{ord.customer_phone}</p>
                            </td>
                            <td className="py-2.5 font-black text-white tabular-nums">
                              {formatBDT(ord.total_amount)}
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ord.status === 'Pending'
                                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                    : ord.status === 'Delivered'
                                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="text-emerald-400 hover:underline font-bold cursor-pointer"
                              >
                                বিস্তারিত
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRODUCTS ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 pt-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1 max-w-lg">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="পণ্য খুঁজুন (নাম বা SKU)..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
                >
                  <option value="all">সকল ক্যাটাগরি</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={openNewProductModal}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer"
              >
                <Plus size={16} />
                <span>নতুন পণ্য যোগ করুন</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center mx-auto">
                    <Package size={28} />
                  </div>
                  <h3 className="font-bold text-white text-base">
                    এখনও কোনো পণ্য নেই
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    ডাটাবেজ সম্পূর্ণ খালি রাখা হয়েছে। ওয়েবসাইটে পণ্য প্রদর্শন করতে ওপরের "নতুন পণ্য যোগ করুন" বাটনে ক্লিক করুন।
                  </p>
                  <button
                    onClick={openNewProductModal}
                    className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    প্রথম পণ্য যোগ করুন
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">ছবি ও নাম</th>
                        <th className="py-3 px-4">ক্যাটাগরি</th>
                        <th className="py-3 px-4">মূল্য</th>
                        <th className="py-3 px-4">স্টক</th>
                        <th className="py-3 px-4">অবস্থা</th>
                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredProducts.map((p) => {
                        const img =
                          p.images && p.images.length > 0
                            ? p.images[0]
                            : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                        return (
                          <tr key={p.id} className="hover:bg-slate-850/60 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={img}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate max-w-[200px]" title={p.name}>
                                  {p.name}
                                </p>
                                {p.sku && <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-400 font-medium">
                              {p.category_name || 'সাধারণ'}
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-black text-emerald-400 tabular-nums">{formatBDT(p.price)}</span>
                              {p.compare_at_price && (
                                <span className="text-[10px] text-slate-500 line-through block tabular-nums">
                                  {formatBDT(p.compare_at_price)}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`font-bold tabular-nums ${
                                  p.stock_quantity <= 0 ? 'text-rose-400' : 'text-slate-300'
                                }`}
                              >
                                {p.stock_quantity} টি
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleTogglePublish(p)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                  p.is_active
                                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                                }`}
                              >
                                {p.is_active ? 'প্রকাশিত (Live)' : 'লুকানো (Hidden)'}
                              </button>
                            </td>

                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => openEditProductModal(p)}
                                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="এডিট করুন"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: CATEGORIES ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-white">পণ্য ক্যাটাগরি তালিকা</h3>
                <p className="text-xs text-slate-400">গ্রাহকদের সহজ ব্রাউজিংয়ের জন্য ক্যাটাগরি তৈরি করুন</p>
              </div>

              <button
                onClick={openNewCategoryModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
              >
                <Plus size={16} />
                <span>নতুন ক্যাটাগরি</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.length === 0 ? (
                <div className="col-span-full py-16 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-2">
                  <FolderTree size={32} className="text-slate-500 mx-auto" />
                  <h4 className="font-bold text-white text-sm">কোনো ক্যাটাগরি নেই</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    ডাটাবেজ সম্পূর্ণ ক্লিন রয়েছে। ক্যাটাগরি যোগ করতে ওপরের বাটনে চাপুন।
                  </p>
                </div>
              ) : (
                categories.map((c) => {
                  const count = products.filter((p) => p.category_id === c.id).length;
                  return (
                    <div
                      key={c.id}
                      className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white text-sm">{c.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.is_active ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {c.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">/{c.slug}</p>
                        {c.description && (
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">{c.description}</p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">{count} টি পণ্য</span>
                        <div className="space-x-1">
                          <button
                            onClick={() => openEditCategoryModal(c)}
                            className="p-1 text-slate-400 hover:text-emerald-400 cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 pt-6">
            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1 max-w-lg">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="অর্ডার নং, নাম বা ফোন নম্বর খুঁজুন..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
                >
                  <option value="all">সব অর্ডার স্ট্যাটাস</option>
                  <option value="Pending">অপেক্ষমান (Pending)</option>
                  <option value="Confirmed">নিশ্চিত (Confirmed)</option>
                  <option value="Processing">প্রসেসিং (Processing)</option>
                  <option value="Shipped">ডেলিভারির পথে (Shipped)</option>
                  <option value="Delivered">ডেলিভারি সম্পন্ন (Delivered)</option>
                  <option value="Cancelled">বাতিল (Cancelled)</option>
                </select>
              </div>

              <span className="text-xs text-slate-400 font-semibold tabular-nums">
                মোট অর্ডার: {filteredOrders.length} টি
              </span>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <ShoppingBag size={32} className="text-slate-500 mx-auto" />
                  <h4 className="font-bold text-white text-sm">কোনো অর্ডার মেলেনি</h4>
                  <p className="text-xs text-slate-400">গ্রাহক ক্যাশ অন ডেলিভারিতে অর্ডার দিলে এখানে আসবে।</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">অর্ডার নম্বর</th>
                        <th className="py-3 px-4">তারিখ</th>
                        <th className="py-3 px-4">গ্রাহক ও মোবাইল</th>
                        <th className="py-3 px-4">জেলা ও ঠিকানা</th>
                        <th className="py-3 px-4">সর্বমোট</th>
                        <th className="py-3 px-4">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-850/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-black text-emerald-400">
                            #{ord.order_number}
                          </td>

                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {formatDateBD(ord.created_at)}
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{ord.customer_name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{ord.customer_phone}</p>
                          </td>

                          <td className="py-3 px-4 max-w-[200px] truncate text-slate-400">
                            {ord.shipping_address}, {ord.district}
                          </td>

                          <td className="py-3 px-4 font-black text-white tabular-nums">
                            {formatBDT(ord.total_amount)}
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                              }
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-hidden cursor-pointer ${
                                ord.status === 'Pending'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : ord.status === 'Confirmed'
                                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                  : ord.status === 'Delivered'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : ord.status === 'Cancelled'
                                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                  : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              }`}
                            >
                              <option value="Pending" className="bg-slate-900 text-white">Pending (অপেক্ষমান)</option>
                              <option value="Confirmed" className="bg-slate-900 text-white">Confirmed (নিশ্চিত)</option>
                              <option value="Processing" className="bg-slate-900 text-white">Processing (প্রসেসিং)</option>
                              <option value="Shipped" className="bg-slate-900 text-white">Shipped (পথে)</option>
                              <option value="Delivered" className="bg-slate-900 text-white">Delivered (ডেলিভার্ড)</option>
                              <option value="Cancelled" className="bg-slate-900 text-white">Cancelled (বাতিল)</option>
                            </select>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              বিস্তারিত
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: CUSTOMERS ================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6 pt-6">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              {customersList.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Users size={32} className="text-slate-500 mx-auto" />
                  <h4 className="font-bold text-white text-sm">কোনো গ্রাহক পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-400">গ্রাহকরা রেজিস্ট্রেশন বা অর্ডার করলে এখানে তালিকা তৈরি হবে।</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">গ্রাহকের নাম</th>
                        <th className="py-3 px-4">মোবাইল নম্বর</th>
                        <th className="py-3 px-4">ঠিকানা</th>
                        <th className="py-3 px-4">মোট অর্ডার</th>
                        <th className="py-3 px-4 text-right">মোট ক্রয়মূল্য</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {customersList.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-850/60">
                          <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{c.phone}</td>
                          <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{c.address}</td>
                          <td className="py-3 px-4 font-semibold text-slate-300 tabular-nums">{c.orderCount} টি</td>
                          <td className="py-3 px-4 text-right font-black text-emerald-400 tabular-nums">
                            {formatBDT(c.totalSpent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 6: SETTINGS & CUSTOM LOGO ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-6 pt-6">
            <form onSubmit={handleSaveSettings} className="bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
              {settingsSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {/* LOGO CUSTOMIZATION SECTION (User explicitly requested freedom to add logo at will) */}
              <div className="space-y-4 bg-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ImageIcon size={16} className="text-emerald-400" />
                      <span>ওয়েবসাইটের লোগো পরিবর্তন ও আপলোড</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      কম্পিউটার বা ফোন থেকে সরাসরি আপনার ইচ্ছামতো যেকোনো লোগো আপলোড করুন বা লিংক দিন
                    </p>
                  </div>
                  {sLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setSLogoUrl('')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      লোগো মুছে ফেলুন (রিসেট)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  {/* Left: Logo Live Preview */}
                  <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">লাইভ প্রিভিউ</span>
                    {sLogoUrl ? (
                      <img
                        src={sLogoUrl}
                        alt="Logo Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/60 shadow-xl shadow-emerald-950"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-3xl shadow-lg">
                        {sWebsiteName ? sWebsiteName.charAt(0) : 'B'}
                      </div>
                    )}
                    <span className="text-xs font-bold text-white mt-1">{sWebsiteName || 'Bashar Shop'}</span>
                    <span className="text-[10px] text-slate-500">হেডারে ও ফুটারে প্রদর্শিত হবে</span>
                  </div>

                  {/* Right: Upload File & URL Controls */}
                  <div className="sm:col-span-8 space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        ১. সরাসরি ফাইল আপলোড করুন (ছবি/লোগো)
                      </label>
                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-850 text-white border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl text-xs font-bold cursor-pointer transition-all">
                        <Upload size={16} className="text-emerald-400" />
                        <span>ডিভাইস থেকে লোগো নির্বাচন করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        ২. অথবা অনলাইন ইমেজ লিংক (Logo URL)
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={sLogoUrl}
                        onChange={(e) => setSLogoUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Instant Save & Presets */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-850">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickSaveLogo()}
                          disabled={quickLogoSaving}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Save size={14} />
                          <span>{quickLogoSaving ? 'সংরক্ষণ হচ্ছে...' : 'লোগো সরাসরি সেভ করুন'}</span>
                        </button>
                        {logoSaveSuccess && (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle size={14} /> {logoSaveSuccess}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">প্রিসেট:</span>
                        <button
                          type="button"
                          onClick={() => setSLogoUrl('/src/assets/images/store_logo_mark_1791816215370.jpg')}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          গোল্ডেন মোনোগ্রাম
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branding Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  দোকানের ব্র্যান্ডিং ও নাম
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      ওয়েবসাইটের নাম <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sWebsiteName}
                      onChange={(e) => setSWebsiteName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      নাম পরিবর্তন করলে সাইটের হেডার, ফুটার ও ব্রাউজার টাইটেলে সরাসরি লাইভ আপডেট হবে।
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      স্টোর ট্যাগলাইন / স্লোগান
                    </label>
                    <input
                      type="text"
                      value={sTagline}
                      onChange={(e) => setSTagline(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Delivery Section */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  যোগাযোগ ও ডেলিভারি চার্জ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      যোগাযোগ ফোন নম্বর
                    </label>
                    <input
                      type="text"
                      value={sPhone}
                      onChange={(e) => setSPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      যোগাযোগ ইমেইল
                    </label>
                    <input
                      type="email"
                      value={sEmail}
                      onChange={(e) => setSEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      স্টোর ঠিকানা
                    </label>
                    <input
                      type="text"
                      value={sAddress}
                      onChange={(e) => setSAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      ডিফল্ট ডেলিভারি চার্জ (৳ BDT)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={sDeliveryFee}
                      onChange={(e) => setSDeliveryFee(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Homepage Content & Banner Section */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  হোমপেজ ব্যানার ও ঘোষণা বার
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    টপ অ্যানাউন্সমেন্ট বার টেক্সট
                  </label>
                  <input
                    type="text"
                    value={sAnnouncement}
                    onChange={(e) => setSAnnouncement(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      হোমপেজ ব্যানার টাইটেল
                    </label>
                    <input
                      type="text"
                      value={sBannerTitle}
                      onChange={(e) => setSBannerTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      হোমপেজ ব্যানার সাবটাইটেল
                    </label>
                    <input
                      type="text"
                      value={sBannerSubtitle}
                      onChange={(e) => setSBannerSubtitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="bannerToggle"
                    checked={sBannerActive}
                    onChange={(e) => setSBannerActive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="bannerToggle" className="text-xs font-bold text-slate-300 cursor-pointer">
                    হোমপেজে হিরো ব্যানার প্রদর্শন করুন
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{savingSettings ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস ও লোগো সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-800 my-8 overflow-hidden text-white">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">
                {editingProduct ? 'পণ্য সংশোধন করুন' : 'নতুন পণ্য যোগ করুন'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    পণ্যের নাম <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: প্রিমিয়াম মেনস ওয়াচ"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={pCategoryId}
                    onChange={(e) => setPCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="" className="bg-slate-900 text-white">ক্যাটাগরি নির্বাচন করুন</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    বিক্রয় মূল্য (৳ BDT) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    পূর্বের মূল্য (ছাড় দেখাতে)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="যেমন: ১৫০০"
                    value={pComparePrice || ''}
                    onChange={(e) => setPComparePrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    স্টক পরিমাণ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    কাস্টম স্লাগ (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="স্বয়ংক্রিয় তৈরি হবে যদি ফাঁকা থাকে"
                    value={pSlug}
                    onChange={(e) => setPSlug(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    SKU কোড (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: BS-W01"
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Images Manager */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  পণ্যের ছবি (ইমেজ লিংক অথবা ফাইল আপলোড)
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={pImageInput}
                    onChange={(e) => setPImageInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    লিংক যোগ
                  </button>
                  <label className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors">
                    <ImageIcon size={14} />
                    <span>আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Previews */}
                {pImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {pImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl border border-slate-800 overflow-hidden shrink-0 group bg-slate-950">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  পণ্যের বিস্তারিত বিবরণ <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="পণ্যের বৈশিষ্ট্য, মাপ, উপাদান ইত্যাদি বর্ণনা করুন..."
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={pIsActive}
                  onChange={(e) => setPIsActive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="activeToggle" className="text-xs font-bold text-slate-300 cursor-pointer">
                  ওয়েবসাইটে তাৎক্ষণিক প্রকাশ করুন (Publish Live)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-750 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-950"
                >
                  {savingProduct ? 'সংরক্ষণ হচ্ছে...' : 'পণ্য সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT CATEGORY ================= */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-800 p-6 space-y-4 text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingCategory ? 'ক্যাটাগরি সংশোধন' : 'নতুন ক্যাটাগরি তৈরি'}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ক্যাটাগরির নাম <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ঘড়ি ও এক্সেসরিজ"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  স্লাগ (Slug - ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: watches"
                  value={cSlug}
                  onChange={(e) => setCSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  বিবরণ (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  placeholder="সংক্ষিপ্ত বিবরণ"
                  value={cDescription}
                  onChange={(e) => setCDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={cIsActive}
                  onChange={(e) => setCIsActive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="catActive" className="text-xs font-bold text-slate-300 cursor-pointer">
                  ক্যাটাগরি সক্রিয় রাখুন
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-750 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-950"
                >
                  {savingCategory ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DEDICATED LOGO UPLOAD & CUSTOMIZER ================= */}
      {logoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6 text-white my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    ওয়েবসাইটের লোগো পরিবর্তন ও আপলোড
                  </h3>
                  <p className="text-xs text-slate-400">
                    লোগো আপলোড করুন বা লিংক দিন — সাইটজুড়ে লাইভ আপডেট হবে
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLogoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 flex items-center justify-center border border-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {logoSaveSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                <span>{logoSaveSuccess}</span>
              </div>
            )}

            {/* Live Preview Arena */}
            <div className="bg-[#090D16] p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                লাইভ লোগো প্রিভিউ (হেডার ও সাইট প্রদর্শন)
              </span>
              <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                {sLogoUrl ? (
                  <img
                    src={sLogoUrl}
                    alt="Logo preview"
                    className="w-14 h-14 object-cover rounded-xl border-2 border-emerald-500 shadow-md shadow-emerald-950 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                    {sWebsiteName ? sWebsiteName.charAt(0) : 'B'}
                  </div>
                )}
                <div>
                  <h4 className="font-black text-base text-white tracking-tight">
                    {sWebsiteName || 'Bashar Shop'}
                  </h4>
                  <p className="text-xs text-emerald-400 font-medium">
                    {settings.store_tagline || 'প্রিমিয়াম অনলাইন শপিং'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {sLogoUrl ? 'কাস্টম লোগো সক্রিয়' : 'ডিফল্ট টেক্সট মোনোগ্রাম'}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ১. কম্পিউটার বা মোবাইল থেকে ছবি আপলোড করুন
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-950 hover:bg-slate-900 text-white border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl text-xs font-bold cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <span>ছবি নির্বাচন করুন (PNG, JPG, SVG, WebP)</span>
                  <span className="text-[10px] text-slate-500 font-normal">সর্বোচ্চ ৫ MB সাইজ</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ২. অথবা যেকোনো অনলাইন ইমেজ লিংক পেস্ট করুন
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/my-shop-logo.png"
                  value={sLogoUrl}
                  onChange={(e) => setSLogoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500">প্রিসেট লোগো:</span>
                <button
                  type="button"
                  onClick={() => setSLogoUrl('/src/assets/images/store_logo_mark_1791816215370.jpg')}
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-850 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  গোল্ডেন লাক্সারি মোনোগ্রাম
                </button>
                {sLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setSLogoUrl('')}
                    className="px-3 py-1 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold cursor-pointer transition-colors ml-auto"
                  >
                    লোগো সরান
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setLogoModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-750 cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => handleQuickSaveLogo()}
                disabled={quickLogoSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-950/60 flex items-center gap-2"
              >
                <Save size={15} />
                <span>{quickLogoSaving ? 'সংরক্ষণ হচ্ছে...' : 'লোগো সেভ করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER DETAILS & INVOICE ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden my-8 p-6 sm:p-8 space-y-6 text-white">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <span className="font-mono font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                  #{selectedOrder.order_number}
                </span>
                <h3 className="font-black text-white text-lg mt-1">
                  অর্ডার বিস্তারিত তথ্য ও চালান
                </h3>
                <p className="text-xs text-slate-400">{formatDateBD(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer & Shipping info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                  গ্রাহকের তথ্য
                </h4>
                <p className="font-bold text-white text-sm">{selectedOrder.customer_name}</p>
                <p className="text-slate-400 font-mono mt-0.5">মোবাইল: {selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && (
                  <p className="text-slate-400">ইমেইল: {selectedOrder.customer_email}</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                  ডেলিভারি ঠিকানা
                </h4>
                <p className="text-slate-200 leading-relaxed">
                  {selectedOrder.shipping_address}
                </p>
                <p className="text-slate-400 font-semibold mt-0.5">
                  থানা: {selectedOrder.area}, জেলা: {selectedOrder.district}
                </p>
                {selectedOrder.customer_notes && (
                  <p className="text-amber-300 bg-amber-500/10 border border-amber-500/20 p-1.5 rounded mt-1.5 text-[11px]">
                    নোট: {selectedOrder.customer_notes}
                  </p>
                )}
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                অর্ডারের আইটেম সমূহ (ক্রয়কালীন স্ন্যাপশট)
              </h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">পণ্য</th>
                      <th className="py-2.5 px-3">মূল্য</th>
                      <th className="py-2.5 px-3">পরিমাণ</th>
                      <th className="py-2.5 px-3 text-right">মোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedOrder.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {it.product_name_snapshot}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 tabular-nums">
                          {formatBDT(it.unit_price_snapshot)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 tabular-nums">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-black text-white tabular-nums">
                          {formatBDT(it.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Breakdown */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>পণ্যের মোট (সাবটোটাল):</span>
                  <span className="tabular-nums font-semibold text-white">{formatBDT(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="tabular-nums font-semibold text-white">{formatBDT(selectedOrder.delivery_fee)}</span>
                </div>
                <div className="flex justify-between font-black text-white text-sm pt-1.5 border-t border-slate-800">
                  <span>সর্বমোট প্রদেয় (COD):</span>
                  <span className="text-emerald-400 tabular-nums">{formatBDT(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Status changer & Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">স্ট্যাটাস পরিবর্তন:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="Pending" className="bg-slate-900 text-white">Pending (অপেক্ষমান)</option>
                  <option value="Confirmed" className="bg-slate-900 text-white">Confirmed (নিশ্চিত)</option>
                  <option value="Processing" className="bg-slate-900 text-white">Processing (প্রসেসিং)</option>
                  <option value="Shipped" className="bg-slate-900 text-white">Shipped (ডেলিভারির পথে)</option>
                  <option value="Delivered" className="bg-slate-900 text-white">Delivered (ডেলিভারি সম্পন্ন)</option>
                  <option value="Cancelled" className="bg-slate-900 text-white">Cancelled (বাতিল)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} /> প্রিন্ট ইনভয়েস
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
