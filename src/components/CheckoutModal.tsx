import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Truck, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { createOrder } from '../services/db.ts';
import { BD_DISTRICTS, formatBDT } from '../utils/constants.ts';
import { OrderItemSnapshot } from '../types/index.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderNumber: string, totalAmount: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, subtotal, deliveryFee, totalAmount, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { settings } = useSettings();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [district, setDistrict] = useState('ঢাকা (Dhaka)');
  const [area, setArea] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill if customer is logged in
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setCustomerName(profile.full_name);
      if (profile.phone) setCustomerPhone(profile.phone);
      if (profile.email) setCustomerEmail(profile.email);
      if (profile.district) setDistrict(profile.district);
      if (profile.area) setArea(profile.area);
      if (profile.shipping_address) setShippingAddress(profile.shipping_address);
    } else if (user) {
      if (user.displayName) setCustomerName(user.displayName);
      if (user.email && !user.email.includes('@basharshop.internal')) setCustomerEmail(user.email);
      if (user.phoneNumber) setCustomerPhone(user.phoneNumber);
    }
  }, [profile, user, isOpen]);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }

    const cleanPhone = customerPhone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setErrorMessage('সঠিক ১১ ডিজিটের সচল মোবাইল নম্বর প্রদান করুন (যেমন: 01700000000)।');
      return;
    }

    if (!shippingAddress.trim()) {
      setErrorMessage('অনুগ্রহ করে বিস্তারিত ডেলিভারি ঠিকানা প্রদান করুন।');
      return;
    }

    if (!area.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার থানা বা এলাকা উল্লেখ করুন।');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('আপনার কার্ট খালি। অর্ডার করতে প্রথমে পণ্য যুক্ত করুন।');
      return;
    }

    setLoading(true);

    try {
      // 1. Snapshot items
      const itemsSnapshot: OrderItemSnapshot[] = cart.map((item) => ({
        product_id: item.product.id,
        product_name_snapshot: item.product.name,
        product_sku_snapshot: item.product.sku || '',
        unit_price_snapshot: item.product.price,
        quantity: item.quantity,
        line_total: item.product.price * item.quantity,
        image_url: item.product.images?.[0] || '',
      }));

      const calculatedSubtotal = itemsSnapshot.reduce((sum, it) => sum + it.line_total, 0);
      const fee = settings.delivery_fee || 70;
      const finalGrandTotal = calculatedSubtotal + fee;

      // 2. Atomic Order placement in database
      const { orderNumber } = await createOrder({
        customer_id: user?.uid,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        district: district,
        area: area.trim(),
        shipping_address: shippingAddress.trim(),
        customer_notes: customerNotes.trim() || undefined,
        subtotal: calculatedSubtotal,
        delivery_fee: fee,
        total_amount: finalGrandTotal,
        payment_method: 'COD',
        items: itemsSnapshot,
      });

      // 3. Clear shopping cart
      clearCart();

      // 4. Trigger success callback
      onOrderSuccess(orderNumber, finalGrandTotal);
      onClose();
    } catch (err: unknown) {
      console.error('Order creation error:', err);
      if (err instanceof Error) {
        setErrorMessage(err.message || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      } else {
        setErrorMessage('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-800 my-8 overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                ক্যাশ অন ডেলিভারি চেকআউট
              </h2>
              <p className="text-xs text-slate-400">পণ্য হাতে পেয়ে দেখে বুঝে মূল্য পরিশোধ করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column (3/5): Customer Delivery Information */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">
                ডেলিভারি ও যোগাযোগের তথ্য
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    আপনার নাম <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ সাব্বির আহমেদ"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    মোবাইল নম্বর <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    জেলা <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden cursor-pointer"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d} className="bg-slate-900 text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    থানা / উপজেলা <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মিরপুর, ধানমন্ডি, বা বোয়ালমারী"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  বিস্তারিত ডেলিভারি ঠিকানা <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="বাড়ি নং, রোড নং, এলাকা বা চেনার উপায়"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ইমেইল (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    বিশেষ নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="ডেলিভারির সময় নির্দেশনা"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Right Column (2/5): Order Snapshot Summary */}
            <div className="lg:col-span-2 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-850 mb-3">
                  অর্ডারের বিবরণ ({cart.length} টি আইটেম)
                </h3>

                <div className="max-h-40 overflow-y-auto space-y-2.5 pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-start text-xs gap-2">
                      <span className="text-slate-200 font-medium line-clamp-1">
                        {item.product.name} <span className="text-slate-500">× {item.quantity}</span>
                      </span>
                      <span className="font-bold text-white tabular-nums shrink-0">
                        {formatBDT(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs mt-3">
                  <div className="flex justify-between text-slate-400">
                    <span>পণ্যের মূল্য:</span>
                    <span className="font-semibold text-white tabular-nums">{formatBDT(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-semibold text-white tabular-nums">{formatBDT(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                    <span>সর্বমোট টাকা:</span>
                    <span className="text-emerald-400 tabular-nums text-base">{formatBDT(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* COD Notice */}
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-[11px] flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    পেমেন্ট পদ্ধতি: <strong>ক্যাশ অন ডেলিভারি</strong>। কোনো অগ্রিম পেমেন্ট লাগবে না।
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>অর্ডার সংরক্ষিত হচ্ছে...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>অর্ডার নিশ্চিত করুন ({formatBDT(totalAmount)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
