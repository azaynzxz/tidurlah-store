/**
 * Universal Receipt Template Generator
 * This template is used for all receipt generation: PDF, JPG, and Preview
 * Update this file to change the receipt design across all formats
 */

/**
 * Mask phone number, showing only the last 4 digits
 * Example: 085172157808 -> *******5708
 */
function maskPhoneNumber(phone: string | number): string {
  const phoneStr = String(phone || '');
  if (!phoneStr || phoneStr.length <= 4) return phoneStr;
  const lastFour = phoneStr.slice(-4);
  const masked = phoneStr.slice(0, -4).replace(/./g, '*');
  return masked + lastFour;
}

export interface ReceiptData {
  receiptId: string;
  timestamp: string;
  cashier: string;
  customer?: {
    name: string;
    phone: string;
    instansi?: string;
    delivery?: {
      recipientName: string;
      recipientPhone: string;
      address: string;
    };
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    width?: number;
    height?: number;
    modelCode?: string;
    caseVariant?: string;
    laminationVariant?: string;
  }>;
  summary: {
    subtotal: number;
    discount: number;
    total: number;
    downPayment?: number;
    remainingBalance?: number;
  };
}

/**
 * Generate receipt HTML with V2 design (larger fonts, better readability)
 * @param data - Receipt data
 * @param logoBase64 - Optional base64 encoded logo image (or URL path)
 * @param surveyQRBase64 - Optional base64 encoded survey QR code (or URL path)
 * @returns HTML string for receipt
 */
export function generateReceiptHTML(data: ReceiptData, logoBase64?: string, surveyQRBase64?: string): string {
  return `
    <div style="font-family: 'Roboto', 'Arial', 'Helvetica', sans-serif; font-size: 15px; line-height: 1.4; max-width: 350px; background: white; color: #000000; padding: 8px 6px; box-sizing: border-box;">
      <!-- Store Header -->
      <div style="text-align: center; padding-bottom: 10px; margin-bottom: 10px;">
        <div style="margin-bottom: 10px;">
          ${logoBase64 ? `
            <img 
              src="${logoBase64}" 
              alt="TIDURLAH GRAFIKA" 
              style="max-height: 60px; width: auto; object-fit: contain; margin: 0 auto 8px auto; display: block;"
            />
          ` : ''}
          <p style="font-size: 14px; font-style: italic; margin: 0x 0; color: #000; font-weight: 500;">"Cetak apa aja, Tidurlah Grafika!"</p>
          <p style="font-size: 14px; margin: 0x 0; color: #000; font-weight: 500;">Jl. Perum Pemda Wayhui, Way Hui</p>
          <p style="font-size: 14px; margin: 0x 0; color: #000; font-weight: 500;">Kec. Jati Agung, Lampung Selatan 35365</p>
        </div>
        <div style="margin: 0px 0;"></div>
        <div style="text-align: center; font-size: 14px; color: #000; font-weight: 500;">
          WA: 085172157808 | IG: @tidurlah_grafika | @idcard_lampung
        </div>
      </div>

      <!-- Transaction & Customer Info -->
      <div style="padding-bottom: 2px; margin-bottom: 8px;">
        <!-- Transaction ID (Full Width) -->
        <div style="margin: 3px 0 6px 0; text-align: center;">
          <div style="color: #000; font-weight: 700; font-size: 14px; word-break: break-all; line-height: 1.3;">${data.receiptId}</div>
        </div>
        
        ${data.customer ? `
          <!-- Two Column Layout -->
          <div style="display: flex; justify-content: space-between; gap: 8px;">
            <!-- Left Column: Transaction Info -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 3px;">
              <div style="font-size: 14px; color: #000; font-weight: 500;">Kasir: ${data.cashier}</div>
            </div>
            
            <!-- Right Column: Customer Info -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 3px; text-align: right;">
              <div style="font-size: 14px; color: #000; font-weight: 700;">${data.customer.name}</div>
              <div style="font-size: 14px; color: #000; margin-top: 0px; font-weight: 500;">${maskPhoneNumber(data.customer.phone)}</div>
              ${data.customer.instansi ? `
                <div style="font-size: 14px; color: #000; margin-top: 0px; font-weight: 500;">${data.customer.instansi}</div>
              ` : ''}
            </div>
          </div>
          
          <!-- Delivery Information -->
          ${data.customer.delivery ? `
            <div style="margin-top: 8px; padding-top: 6px;">
              <div style="font-weight: 700; text-align: center; font-size: 14px; margin-bottom: 4px; color: #000;">INFORMASI PENGIRIMAN</div>
              <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 14px;">
                <span style="color: #000; font-weight: 500;">Penerima:</span>
                <span style="font-weight: 700; color: #000;">${data.customer.delivery.recipientName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 14px;">
                <span style="color: #000; font-weight: 500;">Telepon:</span>
                <span style="font-weight: 500; color: #000;">${maskPhoneNumber(data.customer.delivery.recipientPhone)}</span>
              </div>
              <div style="margin: 3px 0; font-size: 14px;">
                <span style="color: #000; font-weight: 500;">Alamat:</span>
              </div>
              <div style="font-size: 14px; line-height: 1.3; padding-left: 4px; word-wrap: break-word; color: #000; font-weight: 500;">
                ${data.customer.delivery.address}
              </div>
            </div>
          ` : ''}
        ` : `
          <!-- No Customer: Just show transaction info -->
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <div style="font-size: 14px; color: #000; font-weight: 500;">Kasir: ${data.cashier}</div>
          </div>
        `}
      </div>

      <!-- Items -->
      <div style="padding-bottom: 8px; margin-bottom: 10px;">
        <div style="text-align: center; font-weight: 700; font-size: 14px; margin-bottom: 8px; letter-spacing: 1.5px; color: #000;">DETAIL PEMBELIAN</div>
        <div>
          ${data.items.map((item) => {
    // Build additional info array
    const additionalInfo = [];
    if (item.width && item.height) {
      additionalInfo.push(`${item.width}m x ${item.height}m`);
    }
    if (item.modelCode) {
      additionalInfo.push(`Model: ${item.modelCode}`);
    }
    if (item.caseVariant) {
      additionalInfo.push(`Casing: ${item.caseVariant}`);
    }
    if (item.laminationVariant) {
      additionalInfo.push(`Laminasi: ${item.laminationVariant}`);
    }

    // Format product name with additional info
    const productDisplay = additionalInfo.length > 0
      ? `${item.name} (${additionalInfo.join(', ')})`
      : item.name;

    return `
            <div style="margin: 4px 0; padding: 3px 0;">
              <div style="font-size: 14px; margin-bottom: 2px; color: #000;">
                <span style="font-weight: 700;">${item.name}</span>
                ${additionalInfo.length > 0 ? `<span style="font-weight: 500;"> (${additionalInfo.join(', ')})</span>` : ''}
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 2px; font-size: 14px;">
                <span style="color: #000; font-weight: 500;">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</span>
                <span style="font-weight: 700; color: #000;">Rp ${item.subtotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          `;
  }).join('')}
        </div>
      </div>

      <!-- Totals -->
      <div style="padding-bottom: 8px; margin-bottom: 8px;">
        ${data.summary.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 14px; color: #000;">
            <span style="font-weight: 500;">Anda Hemat:</span>
            <span style="font-weight: 500;">Rp ${data.summary.discount.toLocaleString('id-ID')}</span>
          </div>
        ` : ''}

        <div style="margin-top: 6px; padding-top: 6px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; padding: 4px 0; margin: 5px 0;">
            <span style="color: #000;">TOTAL:</span>
            <span style="color: #000;">Rp ${data.summary.total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        ${data.summary.downPayment && data.summary.downPayment > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 14px; color: #000; font-weight: 700;">
            <span>DP (Down Payment):</span>
            <span>Rp ${data.summary.downPayment.toLocaleString('id-ID')}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 14px; color: #000; font-weight: 700;">
            <span>SISA BAYAR:</span>
            <span>Rp ${data.summary.remainingBalance?.toLocaleString('id-ID') || '0'}</span>
          </div>
        ` : ''}
      </div>

      <!-- Survey Section -->
      ${surveyQRBase64 ? `
        <div style="padding: 0px 0px; margin-bottom: 0px; background-color: none; border-radius: 4px; text-align: center;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #000; line-height: 1;">
            Seberapa baikkah pelayanan kami?
          </div>
          <div style="font-size: 14px; line-height: 1; margin-bottom: 0px; color: #000; font-weight: 500;">
            Kami ingin mendengar pendapat Anda. Kunjungi:
          </div>
          <div style="font-weight: 900; margin-top: 15px; font-size: 16px; color: #000; letter-spacing: 0px;">
            tidurlah.com/survey
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="text-align: center; padding-top: 10px;">

        <div style="font-size: 14px; color: #000; margin: 0px 0; font-style: italic; font-weight: 0px;">Barang yang sudah dibeli tidak dapat dikembalikan</div>
        <div style="font-size: 14px; color: #000; margin-top: 15px; font-weight: 500;">${data.timestamp}</div>
      </div>
    </div>
  `;
}

