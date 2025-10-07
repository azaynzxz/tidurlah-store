# Price Threshold Bug Fix

## Problem Report
Your cashier reported that price thresholds were not working correctly in the POS system.

## Root Cause Analysis

Found **TWO critical bugs** affecting price threshold calculations:

### Bug 1: Dimensional Products (Banners) Not Using Quantity-Based Price Thresholds
The `calculateBannerPrice()` utility function in `src/utils/product.ts` was NOT considering the quantity when calculating prices for dimensional products like banners.

**Example of the problem:**
- Banner product has price thresholds:
  - 1-3 units: Rp 18,000/m²
  - 4-24 units: Rp 18,000/m² (same)
  - 25-99 units: Rp 17,000/m²
  - 100+ units: Rp 16,000/m²

**Before the fix:**
- Ordering 25 banners at 2m x 1m each would cost: **18,000 × 2 × 25 = Rp 900,000**
- ❌ Price per m² stayed at Rp 18,000 regardless of quantity

**After the fix:**
- Ordering 25 banners at 2m x 1m each now costs: **17,000 × 2 × 25 = Rp 850,000**
- ✅ Price per m² correctly drops to Rp 17,000 for quantity ≥ 25

### Bug 2: Inconsistent Implementation in POSDashboard
The `POSDashboard.tsx` component had its own manual calculation for dimensional products that completely bypassed the `calculateBannerPrice()` utility function, causing further inconsistencies.

## Files Fixed

### Core Files (Both POS & Main Site)

### 1. `src/utils/product.ts`
**Changed:** Updated `calculateBannerPrice()` to accept and use quantity parameter
```typescript
// BEFORE
export const calculateBannerPrice = (product: any, width: number, height: number) => {
  const area = width * height;
  const calculatedPrice = product.basePricePerSqm * area;
  // ... no quantity consideration
}

// AFTER
export const calculateBannerPrice = (product: any, width: number, height: number, quantity: number = 1) => {
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
  // ...
}
```

### POS System Files

### 2. `src/components/pos/Cart.tsx`
**Changed:** Updated to pass quantity to `calculateBannerPrice()`
```typescript
if (product.pricingMethod === "dimensional" && options?.width && options?.height) {
  return calculateBannerPrice(product, options.width, options.height, quantity);
}
```

### 3. `src/components/pos/CartItem.tsx`
**Changed:** Updated to pass quantity to `calculateBannerPrice()`
```typescript
if (product.pricingMethod === "dimensional" && options?.width && options?.height) {
  return calculateBannerPrice(product, options.width, options.height, quantity);
}
```

### 4. `src/components/pos/POSDashboard.tsx`
**Changed:** Replaced manual calculation with proper `calculateBannerPrice()` call
```typescript
// BEFORE - Manual calculation (WRONG!)
if (product.pricingMethod === "dimensional" && options?.width && options?.height) {
  const area = options.width * options.height;
  const basePrice = product.basePricePerSqm || product.price;
  return basePrice * area; // Missing price threshold logic!
}

// AFTER - Using utility function (CORRECT!)
if (product.pricingMethod === "dimensional" && options?.width && options?.height) {
  return calculateBannerPrice(product, options.width, options.height, quantity);
}
```

### 5. `src/components/pos/POSProductModal.tsx`
**Changed:** Updated to pass quantity for real-time price display
```typescript
const calculateBannerPrice = (product: Product, width: number, height: number) => {
  return calculateBannerPriceUtil(product, width, height, quantity);
};
```

### Main Site Files

### 6. `src/pages/Index.tsx`
**Changed:** Fixed multiple price threshold issues:

1. **Removed dummy implementation** - Was completely ignoring price thresholds:
```typescript
// BEFORE - Dummy implementation (WRONG!)
const { getApplicablePrice, calculateSavings } = { 
  getApplicablePrice: (product: any, quantity: number) => product.discountPrice !== null ? product.discountPrice : product.price, 
  calculateSavings: (product: any, quantity: number) => 0 
};

// AFTER - Using real utility functions (CORRECT!)
import { getApplicablePrice, calculateSavings } from "@/utils/product";
```

2. **Updated banner price calculation** to pass quantity:
```typescript
// BEFORE
const calculatedPrice = calculateBannerPrice(product, width, height);

// AFTER
const calculatedPrice = calculateBannerPrice(product, width, height, 1);
```

3. **Banner price display in modal** already uses quantity:
```typescript
Harga: Rp {calculateBannerPrice(selectedProduct, bannerWidth, bannerHeight, modalQuantity).toLocaleString('id-ID')}
```

## Testing Recommendations

Please test the following scenarios to verify the fix:

### Test Case 1: Regular Products (ID Cards)
1. Add "Paket IDC LYD 2S" (ID: 8) to cart
2. Set quantity to 1 → Should show Rp 25,000 per unit
3. Set quantity to 4 → Should show Rp 23,000 per unit ✅
4. Set quantity to 25 → Should show Rp 20,000 per unit ✅
5. Set quantity to 100 → Should show Rp 17,000 per unit ✅

### Test Case 2: Dimensional Products (Banners)
1. Add "Banner Indoor/Outdoor" (ID: 11) to cart
2. Set dimensions to 2m × 1m (2 m²)
3. Set quantity to 1 → Should show Rp 36,000 (18,000 × 2)
4. Set quantity to 25 → Should show Rp 34,000 (17,000 × 2) ✅
5. Set quantity to 100 → Should show Rp 32,000 (16,000 × 2) ✅

### Test Case 3: Mixed Cart
1. Add multiple products with different quantities
2. Verify that subtotal and total calculations are correct
3. Change quantities and verify prices update dynamically

## Impact

✅ **Fixed:** All price threshold calculations now work correctly for all product types
✅ **Fixed:** Dimensional products (banners) now apply quantity-based discounts
✅ **Fixed:** Consistent pricing across all components (Cart, CartItem, POSDashboard, ProductModal)
✅ **Fixed:** Real-time price updates when changing quantity or dimensions

## Status
✅ All fixes applied to POS system
✅ All fixes applied to Main Site (Index.tsx)
✅ No linter errors
✅ Ready for testing

## Summary of Changes
- **6 files** updated across POS and Main Site
- **1 utility function** enhanced to support quantity-based pricing
- **5 components** updated to use proper price calculations
- Fixed both regular products and dimensional products (banners)

---
**Date Fixed:** October 7, 2025
**Fixed By:** AI Assistant

