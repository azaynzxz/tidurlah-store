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

// Generate shareable URL for product
export const generateProductUrl = (product: any) => {
  const slug = generateProductSlug(product.name);
  const baseUrl = window.location.origin;
  return `${baseUrl}/product/${slug}`;
};

// Calculate appropriate price based on quantity and thresholds
export const getApplicablePrice = (product: any, quantity: number) => {
  if (!product.priceThresholds) {
    return product.discountPrice !== null ? product.discountPrice : product.price;
  }

  // Sort thresholds in descending order by minQuantity
  const sortedThresholds = [...product.priceThresholds].sort((a, b) => b.minQuantity - a.minQuantity);

  // Find the first threshold that applies
  for (const threshold of sortedThresholds) {
    if (quantity >= threshold.minQuantity) {
      return threshold.price;
    }
  }

  // If no threshold applies, use the default price
  return product.discountPrice !== null ? product.discountPrice : product.price;
};

// Calculate savings compared to base price
export const calculateSavings = (product: any, quantity: number) => {
  const basePrice = product.price;
  const appliedPrice = getApplicablePrice(product, quantity);

  return (basePrice - appliedPrice) * quantity;
};

// Calculate banner price based on dimensions
export const calculateBannerPrice = (product: any, width: number, height: number) => {
  // Calculate banner price based on dimensions

  if (!width || !height || width < product.minWidth || height < product.minHeight) {
    // Using base price due to invalid dimensions
    return product.discountPrice || product.price;
  }

  const area = width * height;
  const calculatedPrice = product.basePricePerSqm * area;

  // Calculate area-based pricing

  // Use the calculated price if it's greater than base price, otherwise use base price
  const finalPrice = Math.max(calculatedPrice, product.discountPrice || product.price);
  // Return calculated final price
  return finalPrice;
};
