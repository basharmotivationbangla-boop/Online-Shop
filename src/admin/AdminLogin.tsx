import React, { useState } from 'react';
import { Lock, User, ArrowLeft, ShieldCheck, Eye, EyeOff, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore,
}) => {
  const { loginAdmin, loginWithGoogle } = useAuth();
  const { settings } = useSettings();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('অনুগ্রহ করে ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setLoading(true);
    try {
      const ok = await loginAdmin(username.trim(), password);
      if (ok) {
        onLoginSuccess();
      } else {
        setErrorMessage('ইউজারনেম বা পাসওয়ার্ড সঠিক নয়। প্রবেশাধিকার বাতিল করা হয়েছে।');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('লগইন প্রক্রিয়ায় ত্রুটি ঘটেছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin1234');
    setErrorMessage('');
  };

  const handleGoogleAdminLogin = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setErrorMessage('গুগল সাইন-ইন সম্পন্ন হয়নি বা অ্যাডমিন অ্যাকাউন্টের অনুমতি নেই।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] relative flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return to store button */}
      <button
        onClick={onBackToStore}
        className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors z-10 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 backdrop-blur-sm cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span>ওয়েবসাইটে ফিরে যান</span>
      </button>

      {/* Main Glass Card */}
      <div className="max-w-md w-full bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6 relative z-10">
        
        {/* Logo & Header Title */}
        <div className="text-center space-y-2.5">
          {settings.logo_url ? (
            <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-emerald-500/30 to-teal-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-950/50">
              <img
                src={settings.logo_url}
                alt={settings.website_name || 'Store Logo'}
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/60 border border-emerald-400/30">
              <ShieldCheck size={34} />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              অ্যাডমিন লগইন
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              শুধুমাত্র অনুমোদিত অ্যাডমিনের জন্য সুরক্ষিত প্রবেশদ্বার
            </p>
          </div>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-2xl flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              অ্যাডমিন ইউজারনেম
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="অ্যাডমিন ইউজারনেম লিখুন"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#090D16]/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              অ্যাডমিন পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="গোপন পাসওয়ার্ড লিখুন"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-[#090D16]/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Quick Credential Helper Pill */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-500 flex items-center gap-1">
              <KeyRound size={12} className="text-slate-400" />
              <span>ডিফল্ট: admin / admin1234</span>
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
            >
              স্বয়ংক্রিয় পূরণ করুন
            </button>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950/60 transition-all cursor-pointer disabled:opacity-50 mt-2 active:scale-[0.99]"
          >
            {loading ? 'যাচাই করা হচ্ছে...' : 'অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-slate-900 px-3 text-slate-500">অথবা ওনার গুগল অ্যাকাউন্ট</span>
          </div>
        </div>

        {/* Master Admin Google Login */}
        <button
          type="button"
          onClick={handleGoogleAdminLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>স্টোর ওনার অ্যাকাউন্ট দিয়ে সাইন-ইন</span>
        </button>

        {/* Note on features */}
        <div className="pt-2 text-center border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-emerald-400" />
            <span>লগইন করে যে কোনো সময় ওয়েবসাইটের লোগো আপলোড ও পরিবর্তন করুন</span>
          </p>
        </div>
      </div>
    </div>
  );
};
