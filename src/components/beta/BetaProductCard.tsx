import React, { memo } from "react";
import { Clock, Star, ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/product";

interface BetaProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const BetaProductCard: React.FC<BetaProductCardProps> = memo(({ product, onSelect }) => {
  // Find lowest price threshold if available to show "Mulai Rp..."
  const lowestPrice = product.priceThresholds && product.priceThresholds.length > 0
    ? Math.min(...product.priceThresholds.map((t) => t.price))
    : (product.discountPrice || product.price);

  const hasTierPricing = product.priceThresholds && product.priceThresholds.length > 1;

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group bg-white border border-[#E7E5E4] rounded-xl overflow-hidden hover:border-[#18181B] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer flex flex-col h-full touch-manipulation select-none"
    >
      {/* 1:1 Image Container */}
      <div className="relative aspect-square bg-[#F5F5F4] overflow-hidden border-b border-[#F0EFEB]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
        />
        {/* Category & Lead Time Tag */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex items-center gap-1 flex-wrap">
          {product.time && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-white/95 text-[#18181B] shadow-sm border border-[#E7E5E4]/80">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#71717A]" />
              {product.time}
            </span>
          )}
        </div>

        {/* Rating Tag */}
        {product.rating && (
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-white/95 text-[#18181B] shadow-sm border border-[#E7E5E4]/80">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
              {product.rating}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-semibold text-xs sm:text-sm text-[#18181B] group-hover:text-[#E8590C] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-[#71717A] line-clamp-2 mt-1 leading-normal sm:leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-2 sm:pt-3 border-t border-[#F5F5F4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] sm:text-[11px] text-[#71717A] block leading-none mb-1">
              {hasTierPricing ? "Mulai grosir" : "Harga satuan"}
            </span>
            <span className="text-sm sm:text-base font-semibold text-[#18181B] font-mono tracking-tight leading-none">
              Rp {lowestPrice.toLocaleString("id-ID")}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#F5F5F4] text-[#18181B] group-hover:bg-[#18181B] group-hover:text-white active:scale-95 transition-all duration-150 text-[11px] sm:text-xs font-medium min-h-[34px] sm:min-h-[32px]"
            aria-label={`Konfigurasi ${product.name}`}
          >
            <span>Pilih Opsi</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

BetaProductCard.displayName = "BetaProductCard";
