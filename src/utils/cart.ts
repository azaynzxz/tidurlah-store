import type { Product, CartItem, PromoCodeType } from '@/types/product';
import { getApplicablePrice, calculateSavings, calculateBannerPrice } from './product';
import { validPromoCodes, idCardWithCaseIds, stikerWithLaminationIds } from '@/constants';
import { validatePromoCode as validatePromoCodeSupabase } from '@/services/products';
import { toast } from 'sonner';

// Module-level cache for Supabase-resolved promos — entries expire after PROMO_CACHE_TTL_MS
const PROMO_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const resolvedPromos: Record<string, { data: PromoCodeType; cachedAt: number }> = {};

/**
 * Get promo info for a code — checks Supabase cache first, then hardcoded constants.
 */
function getPromoInfo(code: string): PromoCodeType | undefined {
  const cached = resolvedPromos[code];
  if (cached && Date.now() - cached.cachedAt < PROMO_CACHE_TTL_MS) {
    return cached.data;
  }
  // Expired — remove stale entry
  if (cached) delete resolvedPromos[code];
  return validPromoCodes[code as keyof typeof validPromoCodes];
}

// Add to cart function
export const addToCart = (
  product: Product,
  cartItems: CartItem[],
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>,
  selectedModel: string,
  selectedCase: string,
  selectedLamination: string,
  setShowAngryCase: React.Dispatch<React.SetStateAction<boolean>>,
  setShowAngryLamination: React.Dispatch<React.SetStateAction<boolean>>,
  setShowAngryQuantity: React.Dispatch<React.SetStateAction<boolean>>,
  _sourceElement?: HTMLElement,
  quantity: number = 1
): boolean => {
  // Validate quantity first
  if (quantity <= 0) {
    setShowAngryQuantity(true);
    toast.error("Jumlah produk harus lebih dari 0!", {
      duration: 3000
    });

    // Reset angry animation after 3 seconds
    setTimeout(() => {
      setShowAngryQuantity(false);
    }, 3000);
    return false;
  }

  // Extract effective options (supports incrementing quantity on existing CartItems)
  const effectiveModel = (product as CartItem).modelCode || selectedModel;
  const effectiveCase = (product as CartItem).caseVariant || selectedCase;
  const effectiveLamination = (product as CartItem).laminationVariant || selectedLamination;

  if (product.models && product.models.length > 0 && !effectiveModel) {
    toast.error("Silakan pilih model/varian plakat terlebih dahulu.", {
      id: 'model-validation-toast',
      duration: 4000
    });
    return false;
  }
  if (idCardWithCaseIds.includes(product.id) && !effectiveCase) {
    setShowAngryCase(true);
    toast.error("Mohon pilih jenis casing terlebih dahulu!", {
      id: 'case-validation-toast',
      duration: 4000
    });

    // Scroll to case selection area to draw attention
    setTimeout(() => {
      const caseContainer = document.getElementById('case-selection-container');
      if (caseContainer) {
        caseContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);

    // Reset angry animation after 3 seconds
    setTimeout(() => {
      setShowAngryCase(false);
    }, 3000);

    return false;
  }
  if (stikerWithLaminationIds.includes(product.id) && !effectiveLamination) {
    setShowAngryLamination(true);
    toast.error("Mohon pilih jenis laminasi terlebih dahulu!", {
      id: 'lamination-validation-toast',
      duration: 4000
    });

    // Scroll to lamination selection area to draw attention
    setTimeout(() => {
      const laminationContainer = document.getElementById('lamination-selection-container');
      if (laminationContainer) {
        laminationContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);

    // Reset angry animation after 3 seconds
    setTimeout(() => {
      setShowAngryLamination(false);
    }, 3000);

    return false;
  }

  const existingItem = cartItems.find(item =>
    item.id === product.id &&
    (!(product.models && product.models.length > 0) || item.modelCode === effectiveModel) &&
    (!idCardWithCaseIds.includes(product.id) || item.caseVariant === effectiveCase) &&
    (!stikerWithLaminationIds.includes(product.id) || item.laminationVariant === effectiveLamination)
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    const newPrice = getApplicablePrice(product, newQuantity, existingItem.modelCode);

    setCartItems(
      cartItems.map(item =>
        item.id === product.id &&
          (!(product.models && product.models.length > 0) || item.modelCode === effectiveModel) &&
          (!idCardWithCaseIds.includes(product.id) || item.caseVariant === effectiveCase) &&
          (!stikerWithLaminationIds.includes(product.id) || item.laminationVariant === effectiveLamination)
          ? {
            ...item,
            quantity: newQuantity,
            appliedPrice: newPrice,
            savings: calculateSavings(product, newQuantity)
          }
          : item
      )
    );
    setTimeout(() => {
      toast.success('Berhasil ditambahkan!', {
        description: `${product.name} (+${quantity} total ${newQuantity}x)`,
        duration: 3000
      });
    }, 1200);
  } else {
    const newItem: CartItem = {
      ...product,
      quantity: quantity,
      appliedPrice: getApplicablePrice(product, quantity, effectiveModel),
      savings: calculateSavings(product, quantity, effectiveModel),
      modelCode: (product.models && product.models.length > 0) ? effectiveModel : undefined,
      caseVariant: idCardWithCaseIds.includes(product.id) ? effectiveCase : undefined,
      laminationVariant: stikerWithLaminationIds.includes(product.id) ? effectiveLamination : undefined
    };
    setCartItems([...cartItems, newItem]);
    setTimeout(() => {
      toast.success('Berhasil ditambahkan!', {
        description: `${product.name} (${quantity}x)`,
        duration: 3000
      });
    }, 1200);
  }

  return true;
};

// Add banner to cart function
export const addBannerToCart = (
  product: Product,
  width: number,
  height: number,
  cartItems: CartItem[],
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>
): boolean => {
  const calculatedPrice = calculateBannerPrice(product, width, height);
  const newItem: CartItem = {
    ...product,
    width,
    height,
    appliedPrice: calculatedPrice,
    quantity: 1,
    savings: product.price - calculatedPrice > 0 ? product.price - calculatedPrice : 0,
    isDimensionalProduct: true,
    dimensionText: `${width}m x ${height}m`,
    area: (width * height).toFixed(2) + ' m2'
  };

  setCartItems([...cartItems, newItem]);

  setTimeout(() => {
    toast.success('Berhasil ditambahkan!', {
      description: `${product.name} (${width}m x ${height}m)`,
      duration: 3000
    });
  }, 1200);

  return true;
};

/**
 * Calculate total cart price with promo code applied
 *
 * PRICING LOGIC FLOW:
 * 1. Start with item.appliedPrice (includes threshold discounts, excludes promos)
 * 2. If promo code applies:
 *    - Override Price Promos: Replace price entirely with flat override price
 *    - Percentage Promos: Apply discount to threshold price
 *
 * IMPORTANT NOTES:
 * - Override prices ignore quantity thresholds
 * - Percentage discounts are applied AFTER threshold prices
 * - item.appliedPrice is calculated in addToCart() using getApplicablePrice()
 */
export const calculateTotal = (cartItems: CartItem[], promoCode: string) => {
  return cartItems.reduce((total, item) => {
    let itemPrice = item.appliedPrice * item.quantity;

    if (promoCode && getPromoInfo(promoCode)) {
      const promoInfo = getPromoInfo(promoCode)!;
      const productMatches = promoInfo.productIds === null || promoInfo.productIds.includes(item.id);
      const quantityMatches = !promoInfo.minQuantity || item.quantity >= promoInfo.minQuantity;

      if (productMatches && quantityMatches) {
        if (promoInfo.overridePrices && promoInfo.overridePrices[item.id] !== undefined) {
          itemPrice = promoInfo.overridePrices[item.id] * item.quantity;
        } else {
          itemPrice = itemPrice * (1 - promoInfo.discount / 100);
        }
      }
    }
    return total + itemPrice;
  }, 0);
};

// Calculate total savings
export const calculateTotalSavings = (cartItems: CartItem[]) => {
  return cartItems.reduce((total, item) => {
    return total + item.savings;
  }, 0);
};

/**
 * Calculate total discount amount from promo code
 *
 * DISCOUNT CALCULATION:
 * - Override Promos: Discount = (threshold price - override price) * quantity
 * - Percentage Promos: Discount = threshold price * quantity * (discount %)
 */
export const calculateTotalDiscount = (cartItems: CartItem[], promoCode: string) => {
  if (!promoCode || !getPromoInfo(promoCode)) return 0;

  const promoInfo = getPromoInfo(promoCode)!;
  return cartItems.reduce((discount, item) => {
    const productMatches = promoInfo.productIds === null || promoInfo.productIds.includes(item.id);
    const quantityMatches = !promoInfo.minQuantity || item.quantity >= promoInfo.minQuantity;

    if (productMatches && quantityMatches) {
      if (promoInfo.overridePrices && promoInfo.overridePrices[item.id] !== undefined) {
        const originalPrice = item.appliedPrice * item.quantity;
        const overridePrice = promoInfo.overridePrices[item.id] * item.quantity;
        return discount + (originalPrice - overridePrice);
      } else {
        return discount + (item.appliedPrice * item.quantity * (promoInfo.discount / 100));
      }
    }
    return discount;
  }, 0);
};

/**
 * Validate and apply promo code to cart
 *
 * VALIDATION FLOW:
 * 1. Try Supabase validation first (populates module-level cache with TTL)
 * 2. If promo code exists (Supabase or hardcoded):
 *    a. Check product eligibility — verify at least one matching product in cart
 *    b. Check minimum quantity requirement
 *    c. Apply promo if all checks pass
 *
 * LIMITATIONS:
 * - Only ONE promo code can be active at a time
 * - Promos validated via Supabase are cached for 5 minutes
 */
export const handlePromoCodeChange = async (
  code: string,
  cartItems: CartItem[],
  setPromoCode: React.Dispatch<React.SetStateAction<string>>,
  setPromoCodeError: React.Dispatch<React.SetStateAction<string>>,
  setPromoDiscount: React.Dispatch<React.SetStateAction<number>>
) => {
  setPromoCode(code);
  setPromoCodeError("");

  // Clear promo if empty code
  if (!code) {
    setPromoDiscount(0);
    return;
  }

  // Try Supabase first — populate module cache
  try {
    const sbPromo = await validatePromoCodeSupabase(code);
    if (sbPromo) {
      resolvedPromos[code] = {
        data: {
          discount: sbPromo.discount,
          productIds: sbPromo.productIds,
          minQuantity: sbPromo.minQuantity,
          overridePrices: sbPromo.overridePrices,
        },
        cachedAt: Date.now(),
      };
    }
  } catch (err) {
    console.warn('[Promo] Supabase validation failed, falling back to hardcoded:', err);
  }

  const promo = getPromoInfo(code);
  if (promo) {
    if (promo.productIds && Array.isArray(promo.productIds)) {
      const matchingCartItem = cartItems.find(item => promo.productIds!.includes(item.id));
      if (!matchingCartItem) {
        setPromoDiscount(0);
        setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
        return;
      }
      if (promo.minQuantity && matchingCartItem.quantity < promo.minQuantity) {
        setPromoDiscount(0);
        setPromoCodeError(`Kode promo memerlukan minimal ${promo.minQuantity} pcs pada produk yang dipilih.`);
        return;
      }
    }

    const appliesToAny = cartItems.some(item => {
      const productMatches = promo.productIds === null || promo.productIds.includes(item.id);
      const quantityMatches = !promo.minQuantity || item.quantity >= promo.minQuantity;
      return productMatches && quantityMatches;
    });

    if (appliesToAny) {
      setPromoDiscount(promo.discount);
      if (promo.discount > 0) {
        toast.success(`Promo code ${code} applied! ${promo.discount}% discount`);
      } else {
        toast.success(`Kode promo ${code} berhasil diterapkan!`);
      }
    } else {
      setPromoDiscount(0);
      setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
    }
  } else {
    setPromoDiscount(0);
    setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
  }
};
