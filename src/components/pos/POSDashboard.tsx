import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { POSHeader } from "./POSHeader";
import { CategoryTabs } from "./CategoryTabs";
import { ProductGrid } from "./ProductGrid";
import { Cart } from "./Cart";
import { OrderHistory } from "./OrderHistory";
import { toast } from "sonner";
import { convertImageToBase64 } from "@/utils/product";
import { submitPOSOrder } from "@/utils/api";
import type { POSOrderData } from "@/utils/api";
import { fetchProductsFromSupabase } from "@/services/products";
import { exportReceiptToPDF } from "@/utils/receiptPDF";
import { generateReceiptHTML } from "@/utils/receiptTemplate";
import { useAuth } from "@/contexts/AuthContext";

// Web Bluetooth API type declarations
declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }

  interface Bluetooth {
    requestDevice(options: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>;
  }

  interface BluetoothRequestDeviceOptions {
    filters?: BluetoothLEScanFilter[];
    optionalServices?: BluetoothServiceUUID[];
  }

  interface BluetoothLEScanFilter {
    services?: BluetoothServiceUUID[];
    namePrefix?: string;
    name?: string;
  }

  type BluetoothServiceUUID = string;

  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
  }

  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
  }
}

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
  models?: { code: string; image: string; price?: number }[];
  is_available: boolean;
  unit: string;
}

interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  options?: {
    modelCode?: string;
    caseVariant?: string;
    laminationVariant?: string;
    width?: number;
    height?: number;
    isDimensionalProduct?: boolean;
    dimensionText?: string;
    area?: string;
    customPrice?: number;
    overridePrice?: number;
    customPricePerSqm?: number;
  };
}

export function POSDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("Semua Produk");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [surveyQRBase64, setSurveyQRBase64] = useState<string>("");
  const [receiptData, setReceiptData] = useState<any>(null);
  const [cashierName, setCashierName] = useState<string>("");
  const receiptRef = useRef<HTMLDivElement>(null);
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [notificationsShown, setNotificationsShown] = useState<Set<string>>(new Set());
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showCart, setShowCart] = useState(true);

  // Helper to determine if a product should be treated as a banner/dimensional
  const isBanner = (product: Product) => product.pricingMethod === "dimensional";

  // Inspiring quotes in Indonesian
  const morningQuotes = [
    "Setiap pagi adalah awal yang baru. Semangat bekerja! 💪",
    "Senyum adalah awal dari kesuksesan. Mulai hari dengan senyuman! 😊",
    "Hari ini penuh dengan peluang baru. Manfaatkan dengan baik! ✨",
    "Kebahagiaan dimulai dari diri sendiri. Tetap semangat! 🌟",
    "Kerja keras hari ini adalah investasi masa depan! 🚀"
  ];

  const lunchQuotes = [
    "Jaga kesehatan dengan makan teratur. Selamat makan siang! 🍽️",
    "Istirahat sejenak untuk mengisi energi kembali. Bon Appétit! 🥗",
    "Tubuh yang sehat adalah awal dari produktivitas. Nikmati istirahatmu! ☕",
    "Waktu istirahat adalah hak kamu. Gunakan dengan baik! 🌸"
  ];

  // Play sound helper
  const playSound = (soundPath: string) => {
    try {
      const audio = new Audio(soundPath);
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  // Time-based notifications
  useEffect(() => {
    const checkTimeAndNotify = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const today = now.toDateString();

      // Create unique key for each notification
      const notifKey = `${today}-${currentHour}`;

      // Reset notifications shown at midnight
      const lastResetDate = localStorage.getItem('lastNotifReset');
      if (lastResetDate !== today) {
        setNotificationsShown(new Set());
        localStorage.setItem('lastNotifReset', today);
      }

      // Check if notification already shown today
      if (notificationsShown.has(notifKey)) return;

      // 9 AM - Morning motivation
      if (currentHour === 9 && currentMinute === 0) {
        const randomQuote = morningQuotes[Math.floor(Math.random() * morningQuotes.length)];
        toast.success(
          <div className="space-y-2">
            <p className="font-bold text-base">☀️ Selamat Pagi{cashierName ? `, ${cashierName}` : ''}!</p>
            <p className="text-sm">{randomQuote}</p>
            <div className="text-xs space-y-1 mt-2 border-t pt-2">
              <p>✨ Sudah senyum hari ini?</p>
              <p>💪 Bagaimana kondisi kesehatan dan stress level kamu?</p>
              <p>📝 Apa rencana kamu hari ini?</p>
            </div>
          </div>,
          {
            position: 'top-center',
            duration: 15000,
            style: { marginTop: '60px', minWidth: '350px' }
          }
        );
        playSound('/audio/Bubble.mp3');
        setNotificationsShown(prev => new Set(prev).add(notifKey));
      }

      // 12 PM - Lunch break
      if (currentHour === 12 && currentMinute === 0) {
        const randomQuote = lunchQuotes[Math.floor(Math.random() * lunchQuotes.length)];
        toast.info(
          <div className="space-y-2">
            <p className="font-bold text-base">🍽️ Waktu Istirahat Makan Siang!</p>
            <p className="text-sm">{randomQuote}</p>
            <div className="text-xs space-y-1 mt-2 border-t pt-2">
              <p>🥗 Siapkan makan siangmu</p>
              <p>☕ Ambil istirahat sejenak</p>
              <p>🌸 Jaga kesehatan dan energimu</p>
            </div>
          </div>,
          {
            position: 'top-center',
            duration: 15000,
            style: { marginTop: '60px', minWidth: '350px' }
          }
        );
        playSound('/audio/bell-church.mp3');
        setNotificationsShown(prev => new Set(prev).add(notifKey));
      }

      // 3 PM - Afternoon check
      if (currentHour === 15 && currentMinute === 0) {
        toast.warning(
          <div className="space-y-2">
            <p className="font-bold text-base">📦 Cek Pesanan Sore Hari</p>
            <div className="text-sm space-y-1 mt-2">
              <p>✅ Periksa pesanan yang masuk hari ini</p>
              <p>📋 Siapkan untuk penutupan</p>
              <p>🔍 Pastikan semua tercatat dengan baik</p>
              <p className="mt-2 text-xs opacity-80">Tinggal 2 jam lagi menuju penutupan! 💪</p>
            </div>
          </div>,
          {
            position: 'top-center',
            duration: 12000,
            style: { marginTop: '60px', minWidth: '350px' }
          }
        );
        playSound('/audio/Bubble 2.mp3');
        setNotificationsShown(prev => new Set(prev).add(notifKey));
      }

      // 5 PM - Closing time
      if (currentHour === 17 && currentMinute === 0) {
        toast.success(
          <div className="space-y-2">
            <p className="font-bold text-base">🏠 Waktu Penutupan Toko!</p>
            <div className="text-sm space-y-1 mt-2">
              <p>📦 Siapkan barang-barang kamu</p>
              <p>🔒 Pastikan semua sudah tersimpan dengan aman</p>
              <p>✨ Bersiaplah untuk pulang</p>
            </div>
            <div className="text-sm font-semibold mt-3 pt-2 border-t text-center">
              <p>🌟 Selamat beristirahat!</p>
              <p>👋 Sampai jumpa besok!</p>
            </div>
          </div>,
          {
            position: 'top-center',
            duration: 15000,
            style: { marginTop: '60px', minWidth: '350px' }
          }
        );
        playSound('/audio/Tidurlah Grafika.mp3');
        setNotificationsShown(prev => new Set(prev).add(notifKey));
      }
    };

    // Check immediately when component mounts
    checkTimeAndNotify();

    // Check every minute
    const interval = setInterval(checkTimeAndNotify, 60000);

    return () => clearInterval(interval);
  }, [cashierName, notificationsShown]);

  // Load products — try Supabase first, fall back to products.json
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Try Supabase first
        const sbData = await fetchProductsFromSupabase();
        if (sbData && Object.keys(sbData).length > 0) {
          const allProducts = Object.values(sbData).flat() as Product[];
          setProducts(allProducts);
          setFilteredProducts(allProducts);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[POS] Supabase products failed, falling back to JSON:', err);
      }

      // Fallback to static JSON
      try {
        const response = await fetch('/products.json?v=' + Date.now());
        const data = await response.json();
        const allProducts = Object.values(data).flat() as Product[];
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error("Gagal memuat produk. Silakan coba lagi nanti.", {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Load logo as base64 for html2canvas compatibility
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load horizontal logo for PDF
        const base64Logo = await convertImageToBase64('/product-image/Tidurlah Logo Horizontal.png');
        setLogoBase64(base64Logo);

        // Load survey QR code
        const base64SurveyQR = await convertImageToBase64('/product-image/survey-qr.png');
        setSurveyQRBase64(base64SurveyQR);
      } catch (error) {
        console.error('Failed to load images:', error);
        // Fallback to original image paths if conversion fails
        setLogoBase64('/product-image/Tidurlah Logo Horizontal.png');
        setSurveyQRBase64('/product-image/survey-qr.png');
      }
    };
    loadImages();
  }, []);

  // Load cashier name: prefer auth profile, then localStorage
  useEffect(() => {
    if (profile?.full_name) {
      setCashierName(profile.full_name);
      return;
    }
    const savedCashierName = localStorage.getItem('posCashierName');
    if (savedCashierName) {
      setCashierName(savedCashierName);
    }
  }, [profile]);

  // Get unique categories
  const categories = ["Semua Produk", ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products by category and search term
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (activeCategory !== "Semua Produk") {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [activeCategory, products, searchTerm]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Auto-add product to cart when clicked
  const handleAddProductToCart = (product: Product) => {
    // For dimensional products (banners), always add as a new separate line item
    if (isBanner(product)) {
      const newItem: CartItem = {
        cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        product,
        quantity: 1,
        options: getDefaultOptions(product)
      };
      setCartItems(prev => [...prev, newItem]);
      setSelectedProducts(prev => new Set([...prev, product.id]));
      toast.success(`${product.name} ditambahkan sebagai item baru`, {
        position: 'top-center',
        duration: 2000,
      });
      return;
    }

    // Non-dimensional: merge by product id and matching options
    const defaultOptions = getDefaultOptions(product);
    const existingItem = cartItems.find(item => {
      if (item.product.id !== product.id) return false;
      const opts1 = item.options || {};
      const opts2 = defaultOptions || {};
      return opts1.modelCode === opts2.modelCode &&
        opts1.caseVariant === opts2.caseVariant &&
        opts1.laminationVariant === opts2.laminationVariant;
    });

    if (existingItem) {
      handleUpdateQuantityById(existingItem.cartItemId, existingItem.quantity + 1);
      return;
    }

    const newItem: CartItem = {
      cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      product,
      quantity: 1,
      options: getDefaultOptions(product)
    };
    setCartItems(prev => [...prev, newItem]);
    setSelectedProducts(prev => new Set([...prev, product.id]));

    toast.success(`${product.name} ditambahkan ke keranjang`, {
      position: 'top-center',
      duration: 2000,
    });
  };

  // Get default options for a product
  const getDefaultOptions = (product: Product) => {
    const options: any = {};

    // Set default model if product has models
    if (product.models && product.models.length > 0) {
      options.modelCode = product.models[0].code;
    }

    // Set default dimensions for dimensional products
    if (product.pricingMethod === "dimensional") {
      options.width = product.minWidth || 1;
      options.height = product.minHeight || 1;
      options.isDimensionalProduct = true;
      options.dimensionText = `${options.width}m x ${options.height}m`;
      options.area = `${options.width * options.height} m²`;
    }

    // Set default case for products that need casing
    const idCardWithCaseIds = [1, 2, 6, 7, 8];
    if (idCardWithCaseIds.includes(product.id)) {
      options.caseVariant = ""; // Will require selection
    }

    // Set default lamination for products that need it
    const stikerWithLaminationIds = [15];
    if (stikerWithLaminationIds.includes(product.id)) {
      options.laminationVariant = ""; // Will require selection
    }

    return options;
  };

  // Enhanced add to cart with options
  const handleAddToCartWithOptions = (product: Product, quantity: number, options?: any) => {
    setCartItems(prevItems => {
      // For dimensional products, only merge if dimensions match; otherwise add new line
      if (isBanner(product)) {
        const indexWithSameDims = prevItems.findIndex(item =>
          item.product.id === product.id &&
          item.options?.width === options?.width &&
          item.options?.height === options?.height
        );
        if (indexWithSameDims !== -1) {
          const updated = [...prevItems];
          const existing = updated[indexWithSameDims];
          updated[indexWithSameDims] = { ...existing, quantity: existing.quantity + quantity };
          return updated;
        }
        return [...prevItems, { cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, product, quantity, options }];
      }

      // Non-dimensional: merge by product id and matching options
      const existingItemIndex = prevItems.findIndex(item => {
        if (item.product.id !== product.id) return false;
        const opts1 = item.options || {};
        const opts2 = options || {};
        return opts1.modelCode === opts2.modelCode &&
          opts1.caseVariant === opts2.caseVariant &&
          opts1.laminationVariant === opts2.laminationVariant;
      });

      if (existingItemIndex !== -1) {
        const updated = [...prevItems];
        const existing = updated[existingItemIndex];
        updated[existingItemIndex] = { ...existing, quantity: existing.quantity + quantity };
        return updated;
      }
      return [...prevItems, { cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, product, quantity, options }];
    });

    // Show toast notification
    toast.success(`${product.name} ditambahkan ke keranjang`, {
      position: 'top-center',
      duration: 2000,
      style: {
        backgroundColor: '#FF5E01',
        color: 'white',
        fontSize: '12px',
        padding: '6px 10px',
        minHeight: '36px',
        maxWidth: '260px'
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

  // Add product to cart (legacy handler for backward compatibility)
  const handleAddToCart = (product: Product) => {
    handleAddToCartWithOptions(product, 1);
  };

  // Update cart item quantity (by cart item id)
  const handleUpdateQuantityById = (cartItemId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Handle updating item options
  const handleUpdateOptionsById = (cartItemId: string, options: any) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, options } : item
      )
    );
  };

  // Remove item from cart
  const handleRemoveItemById = (cartItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  // Clear all cart items
  const handleClearAll = () => {
    setCartItems([]);
  };


  // Add design service to cart
  const handleAddDesignService = () => {
    // Find the design service product from products.json
    const designService = products.find(p => p.id === 200);

    if (designService) {
      // Check if design service is already in cart
      const existingItem = cartItems.find(item => item.product.id === 200);

      if (!existingItem) {
        const newItem: CartItem = {
          cartItemId: `${designService.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          product: designService,
          quantity: 1,
          options: {}
        };

        setCartItems(prev => [...prev, newItem]);
      }
    }
  };

  // Add express service to cart
  const handleAddExpressService = () => {
    // Find the express service product from products.json
    const expressService = products.find(p => p.id === 2001);

    if (expressService) {
      // Check if express service is already in cart
      const existingItem = cartItems.find(item => item.product.id === 2001);

      if (!existingItem) {
        const newItem: CartItem = {
          cartItemId: `${expressService.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          product: expressService,
          quantity: 1,
          options: {}
        };

        setCartItems(prev => [...prev, newItem]);
      }
    }
  };

  // Calculate applicable price for cart items (same logic as Cart component)
  const getApplicablePrice = (product: Product, quantity: number, options?: any) => {
    // Handle ongkir with dynamic price from options
    if (product.id === 2002 && options?.customPrice) {
      return options.customPrice;
    }

    // Check if this is a dimensional product with width/height options
    if (product.pricingMethod === "dimensional" && options?.width && options?.height) {
      const customPerSqm = (options.customPricePerSqm ?? options.overridePrice) as number | undefined;
      const basePerSqm = (customPerSqm && customPerSqm > 0)
        ? customPerSqm
        : (product.basePricePerSqm || product.price);
      const area = options.width * options.height;
      return basePerSqm * area;
    }

    // For non-dimensional products, allow manual override price
    if (options?.overridePrice && options.overridePrice > 0) {
      return options.overridePrice;
    }

    let basePrice = product.discountPrice || product.price;

    // Apply model price if a model with a price is selected
    if (options?.modelCode && product.models) {
      const selectedModel = product.models.find(m => m.code === options.modelCode);
      if (selectedModel && selectedModel.price !== undefined) {
        basePrice = selectedModel.price;
      }
    }

    // Handle regular price thresholds
    if (product.priceThresholds && product.priceThresholds.length > 0) {
      // Find the appropriate price threshold
      const applicableThreshold = product.priceThresholds
        .slice()
        .reverse()
        .find(threshold => quantity >= threshold.minQuantity);

      if (applicableThreshold) {
        return applicableThreshold.price;
      }
    }

    return basePrice;
  };

  // Add ongkir to cart with custom price
  const handleAddOngkir = (price: number) => {
    // Find the ongkir product from products.json
    const ongkirProduct = products.find(p => p.id === 2002);

    if (ongkirProduct) {
      // Check if ongkir is already in cart
      const existingItem = cartItems.find(item => item.product.id === 2002);

      if (existingItem) {
        // Update existing ongkir item with new price in options
        setCartItems(prev => prev.map(item =>
          item.product.id === 2002
            ? { ...item, options: { ...item.options, customPrice: price } }
            : item
        ));
      } else {
        // Add new ongkir item with custom price in options
        const newItem: CartItem = {
          cartItemId: `${ongkirProduct.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          product: ongkirProduct, // Keep original product from JSON
          quantity: 1,
          options: { customPrice: price } // Store custom price in options
        };

        setCartItems(prev => [...prev, newItem]);
      }
    }
  };


  // Generate receipt as JPG instantly
  const generateReceiptJPG = async (dataToRender?: any) => {
    return new Promise((resolve, reject) => {
      // Use passed data or fall back to state
      const data = dataToRender || receiptData;

      // Generate receipt using shared template
      if (data) {
        // Create a temporary div to render the receipt
        const receiptDiv = document.createElement('div');
        receiptDiv.innerHTML = generateReceiptHTML(
          data,
          logoBase64 || '/product-image/Tidurlah Logo Horizontal.png',
          surveyQRBase64 || '/product-image/survey-qr.png'
        );
        receiptDiv.style.position = 'absolute';
        receiptDiv.style.left = '-9999px';
        receiptDiv.style.top = '-9999px';
        receiptDiv.style.width = '350px';
        receiptDiv.style.background = 'white';
        receiptDiv.style.padding = '0';
        receiptDiv.style.margin = '0';
        receiptDiv.style.boxSizing = 'border-box';

        document.body.appendChild(receiptDiv);

        // Wait for all images (especially QR code) to load
        const images = receiptDiv.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
          });
        });

        Promise.all(imagePromises).then(() => {
          // Small delay to ensure layout is fully rendered
          setTimeout(() => {
            // Use html2canvas to convert to image
            import('html2canvas').then((html2canvas) => {
              html2canvas.default(receiptDiv, {
                backgroundColor: '#ffffff',
                scale: 3,
                width: 350,
                height: receiptDiv.scrollHeight,
                useCORS: true,
                allowTaint: true,
                logging: false,
                removeContainer: true,
                imageTimeout: 15000,
                foreignObjectRendering: false,
              }).then((canvas) => {
                // Convert to blob and download
                canvas.toBlob((blob) => {
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `receipt-${receiptData?.receiptId || 'POS'}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }

                  // Clean up
                  document.body.removeChild(receiptDiv);
                  resolve(true);
                });
              }).catch((error) => {
                document.body.removeChild(receiptDiv);
                reject(error);
              });
            });
          }, 200);
        });
      } else {
        reject(new Error('Receipt content not found'));
      }
    });
  };

  // Check if Web Bluetooth is supported
  // Note: Web Bluetooth requires HTTPS and user gesture to work
  const isBluetoothSupported = () => {
    return 'bluetooth' in navigator;
  };

  // Connect to Bluetooth thermal printer
  const connectBluetoothPrinter = async () => {
    if (!isBluetoothSupported()) {
      toast.error("Browser Anda tidak mendukung Bluetooth", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return false;
    }

    try {
      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Generic printer service
          { namePrefix: 'POS' },
          { namePrefix: 'Thermal' },
          { namePrefix: 'Printer' }
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery service
          '00001800-0000-1000-8000-00805f9b34fb', // Generic access
          '00001801-0000-1000-8000-00805f9b34fb'  // Generic attribute
        ]
      });

      // Connect to the device
      const server = await device.gatt?.connect();
      if (server) {
        setBluetoothDevice(device);
        setIsBluetoothConnected(true);

        toast.success(`Terhubung ke printer: ${device.name}`, {
          position: 'top-center',
          duration: 3000
        });

        return true;
      }
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      toast.error("Gagal terhubung ke printer Bluetooth", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return false;
    }
    return false;
  };

  // Convert image to black and white for thermal printer
  const convertToBlackAndWhite = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale and then to black/white
    for (let i = 0; i < data.length; i += 4) {
      // Calculate grayscale value
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);

      // Apply threshold for black/white conversion (adjust threshold as needed)
      const threshold = 128;
      const bw = gray > threshold ? 255 : 0;

      data[i] = bw;     // Red
      data[i + 1] = bw; // Green
      data[i + 2] = bw; // Blue
      // Alpha channel (data[i + 3]) remains unchanged
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  // Send image to Bluetooth printer
  const sendToBluetoothPrinter = async (canvas: HTMLCanvasElement) => {
    if (!bluetoothDevice || !isBluetoothConnected) {
      const connected = await connectBluetoothPrinter();
      if (!connected) return false;
    }

    try {
      // Convert to black and white for thermal printer
      const bwCanvas = convertToBlackAndWhite(canvas);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        bwCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      // IMPORTANT: This is a simplified implementation for demonstration
      // Real thermal printers require specific ESC/POS commands or other protocols
      // You'll need to implement the actual printer communication based on your printer's specifications
      // Common protocols: ESC/POS, CPCL, ZPL, etc.

      toast.success("Gambar berhasil dikirim ke printer Bluetooth!", {
        position: 'top-center',
        duration: 3000,
        style: {
          backgroundColor: '#10B981',
          color: 'white',
          fontSize: '14px',
          padding: '12px 16px'
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending to Bluetooth printer:', error);
      toast.error("Gagal mengirim ke printer Bluetooth", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return false;
    }
  };

  // Print receipt via Bluetooth
  const printReceiptBluetooth = async () => {
    if (!receiptRef.current) {
      toast.error("Data struk tidak tersedia");
      return false;
    }

    try {
      // Generate canvas from receipt
      const receiptContent = receiptRef.current.cloneNode(true) as HTMLElement;
      receiptContent.style.animation = 'none';
      receiptContent.style.transform = 'none';

      const receiptDiv = document.createElement('div');
      receiptDiv.innerHTML = receiptContent.outerHTML;
      receiptDiv.style.position = 'absolute';
      receiptDiv.style.left = '-9999px';
      receiptDiv.style.top = '-9999px';
      receiptDiv.style.width = '350px';
      receiptDiv.style.background = 'white';
      receiptDiv.style.padding = '0';
      receiptDiv.style.margin = '0';
      receiptDiv.style.boxSizing = 'border-box';

      document.body.appendChild(receiptDiv);

      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(receiptDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: 350,
        height: receiptDiv.scrollHeight,
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: true,
        imageTimeout: 0,
        foreignObjectRendering: false,
      });

      // Clean up DOM
      document.body.removeChild(receiptDiv);

      // Send to Bluetooth printer
      const success = await sendToBluetoothPrinter(canvas);
      return success;
    } catch (error) {
      console.error('Error printing via Bluetooth:', error);
      toast.error("Gagal mencetak via Bluetooth");
      return false;
    }
  };

  // Generate invoice ID with customer name and order details
  const generateInvoiceId = (customerName: string, itemCount: number): string => {
    // Extract initials from customer name (max 3 characters)
    const words = customerName.trim().split(/\s+/);
    let initials = '';

    if (words.length === 1) {
      // Single name: take first 3 characters
      initials = words[0].substring(0, 3).toUpperCase();
    } else {
      // Multiple names: take first letter of each word (max 3)
      initials = words
        .slice(0, 3)
        .map(word => word[0])
        .join('')
        .toUpperCase();
    }

    // Format: INV-{INITIALS}-{YYMMDD}-{HHMMSS}-{ITEMS}
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(2, 8); // YYMMDD
    const timeStr = now.toISOString().replace(/[-:T.]/g, '').slice(9, 15); // HHMMSS

    return `INV-${initials}-${dateStr}-${timeStr}-${itemCount}P`;
  };

  // Process order with receipt generation (modified to handle print mode)
  const handleProcessOrder = async (customerDetails: { name: string; phone: string; instansi: string; delivery?: { recipientName: string; recipientPhone: string; address: string }; downPayment?: number; deadline?: string }, printMode: boolean = false) => {
    if (cartItems.length === 0) {
      toast.error("Keranjang masih kosong!");
      return;
    }

    try {
      // Generate receipt data with customer-specific invoice ID
      const receiptId = generateInvoiceId(customerDetails.name, cartItems.length);

      // Calculate subtotal (with discounts applied through getApplicablePrice)
      const subtotal = cartItems.reduce((total, item) => {
        const applicablePrice = getApplicablePrice(item.product, item.quantity, item.options);
        return total + (applicablePrice * item.quantity);
      }, 0);

      // Calculate total discounts (original price - applicable price)
      const totalDiscounts = cartItems.reduce((total, item) => {
        // Skip discount calculation for ongkir (custom price product)
        if (item.product.id === 2002) {
          return total;
        }
        const originalPrice = item.product.price;
        const applicablePrice = getApplicablePrice(item.product, item.quantity, item.options);
        if (applicablePrice < originalPrice) {
          const discount = (originalPrice - applicablePrice) * item.quantity;
          return total + discount;
        }
        return total;
      }, 0);

      const receiptData = {
        receiptId,
        timestamp: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        cashier: cashierName || "POS Kasir",
        customer: customerDetails, // Now includes customer info
        items: cartItems.map(item => {
          const applicablePrice = getApplicablePrice(item.product, item.quantity, item.options);
          return {
            name: item.product.name,
            quantity: item.quantity,
            price: applicablePrice,
            subtotal: applicablePrice * item.quantity,
            modelCode: item.options?.modelCode,
            caseVariant: item.options?.caseVariant,
            laminationVariant: item.options?.laminationVariant,
            width: item.options?.width,
            height: item.options?.height,
            dimensionText: item.options?.dimensionText,
            area: item.options?.area
          };
        }),
        summary: {
          subtotal,
          discount: totalDiscounts,
          tax: 0,
          total: subtotal, // Subtotal already has discounts applied
          downPayment: customerDetails.downPayment || 0,
          remainingBalance: subtotal - (customerDetails.downPayment || 0)
        },
        // Add shipping info in the format expected by OrderHistory
        shipping: customerDetails.delivery ? {
          customerName: customerDetails.delivery.recipientName,
          customerPhone: customerDetails.delivery.recipientPhone,
          address: customerDetails.delivery.address
        } : undefined
      };

      // Prepare POS order data for Google Sheets
      const posOrderData: POSOrderData = {
        receiptId,
        cashier: cashierName || "POS Kasir",
        cashierUserId: profile?.id,
        customerName: customerDetails.name,
        phoneNumber: customerDetails.phone,
        institution: customerDetails.instansi,
        delivery: customerDetails.delivery ? {
          recipientName: customerDetails.delivery.recipientName,
          recipientPhone: customerDetails.delivery.recipientPhone,
          address: customerDetails.delivery.address
        } : undefined,
        items: cartItems.map(item => {
          const applicablePrice = getApplicablePrice(item.product, item.quantity, item.options);
          return {
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: applicablePrice,
            subtotal: applicablePrice * item.quantity,
            modelCode: item.options?.modelCode,
            caseVariant: item.options?.caseVariant,
            laminationVariant: item.options?.laminationVariant,
            width: item.options?.width,
            height: item.options?.height,
            dimensionText: item.options?.dimensionText,
            area: item.options?.area
          };
        }),
        subtotal,
        discount: totalDiscounts,
        total: subtotal, // Subtotal already has discounts applied
        downPayment: customerDetails.downPayment || 0,
        remainingBalance: subtotal - (customerDetails.downPayment || 0),
        paymentMethod: 'Cash',
        deadline: customerDetails.deadline || ''
      };

      // Save to localStorage for order history immediately
      try {
        const existingHistory = localStorage.getItem('orderHistory');
        const orderHistory = existingHistory ? JSON.parse(existingHistory) : [];
        orderHistory.push(receiptData);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
      } catch (error) {
        console.error('Error saving to order history:', error);
      }

      // Set receipt data and generate JPG immediately (like Index.tsx)
      setReceiptData(receiptData);
      setShowReceipt(true);

      // Handle different modes: auto-download vs print mode
      if (!printMode) {
        // Auto-generate and download receipt instantly (original behavior)
        setTimeout(async () => {
          try {
            await generateReceiptJPG(receiptData);
            toast.success("Pesanan berhasil diproses! Struk telah diunduh", {
              position: 'top-center',
              duration: 3000,
              style: {
                backgroundColor: '#10B981',
                color: 'white',
                fontSize: '14px',
                padding: '12px 16px',
                minHeight: '48px',
                maxWidth: '320px',
                lineHeight: '1.4'
              }
            });

            // Clear cart and close modal
            setCartItems([]);
            setSelectedProducts(new Set());
            setShowReceipt(false);
          } catch (error) {
            console.error('Error generating receipt:', error);
            toast.error('Gagal membuat struk. Silakan coba lagi.');
            setShowReceipt(false);
          }
        }, 100);
      } else {
        // Print mode: just generate receipt data, don't auto-download
        setTimeout(() => {
          toast.success("Data struk siap untuk dicetak", {
            position: 'top-center',
            duration: 2000,
            style: {
              backgroundColor: '#10B981',
              color: 'white',
              fontSize: '12px',
              padding: '8px 12px'
            }
          });
        }, 100);
      }

      // Submit to Google Sheets in background (non-blocking)
      submitPOSOrder(posOrderData).catch(error => {
        console.error('Background Google Sheets submission failed:', error);
        // Show a subtle notification but don't block the user
        setTimeout(() => {
          toast.warning("Pesanan tersimpan lokal, namun gagal sinkronisasi ke server", {
            position: 'top-center',
            duration: 2000,
            style: { fontSize: '12px', marginTop: '60px' }
          });
        }, 2000);
      });
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error("Gagal memproses pesanan. Silakan coba lagi.");
    }
  };


  // Handle complete print order (process + print via Bluetooth)
  const handlePrintOrder = async (customerDetails: { name: string; phone: string; instansi: string; delivery?: { recipientName: string; recipientPhone: string; address: string }; downPayment?: number }) => {
    try {
      // First process the order in print mode (generates receipt data, no auto-download)
      await handleProcessOrder(customerDetails, true);

      // Small delay to ensure receipt data is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Then print via Bluetooth
      const printSuccess = await printReceiptBluetooth();

      if (printSuccess) {
        // Generate JPG receipt after successful Bluetooth print
        try {
          await generateReceiptJPG();
          toast.success("Pesanan berhasil dicetak! Struk JPG telah diunduh", {
            position: 'top-center',
            duration: 3000,
          });
        } catch (error) {
          console.error('Error generating JPG after print:', error);
          // Don't fail the entire operation if JPG generation fails
        }

        // Clear cart after successful print
        setCartItems([]);
        setSelectedProducts(new Set());
        setShowReceipt(false);
      }

      return printSuccess;
    } catch (error) {
      console.error('Error in print order:', error);
      toast.error("Gagal mencetak pesanan via Bluetooth");
      return false;
    }
  };

  // Handle PDF export with V2 template (bigger fonts)
  const handleExportPDF = async (customerDetails: { name: string; phone: string; instansi: string; delivery?: { recipientName: string; recipientPhone: string; address: string }; downPayment?: number }) => {
    try {
      // First process the order to generate receipt data (but don't submit to sheets yet)
      const receiptId = generateInvoiceId(customerDetails.name, cartItems.length);
      const subtotal = cartItems.reduce((total, item) => {
        const applicablePrice = getApplicablePrice(item.product, item.quantity, item.options);
        return total + (applicablePrice * item.quantity);
      }, 0);

      const pdfReceiptData = {
        receiptId,
        timestamp: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        cashier: cashierName || "POS Kasir",
        customer: customerDetails,
        items: cartItems.map(item => {
          const applicablePrice = getApplicablePrice(item.product, item.quantity, item.options);
          return {
            name: item.product.name,
            quantity: item.quantity,
            price: applicablePrice,
            subtotal: applicablePrice * item.quantity,
            modelCode: item.options?.modelCode,
            caseVariant: item.options?.caseVariant,
            laminationVariant: item.options?.laminationVariant,
            width: item.options?.width,
            height: item.options?.height,
            dimensionText: item.options?.dimensionText,
            area: item.options?.area
          };
        }),
        summary: {
          subtotal,
          discount: 0,
          tax: 0,
          total: subtotal,
          downPayment: customerDetails.downPayment || 0,
          remainingBalance: subtotal - (customerDetails.downPayment || 0)
        }
      };

      // Export to PDF using V2 template (bigger fonts)
      const exportSuccess = await exportReceiptToPDF(pdfReceiptData, logoBase64, surveyQRBase64);

      if (exportSuccess) {
        // Now submit the order to Google Sheets
        await handleProcessOrder(customerDetails, false);

        // Clear cart after successful export
        setCartItems([]);
        setSelectedProducts(new Set());
        setShowReceipt(false);
      }

      return exportSuccess;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Gagal membuat PDF");
      return false;
    }
  };

  // Handle cashier name change
  const handleCashierNameChange = (name: string) => {
    setCashierName(name);
    localStorage.setItem('posCashierName', name);
  };

  // Handle back navigation to cashier page
  const handleBackToCashier = () => {
    navigate('/cashier');
  };

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
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header - Compact and fixed at top */}
      <POSHeader
        onShowOrderHistory={() => setShowOrderHistory(true)}
        onSearch={!showOrderHistory ? handleSearch : undefined}
        searchTerm={searchTerm}
        cashierName={cashierName}
        onCashierNameChange={handleCashierNameChange}
      />

      {showOrderHistory ? (
        <div className="flex-1 overflow-hidden bg-gray-50">
          <OrderHistory onBack={() => setShowOrderHistory(false)} cashierName={cashierName} />
        </div>
      ) : (
        /* Main Content Area - Responsive Layout */
        <div className="flex-1 flex overflow-hidden">
          {/* Products Section - Full width on mobile, 65% on desktop */}
          <div className="flex-1 flex flex-col p-2 md:p-4 overflow-hidden">
            {/* Category Tabs */}
            <div className="mb-2 md:mb-4">
              <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            {/* Product Grid - Scrollable */}
            <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden relative">
              <ProductGrid
                products={filteredProducts}
                onAddToCart={handleAddProductToCart}
                selectedProducts={selectedProducts}
                isCartVisible={showCart}
              />
            </div>
          </div>

          {/* Desktop Cart - Toggleable on desktop */}
          <div className={`hidden md:flex bg-background border-l border-gray-200 flex-col transition-all duration-300 ease-in-out ${showCart ? "w-1/2" : "w-0 overflow-hidden border-l-0"
            }`}>
            <Cart
              items={cartItems}
              onUpdateQuantityById={handleUpdateQuantityById}
              onRemoveItemById={handleRemoveItemById}
              onClearAll={handleClearAll}
              onProcessOrder={handleProcessOrder}
              onUpdateOptionsById={handleUpdateOptionsById}
              onPrintOrder={handlePrintOrder}
              onExportPDF={handleExportPDF}
              onAddDesignService={handleAddDesignService}
              onAddExpressService={handleAddExpressService}
              onAddOngkir={handleAddOngkir}
              isBluetoothSupported={isBluetoothSupported()}
            />
          </div>

          {/* Toggle Cart Button - Floating on the right edge */}
          <button
            onClick={() => setShowCart(!showCart)}
            className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-white border border-gray-200 shadow-md rounded-l-lg items-center justify-center transition-all duration-300 hover:bg-orange-50 group ${showCart ? "right-1/2" : "right-0"
              }`}
            title={showCart ? "Sembunyikan Keranjang" : "Tampilkan Keranjang"}
          >
            {showCart ? (
              <ChevronRight className="w-4 h-4 text-[#FF5E01] transition-transform group-hover:translate-x-0.5" />
            ) : (
              <div className="relative">
                <ChevronLeft className="w-4 h-4 text-[#FF5E01] transition-transform group-hover:-translate-x-0.5" />
                {cartItems.length > 0 && (
                  <div className="absolute -top-6 -left-2 bg-[#FF5E01] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {cartItems.length}
                  </div>
                )}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Mobile Cart - Floating Action Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowMobileCart(true)}
          className="relative bg-[#FF5E01] hover:bg-[#e54d00] text-white rounded-full p-4 shadow-lg transition-all duration-200 active:scale-95"
          aria-label="Open Cart"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Cart Modal */}
      {showMobileCart && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileCart(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowMobileCart(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              aria-label="Close Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Cart Content - Fully Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <Cart
                items={cartItems}
                onUpdateQuantityById={handleUpdateQuantityById}
                onRemoveItemById={handleRemoveItemById}
                onClearAll={handleClearAll}
                onProcessOrder={handleProcessOrder}
                onUpdateOptionsById={handleUpdateOptionsById}
                onPrintOrder={handlePrintOrder}
                onExportPDF={handleExportPDF}
                onAddDesignService={handleAddDesignService}
                onAddExpressService={handleAddExpressService}
                onAddOngkir={handleAddOngkir}
                isBluetoothSupported={isBluetoothSupported()}
                isMobile={true}
                onClose={() => setShowMobileCart(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden Receipt Content for JPG Generation */}
      <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
        <div className="bg-background p-4 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">

          {/* Thermal Printer Simulation */}
          <div className={`printer-container ${showReceipt ? 'printer-active' : ''}`}>
            {/* Printer LED Indicator */}
            <div className="printer-indicator"></div>

            {/* Printer Slot */}
            <div className="printer-slot"></div>

            {/* Receipt Sliding Area */}
            <div className="receipt-slide-container">
              <div
                ref={receiptRef}
                className={`receipt-paper ${showReceipt ? 'receipt-sliding' : ''}`}
              >
                <div
                  className="receipt-content"
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.3',
                    width: '100%',
                    maxWidth: '350px',
                    margin: '0 auto',
                    minWidth: '300px',
                    fontFamily: 'Courier New, Consolas, Monaco, Lucida Console, monospace',
                    color: '#000000',
                    overflow: 'visible',
                    wordWrap: 'break-word',
                    backgroundColor: 'white',
                    padding: '8px 6px',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Store Header */}
                  <div className="receipt-header">
                    <div className="receipt-logo-section">
                      <div className="flex justify-center items-center mb-2">
                        {logoBase64 ? (
                          <img
                            src={logoBase64}
                            alt="TIDURLAH GRAFIKA"
                            className="max-h-10 sm:max-h-12 md:max-h-14 w-auto object-contain max-w-[140px] sm:max-w-[160px] md:max-w-[180px]"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="max-h-10 sm:max-h-12 md:max-h-14 w-auto object-contain max-w-[140px] sm:max-w-[160px] md:max-w-[180px] flex items-center justify-center bg-gray-200 rounded">
                            <span className="text-xs text-gray-500">Loading...</span>
                          </div>
                        )}
                      </div>
                      <h2 className="receipt-store-title">TIDURLAH GRAFIKA</h2>
                      <p className="receipt-slogan">"Cetak apa aja, Tidurlah Grafika!"</p>
                      <p className="receipt-address">Jl. Perum Pemda Wayhui, Way Hui</p>
                      <p className="receipt-address">Kec. Jati Agung, Lampung Selatan 35365</p>
                    </div>
                    <div className="receipt-separator"></div>
                    <div className="receipt-contact">
                      <p>WhatsApp: 085172157808</p>
                      <p>Instagram: @tidurlah_grafika | @idcard_lampung</p>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="receipt-meta">
                    <div className="receipt-meta-row">
                      <span>No. Transaksi:</span>
                      <span className="font-bold">{receiptData?.receiptId}</span>
                    </div>
                    <div className="receipt-meta-row">
                      <span>Tanggal:</span>
                      <span>{receiptData?.timestamp}</span>
                    </div>
                    <div className="receipt-meta-row">
                      <span>Kasir:</span>
                      <span>{receiptData?.cashier}</span>
                    </div>
                    {receiptData?.customer && (
                      <>
                        <div className="receipt-separator"></div>
                        <div className="receipt-meta-row">
                          <span>Pelanggan:</span>
                          <span style={{ fontWeight: '900', fontSize: '15px', textShadow: '0.5px 0.5px 0px #000' }}>{receiptData.customer.name}</span>
                        </div>
                        <div className="receipt-meta-row">
                          <span>Telepon:</span>
                          <span>{receiptData.customer.phone}</span>
                        </div>
                        {receiptData.customer.instansi && (
                          <div className="receipt-meta-row">
                            <span>Instansi:</span>
                            <span>{receiptData.customer.instansi}</span>
                          </div>
                        )}
                        {receiptData.customer.delivery && (
                          <>
                            <div className="receipt-separator"></div>
                            <div className="receipt-meta-row" style={{ fontWeight: '900', textAlign: 'center', fontSize: '13px', marginBottom: '2px' }}>
                              <span>INFORMASI PENGIRIMAN</span>
                            </div>
                            <div className="receipt-meta-row">
                              <span>Penerima:</span>
                              <span style={{ fontWeight: '900', fontSize: '15px', textShadow: '0.5px 0.5px 0px #000' }}>{receiptData.customer.delivery.recipientName}</span>
                            </div>
                            <div className="receipt-meta-row">
                              <span>Telepon:</span>
                              <span>{receiptData.customer.delivery.recipientPhone}</span>
                            </div>
                            <div className="receipt-meta-row">
                              <span>Alamat:</span>
                            </div>
                            <div style={{ lineHeight: '1.2', paddingLeft: '4px', wordWrap: 'break-word' }}>
                              {receiptData.customer.delivery.address}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Items */}
                  <div className="receipt-items">
                    <div className="receipt-items-title">DETAIL PEMBELIAN</div>
                    <div className="receipt-items-list">
                      {receiptData?.items?.map((item: any, index: number) => (
                        <div key={index} className="receipt-item">
                          <div className="receipt-item-name">
                            {item.name}
                            {item.width && item.height && (
                              <span className="receipt-item-dimension"> ({item.width}m x {item.height}m)</span>
                            )}
                            {item.modelCode && (
                              <span className="receipt-item-model"> [{item.modelCode}]</span>
                            )}
                          </div>
                          {item.caseVariant && (
                            <div className="receipt-item-detail">
                              Casing: {item.caseVariant}
                            </div>
                          )}
                          {item.laminationVariant && (
                            <div className="receipt-item-detail">
                              Laminasi: {item.laminationVariant}
                            </div>
                          )}
                          <div className="receipt-item-pricing">
                            <span>{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</span>
                            <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="receipt-summary">
                    <div className="receipt-summary-row">
                      <span>Subtotal:</span>
                      <span>Rp {receiptData?.summary?.subtotal?.toLocaleString('id-ID')}</span>
                    </div>

                    {receiptData?.summary?.discount > 0 && (
                      <div className="receipt-summary-row receipt-discount">
                        <span>Diskon:</span>
                        <span>-Rp {receiptData?.summary?.discount?.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    <div className="receipt-summary-row receipt-total">
                      <span>TOTAL:</span>
                      <span>Rp {receiptData?.summary?.total?.toLocaleString('id-ID')}</span>
                    </div>

                    {receiptData?.summary?.downPayment > 0 && (
                      <>
                        <div className="receipt-summary-row" style={{ color: '#10B981', fontWeight: 'bold' }}>
                          <span>DP (Down Payment):</span>
                          <span>Rp {receiptData?.summary?.downPayment?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="receipt-summary-row" style={{ color: '#2563EB', fontWeight: 'bold', fontSize: '14px' }}>
                          <span>SISA BAYAR:</span>
                          <span>Rp {receiptData?.summary?.remainingBalance?.toLocaleString('id-ID')}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Survey Section */}
                  <div className="receipt-separator"></div>
                  <div style={{ padding: '6px 4px', backgroundColor: '#f8f8f8', marginTop: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src="/product-image/survey-qr.png"
                        alt="Survey QR Code"
                        style={{ width: '70px', height: '70px', border: '1px solid #ddd', borderRadius: '4px' }}
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px', color: '#333', lineHeight: '1.2' }}>
                        Seberapa baikkah pelayanan kami?
                      </div>
                      <div style={{ fontSize: '10px', lineHeight: '1.3', marginBottom: '3px', color: '#555' }}>
                        Kami ingin mendengar pendapat Anda. Pindai QR atau kunjungi:
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#ff6b35' }}>
                        tidurlah.com/survey
                      </div>
                    </div>
                  </div>

                  <div className="receipt-separator"></div>

                  {/* Footer */}
                  <div className="receipt-footer">
                    <div className="receipt-thank-you">Terima kasih telah berbelanja!</div>
                    <div className="receipt-disclaimer">Barang yang sudah dibeli tidak dapat dikembalikan</div>


                    <div className="receipt-timestamp">
                      Struk ini dibuat secara otomatis pada {new Date().toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Struk akan tertutup otomatis setelah selesai dicetak</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
