# Tidurlah Store / ID Card Lampung - Project Context

## Overview
Tidurlah Store (`https://idcardlampung.com`, operated by Tidurlah Grafika) is a multi-purpose React + TypeScript web application serving as a customer-facing e-commerce printing storefront, an internal Point of Sale (POS) cashier terminal, and a back-office Admin & Financial Reporting suite. It specializes in custom printing services without minimum order requirements, focusing on PVC ID Cards, Sublime Lanyards, Employee Nametags, Promotional Banners, Acrylic Plaques, and Custom Merchandise across Bandar Lampung, Kota Metro, and nationwide Indonesia.

## Architecture
The application is built with Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Helmet Async, and Supabase.

### Entry Points & Core Routes (`src/App.tsx`)
1. **Primary Storefront (`src/pages/StorefrontBeta.tsx` on `/` and `/product/:slug`)**: Modern minimalist storefront featuring category filtering, instant search (matching names, categories, SEO titles, and rich descriptions), interactive wholesale tier pricing, variant selection, crawlable `<a href="/product/:slug">` product cards with smooth client-side modal navigation, collapsible FAQ & regional service coverage (`src/components/beta/BetaSeoFaqSection.tsx`), and pre-filled WhatsApp checkout. Legacy `/classic`, `/classic/product/:slug`, and `/old` paths redirect cleanly to `/` and `/product/:slug`.
2. **POS Cashier Dashboard (`src/pages/Cashier.tsx` / `src/components/pos/POSDashboard.tsx` on `/cashier`)**: Role-protected internal cashier terminal (`admin` and `cashier`) for managing walk-in/online orders, applying custom pricing, and printing 58mm receipts via Bluetooth thermal printer.
3. **Admin & Financial Suite (`src/pages/Admin.tsx` on `/admin`)**: Role-protected back-office dashboard (`admin`) managing:
   - Products, Categories, Promo Codes, Orders, Customers, and Users.
   - **Operational Expenses & Persistent Payroll (`src/components/admin/ExpensesTab.tsx`)**: Tracks raw materials, utilities, ads, maintenance, and features a persistent employee roster (`localStorage` backed) for one-click monthly payroll recording (`Gaji Karyawan`).
   - **Financial & Operational Reports (`src/components/admin/ReportsTab.tsx`)**: Computes Gross Revenue, Total Expenses, Net Margin, and exports structured multi-page PDF reports (`jsPDF`) with Page 1 executive KPIs, top products, and cashier performance, followed by dedicated pages for itemized expense logs and category/platform breakdowns.

### Key Business Logic
- **Dynamic Pricing (`src/utils/product.ts`)**: Quantity-threshold wholesale pricing (`priceThresholds`), model-specific pricing (`models`), and dimensional per-sqm pricing (`width * height * basePricePerSqm`) for banners.
- **Product Variants & Cart Validation (`src/utils/cart.ts`)**: Enforces required casing (`Case Bening`, etc.), lamination (`Glossy` / `Doff`), or model selections before cart insertion, aggregates identical configurations, and computes wholesale savings.
- **Promo Codes (`src/constants/index.ts` & Supabase `promo_codes`)**: Supports percentage-based discounts and fixed price overrides (e.g., `KKN15`).

## Directory Structure
- `functions/api/products.js`: Cloudflare Pages Edge proxy caching public Supabase REST catalog queries.
- `public/products.json`: Fallback & build-time source catalog of all products, categories, wholesale thresholds, models, `seoTitle`, `imageAlt`, and rich `description`.
- `public/llms.txt` & `public/llms-full.txt`: AI-readable business summary and complete catalog/wholesale price specification generated at build time.
- `public/sitemap.xml` & `public/robots.txt`: Canonical `https://idcardlampung.com` search & AI crawler directives.
- `scripts/prerender-seo.mjs`: Build-time catalog synchronizer, `llms.txt` / `sitemap.xml` generator, and static HTML route pre-renderer.
- `docs/`: Brand guidelines (`BRAND_GUIDELINE.md`), Supabase integration reference (`SUPABASE_INTEGRATION.md`), and catalog notes.
- `src/pages/`: Main route views (`StorefrontBeta.tsx`, `Admin.tsx`, `Cashier.tsx`, `About.tsx`, `Katalog.tsx`, `Blog.tsx`, `BlogPost.tsx`, `Loker.tsx`, `Layout.tsx`, `Receipt.tsx`, `Survey.tsx`, `Spotlight.tsx`, `Login.tsx`).
- `src/components/beta/`: Minimalist storefront components (`BetaHeader`, `BetaBannerCarousel`, `BetaProductCard`, `BetaProductModal`, `BetaCartDrawer`, `BetaOrdersDrawer`, `BetaSeoFaqSection`, `BetaFooter`).
- `src/components/admin/`: Back-office tabs (`DashboardTab`, `ProductsTab`, `OrdersTab`, `ExpensesTab`, `ReportsTab`, `PromosTab`, `CustomersTab`).
- `src/components/pos/`: Point of Sale components (`POSDashboard`, `Cart`, `ProductGrid`, `OrderHistory`, thermal printing helpers).
- `src/data/`: Structured static datasets (`companyProfile.json`, `chatbot/`).
- `src/utils/`: Core logic (`product.ts`, `cart.ts`, `productSeo.ts`, `schema.ts`, `tracking.ts`, `api.ts`).
- `supabase/migrations/`: SQL schema and data migrations (`001` through `011_seo_product_descriptions.sql`).

## SEO, Static Pre-rendering & AI-SEO (`llms.txt`) System
To ensure every `/product/:slug` URL, WhatsApp/Telegram link preview, Googlebot crawl, and AI assistant citation (ChatGPT, Gemini, Claude, Perplexity) receives rich metadata and pricing without requiring client-side JS execution:

1. **Single Source of Truth (`src/utils/productSeo.ts`)**:
   - Maps all 50 product IDs (`PRODUCT_SEO_MAP`) to GSC keyword-backed `seoTitle`, descriptive `imageAlt`, and natural commercial `description` copy.
   - Expands local search coverage naturally across **Bandar Lampung** (Tanjung Karang, Kedaton, Rajabasa, Sukarame, Teluk Betung, Kemiling, Way Halim), **Way Hui / Jati Agung** (near ITERA & UIN Raden Intan), **Kota Metro**, **Natar**, **Pringsewu**, and **Pesawaran**.
   - Keeps `product.name` concise so 58mm thermal POS receipts and existing `/product/:slug` slugs remain clean and unbroken.
   - Marks internal checkout helper items (`Jasa Express` ID `2001` and `Ongkir` ID `2002`) as non-indexable (`noindex, nofollow` and excluded from `sitemap.xml` / `llms.txt`).

2. **Structured Data / JSON-LD (`src/utils/schema.ts` & `src/components/common/SEO.tsx`)**:
   - Homepage (`/`) injects `PrintShop` (`LocalBusiness` subtype with geo coordinates, opening hours, contact, `areaServed`, and `aggregateRating`) + `FAQPage`.
   - Product routes (`/product/:slug`) inject `Product` (with `AggregateOffer` `lowPrice`/`highPrice` in `IDR` across wholesale tiers) + `BreadcrumbList`, alongside `<link rel="canonical">` and encoded absolute OpenGraph/Twitter image URLs.

3. **Build-Time Pre-rendering & AI Readiness (`scripts/prerender-seo.mjs`)**:
   - Hooked automatically into `npm run build` (`vite build && node scripts/prerender-seo.mjs`).
   - Run `npm run seo:sync` (`node scripts/prerender-seo.mjs --sync-catalog`) whenever `PRODUCT_SEO_MAP` in `src/utils/productSeo.ts` is updated to sync `public/products.json` and regenerate `supabase/migrations/011_seo_product_descriptions.sql`.
   - Generates `public/llms.txt` (concise `llmstxt.org` directory) and `public/llms-full.txt` (full product specs, wholesale tier tables, variants, and FAQs), exposed via `Link: <https://idcardlampung.com/llms.txt>; rel="llms-txt"` in `public/_headers` and `<link rel="alternate" type="text/plain" href="/llms.txt">` in `index.html`.
   - Pre-renders static HTML files into `dist/product/<slug>/index.html` and secondary static routes (`dist/about/index.html`, `dist/katalog/index.html`, `dist/blog/index.html`, `dist/loker/index.html`) so Cloudflare Pages serves route-specific `<head>` tags and semantic fallback HTML directly before React mounts.
   - `public/_redirects` places `/* /index.html 200` at the end so static files and pre-rendered directories resolve first.

## Analytics, GTM & Attribution System (`src/utils/tracking.ts`)
The storefront is instrumented for Google Tag Manager (`GTM-NWMHFNRB`), Google Analytics 4 (`G-F19TEH47TH`), and Ad platforms using `dataLayer.push`:
- **SPA Virtual Pageviews (`src/components/common/AnalyticsTracker.tsx`)**: Pushes `page_view` events on React Router navigation changes including `/product/:slug` modal deep-links.
- **Traffic Source Attribution (`initTrafficSourceCapture`, `getTrafficSource`)**: Captures UTM parameters or referrer channels (Instagram, TikTok, Google, Facebook, Pinterest, Direct) into `localStorage` and appends `Sumber: [Traffic Source]` to WhatsApp checkout messages.
- **E-Commerce Funnel Events**: `select_item`, `view_item`, `add_to_cart`, and `purchase` / `checkout_wa` with `transaction_id`, `value`, `currency: 'IDR'`, `items`, and `traffic_source`.

## Design, UI/UX & Code Rules
- **Strict Ban on Emojis**: Never use emojis anywhere in source code, UI components, JSX, HTML, CSS, JSON, SQL migrations, comments, logs, user notifications, or repository documentation. Always use Lucide React SVG icons or clean, professional text.
- **Fluid Animations**: Every interactive UI transition (toasts, modals, drawers, accordions, floating bubbles) must be fluid and include both IN and OUT animation sequences.
