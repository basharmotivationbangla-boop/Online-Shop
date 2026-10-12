import React from 'react';
import { Phone, Mail, MapPin, Truck, ShieldCheck, RefreshCw, Lock, ExternalLink } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';

interface FooterProps {
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateAdmin }) => {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 border-b border-slate-900">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">ক্যাশ অন ডেলিভারি</h4>
              <p className="text-xs text-slate-500 mt-0.5">পণ্য হাতে পেয়ে দেখে বুঝে মূল্য পরিশোধ করুন।</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">১০০% আসল পণ্য</h4>
              <p className="text-xs text-slate-500 mt-0.5">নিশ্চিত গুণগত মান ও প্রিমিয়াম গ্রেড সামগ্রী।</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-sky-400 border border-slate-800 flex items-center justify-center shrink-0">
              <RefreshCw size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">দ্রুততম হোম ডেলিভারি</h4>
              <p className="text-xs text-slate-500 mt-0.5">সারা বাংলাদেশে দ্রুততম সময়ে নিরাপদ ডেলিভারি।</p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.website_name}
                  className="h-10 w-10 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  {settings.website_name ? settings.website_name.charAt(0) : 'B'}
                </div>
              )}
              <h3 className="text-xl font-black text-white tracking-tight font-display">
                {settings.website_name || 'Bashar Shop'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {settings.store_tagline || 'বাংলাদেশের নির্ভরযোগ্য প্রিমিয়াম অনলাইন শপিং প্ল্যাটফর্ম। আমরা সর্বোচ্চ মানের পণ্য ও নিরবচ্ছিন্ন গ্রাহক সেবায় প্রতিশ্রুতিবদ্ধ।'}
            </p>
            <div className="text-xs text-slate-500 pt-1">
              পেমেন্ট মাধ্যম: <span className="text-emerald-400 font-bold">ক্যাশ অন ডেলিভারি (COD Only)</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">যোগাযোগের ঠিকানা</h4>
            <ul className="space-y-2.5 text-xs">
              {settings.contact_phone && (
                <li className="flex items-center gap-2.5">
                  <Phone size={14} className="text-emerald-400 shrink-0" />
                  <span className="font-mono text-slate-300">{settings.contact_phone}</span>
                </li>
              )}
              {settings.contact_email && (
                <li className="flex items-center gap-2.5">
                  <Mail size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-slate-300">{settings.contact_email}</span>
                </li>
              )}
              {settings.store_address && (
                <li className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{settings.store_address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links & Admin */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">প্রশাসনিক ব্যবস্থা</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  হোমপেজ শীর্ষে যান
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateAdmin}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <Lock size={12} /> অ্যাডমিনিস্ট্রেটর পোর্টাল
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 gap-2">
          <p>© {new Date().getFullYear()} {settings.website_name || 'Bashar Shop'}। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="text-[11px]">Powered by Secure Cloud Database</p>
        </div>
      </div>
    </footer>
  );
};
