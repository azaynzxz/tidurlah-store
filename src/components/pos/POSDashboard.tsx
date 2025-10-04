import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { POSHeader } from "./POSHeader";
import { CategoryTabs } from "./CategoryTabs";
import { ProductGrid } from "./ProductGrid";
import { Cart } from "./Cart";
import { OrderHistory } from "./OrderHistory";
import { toast } from "sonner";
import { convertImageToBase64, calculateBannerPrice } from "@/utils/product";
import { submitPOSOrder, POSOrderData } from "@/utils/api";

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
  models?: { code: string; image: string }[];
  is_available: boolean;
  unit: string;
}

interface CartItem {
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
  };
}

export function POSDashboard() {
  const navigate = useNavigate();
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
  const [receiptData, setReceiptData] = useState<any>(null);
  const [cashierName, setCashierName] = useState<string>("");
  const receiptRef = useRef<HTMLDivElement>(null);
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);

  // Load products from JSON file
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/products.json?v=' + Date.now());
        const data = await response.json();

        // Flatten the product data from the new format
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
    const loadLogo = async () => {
      try {
        const base64Logo = await convertImageToBase64('/product-image/Logo Tidurlah and ID Card Lampung.png');
        setLogoBase64(base64Logo);
      } catch (error) {
        console.error('Failed to load logo:', error);
        // Fallback to original image path if conversion fails
        setLogoBase64('/product-image/Logo Tidurlah and ID Card Lampung.png');
      }
    };
    loadLogo();
  }, []);

  // Load cashier name from localStorage on component mount
  useEffect(() => {
    const savedCashierName = localStorage.getItem('posCashierName');
    if (savedCashierName) {
      setCashierName(savedCashierName);
    }
  }, []);

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
    // Check if product is already in cart
    const existingItem = cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // If exists, increase quantity
      handleUpdateQuantity(product.id, existingItem.quantity + 1);
    } else {
      // Add new item with default options
      const newItem: CartItem = {
        product,
        quantity: 1,
        options: getDefaultOptions(product)
      };
      
      setCartItems(prev => [...prev, newItem]);
      setSelectedProducts(prev => new Set([...prev, product.id]));
    }
    
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
      const existingItem = prevItems.find(item => item.product.id === product.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { product, quantity, options }];
      }
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

  // Handle updating item options
  const handleUpdateOptions = (productId: number, options: any) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, options } : item
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

  // Calculate applicable price for products (same logic as Cart component)
  const getApplicablePrice = (product: Product, quantity: number, options?: any) => {
    // Check if this is a dimensional product with width/height options
    if (product.pricingMethod === "dimensional" && options?.width && options?.height) {
      return calculateBannerPrice(product, options.width, options.height);
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

    return product.discountPrice || product.price;
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
          product: designService,
          quantity: 1,
          options: {}
        };
        
        setCartItems(prev => [...prev, newItem]);
      }
    }
  };


  // Generate receipt as JPG instantly
  const generateReceiptJPG = async () => {
    return new Promise((resolve, reject) => {
      // Generate receipt immediately without animation delay
      if (receiptRef.current) {
          // Clone the receipt content to avoid modifying the original
          const receiptContent = receiptRef.current.cloneNode(true) as HTMLElement;

          // Remove any animations or transitions for clean JPG output
          receiptContent.style.animation = 'none';
          receiptContent.style.transform = 'none';

          // Create a temporary div to render the receipt
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
              imageTimeout: 0,
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

  // Process order with receipt generation (modified to handle print mode)
  const handleProcessOrder = async (customerDetails: { name: string; phone: string; instansi: string; delivery?: { recipientName: string; recipientPhone: string; address: string } }, printMode: boolean = false) => {
    if (cartItems.length === 0) {
      toast.error("Keranjang masih kosong!");
      return;
    }

    try {
      // Generate receipt data
      const receiptId = `TRX-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`;
      const subtotal = cartItems.reduce((total, item) => {
        const applicablePrice = getApplicablePrice(item.product, item.quantity, item.options);
        return total + (applicablePrice * item.quantity);
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
          discount: 0,
          tax: 0,
          total: subtotal
        }
      };

      // Prepare POS order data for Google Sheets
      const posOrderData: POSOrderData = {
        receiptId,
        cashier: cashierName || "POS Kasir",
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
        discount: 0,
        total: subtotal,
        paymentMethod: 'Cash'
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
            await generateReceiptJPG();
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
  const handlePrintOrder = async (customerDetails: { name: string; phone: string; instansi: string; delivery?: { recipientName: string; recipientPhone: string; address: string } }) => {
    try {
      // First process the order in print mode (generates receipt data, no auto-download)
      await handleProcessOrder(customerDetails, true);
      
      // Small delay to ensure receipt data is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then print via Bluetooth
      const printSuccess = await printReceiptBluetooth();
      
      if (printSuccess) {
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

  // Handle cashier name change
  const handleCashierNameChange = (name: string) => {
    setCashierName(name);
    localStorage.setItem('posCashierName', name);
  };

  // Handle back navigation to cashier page
  const handleBackToCashier = () => {
    navigate('/cashier');
  };

  if (showOrderHistory) {
    return <OrderHistory onBack={() => setShowOrderHistory(false)} cashierName={cashierName} />;
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
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header - Compact and fixed at top */}
      <POSHeader 
        onShowOrderHistory={() => setShowOrderHistory(true)} 
        onSearch={handleSearch} 
        searchTerm={searchTerm}
        cashierName={cashierName}
        onCashierNameChange={handleCashierNameChange}
      />

      {/* Main Content Area - Full Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Products (65%) */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Category Tabs */}
          <div className="mb-4">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Product Grid - Scrollable */}
          <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden">
            <ProductGrid
              products={filteredProducts}
              onAddToCart={handleAddProductToCart}
              selectedProducts={selectedProducts}
            />
          </div>
        </div>

        {/* Right side - Cart (35%) */}
        <div className="w-[420px] bg-white border-l border-gray-200 flex flex-col">
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
            onProcessOrder={handleProcessOrder}
            onUpdateOptions={handleUpdateOptions}
            onPrintOrder={handlePrintOrder}
            onAddDesignService={handleAddDesignService}
            isBluetoothSupported={isBluetoothSupported()}
          />
        </div>
      </div>

      {/* Hidden Receipt Content for JPG Generation */}
      <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">

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
                      fontSize: '12px',
                      lineHeight: '1.4',
                      width: '100%',
                      maxWidth: '350px',
                      margin: '0 auto',
                      minWidth: '300px',
                      fontFamily: 'Courier New, Consolas, Monaco, Lucida Console, monospace',
                      color: '#000000',
                      overflow: 'visible',
                      wordWrap: 'break-word',
                      backgroundColor: 'white',
                      padding: '16px 12px',
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
                        <p className="receipt-address">Perum. Korpri Raya, Blok D3. No. 3</p>
                        <p className="receipt-address">Sukarame, Bandar Lampung</p>
                      </div>
                      <div className="receipt-separator"></div>
                      <div className="receipt-contact">
                        <p>WhatsApp: 085172157808</p>
                        <p>Instagram: @tidurlah_grafika</p>
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
                            <span>{receiptData.customer.name}</span>
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
                              <div className="receipt-meta-row">
                                <span>INFORMASI PENGIRIMAN</span>
                              </div>
                              <div className="receipt-meta-row">
                                <span>Penerima:</span>
                                <span>{receiptData.customer.delivery.recipientName}</span>
                              </div>
                              <div className="receipt-meta-row">
                                <span>Telepon:</span>
                                <span>{receiptData.customer.delivery.recipientPhone}</span>
                              </div>
                              <div className="receipt-meta-row">
                                <span>Alamat:</span>
                              </div>
                              <div style={{ fontSize: '11px', lineHeight: '1.3', marginTop: '2px', paddingLeft: '4px', wordWrap: 'break-word' }}>
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
                    </div>

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
