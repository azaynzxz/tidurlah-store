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
}

export function ProductGrid({ products, onAddToCart, selectedProducts }: ProductGridProps) {
  return (
    <div className="h-full overflow-y-auto">
      {/* 3 columns on all screen sizes */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 p-2 md:p-4">
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
