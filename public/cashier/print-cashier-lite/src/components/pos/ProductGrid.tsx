import { ProductCard } from "./ProductCard";

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

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  selectedProducts: Set<number>;
}

export function ProductGrid({ products, onAddToCart, selectedProducts }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isSelected={selectedProducts.has(product.id)}
        />
      ))}
    </div>
  );
}