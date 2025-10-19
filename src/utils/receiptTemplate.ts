/**
 * Universal Receipt Template Generator
 * This template is used for all receipt generation: PDF, JPG, and Preview
 * Update this file to change the receipt design across all formats
 */

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
          <p style="font-size: 14px; font-style: italic; margin: 5px 0; color: #000; font-weight: 500;">"Cetak apa aja, Tidurlah Grafika!"</p>
          <p style="font-size: 14px; margin: 4px 0; color: #000; font-weight: 500;">Perum. Korpri Raya, Blok D3. No. 3</p>
          <p style="font-size: 14px; margin: 4px 0; color: #000; font-weight: 500;">Sukarame, Bandar Lampung</p>
        </div>
        <div style="margin: 8px 0;"></div>
        <div style="display: flex; justify-content: space-around; font-size: 14px; color: #000; font-weight: 500;">
          <span>WhatsApp: 085172157808</span>
          <span>Instagram: @tidurlah_grafika</span>
        </div>
      </div>

      <!-- Transaction & Customer Info -->
      <div style="padding-bottom: 8px; margin-bottom: 8px;">
        <!-- Transaction ID (Full Width) -->
        <div style="margin: 3px 0 6px 0; text-align: center;">
          <div style="color: #000; font-weight: 700; font-size: 14px; word-break: break-all; line-height: 1.3;">${data.receiptId}</div>
        </div>
        
        ${data.customer ? `
          <!-- Two Column Layout -->
          <div style="display: flex; justify-content: space-between; gap: 8px;">
            <!-- Left Column: Transaction Info -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 3px;">
              <div style="font-size: 14px; color: #000;">
                <div style="font-weight: 500; margin-bottom: 1px;">Tanggal:</div>
                <div style="font-weight: 500;">${data.timestamp}</div>
              </div>
              <div style="font-size: 14px; color: #000; margin-top: 3px;">
                <div style="font-weight: 500; margin-bottom: 1px;">Kasir:</div>
                <div style="font-weight: 500;">${data.cashier}</div>
              </div>
            </div>
            
            <!-- Right Column: Customer Info -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 3px; text-align: right;">
              <div style="font-size: 14px; color: #000;">
                <div style="font-weight: 500; margin-bottom: 1px;">Pelanggan:</div>
                <div style="font-weight: 700;">${data.customer.name}</div>
              </div>
              <div style="font-size: 14px; color: #000; margin-top: 3px;">
                <div style="font-weight: 500; margin-bottom: 1px;">Telepon:</div>
                <div style="font-weight: 500;">${data.customer.phone}</div>
              </div>
              ${data.customer.instansi ? `
                <div style="font-size: 14px; color: #000; margin-top: 3px;">
                  <div style="font-weight: 500; margin-bottom: 1px;">Instansi:</div>
                  <div style="font-weight: 500;">${data.customer.instansi}</div>
                </div>
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
                <span style="font-weight: 500; color: #000;">${data.customer.delivery.recipientPhone}</span>
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
            <div style="font-size: 14px; color: #000;">
              <span style="font-weight: 500;">Tanggal: </span>
              <span style="font-weight: 500;">${data.timestamp}</span>
            </div>
            <div style="font-size: 14px; color: #000;">
              <span style="font-weight: 500;">Kasir: </span>
              <span style="font-weight: 500;">${data.cashier}</span>
            </div>
          </div>
        `}
      </div>

      <!-- Items -->
      <div style="padding-bottom: 8px; margin-bottom: 10px;">
        <div style="text-align: center; font-weight: 700; font-size: 14px; margin-bottom: 8px; letter-spacing: 1.5px; color: #000;">DETAIL PEMBELIAN</div>
        <div>
          ${data.items.map((item) => `
            <div style="margin: 4px 0; padding: 3px 0;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #000;">
                ${item.name}
                ${item.width && item.height ? `<span style="font-weight: 500; color: #000; font-size: 14px;"> (${item.width}m x ${item.height}m)</span>` : ''}
                ${item.modelCode ? `<span style="font-weight: 500; color: #000; font-size: 14px;"> [${item.modelCode}]</span>` : ''}
              </div>
              ${item.caseVariant ? `<div style="font-size: 14px; color: #000; font-weight: 500; margin: 1px 0; padding-left: 4px;">Casing: ${item.caseVariant}</div>` : ''}
              ${item.laminationVariant ? `<div style="font-size: 14px; color: #000; font-weight: 500; margin: 1px 0; padding-left: 4px;">Laminasi: ${item.laminationVariant}</div>` : ''}
              <div style="display: flex; justify-content: space-between; margin-top: 2px; font-size: 14px;">
                <span style="color: #000; font-weight: 500;">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</span>
                <span style="font-weight: 700; color: #000;">Rp ${item.subtotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Totals -->
      <div style="padding-bottom: 8px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 14px;">
          <span style="color: #000; font-weight: 500;">Subtotal:</span>
          <span style="font-weight: 500; color: #000;">Rp ${data.summary.subtotal.toLocaleString('id-ID')}</span>
        </div>

        ${data.summary.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 14px; color: #e74c3c;">
            <span style="font-weight: 500;">Diskon:</span>
            <span style="font-weight: 500;">- Rp ${data.summary.discount.toLocaleString('id-ID')}</span>
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
        <div style="padding: 8px 4px; margin-bottom: 8px; background-color: #f8f8f8; border-radius: 4px; display: flex; align-items: center; gap: 8px;">
          <div style="flex-shrink: 0;">
            <img 
              src="${surveyQRBase64}" 
              alt="Survey QR Code" 
              style="width: 90px; height: 90px; border: 1px solid #ddd; border-radius: 4px; display: block;"
            />
          </div>
          <div style="flex: 1; text-align: left;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 3px; color: #000; line-height: 1.2;">
              Seberapa baikkah pelayanan kami?
            </div>
            <div style="font-size: 14px; line-height: 1.3; margin-bottom: 1px; color: #000; font-weight: 700;">
              Kami ingin mendengar pendapat Anda. Pindai QR atau kunjungi:
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #ff6b35;">
              tidurlah.com/survey
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="text-align: center; padding-top: 10px;">
        <div style="font-weight: 700; font-size: 14px; margin: 8px 0; color: #000;">Terima kasih telah berbelanja!</div>
        <div style="font-size: 14px; color: #000; margin: 5px 0; font-style: italic; font-weight: 700;">Barang yang sudah dibeli tidak dapat dikembalikan</div>

        <p style="margin-top: 8px; font-size: 14px; color: #000; padding-top: 5px; font-weight: 700;">
          Dicetak pada: ${new Date().toLocaleString('id-ID', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })}
        </p>
      </div>
    </div>
  `;
}

