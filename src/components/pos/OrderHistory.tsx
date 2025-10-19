import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, Trash2, Download, X, MessageCircle } from "lucide-react";
import { convertImageToBase64 } from "@/utils/product";
import { generateReceiptHTML } from "@/utils/receiptTemplate";

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
  const [surveyQRBase64, setSurveyQRBase64] = useState<string>("");
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  // Format phone number for WhatsApp (Indonesian format)
  const formatPhoneNumberForWhatsApp = (phone: string): string => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 08, replace with 62
    if (cleaned.startsWith('08')) {
      return '62' + cleaned.substring(1);
    }
    
    // If already starts with 62, leave as is
    if (cleaned.startsWith('62')) {
      return cleaned;
    }
    
    // If starts with 8 (without 0), add 62
    if (cleaned.startsWith('8')) {
      return '62' + cleaned;
    }
    
    // Default: add 62 prefix
    return '62' + cleaned;
  };

  // Generate WhatsApp message for customer
  const generateWhatsAppMessage = (order: ReceiptData): string => {
    const customerName = order.customer?.name || 'Pelanggan';
    const hasShipping = !!order.shipping;
    
    let message = `Halo kak ${customerName}, pesanan kakak dengan nomor invoice ${order.receiptId} sudah selesai di proses.`;
    
    if (hasShipping) {
      // Message for orders with shipping info
      message += ` Untuk pengiriman, akan kami proses segera pada alamat yang diberikan ya kak.

Dimohon untuk melakukan pelunasan terlebih dahulu sebelum paket dikirimkan (abaikan jika sudah lunas). Cek kembali pesanan kakak dan rekam video unboxing, barang yang sudah diterima tidak dapat ditukar/dikembalikan.`;
    } else {
      // Message for pickup orders (no shipping)
      message += ` Pengambilan bisa di toko, lihat alamat google maps kami di sini: tidurlah.com/hello

dan boleh konfirmasi ke admin jika ingin dibantu pengiriman melalui gojek/maxim.

Dimohon untuk konfirmasi kapan ingin mengambil, dan melakukan pelunasan terlebih dahulu sebelum mengambil. Cek kembali pesanan kakak, barang yang sudah diterima tidak dapat ditukar/dikembalikan.`;
    }
    
    message += `

Salam,
ID Card lampung, 
Tidurlah Grafika`;
    
    return encodeURIComponent(message);
  };

  // Handle WhatsApp chat with customer
  const handleChatCustomer = (order: ReceiptData) => {
    if (!order.customer || !order.customer.phone) {
      alert('Nomor telepon pelanggan tidak tersedia');
      return;
    }

    const formattedPhone = formatPhoneNumberForWhatsApp(order.customer.phone);
    const message = generateWhatsAppMessage(order);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    loadOrderHistory();
    loadLogo();
  }, []);

  // Load logo and survey QR as base64 for html2canvas compatibility
  const loadLogo = async () => {
    try {
      const base64Logo = await convertImageToBase64('/product-image/Tidurlah Logo Horizontal.png');
      setLogoBase64(base64Logo);
      
      const base64SurveyQR = await convertImageToBase64('/product-image/survey-qr.png');
      setSurveyQRBase64(base64SurveyQR);
    } catch (error) {
      console.error('Failed to load images:', error);
      // Fallback to original image paths if conversion fails
      setLogoBase64('/product-image/Tidurlah Logo Horizontal.png');
      setSurveyQRBase64('/product-image/survey-qr.png');
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

  // Generate receipt as JPG using shared template
  const generateReceiptJPG = async (order: ReceiptData) => {
    return new Promise((resolve, reject) => {
        // Create a temporary div to render the receipt
        const receiptDiv = document.createElement('div');
      receiptDiv.innerHTML = generateReceiptHTML(
        order,
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
          }, 200);
        });
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
                      {order.customer && order.customer.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChatCustomer(order)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Chat pelanggan via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      )}
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
                dangerouslySetInnerHTML={{
                  __html: generateReceiptHTML(
                    selectedOrder,
                    logoBase64 || '/product-image/Tidurlah Logo Horizontal.png',
                    surveyQRBase64 || '/product-image/survey-qr.png'
                  )
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
