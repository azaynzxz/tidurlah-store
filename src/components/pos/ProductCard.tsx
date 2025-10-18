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
      className={`relative bg-white rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-lg group ${
        !product.is_available
          ? 'opacity-50 cursor-not-allowed'
          : isSelected
          ? 'border-[#FF5E01] shadow-md bg-orange-50'
          : 'border-gray-200 hover:border-[#FF5E01]/50'
      }`}
      onClick={handleClick}
    >
      {!product.is_available && (
        <Badge variant="destructive" className="absolute top-1 right-1 text-xs z-10">
          Habis
        </Badge>
      )}

      {/* Mobile: Simplified vertical layout */}
      <div className="md:hidden flex flex-col">
        {/* Image */}
        <div className="relative w-full aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
          {product.is_available && (
            <div className="absolute bottom-2 right-2">
              <div className={`rounded-full p-2 shadow-lg ${
                isSelected
                  ? "bg-[#FF5E01] text-white"
                  : "bg-white text-[#FF5E01]"
              }`}>
                <Plus className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2 space-y-1">
          <h3 className="font-semibold text-gray-800 text-xs leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          <div className="flex items-baseline gap-1">
            {product.discountPrice ? (
              <>
                <span className="text-sm font-bold text-[#FF5E01]">
                  {formatCurrency(product.discountPrice)}
                </span>
                <span className="text-[10px] text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-[#FF5E01]">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Special indicators - compact */}
          <div className="flex items-center gap-0.5 flex-wrap">
            {product.pricingMethod === "dimensional" && (
              <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center" title="Dimensional">
                <Ruler className="w-2.5 h-2.5 text-orange-700" />
              </div>
            )}
            {product.models && product.models.length > 0 && (
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center" title="Model">
                <Package className="w-2.5 h-2.5 text-blue-700" />
              </div>
            )}
            {(product.id === 1 || product.id === 2 || product.id === 6 || product.id === 7 || product.id === 8) && (
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center" title="Casing">
                <Layers className="w-2.5 h-2.5 text-green-700" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden md:block p-4 space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm leading-tight">
              {product.name}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {product.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {product.discountPrice ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <span className="text-lg font-bold text-[#FF5E01]">
                  {formatCurrency(product.discountPrice)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[#FF5E01]">
                {formatCurrency(product.price)}
              </span>
            )}
            <div className="text-xs text-gray-500">
              per {product.unit}
            </div>

            {/* Special product indicators */}
            <div className="flex items-center gap-1 mt-1">
              {product.pricingMethod === "dimensional" && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 px-1 py-0">
                  <Ruler className="w-3 h-3 mr-1" />
                  Ukuran
                </Badge>
              )}
              {product.models && product.models.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 px-1 py-0">
                  <Package className="w-3 h-3 mr-1" />
                  Model
                </Badge>
              )}
              {(product.id === 1 || product.id === 2 || product.id === 6 || product.id === 7 || product.id === 8) && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 px-1 py-0">
                  <Layers className="w-3 h-3 mr-1" />
                  Casing
                </Badge>
              )}
            </div>
          </div>

          {product.is_available && (
            <Button
              size="sm"
              variant={isSelected ? "default" : "secondary"}
              className={`group-hover:scale-105 transition-transform duration-200 ${
                isSelected
                  ? "bg-[#FF5E01] hover:bg-[#e54d00] text-white"
                  : "bg-[#FF5E01] hover:bg-[#e54d00] text-white"
              }`}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
