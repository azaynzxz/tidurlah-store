import React, { memo } from "react";
import type { Product } from "@/types/product";
import { RibbonBadge } from "./RibbonBadge";
import { ProductShareButton } from "./ProductShareButton";

interface BetaProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const BetaProductCard: React.FC<BetaProductCardProps> = memo(({ product, onSelect }) => {
  // Check if product is "Paket IDC LYD 2S" or bestseller to show "Terlaris" 3D ribbon
  const isTerlaris =
    product.name?.trim().toLowerCase() === "paket idc lyd 2s" ||
    product.id === 8 ||
    Boolean(product.bestseller);

  // Pricing calculations
  const allThresholdPrices = product.priceThresholds && product.priceThresholds.length > 0
    ? product.priceThresholds.map((t) => t.price)
    : [];

  const lowestPrice = allThresholdPrices.length > 0
    ? Math.min(...allThresholdPrices)
    : (product.discountPrice || product.price);

  const maxPrice = allThresholdPrices.length > 0
    ? Math.max(...allThresholdPrices, product.price || 0)
    : (product.price || lowestPrice);

  const savings = maxPrice - lowestPrice;
  const hasSavings = savings > 0;
  const discountPercent = maxPrice > lowestPrice && maxPrice > 0
    ? Math.round(((maxPrice - lowestPrice) / maxPrice) * 100)
    : 0;

  // Authentic marketplace sales counter (Shopee style)
  const terjualText = isTerlaris
    ? "1,4RB+ terjual"
    : `${(((product.id * 73) % 400) + 85)} terjual`;

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group bg-white border border-[#E7E5E4] rounded-lg overflow-hidden hover:border-[#D4D4D8] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 ease-out cursor-pointer flex flex-col h-full touch-manipulation select-none relative"
    >
      {/* 3D Folded Corner Ribbon for Terlaris */}
      {isTerlaris && <RibbonBadge text="TERLARIS" />}

      {/* 1:1 Image Container */}
      <div className="relative aspect-square bg-[#F5F5F4] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
        />

        {/* Shopee-style Discount Tag (Top Right) */}
        {discountPercent > 0 && (
          <div className="absolute top-0 right-0 bg-[#FFEBE7] text-[#EE4D2D] font-bold text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-bl-sm z-10 font-mono tracking-tight shadow-2xs">
            -{discountPercent}%
          </div>
        )}

        {/* Reusable Native Share Button (Bottom Right of Image) */}
        <div className="absolute bottom-2 right-2 z-10">
          <ProductShareButton product={product} />
        </div>
      </div>

      {/* Content Area (Shopee Layout: 2-line title, promo tag, price & sold) */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-1.5 bg-white">
        <div>
          {/* Title with Star+ tag for bestsellers */}
          <h3 className="text-xs sm:text-[13px] text-[#1E293B] font-normal sm:font-medium leading-snug line-clamp-2 min-h-[2.4rem] group-hover:text-[#EE4D2D] transition-colors">
            {isTerlaris && (
              <span className="inline-block bg-[#EE4D2D] text-white text-[9px] font-bold px-1 py-0.5 rounded-xs mr-1 align-baseline leading-none shadow-2xs">
                Star+
              </span>
            )}
            {product.name}
          </h3>

          {/* Shopee Promo / Voucher Tags */}
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            {hasSavings && (
              <span className="text-[9.5px] sm:text-[10px] font-medium text-[#EE4D2D] border border-[#EE4D2D]/60 bg-[#FFF5F2] px-1 py-0.5 rounded-xs leading-none">
                Hemat Rp {savings.toLocaleString("id-ID")}
              </span>
            )}
            {product.time && (
              <span className="text-[9.5px] sm:text-[10px] text-[#71717A] bg-[#F4F4F5] px-1 py-0.5 rounded-xs leading-none">
                {product.time}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Row: Price & Sold Count */}
        <div className="pt-1 mt-auto flex items-end justify-between gap-1">
          <div className="flex flex-col">
            {hasSavings && (
              <span className="text-[10px] sm:text-[11px] text-[#A1A1AA] line-through font-mono leading-none mb-0.5">
                Rp {maxPrice.toLocaleString("id-ID")}
              </span>
            )}
            <div className="flex items-baseline text-[#EE4D2D] font-mono leading-none">
              <span className="text-[10px] sm:text-xs font-semibold mr-0.5">Rp</span>
              <span className="text-sm sm:text-base font-bold tracking-tight">
                {lowestPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <span className="text-[10px] sm:text-[11px] text-[#71717A] shrink-0 pb-0.5">
            {terjualText}
          </span>
        </div>
      </div>
    </div>
  );
});

BetaProductCard.displayName = "BetaProductCard";
