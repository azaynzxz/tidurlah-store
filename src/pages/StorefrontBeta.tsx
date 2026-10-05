import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Percent, ShieldCheck, Search, MapPin, Phone, Mail, ExternalLink, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "@/components/common/SEO";
import { BetaHeader } from "@/components/beta/BetaHeader";
import { BetaProductCard } from "@/components/beta/BetaProductCard";
import { BetaProductModal } from "@/components/beta/BetaProductModal";
import { BetaCartDrawer } from "@/components/beta/BetaCartDrawer";
import { BetaOrdersDrawer } from "@/components/beta/BetaOrdersDrawer";
import { BetaBannerCarousel, BannerSlide } from "@/components/beta/BetaBannerCarousel";
import type { Product, CartItem } from "@/types/product";
import { fetchProductsFromSupabase } from "@/services/products";
import { findProductBySlug, generateProductSlug } from "@/utils/product";
import { getLocalOrders } from "@/utils/localOrders";

export const StorefrontBeta: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // State
  const [productsData, setProductsData] = useState<Record<string, Product[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cartItems");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [ordersCount, setOrdersCount] = useState<number>(() => {
    try {
      return getLocalOrders().length;
    } catch {
      return 0;
    }
  });

  // Centralized body scroll lock prevents conflicting cleanups and mobile layout jitter
  useEffect(() => {
    const isAnyOverlayOpen = isCartOpen || isOrdersOpen || isModalOpen;
    if (isAnyOverlayOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen, isOrdersOpen, isModalOpen]);

  // Sync cart items with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart items to localStorage", e);
    }
  }, [cartItems]);

  // Load products
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProductsFromSupabase();
        if (isMounted && data && Object.keys(data).length > 0) {
          setProductsData(data);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local products.json", err);
      }

      try {
        const res = await fetch("/products.json");
        const json = await res.json();
        if (isMounted) {
          setProductsData(json);
        }
      } catch (fallbackErr) {
        console.error("Failed to load products fallback", fallbackErr);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle URL slug parameter (e.g. /beta/product/:slug)
  useEffect(() => {
    if (slug && Object.keys(productsData).length > 0) {
      const found = findProductBySlug(slug, productsData);
      if (found) {
        setSelectedProduct(found);
        setIsModalOpen(true);
      }
    }
  }, [slug, productsData]);

  // Categories list
  const categories = useMemo(() => Object.keys(productsData), [productsData]);

  // Flattened products list
  const allProducts = useMemo(() => {
    return Object.values(productsData).flat();
  }, [productsData]);

  // Filtered products based on category and search
  const filteredProducts = useMemo(() => {
    let list = activeCategory === "Semua" ? allProducts : productsData[activeCategory] || [];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeCategory, allProducts, productsData, searchTerm]);

  // Mutually exclusive drawer handlers prevent concurrent drawer overlap & mobile glitching
  const handleOpenCart = useCallback(() => {
    setIsOrdersOpen(false);
    setIsModalOpen(false);
    setIsCartOpen(true);
  }, []);

  const handleCloseCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const handleOpenOrders = useCallback(() => {
    setIsCartOpen(false);
    setIsModalOpen(false);
    setOrdersCount(getLocalOrders().length);
    setIsOrdersOpen(true);
  }, []);

  const handleCloseOrders = useCallback(() => {
    setIsOrdersOpen(false);
    setOrdersCount(getLocalOrders().length);
  }, []);

  // Open modal for a product (stabilized reference for React.memo)
  const handleSelectProduct = useCallback((product: Product) => {
    setIsCartOpen(false);
    setIsOrdersOpen(false);
    setSelectedProduct(product);
    setIsModalOpen(true);
    const productSlug = generateProductSlug(product.name);
    if (productSlug) {
      const isBeta = window.location.pathname.startsWith("/beta");
      navigate(isBeta ? `/beta/product/${productSlug}` : `/product/${productSlug}`, { replace: true });
    }
  }, [navigate]);

  // Close modal with graceful exit animation
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    if (slug) {
      const isBeta = window.location.pathname.startsWith("/beta");
      navigate(isBeta ? "/beta" : "/", { replace: true });
    }
    setTimeout(() => {
      setSelectedProduct(null);
    }, 220);
  }, [slug, navigate]);

  // Handle banner clicks (smoothly scroll to catalog and apply relevant category/search filters)
  const handleBannerClick = useCallback((banner: BannerSlide) => {
    if (banner.targetCategory) {
      setActiveCategory(banner.targetCategory);
    }
    if (banner.searchTerm) {
      setSearchTerm(banner.searchTerm);
    } else if (banner.targetCategory) {
      setSearchTerm("");
    }

    const catalogElem = document.getElementById("catalog-section");
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Calculate loading status safely
  const isActuallyLoading = isLoading && allProducts.length === 0;

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#18181B] font-sans flex flex-col selection:bg-[#E8590C]/20 selection:text-[#E8590C]">
      <SEO
        title="idcardlampung.com — Percetakan & Merchandise Cepat & Presisi"
        description="Pusat cetak ID Card, tali lanyard, media promosi, dan merchandise di Bandar Lampung. Pesan online cepat via WhatsApp tanpa minimal order di idcardlampung.com."
        url={slug ? `https://idcardlampung.com/product/${slug}` : "https://idcardlampung.com/"}
      />

      {/* Header */}
      <BetaHeader
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchTerm("");
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={handleOpenCart}
        ordersCount={ordersCount}
        onOpenOrders={handleOpenOrders}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8 sm:pb-12 space-y-5 sm:space-y-8">
        {/* Hidden Semantic H1 for SEO Integrity */}
        <h1 className="sr-only">
          Cetak Cepat ID Card, Lanyard & Merchandise Tanpa Minimum Order — idcardlampung.com Bandar Lampung
        </h1>

        {/* Web Banner Carousel & Craft Service Pillars */}
        <div className="space-y-4 sm:space-y-6 pb-2 border-b border-[#E7E5E4]">
          <BetaBannerCarousel onBannerClick={handleBannerClick} />

          {/* Craft & Service Pillars (Strictly zero emojis) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#18181B] transition-colors shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#E8590C]/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-[#E8590C]" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-[#18181B] block">Produksi Kilat 1–3 Hari</span>
                <span className="text-[#71717A]">Pengerjaan cepat & tepat waktu untuk event Anda</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#18181B] transition-colors shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#E8590C]/10 flex items-center justify-center flex-shrink-0">
                <Percent className="w-4 h-4 text-[#E8590C]" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-[#18181B] block">Diskon Grosir Bertingkat</span>
                <span className="text-[#71717A]">Makin banyak kuantiti cetak, harga per pcs makin hemat</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#18181B] transition-colors shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#E8590C]/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#E8590C]" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-[#18181B] block">Garansi Kualitas Presisi</span>
                <span className="text-[#71717A]">Warna tajam & akurat sesuai profil file desain</span>
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Section */}
        <div id="catalog-section" className="space-y-6">
          {/* Section Heading & Result Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EFEB] pb-3">
            <div>
              <h2 className="text-lg font-semibold text-[#18181B]">
                {activeCategory === "Semua" ? "Semua Produk" : activeCategory}
              </h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                Menampilkan {filteredProducts.length} produk
                {searchTerm && ` untuk kata kunci "${searchTerm}"`}
              </p>
            </div>
          </div>

          {/* Product Grid */}
          {isActuallyLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-[#E7E5E4] rounded-xl p-4 space-y-3 animate-pulse">
                  <div className="aspect-square bg-[#F5F5F4] rounded-lg" />
                  <div className="h-4 bg-[#F5F5F4] rounded w-3/4" />
                  <div className="h-3 bg-[#F5F5F4] rounded w-1/2" />
                  <div className="h-8 bg-[#F5F5F4] rounded mt-4" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
              <Search className="w-8 h-8 text-[#A1A1AA] mx-auto" />
              <h3 className="text-base font-semibold text-[#18181B]">Produk tidak ditemukan</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Tidak ada produk yang cocok dengan pencarian &quot;{searchTerm}&quot;. Silakan coba kata kunci lain atau pilih kategori lain.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("Semua");
                }}
                className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-[#18181B] text-white text-xs font-medium hover:bg-[#27272A] active:scale-[0.98] transition-all"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <BetaProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Clean Storefront Footer with Google Maps & Contacts */}
      <footer className="border-t border-[#E7E5E4] bg-white mt-16 text-[#52525B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Column 1: Brand info (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/product-image/Logo Tidurlah Grafika 1x1 outlined.png"
                  alt="idcardlampung.com"
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <span className="font-bold text-base text-[#18181B] block">idcardlampung.com</span>
                  <span className="text-xs text-[#71717A]">Percetakan & Merchandise Lampung</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-[#71717A]">
                Pusat cetak resmi ID Card, tali lanyard custom presisi, plakat akrilik, dan aneka merchandise event di Bandar Lampung. Melayani pesanan satuan hingga ribuan pcs tanpa minimum order.
              </p>
            </div>

            {/* Column 2: Kontak & Jam Buka (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="font-semibold text-sm text-[#18181B] tracking-tight">Kontak & Layanan</h3>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#E8590C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#18181B] block">WhatsApp CS</span>
                    <a href="https://wa.me/6285172157808" target="_blank" rel="noopener noreferrer" className="hover:text-[#E8590C] transition-colors">
                      +62 851-7215-7808
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-[#E8590C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#18181B] block">Email</span>
                    <a href="mailto:cs@idcardlampung.com" className="hover:text-[#E8590C] transition-colors">
                      cs@idcardlampung.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#E8590C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#18181B] block">Jam Operasional</span>
                    <span>Senin – Sabtu: 08.00 – 17.30 WIB</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 3: Google Maps Embed (5 cols) */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-[#18181B] tracking-tight flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#E8590C]" />
                  <span>Lokasi Studio & Workshop</span>
                </h3>
                <a
                  href="https://maps.app.goo.gl/XVJYoKbzU5FRwVuJA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#E8590C] hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka Maps ↗</span>
                </a>
              </div>

              {/* Google Maps Embed Frame */}
              <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-[#E7E5E4] bg-[#F5F5F4] shadow-xs">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d358.8368063702099!2d105.3159073944683!3d-5.352631091802125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40c384e8ee58ef%3A0xa4e876abbc74d8a5!2sTidurlah%20Grafika!5e1!3m2!1sen!2sid!4v1762012258485!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Peta Lokasi Studio Tidurlah Grafika Belwis Lampung"
                  className="w-full h-full"
                />
              </div>

              <p className="text-[11px] sm:text-xs text-[#71717A] leading-relaxed">
                Perumahan Pemda (Belwis), Way Hui, Kec. Jati Agung, Lampung Selatan 35365
              </p>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-[#E7E5E4] mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
            <p>© {new Date().getFullYear()} idcardlampung.com • Seluruh hak cipta dilindungi.</p>
            <div className="flex items-center gap-4">
              <a href="/classic" className="hover:text-[#18181B] transition-colors">Versi Klasik</a>
              <span>•</span>
              <a href="/loker" className="hover:text-[#18181B] transition-colors">Lowongan Kerja</a>
              <span>•</span>
              <a href="/hello" className="hover:text-[#18181B] transition-colors">Kontak</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Product Options Modal */}
      <BetaProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cartItems={cartItems}
        setCartItems={setCartItems}
      />

      {/* Cart & Direct Checkout Drawer */}
      <BetaCartDrawer
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        cartItems={cartItems}
        setCartItems={setCartItems}
        products={productsData}
        onOrderSuccess={() => {
          setIsCartOpen(false);
          setOrdersCount(getLocalOrders().length);
          setIsOrdersOpen(true);
        }}
      />

      {/* Pesanan Saya (Local Order History) Drawer */}
      <BetaOrdersDrawer
        isOpen={isOrdersOpen}
        onClose={handleCloseOrders}
        onOpenShop={() => {
          handleCloseOrders();
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default StorefrontBeta;
