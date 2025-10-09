interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ReceiptData {
  receiptId: string;
  timestamp: string;
  cashier: string;
  items: ReceiptItem[];
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
    city: string;
    postalCode: string;
    notes?: string;
  };
}

export class ReceiptGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private readonly width = 384; // 48mm at 203dpi (thermal printer width)
  private readonly padding = 16;
  private readonly lineHeight = 18;
  private readonly smallFont = '13px "Courier New", monospace';
  private readonly normalFont = '14px "Courier New", monospace';
  private readonly boldFont = 'bold 16px "Courier New", monospace';
  private readonly largeBoldFont = 'bold 15px "Courier New", monospace';
  private readonly titleFont = 'bold 20px "Courier New", monospace';

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.fillStyle = '#000000';
    this.ctx.textAlign = 'left';
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  }

  private drawText(text: string, x: number, y: number, font: string = this.normalFont, align: CanvasTextAlign = 'left'): number {
    this.ctx.font = font;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
    return y + this.lineHeight;
  }

  private drawLine(y: number, style: 'solid' | 'dashed' = 'dashed'): number {
    const lineY = y + 8;
    if (style === 'dashed') {
      this.ctx.setLineDash([3, 3]);
    } else {
      this.ctx.setLineDash([]);
    }
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding, lineY);
    this.ctx.lineTo(this.width - this.padding, lineY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    return lineY + 16;
  }

  private drawTextWithRightAlign(leftText: string, rightText: string, y: number, font: string = this.normalFont): number {
    this.ctx.font = font;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(leftText, this.padding, y);
    this.ctx.textAlign = 'right';
    this.ctx.fillText(rightText, this.width - this.padding, y);
    return y + this.lineHeight;
  }

  public async generateReceipt(data: ReceiptData): Promise<string> {
    // Calculate total height needed
    let estimatedHeight = 250; // header (increased for extra contact info)
    estimatedHeight += data.shipping ? 140 : 0; // shipping info (increased for bold text)
    estimatedHeight += data.items.length * 45; // items (increased line height)
    estimatedHeight += 150; // summary
    estimatedHeight += 230; // survey section (increased for QR code)
    estimatedHeight += 100; // footer
    
    this.canvas.height = Math.max(estimatedHeight, 600);
    
    // Fill white background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#000000';

    let currentY = this.padding + 20;

    // Header
    currentY = this.drawText('TIDURLAH GRAFIKA', this.width / 2, currentY, this.titleFont, 'center');
    currentY = this.drawText('"Cetak apa aja, Tidurlah Grafika!"', this.width / 2, currentY, this.smallFont, 'center');
    currentY = this.drawText('Perum. Korpri Raya, Blok D3. No. 3', this.width / 2, currentY, this.smallFont, 'center');
    currentY = this.drawText('Sukarame, Bandar Lampung', this.width / 2, currentY, this.smallFont, 'center');
    currentY = this.drawLine(currentY + 4);
    currentY = this.drawText('WhatsApp: 085172157808', this.width / 2, currentY, this.smallFont, 'center');
    currentY = this.drawText('Instagram: @tidurlah_grafika', this.width / 2, currentY, this.smallFont, 'center');
    
    currentY = this.drawLine(currentY + 8);

    // Receipt Info
    currentY = this.drawText(`No. Struk: ${data.receiptId}`, this.padding, currentY, this.smallFont);
    currentY = this.drawText(`Tanggal: ${data.timestamp}`, this.padding, currentY, this.smallFont);
    currentY = this.drawText(`Kasir: ${data.cashier}`, this.padding, currentY, this.smallFont);

    // Shipping Info (if available)
    if (data.shipping) {
      currentY = this.drawLine(currentY + 8);
      currentY = this.drawText('INFORMASI PENGIRIMAN', this.width / 2, currentY, this.boldFont, 'center');
      currentY += 4;
      currentY = this.drawText(`Nama: ${data.shipping.customerName}`, this.padding, currentY, this.largeBoldFont);
      currentY = this.drawText(`Telp: ${data.shipping.customerPhone}`, this.padding, currentY, this.largeBoldFont);
      currentY = this.drawText(`Alamat: ${data.shipping.address}`, this.padding, currentY, this.largeBoldFont);
      currentY = this.drawText(`Kota: ${data.shipping.city} ${data.shipping.postalCode}`, this.padding, currentY, this.largeBoldFont);
      if (data.shipping.notes) {
        currentY = this.drawText(`Catatan: ${data.shipping.notes}`, this.padding, currentY, this.largeBoldFont);
      }
    }

    currentY = this.drawLine(currentY + 8);

    // Items
    for (const item of data.items) {
      currentY = this.drawText(item.name, this.padding, currentY, this.normalFont);
      const itemDetail = `${item.quantity} x ${this.formatCurrency(item.price)}`;
      currentY = this.drawTextWithRightAlign(`  ${itemDetail}`, this.formatCurrency(item.subtotal), currentY, this.smallFont);
      currentY += 4; // extra spacing between items
    }

    currentY = this.drawLine(currentY + 8);

    // Summary
    currentY = this.drawTextWithRightAlign('Subtotal:', this.formatCurrency(data.summary.subtotal), currentY, this.normalFont);
    
    if (data.summary.discount > 0) {
      currentY = this.drawTextWithRightAlign('Diskon:', `- ${this.formatCurrency(data.summary.discount)}`, currentY, this.normalFont);
    }
    
    currentY = this.drawTextWithRightAlign('Pajak (10%):', this.formatCurrency(data.summary.tax), currentY, this.normalFont);
    
    currentY = this.drawLine(currentY + 4, 'solid');
    currentY = this.drawTextWithRightAlign('TOTAL:', this.formatCurrency(data.summary.total), currentY, this.boldFont);

    currentY = this.drawLine(currentY + 8);

    // Survey Section
    currentY = this.drawLine(currentY + 8);
    currentY += 8;
    currentY = this.drawText('Seberapa baikkah pelayanan kami?', this.width / 2, currentY, this.boldFont, 'center');
    currentY = this.drawText('Kami sangat ingin mendengar', this.width / 2, currentY, this.smallFont, 'center');
    currentY = this.drawText('pendapat Anda tentang kami.', this.width / 2, currentY, this.smallFont, 'center');
    currentY += 12;
    
    // Draw QR code
    try {
      // Try local path first (for standalone cashier app), fallback to main site path
      let qrImagePath = '/survey-qr.png';
      let qrImage: HTMLImageElement;
      
      try {
        qrImage = await this.loadImage(qrImagePath);
      } catch {
        qrImagePath = '/product-image/survey-qr.png';
        qrImage = await this.loadImage(qrImagePath);
      }
      
      const qrSize = 120;
      const qrX = (this.width - qrSize) / 2;
      currentY += 4;
      this.ctx.drawImage(qrImage, qrX, currentY, qrSize, qrSize);
      currentY += qrSize + 8;
    } catch (error) {
      console.error('Failed to load QR code:', error);
      currentY += 8;
    }
    
    currentY = this.drawText('Kunjungi: tidurlah.com/survey', this.width / 2, currentY, this.boldFont, 'center');
    
    currentY = this.drawLine(currentY + 12);
    
    // Footer
    currentY += 8;
    currentY = this.drawText('Terima kasih telah berbelanja!', this.width / 2, currentY, this.boldFont, 'center');
    currentY += 4;
    currentY = this.drawText('Barang yang sudah dibeli', this.width / 2, currentY, this.smallFont, 'center');
    currentY = this.drawText('tidak dapat dikembalikan', this.width / 2, currentY, this.smallFont, 'center');

    // Adjust canvas height to actual content
    const actualHeight = currentY + this.padding;
    if (actualHeight !== this.canvas.height) {
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, actualHeight);
      this.canvas.height = actualHeight;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.putImageData(imageData, 0, 0);
    }

    return this.canvas.toDataURL('image/jpeg', 0.95);
  }

  public async downloadReceipt(data: ReceiptData): Promise<void> {
    const dataUrl = await this.generateReceipt(data);
    const link = document.createElement('a');
    link.download = `receipt-${data.receiptId}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}