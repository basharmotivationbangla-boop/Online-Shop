import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  User,
  Sliders,
  Menu,
  X,
  Phone,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onNavigateAdmin: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenAuth,
  onOpenProfile,
  onNavigateAdmin,
  searchQuery,
  setSearchQuery,
}) => {
  const { settings } = useSettings();
  const { totalItems } = useCart();
  const { user, profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      {/* Top Announcement Bar */}
      {settings.announcement && (
        <div className="bg-black/50 border-b border-slate-800/60 text-slate-300 text-xs py-2 px-4 text-center font-medium tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <span className="text-emerald-400 font-bold">ক্যাশ অন ডেলিভারি</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{settings.announcement}</span>
            </div>
            {settings.contact_phone && (
              <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
                <Phone size={12} className="text-emerald-400" />
                <span>হেল্পলাইন: <span className="font-mono text-slate-200">{settings.contact_phone}</span></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main 3-Zone Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6 lg:gap-8">
          {/* Zone 1: Brand Wordmark & Dynamic Logo */}
          <button
            onClick={() => {
              setSearchQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-left shrink-0 group cursor-pointer focus-visible:outline-hidden"
          >
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.website_name || 'Bashar Shop'}
                className="h-11 w-11 object-cover rounded-xl border border-slate-700/80 shadow-md group-hover:border-emerald-500/80 group-hover:scale-105 transition-all"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                {settings.website_name ? settings.website_name.charAt(0) : 'B'}
              </div>
            )}
            <div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight block leading-none font-display group-hover:text-emerald-400 transition-colors">
                {settings.website_name || 'Bashar Shop'}
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                {settings.store_tagline || 'প্রিমিয়াম অনলাইন শপিং'}
              </span>
            </div>
          </button>

          {/* Zone 2: Search Bar & Navigation (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-auto">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="পণ্য খুঁজুন... (নাম, কোড বা বিভাগ)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-900 border border-slate-800 rounded-full text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  মুছুন
                </button>
              )}
            </div>
          </div>

          {/* Zone 3: Actions (Admin Portal + Account + Cart) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Admin Portal Button */}
            {isAdmin && (
              <button
                onClick={onNavigateAdmin}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="অ্যাডমিন ড্যাশবোর্ড"
              >
                <Sliders size={14} className="text-amber-400" />
                <span>অ্যাডমিন প্যানেল</span>
              </button>
            )}

            {/* Customer Account Button */}
            {user ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:text-white hover:bg-slate-900 rounded-xl transition-all border border-slate-800 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {profile?.full_name ? profile.full_name.charAt(0) : user.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold leading-tight truncate max-w-[110px]">
                    {profile?.full_name || user.displayName || 'আমার প্রোফাইল'}
                  </p>
                </div>
                <ChevronDown size={12} className="text-slate-500 hidden lg:block" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-all border border-slate-800 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <User size={15} className="text-slate-400" />
                <span>লগইন / রেজিস্টার</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
              aria-label="শপিং কার্ট"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-xs tabular-nums">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-150 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={15}
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          {user ? (
            <div className="pb-3 border-b border-slate-850 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-white">{profile?.full_name || user.email}</p>
                <p className="text-xs text-slate-400">{profile?.phone || ''}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="text-xs bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg font-bold text-slate-200 border border-slate-800 cursor-pointer"
              >
                প্রোফাইল ও অর্ডার
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-2.5 text-center text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer"
            >
              লগইন / নতুন অ্যাকাউন্ট তৈরি করুন
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              className="w-full flex items-center gap-2 py-2 px-3 text-xs font-bold bg-amber-500/10 text-amber-300 rounded-xl cursor-pointer border border-amber-500/20"
            >
              <Sliders size={16} /> অ্যাডমিন ড্যাশবোর্ড
            </button>
          )}

          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 py-2 px-3 text-xs font-bold text-rose-400 rounded-xl hover:bg-rose-950/30 cursor-pointer"
            >
              <LogOut size={16} /> লগআউট করুন
            </button>
          )}
        </div>
      )}
    </header>
  );
};
