import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Printer, Eye, Trash2 } from "lucide-react";
import { ReceiptGenerator } from "@/lib/receiptGenerator";
import { toast } from "@/hooks/use-toast";

interface ReceiptData {
  receiptId: string;
  timestamp: string;
  cashier: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  summary: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  shipping?: {
    customerName: string;
    customerPhone: string;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
  };
}

interface OrderHistoryProps {
  onBack: () => void;
}

export function OrderHistory({ onBack }: OrderHistoryProps) {
  const [orders, setOrders] = useState<ReceiptData[]>([]);
  const receiptGenerator = new ReceiptGenerator();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = () => {
    try {
      const stored = localStorage.getItem('orderHistory');
      if (stored) {
        const orderHistory = JSON.parse(stored);
        setOrders(orderHistory.sort((a: ReceiptData, b: ReceiptData) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading order history:', error);
    }
  };

  const handleDownloadReceipt = (order: ReceiptData) => {
    try {
      receiptGenerator.downloadReceipt(order);
      toast({
        title: "Struk Diunduh",
        description: `Struk ${order.receiptId} berhasil diunduh`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengunduh struk",
        variant: "destructive",
      });
    }
  };

  const handleViewReceipt = (order: ReceiptData) => {
    localStorage.setItem('lastOrderReceipt', JSON.stringify(order));
    window.open('/receipt.html', '_blank');
  };

  const handleDeleteOrder = (receiptId: string) => {
    try {
      const updatedOrders = orders.filter(order => order.receiptId !== receiptId);
      setOrders(updatedOrders);
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      
      toast({
        title: "Pesanan Dihapus",
        description: `Pesanan ${receiptId} telah dihapus`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus pesanan",
        variant: "destructive",
      });
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('orderHistory');
    setOrders([]);
    toast({
      title: "Riwayat Dihapus",
      description: "Semua riwayat pesanan telah dihapus",
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Kasir
                </Button>
                <div>
                  <CardTitle className="text-2xl">Riwayat Pesanan</CardTitle>
                  <p className="text-muted-foreground">
                    {orders.length} pesanan ditemukan
                  </p>
                </div>
              </div>
              
              {orders.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={handleClearHistory}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Semua
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-semibold mb-2">Belum Ada Pesanan</h3>
                <p className="text-muted-foreground">
                  Riwayat pesanan akan muncul di sini setelah ada transaksi
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.receiptId} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{order.receiptId}</h3>
                            <Badge variant="secondary">{order.cashier}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.timestamp}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewReceipt(order)}
                            className="gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Lihat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReceipt(order)}
                            className="gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteOrder(order.receiptId)}
                            className="gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Shipping Information */}
                      {order.shipping && (
                        <div className="mb-3 p-3 bg-secondary/20 rounded-lg">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Informasi Pengiriman</h4>
                          <div className="space-y-1 text-xs">
                            <div><strong>Nama:</strong> {order.shipping.customerName}</div>
                            <div><strong>Telp:</strong> {order.shipping.customerPhone}</div>
                            <div><strong>Alamat:</strong> {order.shipping.address}</div>
                            <div>{order.shipping.city} {order.shipping.postalCode}</div>
                            {order.shipping.notes && (
                              <div><strong>Catatan:</strong> {order.shipping.notes}</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground ml-2">
                                {item.quantity} x {formatCurrency(item.price)}
                              </span>
                            </div>
                            <span className="currency">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span className="currency">{formatCurrency(order.summary.subtotal)}</span>
                        </div>
                        
                        {order.summary.discount > 0 && (
                          <div className="flex justify-between text-price-discount">
                            <span>Diskon:</span>
                            <span className="currency">- {formatCurrency(order.summary.discount)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pajak:</span>
                          <span className="currency">{formatCurrency(order.summary.tax)}</span>
                        </div>
                        
                        <div className="flex justify-between font-bold text-base pt-1 border-t">
                          <span>Total:</span>
                          <span className="currency">{formatCurrency(order.summary.total)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}