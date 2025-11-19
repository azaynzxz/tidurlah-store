import { useState, useEffect, useRef } from "react";
import { X, Tag, Clock, Gift, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { promotedProducts, validPromoCodes, PRODUCT_VERSION, PROMO_BANNER_ENABLED } from "@/constants";
import { usePromoBanner } from "@/contexts/PromoBannerContext";

/**
 * PromoBanner Component
 * 
 * @description
 * Displays a promotional banner at the top of all pages showing the "HUT 3 TAHUN" promo.
 * The banner includes:
 * - Promo title and countdown timer
 * - Clickable banner that opens a detailed popup
 * - Close button to dismiss the banner
 * - Responsive design for mobile and desktop
 * 
 * @features
 * - Visibility controlled by `PROMO_BANNER_ENABLED` constant in `@/constants`
 * - Automatically hides when promo period ends (Nov 25, 2025)
 * - Remembers dismissal state in localStorage
 * - Dynamically adjusts header position based on banner visibility
 * 
 * @usage
 * To enable/disable the banner, modify `PROMO_BANNER_ENABLED` in `src/constants/index.ts`:
 * - Set to `true` to enable the banner
 * - Set to `false` to completely disable it
 * 
 * @see {@link PROMO_BANNER_ENABLED} in `@/constants` for global visibility control
 */
const PromoBanner = () => {
  const { isBannerVisible, setBannerVisible } = usePromoBanner();
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);
  const [products, setProducts] = useState<any>({});
  const bannerRef = useRef<HTMLDivElement>(null);

  // Promo dates: November 20-25, 2025
  const promoStartDate = new Date('2025-11-20T00:00:00');
  const promoEndDate = new Date('2025-11-25T23:59:59');
  
  // Check if promo banner is enabled globally AND if current date is within promo period
  const now = new Date();
  const isPromoActive = PROMO_BANNER_ENABLED && now >= promoStartDate && now <= promoEndDate;

  // Load products to get product names and prices
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/products.json?v=${PRODUCT_VERSION}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Calculate time remaining until end date
  const calculateTimeRemaining = () => {
    const now = new Date();
    const difference = promoEndDate.getTime() - now.getTime();
    
    if (difference <= 0) {
      return "Promo berakhir";
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Update countdown every second (only if banner is enabled and promo is active)
  useEffect(() => {
    if (!PROMO_BANNER_ENABLED || !isPromoActive) {
      setBannerVisible(false);
      return;
    }

    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining());
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [setBannerVisible]);

  // Check localStorage for dismissed state
  useEffect(() => {
    const dismissed = localStorage.getItem('promoBannerDismissed');
    if (dismissed === 'true') {
      setBannerVisible(false);
    }
  }, [setBannerVisible]);

  // Update CSS variable with banner height for header positioning
  useEffect(() => {
    if (bannerRef.current && isBannerVisible) {
      const height = bannerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--promo-banner-height', `${height}px`);
    } else {
      document.documentElement.style.setProperty('--promo-banner-height', '0px');
    }
  }, [isBannerVisible, timeRemaining]);

  const handleClose = () => {
    setBannerVisible(false);
    localStorage.setItem('promoBannerDismissed', 'true');
  };

  const handleBannerClick = () => {
    setShowPopup(true);
  };

  // Get HUT3TH promoted products
  const hut3thProducts = promotedProducts.filter(p => p.promoCode === "HUT3TH");

  // Don't render if banner is disabled globally, not visible, or promo period has not started/ended
  if (!PROMO_BANNER_ENABLED || !isBannerVisible || !isPromoActive) {
    return null;
  }

  return (
    <>
      {/* Promo Banner - Fixed at top, above Header */}
      <div 
        ref={bannerRef}
        className="bg-gradient-to-r from-[#FF6B1A] to-[#FF5E01] text-white py-1.5 md:py-2 px-3 md:px-4 sticky top-0 z-[100001] cursor-pointer hover:opacity-95 transition-opacity shadow-md"
        style={{ marginBottom: 0, marginTop: 0, lineHeight: '1.2', display: 'block' }}
        onClick={handleBannerClick}
      >
        <div className="container mx-auto max-w-7xl flex items-center justify-center gap-1.5 md:gap-2 relative">
          {/* Centered Content - Single Row */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-center">
            <Tag className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="font-bold text-[10px] md:text-sm lg:text-base whitespace-nowrap">
              PROMO HUT 3 TAHUN
            </span>
            <div className="flex items-center gap-1 md:gap-2">
              <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[9px] md:text-xs font-medium whitespace-nowrap">
                {timeRemaining}
              </span>
            </div>
            <span className="text-[9px] md:text-xs opacity-90 whitespace-nowrap hidden sm:inline">
              Klik untuk detail promo
            </span>
          </div>
          
          {/* Close Button - Positioned absolutely on the right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="absolute right-0 p-0.5 md:p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            aria-label="Tutup banner"
          >
            <X className="h-3 w-3 md:h-4 md:w-4" />
          </button>
        </div>
      </div>

      {/* Promo Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#FF5E01] flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#FF5E01]" />
              Promo HUT 3 Tahun ID Card Lampung
            </DialogTitle>
            <DialogDescription>
              Masukkan kode promo <span className="font-bold text-[#FF5E01]">HUT3TH</span> saat checkout untuk mendapatkan harga spesial!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-green-800 mb-2">
                <Calendar className="h-4 w-4" />
                <span>Periode Promo: 20-25 November 2025</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Clock className="h-4 w-4" />
                <span>Sisa waktu: <span className="font-bold">{timeRemaining}</span></span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-700">Produk Promo:</h3>
              {hut3thProducts.map((promo) => {
                // Find product details from loaded products
                const allProducts = Object.values(products).flat() as any[];
                const product = allProducts.find((p: any) => p.id === promo.id);
                const overridePrices = validPromoCodes["HUT3TH"]?.overridePrices;
                const promoPrice = overridePrices?.[promo.id];
                const originalPrice = product?.price || (promo.id === 8 ? 25000 : 20000);
                
                return (
                  <div key={promo.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {product?.name || (promo.id === 8 ? "Paket IDC LYD 2S" : "Paket IDC LYD 1S")}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Diskon {promo.discount}%
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-xs text-gray-500 line-through">
                          Rp {originalPrice.toLocaleString('id-ID')}
                        </p>
                        <p className="text-lg font-bold text-[#FF5E01]">
                          Rp {promoPrice?.toLocaleString('id-ID') || (promo.id === 8 ? "15.000" : "13.000")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                <span className="font-bold">Cara menggunakan:</span>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                  <li>Tambahkan produk promo ke keranjang</li>
                  <li>Klik checkout</li>
                  <li>Masukkan kode promo <span className="font-bold">HUT3TH</span></li>
                  <li>Harga akan otomatis disesuaikan</li>
                </ol>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PromoBanner;

