import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Ruler, Package, Layers } from "lucide-react";

interface Product {
  id: number;
  name: string;
  image: string;
  additionalImages: string[];
  description: string;
  price: number;
  discountPrice: number | null;
  category: string;
  priceThresholds?: { minQuantity: number; price: number }[];
  time: string;
  rating: number;
  bestseller?: boolean;
  pricingMethod?: string;
  basePricePerSqm?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  laminationOptions?: { type: string; price: number }[];
  models?: { code: string; image: string }[];
  is_available: boolean;
  unit: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isSelected?: boolean;
}

export function ProductCard({ product, onAddToCart, isSelected = false }: ProductCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  const handleClick = () => {
    if (product.is_available) {
      onAddToCart(product);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col h-full group ${!product.is_available
        ? 'opacity-60 cursor-not-allowed grayscale-[0.5]'
        : isSelected
          ? 'border-[#FF5E01] shadow-md ring-1 ring-[#FF5E01] bg-[#fffaf5]'
          : 'border-gray-200 hover:border-[#FF5E01] hover:shadow-lg hover:-translate-y-0.5'
        }`}
      onClick={handleClick}
    >
      {!product.is_available && (
        <div className="absolute top-2 left-0 right-0 mx-auto w-max px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold z-20 shadow-sm uppercase tracking-wide">
          Habis
        </div>
      )}

      {/* Mobile: Perfect Vertical Layout from Original */}
      <div className="md:hidden flex flex-col h-full">
        <div className="relative w-full aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-1.5 space-y-0.5 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-800 text-xs leading-snug line-clamp-2 min-h-[1.75rem]">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-1 flex-wrap mt-auto">
            {product.discountPrice ? (
              <>
                <span className="text-sm font-bold text-[#FF5E01] break-all">
                  {formatCurrency(product.discountPrice)}
                </span>
                <span className="text-[10px] text-gray-400 line-through break-all">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-[#FF5E01] break-all">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 flex-wrap mt-0.5">
            {product.pricingMethod === "dimensional" && (
              <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center shadow-sm" title="Dimensional">
                <Ruler className="w-2.5 h-2.5 text-[#FF5E01]" />
              </div>
            )}
            {product.models && product.models.length > 0 && (
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shadow-sm" title="Model Tersedia">
                <Package className="w-2.5 h-2.5 text-blue-600" />
              </div>
            )}
            {[1, 2, 6, 7, 8].includes(product.id) && (
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shadow-sm" title="Pilihan Casing">
                <Layers className="w-2.5 h-2.5 text-green-600" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: Enhanced Side-by-side Layout */}
      <div className="hidden md:flex p-2.5 gap-3 h-full items-stretch relative">
        {/* Left Column: Bigger Image */}
        <div className="w-[84px] lg:w-[96px] shrink-0 relative rounded-lg overflow-hidden border border-gray-100 bg-white shadow-sm flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>

        {/* Right Column: Product Info */}
        <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
          <div className="relative relative w-full pr-5">
            <h3 className="font-bold text-gray-800 text-xs leading-snug line-clamp-3">
              {product.name}
            </h3>

            {/* Desktop Floating Indicators absolutely positioned locally to top right */}
            <div className="absolute top-0 -right-1 flex flex-col gap-1 z-10">
              {product.pricingMethod === "dimensional" && (
                <div className="w-4 h-4 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shadow-sm backdrop-blur-sm" title="Dimensional">
                  <Ruler className="w-2.5 h-2.5 text-[#FF5E01]" />
                </div>
              )}
              {product.models && product.models.length > 0 && (
                <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm backdrop-blur-sm" title="Model Tersedia">
                  <Package className="w-2.5 h-2.5 text-blue-600" />
                </div>
              )}
              {[1, 2, 6, 7, 8].includes(product.id) && (
                <div className="w-4 h-4 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shadow-sm backdrop-blur-sm" title="Pilihan Casing">
                  <Layers className="w-2.5 h-2.5 text-green-600" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-2">
            <div className="flex flex-col">
              {product.discountPrice ? (
                <>
                  <div className="text-[10px] text-gray-400 line-through leading-none mb-0.5">
                    {formatCurrency(product.price)}
                  </div>
                  <div className="text-[15px] font-black text-[#FF5E01] leading-none mb-0.5">
                    {formatCurrency(product.discountPrice)}
                  </div>
                </>
              ) : (
                <div className="text-[15px] font-black text-[#FF5E01] leading-none mb-0.5">
                  {formatCurrency(product.price)}
                </div>
              )}
              <div className="text-[9px] text-gray-500 font-medium">per {product.unit}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
