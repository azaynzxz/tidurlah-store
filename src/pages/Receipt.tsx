import React from 'react';
import { useNavigate } from 'react-router-dom';

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
      receiptDiv.innerHTML = generateReceiptHTML(receiptData);
      receiptDiv.style.position = 'absolute';
      receiptDiv.style.left = '-9999px';
      receiptDiv.style.top = '-9999px';
      receiptDiv.style.width = '350px';
      receiptDiv.style.background = 'white';
      receiptDiv.style.fontFamily = 'Courier New, monospace';
      receiptDiv.style.fontSize = '12px';
      receiptDiv.style.padding = '20px';

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

  const generateReceiptHTML = (data: any) => {
    return `
      <div style="font-family: 'Courier New', 'Consolas', 'Monaco', 'Lucida Console', monospace; font-size: 12px; line-height: 1.4; max-width: 350px; background: white; color: #000000;">
        <!-- Store Header -->
        <div style="text-align: center; border-bottom: 1px dashed #374151; padding-bottom: 12px; margin-bottom: 12px;">
          <div style="margin-bottom: 8px;">
            <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">TIDURLAH GRAFIKA</h2>
            <p style="font-size: 10px; color: #6b7280; margin-bottom: 2px; font-style: italic;">"Cetak apa aja, Tidurlah Grafika!"</p>
            <p style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Perum. Korpri Raya, Blok D3. No. 3</p>
            <p style="font-size: 10px; color: #6b7280;">Sukarame, Bandar Lampung</p>
          </div>
          <div style="border-bottom: 1px dashed #374151; margin: 8px 0;"></div>
          <p style="font-size: 10px; color: #6b7280;">WhatsApp: 085172157808</p>
          <p style="font-size: 10px; color: #6b7280;">Instagram: @tidurlah_grafika</p>
        </div>

        <!-- Customer Details -->
        ${data.customer ? `
          <div style="border-bottom: 1px dashed #374151; padding-bottom: 12px; margin-bottom: 12px;">
            <div style="display: table; width: 100%; margin-bottom: 4px;">
              <div style="display: table-row;">
                <span style="display: table-cell; padding-right: 8px;">Pelanggan:</span>
                <span style="display: table-cell; font-weight: bold;">${data.customer.name}</span>
              </div>
            </div>
            <div style="display: table; width: 100%; margin-bottom: 4px;">
              <div style="display: table-row;">
                <span style="display: table-cell; padding-right: 8px;">Telepon:</span>
                <span style="display: table-cell;">${data.customer.phone}</span>
              </div>
            </div>
            ${data.customer.instansi ? `
              <div style="display: table; width: 100%;">
                <div style="display: table-row;">
                  <span style="display: table-cell; padding-right: 8px;">Instansi:</span>
                  <span style="display: table-cell;">${data.customer.instansi}</span>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Transaction Details -->
        <div style="border-bottom: 1px dashed #374151; padding-bottom: 12px; margin-bottom: 12px;">
          <div style="display: table; width: 100%; margin-bottom: 4px;">
            <div style="display: table-row;">
              <span style="display: table-cell; padding-right: 8px;">No. Transaksi:</span>
              <span style="display: table-cell; font-weight: bold;">${data.receiptId}</span>
            </div>
          </div>
          <div style="display: table; width: 100%; margin-bottom: 4px;">
            <div style="display: table-row;">
              <span style="display: table-cell; padding-right: 8px;">Tanggal:</span>
              <span style="display: table-cell;">${data.timestamp}</span>
            </div>
          </div>
          <div style="display: table; width: 100%;">
            <div style="display: table-row;">
              <span style="display: table-cell; padding-right: 8px;">Kasir:</span>
              <span style="display: table-cell;">${data.cashier}</span>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div style="border-bottom: 1px dashed #374151; padding-bottom: 12px; margin-bottom: 12px;">
          <div style="text-align: center; font-weight: bold; margin-bottom: 8px;">DETAIL PEMBELIAN</div>
          <div>
            ${data.items.map((item: any) => `
              <div style="margin-bottom: 8px;">
                <div style="font-weight: bold; margin-bottom: 2px; break-inside: avoid;">${item.name}</div>
                ${item.width && item.height ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Ukuran: ${item.width}m x ${item.height}m</div>` : ''}
                ${item.modelCode ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Model: ${item.modelCode}</div>` : ''}
                ${item.caseVariant ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Casing: ${item.caseVariant}</div>` : ''}
                ${item.laminationVariant ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Laminasi: ${item.laminationVariant}</div>` : ''}
                <div style="display: table; width: 100%;">
                  <div style="display: table-row;">
                    <span style="display: table-cell; padding-right: 8px; font-size: 10px;">
                      ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}
                    </span>
                    <span style="display: table-cell; text-align: right; font-size: 10px; white-space: nowrap;">
                      Rp ${item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Totals -->
        <div style="border-bottom: 1px dashed #374151; padding-bottom: 12px; margin-bottom: 12px;">
          <div style="display: table; width: 100%; margin-bottom: 4px;">
            <div style="display: table-row;">
              <span style="display: table-cell; padding-right: 8px;">Subtotal:</span>
              <span style="display: table-cell; text-align: right; white-space: nowrap;">
                Rp ${data.summary.subtotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          ${data.summary.discount > 0 ? `
            <div style="display: table; width: 100%; margin-bottom: 4px; color: #16a34a;">
              <div style="display: table-row;">
                <span style="display: table-cell; padding-right: 8px;">Diskon:</span>
                <span style="display: table-cell; text-align: right; white-space: nowrap;">
                  - Rp ${data.summary.discount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ` : ''}

          <div style="border-top: 1px dashed #374151; margin-top: 8px; padding-top: 8px;">
            <div style="display: table; width: 100%; font-weight: bold; font-size: 14px;">
              <div style="display: table-row;">
                <span style="display: table-cell; padding-right: 8px;">TOTAL:</span>
                <span style="display: table-cell; text-align: right; white-space: nowrap;">
                  Rp ${data.summary.total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 12px; border-top: 1px dashed #374151;">
          <p style="font-weight: bold; margin-bottom: 4px;">Terima kasih telah berbelanja!</p>
          <p style="font-size: 10px; color: #6b7280;">Barang yang sudah dibeli tidak dapat dikembalikan</p>

          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #374151;">
            <p style="font-size: 9px; color: #9ca3af; font-style: italic;">
              Struk ini dibuat untuk kemudahan estimasi biaya.<br/>
              Tidak dapat digunakan sebagai bukti pembayaran.
            </p>
          </div>

          <p style="margin-top: 8px; font-size: 9px; color: #6b7280;">
            Struk ini dibuat secara otomatis pada ${new Date().toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    `;
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

        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-dashed border-gray-300">
          {/* Receipt Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">TIDURLAH GRAFIKA</h1>
            <p className="text-sm text-gray-600">Perum. Korpri Raya, Blok D3. No. 3</p>
            <p className="text-sm text-gray-600">Sukarame, Bandar Lampung</p>
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
            <div>Instagram: @tidurlah_grafika</div>
            <div>WhatsApp: 0851-7215-7808</div>
            <div className="mt-3 text-xs">
              Spesialis ID Card & Lanyard Lampung<br/>
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
