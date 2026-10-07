import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import type { Product } from "@/types/product";
import { generateProductSlug } from "@/utils/product";

interface ProductShareButtonProps {
  product: Product;
  className?: string;
}

export const ProductShareButton: React.FC<ProductShareButtonProps> = ({
  product,
  className = "",
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const productSlug = (product as any).slug || generateProductSlug(product.name);
    const shareUrl = `${window.location.origin}/product/${productSlug}`;

    const shareData = {
      title: `${product.name} - ID Card Lampung`,
      text: `Lihat produk ${product.name} di ID Card Lampung (Percetakan & Merchandise Cepat & Presisi):`,
      url: shareUrl,
    };

    // Attempt native Web Share API first
    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // User dismissed native share sheet, ignore
          return;
        }
      }
    }

    // Fallback: Copy link to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (copyErr) {
      console.error("Failed to copy link", copyErr);
    }
  };

  return (
    <button
      onClick={handleShare}
      type="button"
      className={`relative inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 text-[#71717A] hover:text-[#18181B] hover:bg-white border border-[#E7E5E4] shadow-xs hover:shadow-sm active:scale-90 transition-all duration-150 touch-manipulation select-none ${className}`}
      aria-label={`Bagikan ${product.name}`}
      title={isCopied ? "Link tersalin!" : "Bagikan produk"}
    >
      {isCopied ? (
        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 animate-in zoom-in-50" />
      ) : (
        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      )}
      {isCopied && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-[#18181B] text-white text-[9px] font-medium rounded whitespace-nowrap shadow-sm pointer-events-none z-30">
          Tersalin
        </span>
      )}
    </button>
  );
};

export default ProductShareButton;
