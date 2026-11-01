import type { Product } from '@/types/product';

export const convertImageToBase64 = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for external URLs to prevent CORS issues on same-origin files (like Cloudflare Pages)
    if (src.startsWith('http') && !src.includes(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to get canvas context'));
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
};

// Generate URL-friendly slug from product name
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

/**
 * Calculate price per unit based on quantity thresholds
 *
 * PRICE DETERMINATION PRIORITY:
 * 1. If priceThresholds exist -> Find applicable threshold based on quantity
 * 2. If discountPrice exists -> Use discountPrice
 * 3. Otherwise -> Use base price
 *
 * IMPORTANT NOTES:
 * - This function does NOT apply promo codes (handled in calculateTotal)
 * - Thresholds are checked in descending order (highest minQuantity first)
 * - If product has both discountPrice and priceThresholds, thresholds take precedence
 */
export const getApplicablePrice = (product: any, quantity: number, selectedModel?: string) => {
  // Check for model-specific price first
  if (selectedModel && product.models) {
    const model = product.models.find((m: any) => m.code === selectedModel);
    if (model && model.price) {
      return model.price;
    }
  }

  // No thresholds: use discountPrice if available, otherwise base price
  if (!product.priceThresholds) {
    return product.discountPrice !== null ? product.discountPrice : product.price;
  }

  // Sort thresholds descending by minQuantity to check highest thresholds first
  const sortedThresholds = [...product.priceThresholds].sort((a, b) => b.minQuantity - a.minQuantity);

  // Find the first (highest) threshold that applies to this quantity
  for (const threshold of sortedThresholds) {
    if (quantity >= threshold.minQuantity) {
      return threshold.price;
    }
  }

  // No threshold applies: use discountPrice if available, otherwise base price
  return product.discountPrice !== null ? product.discountPrice : product.price;
};

/**
 * Calculate total savings from threshold discounts
 *
 * SAVINGS CALCULATION:
 * Savings = (Base Price - Threshold Price) * Quantity
 *
 * IMPORTANT NOTES:
 * - Compares base price vs threshold price
 * - Does NOT account for promo code discounts
 * - Does NOT account for discountPrice field
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
  if (!width || !height || width < product.minWidth || height < product.minHeight) {
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

  const finalPrice = Math.max(calculatedPrice, product.discountPrice || product.price);
  return finalPrice;
};
