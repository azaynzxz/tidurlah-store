import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, Settings } from "lucide-react";
import { calculateBannerPrice } from "@/utils/product";

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
  is_available: boolean;
  unit: string;
}

interface CartItemType {
  product: Product;
  quantity: number;
  options?: {
    modelCode?: string;
    caseVariant?: string;
    laminationVariant?: string;
    width?: number;
    height?: number;
    isDimensionalProduct?: boolean;
    dimensionText?: string;
    area?: string;
    customPrice?: number;
  };
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onUpdateOptions: (productId: number, options: any) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove, onUpdateOptions }: CartItemProps) {
  const [showOptions, setShowOptions] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  // Case variants (should match the ones in POSProductModal)
  const caseVariants = [
    { code: "transparan", name: "Case Transparan" },
    { code: "putih", name: "Case Putih Susu" },
    { code: "hitam", name: "Case Hitam" },
    { code: "biru", name: "Case Biru" },
    { code: "merah", name: "Case Merah" },
    { code: "tanpa", name: "Tanpa Casing" },
  ];

  // Lamination options
  const laminationOptions = [
    { code: "doff", name: "Laminasi Doff" },
    { code: "glossy", name: "Laminasi Glossy" },
    { code: "tanpa", name: "Tanpa Laminasi" },
  ];

  // IDs that require specific options
  const idCardWithCaseIds = [1, 2, 6, 7, 8];
  const stikerWithLaminationIds = [15];

  // Check if product needs options
  const needsCase = idCardWithCaseIds.includes(item.product.id);
  const needsLamination = stikerWithLaminationIds.includes(item.product.id);
  const needsDimensions = item.product.pricingMethod === "dimensional";
  const hasModels = item.product.models && item.product.models.length > 0;

  const hasRequiredOptions = needsCase || needsLamination || needsDimensions || hasModels;

  // Handle option updates
  const handleOptionUpdate = (optionKey: string, value: any) => {
    const updatedOptions = { ...item.options, [optionKey]: value };
    
    // Update dimension text and area for dimensional products
    if (item.product.pricingMethod === "dimensional" && (optionKey === 'width' || optionKey === 'height')) {
      const width = optionKey === 'width' ? value : item.options?.width || 1;
      const height = optionKey === 'height' ? value : item.options?.height || 1;
      updatedOptions.dimensionText = `${width}m x ${height}m`;
      updatedOptions.area = `${width * height} m²`;
    }
    
    onUpdateOptions(item.product.id, updatedOptions);
  };

  // Calculate applicable price based on quantity thresholds or dimensional pricing
  const getApplicablePrice = (product: Product, quantity: number, options?: any) => {
    // Handle ongkir with dynamic price from options
    if (product.id === 2002 && options?.customPrice) {
      return options.customPrice;
    }

    // Check if this is a dimensional product with width/height options
    if (product.pricingMethod === "dimensional" && options?.width && options?.height) {
      return calculateBannerPrice(product, options.width, options.height);
    }

    // Handle regular price thresholds
    if (product.priceThresholds && product.priceThresholds.length > 0) {
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

  const price = getApplicablePrice(item.product, item.quantity, item.options);
  const subtotal = price * item.quantity;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
    onUpdateQuantity(item.product.id, newQuantity);
  };

  const increaseQuantity = () => {
    onUpdateQuantity(item.product.id, item.quantity + 1);
  };

  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product.id, item.quantity - 1);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#FF5E01]/30 transition-colors">
      <img
        src={item.product.image}
        alt={item.product.name}
        className="w-14 h-14 rounded-md object-cover border border-gray-200"
      />

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate text-gray-800">
          {item.product.name}
        </h4>
        {/* Options Toggle Button */}
        {hasRequiredOptions && (
          <div className="flex items-center gap-2 mt-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowOptions(!showOptions)}
              className="h-6 px-2 text-xs text-[#FF5E01] hover:text-[#e54d00] hover:bg-[#FF5E01]/10"
            >
              <Settings className="w-3 h-3 mr-1" />
              {showOptions ? 'Sembunyikan' : 'Atur'} Opsi
            </Button>
            {/* Show current options summary */}
            <div className="text-xs text-gray-500">
              {needsCase && !item.options?.caseVariant && <span className="text-red-500">Pilih casing</span>}
              {needsLamination && !item.options?.laminationVariant && <span className="text-red-500">Pilih laminasi</span>}
            </div>
          </div>
        )}

        {/* Options Panel */}
        {showOptions && hasRequiredOptions && (
          <div className="mt-2 p-2 bg-gray-50 rounded border space-y-2">
            {/* Model Selection */}
            {hasModels && (
              <div>
                <Label className="text-xs font-medium">Model</Label>
                <Select
                  value={item.options?.modelCode || ""}
                  onValueChange={(value) => handleOptionUpdate('modelCode', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Pilih model" />
                  </SelectTrigger>
                  <SelectContent>
                    {item.product.models?.map((model) => (
                      <SelectItem key={model.code} value={model.code} className="text-xs">
                        {model.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Case Selection */}
            {needsCase && (
              <div>
                <Label className="text-xs font-medium">Casing *</Label>
                <Select
                  value={item.options?.caseVariant || ""}
                  onValueChange={(value) => handleOptionUpdate('caseVariant', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Pilih casing" />
                  </SelectTrigger>
                  <SelectContent>
                    {caseVariants.map((variant) => (
                      <SelectItem key={variant.code} value={variant.code} className="text-xs">
                        {variant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Lamination Selection */}
            {needsLamination && (
              <div>
                <Label className="text-xs font-medium">Laminasi *</Label>
                <Select
                  value={item.options?.laminationVariant || ""}
                  onValueChange={(value) => handleOptionUpdate('laminationVariant', value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Pilih laminasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {laminationOptions.map((option) => (
                      <SelectItem key={option.code} value={option.code} className="text-xs">
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dimension Inputs */}
            {needsDimensions && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-medium">Lebar (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={item.product.minWidth || 0.1}
                    max={item.product.maxWidth || 10}
                    value={item.options?.width || item.product.minWidth || 1}
                    onChange={(e) => handleOptionUpdate('width', parseFloat(e.target.value) || 1)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Tinggi (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={item.product.minHeight || 0.1}
                    max={item.product.maxHeight || 10}
                    value={item.options?.height || item.product.minHeight || 1}
                    onChange={(e) => handleOptionUpdate('height', parseFloat(e.target.value) || 1)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Options Display */}
        {item.options && (
          <div className="text-xs text-gray-600 mt-1 space-y-0.5">
            {item.options.modelCode && (
              <div>Model: {item.options.modelCode}</div>
            )}
            {item.options.width && item.options.height && (
              <div>Ukuran: {item.options.width}m × {item.options.height}m ({item.options.area})</div>
            )}
            {item.options.caseVariant && (
              <div>Casing: {caseVariants.find(c => c.code === item.options.caseVariant)?.name || item.options.caseVariant}</div>
            )}
            {item.options.laminationVariant && (
              <div>Laminasi: {laminationOptions.find(l => l.code === item.options.laminationVariant)?.name || item.options.laminationVariant}</div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 border-[#FF5E01] text-[#FF5E01] hover:bg-[#FF5E01] hover:text-white"
              onClick={decreaseQuantity}
              disabled={item.quantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Input
              type="number"
              value={item.quantity}
              onChange={handleQuantityChange}
              className="h-7 w-12 text-center text-sm border-[#FF5E01] focus:border-[#FF5E01] focus:ring-[#FF5E01]"
              min="1"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 border-[#FF5E01] text-[#FF5E01] hover:bg-[#FF5E01] hover:text-white"
              onClick={increaseQuantity}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onRemove(item.product.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="text-sm font-semibold text-[#FF5E01]">
        {formatCurrency(subtotal)}
      </div>
    </div>
  );
}
