# Pricing System Documentation

## Overview
This document explains the pricing calculation system, potential gaps, and how to maintain it.

## Price Calculation Flow

### 1. Base Price Determination
**Function**: `getApplicablePrice(product, quantity)`

**Priority Order**:
1. If `priceThresholds` exist → Use threshold price based on quantity
2. If `discountPrice` exists → Use discount price
3. Otherwise → Use base `price`

**⚠️ POTENTIAL GAP**: If a product has both `discountPrice` and `priceThresholds`, thresholds take precedence. This might not be the intended behavior in all cases.

### 2. Cart Item Price (`appliedPrice`)
When adding to cart:
- `appliedPrice` = Result from `getApplicablePrice(product, quantity)`
- This price INCLUDES threshold discounts but EXCLUDES promo codes
- `appliedPrice` is stored in cart and recalculated when quantity changes

**⚠️ POTENTIAL GAP**: `appliedPrice` doesn't reflect promo codes. Promo codes are applied later in `calculateTotal()`.

### 3. Promo Code Application
**Function**: `calculateTotal(cartItems, promoCode)`

**Two Types of Promos**:

#### A. Percentage Discount Promos
- Applied AFTER threshold prices
- Formula: `(appliedPrice * quantity) * (1 - discount / 100)`
- Example: 10% discount on item with threshold price of Rp 20,000 = Rp 18,000

**⚠️ POTENTIAL GAP**: Percentage discount is applied to threshold price, not base price. This means:
- Base price: Rp 25,000
- Threshold price (4+ items): Rp 20,000
- With 10% promo: Rp 18,000 (not Rp 22,500 from base price)

#### B. Override Price Promos (e.g., HUT3TH)
- Completely IGNORES thresholds
- Uses flat price per unit regardless of quantity
- Formula: `overridePrice * quantity`
- Example: HUT3TH sets ID 8 to Rp 15,000 flat, even if threshold would give Rp 20,000

**⚠️ POTENTIAL GAP**: Override prices ignore quantity thresholds entirely. If someone buys 100 items, they still get the flat override price, which might be unintended.

### 4. Discount Calculation
**Function**: `calculateTotalDiscount(cartItems, promoCode)`

**For Percentage Promos**:
- Discount = `appliedPrice * quantity * (discount / 100)`
- Uses threshold price as base

**For Override Promos**:
- Discount = `(appliedPrice * quantity) - (overridePrice * quantity)`
- Compares threshold price vs override price

**⚠️ POTENTIAL GAP**: The discount shown might be misleading:
- If threshold price is Rp 20,000 and override is Rp 15,000
- Discount shown: Rp 5,000
- But base price might be Rp 25,000, so actual savings is Rp 10,000

## Identified Calculation Gaps

### Gap 1: Price Display Inconsistency
**Issue**: Cart items display `appliedPrice` which doesn't reflect active promo codes.

**Current Behavior**:
- Cart shows: Rp 20,000 (threshold price)
- Promo active: Override price Rp 15,000
- User sees: Rp 20,000 in cart, but total uses Rp 15,000

**Impact**: Confusing user experience

**Recommendation**: Use `getEffectivePrice()` to show correct price in cart when promo is active.

### Gap 2: Multiple Promo Codes
**Issue**: Only one promo code can be active at a time.

**Current Behavior**: If user enters second promo code, first one is replaced.

**Impact**: Cannot combine promos (e.g., 10% discount + override price)

**Recommendation**: Implement promo stacking rules or explicitly prevent stacking.

### Gap 3: Override Price Ignores Quantity
**Issue**: Override prices are flat regardless of quantity.

**Example**:
- Product base: Rp 25,000
- Threshold (100+): Rp 17,000
- Override promo: Rp 15,000
- Buying 1 item: Rp 15,000 (good deal)
- Buying 100 items: Still Rp 15,000 (might be too cheap)

**Impact**: Potential revenue loss on bulk orders

**Recommendation**: Consider quantity-based override prices or minimum quantity requirements.

### Gap 4: Banner/Dimensional Products
**Issue**: Banner pricing uses area calculation, but promo codes might not handle this correctly.

**Current Behavior**: 
- Banner price = `basePricePerSqm * area` (with thresholds)
- Promo codes apply to final calculated price

**Potential Gap**: Override prices for banners might need area-based calculation.

**Recommendation**: Add special handling for dimensional products in promo system.

### Gap 5: Savings Calculation
**Issue**: `calculateSavings()` compares base price vs threshold price, ignoring promo codes.

**Current Behavior**:
- Savings = `(basePrice - appliedPrice) * quantity`
- Doesn't account for promo discounts

**Impact**: Savings shown might be incorrect when promo is active.

**Recommendation**: Update savings calculation to include promo discounts.

### Gap 6: Discount Price vs Thresholds
**Issue**: If product has both `discountPrice` and `priceThresholds`, thresholds take precedence.

**Current Behavior**: Thresholds are checked first, `discountPrice` is fallback.

**Potential Gap**: Maybe `discountPrice` should be the base for threshold calculations?

**Recommendation**: Clarify business rule: Should thresholds apply to `discountPrice` or `price`?

## Testing Scenarios

### Scenario 1: Threshold + Percentage Promo
- Product: Base Rp 25,000, Threshold (4+): Rp 20,000
- Quantity: 5 items
- Promo: 10% discount
- Expected: (Rp 20,000 × 5) × 0.9 = Rp 90,000
- ✅ Current behavior matches

### Scenario 2: Threshold + Override Promo
- Product: Base Rp 25,000, Threshold (4+): Rp 20,000
- Quantity: 5 items
- Promo: Override Rp 15,000
- Expected: Rp 15,000 × 5 = Rp 75,000
- ✅ Current behavior matches

### Scenario 3: Multiple Quantities with Override
- Product: Base Rp 25,000
- Quantity: 1 item → Threshold: Rp 25,000
- Quantity: 100 items → Threshold: Rp 17,000
- Promo: Override Rp 15,000
- Expected: Both get Rp 15,000 per unit
- ⚠️ Gap: 100 items should maybe get better price?

### Scenario 4: Promo on Already Discounted Product
- Product: Base Rp 25,000, discountPrice: Rp 22,000
- Quantity: 1 item
- Promo: 10% discount
- Expected: Uses threshold/base price, not discountPrice
- ⚠️ Gap: Should promo apply to discountPrice or base price?

## Recommendations for Future Development

1. **Add Price Display Helper**: Use `getEffectivePrice()` consistently in UI
2. **Clarify Business Rules**: Document when override prices should ignore thresholds
3. **Add Validation**: Prevent override prices that are higher than threshold prices (unless intentional)
4. **Consider Promo Stacking**: Define rules for multiple promos
5. **Update Savings Calculation**: Include promo discounts in savings display
6. **Add Unit Tests**: Test all pricing scenarios
7. **Add Logging**: Log price calculations for debugging

## Code Structure

```
pricing/
├── cart.ts          # Cart operations and promo application
├── product.ts       # Base price and threshold calculations
└── pricing-documentation.md  # This file
```

## For AI Agents / Future Developers

When modifying pricing logic:
1. **Always test both threshold and promo scenarios**
2. **Check if changes affect override price calculations**
3. **Verify discount calculations match business expectations**
4. **Update this documentation if adding new pricing features**
5. **Consider edge cases**: empty cart, invalid quantities, expired promos

