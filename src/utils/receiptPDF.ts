import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { generateReceiptHTML } from './receiptTemplate';

/**
 * Export receipt to PDF with enhanced readability
 * Uses Version 2 receipt template with bigger fonts
 */
export const exportReceiptToPDF = async (receiptData: any, logoBase64?: string, surveyQRBase64?: string, bottomLogoBase64?: string) => {
  let fontLink: HTMLLinkElement | null = null;

  try {
    // Create a temporary container for rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '350px';
    tempContainer.style.background = 'white';
    tempContainer.style.padding = '10px';

    // Add Google Fonts link for Roboto
    fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Generate receipt HTML with shared universal template
    tempContainer.innerHTML = generateReceiptHTML(receiptData, logoBase64, surveyQRBase64, bottomLogoBase64);

    document.body.appendChild(tempContainer);

    // Wait for images to load
    const images = tempContainer.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(true);
        } else {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        }
      });
    });

    await Promise.all(imagePromises);

    // Wait for Roboto font to load and layout to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate canvas from HTML
    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 3, // High quality
      width: 350,
      height: tempContainer.scrollHeight,
      useCORS: true,
      allowTaint: true,
      logging: false,
      removeContainer: true,
      imageTimeout: 15000,
      foreignObjectRendering: false,
    });

    // Clean up temp container and font link
    document.body.removeChild(tempContainer);
    if (fontLink && fontLink.parentNode) {
      fontLink.parentNode.removeChild(fontLink);
    }

    // Calculate proper PDF dimensions based on content
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF with custom height to fit content (no cropping)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [imgWidth, imgHeight + 20] // Add padding
    });

    const imgData = canvas.toDataURL('image/png');

    // Add image to PDF with padding
    pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);

    // Save the PDF
    const fileName = `receipt-${receiptData.receiptId || 'unknown'}.pdf`;
    pdf.save(fileName);

    toast.success('Receipt PDF berhasil diunduh!');

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Gagal membuat PDF. Silakan coba lagi.');
    return false;
  }
};
