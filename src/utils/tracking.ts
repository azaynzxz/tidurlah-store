/**
 * Analytics and E-commerce Tracking Utilities
 * Uses Google Tag Manager dataLayer for GA4 & Ads events.
 * Safe for SSR and client-side SPA environments.
 */

import type { CartItem, OrderData, Product } from '@/types/product';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}

export interface TrafficSourceInfo {
  source: string;
  medium?: string;
  campaign?: string;
  rawText: string;
}

const TRAFFIC_STORAGE_KEY = 'tidurlah_traffic_source';

/**
 * Push an event object safely to window.dataLayer
 */
export const pushToDataLayer = (data: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
};

/**
 * Capture and store traffic source (UTM parameters or referrer) on first arrival.
 * Preserves the first-touch attribution across the session.
 */
export const initTrafficSourceCapture = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const existing = localStorage.getItem(TRAFFIC_STORAGE_KEY);
    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');

    // If new UTM source is detected or nothing is saved yet, set/update it
    if (utmSource || !existing) {
      let sourceName = utmSource || '';
      let mediumName = utmMedium || '';
      let campaignName = utmCampaign || '';

      if (!sourceName && document.referrer) {
        try {
          const refHost = new URL(document.referrer).hostname.replace('www.', '').toLowerCase();
          if (refHost.includes('google')) {
            sourceName = 'Google';
            mediumName = 'Organic';
          } else if (refHost.includes('instagram')) {
            sourceName = 'Instagram';
            mediumName = 'Social';
          } else if (refHost.includes('tiktok')) {
            sourceName = 'TikTok';
            mediumName = 'Social';
          } else if (refHost.includes('facebook') || refHost.includes('fb.')) {
            sourceName = 'Facebook';
            mediumName = 'Social';
          } else if (refHost.includes('pinterest')) {
            sourceName = 'Pinterest';
            mediumName = 'Social';
          } else if (!refHost.includes(window.location.hostname)) {
            sourceName = refHost;
            mediumName = 'Referral';
          }
        } catch {
          // invalid referrer URL, keep fallback
        }
      }

      if (!sourceName) {
        sourceName = 'Direct';
      }

      // Build readable string: e.g. "Instagram (Ads)" or "Google Organic" or "Direct"
      let rawText = sourceName;
      if (mediumName) {
        rawText += ` / ${mediumName}`;
      }
      if (campaignName) {
        rawText += ` (${campaignName})`;
      }

      const info: TrafficSourceInfo = {
        source: sourceName,
        medium: mediumName || undefined,
        campaign: campaignName || undefined,
        rawText,
      };

      localStorage.setItem(TRAFFIC_STORAGE_KEY, JSON.stringify(info));
    }
  } catch (err) {
    console.warn('Traffic source attribution storage error:', err);
  }
};

/**
 * Get current traffic source info for message and analytics payload.
 */
export const getTrafficSource = (): TrafficSourceInfo => {
  if (typeof window === 'undefined') {
    return { source: 'Direct', rawText: 'Direct' };
  }

  try {
    const stored = localStorage.getItem(TRAFFIC_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.rawText) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  return { source: 'Direct', rawText: 'Direct' };
};

/**
 * SPA Virtual Pageview Tracker for GA4 via GTM
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  pushToDataLayer({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });
};

/**
 * GA4 E-Commerce: select_item
 * Fired when a user clicks a product card on the storefront grid.
 */
export const trackSelectItem = (product: Product, index?: number): void => {
  pushToDataLayer({
    event: 'select_item',
    ecommerce: {
      item_list_id: product.category || 'all_products',
      item_list_name: product.category || 'Semua Produk',
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          index: typeof index === 'number' ? index + 1 : undefined,
        },
      ],
    },
  });
};

/**
 * GA4 E-Commerce: view_item
 * Fired when the product detail modal opens or product page loads.
 */
export const trackViewItem = (product: Product): void => {
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: 'IDR',
      value: product.price,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          item_category: product.category,
          price: product.price,
        },
      ],
    },
  });
};

/**
 * GA4 E-Commerce: add_to_cart
 * Fired when a product is successfully configured and added to cart.
 */
export const trackAddToCart = (params: {
  product: Product;
  quantity: number;
  unitPrice: number;
  modelCode?: string;
  caseVariant?: string;
  laminationVariant?: string;
}): void => {
  const { product, quantity, unitPrice, modelCode, caseVariant, laminationVariant } = params;
  const variant = [modelCode, caseVariant, laminationVariant].filter(Boolean).join(' / ') || undefined;

  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'IDR',
      value: unitPrice * quantity,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          item_category: product.category,
          item_variant: variant,
          price: unitPrice,
          quantity,
        },
      ],
    },
  });
};

/**
 * GA4 E-Commerce: purchase & checkout_wa
 * Fired when user proceeds to WhatsApp checkout.
 */
export const trackPurchase = (orderData: OrderData, trafficSource?: string): void => {
  const items = orderData.cartItems.map((item, idx) => {
    const variant = [item.modelCode, item.caseVariant, item.laminationVariant].filter(Boolean).join(' / ') || undefined;
    return {
      item_id: String(item.id),
      item_name: item.name,
      item_category: item.category,
      item_variant: variant,
      price: item.appliedPrice,
      quantity: item.quantity,
      index: idx + 1,
    };
  });

  // Standard GA4 Purchase event payload
  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: orderData.invoiceNumber,
      value: orderData.total,
      currency: 'IDR',
      tax: 0,
      shipping: orderData.isShipping ? 0 : 0,
      coupon: orderData.promoCode || undefined,
      discount: orderData.promoDiscount > 0 ? orderData.promoDiscount : undefined,
      items,
    },
    traffic_source: trafficSource || getTrafficSource().rawText,
  });

  // Alias event for easy GTM Custom Event Triggering (e.g. Meta Pixel / TikTok)
  pushToDataLayer({
    event: 'checkout_wa',
    transaction_id: orderData.invoiceNumber,
    value: orderData.total,
    currency: 'IDR',
    coupon: orderData.promoCode || '',
    items_count: orderData.cartItems.reduce((acc, i) => acc + i.quantity, 0),
    traffic_source: trafficSource || getTrafficSource().rawText,
  });
};
