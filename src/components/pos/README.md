# POS Components - Quick Reference

## Component Overview

### 🎯 POSDashboard
**Main POS interface with responsive layout**

```tsx
import { POSDashboard } from "./components/pos/POSDashboard"

// Usage
<POSDashboard />
```

**Features:**
- Mobile: Full-width products + floating cart button
- Desktop: Side-by-side (products + cart)
- Auto product loading from `/products.json`
- Receipt generation and Bluetooth printing
- Order history management
- Time-based notifications

---

### 🛒 Cart
**Shopping cart with customer details and checkout**

```tsx
<Cart
  items={cartItems}
  onUpdateQuantity={(id, qty) => {}}
  onRemoveItem={(id) => {}}
  onClearAll={() => {}}
  onProcessOrder={(details) => {}}
  onUpdateOptions={(id, options) => {}}
  onPrintOrder={(details) => Promise<boolean>}
  onAddDesignService={() => {}}
  onAddExpressService={() => {}}
  onAddOngkir={(price) => {}}
  isBluetoothSupported={true}
  isMobile={false}           // Mobile mode flag
  onClose={() => {}}         // Close mobile modal
/>
```

**Props:**
- `isMobile`: Enable mobile-specific behavior (auto-close on success)
- `onClose`: Callback to close mobile cart modal

---

### 🎴 ProductGrid
**Responsive grid displaying products**

```tsx
<ProductGrid
  products={products}
  onAddToCart={(product) => {}}
  selectedProducts={new Set([1, 2, 3])}
/>
```

**Layout:**
- Mobile: 2 columns
- Desktop: 3-5 columns (responsive)

---

### 📦 ProductCard
**Individual product card with responsive layout**

```tsx
<ProductCard
  product={product}
  onAddToCart={(product) => {}}
  isSelected={false}
/>
```

**Layouts:**
- **Mobile**: Vertical card (image on top, info below)
- **Desktop**: Horizontal card (thumbnail + details)

**Features:**
- Price display with discounts
- Special indicators (dimensional, models, casing)
- Out-of-stock badge
- Selection state

---

### 🔝 POSHeader
**Header with logo, search, and navigation**

```tsx
<POSHeader
  onShowOrderHistory={() => {}}
  onSearch={(term) => {}}
  searchTerm=""
  cashierName="Admin"
  onCashierNameChange={(name) => {}}
/>
```

**Layouts:**
- **Mobile**: Stacked (logo/time/history + search)
- **Desktop**: Grid (logo | search | time/history)

---

### 📋 CartItem
**Individual cart item with options**

```tsx
<CartItem
  item={cartItem}
  onUpdateQuantity={(id, qty) => {}}
  onRemove={(id) => {}}
  onUpdateOptions={(id, options) => {}}
/>
```

**Features:**
- Quantity adjustment
- Price override
- Model/case/lamination selection
- Dimensional inputs
- Collapsible options panel

---

### 📊 OrderHistory
**View and manage order history**

```tsx
<OrderHistory
  onBack={() => {}}
  cashierName="Admin"
/>
```

**Features:**
- View past orders
- Download receipts
- WhatsApp customer notification
- Delete orders

---

### 🏷️ CategoryTabs
**Product category filter tabs**

```tsx
<CategoryTabs
  categories={["Semua Produk", "ID Card", "Banner"]}
  activeCategory="Semua Produk"
  onCategoryChange={(category) => {}}
/>
```

---

### 🚚 DeliveryInfoDialog
**Delivery information input dialog**

```tsx
<DeliveryInfoDialog
  open={true}
  onOpenChange={(open) => {}}
  onSubmit={(info, ongkir) => {}}
  onCancel={() => {}}
/>
```

---

## Responsive Behavior

### Mobile (< 768px)
- 2-column product grid
- Simplified product cards
- Floating cart button (FAB)
- Bottom sheet cart modal
- Stacked header
- Full-width search
- Touch-optimized controls

### Desktop (≥ 768px)
- 3-5 column product grid
- Detailed product cards
- Side panel cart (always visible)
- Grid header layout
- Centered search bar
- Mouse-optimized controls

---

## Common Patterns

### Adding to Cart
```tsx
const handleAddToCart = (product: Product) => {
  const newItem: CartItem = {
    product,
    quantity: 1,
    options: getDefaultOptions(product)
  };
  setCartItems(prev => [...prev, newItem]);
};
```

### Processing Order
```tsx
const handleProcessOrder = async (details: CustomerDetails) => {
  // Generate receipt
  const receiptId = generateInvoiceId(details.name, items.length);
  
  // Save to localStorage
  localStorage.setItem('orderHistory', JSON.stringify(history));
  
  // Submit to Google Sheets
  await submitPOSOrder(orderData);
  
  // Generate receipt JPG
  await generateReceiptJPG();
};
```

### Price Calculation
```tsx
const getApplicablePrice = (product, quantity, options) => {
  // 1. Check override price
  if (options?.overridePrice) return options.overridePrice;
  
  // 2. Check custom price (ongkir)
  if (product.id === 2002 && options?.customPrice) {
    return options.customPrice;
  }
  
  // 3. Check dimensional pricing
  if (product.pricingMethod === "dimensional") {
    return calculateBannerPrice(product, width, height, quantity);
  }
  
  // 4. Check price thresholds
  if (product.priceThresholds) {
    const threshold = findApplicableThreshold(quantity);
    if (threshold) return threshold.price;
  }
  
  // 5. Default price
  return product.discountPrice || product.price;
};
```

---

## Styling Guide

### Brand Colors
```css
Primary: #FF5E01 (Orange)
Primary Hover: #e54d00
Background: bg-gray-100
Card Background: bg-white
Text: text-gray-800
```

### Responsive Classes
```tsx
// Mobile-first approach
<div className="p-2 md:p-4">           // Padding
<div className="text-xs md:text-sm">   // Text size
<div className="hidden md:block">      // Desktop only
<div className="md:hidden">            // Mobile only
<div className="grid-cols-2 md:grid-cols-4"> // Grid
```

### Common Utilities
```tsx
// Currency formatting
formatCurrency(amount) // Returns: "Rp 50.000"

// Number formatting
formatNumber(1234) // Returns: "1.234"

// Date formatting
toLocaleString('id-ID', { /* options */ })
```

---

## State Management

### Cart State
```tsx
const [cartItems, setCartItems] = useState<CartItem[]>([]);
const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
```

### UI State
```tsx
const [showMobileCart, setShowMobileCart] = useState(false);
const [showOrderHistory, setShowOrderHistory] = useState(false);
const [showReceipt, setShowReceipt] = useState(false);
```

### Form State
```tsx
const [customerDetails, setCustomerDetails] = useState({
  name: '',
  phone: '',
  instansi: '',
  delivery?: {...},
  downPayment?: 0
});
```

---

## Event Handlers

### Product Actions
- `onAddToCart(product)` - Add product to cart
- `onUpdateQuantity(id, quantity)` - Update item quantity
- `onRemoveItem(id)` - Remove item from cart
- `onUpdateOptions(id, options)` - Update item options

### Order Actions
- `onProcessOrder(details)` - Process order (download receipt)
- `onPrintOrder(details)` - Print via Bluetooth
- `onClearAll()` - Clear cart

### Additional Services
- `onAddDesignService()` - Add design service (Rp 25k)
- `onAddExpressService()` - Add express service (Rp 25k)
- `onAddOngkir(price)` - Add delivery fee (custom price)

---

## Product Options

### Required Options by Product ID
```tsx
// ID Cards with casing
[1, 2, 6, 7, 8] // Requires caseVariant

// Stickers with lamination
[15] // Requires laminationVariant

// Banners/dimensional products
pricingMethod === "dimensional" // Requires width, height
```

### Option Types
```tsx
interface ItemOptions {
  modelCode?: string;           // Product model
  caseVariant?: string;         // Case type
  laminationVariant?: string;   // Lamination type
  width?: number;               // Width (meters)
  height?: number;              // Height (meters)
  isDimensionalProduct?: boolean;
  dimensionText?: string;       // "1m x 2m"
  area?: string;                // "2 m²"
  customPrice?: number;         // Ongkir price
  overridePrice?: number;       // Manual price override
}
```

---

## Testing Tips

### Mobile Testing
1. Use Chrome DevTools mobile emulation
2. Test on real devices (Android/iOS)
3. Check portrait and landscape
4. Verify touch targets (≥ 44px)

### Desktop Testing
1. Test various window sizes
2. Check at exactly 768px (breakpoint)
3. Verify no horizontal scroll
4. Test mouse interactions

### Cross-Platform
1. Test cart on mobile → checkout on desktop
2. Verify localStorage persistence
3. Check responsive transitions
4. Test form validation

---

## Common Issues & Solutions

### Issue: Modal not closing on mobile
**Solution:** Ensure `isMobile` prop is passed to Cart component

### Issue: Product grid layout broken
**Solution:** Check Tailwind config includes all content paths

### Issue: Animation not working
**Solution:** Verify `tailwind.config.ts` includes slide-up animation

### Issue: Cart FAB not visible
**Solution:** Check `md:hidden` class and z-index (z-40)

### Issue: Calculations incorrect
**Solution:** Verify getApplicablePrice logic order (override → custom → dimensional → threshold → default)

---

## Performance Tips

1. **Lazy Load Images**: Use native `loading="lazy"`
2. **Memoize Calculations**: Cache expensive price calculations
3. **Debounce Search**: Wait 300ms before filtering
4. **Virtual Scrolling**: For large product lists (100+)
5. **Code Splitting**: Lazy load OrderHistory component

---

## Accessibility

- All buttons have proper labels
- Cart modal has `role="dialog"`
- Form inputs have associated labels
- Focus management in modals
- Keyboard navigation support

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS 12+, Android 8+)

---

## Related Files

- `/products.json` - Product database
- `/src/utils/api.ts` - Google Sheets API
- `/src/utils/product.ts` - Product utilities
- `/src/utils/receipt.ts` - Receipt generation
- `MOBILE_POS_REFACTOR.md` - Detailed refactoring guide

---

## Need Help?

Check the detailed refactoring guide: `MOBILE_POS_REFACTOR.md`

