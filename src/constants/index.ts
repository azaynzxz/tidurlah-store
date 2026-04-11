import type { PromoCodeType, PromotedProductType, CaseVariant, CategoryItem } from '@/types/product';
import { CreditCard, Megaphone, Gift, Flower } from 'lucide-react';
import * as React from 'react';

// Valid promo codes with their discount percentage
export const validPromoCodes: Record<string, PromoCodeType> = {
  "DISCOUNT10": { discount: 10, productIds: null }, // applies to all products
  "SAVE15": { discount: 15, productIds: null },
  "PROMO20": { discount: 20, productIds: null },
  "KKN15": { discount: 15, productIds: [8], minQuantity: 7 }, // only applies to product ID 8 with minimum 7 pcs
  "IDCARD15": { discount: 15, productIds: [2] }, // only applies to ID Card 2S
  "HUT3TH": {
    discount: 0,
    productIds: [8, 7],
    overridePrices: {
      8: 15000,
      7: 13000
    }
  }
};

// Promo Banner Configuration
/**
 * Controls the visibility of the promo banner across the entire application.
 * 
 * @description
 * Set this to `false` to completely disable the promo banner. When disabled:
 * - The banner will not render at all
 * - The header will position itself at the top (no banner offset)
 * - All banner-related logic will be skipped
 * 
 * Set this to `true` to enable the banner. The banner will then check:
 * - If the current date is within the promo period (Nov 20-25, 2025)
 * - If the user has dismissed it (stored in localStorage)
 * 
 * @example
 * // To disable the banner:
 * export const PROMO_BANNER_ENABLED = false;
 * 
 * // To enable the banner:
 * export const PROMO_BANNER_ENABLED = true;
 * 
 * @default true
 */
export const PROMO_BANNER_ENABLED = false;

// Define promoted products with end dates

// Promoted products — managed via Supabase admin panel. Keep empty when no active campaign.
export const promotedProducts: PromotedProductType[] = [];

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
  { id: "ID Card & Lanyard", name: "ID Card", icon: CreditCard, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-muted", inactiveText: "text-foreground" },
  { id: "Media Promosi", name: "Banner", icon: Megaphone, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-muted", inactiveText: "text-foreground" },
  { id: "Merchandise", name: "Merch", icon: Gift, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-muted", inactiveText: "text-foreground" },
  { id: "Papan Bunga", name: "Papan Bunga", icon: Flower, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-muted", inactiveText: "text-foreground", tooltip: "Dikelola oleh @papan_idcraft" },
  { id: "Apparel", name: "Apparel", icon: (props: any) => React.createElement('span', { className: `material-symbols-outlined ${props.className || ''}` }, 'apparel'), color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-muted", inactiveText: "text-foreground" }
];

// Product version for cache busting — use a stable version string (bump manually on product data changes)
export const PRODUCT_VERSION = '2025.1';

// @deprecated — Google Sheets dual-write. Will be removed after Supabase migration is verified.
export const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw0cpwKU0n3iS-HK9uRUlhkwZUUCRPGnPYI512cch3G8wIi06WzvvYw0UWiqXtWXQZIvg/exec';

// @deprecated — Google Sheets dual-write. Will be removed after Supabase migration is verified.
export const POS_GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw0cpwKU0n3iS-HK9uRUlhkwZUUCRPGnPYI512cch3G8wIi06WzvvYw0UWiqXtWXQZIvg/exec';

// @deprecated — Google Sheets dual-write. Will be removed after Supabase migration is verified.
export const LOKER_GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzuEkPrBkPbhKZDwD5AtnNdx-_oxiElFcNP5LfKNdmu7AzMBeGcwqXwuoRenSHNRq0u/exec';

// WhatsApp number
export const WHATSAPP_NUMBER = '6285172157808';
