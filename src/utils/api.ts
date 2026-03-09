import type { OrderData } from '@/types/product';
import { JASA_DESAIN_PRICE, POS_GOOGLE_SHEETS_URL, LOKER_GOOGLE_SHEETS_URL, WHATSAPP_NUMBER } from '@/constants';

// POS Order Data interface
export interface POSOrderData {
  receiptId: string;
  cashier: string;
  customerName?: string;
  phoneNumber?: string;
  institution?: string;
  delivery?: {
    recipientName: string;
    recipientPhone: string;
    address: string;
  };
  items: {
    productId?: number;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    modelCode?: string;
    caseVariant?: string;
    laminationVariant?: string;
    width?: number;
    height?: number;
    dimensionText?: string;
    area?: string;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  downPayment?: number;
  remainingBalance?: number;
  paymentMethod?: string;
  deadline?: string;
}

// Website order submission — sends normalized JSON to unified endpoint
export const submitToGoogleSheet = async (orderData: OrderData) => {
  try {
    // Build normalized items array
    const items: POSOrderData['items'] = [
      ...orderData.cartItems.map((item: any) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.appliedPrice,
        subtotal: item.appliedPrice * item.quantity,
        modelCode: item.modelCode || '',
        caseVariant: item.caseVariant || '',
        laminationVariant: item.laminationVariant || '',
        width: item.width || undefined,
        height: item.height || undefined,
        dimensionText: item.dimensionText || '',
        area: item.area || '',
      })),
      ...(orderData.requestJasaDesain ? [{
        productId: 2001,
        name: 'Jasa Desain',
        quantity: 1,
        price: JASA_DESAIN_PRICE,
        subtotal: JASA_DESAIN_PRICE,
      }] : []),
      ...(orderData.isExpressPrint ? [{
        productId: 2003,
        name: 'Cetak Express',
        quantity: 1,
        price: JASA_DESAIN_PRICE,
        subtotal: JASA_DESAIN_PRICE,
      }] : []),
    ];

    const normalizedData = {
      receiptId: orderData.invoiceNumber,
      channel: 'website',
      cashier: 'Website',
      customerName: orderData.customerName,
      phoneNumber: orderData.phoneNumber,
      institution: orderData.instansi || '',
      items,
      subtotal: orderData.subtotal,
      discount: 0,
      total: orderData.total,
      downPayment: 0,
      remainingBalance: orderData.total,
      paymentMethod: 'Pending',
      // Website-specific fields
      promoCode: orderData.promoCode || '',
      promoDiscount: orderData.promoDiscount || 0,
      designNote: orderData.designNote || '',
      isShipping: orderData.isShipping || false,
      address: orderData.address || '',
      deadline: orderData.deadline || '',
    };

    await fetch(POS_GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify(normalizedData),
      mode: 'no-cors'
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting website order:', error);
    throw new Error(`Error sending to Google Sheets: ${error.message}`);
  }
};

// WhatsApp redirection function
export const handleWhatsAppRedirect = async (
  orderData: OrderData,
  cartItems: any[],
  promoCode: string,
  promoDiscount: number,
  JASA_DESAIN_PRICE: number,
  isExpressPrint: boolean,
  requestJasaDesain: boolean,
  customerName: string,
  phoneNumber: string,
  instansi: string,
  address: string,
  isShipping: boolean,
  designNote: string,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  setWhatsAppUrl: React.Dispatch<React.SetStateAction<string>>,
  setShowOrderSuccess: React.Dispatch<React.SetStateAction<boolean>>,
  calculateTotal: (cartItems: any[], promoCode: string) => number,
  calculateTotalSavings: (cartItems: any[]) => number,
  caseVariants: any[]
) => {
  // Prevent multiple submissions
  if (orderData.cartItems.length === 0) {
    throw new Error("Keranjang masih kosong");
  }

  if (!customerName || !phoneNumber) {
    throw new Error("Mohon isi nama dan nomor telepon kamu.");
  }

  if (isShipping && !address) {
    throw new Error("Mohon isi alamat pengiriman kamu.");
  }

  try {
    setIsSubmitting(true);

    // Prepare order data
    const fullOrderData: OrderData = {
      ...orderData,
      total: calculateTotal(cartItems, promoCode) + (requestJasaDesain ? JASA_DESAIN_PRICE : 0) + (isExpressPrint ? JASA_DESAIN_PRICE : 0)
    };

    // Save to Google Sheet
    await submitToGoogleSheet(fullOrderData);

    // Prepare WhatsApp message
    const productList = cartItems.map(item => {
      let itemInfo = `- ${item.name} (${item.quantity}×) — Rp ${item.appliedPrice.toLocaleString('id-ID')}`;
      if (item.width && item.height) {
        const area = (item.width * item.height).toFixed(2);
        itemInfo += `\n  Ukuran: ${item.width}m × ${item.height}m (${area} m²)`;
      }
      if (item.modelCode) {
        itemInfo += `\n  Kode: ${item.modelCode}`;
      }
      if (item.caseVariant) {
        const caseName = caseVariants.find(c => c.code === item.caseVariant)?.name || item.caseVariant;
        itemInfo += `\n  Casing: ${caseName}`;
      }
      if (item.laminationVariant) {
        itemInfo += `\n  Laminasi: ${item.laminationVariant}`;
      }
      return itemInfo;
    }).join('\n');

    const totalSavings = calculateTotalSavings(cartItems);
    const savingsMessage = totalSavings > 0 ?
      `\nKamu hemat: Rp ${totalSavings.toLocaleString('id-ID')}` : '';
    const promoMessage = promoDiscount > 0 ?
      `\nKode Promo: ${promoCode} (${promoDiscount}% discount)` : '';
    const jasaDesainMessage = requestJasaDesain ? `\nJasa Desain: Rp ${JASA_DESAIN_PRICE.toLocaleString('id-ID')}` : '';
    const expressPrintMessage = isExpressPrint ? `\nCetak Express: Rp ${JASA_DESAIN_PRICE.toLocaleString('id-ID')}` : '';
    const designNoteMessage = designNote ? `\nNote/Link Desain: ${designNote}` : '';
    const deadlineMessage = orderData.deadline ? `\nDeadline: ${orderData.deadline}` : '';

    const message = `Informasi Order:
Nama: ${customerName}
Instansi/Alias: ${instansi || '-'}
Telp: ${phoneNumber}${promoMessage}${designNoteMessage}${deadlineMessage}
${isShipping ? `Alamat: ${address}` : 'Ambil di tempat: Ya (tidak perlu dikirim)'}

Detail Order:
${productList}${jasaDesainMessage}${expressPrintMessage}

Total: Rp ${(calculateTotal(cartItems, promoCode) + (requestJasaDesain ? JASA_DESAIN_PRICE : 0) + (isExpressPrint ? JASA_DESAIN_PRICE : 0)).toLocaleString('id-ID')}${savingsMessage}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Store the WhatsApp URL in state and show success dialog
    setWhatsAppUrl(whatsappUrl);
    setIsSubmitting(false);
    setShowOrderSuccess(true);

    return { success: true, whatsappUrl };
  } catch (error) {
    setIsSubmitting(false);
    throw error;
  }
};

// POS Order submission function
export const submitPOSOrder = async (posOrderData: POSOrderData) => {
  try {
    // Add channel identifier for POS orders
    const dataWithChannel = {
      ...posOrderData,
      channel: 'pos'
    };

    // Send as POST request with JSON body to unified endpoint
    const response = await fetch(POS_GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify(dataWithChannel),
      mode: 'no-cors'
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting POS order:', error);
    throw new Error(`Error sending POS order to Google Sheets: ${error.message}`);
  }
};

// Fetch order history from Google Sheets
export interface OrderHistoryItem {
  orderId: string;
  timestamp: string;
  channel: string;
  cashier: string;
  customerName: string;
  customerPhone: string;
  institution: string;
  subtotal: number;
  discount: number;
  total: number;
  downPayment: number;
  remainingBalance: number;
  paymentMethod: string;
  orderStatus: string;
  itemCount: number;
  itemsSummary: string;
  promoCode: string;
  promoDiscount: number;
  designNote: string;
  isShipping: string;
  address: string;
  deadline?: string;
  items: {
    productId: number | string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    modelCode?: string;
    caseVariant?: string;
    lamination?: string;
    width?: number;
    height?: number;
    dimensionText?: string;
    area?: string;
  }[];
}

export const fetchOrderHistory = async (
  options: { limit?: number; channel?: string; cashier?: string } = {}
): Promise<{ success: boolean; orders: OrderHistoryItem[]; total: number; error?: string }> => {
  try {
    const params = new URLSearchParams();
    params.set('action', 'orders');
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.channel) params.set('channel', options.channel);
    if (options.cashier) params.set('cashier', options.cashier);
    params.set('t', new Date().getTime().toString()); // Cache buster

    const response = await fetch(`${POS_GOOGLE_SHEETS_URL}?${params.toString()}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    return { success: false, orders: [], total: 0, error: error.message };
  }
};

// Job Application Data interface
export interface JobApplicationData {
  nama: string;
  email: string;
  nomor: string;
  source: string;
  alamat: string;
  posisi: string;
  cv?: File | null;
  portfolio?: File | null;
}

// Progress callback type
export type ProgressCallback = (progress: number, message: string) => void;

// Helper function to convert File to base64 (simplified, no progress tracking)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (data:mime/type;base64,)
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Job Application submission function with progress tracking
 * Submits job application data to Google Apps Script API
 */
export const submitJobApplication = async (
  applicationData: JobApplicationData,
  onProgress?: ProgressCallback
): Promise<{ success: boolean }> => {
  try {
    // Start smooth fake progress bar
    let currentProgress = 0;
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    const startProgress = () => {
      progressInterval = setInterval(() => {
        if (onProgress && currentProgress < 98) {
          // Smooth progress: slower at start, faster in middle, slower at end
          let increment = 0;
          if (currentProgress < 20) {
            increment = 0.5; // Slow start
          } else if (currentProgress < 60) {
            increment = 1.0; // Medium-fast middle
          } else if (currentProgress < 85) {
            increment = 0.8; // Medium
          } else {
            increment = 0.4; // Slow near end
          }

          currentProgress = Math.min(currentProgress + increment, 98);
          onProgress(Math.round(currentProgress), 'Mengirim berkas lamaran');
        } else {
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }
        }
      }, 80); // Update every 80ms for smoother, slower animation
    };

    startProgress();

    // Convert CV file to base64 if provided
    let cvBase64 = '';
    let cvMimeType = '';
    let cvFileName = '';

    if (applicationData.cv) {
      cvBase64 = await fileToBase64(applicationData.cv);
      cvMimeType = applicationData.cv.type;
      cvFileName = applicationData.cv.name;
    } else {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      throw new Error('CV/Resume wajib diupload');
    }

    // Convert Portfolio file to base64 if provided
    let fileBase64 = '';
    let fileMimeType = '';
    let fileName = '';

    if (applicationData.portfolio) {
      fileBase64 = await fileToBase64(applicationData.portfolio);
      fileMimeType = applicationData.portfolio.type;
      fileName = applicationData.portfolio.name;
    }

    // Prepare data for Google Apps Script
    const payload: any = {
      nama: applicationData.nama,
      email: applicationData.email,
      nomor: applicationData.nomor,
      source: applicationData.source || '',
      alamat: applicationData.alamat || '',
      posisi: applicationData.posisi || '',
      cvBase64: cvBase64,
      cvMimeType: cvMimeType,
      cvFileName: cvFileName
    };

    // Only include portfolio fields if portfolio file exists
    if (applicationData.portfolio && fileBase64) {
      payload.fileBase64 = fileBase64;
      payload.fileMimeType = fileMimeType;
      payload.fileName = fileName;
    } else {
      // Send empty strings if no portfolio (Apps Script expects these fields)
      payload.fileBase64 = '';
      payload.fileMimeType = '';
      payload.fileName = '';
    }

    // Send as POST request with JSON body
    // Note: Using 'no-cors' mode because Google Apps Script handles CORS
    // However, this means we can't read the response status
    try {
      // Start the actual fetch
      const fetchPromise = fetch(LOKER_GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });

      // Wait for fetch to complete
      await fetchPromise;

      // Complete the progress bar smoothly to 100%
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      // Smooth finish to 100%
      if (onProgress) {
        const finishProgress = () => {
          if (currentProgress < 100) {
            currentProgress = Math.min(currentProgress + 0.5, 100);
            onProgress(Math.round(currentProgress), 'Mengirim berkas lamaran');

            if (currentProgress < 100) {
              setTimeout(finishProgress, 50);
            }
          }
        };
        finishProgress();
      }

      // Wait a bit for the progress to reach 100%
      await new Promise(resolve => setTimeout(resolve, 800));

      // With 'no-cors' mode, we can't read the response,
      // but if the fetch succeeds, we assume it's successful
      return { success: true };
    } catch (fetchError: any) {
      console.error('Fetch error:', fetchError);

      // Check for specific error types
      if (fetchError.message?.includes('403') || fetchError.message?.includes('Forbidden')) {
        throw new Error('Akses ditolak. Pastikan Google Apps Script sudah di-deploy dengan pengaturan "Who has access: Anyone"');
      }

      if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('NetworkError')) {
        throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda atau URL API.');
      }

      throw new Error(`Gagal mengirim lamaran: ${fetchError.message || 'Terjadi kesalahan tidak diketahui'}`);
    }
  } catch (error: any) {
    console.error('Error submitting job application:', error);
    throw error; // Re-throw to preserve the error message
  }
};

