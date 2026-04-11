# 🎨 TIDURLAH GRAFIKA — E-Commerce Website

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.103-3ECF8E.svg)](https://supabase.com/)

A modern, responsive e-commerce website for **Tidurlah Grafika** - a professional printing and design service company. Built with React, TypeScript, and Tailwind CSS for optimal performance and user experience.

## 🌟 Features

### 🛍️ Customer Storefront

- **Product Catalog** — Browse & search products with category filtering
- **Shopping Cart** — Add/remove items, quantity selector, promo codes
- **Dynamic Pricing** — Tiered pricing, dimensional pricing (m²), and configurable product options (casing, lamination, models)
- **Order Checkout** — WhatsApp-based order flow with receipt generation (JPG & PDF)
- **Banner Carousel** — Promotional banners with autoplay
- **Product Modals** — Detailed product view with image gallery and options
- **Share Functionality** — Share products via WhatsApp and social media
- **Quantity Validation** — Minimum quantity enforcement for tiered pricing and promo codes
- **Audio Feedback** — Sound effects on chatbot interactions and admin new-order notifications
- **Google Maps** — Embedded store location map on footer/contact
- **404 Error Page** — Custom not-found page with navigation back to store

### 🎯 Product Categories

- ID Cards & Lanyards (multiple casing options)
- Stickers (lamination variants)
- Banners & Posters (dimensional pricing)
- Merchandise (mugs, pins, keychains)
- Plakat & Papan Bunga
- Custom Apparel

### 💼 Admin Dashboard (`/admin`)

- **KPI Dashboard** — Revenue, order count, and trends (today / this week / month / all-time)
- **Order Management** — View, filter, edit, soft-delete, and restore orders
- **Product CRUD** — Add, edit, toggle, and delete products
- **Promo Code Management** — Create/edit promo codes with date ranges, usage limits, and override pricing
- **Monthly Reports** — Charts and tables with daily breakdown, top products, and cashier performance
- **Realtime Notifications** — New order alerts via Supabase Realtime

### 🧾 POS System (`/cashier`)

- Full in-store transaction processing
- Product grid with category tabs and search
- Cart with delivery info dialog
- Receipt generation and order history
- Edit existing orders

### 📝 Blog (`/blog`)

- Blog listing with category filter and search
- Individual blog post pages with slug-based routing
- Featured posts, sidebar widgets, and Instagram embeds

### 📋 Recruitment Portal (`/loker`)

- Job listings with requirements and qualifications
- Application form with CV & portfolio upload (to Supabase Storage)
- Dual-write to Google Sheets for backup

### 🛠️ Tools & Utilities

- **Twibbon Maker** (`/twibbon`) — Canvas-based photo frame editor
- **ID Card Layout Designer** (`/layout`) — Multi-layout ID card design tool
- **Katalog Gallery** (`/katalog`) — Filterable portfolio/gallery of completed work
- **Customer Survey** (`/survey`) — Multi-step feedback form
- **ChatBot** — AI-powered customer support widget
- **Music Player** — Background audio experience

### 🔐 Authentication

- Supabase Auth (email + password)
- Role-based access: **Admin** and **Cashier**
- Session persistence across page refreshes
- Blocked login error handling

## 🚀 Technology Stack

### Frontend

| Technology    | Version | Purpose                      |
| ------------- | ------- | ---------------------------- |
| React         | 18.3.1  | UI framework                 |
| TypeScript    | 5.5.3   | Type safety                  |
| Vite          | 5.4.1   | Build tool & dev server      |
| React Router  | 6.26.2  | Client-side routing          |
| Tailwind CSS  | 3.4.11  | Utility-first styling        |
| shadcn/ui     | —       | Component library (Radix UI) |
| Framer Motion | 12.19.2 | Animations                   |
| Lucide React  | 0.462.0 | Icon library                 |

### Backend & Data

| Technology                  | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| Supabase (PostgreSQL)       | Primary database, auth, storage, realtime |
| Google Sheets + Apps Script | Backup data layer (dual-write)            |
| Supabase Storage            | File uploads (CV, portfolios)             |
| Supabase Realtime           | Live order notifications                  |
| Supabase RPC                | Dashboard analytics & reports             |

### Key Libraries

| Library               | Purpose                        |
| --------------------- | ------------------------------ |
| @tanstack/react-query | Server state & caching         |
| react-hook-form + zod | Form handling & validation     |
| recharts              | Data visualization             |
| html2canvas + jspdf   | Receipt generation (JPG & PDF) |
| embla-carousel-react  | Touch-friendly carousels       |
| sonner                | Toast notifications            |
| date-fns              | Date utilities                 |

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/azaynzxz/tidurlah-store.git
   cd tidurlah-store
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

   > Without these, the app falls back to Google Sheets / static JSON files.

4. **Start development server**

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:8080` by default.

5. **Build for production**
   ```bash
   npm run build
   ```

## 🛠️ Available Scripts

| Script                     | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `npm run dev`              | Start development server (port 8080)                 |
| `npm run build`            | Build for production                                 |
| `npm run build:dev`        | Build in development mode                            |
| `npm run lint`             | Run ESLint                                           |
| `npm run preview`          | Preview production build                             |
| `npm run optimize:images`  | Convert product images to WebP and update paths      |
| `npm run generate-katalog` | Scan `public/katalog/` and regenerate `katalog.json` |

## 📁 Project Structure

```
tidurlah-store/
├── public/                         # Static assets
│   ├── banners/                   # Promotional banner images
│   ├── product-image/             # Product photos (by category)
│   ├── katalog/                   # Portfolio/gallery images
│   ├── blog-thumbnail/            # Blog post images
│   ├── audio/                     # Sound effects & music
│   ├── icons/                     # App icons
│   ├── products.json              # Fallback product data
│   └── katalog.json               # Generated gallery metadata
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui base components
│   │   ├── admin/                 # Admin dashboard tabs
│   │   ├── pos/                   # POS system components
│   │   ├── blog/                  # Blog layout & widgets
│   │   ├── chatbot/               # ChatBot UI components
│   │   ├── product/               # Product display components
│   │   ├── common/                # Shared components
│   │   ├── animations/            # Animation components
│   │   └── Layouter/              # ID card layout components
│   ├── pages/                     # Route-level page components
│   │   ├── Index.tsx              # Storefront homepage
│   │   ├── Admin.tsx              # Admin dashboard
│   │   ├── Cashier.tsx            # POS interface
│   │   ├── Blog.tsx / BlogPost.tsx
│   │   ├── Katalog.tsx            # Portfolio gallery
│   │   ├── Loker.tsx              # Job listings
│   │   ├── Login.tsx              # Authentication
│   │   ├── Survey.tsx             # Customer survey
│   │   ├── Receipt.tsx            # Order receipt viewer
│   │   ├── TwibbonMaker.tsx       # Photo frame tool
│   │   ├── Layout.tsx             # ID card designer
│   │   ├── Spotlight.tsx          # Contact hub
│   │   └── NotFound.tsx           # 404 page
│   ├── services/                  # Supabase data layer
│   │   ├── products.ts            # Product & promo code CRUD
│   │   ├── orders.ts              # Order CRUD & management
│   │   ├── admin.ts               # Dashboard analytics (RPC)
│   │   ├── applications.ts        # Job apps & surveys
│   │   └── storage.ts             # File uploads
│   ├── contexts/                  # React contexts
│   │   ├── AuthContext.tsx         # Supabase auth state
│   │   ├── ThemeContext.tsx        # Light/dark theme
│   │   ├── DialogContext.tsx       # Global dialog state
│   │   └── PromoBannerContext.tsx  # Promo banner state
│   ├── hooks/                     # Custom hooks
│   │   ├── useSupabaseQuery.ts    # Generic Supabase query hook
│   │   ├── useOrderNotifications.ts # Realtime order alerts
│   │   ├── useChatBot.ts          # ChatBot logic
│   │   └── use-mobile.tsx         # Viewport detection
│   ├── types/                     # TypeScript types
│   │   ├── product.ts             # Product, CartItem, OrderData
│   │   └── supabase.ts            # Database type definitions
│   ├── utils/                     # Utility functions
│   │   ├── api.ts                 # Order submission & WhatsApp flow
│   │   ├── adminApi.ts            # Dashboard data aggregation
│   │   ├── cart.ts                # Cart operations & promo logic
│   │   ├── product.ts             # Slug generation, price calc
│   │   └── receipt*.ts            # Receipt template & PDF export
│   ├── constants/                 # App constants & config
│   ├── content/blog/              # Blog post content files
│   ├── data/chatbot/              # ChatBot knowledge base
│   └── lib/
│       ├── supabase.ts            # Supabase client init
│       └── utils.ts               # General utilities
├── supabase/                      # Database setup
│   ├── migrations/                # SQL migration files (001–005)
│   ├── seed.sql                   # Product & promo seed data
│   └── setup.sql                  # Initial schema setup
├── scripts/                       # Build & migration scripts
│   ├── generate-katalog.js        # Gallery metadata generator
│   ├── optimize-images.mjs        # WebP image converter
│   ├── migrate-sheets-to-supabase.ts # Data migration tool
│   └── google-apps-script/        # Google Sheets integrations
└── database_sample/               # Sample data & AppScript code
```

## 🗄️ Database Architecture

**Primary:** Supabase (PostgreSQL) — **Fallback:** Google Sheets (dual-write)

| Table              | Description                                       |
| ------------------ | ------------------------------------------------- |
| `profiles`         | Users with roles (admin / cashier)                |
| `products`         | Product catalog with pricing, images, and options |
| `promo_codes`      | Discount codes with date ranges and usage limits  |
| `orders`           | Order headers (supports soft-delete)              |
| `order_items`      | Line items per order                              |
| `order_deliveries` | Shipping/delivery information                     |
| `job_applications` | Recruitment submissions                           |
| `survey_responses` | Customer feedback data                            |

**RPC Functions:** `get_orders`, `get_dashboard_data`, `get_monthly_report`, `generate_invoice_number`

## 🎯 Key Features

### Dual-Write Architecture

All mutations write to both Supabase (primary) and Google Sheets (backup). If Supabase is unavailable, the app automatically falls back to Google Sheets or static JSON for reads.

### Responsive Design

- **Mobile**: 2-column product grid, stacked layout
- **Tablet**: 3-column grid, side-by-side sections
- **Desktop**: 4-column grid, full-width layout

### Advanced Product Configuration

- **ID Cards**: Multiple casing options (basic, leather, premium)
- **Stickers**: Lamination choices (glossy, matte, none)
- **Banners**: Width × Height dimensional pricing (per m²)
- **Bulk Orders**: Tiered pricing based on quantity thresholds

## 🌐 Deployment

### Netlify / Vercel

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- Includes `_headers` and `_redirects` for SPA routing

### Manual Deployment

1. Build: `npm run build`
2. The `dist/` folder contains the production-ready static files
3. Deploy to any static hosting provider (Netlify, Vercel, GitHub Pages, etc.)

### Environment Variables

| Variable                        | Required | Description              |
| ------------------------------- | -------- | ------------------------ |
| `VITE_SUPABASE_URL`             | No\*     | Supabase project URL     |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | No\*     | Supabase anon/public key |

> \*The app works without Supabase by falling back to Google Sheets and static JSON files.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for **Tidurlah Grafika**. All rights reserved.

## 📞 Contact

- **Website**: [tidurlah.com](https://tidurlah.com)
- **WhatsApp**: [085172157808](https://wa.me/6285172157808)
- **Instagram**: [@tidurlah_grafika](https://instagram.com/tidurlah_grafika)
- **Location**: Perum. Korpri Raya, Blok D3 No. 3, Sukarame, Bandar Lampung

## 🎨 Brand Colors

| Color          | Hex                | Usage                 |
| -------------- | ------------------ | --------------------- |
| Primary Orange | `#FF5E01`          | Buttons, accents      |
| Brand Blue     | `rgb(1, 132, 255)` | Parent brand identity |
| Background     | `#fff6e5`          | Page background       |
| Text           | `#374151`          | Body text             |
| Success        | `#10B981`          | Positive states       |
| Error          | `#EF4444`          | Negative states       |

---

**Built with ❤️ by the Tidurlah Grafika team**
