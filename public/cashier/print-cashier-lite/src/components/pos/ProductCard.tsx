import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  discount_price: number | null;
  unit: string;
  image: string;
  is_available: boolean;
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
      className={`relative p-4 bg-card rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-lg group ${
        !product.is_available 
          ? 'opacity-50 cursor-not-allowed' 
          : isSelected
          ? 'border-primary shadow-md bg-primary/5'
          : 'border-border hover:border-primary/30'
      }`}
      onClick={handleClick}
    >
      {!product.is_available && (
        <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
          Habis
        </Badge>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-lg object-cover border border-border"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {product.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {product.discount_price ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-price-original line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <span className="text-lg font-bold text-price-discount currency">
                  {formatCurrency(product.discount_price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-price currency">
                {formatCurrency(product.price)}
              </span>
            )}
            <div className="text-xs text-muted-foreground">
              per {product.unit}
            </div>
          </div>
          
          {product.is_available && (
            <Button
              size="sm"
              variant={isSelected ? "default" : "secondary"}
              className={`group-hover:scale-105 transition-transform duration-200 ${
                isSelected ? "bg-success hover:bg-success-hover" : ""
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