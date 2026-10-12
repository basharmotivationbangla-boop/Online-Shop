import React, { useState } from 'react';
import { X, ShoppingBag, Zap, Check, AlertCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '../types/index.ts';
import { formatBDT } from '../utils/constants.ts';
import { useCart } from '../context/CartContext.tsx';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onBuyNow,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];

  const isOutOfStock = product.stock_quantity <= 0;
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleDirectBuy = () => {
    onBuyNow(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 my-8 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-700/60"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 p-6 sm:p-8">
          {/* Left: Gallery */}
          <div className="space-y-3">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                  বিশেষ ছাড়
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-950'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                {product.category_name && <span>{product.category_name}</span>}
                {product.category_name && product.sku && <span aria-hidden="true" className="text-slate-600">·</span>}
                {product.sku && <span className="font-mono text-slate-500">SKU: {product.sku}</span>}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                  {formatBDT(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-500 line-through tabular-nums">
                    {formatBDT(product.compare_at_price!)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-2 text-xs">
                {isOutOfStock ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertCircle size={14} /> বর্তমানে স্টক শেষ
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check size={14} /> স্টকে রয়েছে ({product.stock_quantity} টি উপলব্ধ)
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  বিবরণ
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto pr-1">
                  {product.description || 'এই পণ্যের কোন বিস্তারিত তথ্য যোগ করা হয়নি।'}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300">পরিমাণ:</span>
                  <div className="flex items-center border border-slate-700 rounded-xl overflow-hidden bg-slate-950">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-xs font-bold text-white bg-slate-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock_quantity, q + 1))
                      }
                      className="px-3 py-1 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold tabular-nums">
                    = {formatBDT(product.price * quantity)}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <ShoppingBag size={16} />
                  <span>{addedAnimation ? 'যোগ হয়েছে!' : 'কার্টে যোগ'}</span>
                </button>

                <button
                  onClick={handleDirectBuy}
                  disabled={isOutOfStock}
                  className="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Zap size={16} />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Truck size={13} className="text-emerald-400" /> ক্যাশ অন ডেলিভারি
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-400" /> ১০০% আসল পণ্য
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw size={13} className="text-emerald-400" /> দ্রুত রিটার্ন
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
