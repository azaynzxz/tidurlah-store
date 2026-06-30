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

function formatCashierName(cashier: string): string {
  if (!cashier) return 'Kasir';
  if (cashier.includes('@')) {
    return cashier.split('@')[0];
  }
  return cashier;
}

function formatReceiptTimestamp(timestampStr: string): string {
  if (!timestampStr) return '';
  try {
    let d = new Date(timestampStr);
    if (isNaN(d.getTime())) {
      // Clean time dots to colons and handle custom formats
      let cleaned = timestampStr.replace(/(\d{2})\.(\d{2})\.(\d{2})/, '$1:$2:$3');
      const monthsIndo = {
        'jan': 'Jan', 'feb': 'Feb', 'mar': 'Mar', 'apr': 'Apr', 'mei': 'May', 'jun': 'Jun',
        'jul': 'Jul', 'agu': 'Aug', 'sep': 'Sep', 'okt': 'Oct', 'nov': 'Nov', 'des': 'Dec'
      };
      Object.entries(monthsIndo).forEach(([indo, eng]) => {
        const regex = new RegExp(indo, 'gi');
        cleaned = cleaned.replace(regex, eng);
      });
      d = new Date(cleaned);
    }
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} | ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  } catch (err) {
    console.error('Error formatting timestamp:', err);
  }
  return timestampStr;
}

function generateDashedLineHTML(): string {
  return `
    <div style="border-top: 1px dashed #000; margin: 5px 0; height: 0; line-height: 0; font-size: 0; clear: both;"></div>
  `;
}

function generateQRISHTML(showQRIS?: boolean, qrisBase64?: string): string {
  if (!showQRIS) return '';
  const qrisImg = qrisBase64 || '/qris.jpeg';
  return `
    <div style="text-align: center; margin: 2px 0; padding: 0;">
      <div style="font-weight: 700; font-size: 12.5px; margin-bottom: 2px; color: #000; letter-spacing: 0.5px; line-height: 1.4;">PEMBAYARAN QRIS</div>
      <img 
        src="${qrisImg}" 
        alt="QRIS Code" 
        style="width: 100%; height: auto; max-width: 300px; object-fit: contain; margin: 4px auto; display: block;"
      />
      <div style="font-size: 11px; color: #000; line-height: 1.4; margin-top: 1px;">
        <span style="font-weight: 700;">Tidurlah Grafika</span> - <span style="font-size: 10px; font-weight: 500;">NMID : ID1025408510978</span>
      </div>
    </div>
  `;
}

export interface ReceiptData {
  receiptId: string;
  timestamp: string;
  cashier: string;
  cabang?: string;
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

// Shared helper to generate items detail HTML table
function generateItemsDetailHTML(items: ReceiptData['items']): string {
  return items.map((item) => {
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

    return `
      <div style="margin: 6px 0; padding: 1px 0;">
        <div style="font-size: 12px; margin-bottom: 2px; color: #000; line-height: 1.45;">
          <span style="font-weight: 700;">${item.name}</span>
          ${additionalInfo.length > 0 ? `<span style="font-weight: 500;"> (${additionalInfo.join(', ')})</span>` : ''}
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2px; font-size: 12px; line-height: 1.45;">
          <span style="color: #000; font-weight: 500;">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</span>
          <span style="font-weight: 700; color: #000;">Rp ${item.subtotal.toLocaleString('id-ID')}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Shared helper to generate customer info HTML
function generateCustomerInfoHTML(data: ReceiptData): string {
  const cashierName = formatCashierName(data.cashier);
  return `
    <div style="padding-bottom: 2px; margin-bottom: 2px;">
      <!-- Transaction ID (Full Width) -->
      <div style="margin: 2px 0 4px 0; text-align: center;">
        <div style="color: #000; font-weight: 700; font-size: 12.5px; word-break: break-all; line-height: 1.45; letter-spacing: 0.5px;">${data.receiptId}</div>
      </div>
      
      ${data.customer ? `
        <!-- Compact Layout -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
          <div style="font-size: 12px; color: #000; font-weight: 500; line-height: 1.45;">Kasir: ${cashierName}</div>
          <div style="font-size: 12px; color: #000; font-weight: 700; line-height: 1.45; text-align: right;">${data.customer.name}</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="font-size: 12px; color: #000; font-weight: 500; line-height: 1.45;">${data.customer.instansi || ''}</div>
          <div style="font-size: 12px; color: #000; font-weight: 500; line-height: 1.45; text-align: right;">${maskPhoneNumber(data.customer.phone)}</div>
        </div>
        
        <!-- Delivery Information -->
        ${data.customer.delivery ? `
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #000;">
            <div style="font-weight: 700; text-align: center; font-size: 12px; margin-bottom: 4px; color: #000; line-height: 1.4;">INFORMASI PENGIRIMAN</div>
            <div style="display: flex; justify-content: space-between; margin: 2px 0; font-size: 12px; line-height: 1.4;">
              <span style="color: #000; font-weight: 500;">Penerima:</span>
              <span style="font-weight: 700; color: #000;">${data.customer.delivery.recipientName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 2px 0; font-size: 12px; line-height: 1.4;">
              <span style="color: #000; font-weight: 500;">Telepon:</span>
              <span style="font-weight: 500; color: #000;">${maskPhoneNumber(data.customer.delivery.recipientPhone)}</span>
            </div>
            <div style="margin: 2px 0; font-size: 12px; line-height: 1.4;">
              <span style="color: #000; font-weight: 500;">Alamat:</span>
            </div>
            <div style="font-size: 11px; line-height: 1.4; padding-left: 4px; word-wrap: break-word; color: #000; font-weight: 500;">
              ${data.customer.delivery.address}
            </div>
          </div>
        ` : ''}
      ` : `
        <!-- No Customer: Just show transaction info -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="font-size: 12px; color: #000; font-weight: 500; line-height: 1.45;">Kasir: ${cashierName}</div>
        </div>
      `}
    </div>
  `;
}

// Shared helper to generate totals summary HTML
function generateTotalsHTML(summary: ReceiptData['summary']): string {
  return `
    <div style="padding-bottom: 2px; margin-bottom: 2px;">
      ${summary.discount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; color: #000; line-height: 1.4;">
          <span style="font-weight: 500;">Anda Hemat:</span>
          <span style="font-weight: 500;">Rp ${summary.discount.toLocaleString('id-ID')}</span>
        </div>
      ` : ''}

      <div style="margin-top: 4px;">
        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 12px; padding: 2px 0; margin: 3px 0; line-height: 1.4;">
          <span style="color: #000;">TOTAL:</span>
          <span style="color: #000;">Rp ${summary.total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      ${summary.downPayment && summary.downPayment > 0 ? `
        <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; color: #000; font-weight: 700; line-height: 1.4;">
          <span>DP:</span>
          <span>Rp ${summary.downPayment.toLocaleString('id-ID')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; color: #000; font-weight: 700; line-height: 1.4;">
          <span>SISA BAYAR:</span>
          <span style="color: #ff0000;">Rp ${summary.remainingBalance?.toLocaleString('id-ID') || '0'}</span>
        </div>
      ` : ''}
    </div>
  `;
}

// Shared helper to generate survey invitation section
function generateSurveyHTML(surveyQRBase64?: string): string {
  if (!surveyQRBase64) return '';
  return `
    <div style="padding: 2px 0; margin: 4px 0; text-align: center;">
      <div style="font-size: 12px; color: #000; line-height: 1.4;">
        <span style="font-weight: 700;">Kritik dan saran:</span> <span style="font-weight: 900; font-size: 13.5px; letter-spacing: 0.5px;">idcardlampung.com/survey</span>
      </div>
    </div>
  `;
}

/**
 * Generate receipt HTML for Cabang Belwis (Default Design)
 */
export function generateBelwisReceiptHTML(data: ReceiptData, logoBase64?: string, surveyQRBase64?: string, bottomLogoBase64?: string, showQRIS?: boolean, qrisBase64?: string): string {
  // If topLogo is not provided, or matches the placeholder of Tidurlah logo, fall back to Belwis top logo path
  let topLogo = logoBase64;
  if (!topLogo || topLogo.includes('Tidurlah%20Logo') || topLogo.includes('Tidurlah Logo')) {
    topLogo = '/logo-idcard-lampung.jpg';
  }

  // Determine bottom logo (Tidurlah logo):
  let bottomLogo = bottomLogoBase64;
  if (!bottomLogo) {
    if (logoBase64 && (logoBase64.includes('Tidurlah%20Logo') || logoBase64.includes('Tidurlah Logo') || logoBase64.startsWith('data:image/png;base64'))) {
      bottomLogo = logoBase64;
    } else {
      bottomLogo = '/product-image/Tidurlah Logo Horizontal.png';
    }
  }

  return `
    <div style="font-family: 'Roboto', 'Arial', 'Helvetica', sans-serif; font-size: 13px; line-height: 1.4; max-width: 350px; background: white; color: #000000; padding: 6px 16px; box-sizing: border-box;">
      <!-- Store Header -->
      ${showQRIS ? `
        <div style="padding-bottom: 4px; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <!-- Left Logo -->
            ${topLogo ? `
              <img 
                src="${topLogo}" 
                alt="Cabang Belwis" 
                style="max-height: 52px; max-width: 110px; width: auto; object-fit: contain; flex-shrink: 0;"
              />
            ` : ''}
            <!-- Right Address & Socials -->
            <div style="text-align: right; font-size: 10px; line-height: 1.35; color: #000; font-weight: 500; flex: 1;">
              <p style="margin: 0; font-style: italic; font-weight: 700; font-size: 11px;">"ID Card Cepat, Jalur Pintas!"</p>
              <p style="margin: 2px 0 0 0;">Jl. Perum Pemda Wayhui, Way Hui</p>
              <p style="margin: 2px 0 0 0;">Kec. Jati Agung, Lamsel 35365</p>
              <p style="margin: 3px 0 0 0; font-size: 9.5px;">WA: 085172157808</p>
              <p style="margin: 1.5px 0 0 0; font-size: 9.5px;">IG: @idcard_lampung | @papan_idcraft | @tidurlah_grafika</p>
            </div>
          </div>
        </div>
      ` : `
        <div style="text-align: center; padding-bottom: 4px; margin-bottom: 4px;">
          <!-- Centered Logo -->
          ${topLogo ? `
            <div style="margin-bottom: 6px;">
              <img 
                src="${topLogo}" 
                alt="Cabang Belwis" 
                style="max-height: 52px; width: auto; object-fit: contain; margin: 0 auto; display: block;"
              />
            </div>
          ` : ''}
          <!-- Centered Info -->
          <div style="font-size: 11px; line-height: 1.35; color: #000; font-weight: 500; margin-bottom: 4px;">
            <p style="margin: 0; font-style: italic; font-weight: 700; font-size: 11.5px;">"ID Card Cepat, Jalur Pintas!"</p>
            <p style="margin: 3px 0 0 0;">Jl. Perum Pemda Wayhui, Way Hui</p>
            <p style="margin: 1px 0 0 0;">Kec. Jati Agung, Lampung Selatan 35365</p>
          </div>
          <!-- Socials Row -->
          <div style="text-align: center; font-size: 11px; color: #000; font-weight: 500; margin-top: 4px; line-height: 1.45;">
            WA: 085172157808 | IG: @idcard_lampung |<br/>
            @papan_idcraft | @tidurlah_grafika
          </div>
        </div>
      `}

      ${generateDashedLineHTML()}

      <!-- Transaction & Customer Info -->
      ${generateCustomerInfoHTML(data)}

      ${generateDashedLineHTML()}

      <!-- Items -->
      <div style="padding-bottom: 4px; margin-bottom: 4px;">
        <div style="text-align: center; font-weight: 700; font-size: 12px; margin: 6px 0; letter-spacing: 1.5px; color: #000;">DETAIL PEMBELIAN</div>
        <div>
          ${generateItemsDetailHTML(data.items)}
        </div>
      </div>

      ${generateDashedLineHTML()}

      <!-- Totals -->
      ${generateTotalsHTML(data.summary)}

      <!-- QRIS Section -->
      ${showQRIS ? `
        ${generateDashedLineHTML()}
        ${generateQRISHTML(showQRIS, qrisBase64)}
      ` : ''}

      <!-- Survey Section -->
      ${surveyQRBase64 ? `
        ${generateSurveyHTML(surveyQRBase64)}
      ` : ''}

      ${generateDashedLineHTML()}

      <!-- Footer -->
      <div style="text-align: center; padding-top: 4px;">
        <!-- Tidurlah Grafika logo first -->
        ${bottomLogo ? `
          <img 
            src="${bottomLogo}" 
            alt="Tidurlah Grafika" 
            style="max-height: 26px; width: auto; object-fit: contain; margin: 0 auto 6px auto; display: block; opacity: 0.8;"
          />
        ` : ''}
        <div style="font-size: 11px; color: #000; margin: 0; font-style: italic; line-height: 1.35;">Barang yang sudah dibeli tidak dapat dikembalikan</div>
        <div style="font-size: 11px; color: #000; margin-top: 4px; font-weight: 500; line-height: 1.35;">${formatReceiptTimestamp(data.timestamp)}</div>
      </div>
    </div>
  `;
}

/**
 * Generate receipt HTML for Cabang Unila (Unila Design: no address, no Tidurlah logo, custom socials)
 */
export function generateUnilaReceiptHTML(data: ReceiptData, logoBase64?: string, surveyQRBase64?: string, showQRIS?: boolean, qrisBase64?: string): string {
  let topLogo = logoBase64;
  if (!topLogo || topLogo.includes('Tidurlah%20Logo') || topLogo.includes('Tidurlah Logo')) {
    topLogo = '/logo_nono.jpeg';
  }

  return `
    <div style="font-family: 'Roboto', 'Arial', 'Helvetica', sans-serif; font-size: 13px; line-height: 1.4; max-width: 350px; background: white; color: #000000; padding: 6px 16px; box-sizing: border-box;">
      <!-- Store Header -->
      <div style="text-align: center; padding-bottom: 4px; margin-bottom: 4px;">
        <div style="margin-bottom: 4px;">
          ${topLogo ? `
            <img 
              src="${topLogo}" 
              alt="Cabang Unila" 
              style="max-height: 42px; width: auto; object-fit: contain; margin: 0 auto; display: block;"
            />
          ` : ''}
        </div>
        <div style="text-align: center; font-size: 11px; color: #000; font-weight: 500; line-height: 1.3;">
          WA: +62 857-1802-5415 | IG: @lanyard_balam
        </div>
      </div>

      ${generateDashedLineHTML()}

      <!-- Transaction & Customer Info -->
      ${generateCustomerInfoHTML(data)}

      ${generateDashedLineHTML()}

      <!-- Items -->
      <div style="padding-bottom: 4px; margin-bottom: 4px;">
        <div style="text-align: center; font-weight: 700; font-size: 12px; margin: 6px 0; letter-spacing: 1.5px; color: #000;">DETAIL PEMBELIAN</div>
        <div>
          ${generateItemsDetailHTML(data.items)}
        </div>
      </div>

      ${generateDashedLineHTML()}

      <!-- Totals -->
      ${generateTotalsHTML(data.summary)}

      <!-- QRIS Section -->
      ${showQRIS ? `
        ${generateDashedLineHTML()}
        ${generateQRISHTML(showQRIS, qrisBase64)}
      ` : ''}

      <!-- Survey Section Unila (Text only feedback prompt) -->
      <div style="padding: 2px 0; margin: 2px 0; text-align: center;">
        <div style="font-weight: 700; font-size: 12px; margin-bottom: 4px; color: #000; line-height: 1.4;">
          Seberapa baikkah pelayanan kami?
        </div>
        <div style="font-size: 11px; line-height: 1.4; margin-bottom: 4px; color: #000; font-weight: 500;">
          Sampaikan kritik dan saran +62 857-1802-5415 (CS)
        </div>
      </div>

      ${generateDashedLineHTML()}

      <!-- Footer -->
      <div style="text-align: center; padding-top: 4px;">
        <div style="font-size: 11px; color: #000; margin: 0; font-style: italic; line-height: 1.35;">Barang yang sudah dibeli tidak dapat dikembalikan</div>
        <div style="font-size: 11px; color: #000; margin-top: 4px; font-weight: 500; line-height: 1.35;">${formatReceiptTimestamp(data.timestamp)}</div>
      </div>
    </div>
  `;
}

/**
 * Dispatcher to route receipt generation based on branches
 */
export function generateReceiptHTML(data: ReceiptData, logoBase64?: string, surveyQRBase64?: string, bottomLogoBase64?: string, showQRIS?: boolean, qrisBase64?: string): string {
  const branch = data.cabang || 'Cabang Belwis';
  if (branch === 'Cabang Unila') {
    return generateUnilaReceiptHTML(data, logoBase64, surveyQRBase64, showQRIS, qrisBase64);
  } else {
    return generateBelwisReceiptHTML(data, logoBase64, surveyQRBase64, bottomLogoBase64, showQRIS, qrisBase64);
  }
}
