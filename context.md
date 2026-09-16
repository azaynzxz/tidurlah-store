# Tidurlah Store / ID Card Lampung - Project Context

## Overview
Tidurlah Store is a dual-purpose React-based web application that serves both as a customer-facing storefront and an internal Point of Sale (POS) system. It specializes in printing services, focusing on ID Cards, Lanyards, Promotional Banners, and Merchandise.

## Architecture
The application is built using a modern React stack with Tailwind CSS for styling. It features a rich, interactive UI with animations and dynamic pricing logic based on quantity thresholds.

### Dual Entry Points
1. **Storefront (`src/pages/Index.tsx`)**: The main customer-facing website. Customers can browse products, customize them (e.g., choose lamination, casing, or dimensions), and add them to a shopping cart. Checkout generates a pre-filled WhatsApp message.
2. **POS Dashboard (`src/components/pos/POSDashboard.tsx`)**: An internal tool for cashiers to manage orders, add products to a cart quickly, apply custom prices, and print receipts using a Bluetooth thermal printer.

### Key Features
- **Dynamic Pricing (`src/utils/product.ts`)**: Prices change based on quantity thresholds. Some products (like banners) use dimensional pricing (width × height × price/sqm).
- **Product Variants**: Products can have specific models (e.g., Plakat variants), case options (e.g., "Case Bening"), or lamination options (e.g., "Laminasi Glossy").
- **Cart Management (`src/utils/cart.ts`)**: Complex validation logic to ensure users select required variants before adding to the cart. It aggregates identical items and calculates savings.
- **Promo Codes (`src/constants/index.ts`)**: Supports percentage-based discounts or override prices (e.g., "HUT3TH" promo), validated either via Supabase or hardcoded constants.

## Directory Structure
- `public/products.json`: The core database of all products, categories, thresholds, and variants.
- `src/pages/`: Contains the main application routes, including `Index.tsx` (Storefront).
- `src/components/pos/`: Contains all the Point of Sale specific components (`POSDashboard.tsx`, `Cart.tsx`, `ProductGrid.tsx`, etc.).
- `src/utils/`: Contains reusable business logic (`cart.ts` for cart operations, `product.ts` for pricing).
- `src/types/`: TypeScript interfaces (e.g., `product.ts` defining `Product` and `CartItem`).
- `src/constants/`: Configuration files (e.g., promo codes, IDs of products requiring case/lamination).

## Recent Bug Fixes
- **Add to Cart Modal Issue**: Addressed a bug where the `Index.tsx` product detail modal would not close after a successful add to cart, causing users to believe the action failed. The cart utility was modified to return a boolean success status, and the UI was updated to close the modal and resolve duplicate React keys in the Cart Drawer.

## Design & UI/UX Rules
- **Fluid Animations**: Every animation (like toasts, modals, flying bubbles) should be fluid and must include both an IN and OUT animation sequence. Do not abruptly show or hide UI elements without proper transitions.
