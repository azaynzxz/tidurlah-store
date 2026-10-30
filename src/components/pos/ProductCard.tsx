import { Badge } from "@/components/ui/badge";
import { Plus, Package, Layers } from "lucide-react";

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
      className={`relative bg-card rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col h-full group select-none shadow-2xs ${
        !product.is_available
          ? 'opacity-60 cursor-not-allowed grayscale-[0.6]'
          : isSelected
            ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03]'
            : 'border-border hover:border-primary/60 hover:shadow-sm hover:-translate-y-0.5'
      }`}
      onClick={handleClick}
    >
      {!product.is_available && (
        <div className="absolute top-2 left-2 z-20">
          <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 shadow-xs">
            Habis
          </Badge>
        </div>
      )}

      {/* Mobile Vertical Tile */}
      <div className="md:hidden flex flex-col h-full">
        <div className="relative w-full aspect-square bg-muted/30 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.pricingMethod === "dimensional" && (
            <div className="absolute bottom-1.5 left-1.5">
              <Badge variant="secondary" className="text-[9px] py-0 px-1 font-semibold backdrop-blur-md bg-background/80">
                m²
              </Badge>
            </div>
          )}
        </div>

        <div className="p-2.5 flex flex-col flex-1 gap-1">
          <h3 className="font-bold text-foreground text-xs leading-snug line-clamp-2 min-h-[2rem]">
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between gap-1 mt-auto pt-1">
            <div className="flex flex-col">
              {product.discountPrice ? (
                <>
                  <span className="text-[10px] text-muted-foreground line-through leading-none">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm font-black text-primary leading-tight">
                    {formatCurrency(product.discountPrice)}
                  </span>
                </>
              ) : (
                <span className="text-sm font-black text-primary leading-tight">
                  {formatCurrency(product.price)}
                </span>
              )}
              <span className="text-[9px] text-muted-foreground">/{product.unit}</span>
            </div>

            <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus className="size-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Horizontal Workstation Tile */}
      <div className="hidden md:flex p-2.5 gap-3 h-full items-stretch">
        <div className="size-20 lg:size-24 shrink-0 relative rounded-lg overflow-hidden border border-border/80 bg-muted/20 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          />
          {product.pricingMethod === "dimensional" && (
            <div className="absolute bottom-1 left-1">
              <Badge variant="secondary" className="text-[8px] py-0 px-1 font-semibold backdrop-blur-md bg-background/80">
                m²
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
          <div>
            <h3 className="font-bold text-foreground text-xs leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Feature Indicators */}
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {product.models && product.models.length > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                  <Package className="size-2.5" />
                  <span>Model</span>
                </span>
              )}
              {[1, 2, 6, 7, 8].includes(product.id) && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                  <Layers className="size-2.5" />
                  <span>Case</span>
                </span>
              )}
            </div>
          </div>

          <div className="mt-auto pt-2 flex items-end justify-between">
            <div className="flex flex-col">
              {product.discountPrice ? (
                <>
                  <span className="text-[10px] text-muted-foreground line-through leading-none mb-0.5">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm lg:text-base font-black text-primary leading-none">
                    {formatCurrency(product.discountPrice)}
                  </span>
                </>
              ) : (
                <span className="text-sm lg:text-base font-black text-primary leading-none">
                  {formatCurrency(product.price)}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">per {product.unit}</span>
            </div>

            <div className="size-7 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all shadow-2xs">
              <Plus className="size-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}