import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Clock, Tag } from "lucide-react";

type PromotedProductProps = {
  products: Record<string, any[]>;
  promotedProducts: any[];
  onAddToCart: (product: any) => void;
  onOpenDetails: (product: any) => void;
};

const PromotedProducts = ({ products, promotedProducts, onAddToCart, onOpenDetails }: PromotedProductProps) => {
  const [timeRemaining, setTimeRemaining] = useState<Record<number, string>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showAngryPromo, setShowAngryPromo] = useState(false);

  // Get current month in Indonesian
  const getCurrentMonth = () => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[new Date().getMonth()];
  };

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
  const promoCount = promotedProductsWithData.length;

  useEffect(() => {
    if (promoCount === 0) return;

    let hideTimeout: ReturnType<typeof setTimeout> | null = null;

    const triggerAngry = () => {
      setShowAngryPromo(true);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      hideTimeout = setTimeout(() => {
        setShowAngryPromo(false);
      }, 5000);
    };

    triggerAngry();
    const interval = setInterval(triggerAngry, 15000);

    return () => {
      clearInterval(interval);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [promoCount]);

  useEffect(() => {
    setActiveIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [promoCount]);

  useEffect(() => {
    if (promoCount <= 1) return;
    const container = containerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % promoCount;
        const itemHeight = container.clientHeight;
        container.scrollTo({ top: next * itemHeight, behavior: 'smooth' });
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [promoCount]);

  if (promotedProductsWithData.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold mb-2 text-foreground flex items-center">
        <Tag className="h-4 w-4 mr-1 text-green-600" />
        Promo Khusus {getCurrentMonth()} Ceria
      </h2>
      <div
        className="flex items-center w-full"
        onMouseEnter={() => setShowAngryPromo(false)}
        onTouchStart={() => setShowAngryPromo(false)}
      >
        <div
          ref={containerRef}
          className="flex flex-col h-[80px] overflow-y-auto snap-y snap-mandatory scrollbar-hide flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {promotedProductsWithData.map((product: any, index: number) => {
            const isAngryActive = showAngryPromo && index === activeIndex;
            return (
              <div 
                key={product.id} 
                className={`border border-green-400 rounded-lg overflow-hidden shadow-sm bg-background/80 cursor-pointer snap-start h-[80px] flex-shrink-0 transition-transform duration-200 ${
                  isAngryActive ? "angry-wiggle angry-highlight" : ""
                }`}
                onClick={() => onOpenDetails(product)}
              >
                <div className="flex items-center h-full px-3 py-2 gap-2">
                  <div className="w-12 h-12 relative flex-shrink-0 rounded-md overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className={`font-medium text-xs line-clamp-1 ${isAngryActive ? "text-white" : "text-foreground"}`}>{product.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${isAngryActive ? "bg-white text-[#FF5E01]" : "bg-green-600 text-white"}`}>
                        {product.promoInfo.discount}% OFF
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] mt-1">
                      <div className={`font-medium truncate ${isAngryActive ? "text-white" : "text-green-700"}`}>
                        Kode: <span className="font-bold">{product.promoInfo.promoCode}</span>
                      </div>
                      <div className={`flex items-center px-1.5 py-0.5 rounded text-[10px] flex-shrink-0 ml-2 ${isAngryActive ? "bg-white text-[#FF5E01]" : "bg-green-100 text-green-800"}`}>
                        <Clock className="h-3 w-3 mr-1" />
                        <span className="font-medium whitespace-nowrap">{timeRemaining[product.id]}</span>
                      </div>
                    </div>
                    
                    {product.promoInfo.minQuantity && (
                      <div className={`text-[10px] inline-flex px-1.5 py-0.5 rounded mt-1 ${isAngryActive ? "bg-white text-[#FF5E01]" : "bg-green-100 text-green-800"}`}>
                        Min. {product.promoInfo.minQuantity} pcs
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {promoCount > 1 && (
          <div className="flex flex-col gap-1 ml-1 flex-shrink-0">
            {promotedProductsWithData.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${index === activeIndex ? 'bg-green-600' : 'bg-green-200'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotedProducts; 