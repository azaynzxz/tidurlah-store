import type { OrderData, CartItem, CaseVariant } from '@/types/product';
import { JASA_DESAIN_PRICE, POS_GOOGLE_SHEETS_URL, LOKER_GOOGLE_SHEETS_URL, WHATSAPP_NUMBER } from '@/constants';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createOrder, fetchOrders, editOrder } from '@/services/orders';
import { submitApplicationToSupabase } from '@/services/applications';

// POS Order Data interface
export interface POSOrderData {
  receiptId: string;
  cashier: string;
  cashierUserId?: string;
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
      ...orderData.cartItems.map((item) => ({
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

    // ── Dual-write: Supabase primary, Google Sheets backup ──
    let supabaseInvoice: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const sbResult = await createOrder({
          orderId: orderData.invoiceNumber,
          channel: 'website',
          cashier: 'Website',
          customerName: orderData.customerName,
          customerPhone: orderData.phoneNumber,
          institution: orderData.instansi || '',
          items: items.map(i => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            subtotal: i.subtotal,
            modelCode: i.modelCode || '',
            caseVariant: i.caseVariant || '',
            lamination: i.laminationVariant || '',
            width: i.width,
            height: i.height,
            dimensionText: i.dimensionText || '',
            area: i.area || '',
          })),
          subtotal: orderData.subtotal,
          discount: 0,
          total: orderData.total,
          promoCode: orderData.promoCode || '',
          promoDiscount: orderData.promoDiscount || 0,
          designNote: orderData.designNote || '',
          isShipping: orderData.isShipping || false,
          address: orderData.address || '',
          deadline: orderData.deadline || '',
          hasJasaDesain: orderData.requestJasaDesain || false,
        });
        supabaseInvoice = sbResult.invoiceNumber;
      } catch (err) {
        console.warn('[api] Supabase write failed, falling back to Sheets only:', err);
      }
    }

    // Always write to Google Sheets (backup during transition)
    await fetch(POS_GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify(normalizedData),
      mode: 'no-cors'
    });

    return { success: true, invoiceNumber: supabaseInvoice || orderData.invoiceNumber };
  } catch (error: unknown) {
    console.error('Error submitting website order:', error);
    throw new Error(`Error sending to Google Sheets: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// WhatsApp redirection function
export const handleWhatsAppRedirect = async (
  orderData: OrderData,
  cartItems: CartItem[],
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
  calculateTotal: (cartItems: CartItem[], promoCode: string) => number,
  calculateTotalSavings: (cartItems: CartItem[]) => number,
  caseVariants: CaseVariant[]
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
    // Detect if order contains Jasa Desain (product ID 200) or Express (product ID 2001)
    const hasJasaDesain = posOrderData.items?.some(
      item => item.productId === 200 || item.name?.toLowerCase().includes('jasa desain')
    );
    const hasExpressPrint = posOrderData.items?.some(
      item => item.productId === 2001 || item.name?.toLowerCase().includes('jasa express') || item.name?.toLowerCase().includes('cetak express')
    );

    // Add channel identifier and service flags for POS orders
    const dataWithChannel = {
      ...posOrderData,
      channel: 'pos',
      requestJasaDesain: hasJasaDesain || false,
      isExpressPrint: hasExpressPrint || false,
    };

    // ── Dual-write: Supabase primary, Google Sheets backup ──
    let supabaseInvoice: string | null = null;
    const isEditMode = !!(posOrderData as POSOrderData & { isEdit?: boolean }).isEdit;

    if (isSupabaseConfigured()) {
      try {
        if (isEditMode) {
          const itemRows = (posOrderData.items || []).map(i => ({
            order_id: posOrderData.receiptId,
            product_id: i.productId || undefined,
            product_name: i.name,
            quantity: i.quantity,
            unit_price: i.price,
            subtotal: i.subtotal,
            model_code: i.modelCode || '',
            case_variant: i.caseVariant || '',
            lamination: i.laminationVariant || '',
            width: i.width || undefined,
            height: i.height || undefined,
            dimension_text: i.dimensionText || '',
            area: i.area || '',
          }));
          await editOrder({
            orderId: posOrderData.receiptId,
            customerName: posOrderData.customerName || '',
            customerPhone: posOrderData.phoneNumber || '',
            institution: posOrderData.institution || '',
            items: itemRows,
            subtotal: posOrderData.subtotal,
            discount: posOrderData.discount,
            total: posOrderData.total,
            downPayment: posOrderData.downPayment || 0,
            remainingBalance: posOrderData.remainingBalance ?? posOrderData.total,
            deadline: posOrderData.deadline || '',
          });
          supabaseInvoice = posOrderData.receiptId;
        } else {
          const sbResult = await createOrder({
            orderId: posOrderData.receiptId,
            channel: 'pos',
            cashier: posOrderData.cashier || '',
            cashierUserId: posOrderData.cashierUserId,
            customerName: posOrderData.customerName || '',
            customerPhone: posOrderData.phoneNumber || '',
            institution: posOrderData.institution || '',
            items: (posOrderData.items || []).map(i => ({
              productId: i.productId,
              name: i.name,
              quantity: i.quantity,
              price: i.price,
              subtotal: i.subtotal,
              modelCode: i.modelCode || '',
              caseVariant: i.caseVariant || '',
              lamination: i.laminationVariant || '',
              width: i.width,
              height: i.height,
              dimensionText: i.dimensionText || '',
              area: i.area || '',
            })),
            subtotal: posOrderData.subtotal,
            discount: posOrderData.discount,
            total: posOrderData.total,
            downPayment: posOrderData.downPayment || 0,
            remainingBalance: posOrderData.remainingBalance ?? posOrderData.total,
            paymentMethod: posOrderData.paymentMethod || 'Cash',
            promoCode: (dataWithChannel as Record<string, unknown>).promoCode as string || '',
            promoDiscount: (dataWithChannel as Record<string, unknown>).promoDiscount as number || 0,
            designNote: (dataWithChannel as Record<string, unknown>).designNote as string || '',
            isShipping: !!posOrderData.delivery,
            address: posOrderData.delivery?.address || '',
            deadline: posOrderData.deadline || '',
            hasJasaDesain: hasJasaDesain || false,
            delivery: posOrderData.delivery,
          });
          supabaseInvoice = sbResult.invoiceNumber;
        }
      } catch (err) {
        console.warn('[api] POS Supabase write failed, falling back to Sheets only:', err);
      }
    }

    // Always write to Google Sheets (backup during transition)
    const response = await fetch(POS_GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify(dataWithChannel),
      mode: 'no-cors'
    });

    return { success: true, invoiceNumber: supabaseInvoice };
  } catch (error: unknown) {
    console.error('Error submitting POS order:', error);
    throw new Error(`Error sending POS order to Google Sheets: ${error instanceof Error ? error.message : String(error)}`);
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
  designer?: string | null;
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
  delivery?: {
    recipientName: string;
    recipientPhone: string;
    address: string;
    shippingCost: number;
    status: string;
  } | null;
}

export const fetchOrderHistory = async (
  options: { limit?: number; offset?: number; channel?: string; cashier?: string } = {}
): Promise<{ success: boolean; orders: OrderHistoryItem[]; total: number; error?: string }> => {
  // Supabase is the primary data source (all historical data has been migrated)
  if (isSupabaseConfigured()) {
    try {
      const result = await fetchOrders({
        limit: options.limit,
        offset: options.offset,
        channel: options.channel,
        cashier: options.cashier,
      });
      if (result?.success) {
        return {
          success: true,
          orders: result.orders as unknown as OrderHistoryItem[],
          total: result.total,
        };
      }
    } catch (err) {
      console.warn('[fetchOrderHistory] Supabase read failed, falling back to Google Sheets:', err);
    }
  }

  // Fallback to Google Sheets (if Supabase is down or not configured)
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, orders: [], total: 0, error: msg };
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

    // --- Supabase dual-write (non-blocking) ---
    try {
      submitApplicationToSupabase({
        fullName: applicationData.nama,
        email: applicationData.email,
        phone: applicationData.nomor,
        position: applicationData.posisi || '',
        infoSource: applicationData.source || '',
        address: applicationData.alamat || '',
        cv: applicationData.cv || undefined,
        portfolio: applicationData.portfolio || undefined,
      }).catch(err => console.error('[Applications] Supabase submit failed:', err));
    } catch {
      // Non-critical — continue with Google Sheets
    }

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
    const payload: Record<string, string> = {
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
    } catch (fetchError: unknown) {
      console.error('Fetch error:', fetchError);

      const fetchMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);

      // Check for specific error types
      if (fetchMsg.includes('403') || fetchMsg.includes('Forbidden')) {
        throw new Error('Akses ditolak. Pastikan Google Apps Script sudah di-deploy dengan pengaturan "Who has access: Anyone"');
      }

      if (fetchMsg.includes('Failed to fetch') || fetchMsg.includes('NetworkError')) {
        throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda atau URL API.');
      }

      throw new Error(`Gagal mengirim lamaran: ${fetchMsg || 'Terjadi kesalahan tidak diketahui'}`);
    }
  } catch (error: unknown) {
    console.error('Error submitting job application:', error);
    throw error; // Re-throw to preserve the error message
  }
};

// Replace the plain JSON cache pattern with a TTL-aware wrapper:
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data as T;
  } catch { return null; }
}

function writeCache(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

