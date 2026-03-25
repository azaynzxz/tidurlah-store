import { ProductCard } from "./ProductCard";

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

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  selectedProducts: Set<number>;
  isCartVisible?: boolean;
}

export function ProductGrid({ products, onAddToCart, selectedProducts, isCartVisible = true }: ProductGridProps) {
  return (
    <div className="h-full overflow-y-auto">
      {/* Dynamic columns based on cart visibility */}
      <div className={`grid gap-2 md:gap-4 p-2 md:p-4 transition-all duration-300 ${isCartVisible
          ? "grid-cols-2 lg:grid-cols-3"
          : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        }`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            isSelected={selectedProducts.has(product.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-4">
          <div className="text-4xl md:text-6xl mb-4">📦</div>
          <p className="text-base md:text-lg font-medium">Tidak ada produk ditemukan</p>
          <p className="text-xs md:text-sm text-center">Coba ubah kategori atau kata kunci pencarian</p>
        </div>
      )}
    </div>
  );
}
