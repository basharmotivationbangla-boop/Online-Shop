import React from 'react';
import { ShoppingBag, Eye, Zap, AlertCircle } from 'lucide-react';
import { Product } from '../types/index.ts';
import { formatBDT } from '../utils/constants.ts';
import { useCart } from '../context/CartContext.tsx';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onBuyNow,
}) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock_quantity <= 0;
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  const displayImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="group bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-950/40 transition-all duration-300 flex flex-col overflow-hidden relative backdrop-blur-xs">
      {/* Image Container with subtle zoom */}
      <div
        onClick={() => onOpenDetails(product)}
        className="relative aspect-square w-full bg-slate-950 cursor-pointer overflow-hidden"
      >
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Unboxed discount tag */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md">
            -{discountPercent}% ছাড়
          </div>
        )}

        {/* Stock tag */}
        {isOutOfStock && (
          <div className="absolute top-3 right-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
            <AlertCircle size={10} /> স্টক শেষ
          </div>
        )}

        {/* Hover quick preview button */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-slate-900/90 border border-slate-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all">
            <Eye size={14} className="text-emerald-400" /> বিস্তারিত দেখুন
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Metadata line: Category · SKU */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {product.category_name && <span>{product.category_name}</span>}
            {product.category_name && product.sku && <span aria-hidden="true" className="text-slate-600">·</span>}
            {product.sku && <span className="font-mono text-slate-500">{product.sku}</span>}
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="font-bold text-white text-sm leading-snug line-clamp-2 hover:text-emerald-400 cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Action row */}
        <div className="pt-3 border-t border-slate-800/80 mt-2 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-emerald-400 tabular-nums">
              {formatBDT(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-500 line-through tabular-nums">
                {formatBDT(product.compare_at_price!)}
              </span>
            )}
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className="w-full py-2 px-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              <ShoppingBag size={13} className="text-slate-400" />
              <span>কার্টে যোগ</span>
            </button>

            <button
              onClick={() => onBuyNow(product)}
              disabled={isOutOfStock}
              className="w-full py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-md shadow-emerald-950"
            >
              <Zap size={13} />
              <span>অর্ডার</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
