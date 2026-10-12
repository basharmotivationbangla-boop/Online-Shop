import React, { useState, useEffect } from 'react';
import { X, Package, User, LogOut, CheckCircle, Clock, Truck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { getCustomerOrders } from '../services/db.ts';
import { Order, OrderStatus } from '../types/index.ts';
import { BD_DISTRICTS, formatBDT, formatDateBD } from '../utils/constants.ts';

interface CustomerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, profile, updateCustomerProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা (Dhaka)');
  const [area, setArea] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      loadOrders();
    }
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      if (profile.district) setDistrict(profile.district);
      if (profile.area) setArea(profile.area);
      if (profile.shipping_address) setShippingAddress(profile.shipping_address);
    }
  }, [user, profile, isOpen]);

  const loadOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const data = await getCustomerOrders(user.uid);
      setOrders(data);
    } catch (err) {
      console.warn('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveMsg('');
    try {
      await updateCustomerProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        district,
        area: area.trim(),
        shipping_address: shippingAddress.trim(),
      });
      setSaveMsg('প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setSaveLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold">অপেক্ষমান (Pending)</span>;
      case 'Confirmed':
        return <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-bold">নিশ্চিত (Confirmed)</span>;
      case 'Processing':
        return <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-1 rounded-full font-bold">প্রসেসিং (Processing)</span>;
      case 'Shipped':
        return <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1 rounded-full font-bold">ডেলিভারির পথে (Shipped)</span>;
      case 'Delivered':
        return <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-bold">ডেলিভারি সম্পন্ন (Delivered)</span>;
      case 'Cancelled':
        return <span className="bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs px-2.5 py-1 rounded-full font-bold">বাতিল (Cancelled)</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden my-8 flex flex-col max-h-[90vh] text-white">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">
              গ্রাহক ড্যাশবোর্ড
            </h2>
            <p className="text-xs text-slate-400">
              স্বাগতম, {profile?.full_name || user.displayName || 'সম্মানিত গ্রাহক'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900 gap-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Package size={16} />
            <span>আমার অর্ডারসমূহ ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User size={16} />
            <span>প্রোফাইল ও ঠিকানা</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  অর্ডার তালিকা লোড হচ্ছে...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto border border-slate-700">
                    <Package size={24} />
                  </div>
                  <h4 className="font-bold text-white text-sm">কোনো অর্ডার পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    আপনি এখনও কোনো অর্ডার করেননি। আমাদের পণ্য তালিকা থেকে আপনার পছন্দের পণ্য অর্ডার করুন।
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
                        <div>
                          <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            #{order.order_number}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            {formatDateBD(order.created_at)}
                          </span>
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 text-xs">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-300">
                            <span className="truncate max-w-[260px]">
                              {it.product_name_snapshot} × {it.quantity}
                            </span>
                            <span className="font-semibold text-white">{formatBDT(it.line_total)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom details */}
                      <div className="pt-2 border-t border-slate-850 flex flex-wrap justify-between items-center text-xs">
                        <div className="text-slate-400 text-[11px]">
                          ডেলিভারি ঠিকানা: {order.shipping_address}, {order.area}, {order.district}
                        </div>
                        <div className="font-black text-white text-sm">
                          সর্বমোট: <span className="text-emerald-400">{formatBDT(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {saveMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>{saveMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">আপনার পূর্ণ নাম</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ডিফল্ট জেলা</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d} className="bg-slate-900 text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">থানা / এলাকা</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">বিস্তারিত ডেলিভারি ঠিকানা</label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 cursor-pointer disabled:opacity-50"
                >
                  {saveLoading ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Logout */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-mono">UID: {user.uid.slice(0, 8)}...</span>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
