import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Percent, ShieldCheck, Search } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "@/components/common/SEO";
import { BetaHeader } from "@/components/beta/BetaHeader";
import { BetaProductCard } from "@/components/beta/BetaProductCard";
import { BetaProductModal } from "@/components/beta/BetaProductModal";
import { BetaCartDrawer } from "@/components/beta/BetaCartDrawer";
import type { Product, CartItem } from "@/types/product";
import { fetchProductsFromSupabase } from "@/services/products";
import { findProductBySlug } from "@/utils/product";

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

  // Open modal for a product (stabilized reference for React.memo)
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  // Close modal with graceful exit animation
  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (slug) {
      navigate("/beta", { replace: true });
    }
    setTimeout(() => {
      setSelectedProduct(null);
    }, 220);
  };

  // Calculate loading status safely
  const isActuallyLoading = isLoading && allProducts.length === 0;

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#18181B] font-sans flex flex-col selection:bg-[#E8590C]/20 selection:text-[#E8590C]">
      <SEO
        title="Tidurlah Store — Percetakan & Merchandise Cepat & Presisi"
        description="Pusat cetak ID Card, tali lanyard, media promosi, dan merchandise di Bandar Lampung. Pesan online cepat via WhatsApp tanpa minimal order."
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
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-10">
        {/* Editorial Hero Intro */}
        <div className="border-b border-[#E7E5E4] pb-8 space-y-4">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#18181B] tracking-tight">
              Cetak Cepat ID Card, Lanyard & Merchandise Tanpa Minimum Order
            </h1>
            <p className="text-sm sm:text-base text-[#52525B] leading-relaxed">
              Layanan cetak resmi & merchandise custom berkualitas tinggi di Bandar Lampung. Pesan satuan maupun partai besar, garansi warna presisi sesuai file desain, pengerjaan kilat mulai 1 hari kerja, dan diskon grosir bertingkat otomatis.
            </p>
          </div>

          {/* Craft & Service Pillars (Strictly zero emojis) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white border border-[#E7E5E4] hover:border-[#18181B] transition-colors">
              <Clock className="w-4 h-4 text-[#E8590C] flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-[#18181B] block">Produksi Kilat 1–3 Hari</span>
                <span className="text-[#71717A]">Pengerjaan cepat & tepat waktu untuk event Anda</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white border border-[#E7E5E4] hover:border-[#18181B] transition-colors">
              <Percent className="w-4 h-4 text-[#E8590C] flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-[#18181B] block">Diskon Grosir Bertingkat</span>
                <span className="text-[#71717A]">Makin banyak kuantiti cetak, harga per pcs makin hemat</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white border border-[#E7E5E4] hover:border-[#18181B] transition-colors">
              <ShieldCheck className="w-4 h-4 text-[#E8590C] flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-[#18181B] block">Garansi Kualitas Presisi</span>
                <span className="text-[#71717A]">Warna tajam & akurat sesuai profil file desain</span>
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Section */}
        <div className="space-y-6">
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
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.03,
                  },
                },
              }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, transform: "translateY(12px)" },
                    visible: {
                      opacity: 1,
                      transform: "translateY(0px)",
                      transition: {
                        duration: 0.25,
                        ease: [0.23, 1, 0.32, 1],
                      },
                    },
                  }}
                >
                  <BetaProductCard
                    product={product}
                    onSelect={handleSelectProduct}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7E5E4] bg-white py-8 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/product-image/Logo Tidurlah Grafika 1x1 outlined.png"
              alt="Tidurlah Store"
              className="w-6 h-6 object-contain"
            />
            <span className="font-semibold text-[#18181B]">Tidurlah Store</span>
            <span>—</span>
            <span>Percetakan & Merchandise Lampung</span>
          </div>
          <p>© {new Date().getFullYear()} Tidurlah Grafika. Seluruh hak cipta dilindungi.</p>
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
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        products={productsData}
      />
    </div>
  );
};

export default StorefrontBeta;
