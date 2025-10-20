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

// Flying animation function
export const triggerFlyingAnimation = (
  sourceElement?: HTMLElement,
  setFlyingBubbles?: React.Dispatch<React.SetStateAction<FlyingBubble[]>>
) => {
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
  const newBubble = { id: bubbleId, startX, startY, endX, endY };

  if (setFlyingBubbles) {
    setFlyingBubbles(prev => [...prev, newBubble]);
  }

  // Trigger cart bounce effect
  if (cartIcon) {
    cartIcon.classList.add('cart-bounce');
    setTimeout(() => {
      cartIcon.classList.remove('cart-bounce');
    }, 600);
  }

  // Remove bubble after animation completes
  if (setFlyingBubbles) {
    setTimeout(() => {
      setFlyingBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
    }, 1200);
  }
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
    const newPrice = getApplicablePrice(product, newQuantity);

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

    // Trigger flying animation only on successful add
    if (sourceElement) {
      triggerFlyingAnimation(sourceElement);
    }
  } else {
    const newItem: CartItem = {
      ...product,
      quantity: quantity,
      appliedPrice: getApplicablePrice(product, quantity),
      savings: calculateSavings(product, quantity),
      modelCode: product.models ? (selectedModel || undefined) : undefined,
      caseVariant: idCardWithCaseIds.includes(product.id) ? (selectedCase || undefined) : undefined,
      laminationVariant: stikerWithLaminationIds.includes(product.id) ? (selectedLamination || undefined) : undefined
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

    // Trigger flying animation only on successful add
    if (sourceElement) {
      triggerFlyingAnimation(sourceElement);
    }
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

  // Trigger flying animation for banner products
  triggerFlyingAnimation(undefined, (prev) => setCartItems(prevItems => prevItems));
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
    const newPrice = getApplicablePrice(product, newQuantity);

    setCartItems(
      cartItems.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
              appliedPrice: newPrice,
              savings: calculateSavings(product, newQuantity)
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

// Calculate total price with promo discount
export const calculateTotal = (cartItems: CartItem[], promoCode: string) => {
  return cartItems.reduce((total, item) => {
    let itemPrice = item.appliedPrice * item.quantity;
    if (promoCode && validPromoCodes[promoCode]) {
      const promoInfo = validPromoCodes[promoCode];
      const productMatches = promoInfo.productIds === null || promoInfo.productIds.includes(item.id);
      const quantityMatches = !promoInfo.minQuantity || item.quantity >= promoInfo.minQuantity;

      if (productMatches && quantityMatches) {
        itemPrice = itemPrice * (1 - promoInfo.discount / 100);
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

// Calculate total discount
export const calculateTotalDiscount = (cartItems: CartItem[], promoCode: string) => {
  if (!promoCode || !validPromoCodes[promoCode]) return 0;

  const promoInfo = validPromoCodes[promoCode];
  return cartItems.reduce((discount, item) => {
    const productMatches = promoInfo.productIds === null || promoInfo.productIds.includes(item.id);
    const quantityMatches = !promoInfo.minQuantity || item.quantity >= promoInfo.minQuantity;

    if (productMatches && quantityMatches) {
      return discount + (item.appliedPrice * item.quantity * (promoInfo.discount / 100));
    }
    return discount;
  }, 0);
};

// Validate and apply promo code
export const handlePromoCodeChange = (
  code: string,
  cartItems: CartItem[],
  setPromoCode: React.Dispatch<React.SetStateAction<string>>,
  setPromoCodeError: React.Dispatch<React.SetStateAction<string>>,
  setPromoDiscount: React.Dispatch<React.SetStateAction<number>>
) => {
  setPromoCode(code);
  setPromoCodeError("");

  if (!code) {
    setPromoDiscount(0);
    return;
  }

  const promo = validPromoCodes[code as keyof typeof validPromoCodes];
  if (promo) {
    // If promo applies to specific products, check if any of those products are in the cart
    if (promo.productIds && Array.isArray(promo.productIds)) {
      const matchingCartItem = cartItems.find(item => promo.productIds!.includes(item.id));
      if (!matchingCartItem) {
        setPromoDiscount(0);
        setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
        return;
      }
      // Now check minimum quantity requirement if specified
      if (promo.minQuantity && matchingCartItem.quantity < promo.minQuantity) {
        setPromoDiscount(0);
        setPromoCodeError(`Kode promo memerlukan minimal ${promo.minQuantity} pcs pada produk yang dipilih.`);
        return;
      }
    }
    // For codes that apply to all products or pass the above checks
    // Check if promo applies to any product in the cart with sufficient quantity
    const appliesToAny = cartItems.some(item => {
      const productMatches = promo.productIds === null || promo.productIds.includes(item.id);
      const quantityMatches = !promo.minQuantity || item.quantity >= promo.minQuantity;
      return productMatches && quantityMatches;
    });
    if (appliesToAny) {
      setPromoDiscount(promo.discount);
      toast.success(`Promo code ${code} applied! ${promo.discount}% discount`, { position: 'top-center', style: { marginTop: '60px' } });
    } else {
      setPromoDiscount(0);
      setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
    }
  } else {
    setPromoDiscount(0);
    setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
  }
};


