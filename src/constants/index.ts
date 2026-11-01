import type { PromoCodeType, CaseVariant } from '@/types/product';

// Valid promo codes with their discount percentage (fallback when Supabase is unavailable)
export const validPromoCodes: Record<string, PromoCodeType> = {
  "DISCOUNT10": { discount: 10, productIds: null },
  "SAVE15": { discount: 15, productIds: null },
  "PROMO20": { discount: 20, productIds: null },
  "KKN15": { discount: 15, productIds: [8], minQuantity: 7 },
  "IDCARD15": { discount: 15, productIds: [2] },
};

// Case variants
export const caseVariants: CaseVariant[] = [
  { code: "transparan", name: "Case Transparan" },
  { code: "putih", name: "Case Putih Susu" },
  { code: "hitam", name: "Case Hitam" },
  { code: "biru", name: "Case Biru" },
  { code: "merah", name: "Case Merah" },
  { code: "tanpa", name: "Tanpa Casing" },
];

// Lamination variants
export const laminationVariants = [
  { code: "glossy", name: "Glossy" },
  { code: "doff", name: "Doff" },
];

// IDs that require variant selection
export const idCardWithCaseIds = [1, 2, 6, 7, 8, 24];
export const stikerWithLaminationIds = [15];

// Service add-on prices
export const JASA_DESAIN_PRICE = 25000;
export const JASA_EXPRESS_PRICE = 25000;

// Job application Google Apps Script webhook URL
export const LOKER_GOOGLE_SHEETS_URL =
  import.meta.env.VITE_LOKER_WEBHOOK_URL ||
  'https://script.google.com/macros/s/AKfycbzSaagXuJc7nLHya80XHnbnA7afnvBKJHYiaTXnPM8zlKxqF4NIDfHb6Ju2m71PCvF6/exec';

// WhatsApp number
export const WHATSAPP_NUMBER = '6285172157808';
