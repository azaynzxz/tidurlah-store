# Pricing Calculation Gaps - Summary

This document summarizes all identified calculation gaps and potential issues in the pricing system.

## 🔴 Critical Gaps

### Gap 1: Override Prices Ignore Quantity Thresholds
**Location**: `calculateTotal()` in `cart.ts`

**Issue**: Override price promos (like HUT3TH) set a flat price per unit regardless of quantity.

**Example**:
- Product base: Rp 25,000
- Threshold (100+): Rp 17,000
- Override promo: Rp 15,000
- Buying 1 item: Rp 15,000 ✅
- Buying 100 items: Still Rp 15,000 ⚠️ (might be too cheap)

**Impact**: Potential revenue loss on bulk orders

**Recommendation**: 
- Add quantity-based override prices: `overridePrices: { 8: { default: 15000, bulk: { minQty: 100, price: 14000 } } }`
- Or add minimum quantity requirements for override promos

---

### Gap 2: Price Display Inconsistency
**Location**: Cart display in `Index.tsx`

**Issue**: Cart items show `item.appliedPrice` which doesn't reflect active promo codes.

**Current Behavior**:
- Cart shows: Rp 20,000 (threshold price)
- Promo active: Override price Rp 15,000
- User sees: Rp 20,000 in cart, but total uses Rp 15,000

**Impact**: Confusing user experience

**Recommendation**: Use `getEffectivePrice(item, promoCode)` to show correct price in cart UI

---

### Gap 3: Discount Calculation Uses Threshold Price, Not Base Price
**Location**: `calculateTotalDiscount()` in `cart.ts`

**Issue**: Discount shown compares threshold price vs override price, not base price.

**Example**:
- Base price: Rp 25,000
- Threshold price (4+): Rp 20,000
- Override price: Rp 15,000
- Discount shown: Rp 5,000 (20,000 - 15,000)
- Actual savings: Rp 10,000 (25,000 - 15,000)

**Impact**: Discount amount shown is less than actual savings

**Recommendation**: 
- Option 1: Show discount from base price (more accurate)
- Option 2: Show discount from threshold price (current behavior, but clarify in UI)

---

## 🟡 Medium Priority Gaps

### Gap 4: Percentage Discount Applied to Threshold Price
**Location**: `calculateTotal()` in `cart.ts`

**Issue**: Percentage discounts are applied AFTER threshold prices, not base prices.

**Example**:
- Base price: Rp 25,000
- Threshold (4+): Rp 20,000
- 10% promo on 5 items
- Result: (Rp 20,000 × 5) × 0.9 = Rp 90,000
- Alternative: (Rp 25,000 × 5) × 0.9 = Rp 112,500

**Impact**: Discount amount depends on quantity thresholds

**Recommendation**: Document this behavior clearly. Decide if this is intentional or should change.

---

### Gap 5: Savings Calculation Ignores Promo Codes
**Location**: `calculateSavings()` in `product.ts`

**Issue**: Savings calculation compares base price vs threshold price, ignoring promo discounts.

**Current Behavior**:
- Savings = (basePrice - appliedPrice) × quantity
- Doesn't account for promo codes

**Impact**: Savings shown might be incorrect when promo is active

**Recommendation**: Update `calculateTotalSavings()` to include promo discounts

---

### Gap 6: Discount Price vs Thresholds Priority
**Location**: `getApplicablePrice()` in `product.ts`

**Issue**: If product has both `discountPrice` and `priceThresholds`, thresholds take precedence.

**Current Behavior**:
- Thresholds checked first
- `discountPrice` only used as fallback when no thresholds apply

**Potential Gap**: Should thresholds apply to `discountPrice` or `price`?

**Recommendation**: Clarify business rule and document decision

---

## 🟢 Low Priority / Future Considerations

### Gap 7: Multiple Promo Codes
**Issue**: Only one promo code can be active at a time.

**Impact**: Cannot combine promos (e.g., 10% discount + override price)

**Recommendation**: Implement promo stacking rules or explicitly prevent stacking

---

### Gap 8: Banner/Dimensional Products
**Issue**: Banner pricing uses area calculation, but promo codes might not handle this correctly.

**Current Behavior**: 
- Banner price = `basePricePerSqm * area` (with thresholds)
- Promo codes apply to final calculated price

**Potential Gap**: Override prices for banners might need area-based calculation

**Recommendation**: Add special handling for dimensional products in promo system

---

### Gap 9: No Expiration Date Validation
**Issue**: Promo code validation doesn't check expiration dates client-side.

**Current Behavior**: Expiration dates are checked in `PromotedProducts` component for display, but not in `handlePromoCodeChange()`

**Impact**: Users might apply expired promo codes

**Recommendation**: Add expiration date checking in promo validation

---

## Testing Checklist

When modifying pricing logic, test these scenarios:

- [ ] Threshold pricing with different quantities
- [ ] Percentage promo on threshold price
- [ ] Override price promo (single item)
- [ ] Override price promo (bulk quantity)
- [ ] Promo on product with discountPrice
- [ ] Promo on product with both discountPrice and thresholds
- [ ] Multiple items in cart with different promos
- [ ] Banner products with promo codes
- [ ] Empty cart with promo code
- [ ] Invalid promo code
- [ ] Promo code with minQuantity requirement

---

## Quick Reference: Price Calculation Flow

```
1. Product added to cart
   └─> getApplicablePrice(product, quantity)
       └─> Returns threshold-adjusted price (stored as appliedPrice)

2. Promo code applied
   └─> calculateTotal(cartItems, promoCode)
       ├─> Override Price: Replace with overridePrice × quantity
       └─> Percentage: Apply discount to appliedPrice × quantity

3. Discount shown
   └─> calculateTotalDiscount(cartItems, promoCode)
       ├─> Override: (appliedPrice - overridePrice) × quantity
       └─> Percentage: appliedPrice × quantity × (discount / 100)
```

---

## Files Modified

- `src/utils/cart.ts` - Added comprehensive documentation
- `src/utils/product.ts` - Added function documentation
- `src/utils/pricing-documentation.md` - Detailed pricing system documentation
- `PRICING_GAPS.md` - This file

---

## For Future Developers / AI Agents

When working with pricing:
1. **Always check both threshold and promo logic**
2. **Test edge cases**: empty cart, invalid quantities, expired promos
3. **Consider display consistency**: Use `getEffectivePrice()` for UI
4. **Document any new pricing features** in `pricing-documentation.md`
5. **Update this gaps list** if new issues are discovered


