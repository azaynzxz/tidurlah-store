import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateReceiptHTML } from '@/utils/receiptTemplate';
import { convertImageToBase64 } from '@/utils/product';

const Receipt = () => {
  const navigate = useNavigate();
  const [receiptData, setReceiptData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isGeneratingJPG, setIsGeneratingJPG] = React.useState(false);
  const [logoTidurlah, setLogoTidurlah] = React.useState<string>("");
  const [logoUnila, setLogoUnila] = React.useState<string>("");
  const [logoBelwis, setLogoBelwis] = React.useState<string>("");
  const [surveyQRBase64, setSurveyQRBase64] = React.useState<string>("");

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

  React.useEffect(() => {
    const loadImages = async () => {
      try {
        const logoT = await convertImageToBase64('/product-image/Tidurlah Logo Horizontal.png');
        setLogoTidurlah(logoT);
        
        const logoU = await convertImageToBase64('/logo_nono.jpeg');
        setLogoUnila(logoU);

        const logoB = await convertImageToBase64('/logo-idcard-lampung.jpg');
        setLogoBelwis(logoB);

        const qr = await convertImageToBase64('/product-image/survey-qr.png');
        setSurveyQRBase64(qr);
      } catch (error) {
        console.error('Failed to load images in Receipt page:', error);
        setLogoTidurlah('/product-image/Tidurlah Logo Horizontal.png');
        setLogoUnila('/logo_nono.jpeg');
        setLogoBelwis('/logo-idcard-lampung.jpg');
        setSurveyQRBase64('/product-image/survey-qr.png');
      }
    };
    loadImages();
  }, []);

  // Sync body class for branch specific styling
  React.useEffect(() => {
    if (receiptData?.cabang === 'Cabang Unila') {
      document.body.classList.add('branch-unila');
      document.body.classList.remove('branch-belwis');
    } else if (receiptData?.cabang) {
      document.body.classList.add('branch-belwis');
      document.body.classList.remove('branch-unila');
    }
    return () => {
      document.body.classList.remove('branch-unila', 'branch-belwis');
    };
  }, [receiptData]);

  const generateReceiptJPG = async (receiptData: any) => {
    return new Promise((resolve, reject) => {
      // Create a temporary div to render the receipt
      const receiptDiv = document.createElement('div');
      const topLogo = receiptData.cabang === 'Cabang Unila' ? logoUnila : logoBelwis;
      receiptDiv.innerHTML = generateReceiptHTML(
        receiptData,
        topLogo,
        surveyQRBase64 || '/product-image/survey-qr.png',
        logoTidurlah
      );
      receiptDiv.style.position = 'absolute';
      receiptDiv.style.left = '-9999px';
      receiptDiv.style.top = '-9999px';
      receiptDiv.style.width = '350px';
      receiptDiv.style.background = 'white';
      receiptDiv.style.fontFamily = 'Roboto, Arial, Helvetica, sans-serif';
      receiptDiv.style.fontSize = '15px';
      receiptDiv.style.padding = '0';
      receiptDiv.style.margin = '0';
      receiptDiv.style.boxSizing = 'border-box';

      document.body.appendChild(receiptDiv);

      // Wait for all images to load
      const images = receiptDiv.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        });
      });

      Promise.all(imagePromises).then(() => {
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
        }, 200);
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
        {/* Dynamic receipt display using the unified template */}
        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-dashed border-gray-300 mx-auto overflow-hidden" style={{ width: '100%', maxWidth: '370px' }}>
          <div
            dangerouslySetInnerHTML={{
              __html: receiptData ? generateReceiptHTML(
                receiptData,
                receiptData.cabang === 'Cabang Unila' ? logoUnila : logoBelwis,
                surveyQRBase64,
                logoTidurlah
              ) : ''
            }}
          />
        </div>

        <div className="flex gap-3 mt-4 max-w-[370px] mx-auto">
          <button
            onClick={handlePrint}
            disabled={isGeneratingJPG}
            className="flex-1 bg-[#FF5E01] text-white px-4 py-2 rounded-lg hover:bg-[#e54d00] transition-colors flex items-center justify-center gap-2 font-medium"
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
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            ← Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;

