import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateReceiptHTML } from '@/utils/receiptTemplate';

const Receipt = () => {
  const navigate = useNavigate();
  const [receiptData, setReceiptData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isGeneratingJPG, setIsGeneratingJPG] = React.useState(false);

  React.useEffect(() => {
    const loadReceiptData = () => {
      try {
        const orderData = localStorage.getItem('lastOrderReceipt');

        if (!orderData) {
          setReceiptData(null);
          setLoading(false);
          return;
        }

        const data = JSON.parse(orderData);
        setReceiptData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading receipt data:', error);
        setReceiptData(null);
        setLoading(false);
      }
    };

    loadReceiptData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  const generateReceiptJPG = async (receiptData: any) => {
    return new Promise((resolve, reject) => {
      // Create a temporary div to render the receipt
      const receiptDiv = document.createElement('div');
      receiptDiv.innerHTML = generateReceiptHTML(
        receiptData,
        '/product-image/Tidurlah Logo Horizontal.png',
        '/product-image/survey-qr.png'
      );
      receiptDiv.style.position = 'absolute';
      receiptDiv.style.left = '-9999px';
      receiptDiv.style.top = '-9999px';
      receiptDiv.style.width = '350px';
      receiptDiv.style.background = 'white';
      receiptDiv.style.fontFamily = 'Roboto, Arial, Helvetica, sans-serif';
      receiptDiv.style.fontSize = '15px';
      receiptDiv.style.padding = '10px 8px';

      document.body.appendChild(receiptDiv);

      // Use html2canvas to convert to image
      import('html2canvas').then((html2canvas) => {
        html2canvas.default(receiptDiv, {
          backgroundColor: '#ffffff',
          scale: 2,
          width: 350,
          height: receiptDiv.scrollHeight,
        }).then((canvas) => {
          // Convert to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `receipt-${receiptData.receiptId}.jpg`;
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
    });
  };

  const handlePrint = async () => {
    if (!receiptData) return;

    setIsGeneratingJPG(true);
    try {
      await generateReceiptJPG(receiptData);
    } catch (error) {
      console.error('Error generating JPG:', error);
      alert('Gagal membuat JPG. Silakan coba lagi.');
    } finally {
      setIsGeneratingJPG(false);
    }
  };

  const handleBackToCashier = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat struk...</p>
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Tidak ada data pesanan</h2>
          <p className="text-gray-500 mb-6">Tidak ada data pesanan untuk ditampilkan</p>
          <p className="text-sm text-gray-400">
            Silakan lakukan pemesanan terlebih dahulu melalui kasir.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Kembali ke Kasir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">

        <div className="bg-background p-6 rounded-lg shadow-lg border-2 border-dashed border-gray-300">
          {/* Receipt Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">TIDURLAH GRAFIKA</h1>
            <p className="text-sm text-gray-600">Jl. Perum Pemda Wayhui, Way Hui</p>
            <p className="text-sm text-gray-600">Kec. Jati Agung, Lampung Selatan 35365</p>
            <p className="text-sm text-gray-600">Telp: 0851-7215-7808</p>
          </div>

          <hr className="border-dashed border-gray-400 my-4" />

          {/* Customer Details */}
          {receiptData.customer && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2">Informasi Pelanggan</h3>
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Nama:</span>
                  <span>{receiptData.customer.name}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Telepon:</span>
                  <span>{receiptData.customer.phone}</span>
                </div>
                {receiptData.customer.instansi && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instansi:</span>
                    <span>{receiptData.customer.instansi}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <hr className="border-dashed border-gray-400 my-4" />

          {/* Receipt Meta */}
          <div className="mb-4 text-sm">
            <div className="flex justify-between mb-1">
              <strong>No. Struk:</strong>
              <span>{receiptData.receiptId}</span>
            </div>
            <div className="flex justify-between mb-1">
              <strong>Tanggal:</strong>
              <span>{receiptData.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <strong>Kasir:</strong>
              <span>{receiptData.cashier}</span>
            </div>
          </div>

          <hr className="border-dashed border-gray-400 my-4" />

          {/* Items List */}
          <div className="mb-4">
            {receiptData.items.map((item: any, index: number) => (
              <div key={index} className="mb-3">
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{item.quantity} x {formatCurrency(item.price)}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-dashed border-gray-400 my-4" />

          {/* Summary */}
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span>Subtotal:</span>
              <span>{formatCurrency(receiptData.summary.subtotal)}</span>
            </div>

            {receiptData.summary.discount > 0 && (
              <div className="flex justify-between mb-1 text-red-600">
                <span>Diskon:</span>
                <span>- {formatCurrency(receiptData.summary.discount)}</span>
              </div>
            )}

            {receiptData.summary.tax > 0 && (
              <div className="flex justify-between mb-1">
                <span>Pajak (10%):</span>
                <span>{formatCurrency(receiptData.summary.tax)}</span>
              </div>
            )}

            <hr className="my-2" />

            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span>{formatCurrency(receiptData.summary.total)}</span>
            </div>
          </div>

          <hr className="border-dashed border-gray-400 my-4" />

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            <div className="font-semibold mb-2">Terima kasih telah berbelanja!</div>
            <div>Instagram: @tidurlah_grafika | @idcard_lampung</div>
            <div>WhatsApp: 0851-7215-7808</div>
            <div className="mt-3 text-xs">
              Spesialis ID Card & Lanyard Lampung<br />
              Barang yang sudah dibeli tidak dapat dikembalikan
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePrint}
            disabled={isGeneratingJPG}
            className="flex-1 bg-[#FF5E01] text-white px-4 py-2 rounded-lg hover:bg-[#e54d00] transition-colors flex items-center justify-center gap-2"
          >
            {isGeneratingJPG ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Membuat...
              </>
            ) : (
              <>
                Unduh JPG
              </>
            )}
          </button>
          <button
            onClick={handleBackToCashier}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            ← Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
