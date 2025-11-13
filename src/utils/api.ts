import type { OrderData, BannerDetails } from '@/types/product';
import { JASA_DESAIN_PRICE, GOOGLE_SHEETS_URL, POS_GOOGLE_SHEETS_URL, LOKER_GOOGLE_SHEETS_URL, WHATSAPP_NUMBER } from '@/constants';
import { caseVariants } from '@/constants';

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
}

// Google Sheet submission function
export const submitToGoogleSheet = async (orderData: OrderData) => {
  try {
    const formData = new URLSearchParams();

    // Format order details to include name, quantity, dimensions for banner products, and model code
    const simplifiedOrderDetails = [
      ...orderData.cartItems.map((item: any) => {
        let modifiedName = item.name;
        if (item.width && item.height) {
          const area = (item.width * item.height).toFixed(2);
          modifiedName = `${item.name} [${item.width}m × ${item.height}m, ${area}m²]`;
        }
        if (item.modelCode) {
          modifiedName = `${item.name} [${item.modelCode}]`;
        }
        // Add this for casing
        if (item.caseVariant) {
          const caseName = caseVariants.find(c => c.code === item.caseVariant)?.name || item.caseVariant;
          modifiedName = `${item.name} [Casing: ${caseName}]`;
        }
        // Add this for lamination
        if (item.laminationVariant) {
          modifiedName = `${item.name} [Laminasi: ${item.laminationVariant}]`;
        }
        return {
          name: modifiedName,
          quantity: item.quantity,
          price: item.appliedPrice,
          width: item.width || 0,
          height: item.height || 0,
          hasDimensions: item.width && item.height ? true : false,
          modelCode: item.modelCode || '',
          caseVariant: item.caseVariant,
          laminationVariant: item.laminationVariant
        };
      }),
      ...(orderData.requestJasaDesain ? [{
        name: 'Jasa Desain',
        quantity: 1,
        price: JASA_DESAIN_PRICE,
        width: 0,
        height: 0,
        hasDimensions: false,
        modelCode: ''
      }] : [])
    ];

    // Add all order data to formData
    formData.append('InvoiceNumber', orderData.invoiceNumber);
    formData.append('CustomerName', orderData.customerName);
    formData.append('Instansi', orderData.instansi || '');
    formData.append('PhoneNumber', orderData.phoneNumber);
    formData.append('DesignNote', encodeURIComponent(orderData.designNote || '').replace(/%20/g, '+'));
    formData.append('OrderDetails', JSON.stringify(simplifiedOrderDetails));

    // Add separate detail fields for banners to ensure dimensions are captured
    const bannerItems = orderData.cartItems.filter(item => item.width && item.height);
    if (bannerItems.length > 0) {
      formData.append('HasBanners', 'true');
      formData.append('BannerDetails', JSON.stringify(bannerItems.map(item => ({
        name: item.name,
        id: item.id,
        width: item.width,
        height: item.height,
        dimensions: `${item.width}m × ${item.height}m`,
        area: (item.width * item.height).toFixed(2),
        price: item.appliedPrice,
        quantity: item.quantity
      } as BannerDetails))));

      // Add a single string with all banner dimensions for easier Google Sheet processing
      const bannerDimensionsText = bannerItems.map(item =>
        `${item.name}: ${item.width}m × ${item.height}m (${(item.width * item.height).toFixed(2)}m²)`
      ).join('; ');
      formData.append('BannerDimensions', bannerDimensionsText);

      // Also add individual banner dimensions for easier parsing
      bannerItems.forEach((item, index) => {
        formData.append(`Banner_${index}_Name`, item.name);
        formData.append(`Banner_${index}_Width`, item.width.toString());
        formData.append(`Banner_${index}_Height`, item.height.toString());
        formData.append(`Banner_${index}_Area`, (item.width * item.height).toFixed(2));
        formData.append(`Banner_${index}_Quantity`, item.quantity.toString());
        formData.append(`Banner_${index}_Price`, item.appliedPrice.toString());
      });

      // Log banner details to console for debugging
      // Banner details prepared for submission
    }

    formData.append('Subtotal', orderData.subtotal.toString());
    formData.append('PromoCode', orderData.promoCode || '');
    formData.append('PromoDiscount', orderData.promoDiscount.toString());
    formData.append('Total', orderData.total.toString());
    formData.append('ShippingInfo', orderData.isShipping.toString());
    formData.append('Address', orderData.address || '');
    formData.append('RequestJasaDesain', orderData.requestJasaDesain ? 'Ya' : 'Tidak');
    formData.append('IsExpressPrint', orderData.isExpressPrint ? 'Ya' : 'Tidak');
    if (orderData.requestJasaDesain) {
      formData.append('JasaDesainPrice', JASA_DESAIN_PRICE.toString());
    }

    try {
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });

      // Note: With 'no-cors' mode, we can't read the response,
      // but we can assume it's successful if no error is thrown
      // Google Sheets submission completed
      return { success: true };
    } catch (fetchError) {
      console.error('Error submitting to Google Sheet:', fetchError);
      // Show a toast with error details
      throw new Error(`Error sending to Google Sheets: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('Error preparing order data:', error);
    throw new Error(`Error preparing order data: ${error.message}`);
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

    const message = `Informasi Order:
Nama: ${customerName}
Instansi/Alias: ${instansi || '-'}
Telp: ${phoneNumber}${promoMessage}${designNoteMessage}
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
    // Submitting POS order to Google Sheets
    
    // Send as POST request with JSON body to dedicated POS endpoint
    const response = await fetch(POS_GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify(posOrderData),
      mode: 'no-cors'
    });

    // Note: With 'no-cors' mode, we can't read the response,
    // but we can assume it's successful if no error is thrown
    // POS order submission completed
    return { success: true };
  } catch (error) {
    console.error('Error submitting POS order:', error);
    throw new Error(`Error sending POS order to Google Sheets: ${error.message}`);
  }
};

// Job Application Data interface
export interface JobApplicationData {
  nama: string;
  email: string;
  nomor: string;
  source: string;
  alamat: string;
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

