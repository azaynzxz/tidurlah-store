import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Minus, Plus, Clock, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, CartItem } from "@/types/product";
import { caseVariants, idCardWithCaseIds, stikerWithLaminationIds } from "@/constants";
import { getApplicablePrice, calculateSavings, calculateBannerPrice } from "@/utils/product";
import { addToCart, addBannerToCart } from "@/utils/cart";

interface BetaProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export const BetaProductModal: React.FC<BetaProductModalProps> = ({
  product,
  isOpen,
  onClose,
  cartItems,
  setCartItems,
}) => {
  // Preserve last valid product during exit animation
  const lastProductRef = useRef<Product | null>(product);
  if (product) {
    lastProductRef.current = product;
  }
  const activeProduct = product || lastProductRef.current;

  // Local configuration states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedLamination, setSelectedLamination] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [bannerWidth, setBannerWidth] = useState(1);
  const [bannerHeight, setBannerHeight] = useState(1);
  const [showAngryCase, setShowAngryCase] = useState(false);
  const [showAngryLamination, setShowAngryLamination] = useState(false);
  const [showAngryQuantity, setShowAngryQuantity] = useState(false);

  // Reset states whenever modal opens for a new product
  useEffect(() => {
    if (product && isOpen) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setSelectedCase("");
      setSelectedLamination("");
      setShowAngryCase(false);
      setShowAngryLamination(false);
      setShowAngryQuantity(false);
      setBannerWidth(1);
      setBannerHeight(1);
      if (product?.models && product.models.length > 0) {
        setSelectedModel(product.models[0].code);
      } else {
        setSelectedModel("");
      }
    }
  }, [product, isOpen]);

  // Clean dismiss of validation alerts when modal closes
  const handleModalClose = () => {
    toast.dismiss("case-validation-toast");
    toast.dismiss("lamination-validation-toast");
    toast.dismiss("model-validation-toast");
    toast.dismiss("quantity-validation-toast");
    setShowAngryCase(false);
    setShowAngryLamination(false);
    setShowAngryQuantity(false);
    onClose();
  };

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleModalClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Image resolution logic
  const isDimensional = activeProduct?.pricingMethod === "dimensional";
  const hasModels = Boolean(activeProduct?.models && activeProduct.models.length > 0);
  const needsCase = activeProduct ? idCardWithCaseIds.includes(activeProduct.id) : false;
  const needsLamination = activeProduct ? (stikerWithLaminationIds.includes(activeProduct.id) || Boolean(activeProduct.laminationOptions && activeProduct.laminationOptions.length > 0)) : false;

  // Determine current active preview image
  const activeImage = useMemo(() => {
    if (!activeProduct) return "";
    if (selectedModel && activeProduct.models) {
      const found = activeProduct.models.find((m) => m.code === selectedModel);
      if (found?.image) return found.image;
    }
    const allImages = [activeProduct.image, ...(activeProduct.additionalImages || [])];
    return allImages[currentImageIndex] || activeProduct.image || "";
  }, [activeProduct, selectedModel, currentImageIndex]);

  // Calculations
  const unitPrice = useMemo(() => {
    if (!activeProduct) return 0;
    if (isDimensional) {
      return calculateBannerPrice(activeProduct, bannerWidth, bannerHeight);
    }
    return getApplicablePrice(activeProduct, quantity, selectedModel);
  }, [activeProduct, quantity, selectedModel, isDimensional, bannerWidth, bannerHeight]);

  const totalCalculatedPrice = unitPrice * quantity;
  const totalSavings = useMemo(() => {
    if (!activeProduct || isDimensional) return 0;
    return calculateSavings(activeProduct, quantity, selectedModel);
  }, [activeProduct, quantity, selectedModel, isDimensional]);

  // Handle Add to Cart submission
  const handleAddToCart = () => {
    if (!activeProduct) return;
    if (isDimensional) {
      const success = addBannerToCart(activeProduct, bannerWidth, bannerHeight, cartItems, setCartItems);
      if (success) {
        handleModalClose();
      }
      return;
    }

    const success = addToCart(
      activeProduct,
      cartItems,
      setCartItems,
      selectedModel,
      selectedCase,
      selectedLamination,
      setShowAngryCase,
      setShowAngryLamination,
      setShowAngryQuantity,
      undefined,
      quantity
    );

    if (success) {
      handleModalClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ willChange: "opacity" }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleModalClose}
          />

          {/* Modal Card */}
          <motion.div
            key="modal-card"
            initial={{ opacity: 0, transform: "scale(0.95) translateY(12px)" }}
            animate={{ opacity: 1, transform: "scale(1) translateY(0px)" }}
            exit={{ opacity: 0, transform: "scale(0.96) translateY(8px)" }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ willChange: "transform, opacity" }}
            className="relative w-full max-w-2xl bg-white border border-[#E7E5E4] rounded-2xl shadow-2xl overflow-hidden z-10 my-auto pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 pr-12 border-b border-[#F0EFEB] flex items-center justify-between relative">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#18181B]">
                  {activeProduct.name}
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">{activeProduct.category}</p>
              </div>

              <button
                onClick={handleModalClose}
                className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 p-2 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] active:scale-90 transition-all duration-150"
                aria-label="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

        <div className="max-h-[75vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Visual & Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Left: Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5F5F4] border border-[#E7E5E4]">
                <img
                  src={activeImage}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover"
                />
                {activeProduct.time && (
                  <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white/95 text-[#18181B] shadow-sm border border-[#E7E5E4]/80">
                    <Clock className="w-3 h-3 text-[#71717A]" />
                    {activeProduct.time}
                  </span>
                )}
              </div>

              {/* Thumbnails Row (Clean, unclipped padding) */}
              {hasModels && activeProduct.models ? (
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1.5 px-1">
                  {activeProduct.models.map((model) => (
                    <button
                      key={model.code}
                      onClick={() => {
                        setSelectedModel(model.code);
                        toast.dismiss("model-validation-toast");
                      }}
                      className={`relative flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden transition-all duration-150 active:scale-95 ${
                        selectedModel === model.code
                          ? "ring-2 ring-[#E8590C] ring-offset-2 ring-offset-white"
                          : "border border-[#E7E5E4] hover:border-[#18181B] opacity-75 hover:opacity-100"
                      }`}
                      title={model.code}
                    >
                      <img src={model.image} alt={model.code} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                [activeProduct.image, ...(activeProduct.additionalImages || [])].length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1.5 px-1">
                    {[activeProduct.image, ...(activeProduct.additionalImages || [])].map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden transition-all duration-150 active:scale-95 ${
                          currentImageIndex === idx
                            ? "ring-2 ring-[#E8590C] ring-offset-2 ring-offset-white"
                            : "border border-[#E7E5E4] hover:border-[#18181B] opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt={`Gambar ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Right: Options & Specifications */}
            <div className="space-y-4">
              <p className="text-xs text-[#52525B] leading-relaxed">
                {activeProduct.description}
              </p>

              {/* Dimensional Products (Banners) */}
              {isDimensional && (
                <div className="p-3.5 bg-[#F9F9F8] rounded-xl border border-[#E7E5E4] space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#18181B]">
                    <span>Ukuran Banner (Meter)</span>
                    <span className="text-[#71717A]">
                      Luas: {(bannerWidth * bannerHeight).toFixed(2)} m²
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] text-[#71717A] block mb-1">Lebar (m)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={bannerWidth}
                        onChange={(e) => setBannerWidth(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                        className="w-full bg-white border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 text-sm text-[#18181B] focus:outline-none focus:border-[#E8590C]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#71717A] block mb-1">Tinggi (m)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={bannerHeight}
                        onChange={(e) => setBannerHeight(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                        className="w-full bg-white border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 text-sm text-[#18181B] focus:outline-none focus:border-[#E8590C]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Case Variant Selection */}
              {needsCase && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#18181B]">
                      Pilihan Casing
                    </span>
                    {!selectedCase && (
                      <span className="text-[11px] text-[#E8590C] font-medium">
                        Wajib dipilih
                      </span>
                    )}
                  </div>
                  <div
                    id="case-selection-container"
                    className={`grid grid-cols-2 gap-2 transition-all ${
                      showAngryCase ? "ring-2 ring-red-500/50 p-1.5 rounded-lg bg-red-50/30" : ""
                    }`}
                  >
                    {caseVariants.map((variant) => (
                      <button
                        key={variant.code}
                        onClick={() => {
                          setSelectedCase(variant.code);
                          toast.dismiss("case-validation-toast");
                          setShowAngryCase(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all active:scale-[0.98] ${
                          selectedCase === variant.code
                            ? "bg-[#18181B] text-white border-[#18181B]"
                            : "bg-white text-[#18181B] border-[#E7E5E4] hover:border-[#18181B]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{variant.name}</span>
                          {selectedCase === variant.code && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lamination Selection */}
              {needsLamination && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#18181B]">
                      Pilihan Laminasi
                    </span>
                    {!selectedLamination && (
                      <span className="text-[11px] text-[#E8590C] font-medium">
                        Wajib dipilih
                      </span>
                    )}
                  </div>
                  <div
                    id="lamination-selection-container"
                    className={`grid grid-cols-2 gap-2 transition-all ${
                      showAngryLamination ? "ring-2 ring-red-500/50 p-1.5 rounded-lg bg-red-50/30" : ""
                    }`}
                  >
                    {(activeProduct.laminationOptions || [
                      { type: "Glossy" },
                      { type: "Doff / Matte" },
                    ]).map((lam) => (
                      <button
                        key={lam.type}
                        onClick={() => {
                          setSelectedLamination(lam.type);
                          toast.dismiss("lamination-validation-toast");
                          setShowAngryLamination(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all active:scale-[0.98] ${
                          selectedLamination === lam.type
                            ? "bg-[#18181B] text-white border-[#18181B]"
                            : "bg-white text-[#18181B] border-[#E7E5E4] hover:border-[#18181B]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{lam.type}</span>
                          {selectedLamination === lam.type && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[#18181B]">Jumlah Pesanan</span>
                  <span className="text-[11px] text-[#71717A]">
                    {activeProduct.unit ? `Satuan: ${activeProduct.unit}` : "Tanpa minimal order"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-[#E7E5E4] rounded-lg bg-white overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-[#71717A] hover:text-[#18181B] active:scale-90 disabled:opacity-40 transition-all duration-100"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 text-center font-mono font-semibold text-sm text-[#18181B] py-1.5 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2 text-[#71717A] hover:text-[#18181B] active:scale-90 transition-all duration-100"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-[#71717A]">pcs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wholesale Pricing Table (Visual Structure as Information) */}
          {activeProduct.priceThresholds && activeProduct.priceThresholds.length > 1 && (
            <div className="border border-[#E7E5E4] rounded-xl overflow-hidden bg-[#FAFAF9]">
              <div className="bg-[#F5F5F4] px-3.5 py-2 border-b border-[#E7E5E4] flex items-center justify-between text-xs font-semibold text-[#18181B]">
                <span>Tabel Harga Grosir (Makin Banyak, Makin Hemat)</span>
                <span className="text-[11px] text-[#71717A] font-normal">Harga otomatis terpotong</span>
              </div>
              <div className="divide-y divide-[#F0EFEB]">
                {activeProduct.priceThresholds.map((t, idx) => {
                  const nextThreshold = activeProduct.priceThresholds?.[idx + 1];
                  const rangeText = nextThreshold
                    ? `${t.minQuantity} - ${nextThreshold.minQuantity - 1} pcs`
                    : `≥ ${t.minQuantity} pcs`;

                  const isActive =
                    quantity >= t.minQuantity &&
                    (!nextThreshold || quantity < nextThreshold.minQuantity);

                  return (
                    <div
                      key={t.minQuantity}
                      className={`px-3.5 py-2 flex items-center justify-between text-xs transition-colors ${
                        isActive
                          ? "bg-[#18181B] text-white font-medium"
                          : "text-[#52525B] hover:bg-white"
                      }`}
                    >
                      <span>{rangeText}</span>
                      <span className="font-mono font-semibold">
                        Rp {t.price.toLocaleString("id-ID")} / pcs
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Bar */}
        <div className="p-4 sm:p-5 border-t border-[#E7E5E4] bg-[#FAFAF9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#71717A]">Total Perkiraan:</span>
              <span className="text-lg font-bold text-[#18181B] font-mono">
                Rp {totalCalculatedPrice.toLocaleString("id-ID")}
              </span>
            </div>
            {totalSavings > 0 && (
              <span className="text-[11px] font-medium text-emerald-700 block">
                Hemat Rp {totalSavings.toLocaleString("id-ID")} dari harga normal
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#E8590C] hover:bg-[#d04f0a] active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>Tambah ke Keranjang</span>
          </button>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
