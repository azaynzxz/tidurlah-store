import type { PromoCodeType, PromotedProductType, CaseVariant, CategoryItem } from '@/types/product';
import { CreditCard, Megaphone, Gift, Flower } from 'lucide-react';

// Valid promo codes with their discount percentage
export const validPromoCodes: Record<string, PromoCodeType> = {
  "DISCOUNT10": { discount: 10, productIds: null }, // applies to all products
  "SAVE15": { discount: 15, productIds: null },
  "PROMO20": { discount: 20, productIds: null },
  "KKN15": { discount: 15, productIds: [8], minQuantity: 7 }, // only applies to product ID 8 with minimum 7 pcs
  "IDCARD15": { discount: 15, productIds: [2] } // only applies to ID Card 2S
};

// Define promoted products with end dates
export const promotedProducts: PromotedProductType[] = [
  {
    id: 8,
    discount: 15,
    endDate: new Date('2025-09-30'),
    promoCode: "SEPTEMBERCERIA",
    minQuantity: 7,
    description: "Promo spesial untuk mahasiswa KKN! Diskon 15% untuk pembelian minimal 7 pcs. Tunjukkan ID mahasiswa saat pengambilan."
  }
];

// Add case variants
export const caseVariants: CaseVariant[] = [
  { code: "transparan", name: "Case Transparan" },
  { code: "putih", name: "Case Putih Susu" },
  { code: "hitam", name: "Case Hitam" },
  { code: "biru", name: "Case Biru" },
  { code: "merah", name: "Case Merah" },
  { code: "tanpa", name: "Tanpa Casing" },
];

// IDs that require case selection
export const idCardWithCaseIds = [1, 2, 6, 7, 8];
export const stikerWithLaminationIds = [15]; // Cutting Stiker Kontur

// Jasa Desain Price
export const JASA_DESAIN_PRICE = 25000;

// Create an array of categories with their Lucide React icons and colors for the visual display
export const categories = [
  { id: "ID Card & Lanyard", name: "ID Card", icon: CreditCard, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-gray-100", inactiveText: "text-gray-700" },
  { id: "Media Promosi", name: "Banner", icon: Megaphone, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-gray-100", inactiveText: "text-gray-700" },
  { id: "Merchandise", name: "Merchandise", icon: Gift, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-gray-100", inactiveText: "text-gray-700" },
  { id: "Papan Bunga", name: "Papan Bunga", icon: Flower, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-gray-100", inactiveText: "text-gray-700" }
];

// Product version for cache busting
export const PRODUCT_VERSION = Date.now();

// Google Sheets submission URL (for website orders)
export const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw7Ht5Ax693Wt99YC-kBQXYmzohctNRUQzuH_rLWvfySR9lM3QkBo_7emeL7T8Erkpy/exec';

// POS Google Sheets submission URL
export const POS_GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbycXaK6zr-fHedGBcGFo04C7-AndbCJ74yB45c-9gD9s_zP01Uejq5yYob09fG7-hA/exec';

// WhatsApp number
export const WHATSAPP_NUMBER = '6285172157808';
