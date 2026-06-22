import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { generateReceiptHTML, type ReceiptData } from './receiptTemplate';

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

    toast.success('Receipt PDF berhasil diunduh!', {
      position: 'top-center',
      duration: 3000,
    });

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Gagal membuat PDF. Silakan coba lagi.', {
      position: 'top-center',
      duration: 3000,
    });
    return false;
  }
};

/**
 * Generate receipt HTML with original template (for debugging/comparison)
 */
export function generateReceiptHTMLV1(data: any, logoBase64?: string): string {
  return `
    <div style="font-family: 'Courier New', 'Consolas', 'Monaco', 'Lucida Console', monospace; font-size: 13px; line-height: 1.3; max-width: 350px; background: white; color: #000000; padding: 8px 6px; box-sizing: border-box;">
      <!-- Store Header -->
      <div style="text-align: center; border-bottom: 1px dashed #374151; padding-bottom: 12px; margin-bottom: 12px;">
        <div style="margin-bottom: 8px;">
          ${logoBase64 ? `
            <img 
              src="${logoBase64}" 
              alt="TIDURLAH GRAFIKA" 
              style="max-height: 40px; width: auto; object-fit: contain; margin: 0 auto; display: block;"
            />
          ` : ''}
          <h2 style="font-size: 16px; font-weight: bold; margin: 8px 0 4px 0;">TIDURLAH GRAFIKA</h2>
          <p style="font-size: 11px; font-style: italic; margin: 4px 0; color: #333;">"Cetak apa aja, Tidurlah Grafika!"</p>
          <p style="font-size: 10px; margin: 2px 0; color: #333;">Jl. Perum Pemda Wayhui, Way Hui</p>
          <p style="font-size: 10px; margin: 2px 0; color: #333;">Kec. Jati Agung, Lampung Selatan 35365</p>
        </div>
        <div style="border-bottom: 1px dashed #374151; margin: 8px 0;"></div>
        <p style="font-size: 10px; color: #333;">WhatsApp: 085172157808</p>
        <p style="font-size: 10px; color: #333;">Instagram: @tidurlah_grafika | @idcard_lampung</p>
      </div>

      <!-- Customer Details -->
      ${data.customer ? `
        <div style="border-bottom: 1px dashed #374151; padding-bottom: 12px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #555;">Pelanggan:</span>
            <span style="font-weight: bold;">${data.customer.name}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #555;">Telepon:</span>
            <span>${data.customer.phone}</span>
          </div>
          ${data.customer.instansi ? `
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span style="color: #555;">Instansi:</span>
              <span>${data.customer.instansi}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Transaction Details -->
      <div style="border-bottom: 1px dashed #374151; padding-bottom: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
          <span style="color: #555;">No. Transaksi:</span>
          <span style="font-weight: bold;">${data.receiptId}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
          <span style="color: #555;">Tanggal:</span>
          <span>${data.timestamp}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
          <span style="color: #555;">Kasir:</span>
          <span>${data.cashier}</span>
        </div>
      </div>

      <!-- Items -->
      <div style="border-bottom: 1px dashed #374151; padding-bottom: 12px; margin-bottom: 12px;">
        <div style="text-align: center; font-weight: bold; margin-bottom: 8px;">DETAIL PEMBELIAN</div>
        <div>
          ${data.items.map((item: any) => `
            <div style="margin-bottom: 8px;">
              <div style="font-weight: bold; margin-bottom: 2px;">${item.name}</div>
              ${item.width && item.height ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Ukuran: ${item.width}m x ${item.height}m</div>` : ''}
              ${item.modelCode ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Model: ${item.modelCode}</div>` : ''}
              ${item.caseVariant ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Casing: ${item.caseVariant}</div>` : ''}
              ${item.laminationVariant ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Laminasi: ${item.laminationVariant}</div>` : ''}
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 10px;">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</span>
                <span style="font-size: 10px; font-weight: 600;">Rp ${item.subtotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Totals -->
      <div style="border-bottom: 1px dashed #374151; padding-bottom: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
          <span>Subtotal:</span>
          <span>Rp ${data.summary.subtotal.toLocaleString('id-ID')}</span>
        </div>

        ${data.summary.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 4px 0; color: #16a34a;">
            <span>Diskon:</span>
            <span>- Rp ${data.summary.discount.toLocaleString('id-ID')}</span>
          </div>
        ` : ''}

        <div style="border-top: 1px dashed #374151; margin-top: 8px; padding-top: 8px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
            <span>TOTAL:</span>
            <span>Rp ${data.summary.total.toLocaleString('id-ID')}</span>
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
}

