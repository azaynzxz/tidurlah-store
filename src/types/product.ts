export interface Product {
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

export type PromoCodeType = {
  discount: number;
  productIds: number[] | null;
  minQuantity?: number;
  overridePrices?: Record<number, number>;
};

export type PromotedProductType = {
  id: number;
  discount: number;
  endDate: Date;
  promoCode?: string;
  minQuantity?: number;
  description?: string;
};

export interface CartItem extends Product {
  quantity: number;
  appliedPrice: number;
  savings: number;
  modelCode?: string;
  caseVariant?: string;
  laminationVariant?: string;
  width?: number;
  height?: number;
  isDimensionalProduct?: boolean;
  dimensionText?: string;
  area?: string;
  overridePrice?: number;
}

export interface OrderData {
  invoiceNumber: string;
  customerName: string;
  instansi: string;
  phoneNumber: string;
  designNote: string;
  cartItems: CartItem[];
  subtotal: number;
  promoCode: string;
  promoDiscount: number;
  total: number;
  isShipping: boolean;
  address: string;
  requestJasaDesain: boolean;
  isExpressPrint: boolean;
}

export interface BannerDetails {
  name: string;
  id: number;
  width: number;
  height: number;
  dimensions: string;
  area: string;
  price: number;
  quantity: number;
}

export interface CaseVariant {
  code: string;
  name: string;
}

export type CategoryItem = {
  id: string;
  name: string;
  icon: any; // Using any for now since LucideIcon might not be available in all environments
  color: string;
  hoverColor: string;
  textColor: string;
  inactiveColor: string;
  inactiveText: string;
  tooltip?: string;
};
