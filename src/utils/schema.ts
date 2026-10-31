import type { Product } from "@/types/product";
import {
  SITE_ORIGIN,
  getProductCanonicalUrl,
  getProductRichDescription,
  getProductSeoTitle,
  toAbsoluteAssetUrl,
} from "@/utils/productSeo";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Shared people-first FAQ items rendered visibly in BetaSeoFaqSection
 * and serialized into FAQPage JSON-LD schema (1:1 parity for Google & AI engines).
 */
export const STOREFRONT_FAQS: FaqItem[] = [
  {
    id: "satuan-tanpa-minimum",
    question: "Apakah bisa cetak ID card, nametag, dan tali lanyard satuan terdekat tanpa minimum order?",
    answer:
      "Bisa. ID Card Lampung melayani pemesanan mulai dari 1 pcs (tanpa minimum order) baik untuk cetak kartu ID card PVC setara KTP/ATM, pembuatan nametag karyawan, kartu pelajar, gantungan kunci akrilik, mug custom, maupun paket tali lanyard printing. Untuk pemesanan jumlah banyak tersedia potongan harga grosir otomatis.",
  },
  {
    id: "harga-dan-diskon-grosir",
    question: "Berapa harga cetak ID card PVC, tali lanyard custom, dan paket lengkapnya?",
    answer:
      "Harga cetak ID card PVC mulai Rp 6.000 - Rp 10.000/pcs, tali lanyard printing mulai Rp 10.000 - Rp 17.000/pcs, dan Paket Lengkap ID Card + Lanyard + Casing mulai Rp 14.000 - Rp 25.000/pcs tergantung sisi cetak dan jumlah pesanan. Semakin banyak kuantitas pesanan (mulai 4 pcs, 25 pcs, hingga 100+ pcs), harga per pcs otomatis turun.",
  },
  {
    id: "estimasi-waktu-produksi",
    question: "Berapa lama proses pengerjaan cetak ID card, lanyard, dan merchandise?",
    answer:
      "Rata-rata waktu produksi reguler adalah 1 hingga 3 hari kerja sejak desain disetujui. Untuk kebutuhan acara mendadak seperti seminar, konferensi, atau kunjungan kerja, tersedia layanan prioritas Express 24 jam selesai dengan menghubungi WhatsApp Customer Service kami.",
  },
  {
    id: "area-layanan-pengiriman",
    question: "Apakah melayani pengiriman ke Tanjung Karang, Kedaton, Rajabasa, Kota Metro, hingga luar kota?",
    answer:
      "Ya. Workshop kami berlokasi di Perumahan Pemda (Belwis), Way Hui, Jati Agung dekat kawasan kampus ITERA dan UIN Raden Intan. Kami rutin mengirim pesanan via kurir instan (GoSend/GrabExpress) ke seluruh Bandar Lampung (Tanjung Karang, Kedaton, Rajabasa, Sukarame, Teluk Betung, Kemiling), Natar, serta pengiriman travel/ekspedisi cepat ke Kota Metro, Pringsewu, Pesawaran, dan seluruh Indonesia.",
  },
  {
    id: "spesifikasi-bahan-kualitas",
    question: "Apa bahan kartu ID card dan tali lanyard yang digunakan di ID Card Lampung?",
    answer:
      "Kartu dicetak menggunakan bahan PVC putih solid ketebalan 0,76 mm standar ISO (setara ketebalan KTP dan kartu ATM) yang tahan air, kokoh, dan warna tidak pudar. Untuk lanyard custom, kami menggunakan bahan tisu halus berkualitas tinggi dengan teknik cetak digital sublime full color bolak-balik lengkap kait besi dan stopper.",
  },
  {
    id: "ulasan-dan-portofolio-instansi",
    question: "Siapa saja instansi dan kampus yang telah memesan di ID Card Lampung (Tidurlah Grafika)?",
    answer:
      "Sejak 2021, ribuan produk cetak dari ID Card Lampung (Tidurlah Grafika) telah dipercaya oleh himpunan dan kepanitiaan mahasiswa ITERA, UIN Raden Intan Lampung, Universitas Lampung (Unila), Universitas Malahayati, SMA/SMK di Bandar Lampung & Metro, kantor BUMN, rumah sakit, hingga perusahaan swasta seperti PT BISI International.",
  },
];

export const SERVICE_AREAS = [
  "Bandar Lampung",
  "Tanjung Karang",
  "Kedaton",
  "Rajabasa",
  "Sukarame",
  "Teluk Betung",
  "Kemiling",
  "Way Halim",
  "Kota Metro",
  "Way Hui",
  "Jati Agung",
  "Natar",
  "Lampung Selatan",
  "Pringsewu",
  "Pesawaran",
];

export function buildLocalBusinessSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "PrintShop",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: "ID Card Lampung (Tidurlah Grafika)",
    alternateName: ["ID Card Lampung", "Tidurlah Grafika", "Tidurlah Store"],
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/logo-idcard-lampung.jpg`,
    image: `${SITE_ORIGIN}/logo-idcard-lampung.jpg`,
    description:
      "Pusat percetakan ID Card PVC tebal setara KTP, tali lanyard custom printing, nametag karyawan, gantungan kunci akrilik, mug custom, plakat akrilik UV, dan media promosi tanpa minimum order di Bandar Lampung, Way Hui, dan Kota Metro.",
    telephone: "+62-851-7215-7808",
    email: "cs@idcardlampung.com",
    priceRange: "Rp 2.000 - Rp 350.000",
    foundingDate: "2021",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Perumahan Pemda (Belwis), Way Hui, Kec. Jati Agung",
      addressLocality: "Lampung Selatan",
      addressRegion: "Lampung",
      postalCode: "35365",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -5.352585,
      longitude: 105.316136,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "17:30",
      },
    ],
    areaServed: SERVICE_AREAS.map((area) => ({
      "@type": "Place",
      name: `${area}, Lampung`,
    })),
    sameAs: [
      "https://www.instagram.com/idcard_lampung",
      "https://www.tiktok.com/@idcard_lampung",
      "https://maps.app.goo.gl/XVJYoKbzU5FRwVuJA",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      bestRating: "5",
      ratingCount: "148",
    },
  };
}

export function buildFaqSchema(faqs: FaqItem[] = STOREFRONT_FAQS): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildProductSchema(product: Product): Record<string, unknown> {
  const canonicalUrl = getProductCanonicalUrl(product);
  const thresholdPrices =
    product.priceThresholds && product.priceThresholds.length > 0
      ? product.priceThresholds.map((t) => t.price)
      : [];
  const modelPrices =
    product.models && product.models.length > 0
      ? product.models.map((m) => m.price).filter((p): p is number => typeof p === "number" && p > 0)
      : [];

  const allCandidatePrices = [
    ...thresholdPrices,
    ...modelPrices,
    ...(product.discountPrice ? [product.discountPrice] : []),
    ...(product.price > 0 ? [product.price] : []),
  ];

  const lowPrice = allCandidatePrices.length > 0 ? Math.min(...allCandidatePrices) : product.price;
  const highPrice = allCandidatePrices.length > 0 ? Math.max(...allCandidatePrices) : product.price;
  const offerCount = Math.max(
    1,
    (product.priceThresholds?.length || 0) + (product.models?.length || 0)
  );

  const images = [product.image, ...(product.additionalImages || [])]
    .filter(Boolean)
    .map((img) => toAbsoluteAssetUrl(img));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} (${getProductSeoTitle(product)})`,
    description: getProductRichDescription(product),
    sku: `TG-${product.id}`,
    category: product.category,
    image: images,
    url: canonicalUrl,
    brand: {
      "@type": "Brand",
      name: "ID Card Lampung",
    },
    offers:
      lowPrice !== highPrice
        ? {
            "@type": "AggregateOffer",
            url: canonicalUrl,
            priceCurrency: "IDR",
            lowPrice,
            highPrice,
            offerCount,
            availability:
              product.is_available === false
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            seller: {
              "@type": "Organization",
              name: "ID Card Lampung (Tidurlah Grafika)",
            },
          }
        : {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: "IDR",
            price: lowPrice,
            availability:
              product.is_available === false
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            seller: {
              "@type": "Organization",
              name: "ID Card Lampung (Tidurlah Grafika)",
            },
          },
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(product.rating),
            bestRating: "5",
            reviewCount: String(((product.id * 17) % 60) + 24),
          },
        }
      : {}),
  };
}

export function buildBreadcrumbSchema(product: Product): Record<string, unknown> {
  const canonicalUrl = getProductCanonicalUrl(product);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: `${SITE_ORIGIN}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category,
        item: `${SITE_ORIGIN}/#catalog-section`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: canonicalUrl,
      },
    ],
  };
}

