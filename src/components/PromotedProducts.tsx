import { useState, useEffect } from "react";
import { ShoppingBag, Clock, Tag } from "lucide-react";

type PromotedProductProps = {
  products: Record<string, any[]>;
  promotedProducts: any[];
  onAddToCart: (product: any) => void;
  onOpenDetails: (product: any) => void;
};

const PromotedProducts = ({ products, promotedProducts, onAddToCart, onOpenDetails }: PromotedProductProps) => {
  const [timeRemaining, setTimeRemaining] = useState<Record<number, string>>({});

  // Function to calculate the time remaining until the end date
  const calculateTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const difference = endDate.getTime() - now.getTime();
    
    if (difference <= 0) {
      return "Promo berakhir";
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Update the countdown timer every second
  useEffect(() => {
    const updateTimers = () => {
      const timers: Record<number, string> = {};
      
      promotedProducts.forEach(promo => {
        timers[promo.id] = calculateTimeRemaining(promo.endDate);
      });
      
      setTimeRemaining(timers);
    };
    
    // Initial update
    updateTimers();
    
    // Set interval for updates every second
    const interval = setInterval(updateTimers, 1000);
    
    return () => clearInterval(interval);
  }, [promotedProducts]);

  // Find the actual product data for each promoted product
  const getPromotedProductsWithData = () => {
    return promotedProducts.map(promo => {
      // Find the product in the flat products array
      const productData = Object.values(products)
        .flat()
        .find((p: any) => p.id === promo.id);
      
      if (productData) {
        return {
          ...productData,
          promoInfo: promo
        };
      }
      
      return null;
    }).filter(Boolean); // Remove any null values
  };

  const promotedProductsWithData = getPromotedProductsWithData();

  if (promotedProductsWithData.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold mb-2 text-gray-800 flex items-center">
        <Tag className="h-4 w-4 mr-1 text-green-600" />
        Promo Khusus Mahasiswa KKN
      </h2>
      <div className="grid grid-cols-1 gap-2">
        {promotedProductsWithData.map((product: any) => (
          <div 
            key={product.id} 
            className="border border-green-400 rounded-lg overflow-hidden shadow-sm bg-green-50"
            onClick={() => onOpenDetails(product)}
          >
            <div className="flex items-center p-2">
              <div className="w-12 h-12 relative flex-shrink-0">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="h-full w-full object-cover rounded"
                />
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-xs pl-0.5">{product.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xxs">
                      <Clock className="h-2.5 w-2.5 mr-0.5" />
                      <span>{timeRemaining[product.id]}</span>
                    </div>
                    <div className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xxs">
                      {product.promoInfo.discount}% OFF
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-2 mt-1.5 text-xxs pl-0.5">
                  <div className="inline-flex items-center text-green-700">
                    <span>Kode: <span className="font-bold">KKN15</span></span>
                  </div>
                  
                  {product.promoInfo.minQuantity && (
                    <div className="bg-green-100 text-green-700 px-1 py-0.5 rounded-sm">
                      Min. {product.promoInfo.minQuantity} pcs
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotedProducts; 