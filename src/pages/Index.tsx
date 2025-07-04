import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ShoppingBag, Check, Trash2, ChevronLeft, ChevronRight, X, Facebook, Instagram, Youtube, Mail, MapPin, Phone, Newspaper, CreditCard, Megaphone, Gift, Flower, Share2, Printer } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BannerCarousel from "@/components/BannerCarousel";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";
import ChatBot from "@/components/ChatBot";
import MusicPlayer from "@/components/MusicPlayer";
import PromotedProducts from "@/components/PromotedProducts";
import html2canvas from "html2canvas";

// Convert image to base64 for html2canvas compatibility
const convertImageToBase64 = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
};

// Set document title and load Google Fonts
if (typeof document !== 'undefined') {
  document.title = "Spesialis ID Card Lanyard Lampung dan Merchandise Custom - TIDURLAH STORE";
  
  // Add Google Fonts Material Symbols if not already added
  if (!document.querySelector('link[href*="material+symbols"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=mail,language';
    document.head.appendChild(link);
  }
}

// Valid promo codes with their discount percentage
type PromoCodeType = {
  discount: number;
  productIds: number[] | null;
  minQuantity?: number;
};

const validPromoCodes: Record<string, PromoCodeType> = {
  "DISCOUNT10": { discount: 10, productIds: null }, // applies to all products
  "SAVE15": { discount: 15, productIds: null },
  "PROMO20": { discount: 20, productIds: null },
  "KKN15": { discount: 15, productIds: [8], minQuantity: 7 }, // only applies to product ID 8 with minimum 7 pcs
  "IDCARD15": { discount: 15, productIds: [2] } // only applies to ID Card 2S
};

// Define promoted products with end dates
type PromotedProductType = {
  id: number;
  discount: number;
  endDate: Date;
  promoCode?: string;
  minQuantity?: number;
  description?: string;
};

const promotedProducts: PromotedProductType[] = [
  {
    id: 8,
    discount: 15,
    endDate: new Date('2025-07-15'),
    promoCode: "KKN15",
    minQuantity: 7,
    description: "Promo spesial untuk mahasiswa KKN! Diskon 15% untuk pembelian minimal 7 pcs. Tunjukkan ID mahasiswa saat pengambilan."
  }
];

// Product Data with Price Thresholds
const products = {
  "ID Card & Lanyard": [
    {
      id: 8,
      name: "Paket IDC LYD 2S",
      image: "/product-image/paket-idc-2s.jpg",
      additionalImages: [],
      description: "Paket lengkap dengan ID card dua sisi dan lanyard yang sesuai.",
      price: 25000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 25000 },
        { minQuantity: 4, price: 23000 },
        { minQuantity: 25, price: 20000 },
        { minQuantity: 100, price: 17000 }
      ],
      time: "2-3 hari",
      rating: 4.9,
      bestseller: true
    },
    {
      id: 9,
      name: "Paket IDC LYD Kulit",
      image: "/product-image/paket-idc-case-kulit.jpg",
      additionalImages: [
        "/product-image/case-kulit.jpg"
      ],
      description: "Paket premium dengan ID card, case kulit, dan lanyard yang sesuai.",
      price: 30000,
      discountPrice: 28000,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 28000 },
        { minQuantity: 4, price: 27000 },
        { minQuantity: 25, price: 26500 },
        { minQuantity: 100, price: 25000 }
      ],
      time: "3-4 hari",
      rating: 5.0
    },
    {
      id: 10,
      name: "Paket IDC LYD Premium",
      image: "/product-image/paket-idc-lyd-premium.jpg",
      additionalImages: [
        "/product-image/case-premium.jpg"
      ],
      description: "Paket deluxe dengan ID card dua sisi, case premium, dan lanyard custom.",
      price: 30000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 30000 },
        { minQuantity: 4, price: 28000 },
        { minQuantity: 25, price: 26000 },
        { minQuantity: 100, price: 24000 }
      ],
      time: "3-5 hari",
      rating: 4.9
    },
    {
      id: 7,
      name: "Paket IDC LYD 1S",
      image: "/product-image/paket-idc-1s.jpg",
      additionalImages: [],
      description: "Paket lengkap dengan ID card satu sisi dan lanyard yang sesuai.",
      price: 20000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 20000 },
        { minQuantity: 4, price: 18000 },
        { minQuantity: 25, price: 16000 },
        { minQuantity: 100, price: 14000 }
      ],
      time: "2-3 hari",
      rating: 4.8
    },
    {
      id: 3,
      name: "IDC Tali & Case Kulit",
      image: "/product-image/case-tali-kulit.jpg",
      additionalImages: [
        "/product-image/case-kulit.jpg"
      ],
      description: "ID card premium dengan case kulit dan tali lanyard.",
      price: 30000,
      discountPrice: 28000,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 28000 },
        { minQuantity: 4, price: 27000 },
        { minQuantity: 25, price: 26500 },
        { minQuantity: 100, price: 25000 }
      ],
      time: "3-5 hari",
      rating: 4.9
    },
    {
      id: 2,
      name: "ID Card 2S",
      image: "/product-image/ID Card 2S.jpg",
      additionalImages: [
        "/product-image/Case-ID Card.jpg"
      ],
      description: "ID card dua sisi dengan bahan premium berkualitas.",
      price: 10000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 10000 },
        { minQuantity: 4, price: 9000 },
        { minQuantity: 25, price: 8000 },
        { minQuantity: 100, price: 7000 }
      ],
      time: "2-3 hari",
      rating: 4.8
    },
    {
      id: 1,
      name: "ID Card 1S",
      image: "/product-image/ID Card 1S.jpg",
      additionalImages: [
        "/product-image/Case-ID Card.jpg"
      ],
      description: "ID card satu sisi dengan bahan premium berkualitas.",
      price: 9000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 9000 },
        { minQuantity: 4, price: 8000 },
        { minQuantity: 25, price: 7000 },
        { minQuantity: 100, price: 6000 }
      ],
      time: "1-2 hari",
      rating: 4.7
    },
    {
      id: 4,
      name: "Lanyard Saja 1S",
      image: "/product-image/lanyard-only-1S.jpg",
      additionalImages: [
        "/product-image/lanyard-only-1S-2.jpg"
      ],
      description: "Lanyard cetak satu sisi tanpa ID card atau case.",
      price: 15000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 15000 },
        { minQuantity: 4, price: 13000 },
        { minQuantity: 25, price: 12000 },
        { minQuantity: 100, price: 10000 }
      ],
      time: "1-2 hari",
      rating: 4.6
    },
    {
      id: 5,
      name: "Lanyard Saja 2S",
      image: "/product-image/lanyard-only-2S.jpg",
      additionalImages: [
        "/product-image/lanyard-only-2S-2.jpg"
      ],
      description: "Lanyard cetak dua sisi tanpa ID card atau case.",
      price: 17000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 17000 },
        { minQuantity: 4, price: 16000 },
        { minQuantity: 25, price: 15000 },
        { minQuantity: 100, price: 13000 }
      ],
      time: "1-2 hari",
      rating: 4.7
    },
    {
      id: 6,
      name: "IDC Tali Biasa",
      image: "/product-image/IDC Tali Biasa.jpg",
      additionalImages: [
        "/product-image/case-biasa.jpg"
      ],
      description: "ID card standar dengan lanyard biasa.",
      price: 13000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 13000 },
        { minQuantity: 4, price: 12000 },
        { minQuantity: 25, price: 10000 },
        { minQuantity: 100, price: 8000 }
      ],
      time: "1-2 hari",
      rating: 4.5
    },
    {
      id: 24,
      name: "IDC Lanyard tali Hitam Polos",
      image: "/product-image/IDC-Tali Hitam.jpg",
      additionalImages: [],
      description: "ID card dengan lanyard tali hitam polos, praktis dan elegan.",
      price: 14000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 14000 },
        { minQuantity: 50, price: 13000 }
      ],
      time: "1-2 hari",
      rating: 4.6
    },
    {
      id: 25,
      name: "IDC B4 Lanyard Hitam Polos",
      image: "/product-image/IDC B4 Lanyard Hitam Polos.jpg",
      additionalImages: [],
      description: "ID Card kertas dengan ukuran B4 (15.5 × 16.6 cm), tali hitam polos",
      price: 7000,
      discountPrice: 5000,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 5000 }
      ],
      time: "1-2 hari",
      rating: 4.5
    }
  ],
  "Media Promosi": [
    {
      id: 11,
      name: "Banner Indoor/Outdoor",
      image: "/product-image/Banner 1.jpg",
      additionalImages: [
        "/product-image/Banner 2.jpg"
      ],
      description: "Banner custom cetak untuk acara dan promosi.",
      price: 18000,
      discountPrice: null,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 18000 },
        { minQuantity: 4, price: 18000 },
        { minQuantity: 25, price: 17000 },
        { minQuantity: 100, price: 16000 }
      ],
      time: "3-5 hari",
      rating: 4.8,
      pricingMethod: "dimensional",
      basePricePerSqm: 18000,
      minWidth: 0.5,
      maxWidth: 5, 
      minHeight: 0.5,
      maxHeight: 10
    },
    {
      id: 12,
      name: "X Banner (60x160)",
      image: "/product-image/X banner 1.jpg",
      additionalImages: [
        "/product-image/X banner-2.jpg"
      ],
      description: "Stand banner bentuk X dengan banner cetak custom ukuran 60x160cm.",
      price: 90000,
      discountPrice: null,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 90000 },
        { minQuantity: 4, price: 85000 },
        { minQuantity: 25, price: 80000 },
        { minQuantity: 100, price: 75000 }
      ],
      time: "2-3 hari",
      rating: 4.6
    },
    {
      id: 13,
      name: "Roll Banner",
      image: "/product-image/Roll Banner 1.jpg",
      additionalImages: [
        "/product-image/Roll Banner 2.jpg"
      ],
      description: "Banner gulung portable dengan stand, sempurna untuk acara dan pameran.",
      price: 350000,
      discountPrice: null,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 350000 },
        { minQuantity: 4, price: 170000 },
        { minQuantity: 25, price: 160000 },
        { minQuantity: 100, price: 150000 }
      ],
      time: "3-4 hari",
      rating: 4.8
    },
    {
      id: 14,
      name: "Poster A3",
      image: "/product-image/Poster 1.jpg",
      additionalImages: [
        "/product-image/Poster 2.jpg",
      ],
      description: "Poster ukuran A3 dicetak pada kertas berkualitas tinggi.",
      price: 25000,
      discountPrice: null,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 25000 },
        { minQuantity: 4, price: 22000 },
        { minQuantity: 25, price: 20000 },
        { minQuantity: 100, price: 18000 }
      ],
      time: "1-2 hari",
      rating: 4.7
    }
  ],
  "Merchandise": [
    {
      id: 15,
      name: "Cutting Stiker Kontur",
      image: "/product-image/Cut Stiker.jpg",
      additionalImages: [
        "/product-image/cut-stiker1.jpg"
      ],
      description: "Stiker vinyl potong custom dengan desain Anda.",
      price: 15000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 15000 },
        { minQuantity: 4, price: 12000 },
        { minQuantity: 25, price: 10000 },
        { minQuantity: 100, price: 8000 }
      ],
      time: "1-2 hari",
      rating: 4.6,
      laminationOptions: [
        { type: "Laminasi Doff", price: 0 },
        { type: "Laminasi Glossy", price: 0 },
        { type: "Tanpa Laminasi", price: 0 }
      ]
    },
    {
      id: 16,
      name: "Ganci Akrilik",
      image: "/product-image/ganciakrilik-1.jpg",
      additionalImages: [
        "/product-image/ganciakrilik-2.jpg",
        "/product-image/ganciakrilik-3.jpg"
      ],
      description: "Ganci akrilik custom cetak dengan desain Anda.",
      price: 8000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 8000 },
        { minQuantity: 4, price: 7000 },
        { minQuantity: 25, price: 6000 },
        { minQuantity: 100, price: 5000 }
      ],
      time: "1-2 hari",
      rating: 4.5
    },
    {
      id: 17,
      name: "Ganci 5 cm",
      image: "/product-image/Ganci-5-cm1.jpg",
      additionalImages: [],
      description: "Ganci custom cetak diameter 5 cm.",
      price: 3000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 3000 },
        { minQuantity: 4, price: 2700 },
        { minQuantity: 25, price: 2500 },
        { minQuantity: 100, price: 2300 }
      ],
      time: "1-2 hari",
      rating: 4.7
    },
    {
      id: 18,
      name: "Ganci 3 cm",
      image: "/product-image/Ganci-3cm-1.jpg",
      additionalImages: [],
      description: "Ganci custom cetak diameter 3 cm.",
      price: 5000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 5000 },
        { minQuantity: 4, price: 4500 },
        { minQuantity: 25, price: 4000 },
        { minQuantity: 100, price: 3000 }
      ],
      time: "1 hari",
      rating: 4.6
    },
    {
      id: 19,
      name: "Ganci Tali",
      image: "/product-image/ganci-tali.jpg",
      additionalImages: [
        "/product-image/ganci-tali-2.jpg"
      ],
      description: "Ganci custom cetak dengan tambahan tali.",
      price: 5000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 5000 },
        { minQuantity: 4, price: 4500 },
        { minQuantity: 25, price: 3500 },
        { minQuantity: 100, price: 3000 }
      ],
      time: "1-2 hari",
      rating: 4.8
    },
    {
      id: 20,
      name: "Mug Custom",
      image: "/product-image/Mug 1.jpg",
      additionalImages: [
        "/product-image/Mug 2.jpg",
        "/product-image/Mug 3.jpg"
      ],
      description: "Mug keramik dengan desain cetak, aman untuk microwave dan mesin pencuci piring.",
      price: 28000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 28000 },
        { minQuantity: 4, price: 25000 },
        { minQuantity: 25, price: 22000 },
        { minQuantity: 100, price: 19000 }
      ],
      time: "3-5 hari",
      rating: 4.8
    },
    {
      id: 21,
      name: "Tumbler Custom",
      image: "/product-image/Insert Paper 1.jpg",
      additionalImages: [
        "/product-image/Insert Paper 2.jpg",
        "/product-image/Insert Paper 3.jpg"
      ],
      description: "Tumbler travel custom cetak dengan tutup, cocok untuk minuman panas dan dingin.",
      price: 65000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 65000 },
        { minQuantity: 4, price: 60000 },
        { minQuantity: 25, price: 55000 },
        { minQuantity: 100, price: 50000 }
      ],
      time: "3-5 hari",
      rating: 4.9
    },
    {
      id: 22,
      name: "Plakat Akrilik Reg",
      image: "/product-image/plakat-reg-1.jpg",
      additionalImages: [
        "/product-image/plakat-reg-2.jpg",
        "/product-image/plakat-reg-3.jpg"
      ],
      description: "Plakat akrilik berkualitas tinggi dengan berbagai pilihan model.",
      price: 90000,
      discountPrice: null,
      category: "Digital Print",
      priceThresholds: [
        { minQuantity: 1, price: 90000 }
      ],
      time: "3-5 hari",
      rating: 4.9,
      models: [
        { code: "PK01", name: "Model Standar", image: "/product-image/plakat-reg-1.jpg" },
        { code: "PK02", name: "Model Premium", image: "/product-image/plakat-reg-2.jpg" },
        { code: "PK03", name: "Model Deluxe", image: "/product-image/plakat-reg-3.jpg" }
      ]
    },
    {
      id: 23,
      name: "Sablon Kaos",
      image: "/product-image/t-shirt-1.jpg",
      additionalImages: [
        "/product-image/t-shirt-2.jpg",
        "/product-image/t-shirt-3.jpg"
      ],
      description: "Kaos sablon custom dengan desain Anda.",
      price: 75000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 75000 },
        { minQuantity: 4, price: 70000 },
        { minQuantity: 25, price: 65000 },
        { minQuantity: 100, price: 60000 }
      ],
      time: "5-7 hari",
      rating: 4.7
    }
  ],
  "Papan Bunga": [
    {
      id: 1001,
      name: "Papan Bunga Kecil - Pink Purple Gradient #PKK1",
      image: "/product-image/papan-bunga/Kecil - KODE PKK1 - Pink Purple gradient dengan bunga dan kupu-kupu.jpg",
      additionalImages: [],
      description: "Papan bunga kecil dengan desain pink purple gradient, dilengkapi dengan bunga dan kupu-kupu.",
      price: 65000,
      discountPrice: null,
      category: "Papan Bunga",
      priceThresholds: [
        { minQuantity: 1, price: 65000 },
        { minQuantity: 3, price: 63000 },
        { minQuantity: 5, price: 60000 }
      ],
      time: "1-2 hari",
      rating: 4.8
    },
    {
      id: 1002,
      name: "Papan Bunga Kecil - Bunga Matahari Mini #PKK3",
      image: "/product-image/papan-bunga/Kecil - KODE PKK3 dengan Bunga matahari mini dan anggrek putih.jpg",
      additionalImages: [],
      description: "Papan bunga kecil dengan bunga matahari mini dan anggrek putih.",
      price: 65000,
      discountPrice: null,
      category: "Papan Bunga",
      priceThresholds: [
        { minQuantity: 1, price: 65000 },
        { minQuantity: 3, price: 63000 },
        { minQuantity: 5, price: 60000 }
      ],
      time: "1-2 hari",
      rating: 4.9
    },
    {
      id: 1003,
      name: "Papan Bunga Kecil - Pink Gold Tropical #PKK5",
      image: "/product-image/papan-bunga/Kecil - KODE PKK5 - Pink gold tropical.jpg",
      additionalImages: [],
      description: "Papan bunga kecil dengan tema pink gold tropical.",
      price: 65000,
      discountPrice: null,
      category: "Papan Bunga",
      priceThresholds: [
        { minQuantity: 1, price: 65000 },
        { minQuantity: 3, price: 63000 },
        { minQuantity: 5, price: 60000 }
      ],
      time: "1-2 hari",
      rating: 4.8
    },
    {
      id: 1004,
      name: "Papan Bunga - Plakat Bunga Anggrek Biru #PKB2",
      image: "/product-image/papan-bunga/KODE PKB2 - Plakat Bunga dengan anggrek biru moonlight.jpg",
      additionalImages: [],
      description: "Plakat bunga dengan anggrek biru moonlight.",
      price: 70000,
      discountPrice: null,
      category: "Papan Bunga",
      priceThresholds: [
        { minQuantity: 1, price: 70000 },
        { minQuantity: 3, price: 68000 },
        { minQuantity: 5, price: 65000 }
      ],
      time: "1-2 hari",
      rating: 4.9
    },
    {
      id: 1005,
      name: "Papan Bunga - Plakat Bulat Anggrek Putih #PKB1",
      image: "/product-image/papan-bunga/KODE PKB1 - Plakat Bulat dengan bunga anggrek putih.jpg",
      additionalImages: [],
      description: "Plakat bulat dengan bunga anggrek putih.",
      price: 70000,
      discountPrice: null,
      category: "Papan Bunga",
      priceThresholds: [
        { minQuantity: 1, price: 70000 },
        { minQuantity: 3, price: 68000 },
        { minQuantity: 5, price: 65000 }
      ],
      time: "1-2 hari",
      rating: 4.8
    },
    {
      id: 1006,
      name: "Papan Bunga - Pink Mawar Love #PKK6",
      image: "/product-image/papan-bunga/KODE PKK6 - Pink dengan bunga mawar dan love di tepi.jpg",
      additionalImages: [],
      description: "Papan bunga pink dengan bunga mawar dan love di tepi.",
      price: 70000,
      discountPrice: null,
      category: "Papan Bunga",
      priceThresholds: [
        { minQuantity: 1, price: 70000 },
        { minQuantity: 3, price: 68000 },
        { minQuantity: 5, price: 65000 }
      ],
      time: "1-2 hari",
      rating: 4.9
    },
    {
      id: 1007,
      name: "Papan Bunga - Hitam Emas Mewah #PKK7",
      image: "/product-image/papan-bunga/KODE PKK7 plakat hitam emas mewah dengan bunga monokromatik.jpg",
      additionalImages: [],
      description: "Plakat hitam emas mewah dengan bunga monokromatik.",
      price: 70000,
      discountPrice: null,
      category: "Papan Bunga",
      priceThresholds: [
        { minQuantity: 1, price: 70000 },
        { minQuantity: 3, price: 68000 },
        { minQuantity: 5, price: 65000 }
      ],
      time: "1-2 hari",
      rating: 5.0
    },
    {
      id: 1008,
      name: "Papan Bunga - Biru Muda Mawar #PKK4",
      image: "/product-image/papan-bunga/KODE PKK4  - Plakat biru muda dengan bunga mawar di tepi.jpg",
      additionalImages: [],
      description: "Plakat biru muda dengan bunga mawar di tepi.",
      price: 70000,
      discountPrice: null,
      category: "Papan Bunga",
      priceThresholds: [
        { minQuantity: 1, price: 70000 },
        { minQuantity: 3, price: 68000 },
        { minQuantity: 5, price: 65000 }
      ],
      time: "1-2 hari",
      rating: 4.8
    }
  ]
};

const calculateBannerPrice = (product, width, height) => {
  if (!width || !height || width < product.minWidth || height < product.minHeight) {
    return product.discountPrice || product.price;
  }
  
  const area = width * height;
  const basePrice = Math.max(product.basePricePerSqm * area, product.discountPrice || product.price);
  
  // Apply any quantity discounts if needed
  return basePrice;
};

// Generate URL-friendly slug from product name
const generateProductSlug = (productName: string) => {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim(); // Remove leading/trailing spaces
};

// Find product by slug
const findProductBySlug = (slug: string) => {
  const allProducts = Object.values(products).flat();
  return allProducts.find(product => generateProductSlug(product.name) === slug);
};

// Generate shareable URL for product
const generateProductUrl = (product: any) => {
  const slug = generateProductSlug(product.name);
  const baseUrl = window.location.origin;
  return `${baseUrl}/product/${slug}`;
};

const Index = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("ID Card & Lanyard");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any>(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [promoCodeError, setPromoCodeError] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [bannerWidth, setBannerWidth] = useState(1);
  const [bannerHeight, setBannerHeight] = useState(1);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [logoBase64, setLogoBase64] = useState<string>("");
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [instansi, setInstansi] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isShipping, setIsShipping] = useState(false);
  const [address, setAddress] = useState("");
  const [designNote, setDesignNote] = useState("");
  const [isExpressPrint, setIsExpressPrint] = useState(false);
  const [showExpressTooltip, setShowExpressTooltip] = useState(false);
  const [showShippingTooltip, setShowShippingTooltip] = useState(false);
  const [showJasaDesainTooltip, setShowJasaDesainTooltip] = useState(false);

  // Add this state for loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add state for selected model
  const [selectedModel, setSelectedModel] = useState("");

  // Add validation state
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Add state for jasa desain request
  const [requestJasaDesain, setRequestJasaDesain] = useState(false);
  const JASA_DESAIN_PRICE = 25000;

  // Add state for selected case
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedLamination, setSelectedLamination] = useState("");

  // Add state for angry case animation
  const [showAngryCase, setShowAngryCase] = useState(false);
  const [showAngryLamination, setShowAngryLamination] = useState(false);
  
  // Add state for product quantity in modal
  const [modalQuantity, setModalQuantity] = useState(1);
  const [showAngryQuantity, setShowAngryQuantity] = useState(false);

  // Add state for flying animation
  const [flyingBubbles, setFlyingBubbles] = useState<Array<{id: string, startX: number, startY: number, endX: number, endY: number}>>([]);

  // Add case variants
  const caseVariants = [
    { code: "transparan", name: "Case Transparan" },
    { code: "putih", name: "Case Putih Susu" },
    { code: "hitam", name: "Case Hitam" },
    { code: "biru", name: "Case Biru" },
    { code: "merah", name: "Case Merah" },
    { code: "tanpa", name: "Tanpa Casing" },
  ];

  // Flying animation function
  const triggerFlyingAnimation = (sourceElement?: HTMLElement) => {
    // Get source position (product location)
    let startX = window.innerWidth / 2; // Default to center
    let startY = window.innerHeight / 2;
    
    if (sourceElement) {
      const rect = sourceElement.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }
    
    // Get cart icon position
    const cartIcon = document.querySelector('[data-cart-icon]') || document.querySelector('.relative button');
    let endX = window.innerWidth - 100; // Default position
    let endY = 80;
    
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      endX = cartRect.left + cartRect.width / 2;
      endY = cartRect.top + cartRect.height / 2;
    }
    
    // Create bubble
    const bubbleId = Date.now().toString();
    const newBubble = { id: bubbleId, startX, startY, endX, endY };
    
    setFlyingBubbles(prev => [...prev, newBubble]);
    
    // Trigger cart bounce effect
    if (cartIcon) {
      cartIcon.classList.add('cart-bounce');
      setTimeout(() => {
        cartIcon.classList.remove('cart-bounce');
      }, 600);
    }
    
    // Remove bubble after animation completes
    setTimeout(() => {
      setFlyingBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
    }, 1200);
  };

  // Generate invoice number when component mounts
  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    setInvoiceNumber(`INV-${year}${month}${day}-${random}`);
  }, []);

  // Load logo as base64 for html2canvas compatibility
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const base64Logo = await convertImageToBase64('/product-image/Logo Tidurlah and ID Card Lampung.png');
        setLogoBase64(base64Logo);
      } catch (error) {
        console.error('Failed to load logo:', error);
        // Fallback to original image path if conversion fails
        setLogoBase64('/product-image/Logo Tidurlah and ID Card Lampung.png');
      }
    };
    loadLogo();
  }, []);

  // Handle product URL deep linking
  useEffect(() => {
    if (slug) {
      const product = findProductBySlug(slug);
      if (product) {
        // Set the appropriate category tab
        setActiveTab(product.category);
        // Open the product details modal
        openProductDetails(product);
      } else {
        // If product not found, redirect to home and show error
        navigate('/');
        toast.error("Produk tidak ditemukan", { position: 'top-center', style: { marginTop: '60px' } });
      }
    }
  }, [slug, navigate]);

  // On component mount, load cartItems from localStorage if present
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        // ignore parse error
      }
    }
  }, []);

  // Whenever cartItems changes, save to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Handle search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredProducts(products);
      setActiveCategory("");
      return;
    }
    
    const loweredTerm = term.toLowerCase();
    const filtered: any = {};
    let foundInCategory = "";
    
    Object.entries(products).forEach(([category, categoryProducts]) => {
      const matchedProducts = (categoryProducts as any[]).filter(product => 
        product.name.toLowerCase().includes(loweredTerm) || 
        product.description.toLowerCase().includes(loweredTerm)
      );
      
      if (matchedProducts.length > 0) {
        filtered[category] = matchedProducts;
        if (!foundInCategory) foundInCategory = category;
      }
    });
    
    setFilteredProducts(filtered);
    
    // Auto-select the first category with results
    if (foundInCategory) {
      setActiveTab(foundInCategory);
      setActiveCategory(foundInCategory);
    }
  };

  // Validate and apply promo code
  const handlePromoCodeChange = (code: string) => {
    setPromoCode(code);
    setPromoCodeError("");

    if (!code) {
      setPromoDiscount(0);
      return;
    }

    const promo = validPromoCodes[code as keyof typeof validPromoCodes];
    if (promo) {
      // If promo applies to specific products, check if any of those products are in the cart
      if (promo.productIds && Array.isArray(promo.productIds)) {
        const matchingCartItem = cartItems.find(item => promo.productIds!.includes(item.id));
        if (!matchingCartItem) {
          setPromoDiscount(0);
          setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
          return;
        }
        // Now check minimum quantity requirement if specified
        if (promo.minQuantity && matchingCartItem.quantity < promo.minQuantity) {
          setPromoDiscount(0);
          setPromoCodeError(`Kode promo memerlukan minimal ${promo.minQuantity} pcs pada produk yang dipilih.`);
          return;
        }
      }
      // For codes that apply to all products or pass the above checks
      // Check if promo applies to any product in the cart with sufficient quantity
      const appliesToAny = cartItems.some(item => {
        const productMatches = promo.productIds === null || promo.productIds.includes(item.id);
        const quantityMatches = !promo.minQuantity || item.quantity >= promo.minQuantity;
        return productMatches && quantityMatches;
      });
      if (appliesToAny) {
        setPromoDiscount(promo.discount);
        toast.success(`Promo code ${code} applied! ${promo.discount}% discount`, { position: 'top-center', style: { marginTop: '60px' } });
      } else {
        setPromoDiscount(0);
        setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
      }
    } else {
      setPromoDiscount(0);
      setPromoCodeError("Kode promo tidak berlaku untuk produk di keranjang.");
    }
  };

  // Calculate appropriate price based on quantity and thresholds
  const getApplicablePrice = (product: any, quantity: number) => {
    if (!product.priceThresholds) {
      return product.discountPrice !== null ? product.discountPrice : product.price;
    }
    
    // Sort thresholds in descending order by minQuantity
    const sortedThresholds = [...product.priceThresholds].sort((a, b) => b.minQuantity - a.minQuantity);
    
    // Find the first threshold that applies
    for (const threshold of sortedThresholds) {
      if (quantity >= threshold.minQuantity) {
        return threshold.price;
      }
    }
    
    // If no threshold applies, use the default price
    return product.discountPrice !== null ? product.discountPrice : product.price;
  };

  // Calculate savings compared to base price
  const calculateSavings = (product: any, quantity: number) => {
    const basePrice = product.price;
    const appliedPrice = getApplicablePrice(product, quantity);
    
    return (basePrice - appliedPrice) * quantity;
  };

  // Add to cart function
  const addToCart = (product: any, sourceElement?: HTMLElement, quantity: number = 1) => {
    // Validate quantity first
    if (quantity <= 0) {
      setShowAngryQuantity(true);
      toast.error("🚨 Jumlah produk harus lebih dari 0!", { 
        position: 'top-center', 
        style: { 
          marginTop: '60px',
          backgroundColor: '#ff4500',
          color: 'white',
          fontWeight: 'bold',
          border: '2px solid #ff6b35',
          boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)'
        },
        duration: 3000
      });
      
      // Reset angry animation after 3 seconds
      setTimeout(() => {
        setShowAngryQuantity(false);
      }, 3000);
      return;
    }
    
    if (product.models && !selectedModel) {
      toast.error("Silakan pilih model/varian plakat terlebih dahulu.", { position: 'top-center', style: { marginTop: '60px' } });
      return;
    }
    if (idCardWithCaseIds.includes(product.id) && !selectedCase) {
      setShowAngryCase(true);
      toast.error("🚨 Mohon pilih jenis casing terlebih dahulu!", { 
        position: 'top-center', 
        style: { 
          marginTop: '60px',
          backgroundColor: '#ff4500',
          color: 'white',
          fontWeight: 'bold',
          border: '2px solid #ff6b35',
          boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)'
        },
        duration: 4000
      });
      
      // Scroll to case selection area to draw attention
      setTimeout(() => {
        const caseContainer = document.getElementById('case-selection-container');
        if (caseContainer) {
          caseContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      
      // Reset angry animation after 3 seconds
      setTimeout(() => {
        setShowAngryCase(false);
      }, 3000);
      
      return;
    }
    if (stikerWithLaminationIds.includes(product.id) && !selectedLamination) {
      setShowAngryLamination(true);
      toast.error("🚨 Mohon pilih jenis laminasi terlebih dahulu!", { 
        position: 'top-center', 
        style: { 
          marginTop: '60px',
          backgroundColor: '#ff4500',
          color: 'white',
          fontWeight: 'bold',
          border: '2px solid #ff6b35',
          boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)'
        },
        duration: 4000
      });
      
      // Scroll to lamination selection area to draw attention
      setTimeout(() => {
        const laminationContainer = document.getElementById('lamination-selection-container');
        if (laminationContainer) {
          laminationContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      
      // Reset angry animation after 3 seconds
      setTimeout(() => {
        setShowAngryLamination(false);
      }, 3000);
      
      return;
    }
    const existingItem = cartItems.find(item => 
      item.id === product.id && 
      (!product.models || item.modelCode === selectedModel) &&
      (!idCardWithCaseIds.includes(product.id) || item.caseVariant === selectedCase) &&
      (!stikerWithLaminationIds.includes(product.id) || item.laminationVariant === selectedLamination)
    );
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const newPrice = getApplicablePrice(product, newQuantity);
      
      setCartItems(
        cartItems.map(item =>
          item.id === product.id && (!product.models || item.modelCode === selectedModel)
            ? { 
                ...item, 
                quantity: newQuantity, 
                appliedPrice: newPrice,
                savings: calculateSavings(product, newQuantity)
              } 
            : item
        )
      );
      toast.success(`${product.name} ditambahkan +${quantity} (Total: ${newQuantity}×)`, { 
        position: 'top-center', 
        duration: 2000, 
        style: { 
          marginTop: '60px',
          fontSize: '12px',
          padding: '6px 10px',
          minHeight: '36px',
          maxWidth: '260px'
        }
      });
      
      // Trigger flying animation only on successful add
      triggerFlyingAnimation(sourceElement);
    } else {
      const newItem = { 
        ...product, 
        quantity: quantity, 
        appliedPrice: getApplicablePrice(product, quantity),
        savings: calculateSavings(product, quantity),
        modelCode: product.models ? selectedModel : undefined,
        caseVariant: idCardWithCaseIds.includes(product.id) ? selectedCase : undefined,
        laminationVariant: stikerWithLaminationIds.includes(product.id) ? selectedLamination : undefined
      };
      setCartItems([...cartItems, newItem]);
      toast.success(`${product.name} ditambahkan ${quantity}× ke keranjang`, { 
        position: 'top-center', 
        duration: 2000, 
        style: { 
          marginTop: '60px',
          fontSize: '12px',
          padding: '6px 10px',
          minHeight: '36px',
          maxWidth: '260px'
        }
      });
      
      // Trigger flying animation only on successful add
      triggerFlyingAnimation(sourceElement);
    }
  };

  // Remove from cart function
  const removeFromCart = (id: number) => {
    const existingItem = cartItems.find(item => item.id === id);
    
    if (existingItem && existingItem.quantity > 1) {
      const newQuantity = existingItem.quantity - 1;
      const product = Object.values(products).flat().find((p: any) => p.id === id);
      const newPrice = getApplicablePrice(product, newQuantity);
      
      setCartItems(
        cartItems.map(item =>
          item.id === id 
            ? { 
                ...item, 
                quantity: newQuantity, 
                appliedPrice: newPrice,
                savings: calculateSavings(product, newQuantity)
              } 
            : item
        )
      );
      
      // Show notification for decreasing quantity
      toast.info(`Jumlah ${existingItem.name} dikurangi (${newQuantity}×)`, { position: 'top-center', duration: 2000, style: { marginTop: '60px' } });
    } else {
      setCartItems(cartItems.filter(item => item.id !== id));
      
      // Show notification for removing product
      if (existingItem) {
        toast.info(`${existingItem.name} dihapus dari keranjang`, { position: 'top-center', duration: 2000, style: { marginTop: '60px' } });
      }
    }
  };

  // Delete item completely from cart
  const deleteFromCart = (id: number) => {
    const itemToDelete = cartItems.find(item => item.id === id);
    
    setCartItems(cartItems.filter(item => item.id !== id));
    
    // Show notification for deleting product
    if (itemToDelete) {
      toast.info(`${itemToDelete.name} dihapus dari keranjang`, { position: 'top-center', duration: 2000, style: { marginTop: '60px' } });
    }
  };

  // Calculate total price with promo discount
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      let itemPrice = item.appliedPrice * item.quantity;
      if (promoCode && validPromoCodes[promoCode]) {
        const promoInfo = validPromoCodes[promoCode];
        const productMatches = promoInfo.productIds === null || promoInfo.productIds.includes(item.id);
        const quantityMatches = !promoInfo.minQuantity || item.quantity >= promoInfo.minQuantity;
        
        if (productMatches && quantityMatches) {
          itemPrice = itemPrice * (1 - promoInfo.discount / 100);
        }
      }
      return total + itemPrice;
    }, 0);
  };

  // Calculate total savings
  const calculateTotalSavings = () => {
    return cartItems.reduce((total, item) => {
      return total + item.savings;
    }, 0);
  };

  // Open product details modal
  const openProductDetails = (product: any) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setModalQuantity(0); // Reset quantity to 0 to demonstrate highlight
    setShowAngryQuantity(false); // Reset angry quantity state
    if (idCardWithCaseIds.includes(product.id)) {
      setSelectedCase("");
    }
    if (stikerWithLaminationIds.includes(product.id)) {
      setSelectedLamination("");
    }
    
    // Set default dimensions for dimensional products
    if (product.pricingMethod === "dimensional") {
      // Set default dimensions based on the product type
      // Default to a reasonable size like 1x1 or match any predefined dimensions
      setBannerWidth(1);
      setBannerHeight(1);
      
      // If it's the banner product, set a more standard banner size
      if (product.name === "Banner") {
        setBannerWidth(2);
        setBannerHeight(1);
      }
    }
    
    // Update URL to product-specific URL (only if not already a product URL)
    if (!slug) {
      const productSlug = generateProductSlug(product.name);
      navigate(`/product/${productSlug}`, { replace: true });
    }
  };

  // Navigate through product images
  const nextImage = () => {
    if (selectedProduct) {
      const totalImages = [selectedProduct.image, ...selectedProduct.additionalImages].length;
      setCurrentImageIndex((currentImageIndex + 1) % totalImages);
    }
  };

  const prevImage = () => {
    if (selectedProduct) {
      const totalImages = [selectedProduct.image, ...selectedProduct.additionalImages].length;
      setCurrentImageIndex((currentImageIndex - 1 + totalImages) % totalImages);
    }
  };

  // Google Sheet submission function
  const submitToGoogleSheet = async (orderData: any) => {
    try {
      const formData = new URLSearchParams();
      
      // Format order details to include name, quantity, dimensions for banner products, and model code
      const simplifiedOrderDetails = [
        ...orderData.cartItems.map((item: any) => {
          let modifiedName = item.name;
          if (item.width && item.height) {
            const area = (item.width * item.height).toFixed(2);
            modifiedName = `${item.name} [${item.width}m × ${item.height}m, ${area}m²]`;
          }
          if (item.modelCode) {
            modifiedName = `${item.name} [${item.modelCode}]`;
          }
          // Add this for casing
          if (item.caseVariant) {
            const caseName = caseVariants.find(c => c.code === item.caseVariant)?.name || item.caseVariant;
            modifiedName = `${item.name} [Casing: ${caseName}]`;
          }
          // Add this for lamination
          if (item.laminationVariant) {
            modifiedName = `${item.name} [Laminasi: ${item.laminationVariant}]`;
          }
          return {
            name: modifiedName,
            quantity: item.quantity,
            price: item.appliedPrice,
            width: item.width || 0,
            height: item.height || 0,
            hasDimensions: item.width && item.height ? true : false,
            modelCode: item.modelCode || '',
            caseVariant: item.caseVariant,
            laminationVariant: item.laminationVariant
          };
        }),
        ...(orderData.requestJasaDesain ? [{
          name: 'Jasa Desain',
          quantity: 1,
          price: JASA_DESAIN_PRICE,
          width: 0,
          height: 0,
          hasDimensions: false,
          modelCode: ''
        }] : [])
      ];
      
      // Add all order data to formData
      formData.append('InvoiceNumber', orderData.invoiceNumber);
      formData.append('CustomerName', orderData.customerName);
      formData.append('Instansi', orderData.instansi || '');
      formData.append('PhoneNumber', orderData.phoneNumber);
      formData.append('DesignNote', encodeURIComponent(orderData.designNote || '').replace(/%20/g, '+'));
      formData.append('OrderDetails', JSON.stringify(simplifiedOrderDetails));
      
      // Add separate detail fields for banners to ensure dimensions are captured
      const bannerItems = orderData.cartItems.filter(item => item.width && item.height);
      if (bannerItems.length > 0) {
        formData.append('HasBanners', 'true');
        formData.append('BannerDetails', JSON.stringify(bannerItems.map(item => ({
          name: item.name,
          id: item.id,
          width: item.width,
          height: item.height,
          dimensions: `${item.width}m × ${item.height}m`,
          area: (item.width * item.height).toFixed(2),
          price: item.appliedPrice,
          quantity: item.quantity
        }))));
        
        // Add a single string with all banner dimensions for easier Google Sheet processing
        const bannerDimensionsText = bannerItems.map(item => 
          `${item.name}: ${item.width}m × ${item.height}m (${(item.width * item.height).toFixed(2)}m²)`
        ).join('; ');
        formData.append('BannerDimensions', bannerDimensionsText);
        
        // Also add individual banner dimensions for easier parsing
        bannerItems.forEach((item, index) => {
          formData.append(`Banner_${index}_Name`, item.name);
          formData.append(`Banner_${index}_Width`, item.width.toString());
          formData.append(`Banner_${index}_Height`, item.height.toString());
          formData.append(`Banner_${index}_Area`, (item.width * item.height).toFixed(2));
          formData.append(`Banner_${index}_Quantity`, item.quantity.toString());
          formData.append(`Banner_${index}_Price`, item.appliedPrice.toString());
        });
        
        // Log banner details to console for debugging
        console.log('Banner details being sent:', bannerItems);
      }
      
      formData.append('Subtotal', orderData.subtotal.toString());
      formData.append('PromoCode', orderData.promoCode || '');
      formData.append('PromoDiscount', orderData.promoDiscount.toString());
      formData.append('Total', orderData.total.toString());
      formData.append('ShippingInfo', orderData.isShipping.toString());
      formData.append('Address', orderData.address || '');
      formData.append('RequestJasaDesain', orderData.requestJasaDesain ? 'Ya' : 'Tidak');
      formData.append('IsExpressPrint', orderData.isExpressPrint ? 'Ya' : 'Tidak');
      if (orderData.requestJasaDesain) {
        formData.append('JasaDesainPrice', JASA_DESAIN_PRICE.toString());
      }

      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbw7Ht5Ax693Wt99YC-kBQXYmzohctNRUQzuH_rLWvfySR9lM3QkBo_7emeL7T8Erkpy/exec', {
          method: 'POST',
          body: formData,
          mode: 'no-cors'
        });
        
        // Note: With 'no-cors' mode, we can't read the response,
        // but we can assume it's successful if no error is thrown
        console.log('Google Sheets submission completed');
        return { success: true };
      } catch (fetchError) {
        console.error('Error submitting to Google Sheet:', fetchError);
        // Show a toast with error details
        toast.error('Error sending to Google Sheets: ' + fetchError.message, { position: 'top-center', duration: 2000, style: { marginTop: '60px' } });
        throw fetchError;
      }
    } catch (error) {
      console.error('Error preparing order data:', error);
      toast.error('Error preparing order data: ' + error.message, { position: 'top-center', duration: 2000, style: { marginTop: '60px' } });
      throw error;
    }
  };

  // WhatsApp redirection function with integrated receipt generation
  const handleWhatsAppRedirect = async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    if (!customerName || !phoneNumber) {
      toast.error("Mohon isi nama dan nomor telepon kamu.", { position: 'top-center', style: { marginTop: '60px' } });
      return;
    }

    if (isShipping && !address) {
      toast.error("Mohon isi alamat pengiriman kamu.", { position: 'top-center', style: { marginTop: '60px' } });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare order data
      const orderData = {
        invoiceNumber,
        customerName,
        instansi,
        phoneNumber,
        designNote,
        cartItems,
        subtotal: cartItems.reduce((total, item) => total + (item.appliedPrice * item.quantity), 0),
        promoCode,
        promoDiscount,
        total: calculateTotal() + (requestJasaDesain ? JASA_DESAIN_PRICE : 0) + (isExpressPrint ? JASA_DESAIN_PRICE : 0),
        isShipping,
        address,
        requestJasaDesain,
        isExpressPrint
      };

      // Start receipt generation process (non-blocking)
      generateReceiptDuringProcessing();

      // Save to Google Sheet
      await submitToGoogleSheet(orderData);

      // Prepare WhatsApp message (do this before showing success dialog)
      const productList = cartItems.map(item => {
        let itemInfo = `- ${item.name} (${item.quantity}×) — Rp ${item.appliedPrice.toLocaleString('id-ID')}`;
        if (item.width && item.height) {
          const area = (item.width * item.height).toFixed(2);
          itemInfo += `\n  Ukuran: ${item.width}m × ${item.height}m (${area} m²)`;
        }
        if (item.modelCode) {
          itemInfo += `\n  Kode: ${item.modelCode}`;
        }
        if (item.caseVariant) {
          const caseName = caseVariants.find(c => c.code === item.caseVariant)?.name || item.caseVariant;
          itemInfo += `\n  Casing: ${caseName}`;
        }
        if (item.laminationVariant) {
          itemInfo += `\n  Laminasi: ${item.laminationVariant}`;
        }
        return itemInfo;
      }).join('\n');

      const totalSavings = calculateTotalSavings();
      const savingsMessage = totalSavings > 0 ? 
        `\nKamu hemat: Rp ${totalSavings.toLocaleString('id-ID')}` : '';
      const promoMessage = promoDiscount > 0 ?
        `\nKode Promo: ${promoCode} (${promoDiscount}% discount)` : '';
      const jasaDesainMessage = requestJasaDesain ? `\nJasa Desain: Rp ${JASA_DESAIN_PRICE.toLocaleString('id-ID')}` : '';
      const expressPrintMessage = isExpressPrint ? `\nCetak Express: Rp ${JASA_DESAIN_PRICE.toLocaleString('id-ID')}` : '';
      const designNoteMessage = designNote ? `\nNote/Link Desain: ${designNote}` : '';

      const message = `Informasi Order:
Nama: ${customerName}
Instansi/Alias: ${instansi || '-'}
Telp: ${phoneNumber}${promoMessage}${designNoteMessage}
${isShipping ? `Alamat: ${address}` : 'Ambil di tempat: Ya (tidak perlu dikirim)'}

Detail Order:
${productList}${jasaDesainMessage}${expressPrintMessage}

Total: Rp ${(calculateTotal() + (requestJasaDesain ? JASA_DESAIN_PRICE : 0) + (isExpressPrint ? JASA_DESAIN_PRICE : 0)).toLocaleString('id-ID')}${savingsMessage}`;

      const whatsappUrl = `https://wa.me/6285172157808?text=${encodeURIComponent(message)}`;
      
      // Store the WhatsApp URL in state
      setWhatsAppUrl(whatsappUrl);
      
      // Wait for receipt generation to complete before showing success dialog
      // We'll set this in the generateReceiptDuringProcessing function
      
    } catch (error) {
      setIsSubmitting(false);
      setShowReceipt(false); // Close receipt modal on error
      toast.error("Gagal menyimpan data pesanan. Silakan coba lagi.", { position: 'top-center', style: { marginTop: '60px' } });
      console.error(error);
    }
  };

  const addBannerToCart = (product, width, height) => {
    const calculatedPrice = calculateBannerPrice(product, width, height);
    const newItem = {
      ...product,
      width,
      height, 
      appliedPrice: calculatedPrice,
      quantity: 1,
      savings: product.price - calculatedPrice > 0 ? product.price - calculatedPrice : 0,
      isDimensionalProduct: true,
      dimensionText: `${width}m × ${height}m`,
      area: (width * height).toFixed(2) + ' m²'
    };
    
    setCartItems([...cartItems, newItem]);
    setSelectedProduct(null);
    
    // Show success notification for banner with dimensions
    toast.success(`${product.name} ditambahkan ke keranjang`, { 
      position: 'top-center', 
      duration: 2000, 
      style: { 
        marginTop: '60px',
        fontSize: '12px',
        padding: '6px 10px',
        minHeight: '36px',
        maxWidth: '260px'
      }
    });
    
    // Trigger flying animation for banner products
    triggerFlyingAnimation();
  };

  const calculateTotalDiscount = () => {
    if (!promoCode || !validPromoCodes[promoCode]) return 0;
    
    const promoInfo = validPromoCodes[promoCode];
    return cartItems.reduce((discount, item) => {
      const productMatches = promoInfo.productIds === null || promoInfo.productIds.includes(item.id);
      const quantityMatches = !promoInfo.minQuantity || item.quantity >= promoInfo.minQuantity;
      
      if (productMatches && quantityMatches) {
        return discount + (item.appliedPrice * item.quantity * (promoInfo.discount / 100));
      }
      return discount;
    }, 0);
  };

  // Generate receipt as JPG during order processing
  const generateReceiptDuringProcessing = async () => {
    // Only proceed if not already showing receipt (prevent multiple calls)
    if (showReceipt) {
      return;
    }
    
    // Wait for logo to load if not already loaded
    if (!logoBase64) {
      console.log('Waiting for logo to load...');
      await new Promise(resolve => {
        const checkLogo = () => {
          if (logoBase64) {
            resolve(true);
          } else {
            setTimeout(checkLogo, 100);
          }
        };
        checkLogo();
      });
    }
    
    // Show receipt modal first
    setShowReceipt(true);
    
    // Play printing sound effect
    try {
      const audio = new Audio('/audio/printing.wav');
      audio.volume = 0.6; // Set volume to 60%
      audio.play().catch(error => {
        console.log('Audio play prevented by browser policy:', error);
      });
    } catch (error) {
      console.log('Audio loading error:', error);
    }
    
    // Wait for printing animation to complete (4 seconds)
    await new Promise(resolve => setTimeout(resolve, 4500));
    
    if (receiptRef.current) {
      try {
        // Wait longer for fonts and images to fully load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Force a reflow to ensure all text is rendered
        receiptRef.current.offsetHeight;
        
        const canvas = await html2canvas(receiptRef.current, {
          backgroundColor: '#ffffff',
          scale: 3,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: receiptRef.current.scrollWidth,
          height: receiptRef.current.scrollHeight,
          removeContainer: true,
          foreignObjectRendering: false,
          // Force text rendering
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('.receipt-content') as HTMLElement;
            if (clonedElement) {
              // Force font loading
              clonedElement.style.fontFamily = 'Courier New, Consolas, Monaco, Lucida Console, monospace';
              clonedElement.style.fontSize = clonedElement.style.fontSize || '12px';
              clonedElement.style.lineHeight = clonedElement.style.lineHeight || '1.4';
            }
          }
        });
        
        // Convert to PNG for perfect color fidelity (or JPG for smaller file size)
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `estimasi-biaya-${invoiceNumber}.png`;
        link.href = imgData;
        link.click();
        
        toast.success("Nota berhasil diunduh! Silakan lanjut ke WhatsApp.", { 
          position: 'top-center', 
          style: { marginTop: '60px' },
          duration: 3000 
        });
        
        // Close receipt modal and show success dialog
        setTimeout(() => {
          setShowReceipt(false);
          setShowOrderSuccess(true);
          setIsSubmitting(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error generating receipt:', error);
        toast.error("Gagal membuat nota, tapi pesanan tetap berhasil.", { 
          position: 'top-center', 
          style: { marginTop: '60px' } 
        });
        
        // Close receipt modal and show success dialog even on error
        setTimeout(() => {
          setShowReceipt(false);
          setShowOrderSuccess(true);
          setIsSubmitting(false);
        }, 1000);
      }
    } else {
      // If receiptRef is not available, just show success dialog
      setTimeout(() => {
        setShowReceipt(false);
        setShowOrderSuccess(true);
        setIsSubmitting(false);
      }, 1000);
    }
  };

  // Create an array of categories with their Lucide React icons and colors for the visual display
  const categories = [
    { id: "ID Card & Lanyard", name: "ID Card", icon: CreditCard, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-gray-100", inactiveText: "text-gray-700" },
    { id: "Media Promosi", name: "Banner", icon: Megaphone, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-gray-100", inactiveText: "text-gray-700" },
    { id: "Merchandise", name: "Merchandise", icon: Gift, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-gray-100", inactiveText: "text-gray-700" },
    { id: "Papan Bunga", name: "Papan Bunga", icon: Flower, color: "bg-[#FF5E01]", hoverColor: "hover:bg-[#FF5E01]/90", textColor: "text-white", inactiveColor: "bg-gray-100", inactiveText: "text-gray-700" }
  ];

  // IDs that require case selection
  const idCardWithCaseIds = [1, 2, 6, 7, 8];
  const stikerWithLaminationIds = [15]; // Cutting Stiker Kontur

  return (
    <div className="min-h-screen bg-white notranslate flex flex-col" translate="no">
      <div className="container mx-auto max-w-md md:max-w-full lg:max-w-7xl bg-white flex-1 flex flex-col px-4 md:px-6 lg:px-6">
        {/* Header */}
        <div className="bg-white shadow-sm p-3 lg:p-4 flex justify-between items-center sticky top-0 z-20 -mx-4 md:-mx-6 lg:-mx-6 px-4 md:px-6 lg:px-6">
          <img 
            src="/product-image/Tidurlah Logo Horizontal.png"
            alt="TIDURLAH STORE"
            className="h-8 lg:h-10 object-contain"
          />
          <div className="flex items-center space-x-2 lg:space-x-4">
            <MusicPlayer />
            <button 
              onClick={() => window.open('/blog', '_blank')}
              className="text-[#FF5E01] hover:text-[#FF5E01]/80 text-xs font-medium flex items-center p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Newspaper className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
            <button 
              className="relative p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-colors"
              onClick={() => setShowCart(true)}
              data-cart-icon
            >
              <ShoppingCart className="h-6 w-6 text-[#FF5E01]" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {!showOrderForm ? (
          /* Product Listing */
          <div className="p-3 flex-1">
            {/* Banner Carousel */}
            <BannerCarousel />
            
            {/* Search Bar after banner slider lines */}
            <SearchBar onSearch={handleSearch} />
            
            {/* Desktop: Side by Side Layout | Mobile: Stacked */}
            <div className="mt-6 mb-4 flex flex-col lg:flex-row lg:gap-6 lg:items-start">
              {/* Promoted Products */}
              <div className="lg:w-1/3 lg:flex-shrink-0">
                <PromotedProducts 
                  products={products as Record<string, any[]>}
                  promotedProducts={promotedProducts}
                  onAddToCart={addToCart}
                  onOpenDetails={openProductDetails}
                />
              </div>
              
              {/* Category Grid */}
              <div className="mt-6 lg:mt-0 lg:flex-1">
                <div className="mb-3">
                  <h2 className="text-sm font-bold mb-2 text-gray-800 flex items-center">
                    <span className="material-symbols-outlined text-[#FF5E01] mr-1" style={{fontSize: '16px'}}>category</span>
                    Kategori Produk:
                  </h2>
                  <div className="grid grid-cols-4 lg:grid-cols-4 gap-2">
                {categories.map(category => {
                  const IconComponent = category.icon;
                  return (
                    <div 
                      key={category.id}
                      onClick={() => setActiveTab(category.id)}
                      className={`p-3 rounded-lg shadow-sm flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all duration-200 hover:scale-105 min-h-[80px] ${
                        activeTab === category.id 
                          ? `${category.color} ${category.textColor}` 
                          : `${category.inactiveColor} ${category.inactiveText} ${category.hoverColor}`
                      }`}
                    >
                      <IconComponent className="h-6 w-6" />
                      <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
                    </div>
                  );
                })}
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              {Object.keys(filteredProducts).map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                    {filteredProducts[category].map((product: any) => (
                      <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow duration-200 group">
                        <div 
                          className="relative cursor-pointer"
                          onClick={() => openProductDetails(product)}
                        >
                          <div className="relative pt-[100%]">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.bestseller && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md z-[5]">
                                Produk Terlaris
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-tl-md">
                            Lihat detail
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const shareUrl = generateProductUrl(product);
                              if (navigator.share) {
                                navigator.share({
                                  title: product.name,
                                  text: `Lihat produk ${product.name} di TIDURLAH STORE`,
                                  url: shareUrl,
                                });
                              } else {
                                navigator.clipboard.writeText(shareUrl);
                                toast.success("Link produk disalin!", { position: 'top-center', style: { marginTop: '60px' }, duration: 2000 });
                              }
                            }}
                            className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-white p-1.5 rounded-full transition-colors z-[5]"
                            title="Bagikan produk"
                          >
                            <Share2 className="h-3 w-3 text-gray-700" />
                          </button>
                        </div>
                        <div className="p-2 lg:p-3 flex flex-col flex-grow">
                          <h3 className="font-medium text-xs lg:text-sm line-clamp-2">{product.name}</h3>
                          {product.priceThresholds && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.priceThresholds.slice(0, 2).map((threshold: any, idx: number) => (
                                <div 
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-[#FF5E01] bg-opacity-10 rounded-full text-[#FF5E01] text-xxs font-medium"
                                >
                                  {threshold.minQuantity}
                                  {idx < product.priceThresholds.length - 1 ? '-' + (product.priceThresholds[idx + 1].minQuantity - 1) : '+'} : Rp {threshold.price.toLocaleString('id-ID')}
                                </div>
                              ))}
                              {product.priceThresholds.length > 2 && (
                                <div className="text-xxs text-gray-500 mt-0.5">
                                  +{product.priceThresholds.length - 2} lagi
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mt-auto pt-1">
                            {product.discountPrice !== null ? (
                              <div className="flex flex-col">
                                <span className="line-through text-gray-500 text-xxs">
                                  Rp {product.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[#FF5E01] font-semibold text-xs">
                                  Rp {product.discountPrice.toLocaleString('id-ID')}
                                </span>
                                <span className="text-xxs text-green-500">
                                  Hemat Rp {(product.price - product.discountPrice).toLocaleString('id-ID')}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-xs">
                                Rp {product.price.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                          {product.pricingMethod === "dimensional" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProductDetails(product);
                              }}
                              className="mt-1 w-full bg-[#FF5E01] text-white rounded-full py-1 lg:py-2 px-2 lg:px-4 text-xs lg:text-sm flex items-center justify-center hover:bg-[#e54d00] transition-colors"
                            >
                              <ShoppingBag className="h-3 w-3 lg:h-4 lg:w-4 mr-1" /> Masukkan Ukuran
                            </button>
                          ) : idCardWithCaseIds.includes(product.id) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProductDetails(product);
                              }}
                              className="mt-1 w-full bg-[#FF5E01] text-white rounded-full py-1 lg:py-2 px-2 lg:px-4 text-xs lg:text-sm flex items-center justify-center hover:bg-[#e54d00] transition-colors"
                            >
                              <ShoppingBag className="h-3 w-3 lg:h-4 lg:w-4 mr-1" /> Pilih Casing
                            </button>
                          ) : stikerWithLaminationIds.includes(product.id) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProductDetails(product);
                              }}
                              className="mt-1 w-full bg-[#FF5E01] text-white rounded-full py-1 lg:py-2 px-2 lg:px-4 text-xs lg:text-sm flex items-center justify-center hover:bg-[#e54d00] transition-colors"
                            >
                              <ShoppingBag className="h-3 w-3 lg:h-4 lg:w-4 mr-1" /> Pilih Laminasi
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProductDetails(product);
                              }}
                              className="mt-1 w-full bg-[#FF5E01] text-white rounded-full py-1 lg:py-2 px-2 lg:px-4 text-xs lg:text-sm flex items-center justify-center hover:bg-[#e54d00] transition-colors"
                            >
                              <ShoppingBag className="h-3 w-3 lg:h-4 lg:w-4 mr-1" /> Pilih Jumlah
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {cartItems.length > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowOrderForm(true)}
                  className="bg-[#FF5E01] text-white rounded-full py-2 px-6 font-medium shadow-md"
                >
                  Lanjut
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Order Form */
          <div className="p-3 flex-1">
            <button
              onClick={() => setShowOrderForm(false)}
              className="mb-3 text-[#FF5E01] flex items-center"
            >
              ← Kembali ke Produk
            </button>
            
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Informasi Pesanan</h2>
              <p className="text-sm text-gray-600">No. Invoice: {invoiceNumber}</p>
            </div>
            
            {/* Desktop: Two Column Layout, Mobile: Single Column */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
              
              {/* Left Column: Customer Information */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (e.target.value.length < 3) {
                          setNameError("Nama minimal 3 karakter");
                        } else {
                          setNameError("");
                        }
                      }}
                      placeholder="Nama Panggilan"
                      required
                    />
                    {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instansi/Alias</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={instansi}
                      onChange={(e) => setInstansi(e.target.value)}
                      placeholder="Nama Sekolah, Kampus/Perusahaan kamu"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (e.target.value.length < 10) {
                          setPhoneError("Nomor telepon minimal 10 digit");
                        } else {
                          setPhoneError("");
                        }
                      }}
                      placeholder="Nomor Telepon Kamu"
                      required
                    />
                    {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note/Link Desain (Jika Ada) </label>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={designNote}
                      onChange={(e) => setDesignNote(e.target.value)}
                      placeholder="Masukkan note cetak dan atau link desain kamu (canva/Google Drive), pastikan akses sudah dibuka"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700">Opsi Tambahan</h3>
                    
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="shippingOption"
                        checked={isShipping}
                        onChange={() => setIsShipping(!isShipping)}
                        className="mt-1 mr-3 h-4 w-4 text-[#FF5E01] focus:ring-[#FF5E01] border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <label htmlFor="shippingOption" className="text-sm text-gray-700 leading-relaxed mr-2">
                            Perlu pengiriman?
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowShippingTooltip(!showShippingTooltip)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <span className="text-sm border border-gray-400 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</span>
                          </button>
                        </div>
                        {showShippingTooltip && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                            Jika tidak dicentang, ambil di tempat, jasa kirim JNT, JNE, Maxim/Gojek, ongkir ditanggung customer
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="jasaDesainOption"
                        checked={requestJasaDesain}
                        onChange={() => setRequestJasaDesain(!requestJasaDesain)}
                        className="mt-1 mr-3 h-4 w-4 text-[#FF5E01] focus:ring-[#FF5E01] border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <label htmlFor="jasaDesainOption" className="text-sm text-gray-700 leading-relaxed mr-2">
                            Request Jasa Desain? (+Rp 25.000)
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowJasaDesainTooltip(!showJasaDesainTooltip)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <span className="text-sm border border-gray-400 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</span>
                          </button>
                        </div>
                        {showJasaDesainTooltip && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                            Desain kami yang buatkan, gratis revisi 2x, dengan desain terbaik. bisa request sesuai contoh
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="expressPrintOption"
                        checked={isExpressPrint}
                        onChange={() => setIsExpressPrint(!isExpressPrint)}
                        className="mt-1 mr-3 h-4 w-4 text-[#FF5E01] focus:ring-[#FF5E01] border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <label htmlFor="expressPrintOption" className="text-sm text-gray-700 leading-relaxed mr-2">
                            Cetak Express (+Rp 25.000)
                          </label>
                          <span className="bg-[#FF5E01] text-white text-xs px-2 py-1 rounded-full mr-1">HOT</span>
                          <button
                            type="button"
                            onClick={() => setShowExpressTooltip(!showExpressTooltip)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <span className="text-sm border border-gray-400 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</span>
                          </button>
                        </div>
                        {showExpressTooltip && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                            Cetak express artinya cetakan akan masuk urutan prioritas, dan akan di cetak lebih dulu estimasi:<br/><span className="line-through">2-3 hari</span> <span className="font-semibold">(1 hari)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isShipping && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman</label>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 p-2"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Masukkan alamat lengkap pengiriman"
                        rows={3}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="space-y-4">
                <div className="border-t border-b xl:border xl:rounded-lg py-3 xl:p-4 my-3 xl:my-0 xl:bg-gray-50">
                  <h3 className="font-medium mb-3 text-sm">Ringkasan Pesanan</h3>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm mb-3">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.modelCode && (
                          <p className="text-xs text-gray-600">Kode: {item.modelCode}</p>
                        )}
                        {item.width && item.height && (
                          <p className="text-xs text-gray-600">
                            {item.width}m × {item.height}m ({(item.width * item.height).toFixed(2)} m²)
                          </p>
                        )}
                        {item.caseVariant && (
                          <p className="text-xs text-gray-600">
                            Casing: {caseVariants.find(c => c.code === item.caseVariant)?.name}
                          </p>
                        )}
                        {item.laminationVariant && (
                          <p className="text-xs text-gray-600">
                            Laminasi: {item.laminationVariant}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 rounded-full hover:bg-gray-100 border"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              const product = Object.values(products).flat().find((p: any) => p.id === item.id);
                              if (product) {
                                const newPrice = getApplicablePrice(product, newQuantity);
                                setCartItems(
                                  cartItems.map(cartItem =>
                                    cartItem.id === item.id 
                                      ? { 
                                          ...cartItem, 
                                          quantity: newQuantity, 
                                          appliedPrice: newPrice,
                                          savings: calculateSavings(product, newQuantity)
                                        } 
                                      : cartItem
                                  )
                                );
                              }
                            }}
                            className="w-12 text-center border rounded p-1"
                          />
                          <button
                            onClick={() => addToCart(item)}
                            className="p-1 rounded-full hover:bg-gray-100 border"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-right">Rp {(item.appliedPrice * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                  
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <p>Subtotal</p>
                      <p>Rp {cartItems.reduce((total, item) => total + (item.appliedPrice * item.quantity), 0).toLocaleString('id-ID')}</p>
                    </div>
                    
                    {promoDiscount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <p>Diskon Promo ({promoDiscount}%)</p>
                        <p>- Rp {calculateTotalDiscount().toLocaleString('id-ID')}</p>
                      </div>
                    )}
                    
                    {requestJasaDesain && (
                      <div className="flex justify-between items-center text-sm text-[#FF5E01]">
                        <p>Jasa Desain</p>
                        <p>Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}</p>
                      </div>
                    )}
                    
                    {isExpressPrint && (
                      <div className="flex justify-between items-center text-sm text-[#FF5E01]">
                        <p>Cetak Express</p>
                        <p>Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center font-medium mt-2">
                      <p>Total</p>
                      <p>Rp {(calculateTotal() + (requestJasaDesain ? JASA_DESAIN_PRICE : 0) + (isExpressPrint ? JASA_DESAIN_PRICE : 0)).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Promo (Opsional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-gray-300 p-2"
                        value={promoCode}
                        onChange={(e) => handlePromoCodeChange(e.target.value)}
                        placeholder="Masukkan kode promo"
                      />
                      {promoCodeError && (
                        <p className="text-red-500 text-xs mt-1">{promoCodeError}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleWhatsAppRedirect}
                    disabled={
                      Boolean(isSubmitting) ||
                      Boolean(nameError) ||
                      Boolean(phoneError) ||
                      customerName.length < 3 ||
                      phoneNumber.length < 10
                    }
                    className={`w-full bg-[#FF5E01] text-white rounded-lg py-3 font-medium shadow-md text-base ${
                      Boolean(isSubmitting) || Boolean(nameError) || Boolean(phoneError) || customerName.length < 3 || phoneNumber.length < 10 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Memproses...' : 'Lanjut ke WhatsApp'}
                  </button>
                  
                  <div className="flex items-center justify-center text-sm text-green-600 mt-2">
                    <Check className="h-4 w-4 mr-1" /> 
                    <p>Pesanan kamu akan kami alihkan ke admin resmi kami</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="sm:max-w-md lg:max-w-2xl max-w-[calc(100%-2rem)] mx-auto rounded-lg overflow-hidden max-h-[90vh] p-0">
            <div className="relative h-full flex flex-col" style={{ maxHeight: "80vh" }}>
              {/* Fixed Header */}
              <div className="p-4 border-b bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-lg">Keranjang Kamu</h2>
                </div>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(80vh - 150px)" }}>
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-500">Keranjang masih kosong</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          {item.width && item.height && (
                            <p className="text-xs text-gray-600">
                              {item.width}m × {item.height}m ({(item.width * item.height).toFixed(2)} m²)
                            </p>
                          )}
                          <p className="text-gray-500 text-xs">Rp {item.appliedPrice.toLocaleString('id-ID')}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 rounded-full hover:bg-gray-100 border"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1;
                                const product = Object.values(products).flat().find((p: any) => p.id === item.id);
                                if (product) {
                                  const newPrice = getApplicablePrice(product, newQuantity);
                                  setCartItems(
                                    cartItems.map(cartItem =>
                                      cartItem.id === item.id 
                                        ? { 
                                            ...cartItem, 
                                            quantity: newQuantity, 
                                            appliedPrice: newPrice,
                                            savings: calculateSavings(product, newQuantity)
                                          } 
                                        : cartItem
                                    )
                                  );
                                }
                              }}
                              className="w-12 text-center border rounded p-1"
                            />
                            <button
                              onClick={() => addToCart(item)}
                              className="p-1 rounded-full hover:bg-gray-100 border"
                            >
                              +
                            </button>
                            <button
                              onClick={() => deleteFromCart(item.id)}
                              className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {item.caseVariant && (
                            <p className="text-xs text-gray-600">Casing: {caseVariants.find(c => c.code === item.caseVariant)?.name}</p>
                          )}
                          {item.laminationVariant && (
                            <p className="text-xs text-gray-600">Laminasi: {item.laminationVariant}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Fixed Footer */}
              {cartItems.length > 0 && (
                <div className="p-4 border-t bg-white">
                  <div className="flex justify-between items-center text-sm">
                    <p>Subtotal</p>
                    <p>Rp {cartItems.reduce((total, item) => total + (item.appliedPrice * item.quantity), 0).toLocaleString('id-ID')}</p>
                  </div>
                  
                  {promoDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <p>Diskon Promo ({promoDiscount}%)</p>
                      <p>- Rp {calculateTotalDiscount().toLocaleString('id-ID')}</p>
                    </div>
                  )}
                  
                  {requestJasaDesain && (
                    <div className="flex justify-between items-center text-sm text-blue-600">
                      <p>Jasa Desain</p>
                      <p>Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center font-medium mt-2">
                    <p>Total</p>
                    <p>Rp {(calculateTotal() + (requestJasaDesain ? JASA_DESAIN_PRICE : 0)).toLocaleString('id-ID')}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowCart(false);
                      setShowOrderForm(true);
                    }}
                    className="w-full bg-[#FF5E01] text-white rounded-lg py-2 font-medium mt-3"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Product Details Modal */}
        <Dialog open={!!selectedProduct} onOpenChange={() => {
          setSelectedProduct(null);
          // Reset URL to home when modal is closed
          if (slug) {
            navigate('/', { replace: true });
          }
        }}>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] mx-auto rounded-lg overflow-hidden max-h-[90vh] p-0 [&>button]:bg-[#FF5E01] [&>button]:text-white [&>button]:rounded-full [&>button]:opacity-100 [&>button]:hover:bg-[#e54d00] [&>button]:transition-colors">
            {selectedProduct && (
              <div className="relative h-full flex flex-col" style={{ maxHeight: "90vh" }}>
                {/* Fixed Header */}
                <div className="p-4 border-b bg-white relative">
                  <div className="pr-20">
                    <h2 className="font-semibold text-lg">{selectedProduct.name}</h2>
                  </div>
                  {/* Share button positioned to align with close button */}
                    <button
                      onClick={() => {
                        const shareUrl = generateProductUrl(selectedProduct);
                        if (navigator.share) {
                          navigator.share({
                            title: selectedProduct.name,
                            text: `Lihat produk ${selectedProduct.name} di TIDURLAH STORE`,
                            url: shareUrl,
                          });
                        } else {
                          navigator.clipboard.writeText(shareUrl);
                          toast.success("Link produk disalin ke clipboard!", { position: 'top-center', style: { marginTop: '60px' } });
                        }
                      }}
                    className="absolute right-14 top-2 p-2 hover:bg-gray-100 rounded-full transition-colors z-[5]"
                      title="Bagikan produk"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
                      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
                    </svg>
                    </button>
                  </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
                <div className="relative">
                  <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "75%" }}>
                    <img
                      src={selectedProduct.models ? selectedProduct.models.find(m => m.code === selectedModel)?.image || selectedProduct.models[0].image : [selectedProduct.image, ...selectedProduct.additionalImages][currentImageIndex]}
                      alt={selectedProduct.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    {selectedProduct.additionalImages.length > 0 && !selectedProduct.models && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-white h-8 w-8 rounded-full flex items-center justify-center"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-white h-8 w-8 rounded-full flex items-center justify-center"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Model Selector for Plakat */}
                  {selectedProduct.models && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Pilih Model:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.models.map((model) => (
                          <button
                            key={model.code}
                            onClick={() => setSelectedModel(model.code)}
                            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                              selectedModel === model.code
                                ? "bg-[#FF5E01] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {model.code} - {model.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {selectedProduct.models ? (
                      selectedProduct.models.map((model, index) => (
                        <div
                          key={index}
                          className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden cursor-pointer ${
                            model.code === selectedModel ? 'ring-2 ring-[#FF5E01]' : ''
                          }`}
                          onClick={() => setSelectedModel(model.code)}
                        >
                          <img
                            src={model.image}
                            alt={`${model.name} - ${model.code}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      [selectedProduct.image, ...selectedProduct.additionalImages].map((image, index) => (
                        <div
                          key={index}
                          className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden cursor-pointer ${
                            index === currentImageIndex ? 'ring-2 ring-[#FF5E01]' : ''
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={image}
                            alt={`${selectedProduct.name} - Gambar ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                  {selectedProduct && idCardWithCaseIds.includes(selectedProduct.id) && (
                    <div className="mt-4">
                      <h4 className={`text-sm font-medium mb-2 transition-colors ${
                        showAngryCase ? "text-orange-600 font-bold" : ""
                      }`}>
                        Pilih Jenis Casing:
                      </h4>
                      <div 
                        className={`flex flex-wrap gap-2 transition-all duration-300 ${
                          showAngryCase ? "angry-wiggle" : ""
                        }`}
                        id="case-selection-container"
                      >
                        {caseVariants.map((variant) => (
                          <button
                            key={variant.code}
                            onClick={() => {
                              setSelectedCase(variant.code);
                              if (showAngryCase) {
                                setShowAngryCase(false); // Reset angry state when user selects
                                toast.success(`✅ Casing dipilih!`, {
                                  position: 'top-center',
                                  style: { 
                                    marginTop: '60px',
                                    fontSize: '12px',
                                    padding: '6px 10px',
                                    minHeight: '36px',
                                    maxWidth: '260px'
                                  },
                                  duration: 2000
                                });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                              selectedCase === variant.code
                                ? "bg-[#FF5E01] text-white"
                                : showAngryCase
                                ? "angry-highlight angry-pulse"
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
                  {selectedProduct && stikerWithLaminationIds.includes(selectedProduct.id) && (
                    <div className="space-y-2">
                      <h4 className={`font-medium text-sm transition-all duration-300 ${
                        showAngryLamination ? "text-orange-600 font-bold" : ""
                      }`}>
                        Pilih Jenis Laminasi:
                      </h4>
                      <div 
                        className={`flex flex-wrap gap-2 transition-all duration-300 ${
                          showAngryLamination ? "angry-wiggle" : ""
                        }`}
                        id="lamination-selection-container"
                      >
                        {selectedProduct.laminationOptions.map((lamination) => (
                          <button
                            key={lamination.type}
                            onClick={() => {
                              setSelectedLamination(lamination.type);
                              if (showAngryLamination) {
                                setShowAngryLamination(false); // Reset angry state when user selects
                                toast.success(`✅ Laminasi dipilih!`, {
                                  position: 'top-center',
                                  style: { 
                                    marginTop: '60px',
                                    fontSize: '12px',
                                    padding: '6px 10px',
                                    minHeight: '36px',
                                    maxWidth: '260px'
                                  },
                                  duration: 2000
                                });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                              selectedLamination === lamination.type
                                ? "bg-[#FF5E01] text-white"
                                : showAngryLamination
                                ? "angry-highlight angry-pulse"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {lamination.type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedProduct.priceThresholds && !selectedProduct.pricingMethod && (
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Harga Grosir:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.priceThresholds.map((threshold: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="bg-gray-50 p-2 rounded-lg border border-gray-100"
                          >
                            <div className="text-xs font-medium text-gray-500">
                              {threshold.minQuantity}+ item
                            </div>
                            <div className="text-sm font-semibold text-[#FF5E01]">
                              Rp {threshold.price.toLocaleString('id-ID')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-sm">Waktu Pengerjaan:</span>
                    <span className="text-sm text-gray-600">{selectedProduct.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-sm">Rating:</span>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedProduct.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {selectedProduct.rating}/5.0
                      </span>
                    </div>
                  </div>
                  
                  {selectedProduct.pricingMethod === "dimensional" && (
                    <div className="space-y-2 mt-3 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm">Ukuran Banner:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-600">Lebar (m)</label>
                          <input
                            type="number"
                            min={selectedProduct.minWidth}
                            max={selectedProduct.maxWidth}
                            step="0.5"
                            value={bannerWidth}
                            onChange={(e) => {
                              let val = parseFloat(e.target.value) || selectedProduct.minWidth;
                              val = Math.round(val * 2) / 2;
                              if (val < selectedProduct.minWidth) val = selectedProduct.minWidth;
                              if (val > selectedProduct.maxWidth) val = selectedProduct.maxWidth;
                              setBannerWidth(val);
                            }}
                            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Tinggi (m)</label>
                          <input
                            type="number"
                            min={selectedProduct.minHeight}
                            max={selectedProduct.maxHeight}
                            step="0.5"
                            value={bannerHeight}
                            onChange={(e) => {
                              let val = parseFloat(e.target.value) || selectedProduct.minHeight;
                              val = Math.round(val * 2) / 2;
                              if (val < selectedProduct.minHeight) val = selectedProduct.minHeight;
                              if (val > selectedProduct.maxHeight) val = selectedProduct.maxHeight;
                              setBannerHeight(val);
                            }}
                            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium text-[#FF5E01] mt-2">
                        Ukuran: {bannerWidth}m × {bannerHeight}m ({(bannerWidth * bannerHeight).toFixed(2)} m²)
                      </div>
                      <div className="text-sm font-medium text-[#FF5E01]">
                        Harga: Rp {calculateBannerPrice(selectedProduct, bannerWidth, bannerHeight).toLocaleString('id-ID')}
                      </div>
                    </div>
                  )}

                    {/* Add some bottom padding to ensure content doesn't get hidden behind the fixed footer */}
                    <div className="h-4"></div>
                  </div>
                </div>

                {/* Fixed Footer with Quantity Selector and Action Button */}
                <div className="border-t bg-white">
                  {/* Quantity Selector */}
                  <div className="p-4 pb-2">
                    {/* Progress Text for Discount - Moved Above */}
                    {selectedProduct && modalQuantity > 0 && modalQuantity < 4 && (
                      <div className="mb-3 text-center">
                        <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md">
                          Tambah {4 - modalQuantity} lagi untuk diskon maksimal!
                        </span>
                      </div>
                    )}
                    
                    <div className={`bg-gray-50 p-3 rounded-lg transition-all duration-300 ${
                      showAngryQuantity ? "angry-wiggle" : ""
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm transition-colors ${
                          showAngryQuantity ? "text-orange-600 font-bold" : ""
                        }`}>Jumlah:</span>
                        <div className={`flex items-center gap-3 transition-all duration-300 ${
                          showAngryQuantity ? "angry-highlight angry-pulse" : ""
                        }`}>
                          <button
                            onClick={() => {
                              if (modalQuantity > 0) {
                                setModalQuantity(modalQuantity - 1);
                                if (showAngryQuantity) {
                                  setShowAngryQuantity(false);
                                }
                              }
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${
                              modalQuantity <= 0 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : showAngryQuantity
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                            disabled={modalQuantity <= 0}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="9999"
                            value={modalQuantity === 0 ? '' : modalQuantity}
                            placeholder="0"
                            onFocus={(e) => {
                              // Select all text when focused for easy replacement
                              e.target.select();
                            }}
                            onChange={(e) => {
                              let rawValue = e.target.value;
                              
                              // Handle empty input
                              if (rawValue === '' || rawValue === null || rawValue === undefined) {
                                setModalQuantity(0);
                                return;
                              }
                              
                              // Remove leading zeros but keep single zero
                              rawValue = rawValue.replace(/^0+(?=\d)/, '');
                              
                              // Convert to number
                              const value = parseInt(rawValue) || 0;
                              
                              if (value >= 0 && value <= 9999) {
                                setModalQuantity(value);
                                if (showAngryQuantity && value > 0) {
                                  setShowAngryQuantity(false);
                                }
                              }
                            }}
                            className={`min-w-[3rem] w-16 text-center font-medium border rounded px-1 py-1 transition-all duration-300 ${
                              showAngryQuantity ? "text-orange-600 font-bold border-orange-300 bg-orange-50" : "border-gray-300 bg-white"
                            } ${modalQuantity === 0 ? "text-red-500 border-red-300" : ""}`}
                            style={{ fontSize: '14px' }}
                          />
                          <button
                            onClick={() => {
                              setModalQuantity(modalQuantity + 1);
                              if (showAngryQuantity) {
                                setShowAngryQuantity(false);
                                toast.success(`✅ Jumlah dipilih!`, {
                                  position: 'top-center',
                                  style: { 
                                    marginTop: '60px',
                                    fontSize: '12px',
                                    padding: '6px 10px',
                                    minHeight: '36px',
                                    maxWidth: '260px'
                                  },
                                  duration: 2000
                                });
                              }
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${
                              showAngryQuantity
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-[#FF5E01] text-white hover:bg-[#e54d00]'
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Show total price based on quantity */}
                      {selectedProduct && !selectedProduct.pricingMethod && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Harga:</span>
                            <span className="font-medium text-[#FF5E01]">
                              Rp {(getApplicablePrice(selectedProduct, modalQuantity) * modalQuantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                          {modalQuantity > 1 && calculateSavings(selectedProduct, modalQuantity) > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-green-600">Hemat:</span>
                              <span className="text-green-600 font-medium">
                                Rp {calculateSavings(selectedProduct, modalQuantity).toLocaleString('id-ID')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="px-4 pb-4">
                    {selectedProduct.pricingMethod === "dimensional" ? (
                      <button
                        onClick={() => addBannerToCart(selectedProduct, bannerWidth, bannerHeight)}
                      className="w-full bg-[#FF5E01] text-white rounded-lg py-3 font-medium shadow-md"
                      >
                        Tambahkan ke Keranjang
                      </button>
                    ) : selectedProduct.models ? (
                      <button
                        onClick={() => {
                          // Check if adding to cart was successful before closing modal
                          const wasSuccessful = !selectedProduct.models || selectedModel;
                          if (wasSuccessful) {
                            addToCart(selectedProduct, undefined, modalQuantity);
                            if (!idCardWithCaseIds.includes(selectedProduct.id) || selectedCase) {
                              setSelectedProduct(null);
                            }
                          }
                        }}
                      className={`w-full bg-[#FF5E01] text-white rounded-lg py-3 font-medium shadow-md ${!selectedModel || modalQuantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!selectedModel || modalQuantity <= 0}
                      >
                        Tambahkan ke Keranjang ({modalQuantity}×)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          // Check if case is selected for products that require it
                          const needsCase = idCardWithCaseIds.includes(selectedProduct.id);
                          const hasCase = !needsCase || selectedCase;
                          
                          // Check if lamination is selected for products that require it
                          const needsLamination = stikerWithLaminationIds.includes(selectedProduct.id);
                          const hasLamination = !needsLamination || selectedLamination;
                          
                          addToCart(selectedProduct, undefined, modalQuantity);
                          
                          // Only close modal if all validations passed and quantity is valid
                          if (hasCase && hasLamination && modalQuantity > 0) {
                            setSelectedProduct(null);
                          }
                        }}
                      className={`w-full bg-[#FF5E01] text-white rounded-lg py-3 font-medium shadow-md ${modalQuantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={modalQuantity <= 0}
                      >
                        Tambahkan ke Keranjang ({modalQuantity}×)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Order Success Modal */}
        <Dialog open={showOrderSuccess} onOpenChange={setShowOrderSuccess}>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] mx-auto rounded-lg">
            <div className="text-center py-4">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5E01] mx-auto mb-3"></div>
                  <h3 className="text-lg font-medium mb-2">Menyimpan Pesanan...</h3>
                  <p className="text-gray-600">Mohon tunggu sebentar</p>
                </>
              ) : (
                <>
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">Pesanan Berhasil!</h3>
                  <p className="text-gray-600 mb-4">Nota telah dicetak dan diunduh. Silakan lanjutkan ke WhatsApp untuk konfirmasi dengan admin kami.</p>
                  
                  <a 
                    href={whatsAppUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-[#25D366] text-white rounded-lg py-3 font-medium shadow-md"
                  >
                    <div className="flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                        <path d="M17.6 6.31999C16.2 4.91999 14.2 4.09999 12.1 4.09999C7.79995 4.09999 4.29995 7.59999 4.29995 11.9C4.29995 13.3 4.69995 14.7 5.39995 15.9L4.19995 19.9L8.29995 18.7C9.49995 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.79999 19 7.79999 17.6 6.31999ZM12.1 18.3C10.9 18.3 9.69995 17.9 8.69995 17.2L8.39995 17L5.99995 17.7L6.69995 15.4L6.39995 15.1C5.59995 14 5.19995 13 5.19995 11.9C5.19995 8.09999 8.29995 5.09999 12 5.09999C13.8 5.09999 15.5 5.79999 16.7 6.99999C17.9 8.19999 18.6 9.89999 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.89995 11.5C9.69995 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.79995 9.19999 9.59995 8.79999C9.39995 8.39999 9.19995 8.39999 8.99995 8.39999C8.89995 8.39999 8.69995 8.39999 8.49995 8.39999C8.29995 8.39999 7.99995 8.49999 7.79995 8.79999C7.59995 9.09999 7.09995 9.49999 7.09995 10.4C7.09995 11.3 7.79995 12.2 7.89995 12.4C8.09995 12.6 9.69995 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z" fill="white"/>
                      </svg>
                      Lanjutkan ke WhatsApp
                    </div>
                  </a>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Receipt Modal */}
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="sm:max-w-lg max-w-[calc(100%-2rem)] mx-auto rounded-lg overflow-hidden max-h-[90vh] p-0">
            <div className="p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium flex items-center justify-center gap-2">
                  Mencetak Nota Pembelian
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </h3>
                <p className="text-sm text-gray-600">Silakan tunggu, nota sedang dicetak</p>
              </div>
              
              {/* Thermal Printer Simulation */}
              <div className={`printer-container ${showReceipt ? 'printer-active' : ''}`}>
                {/* Printer LED Indicator */}
                <div className="printer-indicator"></div>
                
                {/* Printer Slot */}
                <div className="printer-slot"></div>
                
                {/* Receipt Sliding Area */}
                <div className="receipt-slide-container">
                  <div 
                    ref={receiptRef}
                    className={`receipt-paper ${showReceipt ? 'receipt-sliding' : ''}`}
                  >
                    <div 
                      className="receipt-content p-3 sm:p-4 md:p-6"
                      style={{ 
                        fontSize: '12px',
                        lineHeight: '1.4',
                        width: '100%',
                        maxWidth: 'min(350px, calc(100vw - 100px))',
                        margin: '0 auto',
                        minWidth: '250px',
                        fontFamily: 'Courier New, Consolas, Monaco, Lucida Console, monospace',
                        color: '#000000',
                        overflow: 'visible',
                        wordWrap: 'break-word'
                      }}
                    >
                                      {/* Store Header */}
                      <div className="text-center border-b border-dashed border-gray-400 pb-3 sm:pb-4 mb-3 sm:mb-4">
                        <div className="flex justify-center items-center mb-2">
                          {logoBase64 ? (
                            <img 
                              src={logoBase64}
                              alt="TIDURLAH GRAFIKA"
                              className="max-h-10 sm:max-h-12 md:max-h-14 w-auto object-contain max-w-[140px] sm:max-w-[160px] md:max-w-[180px]"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="max-h-10 sm:max-h-12 md:max-h-14 w-auto object-contain max-w-[140px] sm:max-w-[160px] md:max-w-[180px] flex items-center justify-center bg-gray-200 rounded">
                              <span className="text-xs text-gray-500">Loading...</span>
                            </div>
                          )}
                        </div>
                        <h2 className="text-base sm:text-lg font-bold tracking-wider">TIDURLAH GRAFIKA</h2>
                        <p className="text-xs italic">"Cetak apa aja, Tidurlah Grafika!"</p>
                        
                        <p className="text-xs mt-1">Perum. Korpri Raya, Blok D3. No. 3</p>
                          <p className="text-xs">Sukarame, Bandar Lampung</p>
                          <div className="border-b border-dashed border-gray-400 my-2"></div>
                          <p className="text-xs">WhatsApp: 085172157808</p>
                          <p className="text-xs">Instagram: @tidurlah_grafika</p>
                      </div>

                      {/* Transaction Details */}
                      <div className="border-b border-dashed border-gray-400 pb-3 sm:pb-4 mb-3 sm:mb-4">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>No. Estimasi:</span>
                          <span className="font-bold">{invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Tanggal:</span>
                          <span>{new Date().toLocaleDateString('id-ID', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Waktu:</span>
                          <span>{new Date().toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                        {customerName && (
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Pelanggan:</span>
                            <span className="font-medium break-words">{customerName}</span>
                          </div>
                        )}
                        {instansi && (
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Instansi:</span>
                            <span className="break-words">{instansi}</span>
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      <div className="border-b border-dashed border-gray-400 pb-3 sm:pb-4 mb-3 sm:mb-4">
                        <div className="text-center font-bold mb-2 text-xs sm:text-sm">DETAIL PEMBELIAN</div>
                        <div className="text-xs">
                          {cartItems.map((item, index) => (
                            <div key={index} className="mb-2 sm:mb-3">
                              <div className="font-medium text-xs break-words">
                                {item.name}
                                {item.width && item.height && (
                                  <span className="text-xs"> ({item.width}m x {item.height}m)</span>
                                )}
                                {item.modelCode && (
                                  <span className="text-xs"> [{item.modelCode}]</span>
                                )}
                                {item.caseVariant && (
                                  <div className="text-xs text-gray-600">
                                    Casing: {caseVariants.find(c => c.code === item.caseVariant)?.name}
                                  </div>
                                )}
                                {item.laminationVariant && (
                                  <div className="text-xs text-gray-600">
                                    Laminasi: {item.laminationVariant}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs" style={{ display: 'table', width: '100%' }}>
                                <div style={{ display: 'table-row' }}>
                                  <span style={{ display: 'table-cell', paddingRight: '8px' }}>
                                    {item.quantity} x Rp {item.appliedPrice.toLocaleString('id-ID')}
                                  </span>
                                  <span style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    Rp {(item.appliedPrice * item.quantity).toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {requestJasaDesain && (
                            <div className="mb-2 sm:mb-3">
                              <div className="font-medium text-xs">Jasa Desain</div>
                              <div className="text-xs" style={{ display: 'table', width: '100%' }}>
                                <div style={{ display: 'table-row' }}>
                                  <span style={{ display: 'table-cell', paddingRight: '8px' }}>
                                    1 x Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}
                                  </span>
                                  <span style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {isExpressPrint && (
                            <div className="mb-2 sm:mb-3">
                              <div className="font-medium text-xs">Cetak Express</div>
                              <div className="text-xs" style={{ display: 'table', width: '100%' }}>
                                <div style={{ display: 'table-row' }}>
                                  <span style={{ display: 'table-cell', paddingRight: '8px' }}>
                                    1 x Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}
                                  </span>
                                  <span style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="text-xs sm:text-sm" style={{ display: 'table', width: '100%' }}>
                        <div style={{ display: 'table-row' }}>
                          <span style={{ display: 'table-cell', paddingRight: '8px' }}>Subtotal:</span>
                          <span style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            Rp {cartItems.reduce((total, item) => total + (item.appliedPrice * item.quantity), 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                        
                        {promoDiscount > 0 && (
                          <div style={{ display: 'table-row', color: '#16a34a' }}>
                            <span style={{ display: 'table-cell', paddingRight: '8px' }}>Diskon ({promoDiscount}%):</span>
                            <span style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              -Rp {calculateTotalDiscount().toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                        
                        {requestJasaDesain && (
                          <div style={{ display: 'table-row' }}>
                            <span style={{ display: 'table-cell', paddingRight: '8px' }}>Jasa Desain:</span>
                            <span style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                        
                        {isExpressPrint && (
                          <div style={{ display: 'table-row' }}>
                            <span style={{ display: 'table-cell', paddingRight: '8px' }}>Cetak Express:</span>
                            <span style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                        
                        <div className="border-t border-dashed border-gray-400 mt-2 pt-2">
                          <div style={{ display: 'table-row', fontWeight: 'bold', fontSize: '14px' }}>
                            <span style={{ display: 'table-cell', paddingRight: '8px' }}>TOTAL:</span>
                            <span style={{ display: 'table-cell', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              Rp {(calculateTotal() + (requestJasaDesain ? JASA_DESAIN_PRICE : 0) + (isExpressPrint ? JASA_DESAIN_PRICE : 0)).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="text-center text-xs mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-dashed border-gray-400">
                        {/* Payment Status Warning */}
                        <div className="bg-yellow-100 border border-yellow-400 rounded" style={{ 
                          padding: '8px', 
                          margin: '0 0 12px 0',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: '60px'
                        }}>
                          <p className="text-xs font-bold text-yellow-800 flex items-center justify-center gap-1" style={{ margin: 0, padding: 0, lineHeight: 1.2 }}>
                            <span className="material-icons text-yellow-800" style={{fontSize: '14px'}}>description</span>
                            NOTA PERKIRAAN
                          </p>
                          <p className="text-xxs text-yellow-700" style={{ margin: 0, padding: 0, lineHeight: 1.2 }}>Silakan bayar melalui WhatsApp<br/>untuk konfirmasi pesanan</p>
                          <p className="text-xxs text-yellow-700 flex items-center justify-center gap-1" style={{ margin: 0, padding: 0, lineHeight: 1.2 }}>
                            <span className="material-icons text-yellow-700" style={{fontSize: '12px'}}>pending</span>
                            Status: MENUNGGU PEMBAYARAN
                          </p>
                        </div>
                        
                        <p>Terima kasih atas kepercayaan Anda!</p>
                        <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
                        
                        {/* Watermark disclaimer */}
                        <div className="mt-2 pt-2 border-t border-dashed border-gray-400">
                          <p className="text-xxs text-gray-500 italic">
                            Nota ini dibuat untuk kemudahan estimasi biaya.<br/>
                            Tidak dapat digunakan sebagai bukti pembayaran.
                          </p>
                        </div>
                        
                        <p className="mt-2 text-gray-600">
                          Nota ini dibuat secara otomatis pada {new Date().toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
               
               <div className="text-center mt-4">
                 <div className="flex items-center justify-center text-sm text-gray-500">
                   <Printer className="h-4 w-4 mr-2" />
                   <span>Nota akan tertutup otomatis setelah selesai dicetak</span>
                 </div>
               </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ChatBot component */}
        <ChatBot />

        {/* Flying Bubbles */}
        {flyingBubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="flying-bubble"
            style={{
              left: bubble.startX,
              top: bubble.startY,
              '--end-x': `${bubble.endX}px`,
              '--end-y': `${bubble.endY}px`,
              '--start-x': `${bubble.startX}px`,
              '--start-y': `${bubble.startY}px`,
            } as React.CSSProperties & {
              '--end-x': string;
              '--end-y': string;
              '--start-x': string;
              '--start-y': string;
            }}
          />
        ))}

        </div>

        {/* Professional Footer - Full Width */}
        <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-auto w-full">
          <div className="container mx-auto max-w-md md:max-w-full lg:max-w-7xl px-4 md:px-6 lg:px-6 py-6">
            {/* Mobile: Stacked Layout, Desktop: 3 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Column 1: Company Info */}
              <div className="text-center lg:text-left">
                <h3 className="text-lg font-bold text-[#FF5E01] mb-1">TIDURLAH GRAFIKA</h3>
                <p className="text-gray-300 text-xs italic mb-2">
                  "Cetak apa aja, Tidurlah Grafika!"
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p className="flex items-center justify-center lg:justify-start gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Perum. Korpri Raya, Blok D3. No. 3
                  </p>
                  <p>Sukarame, Bandar Lampung</p>
                </div>
              </div>

              {/* Column 2: Social Links & Contact */}
              <div className="text-center">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Hubungi Kami</h4>
                <div className="flex items-center justify-center space-x-6">
                  {/* Blog */}
                  <button
                    onClick={() => navigate('/blog')}
                    className="text-gray-400 hover:text-[#FF5E01] transition-colors duration-200"
                    title="Blog & Tips"
                  >
                    <span className="material-symbols-outlined text-2xl">language</span>
                  </button>

                  {/* WhatsApp */}
                  <a 
                    href="https://wa.me/6285172157808"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                    title="WhatsApp"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z"/>
                    </svg>
                  </a>

                  {/* Email */}
                  <a 
                    href="mailto:halo.idcardlampung@gmail.com"
                    className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Email"
                  >
                    <span className="material-symbols-outlined text-2xl">mail</span>
                  </a>

                  {/* Instagram */}
                  <a 
                    href="https://instagram.com/tidurlah_grafika"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-500 transition-colors duration-200"
                    title="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Column 3: Feedback & Suggestions */}
              <div className="text-center lg:text-right">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Sampaikan kritik dan saran anda melalui:</h4>
                <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-end">
                  {/* Survey Button */}
                  <button
                    onClick={() => navigate('/survey')}
                    className="border-2 border-white hover:bg-white hover:text-gray-800 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm flex-shrink-0">poll</span>
                    <span>Survei Kepuasan</span>
                  </button>
                  
                  {/* Google Maps Button */}
                  <a
                    href="https://maps.app.goo.gl/7639o9BW5SXjrJHHA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-white hover:bg-white hover:text-gray-800 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm flex-shrink-0">location_on</span>
                    <span>Kunjungi Toko</span>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Copyright - Centered at Bottom */}
            <div className="text-center pt-6 mt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                © 2022-{new Date().getFullYear()} TIDURLAH GRAFIKA. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
    </div>
  );
};

export default Index;
