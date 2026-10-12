import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { formatBDT } from '../utils/constants.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onCheckout,
}) => {
  const { cart, removeFromCart, updateQuantity, subtotal, deliveryFee, totalAmount, totalItems } =
    useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 shadow-2xl flex flex-col border-l border-slate-800 text-white">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag size={16} />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">
                  শপিং কার্ট
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  {totalItems > 0 ? `${totalItems} টি পণ্য যুক্ত করা হয়েছে` : 'কার্ট খালি'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto border border-slate-700/60">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-bold text-white text-base">আপনার কার্ট খালি</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  আমাদের সংগ্রহ ঘুরে দেখে আপনার পছন্দের পণ্য কার্টে যুক্ত করুন।
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-950"
                >
                  কেনাকাটা শুরু করুন
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const img =
                  item.product.images && item.product.images.length > 0
                    ? item.product.images[0]
                    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 items-center"
                  >
                    {/* Thumbnail */}
                    <img
                      src={img}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0 border border-slate-800"
                      referrerPolicy="no-referrer"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate" title={item.product.name}>
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-black text-emerald-400 mt-0.5 tabular-nums">
                        {formatBDT(item.product.price)}
                      </p>

                      {/* Stepper */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900 overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="px-2 py-0.5 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="px-2 py-0.5 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                          = {formatBDT(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="মুছুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-950/80 space-y-3.5">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span className="font-bold text-white tabular-nums">{formatBDT(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-bold text-white tabular-nums">{formatBDT(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-800 font-black text-white">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-emerald-400 text-base tabular-nums">{formatBDT(totalAmount)}</span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-medium flex items-center gap-1.5">
                <Truck size={14} className="shrink-0 text-emerald-400" />
                <span>পেমেন্ট: ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
              >
                <span>চেকআউট করুন</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
