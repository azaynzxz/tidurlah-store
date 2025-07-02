# 🎨 TIDURLAH GRAFIKA - E-Commerce Website

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-38B2AC.svg)](https://tailwindcss.com/)

A modern, responsive e-commerce website for **Tidurlah Grafika** - a professional printing and design service company. Built with React, TypeScript, and Tailwind CSS for optimal performance and user experience.

## 🌟 Features

### 🛍️ E-Commerce Core
- **Product Catalog** - Browse through various printing services and products
- **Advanced Search** - Real-time product search functionality
- **Shopping Cart** - Add, remove, and modify cart items with quantity selector
- **Order Processing** - Complete order management with Google Sheets integration
- **Price Calculator** - Dynamic pricing based on quantity thresholds and dimensions

### 🎯 Product Categories
- **ID Cards & Lanyards** - Custom ID card printing with various casing options
- **Stickers** - Cut stickers with lamination choices
- **Banners & Posters** - Roll banners, X-banners, and poster printing
- **Merchandise** - Custom mugs, pins, and promotional items
- **Plakat & Awards** - Decorative plaques with floral designs
- **T-Shirts** - Custom apparel printing

### 🎨 User Experience
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Banner Carousel** - Promotional banners with autoplay and navigation
- **Product Modals** - Detailed product views with image galleries
- **Quantity Validation** - Smart quantity selection with visual feedback
- **Share Functionality** - Share products via native sharing or clipboard
- **Audio Feedback** - Interactive sound effects for better engagement

### 📱 Additional Features
- **Blog System** - Content management for tips and guides
- **Survey System** - Customer feedback collection
- **ChatBot** - AI-powered customer support
- **Music Player** - Background audio experience
- **WhatsApp Integration** - Direct customer communication
- **Google Maps** - Store location integration
- **404 Error Page** - Custom branded error handling

## 🚀 Technology Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.1** - Fast build tool and development server
- **React Router 6.26.2** - Client-side routing

### Styling & UI
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library built on Radix UI
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library

### Key Libraries
- **html2canvas** - Receipt generation and image capture
- **Embla Carousel** - Touch-friendly carousel component
- **React Hook Form** - Form handling and validation
- **Sonner** - Toast notifications
- **Recharts** - Data visualization (for analytics)

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

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## 📁 Project Structure

```
tidurlah-store/
├── public/                     # Static assets
│   ├── banners/               # Banner images
│   ├── product-image/         # Product photos
│   ├── blog-thumbnail/        # Blog post images
│   └── audio/                 # Sound effects
├── src/
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── BannerCarousel.tsx
│   │   ├── Cart.tsx
│   │   ├── ChatBot.tsx
│   │   ├── SearchBar.tsx
│   │   └── ...
│   ├── pages/                # Page components
│   │   ├── Index.tsx         # Main e-commerce page
│   │   ├── Blog.tsx          # Blog listing
│   │   ├── Survey.tsx        # Customer survey
│   │   └── NotFound.tsx      # 404 error page
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── main.tsx              # Application entry point
├── components.json           # shadcn/ui configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies and scripts
```

## 🎯 Key Features Implementation

### Responsive Design
The website adapts seamlessly across devices:
- **Mobile**: 2-column product grid, stacked layout
- **Tablet**: 3-column grid, side-by-side sections
- **Desktop**: 4-column grid, full-width header/footer

### Quantity Selector with Validation
- Visual feedback for invalid quantities
- "Angry wiggle" and "angry pulse" animations
- Smart quantity requirements per product type

### Advanced Product Configuration
- **ID Cards**: Casing options (basic, leather, premium)
- **Stickers**: Lamination choices (glossy, matte, none)
- **Banners**: Dimensional pricing calculator
- **Bulk Orders**: Tiered pricing based on quantity

### Order Management
- Real-time cart updates
- Receipt generation with html2canvas
- Google Sheets integration for order tracking
- WhatsApp redirect for customer communication

## 🌐 Deployment

The project is configured for easy deployment on various platforms:

### Netlify/Vercel
- Build command: `npm run build`
- Publish directory: `dist`
- Includes `_headers` and `_redirects` for SPA routing

### Manual Deployment
1. Run `npm run build`
2. Upload the `dist` folder contents to your web server
3. Configure server for SPA routing (redirect all routes to `index.html`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for **Tidurlah Grafika**. All rights reserved.

## 📞 Support

For support and inquiries:
- **Website**: [tidurlah-store.netlify.app](https://tidurlah-store.netlify.app)
- **WhatsApp**: Available through the website
- **Email**: Contact through the website form

## 🎨 Brand Colors

- **Primary Orange**: `#FF5E01`
- **Background**: `#fff6e5`
- **Text**: `#374151`
- **Success**: `#10B981`
- **Error**: `#EF4444`

---

**Built with ❤️ by the Tidurlah Grafika team**
