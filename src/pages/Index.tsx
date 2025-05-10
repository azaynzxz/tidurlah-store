import { useState, useEffect } from "react";
import { ShoppingCart, ShoppingBag, Check, Trash2 } from "lucide-react";
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

  // Handle WhatsApp redirect
  const handleWhatsAppRedirect = () => {
    if (!customerName || !phoneNumber) {
      toast.error("Please fill in your name and phone number.");
      return;
    }

    if (isShipping && !address) {
      toast.error("Please provide your delivery address.");
      return;
    }

    setShowOrderSuccess(true);

    setTimeout(() => {
      const productList = cartItems.map(item => 
        `${item.name} (${item.quantity}x) - Rp ${item.appliedPrice.toLocaleString('id-ID')}`
      ).join('\n');

      const totalSavings = calculateTotalSavings();
      const savingsMessage = totalSavings > 0 ? 
        `\n*You saved: Rp ${totalSavings.toLocaleString('id-ID')}*` : '';
        
      const promoMessage = promoDiscount > 0 ?
        `\n*Promo discount: ${promoDiscount}%*` : '';

      const message = `
*Invoice: ${invoiceNumber}*
*Order Details*
Name: ${customerName}
Institution: ${instansi}
Phone: ${phoneNumber}
${promoCode ? `Promo Code: ${promoCode}${promoMessage}` : ''}
${isShipping ? `Shipping Address: ${address}` : 'Pickup: Yes (No shipping required)'}

*Products:*
${productList}

*Total: Rp ${calculateTotal().toLocaleString('id-ID')}*${savingsMessage}
      `;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/6283143790990?text=${encodedMessage}`, '_blank');
      setShowOrderSuccess(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm p-3 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-lg font-bold">Shopping Cart</h1>
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
              <TabsList className="w-full mb-3 bg-gray-100">
                {Object.keys(filteredProducts).map(category => (
                  <TabsTrigger 
                    key={category}
                    value={category} 
                    className="flex-1 data-[state=active]:bg-[#FF5E01] data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

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
                            View details
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
                                  +{product.priceThresholds.length - 2} more
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
                                  Anda hemat Rp {(product.price - product.discountPrice).toLocaleString('id-ID')}
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
                            <ShoppingBag className="h-3 w-3 mr-1" /> Add to cart
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
                  Next
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
              ← Back to Products
            </button>
            
            <h2 className="text-lg font-bold mb-3">Order Information</h2>
            <p className="text-sm text-gray-600 mb-3">Invoice: {invoiceNumber}</p>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution/Alias</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={instansi}
                  onChange={(e) => setInstansi(e.target.value)}
                  placeholder="Your Institution or Alias"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Your Phone Number"
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
                <label htmlFor="shippingOption" className="text-sm">Need shipping? (If unchecked, pickup only)</label>
              </div>
              
              {isShipping && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 p-2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete shipping address"
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="border-t border-b py-3 my-3">
              <h3 className="font-medium mb-2 text-sm">Order Summary</h3>
              {cartItems
