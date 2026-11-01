import type { OrderData } from '@/types/product';
import { JASA_DESAIN_PRICE, JASA_EXPRESS_PRICE, LOKER_GOOGLE_SHEETS_URL } from '@/constants';
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
  cabang?: string;
}

// Website order submission — creates order in Supabase directly
export const submitWebsiteOrder = async (orderData: OrderData) => {
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
        productId: 200,
        name: 'Jasa Desain',
        quantity: 1,
        price: JASA_DESAIN_PRICE,
        subtotal: JASA_DESAIN_PRICE,
      }] : []),
      ...(orderData.isExpressPrint ? [{
        productId: 2001,
        name: 'Cetak Express',
        quantity: 1,
        price: JASA_EXPRESS_PRICE,
        subtotal: JASA_EXPRESS_PRICE,
      }] : []),
    ];

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

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

    return { success: true, invoiceNumber: sbResult.invoiceNumber || orderData.invoiceNumber };
  } catch (error: unknown) {
    console.error('Error submitting website order:', error);
    throw new Error(`Failed to submit order to database: ${error instanceof Error ? error.message : String(error)}`);
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

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    let supabaseInvoice: string | null = null;
    const isEditMode = !!(posOrderData as POSOrderData & { isEdit?: boolean }).isEdit;

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
        cabang: posOrderData.cabang || '',
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
        cabang: posOrderData.cabang || '',
      });
      supabaseInvoice = sbResult.invoiceNumber;
    }

    return { success: true, invoiceNumber: supabaseInvoice };
  } catch (error: unknown) {
    console.error('Error submitting POS order:', error);
    throw new Error(`Failed to submit POS order: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Fetch order history from Supabase
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
  cabang?: string | null;
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
  options: { limit?: number; offset?: number; channel?: string; cashier?: string; search?: string } = {}
): Promise<{ success: boolean; orders: OrderHistoryItem[]; total: number; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, orders: [], total: 0, error: 'Supabase is not configured' };
  }

  try {
    const result = await fetchOrders({
      limit: options.limit,
      offset: options.offset,
      channel: options.channel,
      cashier: options.cashier,
      search: options.search,
    });
    
    if (result?.success) {
      const normalizedOrders = (result.orders || []).map((o: any) => ({
        ...o,
        cabang: o.cabang || "Cabang Belwis"
      })) as unknown as OrderHistoryItem[];

      return {
        success: true,
        orders: normalizedOrders,
        total: result.total,
      };
    }
    
    return {
      success: false,
      orders: [],
      total: 0,
      error: result?.error || 'Failed to fetch orders from database'
    };
  } catch (err: unknown) {
    console.error('[fetchOrderHistory] Supabase read failed:', err);
    return {
      success: false,
      orders: [],
      total: 0,
      error: err instanceof Error ? err.message : String(err)
    };
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

export const submitJobApplication = async (
  applicationData: JobApplicationData,
  onProgress?: ProgressCallback
): Promise<{ success: boolean }> => {
  try {
    if (!applicationData.cv) {
      throw new Error('CV/Resume wajib diupload');
    }

    // Start smooth progress bar animation
    let currentProgress = 0;
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    const startProgress = () => {
      progressInterval = setInterval(() => {
        if (onProgress && currentProgress < 85) {
          let increment = 0.5;
          if (currentProgress >= 20 && currentProgress < 60) increment = 1.0;
          else if (currentProgress >= 60 && currentProgress < 85) increment = 0.8;
          
          currentProgress = Math.min(currentProgress + increment, 85);
          onProgress(Math.round(currentProgress), 'Mengunggah berkas lamaran...');
        }
      }, 80);
    };

    startProgress();

    // Mirror application to Supabase when available (non-blocking)
    try {
      await submitApplicationToSupabase({
        fullName: applicationData.nama,
        email: applicationData.email,
        phone: applicationData.nomor,
        position: applicationData.posisi,
        infoSource: applicationData.source,
        address: applicationData.alamat,
        cv: applicationData.cv || undefined,
        portfolio: applicationData.portfolio || undefined,
      });
    } catch (e) {
      console.warn('[JobApplication] Supabase mirror skipped:', e);
    }

    // Convert files to base64
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = error => reject(error);
      });
    };

    const cvBase64 = await fileToBase64(applicationData.cv);
    let portfolioBase64 = '';
    
    if (applicationData.portfolio) {
      portfolioBase64 = await fileToBase64(applicationData.portfolio);
    }

    // Prepare payload for Google Apps Script
    const payload = {
      nama: applicationData.nama,
      email: applicationData.email,
      nomor: applicationData.nomor,
      source: applicationData.source || '',
      alamat: applicationData.alamat || '',
      posisi: applicationData.posisi || '',
      cvBase64: cvBase64,
      cvMimeType: applicationData.cv.type,
      cvFileName: applicationData.cv.name,
      fileBase64: portfolioBase64,
      fileMimeType: applicationData.portfolio?.type || '',
      fileName: applicationData.portfolio?.name || ''
    };

    // Submit to Google Apps Script
    const response = await fetch(LOKER_GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (result.status !== 'success') {
       throw new Error(result.message || 'Unknown error from Apps Script');
    }

    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    // Smooth finish to 100%
    if (onProgress) {
      const finishProgress = () => {
        if (currentProgress < 100) {
          currentProgress = Math.min(currentProgress + 2, 100);
          onProgress(Math.round(currentProgress), 'Selesai mengirim lamaran!');
          if (currentProgress < 100) {
            setTimeout(finishProgress, 30);
          }
        }
      };
      finishProgress();
    }

    // Wait slightly to show 100% completion in UI
    await new Promise(resolve => setTimeout(resolve, 600));

    return { success: true };
  } catch (error: unknown) {
    console.error('Error submitting job application:', error);
    const fetchMsg = error instanceof Error ? error.message : String(error);
    if (fetchMsg.includes('403') || fetchMsg.includes('Forbidden')) {
      throw new Error('Akses ditolak. Pastikan Google Apps Script sudah di-deploy dengan pengaturan "Who has access: Anyone"');
    }
    if (fetchMsg.includes('Failed to fetch') || fetchMsg.includes('NetworkError')) {
      throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda atau URL API.');
    }
    throw new Error(`Gagal mengirim lamaran: ${fetchMsg || 'Terjadi kesalahan tidak diketahui'}`);
  }
};
