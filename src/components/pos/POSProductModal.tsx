import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { calculateBannerPrice as calculateBannerPriceUtil } from "@/utils/product";

interface Product {
  id: number;
  name: string;
  image: string;
  additionalImages: string[];
  description: string;
  price: number;
  discountPrice: number | null;
  category: string;
  priceThresholds?: { minQuantity: number; price: number }[];
  time: string;
  rating: number;
  bestseller?: boolean;
  pricingMethod?: string;
  basePricePerSqm?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  laminationOptions?: { type: string; price: number }[];
  models?: { code: string; image: string }[];
}

interface POSProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, options?: any) => void;
}

export function POSProductModal({ product, isOpen, onClose, onAddToCart }: POSProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedLamination, setSelectedLamination] = useState("");
  const [bannerWidth, setBannerWidth] = useState(1);
  const [bannerHeight, setBannerHeight] = useState(1);

  // Case variants (should match the ones in constants)
  const caseVariants = [
    { code: "transparan", name: "Case Transparan" },
    { code: "putih", name: "Case Putih Susu" },
    { code: "hitam", name: "Case Hitam" },
    { code: "biru", name: "Case Biru" },
    { code: "merah", name: "Case Merah" },
    { code: "tanpa", name: "Tanpa Casing" },
  ];

  // IDs that require case selection
  const idCardWithCaseIds = [1, 2, 6, 7, 8];
  const stikerWithLaminationIds = [15];

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setSelectedModel("");
      setSelectedCase("");
      setSelectedLamination("");
      setBannerWidth(product.minWidth || 1);
      setBannerHeight(product.minHeight || 1);

      // Set default model if product has models
      if (product.models && product.models.length > 0) {
        setSelectedModel(product.models[0].code);
      }
    }
  }, [product]);

  const nextImage = () => {
    if (product) {
      const maxIndex = product.models ? product.models.length - 1 : (product.additionalImages?.length || 0);
      setCurrentImageIndex(prev => (prev < maxIndex ? prev + 1 : 0));
    }
  };

  const prevImage = () => {
    if (product) {
      const maxIndex = product.models ? product.models.length - 1 : (product.additionalImages?.length || 0);
      setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
    }
  };

  const getApplicablePrice = (product: Product, quantity: number) => {
    if (product.priceThresholds && product.priceThresholds.length > 0) {
      // Find the appropriate price threshold
      const applicableThreshold = product.priceThresholds
        .slice()
        .reverse()
        .find(threshold => quantity >= threshold.minQuantity);

      if (applicableThreshold) {
        return applicableThreshold.price;
      }
    }

    return product.discountPrice || product.price;
  };

  // Use the same calculation logic as the main system
  const calculateBannerPrice = (product: Product, width: number, height: number) => {
    return calculateBannerPriceUtil(product, width, height, quantity);
  };

  const getCurrentPrice = () => {
    if (!product) return 0;

    if (product.pricingMethod === "dimensional") {
      return calculateBannerPrice(product, bannerWidth, bannerHeight);
    }

    return getApplicablePrice(product, quantity);
  };

  const handleAddToCart = () => {
    if (!product) return;

    const needsCase = idCardWithCaseIds.includes(product.id);
    const hasCase = !needsCase || selectedCase;

    const needsLamination = stikerWithLaminationIds.includes(product.id);
    const hasLamination = !needsLamination || selectedLamination;

    const needsModel = product.models && product.models.length > 0;
    const hasModel = !needsModel || selectedModel;

    if (product.pricingMethod === "dimensional") {
      onAddToCart(product, quantity, {
        width: bannerWidth,
        height: bannerHeight,
        isDimensionalProduct: true
      });
      onClose();
    } else if (hasCase && hasLamination && hasModel && quantity > 0) {
      onAddToCart(product, quantity, {
        modelCode: selectedModel,
        caseVariant: selectedCase,
        laminationVariant: selectedLamination
      });
      onClose();
    } else {
      if (needsCase && !hasCase) {
        toast.error("Pilih jenis casing terlebih dahulu", {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
      } else if (needsLamination && !hasLamination) {
        toast.error("Pilih jenis laminasi terlebih dahulu", {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
      } else if (needsModel && !hasModel) {
        toast.error("Pilih model terlebih dahulu", {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
      } else if (quantity <= 0) {
        toast.error("Jumlah harus lebih dari 0", {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
      }
    }
  };

  if (!product) return null;

  const currentImage = product.models
    ? product.models.find(m => m.code === selectedModel)?.image || product.models[0].image
    : [product.image, ...product.additionalImages][currentImageIndex];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  // Debug price calculation
  const debugPrice = () => {
    const price = getCurrentPrice();
    return price;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[calc(100%-1rem)] w-[calc(100%-1rem)] sm:w-auto mx-auto rounded-lg overflow-hidden max-h-[90vh] p-0">
        <div className="relative h-full flex flex-col" style={{ maxHeight: "90vh" }}>
          {/* Fixed Header */}
          <div className="p-4 border-b bg-white">
            <DialogTitle className="font-semibold text-lg">{product.name}</DialogTitle>
            <DialogDescription>
              Detail produk dan pilihan konfigurasi. Sesuaikan jumlah dan opsi produk sesuai kebutuhan.
            </DialogDescription>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
            <div className="space-y-4">
              {/* Image Display */}
              <div className="relative">
                <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "75%" }}>
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />

                  {/* Navigation buttons */}
                  {((product.models && product.models.length > 1) ||
                    (product.additionalImages && product.additionalImages.length > 0)) && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-white h-8 w-8 rounded-full flex items-center justify-center transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-white h-8 w-8 rounded-full flex items-center justify-center transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Model Selector */}
                {product.models && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Pilih Model:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {product.models.map((model) => (
                        <button
                          key={model.code}
                          onClick={() => setSelectedModel(model.code)}
                          className={`px-2 py-1.5 rounded-lg text-xs transition-colors text-center ${
                            selectedModel === model.code
                              ? "bg-[#FF5E01] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {model.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Thumbnails */}
                <div className="mt-2">
                  <div className="grid grid-cols-6 gap-1.5 overflow-x-auto scrollbar-hide pb-2">
                    {product.models ? (
                      product.models.slice(0, 6).map((model, index) => (
                        <div
                          key={index}
                          className={`relative flex-shrink-0 w-8 h-8 rounded-md overflow-hidden cursor-pointer transition-all ${
                            model.code === selectedModel ? 'ring-2 ring-[#FF5E01] scale-105' : 'hover:scale-105'
                          }`}
                          onClick={() => setSelectedModel(model.code)}
                        >
                          <img
                            src={model.image}
                            alt={`${model.code}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      [product.image, ...product.additionalImages].map((image, index) => (
                        <div
                          key={index}
                          className={`relative flex-shrink-0 w-8 h-8 rounded-md overflow-hidden cursor-pointer transition-all ${
                            index === currentImageIndex ? 'ring-2 ring-[#FF5E01] scale-105' : 'hover:scale-105'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={image}
                            alt={`${product.name} - Gambar ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div>
                <p className="text-gray-600 text-sm">{product.description}</p>
              </div>

              {/* Case Selection */}
              {idCardWithCaseIds.includes(product.id) && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Pilih Jenis Casing:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {caseVariants.map((variant) => (
                      <button
                        key={variant.code}
                        onClick={() => setSelectedCase(variant.code)}
                        className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                          selectedCase === variant.code
                            ? "bg-[#FF5E01] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lamination Selection */}
              {product.laminationOptions && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Pilih Jenis Laminasi:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {product.laminationOptions.map((lamination) => (
                      <button
                        key={lamination.type}
                        onClick={() => setSelectedLamination(lamination.type)}
                        className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                          selectedLamination === lamination.type
                            ? "bg-[#FF5E01] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {lamination.type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Banner Dimensions */}
              {product.pricingMethod === "dimensional" && (
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-sm">Ukuran Banner:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Lebar (m)</label>
                      <Input
                        type="number"
                        min={product.minWidth}
                        max={product.maxWidth}
                        step="0.5"
                        value={bannerWidth}
                        onChange={(e) => setBannerWidth(parseFloat(e.target.value) || product.minWidth || 1)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Tinggi (m)</label>
                      <Input
                        type="number"
                        min={product.minHeight}
                        max={product.maxHeight}
                        step="0.5"
                        value={bannerHeight}
                        onChange={(e) => setBannerHeight(parseFloat(e.target.value) || product.minHeight || 1)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#FF5E01]">
                    Luas: {bannerWidth}m × {bannerHeight}m ({(bannerWidth * bannerHeight).toFixed(2)} m²)
                  </div>
                </div>
              )}

              {/* Price Thresholds */}
              {product.priceThresholds && !product.pricingMethod && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Daftar Harga:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {product.priceThresholds.map((threshold, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-2 rounded-lg border border-gray-100"
                      >
                        <div className="text-xs font-medium text-gray-500">
                          {threshold.minQuantity}+ item
                        </div>
                        <div className="text-sm font-semibold text-[#FF5E01]">
                          {formatCurrency(threshold.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Info */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm">Waktu Pengerjaan:</span>
                <span className="text-sm text-gray-600">{product.time}</span>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm">Rating:</span>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {product.rating}/5.0
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t bg-white p-4">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm">Jumlah:</span>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-8 w-16 text-center text-sm"
                  min="1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Price Display */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">Total Harga:</span>
              <span className="font-semibold text-[#FF5E01] text-lg">
                {formatCurrency(debugPrice() * quantity)}
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className="w-full bg-[#FF5E01] hover:bg-[#e54d00] text-white"
              disabled={quantity <= 0}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Tambahkan ke Keranjang ({quantity}×)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
