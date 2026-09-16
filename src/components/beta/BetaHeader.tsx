import React, { useRef, useEffect } from "react";
import { Search, ShoppingCart, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface BetaHeaderProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const BetaHeader: React.FC<BetaHeaderProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  cartCount,
  onOpenCart,
}) => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-[#E7E5E4] transition-all">
      {/* Top Banner Notice */}
      <div className="bg-[#18181B] text-[#FAFAF9] text-xs py-1.5 px-4 text-center font-medium tracking-tight">
        <span>Tampilan Beta Toko Tidurlah — Pengalaman belanja modern, cepat, dan presisi. </span>
        <button
          onClick={() => navigate("/")}
          className="underline ml-2 hover:text-[#E8590C] transition-colors"
        >
          Kembali ke Tampilan Utama
        </button>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/beta")}
              className="flex items-center gap-2.5 text-left group"
            >
              <img
                src="/product-image/Logo Tidurlah Grafika 1x1 outlined.png"
                alt="Tidurlah Store"
                className="w-9 h-9 object-contain"
              />
              <div className="hidden sm:block leading-none">
                <span className="font-semibold text-base text-[#18181B] tracking-tight block">
                  Tidurlah Store
                </span>
                <span className="text-[11px] text-[#71717A] tracking-wider uppercase">
                  Percetakan & Merchandise
                </span>
              </div>
            </button>
          </div>

          {/* Search Input with shortcut hint */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari produk (contoh: ID Card, Lanyard, Banner)..."
                className="w-full bg-white border border-[#E7E5E4] rounded-lg pl-9 pr-8 py-2 text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#E8590C] focus:ring-1 focus:ring-[#E8590C] transition-all"
              />
              {searchTerm ? (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#71717A] hover:text-[#18181B]"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="hidden md:block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#A1A1AA] bg-[#F4F4F5] border border-[#E4E4E7] px-1.5 py-0.5 rounded">
                  /
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#18181B] text-white hover:bg-[#27272A] active:scale-[0.98] transition-all text-sm font-medium"
              aria-label="Lihat Keranjang"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.25 }}
                    className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-semibold bg-[#E8590C] text-white rounded-full font-mono"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Category Navigation Strip */}
        <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-2.5 border-t border-[#F0EFEB]">
          <button
            onClick={() => onSelectCategory("Semua")}
            className={`relative px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
              activeCategory === "Semua"
                ? "text-white"
                : "text-[#52525B] hover:text-[#18181B] hover:bg-white/80"
            }`}
          >
            {activeCategory === "Semua" && (
              <motion.div
                layoutId="activeCategoryIndicator"
                className="absolute inset-0 bg-[#18181B] rounded-md -z-10 shadow-sm"
                transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
              />
            )}
            Semua Produk
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`relative px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                activeCategory === cat
                  ? "text-white"
                  : "text-[#52525B] hover:text-[#18181B] hover:bg-white/80"
              }`}
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 bg-[#18181B] rounded-md -z-10 shadow-sm"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
                />
              )}
              {cat}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
