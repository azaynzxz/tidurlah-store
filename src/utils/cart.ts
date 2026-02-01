import type { Product, CartItem, PromoCodeType } from '@/types/product';
import { getApplicablePrice, calculateSavings, calculateBannerPrice } from './product';
import { validPromoCodes, idCardWithCaseIds, stikerWithLaminationIds, caseVariants } from '@/constants';
import { toast } from 'sonner';

export interface FlyingBubble {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Trigger flying animation bubble effect when item is added to cart
 * 
 * ⚠️ IMPORTANT: This function requires setFlyingBubbles to be passed from the component.
 * If not provided, animation will be skipped (no error thrown).
 * 
 * @param sourceElement - Element where animation starts (product card/button)
 * @param setFlyingBubbles - State setter for flying bubbles (optional)
 * @returns Created bubble data if setFlyingBubbles is provided, undefined otherwise
 */
export const triggerFlyingAnimation = (
  sourceElement?: HTMLElement,
  setFlyingBubbles?: React.Dispatch<React.SetStateAction<FlyingBubble[]>>
) => {
  // Skip animation if setter is not provided
  if (!setFlyingBubbles) {
    return;
  }

  // Get source position (product location)
  let startX = window.innerWidth / 2; // Default to center
  let startY = window.innerHeight / 2;

  if (sourceElement) {
    const rect = sourceElement.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  }

  // Get cart icon position
  const cartIcon = document.querySelector('[data-cart-icon]') || document.querySelector('.relative button');
  let endX = window.innerWidth - 100; // Default position
  let endY = 80;

  if (cartIcon) {
    const cartRect = cartIcon.getBoundingClientRect();
    endX = cartRect.left + cartRect.width / 2;
    endY = cartRect.top + cartRect.height / 2;
  }

  // Create bubble
  const bubbleId = Date.now().toString();
  const newBubble: FlyingBubble = { id: bubbleId, startX, startY, endX, endY };

  setFlyingBubbles(prev => [...prev, newBubble]);

  // Trigger cart bounce effect
  if (cartIcon) {
    cartIcon.classList.add('cart-bounce');
    setTimeout(() => {
      cartIcon.classList.remove('cart-bounce');
    }, 600);
  }

  // Remove bubble after animation completes
  setTimeout(() => {
    setFlyingBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
  }, 1200);

  return newBubble;
};

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
  sourceElement?: HTMLElement,
  quantity: number = 1
) => {
  // Validate quantity first
  if (quantity <= 0) {
    setShowAngryQuantity(true);
    toast.error("Jumlah produk harus lebih dari 0!", {
      position: 'top-center',
      style: {
        marginTop: '60px',
        backgroundColor: '#ff4500',
        color: 'white',
        fontWeight: 'bold',
        border: '2px solid #ff6b35',
        boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)'
      },
      duration: 3000
    });

    // Reset angry animation after 3 seconds
    setTimeout(() => {
      setShowAngryQuantity(false);
    }, 3000);
    return;
  }

  // Check if this product already exists in cart with a case variant
  const existingCartItem = cartItems.find(item =>
    item.id === product.id &&
    (!product.models || item.modelCode === selectedModel) &&
    (!idCardWithCaseIds.includes(product.id) || item.caseVariant) &&
    (!stikerWithLaminationIds.includes(product.id) || item.laminationVariant)
  );

  // Skip validation if we're adding to an existing cart item that already has required selections
  const skipValidation = existingCartItem && (
    (idCardWithCaseIds.includes(product.id) && existingCartItem.caseVariant) ||
    (stikerWithLaminationIds.includes(product.id) && existingCartItem.laminationVariant) ||
    (!idCardWithCaseIds.includes(product.id) && !stikerWithLaminationIds.includes(product.id))
  );

  if (!skipValidation) {
    if (product.models && !selectedModel) {
      toast.error("Silakan pilih model/varian plakat terlebih dahulu.", { position: 'top-center', style: { marginTop: '60px' } });
      return;
    }
    if (idCardWithCaseIds.includes(product.id) && !selectedCase) {
      setShowAngryCase(true);
      toast.error("Mohon pilih jenis casing terlebih dahulu!", {
        position: 'top-center',
        style: {
          marginTop: '60px',
          backgroundColor: '#ff4500',
          color: 'white',
          fontWeight: 'bold',
          border: '2px solid #ff6b35',
          boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)'
        },
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

      return;
    }
    if (stikerWithLaminationIds.includes(product.id) && !selectedLamination) {
      setShowAngryLamination(true);
      toast.error("Mohon pilih jenis laminasi terlebih dahulu!", {
        position: 'top-center',
        style: {
          marginTop: '60px',
          backgroundColor: '#ff4500',
          color: 'white',
          fontWeight: 'bold',
          border: '2px solid #ff6b35',
          boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)'
        },
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

      return;
    }
  }

  const existingItem = cartItems.find(item =>
    item.id === product.id &&
    (!product.models || item.modelCode === selectedModel) &&
    (!idCardWithCaseIds.includes(product.id) || item.caseVariant === selectedCase) &&
    (!stikerWithLaminationIds.includes(product.id) || item.laminationVariant === selectedLamination)
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    const newPrice = getApplicablePrice(product, newQuantity, existingItem.modelCode);

    setCartItems(
      cartItems.map(item =>
        item.id === product.id &&
          (!product.models || item.modelCode === selectedModel) &&
          (!idCardWithCaseIds.includes(product.id) || item.caseVariant === selectedCase) &&
          (!stikerWithLaminationIds.includes(product.id) || item.laminationVariant === selectedLamination)
          ? {
            ...item,
            quantity: newQuantity,
            appliedPrice: newPrice,
            savings: calculateSavings(product, newQuantity)
          }
          : item
      )
    );
    toast.success(`${product.name} ditambahkan +${quantity} (Total: ${newQuantity}×)`, {
      position: 'top-center',
      duration: 2000,
      style: {
        marginTop: '60px',
        fontSize: '12px',
        padding: '6px 10px',
        minHeight: '36px',
        maxWidth: '260px'
      }
    });

    // Note: Flying animation is handled in the component (Index.tsx) via setFlyingBubbles
    // Animation cannot be triggered here as addToCart doesn't have access to setFlyingBubbles
  } else {
    const newItem: CartItem = {
      ...product,
      quantity: quantity,
      appliedPrice: getApplicablePrice(product, quantity, selectedModel),
      savings: calculateSavings(product, quantity, selectedModel),
      modelCode: product.models ? selectedModel : undefined,
      caseVariant: idCardWithCaseIds.includes(product.id) ? selectedCase : undefined,
      laminationVariant: stikerWithLaminationIds.includes(product.id) ? selectedLamination : undefined
    };
    setCartItems([...cartItems, newItem]);
    toast.success(`${product.name} ditambahkan ${quantity}× ke keranjang`, {
      position: 'top-center',
      duration: 2000,
      style: {
        marginTop: '60px',
        fontSize: '12px',
        padding: '6px 10px',
        minHeight: '36px',
        maxWidth: '260px'
      }
    });

    // Note: Flying animation is handled in the component (Index.tsx) via setFlyingBubbles
    // Animation cannot be triggered here as addToCart doesn't have access to setFlyingBubbles
  }
};

// Add banner to cart function
export const addBannerToCart = (
  product: Product,
  width: number,
  height: number,
  cartItems: CartItem[],
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>
) => {
  const calculatedPrice = calculateBannerPrice(product, width, height);
  const newItem: CartItem = {
    ...product,
    width,
    height,
    appliedPrice: calculatedPrice,
    quantity: 1,
    savings: product.price - calculatedPrice > 0 ? product.price - calculatedPrice : 0,
    isDimensionalProduct: true,
    dimensionText: `${width}m × ${height}m`,
    area: (width * height).toFixed(2) + ' m²'
  };

  setCartItems([...cartItems, newItem]);

  // Show success notification for banner with dimensions
  toast.success(`${product.name} ditambahkan ke keranjang`, {
    position: 'top-center',
    duration: 2000,
    style: {
      marginTop: '60px',
      fontSize: '12px',
      padding: '6px 10px',
      minHeight: '36px',
      maxWidth: '260px'
    }
  });

  // Note: Flying animation is handled in the component (Index.tsx) via setFlyingBubbles
  // Animation cannot be triggered here as addBannerToCart doesn't have access to setFlyingBubbles
};

// Remove from cart function
export const removeFromCart = (
  id: number,
  cartItems: CartItem[],
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>,
  products: any
) => {
  const existingItem = cartItems.find(item => item.id === id);

  if (existingItem && existingItem.quantity > 1) {
    const newQuantity = existingItem.quantity - 1;
    const product = Object.values(products).flat().find((p: any) => p.id === id);
    const newPrice = getApplicablePrice(product, newQuantity, existingItem.modelCode);

    setCartItems(
      cartItems.map(item =>
        item.id === id
          ? {
            ...item,
            quantity: newQuantity,
            appliedPrice: newPrice,
            savings: calculateSavings(product, newQuantity, existingItem.modelCode)
          }
          : item
      )
    );

    // Show notification for decreasing quantity
    toast.info(`Jumlah ${existingItem.name} dikurangi (${newQuantity}×)`, { position: 'top-center', duration: 2000, style: { marginTop: '60px' } });
  } else {
    setCartItems(cartItems.filter(item => item.id !== id));

    // Show notification for removing product
    if (existingItem) {
      toast.info(`${existingItem.name} dihapus dari keranjang`, { position: 'top-center', duration: 2000, style: { marginTop: '60px' } });
    }
  }
};

// Delete item completely from cart
export const deleteFromCart = (
  id: number,
  cartItems: CartItem[],
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>
) => {
  const itemToDelete = cartItems.find(item => item.id === id);

  setCartItems(cartItems.filter(item => item.id !== id));

  // Show notification for deleting product
  if (itemToDelete) {
    toast.info(`${itemToDelete.name} dihapus dari keranjang`, { position: 'top-center', duration: 2000, style: { marginTop: '60px' } });
  }
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
 * ⚠️ IMPORTANT NOTES:
 * - Override prices completely ignore quantity thresholds
 * - Percentage discounts are applied AFTER threshold prices
 * - item.appliedPrice is calculated in addToCart() using getApplicablePrice()
 * 
 * @param cartItems - Array of cart items with appliedPrice already set
 * @param promoCode - Active promo code (empty string if none)
 * @returns Total price after all discounts
 * 
 * @see pricing-documentation.md for detailed pricing flow explanation
 */
export const calculateTotal = (cartItems: CartItem[], promoCode: string) => {
  return cartItems.reduce((total, item) => {
    // Start with threshold-adjusted price (from getApplicablePrice)
    let itemPrice = item.appliedPrice * item.quantity;

    if (promoCode && validPromoCodes[promoCode]) {
      const promoInfo = validPromoCodes[promoCode];
      const productMatches = promoInfo.productIds === null || promoInfo.productIds.includes(item.id);
      const quantityMatches = !promoInfo.minQuantity || item.quantity >= promoInfo.minQuantity;

      if (productMatches && quantityMatches) {
        // TYPE 1: Override Price Promos (e.g., HUT3TH)
        // These set a flat price per unit, completely ignoring thresholds
        // ⚠️ GAP: Override prices ignore quantity - 1 item or 100 items get same unit price
        if (promoInfo.overridePrices && promoInfo.overridePrices[item.id] !== undefined) {
          itemPrice = promoInfo.overridePrices[item.id] * item.quantity;
        }
        // TYPE 2: Percentage Discount Promos
        // Applied to threshold price, not base price
        // ⚠️ GAP: Discount is on threshold price, not original base price
        else {
          itemPrice = itemPrice * (1 - promoInfo.discount / 100);
        }
      }
    }
    return total + itemPrice;
  }, 0);
};

/**
 * Get effective price per unit for display purposes
 * 
 * This function returns the actual price per unit that will be charged,
 * considering both threshold prices and active promo codes.
 * 
 * USE CASE: Display correct price in cart/checkout when promo is active
 * 
 * ⚠️ GAP: Currently cart items show item.appliedPrice which doesn't reflect promos.
 * Use this function to show correct price in UI.
 * 
 * @param item - Cart item with appliedPrice set
 * @param promoCode - Active promo code
 * @returns Effective price per unit after promo application
 */
export const getEffectivePrice = (item: CartItem, promoCode: string): number => {
  if (promoCode && validPromoCodes[promoCode]) {
    const promoInfo = validPromoCodes[promoCode];
    const productMatches = promoInfo.productIds === null || promoInfo.productIds.includes(item.id);
    const quantityMatches = !promoInfo.minQuantity || item.quantity >= promoInfo.minQuantity;

    if (productMatches && quantityMatches) {
      // Override prices: flat price per unit
      if (promoInfo.overridePrices && promoInfo.overridePrices[item.id] !== undefined) {
        return promoInfo.overridePrices[item.id];
      }
      // Percentage discount: applied to threshold price
      return item.appliedPrice * (1 - promoInfo.discount / 100);
    }
  }
  // No promo or promo doesn't apply: return threshold-adjusted price
  return item.appliedPrice;
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
 * - Override Promos: Discount = (threshold price - override price) × quantity
 * - Percentage Promos: Discount = threshold price × quantity × (discount %)
 * 
 * ⚠️ IMPORTANT NOTES:
 * - Discount is calculated from threshold price, NOT base price
 * - For override promos, discount shown might be less than actual savings
 *   Example: Base Rp 25,000, Threshold Rp 20,000, Override Rp 15,000
 *   Discount shown: Rp 5,000 (but actual savings from base is Rp 10,000)
 * 
 * @param cartItems - Array of cart items
 * @param promoCode - Active promo code
 * @returns Total discount amount in Rupiah
 */
export const calculateTotalDiscount = (cartItems: CartItem[], promoCode: string) => {
  if (!promoCode || !validPromoCodes[promoCode]) return 0;

  const promoInfo = validPromoCodes[promoCode];
  return cartItems.reduce((discount, item) => {
    const productMatches = promoInfo.productIds === null || promoInfo.productIds.includes(item.id);
    const quantityMatches = !promoInfo.minQuantity || item.quantity >= promoInfo.minQuantity;

    if (productMatches && quantityMatches) {
      // Override Price Discount
      // Compares threshold price vs override price
      // ⚠️ GAP: Doesn't compare to base price, only threshold price
      if (promoInfo.overridePrices && promoInfo.overridePrices[item.id] !== undefined) {
        const originalPrice = item.appliedPrice * item.quantity; // Threshold price
        const overridePrice = promoInfo.overridePrices[item.id] * item.quantity;
        return discount + (originalPrice - overridePrice);
      }
      // Percentage Discount
      // Applied to threshold price
      else {
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
 * 0. Check date validity for date-restricted promos (e.g., HUT3TH: Nov 20-25, 2025)
 * 1. Check if promo code exists
 * 2. If promo targets specific products: verify at least one matching product in cart
 * 3. If promo has minQuantity: verify quantity requirement met
 * 4. Apply promo if all checks pass
 * 
 * ⚠️ LIMITATIONS:
 * - Only ONE promo code can be active at a time
 * - Promo validation happens client-side only
 * - HUT3TH promo is only valid on Nov 20-25, 2025
 * 
 * @param code - Promo code string (empty string clears promo)
 * @param cartItems - Current cart items
 * @param setPromoCode - State setter for promo code
 * @param setPromoCodeError - State setter for error message
 * @param setPromoDiscount - State setter for discount percentage (for display)
 * 
 * @see validPromoCodes in constants/index.ts for promo definitions
 */
export const handlePromoCodeChange = (
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

  const promo = validPromoCodes[code as keyof typeof validPromoCodes];
  if (promo) {
    // VALIDATION STEP 0: Check date validity for HUT3TH promo (Nov 20-25, 2025)
    if (code === "HUT3TH") {
      const promoStartDate = new Date('2025-11-20T00:00:00');
      const promoEndDate = new Date('2025-11-25T23:59:59');
      const now = new Date();

      if (now < promoStartDate || now > promoEndDate) {
        setPromoDiscount(0);
        setPromoCodeError("Kode promo HUT3TH hanya berlaku pada tanggal 20-25 November 2025.");
        return;
      }
    }

    // VALIDATION STEP 1: Check product eligibility
    // If promo targets specific products, verify at least one is in cart
    if (promo.productIds && Array.isArray(promo.productIds)) {
      const matchingCartItem = cartItems.find(item => promo.productIds!.includes(item.id));
      if (!matchingCartItem) {
        setPromoDiscount(0);
        setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
        return;
      }
      // VALIDATION STEP 2: Check minimum quantity requirement
      if (promo.minQuantity && matchingCartItem.quantity < promo.minQuantity) {
        setPromoDiscount(0);
        setPromoCodeError(`Kode promo memerlukan minimal ${promo.minQuantity} pcs pada produk yang dipilih.`);
        return;
      }
    }

    // VALIDATION STEP 3: Verify promo applies to at least one item
    // (For promos that apply to all products or passed above checks)
    const appliesToAny = cartItems.some(item => {
      const productMatches = promo.productIds === null || promo.productIds.includes(item.id);
      const quantityMatches = !promo.minQuantity || item.quantity >= promo.minQuantity;
      return productMatches && quantityMatches;
    });

    if (appliesToAny) {
      // Promo is valid - apply it
      setPromoDiscount(promo.discount); // For display (0% for override price promos)

      // Custom success messages for specific promos
      if (code === "HUT3TH") {
        // HUT3TH uses override prices, not percentage discount
        toast.success("Promo HUT 3 Tahun ID Card Lampung berhasil dipakai!", {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
      } else {
        // Standard percentage discount promos
        toast.success(`Promo code ${code} applied! ${promo.discount}% discount`, {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
      }
    } else {
      // Promo doesn't apply to any items in cart
      setPromoDiscount(0);
      setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
    }
  } else {
    // Invalid promo code
    setPromoDiscount(0);
    setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
  }
};


