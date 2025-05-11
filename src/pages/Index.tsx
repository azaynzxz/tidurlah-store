import { useState, useEffect } from "react";
import { ShoppingCart, ShoppingBag, Check, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BannerCarousel from "@/components/BannerCarousel";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";

// Valid promo codes with their discount percentage
const validPromoCodes = {
  "DISCOUNT10": 10,
  "SAVE15": 15,
  "PROMO20": 20,
  "KKN15": 15
};

// Product Data with Price Thresholds
const products = {
  "ID Card & Lanyard": [
    {
      id: 1,
      name: "ID Card 1S",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Standard ID card single side print with premium materials.",
      price: 25000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 25000 },
        { minQuantity: 4, price: 20000 },
        { minQuantity: 35, price: 18000 },
        { minQuantity: 100, price: 17000 }
      ],
      time: "1-2 days",
      rating: 4.7
    },
    {
      id: 2,
      name: "ID Card 2S",
      image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Double sided ID card print with premium materials.",
      price: 35000,
      discountPrice: 30000,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 30000 },
        { minQuantity: 5, price: 28000 },
        { minQuantity: 25, price: 26000 },
        { minQuantity: 100, price: 25000 }
      ],
      time: "2-3 days",
      rating: 4.8
    },
    {
      id: 3,
      name: "IDC Tali & Case Kulit",
      image: "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Premium ID card with leather case and lanyard.",
      price: 40000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 40000 },
        { minQuantity: 10, price: 37000 },
        { minQuantity: 50, price: 35000 },
        { minQuantity: 150, price: 32000 }
      ],
      time: "3-5 days",
      rating: 4.9
    },
    {
      id: 4,
      name: "Lanyard Saja 1S",
      image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Single sided printed lanyard without ID card or case.",
      price: 15000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 15000 },
        { minQuantity: 10, price: 13000 },
        { minQuantity: 50, price: 12000 },
        { minQuantity: 100, price: 10000 }
      ],
      time: "1-2 days",
      rating: 4.6
    },
    {
      id: 5,
      name: "Lanyard Saja 2S",
      image: "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Double sided printed lanyard without ID card or case.",
      price: 18000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 18000 },
        { minQuantity: 10, price: 16000 },
        { minQuantity: 50, price: 15000 },
        { minQuantity: 100, price: 13000 }
      ],
      time: "1-2 days",
      rating: 4.7
    },
    {
      id: 6,
      name: "IDC Tali Biasa",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Standard ID card with basic lanyard.",
      price: 22000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 22000 },
        { minQuantity: 10, price: 20000 },
        { minQuantity: 50, price: 18000 },
        { minQuantity: 100, price: 16000 }
      ],
      time: "1-2 days",
      rating: 4.5
    },
    {
      id: 7,
      name: "Paket IDC LYD 1S",
      image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Complete package with single sided ID card and matching lanyard.",
      price: 30000,
      discountPrice: 28000,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 28000 },
        { minQuantity: 10, price: 26000 },
        { minQuantity: 50, price: 24000 },
        { minQuantity: 100, price: 22000 }
      ],
      time: "2-3 days",
      rating: 4.8
    },
    {
      id: 8,
      name: "Paket IDC LYD 2S",
      image: "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Complete package with double sided ID card and matching lanyard.",
      price: 35000,
      discountPrice: 32000,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 32000 },
        { minQuantity: 10, price: 30000 },
        { minQuantity: 50, price: 28000 },
        { minQuantity: 100, price: 26000 }
      ],
      time: "2-3 days",
      rating: 4.9
    },
    {
      id: 9,
      name: "Paket IDC LYD Kulit",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Premium package with ID card, leather case, and matching lanyard.",
      price: 45000,
      discountPrice: 42000,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 42000 },
        { minQuantity: 10, price: 40000 },
        { minQuantity: 50, price: 38000 },
        { minQuantity: 100, price: 35000 }
      ],
      time: "3-4 days",
      rating: 5.0
    },
    {
      id: 10,
      name: "Paket IDC LYD Premium",
      image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Deluxe package with double sided ID card, premium case, and custom printed lanyard.",
      price: 50000,
      discountPrice: 45000,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 45000 },
        { minQuantity: 10, price: 42000 },
        { minQuantity: 50, price: 40000 },
        { minQuantity: 100, price: 38000 }
      ],
      time: "3-5 days",
      rating: 4.9
    }
  ],
  "Media Promosi": [
    {
      id: 11,
      name: "Banner",
      image: "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Custom printed banner for events and promotions.",
      price: 250000,
      discountPrice: 220000,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 220000 },
        { minQuantity: 2, price: 200000 },
        { minQuantity: 5, price: 180000 },
        { minQuantity: 10, price: 170000 }
      ],
      time: "3-5 days",
      rating: 4.8
    },
    {
      id: 12,
      name: "X Banner (60x160)",
      image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "X-shaped banner stand with 60x160cm custom printed banner.",
      price: 180000,
      discountPrice: 150000,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 150000 },
        { minQuantity: 3, price: 140000 },
        { minQuantity: 5, price: 130000 },
        { minQuantity: 10, price: 120000 }
      ],
      time: "2-3 days",
      rating: 4.6
    },
    {
      id: 13,
      name: "Roll Banner",
      image: "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Portable roll-up banner with stand, perfect for events and trade shows.",
      price: 200000,
      discountPrice: 180000,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 180000 },
        { minQuantity: 3, price: 170000 },
        { minQuantity: 5, price: 160000 },
        { minQuantity: 10, price: 150000 }
      ],
      time: "3-4 days",
      rating: 4.8
    },
    {
      id: 14,
      name: "Poster A3",
      image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "A3 size posters printed on high-quality paper.",
      price: 25000,
      discountPrice: null,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 25000 },
        { minQuantity: 10, price: 22000 },
        { minQuantity: 25, price: 20000 },
        { minQuantity: 50, price: 18000 }
      ],
      time: "1-2 days",
      rating: 4.7
    }
  ],
  "Merchandise": [
    {
      id: 15,
      name: "Cutting Stiker Kontur",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Custom cut vinyl stickers with your design.",
      price: 15000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 15000 },
        { minQuantity: 10, price: 12000 },
        { minQuantity: 50, price: 10000 },
        { minQuantity: 100, price: 8000 }
      ],
      time: "1-2 days",
      rating: 4.6
    },
    {
      id: 16,
      name: "Ganci Akrilik",
      image: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Custom printed acrylic badges with your design.",
      price: 10000,
      discountPrice: 8000,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 8000 },
        { minQuantity: 10, price: 7000 },
        { minQuantity: 50, price: 6000 },
        { minQuantity: 100, price: 5000 }
      ],
      time: "1-2 days",
      rating: 4.5
    },
    {
      id: 17,
      name: "Ganci 5 cm",
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "5cm diameter custom printed badges.",
      price: 12000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 12000 },
        { minQuantity: 10, price: 10000 },
        { minQuantity: 50, price: 9000 },
        { minQuantity: 100, price: 8000 }
      ],
      time: "1-2 days",
      rating: 4.7
    },
    {
      id: 18,
      name: "Ganci 3 cm",
      image: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "3cm diameter custom printed badges.",
      price: 8000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 8000 },
        { minQuantity: 10, price: 7000 },
        { minQuantity: 50, price: 6000 },
        { minQuantity: 100, price: 5000 }
      ],
      time: "1 day",
      rating: 4.6
    },
    {
      id: 19,
      name: "Ganci Tali",
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Custom printed badges with string attachment.",
      price: 15000,
      discountPrice: null,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 15000 },
        { minQuantity: 10, price: 13000 },
        { minQuantity: 50, price: 12000 },
        { minQuantity: 100, price: 10000 }
      ],
      time: "1-2 days",
      rating: 4.8
    },
    {
      id: 20,
      name: "Mug Custom",
      image: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Ceramic mug with printed design, microwave and dishwasher safe.",
      price: 45000,
      discountPrice: 40000,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 40000 },
        { minQuantity: 5, price: 38000 },
        { minQuantity: 20, price: 35000 },
        { minQuantity: 50, price: 32000 }
      ],
      time: "3-5 days",
      rating: 4.8
    },
    {
      id: 21,
      name: "Tumbler Custom",
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Custom printed travel tumbler with lid, perfect for hot and cold beverages.",
      price: 70000,
      discountPrice: 65000,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 65000 },
        { minQuantity: 5, price: 60000 },
        { minQuantity: 20, price: 55000 },
        { minQuantity: 50, price: 50000 }
      ],
      time: "3-5 days",
      rating: 4.9
    },
    {
      id: 22,
      name: "Plakat Akrilik Reg",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Regular size acrylic award plaque with custom design and text.",
      price: 150000,
      discountPrice: 135000,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 135000 },
        { minQuantity: 3, price: 125000 },
        { minQuantity: 10, price: 115000 },
        { minQuantity: 25, price: 110000 }
      ],
      time: "4-7 days",
      rating: 4.9
    },
    {
      id: 23,
      name: "Sablon Kaos",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Custom screen printed t-shirts with your design.",
      price: 80000,
      discountPrice: 75000,
      category: "Merchandise",
      priceThresholds: [
        { minQuantity: 1, price: 75000 },
        { minQuantity: 10, price: 70000 },
        { minQuantity: 25, price: 65000 },
        { minQuantity: 50, price: 60000 }
      ],
      time: "5-7 days",
      rating: 4.7
    }
  ],
  "Jasa Desain": [
    {
      id: 24,
      name: "Jasa Desain",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Professional graphic design services for all your needs.",
      price: 200000,
      discountPrice: null,
      category: "Jasa Desain",
      priceThresholds: [
        { minQuantity: 1, price: 200000 },
        { minQuantity: 3, price: 180000 },
        { minQuantity: 5, price: 150000 },
        { minQuantity: 10, price: 120000 }
      ],
      time: "3-7 days",
      rating: 4.9
    }
  ],
};

const Index = () => {
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
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [instansi, setInstansi] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isShipping, setIsShipping] = useState(false);
  const [address, setAddress] = useState("");

  // Add this state for loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate invoice number when component mounts
  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    setInvoiceNumber(`INV-${year}${month}${day}-${random}`);
  }, []);

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
    
    if (validPromoCodes[code as keyof typeof validPromoCodes]) {
      setPromoDiscount(validPromoCodes[code as keyof typeof validPromoCodes]);
      toast.success(`Promo code ${code} applied! ${validPromoCodes[code as keyof typeof validPromoCodes]}% discount`);
    } else if (code) {
      setPromoDiscount(0);
      setPromoCodeError("Invalid promo code");
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
  const addToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      const newPrice = getApplicablePrice(product, newQuantity);
      
      setCartItems(
        cartItems.map(item =>
          item.id === product.id 
            ? { 
                ...item, 
                quantity: newQuantity, 
                appliedPrice: newPrice,
                savings: calculateSavings(product, newQuantity)
              } 
            : item
        )
      );
    } else {
      const newItem = { 
        ...product, 
        quantity: 1, 
        appliedPrice: getApplicablePrice(product, 1),
        savings: calculateSavings(product, 1)
      };
      setCartItems([...cartItems, newItem]);
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
    } else {
      setCartItems(cartItems.filter(item => item.id !== id));
    }
  };

  // Delete item completely from cart
  const deleteFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Calculate total price with promo discount
  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.appliedPrice * item.quantity);
    }, 0);
    
    return promoDiscount > 0 
      ? subtotal * (1 - promoDiscount / 100) 
      : subtotal;
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
      
      // Format order details to only include name and quantity
      const simplifiedOrderDetails = orderData.cartItems.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.appliedPrice
      }));
      
      // Add all order data to formData
      formData.append('InvoiceNumber', orderData.invoiceNumber);
      formData.append('CustomerName', orderData.customerName);
      formData.append('Instansi', orderData.instansi || '');
      formData.append('PhoneNumber', orderData.phoneNumber);
      formData.append('OrderDetails', JSON.stringify(simplifiedOrderDetails));
      formData.append('Subtotal', orderData.subtotal.toString());
      formData.append('PromoCode', orderData.promoCode || '');
      formData.append('PromoDiscount', orderData.promoDiscount.toString());
      formData.append('Total', orderData.total.toString());
      formData.append('ShippingInfo', orderData.isShipping.toString());
      formData.append('Address', orderData.address || '');

      const response = await fetch('https://script.google.com/macros/s/AKfycbw7Ht5Ax693Wt99YC-kBQXYmzohctNRUQzuH_rLWvfySR9lM3QkBo_7emeL7T8Erkpy/exec', {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });

      return { success: true };
    } catch (error) {
      console.error('Error submitting to Google Sheet:', error);
      throw error;
    }
  };

  // WhatsApp redirection function
  const handleWhatsAppRedirect = async () => {
    if (!customerName || !phoneNumber) {
      toast.error("Mohon isi nama dan nomor telepon kamu.");
      return;
    }

    if (isShipping && !address) {
      toast.error("Mohon isi alamat pengiriman kamu.");
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
        cartItems,
        subtotal: cartItems.reduce((total, item) => total + (item.appliedPrice * item.quantity), 0),
        promoCode,
        promoDiscount,
        total: calculateTotal(),
        isShipping,
        address
      };

      // Save to Google Sheet
      await submitToGoogleSheet(orderData);

      // Prepare WhatsApp message (do this before showing success dialog)
      const productList = cartItems.map(item => 
        `- ${item.name} (${item.quantity}×) — Rp ${item.appliedPrice.toLocaleString('id-ID')}`
      ).join('\n');

      const totalSavings = calculateTotalSavings();
      const savingsMessage = totalSavings > 0 ? 
        `\nKamu hemat: Rp ${totalSavings.toLocaleString('id-ID')}` : '';
        
      const promoMessage = promoDiscount > 0 ?
        `\nKode Promo: ${promoCode} (${promoDiscount}% discount)` : '';

      const message = `Informasi Order:
Nama: ${customerName}
Instansi/Alias: ${instansi || '-'}
Telp: ${phoneNumber}${promoMessage}
${isShipping ? `Alamat: ${address}` : 'Ambil di tempat: Ya (tidak perlu dikirim)'}

Detail Order:
${productList}

Total: Rp ${calculateTotal().toLocaleString('id-ID')}${savingsMessage}`;

      const whatsappUrl = `https://wa.me/6285172157808?text=${encodeURIComponent(message)}`;
      
      // Store the WhatsApp URL in state
      setWhatsAppUrl(whatsappUrl);
      
      // Show success dialog with button instead of auto-redirect
      setShowOrderSuccess(true);
      setIsSubmitting(false);
      
    } catch (error) {
      setIsSubmitting(false);
      toast.error("Gagal menyimpan data pesanan. Silakan coba lagi.");
      console.error(error);
    }
  };

  const [whatsAppUrl, setWhatsAppUrl] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md bg-white min-h-screen px-4">
        {/* Header */}
        <div className="bg-white shadow-sm p-3 flex justify-between items-center sticky top-0 z-10">
          <img 
            src="https://zkreatif.wordpress.com/wp-content/uploads/2025/05/logo-tidurlah-grafika-horizontal.png"
            alt="TIDURLAH STORE"
            className="h-8 object-contain"
          />
          <button 
            className="relative p-2"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="h-6 w-6 text-[#FF5E01]" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {!showOrderForm ? (
          /* Product Listing */
          <div className="p-3">
            {/* Search Bar above banner */}
            <SearchBar onSearch={handleSearch} />
            
            {/* Banner Carousel */}
            <BannerCarousel />
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="relative">
                <div className="overflow-x-auto scrollbar-hide">
                  <TabsList className="w-max mb-3 bg-gray-100">
                    {Object.keys(filteredProducts).map(category => (
                      <TabsTrigger 
                        key={category}
                        value={category} 
                        className="flex-1 data-[state=active]:bg-[#FF5E01] data-[state=active]:text-white whitespace-nowrap"
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              {Object.keys(filteredProducts).map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts[category].map((product: any) => (
                      <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
                        <div 
                          className="relative cursor-pointer"
                          onClick={() => openProductDetails(product)}
                        >
                          <div className="relative pt-[100%]">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-tl-md">
                            Lihat detail
                          </div>
                        </div>
                        <div className="p-2 flex flex-col flex-grow">
                          <h3 className="font-medium text-xs line-clamp-2">{product.name}</h3>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="mt-1 w-full bg-[#FF5E01] text-white rounded-full py-1 px-2 text-xs flex items-center justify-center"
                          >
                            <ShoppingBag className="h-3 w-3 mr-1" /> Masukkan Keranjang
                          </button>
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
          <div className="p-3">
            <button
              onClick={() => setShowOrderForm(false)}
              className="mb-3 text-[#FF5E01] flex items-center"
            >
              ← Kembali ke Produk
            </button>
            
            <h2 className="text-lg font-bold mb-3">Informasi Pesanan</h2>
            <p className="text-sm text-gray-600 mb-3">No. Invoice: {invoiceNumber}</p>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama Kamu"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instansi/Alias</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={instansi}
                  onChange={(e) => setInstansi(e.target.value)}
                  placeholder="Instansi atau Alias Kamu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nomor Telepon Kamu"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shippingOption"
                  checked={isShipping}
                  onChange={() => setIsShipping(!isShipping)}
                  className="mr-2"
                />
                <label htmlFor="shippingOption" className="text-sm">Perlu pengiriman? (Jika tidak dicentang, ambil di tempat)</label>
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
            
            <div className="border-t border-b py-3 my-3">
              <h3 className="font-medium mb-2 text-sm">Ringkasan Pesanan</h3>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm mb-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
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
                    <p>- Rp {(cartItems.reduce((total, item) => total + (item.appliedPrice * item.quantity), 0) * (promoDiscount / 100)).toLocaleString('id-ID')}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center font-medium mt-2">
                  <p>Total</p>
                  <p>Rp {calculateTotal().toLocaleString('id-ID')}</p>
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
                disabled={isSubmitting}
                className={`w-full bg-[#FF5E01] text-white rounded-lg py-3 font-medium shadow-md text-base ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
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
        )}

        {/* Cart Modal */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] mx-auto rounded-lg overflow-hidden max-h-[90vh] p-0">
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
                      <p>- Rp {(cartItems.reduce((total, item) => total + (item.appliedPrice * item.quantity), 0) * (promoDiscount / 100)).toLocaleString('id-ID')}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center font-medium mt-2">
                    <p>Total</p>
                    <p>Rp {calculateTotal().toLocaleString('id-ID')}</p>
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
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] mx-auto rounded-lg max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedProduct.name}</DialogTitle>
                </DialogHeader>
                <div className="relative">
                  <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "75%" }}>
                    <img
                      src={[selectedProduct.image, ...selectedProduct.additionalImages][currentImageIndex]}
                      alt={selectedProduct.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    {selectedProduct.additionalImages.length > 0 && (
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
                  <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {[selectedProduct.image, ...selectedProduct.additionalImages].map((image, index) => (
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
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                  
                  {selectedProduct.priceThresholds && (
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
                  
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-[#FF5E01] text-white rounded-lg py-2 font-medium"
                  >
                    Masukkan Keranjang
                  </button>
                </div>
              </>
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
                  <h3 className="text-lg font-medium mb-2">Pesanan Terkirim!</h3>
                  <p className="text-gray-600 mb-4">Silakan klik tombol di bawah untuk melanjutkan pemesanan via WhatsApp</p>
                  
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
      </div>
    </div>
  );
};

export default Index;
