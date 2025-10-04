import { useState, useEffect } from "react";
import { POSHeader } from "./POSHeader";
import { CategoryTabs } from "./CategoryTabs";
import { ProductGrid } from "./ProductGrid";
import { Cart } from "./Cart";
import { OrderHistory } from "./OrderHistory";

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

interface CartItem {
  product: Product;
  quantity: number;
}

export function POSDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("Semua Produk");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  // Load products from JSON file
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/products.json');
        const data = await response.json();
        
        // Flatten the product data from the new format
        const allProducts = Object.values(data).flat();
        
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Get unique categories
  const categories = ["Semua Produk", ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products by category
  useEffect(() => {
    if (activeCategory === "Semua Produk") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, products]);

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });

    // Add visual feedback
    setSelectedProducts(prev => new Set([...prev, product.id]));
    setTimeout(() => {
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 300);
  };

  // Update cart item quantity
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Remove item from cart
  const handleRemoveItem = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  // Clear all cart items
  const handleClearAll = () => {
    setCartItems([]);
  };

  // Process order
  const handleProcessOrder = () => {
    setCartItems([]);
    setSelectedProducts(new Set());
  };

  if (showOrderHistory) {
    return <OrderHistory onBack={() => setShowOrderHistory(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <POSHeader onShowOrderHistory={() => setShowOrderHistory(true)} />
          
          <div className="flex gap-6 p-6">
            {/* Left side - Products (60%) */}
            <div className="flex-1 space-y-4">
              <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              
              <div className="bg-secondary/20 rounded-lg">
                <ProductGrid
                  products={filteredProducts}
                  onAddToCart={handleAddToCart}
                  selectedProducts={selectedProducts}
                />
              </div>
            </div>

            {/* Right side - Cart (40%) */}
            <div className="w-80 h-[700px]">
              <Cart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearAll={handleClearAll}
                onProcessOrder={handleProcessOrder}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}