import React from 'react';
import { CheckCircle2, ShoppingBag, Truck } from 'lucide-react';
import { formatBDT } from '../utils/constants.ts';

interface OrderSuccessModalProps {
  orderNumber: string | null;
  totalAmount: number;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderNumber,
  totalAmount,
  onClose,
  onViewOrders,
}) => {
  if (!orderNumber) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-800 p-6 sm:p-8 text-center space-y-6 text-white">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={44} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">
            অর্ডার সফল হয়েছে!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            আপনার ক্যাশ অন ডেলিভারি অর্ডারটি ডাটাবেজে সংরক্ষিত হয়েছে।
          </p>
        </div>

        {/* Order Details Badge */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">অর্ডার নম্বর:</span>
            <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              #{orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">পরিশোধের মাধ্যম:</span>
            <span className="font-bold text-white">ক্যাশ অন ডেলিভারি (COD)</span>
          </div>

          <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-800">
            <span className="text-slate-300 font-bold">সর্বমোট প্রদেয়:</span>
            <span className="font-black text-base text-emerald-400 tabular-nums">
              {formatBDT(totalAmount)}
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left text-xs text-amber-300 flex items-start gap-2">
          <Truck size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <span>
            পণ্য ডেলিভারি ম্যানের হাতে পৌঁছালে দেখে বুঝে নিয়ে মূল্য পরিশোধ করবেন।
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            আরো কেনাকাটা করুন
          </button>

          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-emerald-950 cursor-pointer"
          >
            অর্ডার দেখুন
          </button>
        </div>
      </div>
    </div>
  );
};
