import html2canvas from 'html2canvas';
import { toast } from 'sonner';

// Generate receipt as JPG during order processing
export const generateReceiptDuringProcessing = async (
  showReceipt: boolean,
  logoBase64: string,
  setShowReceipt: React.Dispatch<React.SetStateAction<boolean>>,
  receiptRef: React.RefObject<HTMLDivElement>,
  invoiceNumber: string,
  cartItems: any[],
  promoDiscount: number,
  requestJasaDesain: boolean,
  isExpressPrint: boolean,
  JASA_DESAIN_PRICE: number,
  customerName: string,
  instansi: string,
  calculateTotal: (cartItems: any[], promoCode: string) => number,
  calculateTotalDiscount: (cartItems: any[], promoCode: string) => number,
  promoCode: string,
  setShowOrderSuccess: React.Dispatch<React.SetStateAction<boolean>>,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  caseVariants: any[]
) => {
  // Only proceed if not already showing receipt (prevent multiple calls)
  if (showReceipt) {
    return;
  }

  // Wait for logo to load if not already loaded
  if (!logoBase64) {
    console.log('Waiting for logo to load...');
    await new Promise(resolve => {
      const checkLogo = () => {
        if (logoBase64) {
          resolve(true);
        } else {
          setTimeout(checkLogo, 100);
        }
      };
      checkLogo();
    });
  }

  // Show receipt modal first
  setShowReceipt(true);

  // Play printing sound effect
  try {
    const audio = new Audio('/audio/printing.wav');
    audio.volume = 0.6; // Set volume to 60%
    audio.play().catch(error => {
      console.log('Audio play prevented by browser policy:', error);
    });
  } catch (error) {
    console.log('Audio loading error:', error);
  }

  // Wait for printing animation to complete (4 seconds)
  await new Promise(resolve => setTimeout(resolve, 4500));

  if (receiptRef.current) {
    try {
      // Wait longer for fonts and images to fully load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force a reflow to ensure all text is rendered
      receiptRef.current.offsetHeight;

      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight,
        removeContainer: true,
        foreignObjectRendering: false,
        // Force text rendering
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.receipt-content') as HTMLElement;
          if (clonedElement) {
            // Force font loading
            clonedElement.style.fontFamily = 'Courier New, Consolas, Monaco, Lucida Console, monospace';
            clonedElement.style.fontSize = clonedElement.style.fontSize || '12px';
            clonedElement.style.lineHeight = clonedElement.style.lineHeight || '1.4';
          }
        }
      });

      // Convert to PNG for perfect color fidelity (or JPG for smaller file size)
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `estimasi-biaya-${invoiceNumber}.png`;
      link.href = imgData;
      link.click();

      toast.success("Nota berhasil diunduh! Silakan lanjut ke WhatsApp.", {
        position: 'top-center',
        style: { marginTop: '60px' },
        duration: 3000
      });

      // Close receipt modal and show success dialog
      setTimeout(() => {
        setShowReceipt(false);
        setShowOrderSuccess(true);
        setIsSubmitting(false);
      }, 1000);

    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error("Gagal membuat nota, tapi pesanan tetap berhasil.", {
        position: 'top-center',
        style: { marginTop: '60px' }
      });

      // Close receipt modal and show success dialog even on error
      setTimeout(() => {
        setShowReceipt(false);
        setShowOrderSuccess(true);
        setIsSubmitting(false);
      }, 1000);
    }
  } else {
    // If receiptRef is not available, just show success dialog
    setTimeout(() => {
      setShowReceipt(false);
      setShowOrderSuccess(true);
      setIsSubmitting(false);
    }, 1000);
  }
};


