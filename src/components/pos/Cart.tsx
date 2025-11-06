import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, ChevronDown, ChevronUp, Star, FileText } from "lucide-react";
import { CartItem } from "./CartItem";
import { toast } from "sonner";
import { DeliveryInfoDialog } from "./DeliveryInfoDialog";
import { exportReceiptToPDF } from "@/utils/receiptPDF";

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

interface CartItemType {
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
  };
}

interface CartProps {
  items: CartItemType[];
  onUpdateQuantityById: (cartItemId: string, quantity: number) => void;
  onRemoveItemById: (cartItemId: string) => void;
  onClearAll: () => void;
  onProcessOrder: (customerDetails: CustomerDetails) => void;
  onUpdateOptionsById: (cartItemId: string, options: any) => void;
  onPrintOrder?: (customerDetails: CustomerDetails) => Promise<boolean>;
  onExportPDF?: (customerDetails: CustomerDetails) => Promise<boolean>;
  onAddDesignService: () => void;
  onAddExpressService: () => void;
  onAddOngkir: (price: number) => void;
  isBluetoothSupported?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

interface DeliveryInfo {
  recipientName: string;
  recipientPhone: string;
  address: string;
}

interface CustomerDetails {
  name: string;
  phone: string;
  instansi: string;
  delivery?: DeliveryInfo;
  downPayment?: number;
}

export function Cart({ items, onUpdateQuantityById, onRemoveItemById, onClearAll, onProcessOrder, onUpdateOptionsById, onPrintOrder, onExportPDF, onAddDesignService, onAddExpressService, onAddOngkir, isBluetoothSupported, isMobile, onClose }: CartProps) {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    instansi: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isDesignServiceSelected, setIsDesignServiceSelected] = useState(false);
  const [isDeliverySelected, setIsDeliverySelected] = useState(false);
  const [isExpressSelected, setIsExpressSelected] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [isLayananExpanded, setIsLayananExpanded] = useState(true);
  const [isPelangganExpanded, setIsPelangganExpanded] = useState(true);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [dpDisplayValue, setDpDisplayValue] = useState<string>('');

  // Sync express service checkbox with cart items
  useEffect(() => {
    const expressServiceInCart = items.some(item => item.product.id === 2001);
    setIsExpressSelected(expressServiceInCart);
  }, [items]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  // Format number with thousand separators
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Calculate totals with price thresholds or dimensional pricing
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

  const subtotal = items.reduce((total, item) => {
    const applicablePrice = getApplicablePrice(item.product, item.quantity, item.options);
    return total + (applicablePrice * item.quantity);
  }, 0);

  const totalDiscounts = items.reduce((total, item) => {
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

  const finalTotal = subtotal;

  // Handle design service checkbox
  const handleDesignServiceChange = (checked: boolean) => {
    setIsDesignServiceSelected(checked);
    if (checked) {
      onAddDesignService();
      toast.success("Jasa Desain ditambahkan ke keranjang", {
        position: 'top-center',
        duration: 2000,
      });
    }
  };

  // Handle delivery checkbox
  const handleDeliveryChange = (checked: boolean) => {
    setIsDeliverySelected(checked);
    if (checked) {
      setShowDeliveryDialog(true);
    } else {
      // Remove delivery info and ongkir if unchecked
      setCustomerDetails(prev => ({ ...prev, delivery: undefined }));
      const ongkirItem = items.find(item => item.product.id === 2002);
      if (ongkirItem) {
        onRemoveItemById(ongkirItem.cartItemId);
      }
    }
  };

  // Handle express service checkbox
  const handleExpressChange = (checked: boolean) => {
    setIsExpressSelected(checked);
    if (checked) {
      onAddExpressService();
      toast.success("Jasa Express ditambahkan ke keranjang", {
        position: 'top-center',
        duration: 2000,
      });
    } else {
      // Remove express service from cart when unchecked
      const expressServiceItem = items.find(item => item.product.id === 2001);
      if (expressServiceItem) {
        onRemoveItemById(expressServiceItem.cartItemId);
        toast.success("Jasa Express dihapus dari keranjang", {
          position: 'top-center',
          duration: 2000,
        });
      }
    }
  };


  // Handle delivery info submission
  const handleDeliveryInfoSubmit = (deliveryInfo: DeliveryInfo, ongkirPrice: number) => {
    setCustomerDetails(prev => ({ ...prev, delivery: deliveryInfo }));
    setShowDeliveryDialog(false);
    
    // Add ongkir to cart if price > 0
    if (ongkirPrice > 0) {
      onAddOngkir(ongkirPrice);
    }
    
    toast.success("Informasi pengiriman berhasil disimpan", {
      position: 'top-center',
      duration: 2000,
    });
  };

  // Smart fill function to copy delivery info to customer details
  const handleSmartFill = () => {
    if (customerDetails.delivery) {
      setCustomerDetails(prev => ({
        ...prev,
        name: customerDetails.delivery.recipientName,
        phone: customerDetails.delivery.recipientPhone
      }));
      
      toast.success("Informasi pelanggan diisi otomatis dari data pengiriman", {
        position: 'top-center',
        duration: 2000,
      });
    } else {
      toast.error("Belum ada informasi pengiriman. Isi terlebih dahulu.", {
        position: 'top-center',
        duration: 2000,
      });
    }
  };

  const handleProcessOrder = async () => {
    if (items.length === 0) {
      toast.error("Keranjang kosong. Tambahkan produk terlebih dahulu.", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return;
    }

    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      toast.error("Mohon lengkapi nama dan nomor telepon pelanggan.", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return;
    }

    // Validate required options for each item
    const idCardWithCaseIds = [1, 2, 6, 7, 8];
    const stikerWithLaminationIds = [15];
    
    for (const item of items) {
      const needsCase = idCardWithCaseIds.includes(item.product.id);
      const needsLamination = stikerWithLaminationIds.includes(item.product.id);
      
      if (needsCase && !item.options?.caseVariant) {
        toast.error(`Pilih jenis casing untuk ${item.product.name}`, {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
        return;
      }
      
      if (needsLamination && !item.options?.laminationVariant) {
        toast.error(`Pilih jenis laminasi untuk ${item.product.name}`, {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Call the parent's onProcessOrder with customer details including DP
      await onProcessOrder({ ...customerDetails, downPayment });
      
      // Reset customer details and DP after successful order
      setCustomerDetails({ name: '', phone: '', instansi: '' });
      setDownPayment(0);
      setDpDisplayValue('');
      setIsExpressSelected(false);
      
      // Close mobile modal if in mobile mode
      if (isMobile && onClose) {
        setTimeout(() => onClose(), 500);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Terjadi kesalahan saat memproses pesanan.', {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // TEMPORARILY DISABLED BUT KEPT FOR FUTURE USE: Bluetooth Print Handler
  // This function may be beneficial in the future for printing receipts via Bluetooth printers.
  // Do NOT delete this function. The UI button is hidden but functionality is preserved.
  const handlePrintReceipt = async () => {
    if (!onPrintOrder) {
      toast.error("Fungsi cetak tidak tersedia", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return;
    }

    if (items.length === 0) {
      toast.error("Keranjang kosong. Tambahkan produk terlebih dahulu.", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return;
    }

    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      toast.error("Mohon lengkapi nama dan nomor telepon pelanggan.", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return;
    }

    // Validate required options for each item (same as process order)
    const idCardWithCaseIds = [1, 2, 6, 7, 8];
    const stikerWithLaminationIds = [15];
    
    for (const item of items) {
      const needsCase = idCardWithCaseIds.includes(item.product.id);
      const needsLamination = stikerWithLaminationIds.includes(item.product.id);
      
      if (needsCase && !item.options?.caseVariant) {
        toast.error(`Pilih jenis casing untuk ${item.product.name}`, {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
        return;
      }
      
      if (needsLamination && !item.options?.laminationVariant) {
        toast.error(`Pilih jenis laminasi untuk ${item.product.name}`, {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
        return;
      }
    }

    setIsPrinting(true);

    try {
      // Call the print order handler which handles everything
      const printSuccess = await onPrintOrder({ ...customerDetails, downPayment });
      
      if (printSuccess) {
        // Reset customer details and DP after successful print
        setCustomerDetails({ name: '', phone: '', instansi: '' });
        setDownPayment(0);
        setDpDisplayValue('');
        setIsExpressSelected(false);
        
        // Close mobile modal if in mobile mode
        if (isMobile && onClose) {
          setTimeout(() => onClose(), 500);
        }
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error('Terjadi kesalahan saat mencetak struk.', {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
    } finally {
      setIsPrinting(false);
    }
  };

  // TEMPORARILY DISABLED BUT KEPT FOR FUTURE USE: PDF Export Handler
  // This function may be beneficial in the future for exporting receipts as PDF files.
  // Do NOT delete this function. The UI button is hidden but functionality is preserved.
  const handleExportPDF = async () => {
    if (!onExportPDF) {
      toast.error("Fungsi export PDF tidak tersedia", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return;
    }

    if (items.length === 0) {
      toast.error("Keranjang kosong. Tambahkan produk terlebih dahulu.", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return;
    }

    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      toast.error("Mohon lengkapi nama dan nomor telepon pelanggan.", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
      return;
    }

    // Validate required options for each item
    const idCardWithCaseIds = [1, 2, 6, 7, 8];
    const stikerWithLaminationIds = [15];
    
    for (const item of items) {
      const needsCase = idCardWithCaseIds.includes(item.product.id);
      const needsLamination = stikerWithLaminationIds.includes(item.product.id);
      
      if (needsCase && !item.options?.caseVariant) {
        toast.error(`Pilih jenis casing untuk ${item.product.name}`, {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
        return;
      }
      
      if (needsLamination && !item.options?.laminationVariant) {
        toast.error(`Pilih jenis laminasi untuk ${item.product.name}`, {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
        return;
      }
    }

    setIsExportingPDF(true);

    try {
      // Call the PDF export handler which handles everything
      const exportSuccess = await onExportPDF({ ...customerDetails, downPayment });
      
      if (exportSuccess) {
        // Reset customer details and DP after successful export
        setCustomerDetails({ name: '', phone: '', instansi: '' });
        setDownPayment(0);
        setDpDisplayValue('');
        setIsExpressSelected(false);
        
        // Close mobile modal if in mobile mode
        if (isMobile && onClose) {
          setTimeout(() => onClose(), 500);
        }
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Terjadi kesalahan saat membuat PDF.', {
        position: 'top-center',
        style: { marginTop: '60px' }
      });
    } finally {
      setIsExportingPDF(false);
    }
  };



  return (
    <>
      <div className={isMobile ? "flex flex-col" : "flex flex-col h-full"}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 shrink-0">
        <h2 className="text-xl font-bold text-gray-800">Keranjang Belanja</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          disabled={items.length === 0}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          Hapus Semua
        </Button>
      </div>

      {/* Cart Items - Scrollable on desktop, natural height on mobile */}
      <div className={isMobile ? "p-3 space-y-3 bg-gray-50" : "flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50"}>
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Belum ada produk dalam keranjang</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.cartItemId}
              item={item}
              onUpdateQuantityById={onUpdateQuantityById}
              onRemoveById={onRemoveItemById}
              onUpdateOptionsById={onUpdateOptionsById}
            />
          ))
        )}
      </div>

      {/* Customer Details & Summary */}
      {items.length > 0 && (
        <div className="border-t bg-background">
          {/* Service Options Section */}
          <div className="border-b bg-gray-50">
            {/* Header with Collapse Button */}
            <div 
              className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsLayananExpanded(!isLayananExpanded)}
            >
              <h3 className="text-xs font-semibold text-gray-700">
                Layanan Tambahan
              </h3>
              <div className="flex items-center">
                {isLayananExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
            
            {/* Collapsible Content */}
            {isLayananExpanded && (
              <div className="px-2 pb-2 transition-all duration-300 ease-in-out">
                <div className="grid grid-cols-3 gap-2">
                  {/* Jasa Desain */}
                  <button
                    onClick={() => handleDesignServiceChange(!isDesignServiceSelected)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                      isDesignServiceSelected
                        ? 'bg-[#FF5E01] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Jasa Desain
                    <br />
                    <span className="text-xs opacity-80">+Rp 25.000</span>
                  </button>
                  
                  {/* Pengiriman */}
                  <button
                    onClick={() => handleDeliveryChange(!isDeliverySelected)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                      isDeliverySelected
                        ? 'bg-[#FF5E01] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pengiriman
                    <br />
                    <span className="text-xs opacity-80">+ Ongkir</span>
                  </button>
                  
                  {/* Jasa Express */}
                  <button
                    onClick={() => handleExpressChange(!isExpressSelected)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                      isExpressSelected
                        ? 'bg-[#FF5E01] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Jasa Express
                    <br />
                    <span className="text-xs opacity-80">+Rp 25.000</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Customer Details Section */}
          <div className="border-b bg-gray-50">
            {/* Header with Collapse Button */}
            <div 
              className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsPelangganExpanded(!isPelangganExpanded)}
            >
              <h3 className="text-xs font-semibold text-gray-700">
                Informasi Pelanggan
              </h3>
              <div className="flex items-center">
                {isPelangganExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
            
            {/* Collapsible Content */}
            {isPelangganExpanded && (
              <div className="px-2 pb-2 space-y-2 transition-all duration-300 ease-in-out">
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={handleSmartFill}
                    className="p-1 rounded-full hover:bg-yellow-100 transition-colors group"
                    title="Isi otomatis dari data pengiriman"
                  >
                    <Star 
                      className={`h-4 w-4 transition-colors ${
                        customerDetails.delivery 
                          ? 'text-yellow-500 group-hover:text-yellow-600' 
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`} 
                    />
                  </button>
                  <Label htmlFor="customer-name" className="text-xs font-medium text-gray-600">
                    Nama Lengkap *
                  </Label>
                </div>
                <Input
                  id="customer-name"
                  type="text"
                  placeholder="Nama lengkap"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-0.5 h-8 text-xs border-[#FF5E01] focus:border-[#FF5E01] focus:ring-[#FF5E01]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer-phone" className="text-xs font-medium text-gray-600">
                  Nomor Telepon *
                </Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  placeholder="Nomor telepon"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-0.5 h-8 text-xs border-[#FF5E01] focus:border-[#FF5E01] focus:ring-[#FF5E01]"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer-instansi" className="text-xs font-medium text-gray-600">
                Instansi/Alias (Opsional)
              </Label>
              <Input
                id="customer-instansi"
                type="text"
                placeholder="Nama sekolah, kampus, atau perusahaan"
                value={customerDetails.instansi}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, instansi: e.target.value }))}
                className="mt-0.5 h-8 text-xs border-[#FF5E01] focus:border-[#FF5E01] focus:ring-[#FF5E01]"
              />
            </div>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="p-2 space-y-2 bg-background">
            <h3 className="text-xs font-semibold text-gray-700 mb-1">
              Ringkasan Pembayaran
            </h3>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              {totalDiscounts > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon:</span>
                  <span className="font-medium">- {formatCurrency(totalDiscounts)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-[#FF5E01] pt-1 border-t">
                <span>TOTAL:</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>

              {/* Down Payment Input */}
              <div className="pt-2 border-t">
                <Label htmlFor="downPayment" className="text-xs font-medium text-gray-700 mb-1 block">
                  DP (Down Payment)
                </Label>
                <Input
                  id="downPayment"
                  type="text"
                  placeholder="5000 = 5.000.000"
                  value={dpDisplayValue}
                  onChange={(e) => {
                    // Allow digits and one decimal point
                    let inputValue = e.target.value.replace(/[^\d.]/g, '');
                    
                    // Prevent multiple decimal points
                    const parts = inputValue.split('.');
                    if (parts.length > 2) {
                      inputValue = parts[0] + '.' + parts.slice(1).join('');
                    }
                    
                    // Parse the numeric value (supports decimals now)
                    const numericValue = inputValue === '' || inputValue === '.' ? 0 : parseFloat(inputValue);
                    
                    // Auto-multiply by 1000
                    const actualValue = numericValue * 1000;
                    
                    // Prevent DP from exceeding total
                    if (actualValue <= finalTotal) {
                      setDownPayment(actualValue);
                      setDpDisplayValue(inputValue);
                    } else {
                      setDownPayment(finalTotal);
                      // Format the display value to show decimal if needed
                      const displayValue = (finalTotal / 1000).toFixed(1).replace(/\.?0+$/, '');
                      setDpDisplayValue(displayValue);
                      toast.warning('DP tidak boleh melebihi total', {
                        position: 'top-center',
                        duration: 2000,
                      });
                    }
                  }}
                  className="h-8 text-xs border-[#FF5E01] focus:border-[#FF5E01] focus:ring-[#FF5E01]"
                />
                {dpDisplayValue && (
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    = {formatCurrency(downPayment)}
                  </p>
                )}
              </div>

              {/* Remaining Balance */}
              {downPayment > 0 && (
                <div className="flex justify-between text-sm font-bold text-blue-600 pt-1">
                  <span>SISA BAYAR:</span>
                  <span>{formatCurrency(finalTotal - downPayment)}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={`flex flex-col gap-2 mt-2 ${isMobile ? 'pb-4' : ''}`}>
              <div className="flex gap-2">
                <Button
                  className="flex-1 h-10 bg-[#FF5E01] hover:bg-[#e54d00] text-white text-sm font-semibold"
                  onClick={handleProcessOrder}
                  disabled={items.length === 0 || isProcessing || isPrinting || isExportingPDF || !customerDetails.name.trim() || !customerDetails.phone.trim()}
                >
                  {isProcessing ? "Memproses..." : "Proses Pesanan"}
                </Button>
                
                {/* HIDDEN: Bluetooth Print Feature
                    DO NOT DELETE - This feature may be used in the future for printing receipts via Bluetooth printers.
                    To re-enable: Change 'false &&' to the original condition below
                    All related functions (handlePrintReceipt) are preserved.
                    
                    To re-enable button, change line below from:
                    {false && isBluetoothSupported && onPrintOrder && (
                    To:
                    {isBluetoothSupported && onPrintOrder && (
                */}
                {false && isBluetoothSupported && onPrintOrder && (
                  <Button
                    className="flex-1 h-10 bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-sm font-semibold flex items-center justify-center gap-2"
                    onClick={handlePrintReceipt}
                    disabled={items.length === 0 || isProcessing || isPrinting || isExportingPDF || !customerDetails.name.trim() || !customerDetails.phone.trim()}
                  >
                    <span className="material-icons text-lg">bluetooth</span>
                    {isPrinting ? "Mencetak..." : "Cetak"}
                  </Button>
                )}
              </div>
              
              {/* HIDDEN: PDF Export Feature
                  DO NOT DELETE - This feature may be used in the future for exporting receipts as PDF files.
                  To re-enable: Remove 'false &&' from the line below
                  All related functions (handleExportPDF) are preserved.
                  
                  To re-enable button, change line below from:
                  {false && onExportPDF && (
                  To:
                  {onExportPDF && (
              */}
              {false && onExportPDF && (
                <Button
                  className="w-full h-10 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={handleExportPDF}
                  disabled={items.length === 0 || isProcessing || isPrinting || isExportingPDF || !customerDetails.name.trim() || !customerDetails.phone.trim()}
                >
                  <FileText className="h-4 w-4" />
                  {isExportingPDF ? "Membuat PDF..." : "PDF"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Delivery Info Dialog */}
    <DeliveryInfoDialog
      open={showDeliveryDialog}
      onOpenChange={setShowDeliveryDialog}
      onSubmit={handleDeliveryInfoSubmit}
      onCancel={() => {
        setIsDeliverySelected(false);
        setShowDeliveryDialog(false);
      }}
    />
    </>
  );
}
