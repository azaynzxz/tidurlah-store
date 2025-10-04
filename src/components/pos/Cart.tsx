import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { CartItem } from "./CartItem";
import { toast } from "sonner";
import { calculateBannerPrice } from "@/utils/product";
import { DeliveryInfoDialog } from "./DeliveryInfoDialog";

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
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearAll: () => void;
  onProcessOrder: (customerDetails: CustomerDetails) => void;
  onUpdateOptions: (productId: number, options: any) => void;
  onPrintOrder?: (customerDetails: CustomerDetails) => Promise<boolean>;
  onAddDesignService: () => void;
  isBluetoothSupported?: boolean;
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
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onClearAll, onProcessOrder, onUpdateOptions, onPrintOrder, onAddDesignService, isBluetoothSupported }: CartProps) {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    instansi: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDesignServiceSelected, setIsDesignServiceSelected] = useState(false);
  const [isDeliverySelected, setIsDeliverySelected] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  // Calculate totals with price thresholds or dimensional pricing
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

  const subtotal = items.reduce((total, item) => {
    const applicablePrice = getApplicablePrice(item.product, item.quantity, item.options);
    return total + (applicablePrice * item.quantity);
  }, 0);

  const totalDiscounts = items.reduce((total, item) => {
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
      // Remove delivery info if unchecked
      setCustomerDetails(prev => ({ ...prev, delivery: undefined }));
    }
  };

  // Handle delivery info submission
  const handleDeliveryInfoSubmit = (deliveryInfo: DeliveryInfo) => {
    setCustomerDetails(prev => ({ ...prev, delivery: deliveryInfo }));
    setShowDeliveryDialog(false);
    toast.success("Informasi pengiriman berhasil disimpan", {
      position: 'top-center',
      duration: 2000,
    });
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
      // Call the parent's onProcessOrder with customer details
      await onProcessOrder(customerDetails);
      
      // Reset customer details after successful order
      setCustomerDetails({ name: '', phone: '', instansi: '' });
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
      const printSuccess = await onPrintOrder(customerDetails);
      
      if (printSuccess) {
        // Reset customer details after successful print
        setCustomerDetails({ name: '', phone: '', instansi: '' });
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



  return (
    <>
      <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
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

      {/* Cart Items - Larger scrollable area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Belum ada produk dalam keranjang</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
              onUpdateOptions={onUpdateOptions}
            />
          ))
        )}
      </div>

      {/* Customer Details & Summary - Fixed at bottom */}
      {items.length > 0 && (
        <div className="border-t bg-white">
          {/* Service Options Section */}
          <div className="p-2 space-y-2 border-b bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">
              Layanan Tambahan
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckboxPrimitive.Root
                  id="design-service"
                  checked={isDesignServiceSelected}
                  onCheckedChange={handleDesignServiceChange}
                  className="peer h-4 w-4 shrink-0 rounded-sm border border-[#FF5E01] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#FF5E01] data-[state=checked]:text-white"
                >
                  <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                    <Check className="h-4 w-4" />
                  </CheckboxPrimitive.Indicator>
                </CheckboxPrimitive.Root>
                <Label htmlFor="design-service" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Jasa Desain (+Rp 25.000)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckboxPrimitive.Root
                  id="delivery-service"
                  checked={isDeliverySelected}
                  onCheckedChange={handleDeliveryChange}
                  className="peer h-4 w-4 shrink-0 rounded-sm border border-[#FF5E01] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#FF5E01] data-[state=checked]:text-white"
                >
                  <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                    <Check className="h-4 w-4" />
                  </CheckboxPrimitive.Indicator>
                </CheckboxPrimitive.Root>
                <Label htmlFor="delivery-service" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Pengiriman
                </Label>
              </div>
            </div>
          </div>

          {/* Customer Details Section */}
          <div className="p-2 space-y-2 border-b bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">
              Informasi Pelanggan
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="customer-name" className="text-xs font-medium text-gray-600">
                  Nama Lengkap *
                </Label>
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

          {/* Price Summary */}
          <div className="p-2 space-y-2 bg-white">
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              <Button
                className="flex-1 h-10 bg-[#FF5E01] hover:bg-[#e54d00] text-white text-sm font-semibold"
                onClick={handleProcessOrder}
                disabled={items.length === 0 || isProcessing || isPrinting || !customerDetails.name.trim() || !customerDetails.phone.trim()}
              >
                {isProcessing ? "Memproses..." : "Proses Pesanan"}
              </Button>
              
              {isBluetoothSupported && onPrintOrder && (
                <Button
                  className="flex-1 h-10 bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={handlePrintReceipt}
                  disabled={items.length === 0 || isProcessing || isPrinting || !customerDetails.name.trim() || !customerDetails.phone.trim()}
                >
                  <span className="material-icons text-lg">bluetooth</span>
                  {isPrinting ? "Mencetak..." : "Cetak"}
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
