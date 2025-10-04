import { Button } from "@/components/ui/button";
import { CartItem } from "./CartItem";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ReceiptGenerator } from "@/lib/receiptGenerator";
import { useState } from "react";

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

interface CartItemType {
  product: Product;
  quantity: number;
}

interface CartProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearAll: () => void;
  onProcessOrder: () => void;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onClearAll, onProcessOrder }: CartProps) {
  const [shippingInfo, setShippingInfo] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  // Calculate totals
  const subtotal = items.reduce((total, item) => {
    const price = item.product.discount_price || item.product.price;
    return total + (price * item.quantity);
  }, 0);

  const totalDiscounts = items.reduce((total, item) => {
    if (item.product.discount_price) {
      const discount = (item.product.price - item.product.discount_price) * item.quantity;
      return total + discount;
    }
    return total;
  }, 0);

  const tax = Math.round(subtotal * 0.1); // 10% tax
  const finalTotal = subtotal + tax;

  const receiptGenerator = new ReceiptGenerator();


  const handleProcessOrder = () => {
    if (items.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Tambahkan produk terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    // Generate receipt data
    const receiptData = {
      receiptId: `TRX-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`,
      timestamp: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      cashier: "Admin",
      items: items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.discount_price || item.product.price,
        subtotal: (item.product.discount_price || item.product.price) * item.quantity
      })),
      summary: {
        subtotal,
        discount: totalDiscounts,
        tax,
        total: finalTotal
      },
      shipping: shippingInfo.customerName ? shippingInfo : undefined
    };

    // Save to localStorage for receipt viewing
    localStorage.setItem('lastOrderReceipt', JSON.stringify(receiptData));
    
    // Save to order history
    try {
      const existingHistory = localStorage.getItem('orderHistory');
      const orderHistory = existingHistory ? JSON.parse(existingHistory) : [];
      orderHistory.push(receiptData);
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    } catch (error) {
      console.error('Error saving to order history:', error);
    }

    // Auto-download receipt as JPG
    try {
      receiptGenerator.downloadReceipt(receiptData);
      
      toast({
        title: "Pesanan Berhasil Diproses!",
        description: `Total: ${formatCurrency(finalTotal)} • Struk otomatis diunduh`,
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast({
        title: "Pesanan Berhasil!",
        description: `Total: ${formatCurrency(finalTotal)} • Error mengunduh struk`,
        variant: "destructive",
      });
    }
    
    onProcessOrder();
  };

  return (
    <div className="flex flex-col h-full bg-cart-background rounded-lg border border-cart-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cart-border">
        <h2 className="text-lg font-semibold text-foreground">Pesanan Saat Ini</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          disabled={items.length === 0}
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
        >
          Hapus Semua
        </Button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Belum ada produk dalam keranjang</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
            />
          ))
        )}
      </div>

      {/* Shipping Information */}
      {items.length > 0 && (
        <div className="p-4 border-t border-cart-border bg-secondary/20">
          <h3 className="text-sm font-semibold text-foreground mb-3">Informasi Pengiriman</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="customerName" className="text-xs">Nama Pelanggan</Label>
                <Input
                  id="customerName"
                  value={shippingInfo.customerName}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Nama lengkap"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone" className="text-xs">No. Telepon</Label>
                <Input
                  id="customerPhone"
                  value={shippingInfo.customerPhone}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="text-xs">Alamat Lengkap</Label>
              <Textarea
                id="address"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Jl. Nama Jalan, No. Rumah, RT/RW"
                className="h-16 text-xs resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="city" className="text-xs">Kota</Label>
                <Input
                  id="city"
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Bandar Lampung"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="postalCode" className="text-xs">Kode Pos</Label>
                <Input
                  id="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="35131"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes" className="text-xs">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                value={shippingInfo.notes}
                onChange={(e) => setShippingInfo(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan khusus untuk pengiriman"
                className="h-12 text-xs resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="p-4 border-t border-cart-border bg-total-background">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="currency">{formatCurrency(subtotal)}</span>
            </div>
            
            {totalDiscounts > 0 && (
              <div className="flex justify-between text-price-discount">
                <span>Diskon:</span>
                <span className="currency">- {formatCurrency(totalDiscounts)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pajak Penjualan (10%):</span>
              <span className="currency">{formatCurrency(tax)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="currency">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded text-center">
              Cashless Credit: Rp 50.000
            </div>
            
            <Button
              className="w-full bg-success hover:bg-success-hover text-success-foreground font-semibold"
              size="lg"
              onClick={handleProcessOrder}
              disabled={items.length === 0}
            >
              Proses Pesanan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}