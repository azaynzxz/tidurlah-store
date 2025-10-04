import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, Trash2, Download, X } from "lucide-react";
import { convertImageToBase64 } from "@/utils/product";

interface ReceiptData {
  receiptId: string;
  timestamp: string;
  cashier: string;
  customer?: {
    name: string;
    phone: string;
    instansi: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    modelCode?: string;
    caseVariant?: string;
    laminationVariant?: string;
    width?: number;
    height?: number;
    dimensionText?: string;
    area?: string;
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
  };
}

interface OrderHistoryProps {
  onBack: () => void;
  cashierName?: string;
}

export function OrderHistory({ onBack, cashierName }: OrderHistoryProps) {
  const [orders, setOrders] = useState<ReceiptData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  useEffect(() => {
    loadOrderHistory();
    loadLogo();
  }, []);

  // Load logo as base64 for html2canvas compatibility
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

  const loadOrderHistory = () => {
    try {
      const stored = localStorage.getItem('orderHistory');
      if (stored) {
        const orderHistory = JSON.parse(stored);
        setOrders(orderHistory.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Error loading order history:', error);
    }
  };

  const handleViewReceipt = (order: ReceiptData) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  // Generate receipt as JPG
  const generateReceiptJPG = async (order: ReceiptData) => {
    return new Promise((resolve, reject) => {
      if (receiptRef.current) {
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
                link.download = `receipt-${order.receiptId}.jpg`;
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

  const handleDownloadReceipt = async () => {
    if (!selectedOrder) return;
    
    setIsGeneratingReceipt(true);
    try {
      await generateReceiptJPG(selectedOrder);
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const handleDeleteOrder = (receiptId: string) => {
    try {
      const stored = localStorage.getItem('orderHistory');
      if (stored) {
        const orderHistory = JSON.parse(stored);
        const updatedHistory = orderHistory.filter((order: ReceiptData) => order.receiptId !== receiptId);
        localStorage.setItem('orderHistory', JSON.stringify(updatedHistory));
        loadOrderHistory(); // Reload the list
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleClearAll = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat pesanan?')) {
      localStorage.removeItem('orderHistory');
      setOrders([]);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <h2 className="text-xl font-semibold">Riwayat Pesanan</h2>
          </div>

          {orders.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
            >
              Hapus Semua
            </Button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">Belum ada riwayat pesanan</p>
            <p className="text-sm">Riwayat pesanan akan muncul di sini setelah Anda memproses pesanan.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={onBack}
            >
              Kembali ke Kasir
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <Card key={order.receiptId} className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Pesanan #{orders.length - index}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewReceipt(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Lihat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteOrder(order.receiptId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">No. Struk:</span>
                      <span className="font-mono">{order.receiptId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span>{order.timestamp}</span>
                    </div>
                    {order.customer && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pelanggan:</span>
                          <span>{order.customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Telepon:</span>
                          <span>{order.customer.phone}</span>
                        </div>
                        {order.customer.instansi && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Instansi:</span>
                            <span>{order.customer.instansi}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Item:</span>
                      <span>{order.items.length} produk</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-green-600">{formatCurrency(order.summary.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal with Consistent CSS Layout */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Struk Pesanan</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleDownloadReceipt}
                  disabled={isGeneratingReceipt}
                  className="bg-[#FF5E01] hover:bg-[#e54d00] text-white"
                >
                  {isGeneratingReceipt ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1" />
                      Unduh JPG
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowReceiptModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Receipt Content with Consistent CSS */}
            <div className="receipt-slide-container" style={{ height: 'auto', overflow: 'visible' }}>
              <div
                ref={receiptRef}
                className="receipt-paper"
                style={{ animation: 'none', transform: 'none' }}
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
                      <span className="font-bold">{selectedOrder.receiptId}</span>
                    </div>
                    <div className="receipt-meta-row">
                      <span>Tanggal:</span>
                      <span>{selectedOrder.timestamp}</span>
                    </div>
                    <div className="receipt-meta-row">
                      <span>Kasir:</span>
                      <span>{selectedOrder.cashier}</span>
                    </div>
                    {selectedOrder.customer && (
                      <>
                        <div className="receipt-separator"></div>
                        <div className="receipt-meta-row">
                          <span>Pelanggan:</span>
                          <span>{selectedOrder.customer.name}</span>
                        </div>
                        <div className="receipt-meta-row">
                          <span>Telepon:</span>
                          <span>{selectedOrder.customer.phone}</span>
                        </div>
                        {selectedOrder.customer.instansi && (
                          <div className="receipt-meta-row">
                            <span>Instansi:</span>
                            <span>{selectedOrder.customer.instansi}</span>
                          </div>
                        )}
                      </>
                    )}
                    {selectedOrder.shipping && (
                      <>
                        <div className="receipt-separator"></div>
                        <div className="receipt-shipping-title">INFORMASI PENGIRIMAN</div>
                        <div className="receipt-meta-row">
                          <span>Nama:</span>
                          <span>{selectedOrder.shipping.customerName}</span>
                        </div>
                        <div className="receipt-meta-row">
                          <span>Telp:</span>
                          <span>{selectedOrder.shipping.customerPhone}</span>
                        </div>
                        <div className="receipt-meta-row">
                          <span>Alamat:</span>
                          <span>{selectedOrder.shipping.address}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Items */}
                  <div className="receipt-items">
                    <div className="receipt-items-title">DETAIL PEMBELIAN</div>
                    <div className="receipt-items-list">
                      {selectedOrder.items.map((item, index) => (
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
                      <span>Rp {selectedOrder.summary.subtotal.toLocaleString('id-ID')}</span>
                    </div>

                    {selectedOrder.summary.discount > 0 && (
                      <div className="receipt-summary-row receipt-discount">
                        <span>Diskon:</span>
                        <span>-Rp {selectedOrder.summary.discount.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    <div className="receipt-summary-row receipt-total">
                      <span>TOTAL:</span>
                      <span>Rp {selectedOrder.summary.total.toLocaleString('id-ID')}</span>
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
          </div>
        </div>
      )}
    </div>
  );
}
