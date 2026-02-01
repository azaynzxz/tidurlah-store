import type { Product, CartItem } from '@/types/product';

// Convert image to base64 for html2canvas compatibility
export const convertImageToBase64 = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
};

// Generate URL-friendly slug from product namenp
export const generateProductSlug = (productName: string) => {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim(); // Remove leading/trailing spaces
};

// Find product by slug
export const findProductBySlug = (slug: string, products: any): Product | undefined => {
  const allProducts: Product[] = Object.values(products).flat() as Product[];
  return allProducts.find((product) => generateProductSlug(product.name) === slug);
};

// Generate shareable URL for product
export const generateProductUrl = (product: any) => {
  const slug = generateProductSlug(product.name);
  const baseUrl = window.location.origin;
  return `${baseUrl}/product/${slug}`;
};

/**
 * Calculate price per unit based on quantity thresholds
 * 
 * PRICE DETERMINATION PRIORITY:
 * 1. If priceThresholds exist → Find applicable threshold based on quantity
 * 2. If discountPrice exists → Use discountPrice
 * 3. Otherwise → Use base price
 * 
 * ⚠️ IMPORTANT NOTES:
 * - This function does NOT apply promo codes (handled in calculateTotal)
 * - Thresholds are checked in descending order (highest minQuantity first)
 * - If product has both discountPrice and priceThresholds, thresholds take precedence
 * 
 * ⚠️ POTENTIAL GAP: 
 * - discountPrice is only used as fallback when no thresholds apply
 * - Consider: Should thresholds apply to discountPrice or base price?
 * 
 * @param product - Product object with price, discountPrice, and priceThresholds
 * @param quantity - Quantity being purchased
 * @returns Price per unit after threshold application
 * 
 * @example
 * Product: Base Rp 25,000, Thresholds: [{minQuantity: 4, price: 20,000}, {minQuantity: 25, price: 18,000}]
 * Quantity 1 → Rp 25,000 (no threshold)
 * Quantity 5 → Rp 20,000 (4+ threshold)
 * Quantity 30 → Rp 18,000 (25+ threshold)
 */
export const getApplicablePrice = (product: any, quantity: number, selectedModel?: string) => {
  // Check for model-specific price first
  if (selectedModel && product.models) {
    const model = product.models.find((m: any) => m.code === selectedModel);
    if (model && model.price) {
      // If model has a specific price, use it as the base price.
      // NOTE: Current logic assumes no quantity thresholds for model-specific prices yet,
      // but this could be expanded if needed. For now, flat model price.
      return model.price;
    }
  }

  // No thresholds: use discountPrice if available, otherwise base price
  if (!product.priceThresholds) {
    return product.discountPrice !== null ? product.discountPrice : product.price;
  }

  // Sort thresholds descending by minQuantity to check highest thresholds first
  // This ensures we get the best price for the quantity
  const sortedThresholds = [...product.priceThresholds].sort((a, b) => b.minQuantity - a.minQuantity);

  // Find the first (highest) threshold that applies to this quantity
  for (const threshold of sortedThresholds) {
    if (quantity >= threshold.minQuantity) {
      return threshold.price;
    }
  }

  // No threshold applies: use discountPrice if available, otherwise base price
  // ⚠️ GAP: discountPrice is fallback, but maybe it should be the base for thresholds?
  return product.discountPrice !== null ? product.discountPrice : product.price;
};

/**
 * Calculate total savings from threshold discounts
 * 
 * SAVINGS CALCULATION:
 * Savings = (Base Price - Threshold Price) × Quantity
 * 
 * ⚠️ IMPORTANT NOTES:
 * - Compares base price vs threshold price
 * - Does NOT account for promo code discounts
 * - Does NOT account for discountPrice field
 * 
 * ⚠️ POTENTIAL GAP:
 * - Savings shown might be incorrect when promo codes are active
 * - Should savings compare to discountPrice if it exists?
 * 
 * @param product - Product object
 * @param quantity - Quantity purchased
 * @returns Total savings amount in Rupiah
 * 
 * @example
 * Base: Rp 25,000, Threshold (4+): Rp 20,000, Quantity: 5
 * Savings = (25,000 - 20,000) × 5 = Rp 25,000
 */
export const calculateSavings = (product: any, quantity: number, selectedModel?: string) => {
  let basePrice = product.price;

  // If model is selected and has a specific price, use that as base price
  if (selectedModel && product.models) {
    const model = product.models.find((m: any) => m.code === selectedModel);
    if (model && model.price) {
      basePrice = model.price;
    }
  }

  const appliedPrice = getApplicablePrice(product, quantity, selectedModel);

  return (basePrice - appliedPrice) * quantity;
};

// Calculate banner price based on dimensions and quantity
export const calculateBannerPrice = (product: any, width: number, height: number, quantity: number = 1) => {
  // Calculate banner price based on dimensions

  if (!width || !height || width < product.minWidth || height < product.minHeight) {
    // Using base price due to invalid dimensions
    return product.discountPrice || product.price;
  }

  const area = width * height;

  // Apply price thresholds to basePricePerSqm based on quantity
  let basePricePerSqm = product.basePricePerSqm || product.price;

  if (product.priceThresholds && product.priceThresholds.length > 0) {
    const applicableThreshold = product.priceThresholds
      .slice()
      .reverse()
      .find((threshold: any) => quantity >= threshold.minQuantity);

    if (applicableThreshold) {
      basePricePerSqm = applicableThreshold.price;
    }
  }

  const calculatedPrice = basePricePerSqm * area;

  // Calculate area-based pricing with quantity-adjusted price

  // Use the calculated price if it's greater than base price, otherwise use base price
  const finalPrice = Math.max(calculatedPrice, product.discountPrice || product.price);
  // Return calculated final price
  return finalPrice;
};
