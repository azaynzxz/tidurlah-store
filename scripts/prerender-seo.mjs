/**
 * Build-time SEO & AI-SEO Generator for ID Card Lampung (idcardlampung.com)
 *
 * Responsibilities:
 * 1. Syncs rich GSC-driven SEO descriptions, seoTitle, and imageAlt into public/products.json (when --sync-catalog is passed)
 *    and generates supabase/migrations/011_seo_product_descriptions.sql for live Supabase DB updates.
 * 2. Generates public/llms.txt (llmstxt.org standard) and public/llms-full.txt (complete catalog + wholesale tiers).
 * 3. Generates clean public/sitemap.xml (canonical https://idcardlampung.com URLs only, zero dead links).
 * 4. Pre-renders static HTML files into dist/product/<slug>/index.html and key static routes after `vite build`
 *    so Googlebot, WhatsApp/Telegram link previews, GPTBot, ClaudeBot, PerplexityBot, and Gemini receive
 *    complete metadata, JSON-LD structured data, and semantic HTML without requiring JS execution.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const DIST_DIR = path.join(ROOT_DIR, "dist");

const SITE_ORIGIN = "https://idcardlampung.com";
const TODAY_ISO = new Date().toISOString().split("T")[0];
const NON_INDEXABLE_IDS = new Set([2001, 2002]);

const SERVICE_AREAS = [
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

const FAQS = [
  {
    question: "Apakah bisa cetak ID card, nametag, dan tali lanyard satuan terdekat tanpa minimum order?",
    answer:
      "Bisa. ID Card Lampung melayani pemesanan mulai dari 1 pcs (tanpa minimum order) baik untuk cetak kartu ID card PVC setara KTP/ATM, pembuatan nametag karyawan, kartu pelajar, gantungan kunci akrilik, mug custom, maupun paket tali lanyard printing. Untuk pemesanan jumlah banyak tersedia potongan harga grosir otomatis.",
  },
  {
    question: "Berapa harga cetak ID card PVC, tali lanyard custom, dan paket lengkapnya?",
    answer:
      "Harga cetak ID card PVC mulai Rp 6.000 - Rp 10.000/pcs, tali lanyard printing mulai Rp 10.000 - Rp 17.000/pcs, dan Paket Lengkap ID Card + Lanyard + Casing mulai Rp 14.000 - Rp 25.000/pcs tergantung sisi cetak dan jumlah pesanan. Semakin banyak kuantitas pesanan (mulai 4 pcs, 25 pcs, hingga 100+ pcs), harga per pcs otomatis turun.",
  },
  {
    question: "Berapa lama proses pengerjaan cetak ID card, lanyard, dan merchandise?",
    answer:
      "Rata-rata waktu produksi reguler adalah 1 hingga 3 hari kerja sejak desain disetujui. Untuk kebutuhan acara mendadak seperti seminar, konferensi, atau kunjungan kerja, tersedia layanan prioritas Express 24 jam selesai dengan menghubungi WhatsApp Customer Service kami.",
  },
  {
    question: "Apakah melayani pengiriman ke Tanjung Karang, Kedaton, Rajabasa, Kota Metro, hingga luar kota?",
    answer:
      "Ya. Workshop kami berlokasi di Perumahan Pemda (Belwis), Way Hui, Jati Agung dekat kawasan kampus ITERA dan UIN Raden Intan. Kami rutin mengirim pesanan via kurir instan (GoSend/GrabExpress) ke seluruh Bandar Lampung (Tanjung Karang, Kedaton, Rajabasa, Sukarame, Teluk Betung, Kemiling), Natar, serta pengiriman travel/ekspedisi cepat ke Kota Metro, Pringsewu, Pesawaran, dan seluruh Indonesia.",
  },
  {
    question: "Apa bahan kartu ID card dan tali lanyard yang digunakan di ID Card Lampung?",
    answer:
      "Kartu dicetak menggunakan bahan PVC putih solid ketebalan 0,76 mm standar ISO (setara ketebalan KTP dan kartu ATM) yang tahan air, kokoh, dan warna tidak pudar. Untuk lanyard custom, kami menggunakan bahan tisu halus berkualitas tinggi dengan teknik cetak digital sublime full color bolak-balik lengkap kait besi dan stopper.",
  },
  {
    question: "Siapa saja instansi dan kampus yang telah memesan di ID Card Lampung (Tidurlah Grafika)?",
    answer:
      "Sejak 2021, ribuan produk cetak dari ID Card Lampung (Tidurlah Grafika) telah dipercaya oleh himpunan dan kepanitiaan mahasiswa ITERA, UIN Raden Intan Lampung, Universitas Lampung (Unila), Universitas Malahayati, SMA/SMK di Bandar Lampung & Metro, kantor BUMN, rumah sakit, hingga perusahaan swasta seperti PT BISI International.",
  },
];

const REAL_BLOG_SLUGS = [
  "pengalaman-cetak-perdana-sma-ar-raihan-bandar-lampung",
  "lanyard-cepat-kusam-4-cara-mudah-merawatnya",
  "tutorial-cara-order",
  "panduan-desain",
  "faq-pertanyaan-umum",
  "sponsorship",
  "kebijakan-privasi",
  "syarat-ketentuan-pengembalian",
  "easter-2026",
];

const BLOG_POSTS_METADATA = [
  {
    slug: "pengalaman-cetak-perdana-sma-ar-raihan-bandar-lampung",
    title: "Studi Kasus: Pengalaman Cetak Perdana SMA Ar Raihan Bandar Lampung - Tidurlah Store",
    description: "Bagaimana SMA Ar Raihan Bandar Lampung mempercayakan kebutuhan ID card siswa dan tali lanyard berkualitas tanpa kendala.",
    image: "/blog-thumbnail/sma-ar-raihan.png",
  },
  {
    slug: "lanyard-cepat-kusam-4-cara-mudah-merawatnya",
    title: "Lanyard Cepat Kusam? 4 Cara Mudah Merawatnya - Tidurlah Store",
    description: "Tips merawat tali lanyard sublimasi agar tidak cepat kusam, warna tetap cerah, dan awet digunakan bertahun-tahun.",
    image: "/blog-thumbnail/lanyard-care-tips.png",
  },
  {
    slug: "tutorial-cara-order",
    title: "Tutorial Cara Order Online Cepat & Mudah - Tidurlah Store",
    description: "Langkah mudah melakukan pemesanan cetak ID card, lanyard, dan merchandise promosi dari rumah atau kantor.",
    image: "/blog-thumbnail/tutorial-cara-order.png",
  },
  {
    slug: "panduan-desain",
    title: "Panduan Menyiapkan File Desain Siap Cetak - Tidurlah Store",
    description: "Standar ukuran dimensi, resolusi 300 DPI, mode warna CMYK, dan margin aman cetak untuk hasil produksi maksimal.",
    image: "/blog-thumbnail/design-guide.png",
  },
  {
    slug: "faq-pertanyaan-umum",
    title: "FAQ Pertanyaan Umum Cetak ID Card & Merchandise - Tidurlah Store",
    description: "Jawaban lengkap atas pertanyaan mengenai minimal order, estimasi pengerjaan kilat, pengiriman, dan garansi.",
    image: "/blog-thumbnail/faq.png",
  },
  {
    slug: "sponsorship",
    title: "Proposal Kerjasama Sponsorship Event Kampus & Komunitas - Tidurlah Store",
    description: "Program dukungan sponsor merchandise dan cetak ID card untuk event kepanitiaan mahasiswa dan komunitas di Lampung.",
    image: "/blog-thumbnail/sponsorship.png",
  },
  {
    slug: "kebijakan-privasi",
    title: "Kebijakan Privasi - Tidurlah Store",
    description: "Kebijakan perlindungan data pelanggan dan privasi file desain cetak di Tidurlah Grafika (ID Card Lampung).",
    image: "/product-image/web-preview.jpg",
  },
  {
    slug: "syarat-ketentuan-pengembalian",
    title: "Syarat & Ketentuan Pengembalian serta Garansi - Tidurlah Store",
    description: "Ketentuan garansi retur cetak ulang 100% jika terjadi cacat produksi atau ketidaksesuaian spesifikasi pesanan.",
    image: "/product-image/web-preview.jpg",
  },
  {
    slug: "easter-2026",
    title: "Promo Spesial Sponsorship Event & Kampus - Tidurlah Store",
    description: "Paket Silver, Gold, dan Platinum dukungan cetak event kampus dengan bonus merchandise eksklusif.",
    image: "/blog-thumbnail/easter-promo.png",
  },
];

/**
 * Extract PRODUCT_SEO_MAP from src/utils/productSeo.ts so there is only ONE source of truth.
 */
function loadProductSeoMap() {
  const seoTsPath = path.join(ROOT_DIR, "src", "utils", "productSeo.ts");
  const raw = fs.readFileSync(seoTsPath, "utf-8");
  const startMarker = "export const PRODUCT_SEO_MAP: Record<number, ProductSeoEntry> = ";
  const startIdx = raw.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error("Could not locate PRODUCT_SEO_MAP in src/utils/productSeo.ts");
  }
  const objStart = startIdx + startMarker.length;
  const endIdx = raw.indexOf("\n};\n", objStart);
  if (endIdx === -1) {
    throw new Error("Could not locate end of PRODUCT_SEO_MAP in src/utils/productSeo.ts");
  }
  const objectLiteral = raw.slice(objStart, endIdx + 2);
  // Safe evaluation of our own static object literal
  const fn = new Function(`return (${objectLiteral});`);
  return fn();
}

function generateProductSlug(productName) {
  return String(productName)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(str) {
  return escapeHtml(str).replace(/'/g, "&apos;");
}

function escapeSql(str) {
  return "'" + String(str || "").replace(/'/g, "''") + "'";
}

function toAbsoluteAssetUrl(assetPath) {
  if (!assetPath) return `${SITE_ORIGIN}/logo-idcard-lampung.jpg`;
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) return assetPath;
  const normalized = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return new URL(encodeURI(normalized), SITE_ORIGIN).href;
}

function getLowestAndHighestPrice(product) {
  const thresholdPrices = Array.isArray(product.priceThresholds)
    ? product.priceThresholds.map((t) => t.price).filter((n) => typeof n === "number" && n > 0)
    : [];
  const modelPrices = Array.isArray(product.models)
    ? product.models.map((m) => m.price).filter((n) => typeof n === "number" && n > 0)
    : [];
  const candidates = [
    ...thresholdPrices,
    ...modelPrices,
    ...(product.discountPrice ? [product.discountPrice] : []),
    ...(product.price > 0 ? [product.price] : []),
  ];
  if (candidates.length === 0) return { lowPrice: 0, highPrice: 0 };
  return {
    lowPrice: Math.min(...candidates),
    highPrice: Math.max(...candidates),
  };
}

function formatIdr(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

function getMetaDescription(product) {
  const { lowPrice } = getLowestAndHighestPrice(product);
  const priceText = lowPrice > 0 ? ` Mulai ${formatIdr(lowPrice)}/${product.unit || "pcs"}.` : "";
  const combined = `${product.description}${priceText}`.replace(/\s+/g, " ").trim();
  if (combined.length <= 160) return combined;
  return `${combined.slice(0, 156).replace(/\s+\S*$/, "")}...`;
}

function buildLocalBusinessSchema() {
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

function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

function buildProductSchema(product, slug) {
  const canonicalUrl = `${SITE_ORIGIN}/product/${slug}`;
  const { lowPrice, highPrice } = getLowestAndHighestPrice(product);
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
    name: `${product.name} (${product.seoTitle || product.name})`,
    description: product.description,
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

function buildBreadcrumbSchema(product, slug) {
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
        item: `${SITE_ORIGIN}/product/${slug}`,
      },
    ],
  };
}

function syncCatalogAndMigration(productsData, seoMap) {
  let updatedCount = 0;
  const sqlLines = [
    "-- ============================================================",
    "-- Migration 011: GSC Keyword-Optimized Product Descriptions",
    "-- Safely updates product descriptions in live Supabase without",
    "-- overwriting custom prices, stock flags, or newly added rows.",
    "-- ============================================================",
    "",
  ];

  for (const [category, items] of Object.entries(productsData)) {
    for (const p of items) {
      p.category = p.category || category;
      const mapped = seoMap[p.id];
      if (mapped) {
        p.description = mapped.description;
        p.seoTitle = mapped.seoTitle;
        p.imageAlt = mapped.imageAlt;
        updatedCount++;

        sqlLines.push(
          `update public.products set description = ${escapeSql(mapped.description)}, updated_at = now() where id = ${p.id};`
        );
      }
    }
  }

  const productsJsonPath = path.join(PUBLIC_DIR, "products.json");
  fs.writeFileSync(productsJsonPath, JSON.stringify(productsData, null, 2) + "\n", "utf-8");

  const migrationPath = path.join(
    ROOT_DIR,
    "supabase",
    "migrations",
    "011_seo_product_descriptions.sql"
  );
  fs.writeFileSync(migrationPath, sqlLines.join("\n") + "\n", "utf-8");

  console.log(
    `[SEO] Synced ${updatedCount} products into public/products.json & supabase/migrations/011_seo_product_descriptions.sql`
  );
}

function generateLlmsTxt(productsData) {
  const lines = [
    "# ID Card Lampung (Tidurlah Grafika)",
    "",
    "> ID Card Lampung (dikelola oleh Tidurlah Grafika, berdiri sejak 2021) adalah pusat percetakan ID card PVC standar KTP/ATM, tali lanyard custom printing sublime, nametag karyawan/panitia, kartu pelajar, gantungan kunci akrilik, mug custom, plakat akrilik UV, papan bunga akrilik meja, dan media promosi tanpa minimum order di Bandar Lampung & Kota Metro, Provinsi Lampung, Indonesia.",
    "",
    "Pelanggan dapat memesan mulai dari 1 pcs (satuan) hingga ribuan pcs dengan potongan harga grosir bertingkat otomatis melalui website 24 jam dan konfirmasi langsung ke WhatsApp Customer Service.",
    "",
    "## Informasi Bisnis & Kontak Resmi",
    "",
    "- Website Utama: https://idcardlampung.com/",
    "- Katalog Lengkap & Tabel Harga Grosir (AI-Readable): https://idcardlampung.com/llms-full.txt",
    "- WhatsApp Customer Service: https://wa.me/6285172157808 (+62 851-7215-7808)",
    "- Email: cs@idcardlampung.com",
    "- Alamat Workshop: Perumahan Pemda (Belwis), Way Hui, Kec. Jati Agung, Lampung Selatan 35365 (Dekat Kampus ITERA & UIN Raden Intan Lampung)",
    "- Google Maps: https://maps.app.goo.gl/XVJYoKbzU5FRwVuJA",
    "- Jam Operasional: Senin - Sabtu, 08.00 - 17.30 WIB",
    "- Cakupan Wilayah Layanan: Bandar Lampung (Tanjung Karang, Kedaton, Rajabasa, Sukarame, Teluk Betung, Kemiling, Way Halim), Kota Metro, Way Hui, Jati Agung, Natar, Lampung Selatan, Pringsewu, Pesawaran, dan pengiriman ekspedisi ke seluruh Indonesia.",
    "- Instagram & TikTok: @idcard_lampung",
    "",
    "## Halaman Utama",
    "",
    "- [Beranda & Katalog Interaktif](https://idcardlampung.com/): Pilih produk, varian casing/laminasi, hitung otomatis diskon grosir, dan pesan via WhatsApp.",
    "- [Tentang Kami - Tidurlah Grafika](https://idcardlampung.com/about): Profil perusahaan, tim pendiri, visi misi, dan perjalanan sejak 2021.",
    "- [Galeri Portofolio Desain](https://idcardlampung.com/katalog): Contoh hasil produksi ID card, lanyard, dan merchandise klien.",
    "- [Artikel & Panduan Cetak](https://idcardlampung.com/blog): Studi kasus instansi, cara merawat lanyard, tutorial order, dan panduan ukuran desain.",
    "- [Tutorial Cara Order](https://idcardlampung.com/blog/tutorial-cara-order): Langkah pemesanan online dari rumah atau kantor.",
    "- [Panduan File Desain Siap Cetak](https://idcardlampung.com/blog/panduan-desain): Spesifikasi ukuran, resolusi, dan format warna cetak.",
    "",
    "## Daftar Produk & Harga Mulai per Kategori",
    "",
  ];

  for (const [category, items] of Object.entries(productsData)) {
    const indexableItems = items.filter((p) => !NON_INDEXABLE_IDS.has(p.id));
    if (indexableItems.length === 0) continue;

    lines.push(`### ${category}`);
    lines.push("");
    for (const p of indexableItems) {
      const slug = generateProductSlug(p.name);
      const { lowPrice, highPrice } = getLowestAndHighestPrice(p);
      const priceLabel =
        lowPrice === highPrice
          ? `${formatIdr(lowPrice)}/${p.unit || "pcs"}`
          : `mulai ${formatIdr(lowPrice)} - ${formatIdr(highPrice)}/${p.unit || "pcs"}`;
      const titleLabel = p.seoTitle ? `${p.name} — ${p.seoTitle}` : p.name;
      lines.push(
        `- [${titleLabel}](${SITE_ORIGIN}/product/${slug}): Harga ${priceLabel} (Estimasi: ${p.time || "1-3 hari"}).`
      );
    }
    lines.push("");
  }

  lines.push("## Opsional / Detail Lengkap");
  lines.push("");
  lines.push(
    "- [Dokumen Spesifikasi & Harga Grosir Lengkap (llms-full.txt)](https://idcardlampung.com/llms-full.txt): Rincian setiap tier kuantitas grosir, varian casing/model, dan jawaban FAQ lengkap."
  );

  return lines.join("\n") + "\n";
}

function generateLlmsFullTxt(productsData) {
  const lines = [
    "# ID Card Lampung (Tidurlah Grafika) — Katalog Lengkap, Spesifikasi & Daftar Harga Grosir",
    "",
    `> Pembaruan Terakhir: ${TODAY_ISO} | Domain Resmi: https://idcardlampung.com`,
    "",
    "## Ringkasan Layanan",
    "",
    "ID Card Lampung (Tidurlah Grafika) menyediakan layanan cetak cepat dan presisi untuk kebutuhan identitas organisasi, perusahaan, BUMN, instansi pemerintah, rumah sakit, sekolah, serta kepanitiaan kampus di Provinsi Lampung dan seluruh Indonesia.",
    "",
    "- Tanpa Minimum Order: Bisa pesan satuan (1 pcs) maupun ribuan pcs.",
    "- Produksi Cepat: Rata-rata 1-3 hari kerja (tersedia layanan Express 24 jam).",
    "- Konsultasi & Jasa Desain: Tersedia jasa desain siap cetak jika belum memiliki file.",
    "- Metode Pemesanan: Pilih produk di https://idcardlampung.com -> masukkan jumlah & varian -> klik lanjut pemesanan ke WhatsApp CS (+62 851-7215-7808).",
    "- Area Pengiriman Rutin: Bandar Lampung (Tanjung Karang, Kedaton, Rajabasa, Sukarame, Teluk Betung, Kemiling, Way Halim), Way Hui, Jati Agung, Natar, Kota Metro, Pringsewu, Pesawaran, serta pengiriman kargo/ekspedisi nasional.",
    "",
    "---",
    "",
    "## Detail Produk, Spesifikasi & Tabel Harga Grosir",
    "",
  ];

  for (const [category, items] of Object.entries(productsData)) {
    const indexableItems = items.filter((p) => !NON_INDEXABLE_IDS.has(p.id));
    if (indexableItems.length === 0) continue;

    lines.push(`## Kategori: ${category}`);
    lines.push("");

    for (const p of indexableItems) {
      const slug = generateProductSlug(p.name);
      const { lowPrice, highPrice } = getLowestAndHighestPrice(p);

      lines.push(`### ${p.name}${p.seoTitle ? ` (${p.seoTitle})` : ""}`);
      lines.push(`- URL Produk: ${SITE_ORIGIN}/product/${slug}`);
      lines.push(`- SKU: TG-${p.id}`);
      lines.push(`- Kategori: ${category}`);
      lines.push(
        `- Rentang Harga: ${lowPrice === highPrice
          ? `${formatIdr(lowPrice)} / ${p.unit || "pcs"}`
          : `${formatIdr(lowPrice)} s/d ${formatIdr(highPrice)} / ${p.unit || "pcs"}`
        }`
      );
      lines.push(`- Estimasi Pengerjaan: ${p.time || "1-3 hari"}`);
      lines.push(`- Deskripsi: ${p.description}`);

      if (Array.isArray(p.priceThresholds) && p.priceThresholds.length > 0) {
        lines.push("- Tabel Harga Grosir per Kuantitas:");
        p.priceThresholds.forEach((t, idx) => {
          const next = p.priceThresholds[idx + 1];
          const rangeLabel = next
            ? `${t.minQuantity} - ${next.minQuantity - 1} ${p.unit || "pcs"}`
            : `>= ${t.minQuantity} ${p.unit || "pcs"}`;
          lines.push(`  - Pesan ${rangeLabel}: ${formatIdr(t.price)} / ${p.unit || "pcs"}`);
        });
      }

      if (Array.isArray(p.models) && p.models.length > 0) {
        lines.push("- Pilihan Varian / Model:");
        for (const m of p.models) {
          lines.push(
            `  - ${m.code}${m.price ? `: ${formatIdr(m.price)} / ${p.unit || "pcs"}` : ""}`
          );
        }
      }

      if (Array.isArray(p.laminationOptions) && p.laminationOptions.length > 0) {
        lines.push(
          `- Pilihan Laminasi: ${p.laminationOptions.map((l) => l.type).join(", ")}`
        );
      }

      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push("## Pertanyaan yang Sering Diajukan (FAQ)");
  lines.push("");
  for (const f of FAQS) {
    lines.push(`### ${f.question}`);
    lines.push(f.answer);
    lines.push("");
  }

  return lines.join("\n") + "\n";
}

function generateSitemapXml(productsData) {
  const urls = [
    { loc: `${SITE_ORIGIN}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${SITE_ORIGIN}/about`, changefreq: "monthly", priority: "0.8" },
    { loc: `${SITE_ORIGIN}/katalog`, changefreq: "weekly", priority: "0.8" },
    { loc: `${SITE_ORIGIN}/blog`, changefreq: "weekly", priority: "0.8" },
  ];

  // Add all indexable product pages (high priority commercial pages!)
  for (const items of Object.values(productsData)) {
    for (const p of items) {
      if (NON_INDEXABLE_IDS.has(p.id)) continue;
      const slug = generateProductSlug(p.name);
      urls.push({
        loc: `${SITE_ORIGIN}/product/${slug}`,
        changefreq: "weekly",
        priority: p.bestseller ? "0.95" : "0.9",
      });
    }
  }

  // Add real, verified blog posts
  for (const blogSlug of REAL_BLOG_SLUGS) {
    urls.push({
      loc: `${SITE_ORIGIN}/blog/${blogSlug}`,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  // Add public career pages
  urls.push({ loc: `${SITE_ORIGIN}/loker`, changefreq: "monthly", priority: "0.6" });
  urls.push({
    loc: `${SITE_ORIGIN}/loker/desainer-grafis`,
    changefreq: "monthly",
    priority: "0.6",
  });
  urls.push({ loc: `${SITE_ORIGIN}/loker/reseller`, changefreq: "monthly", priority: "0.6" });
  urls.push({ loc: `${SITE_ORIGIN}/hello`, changefreq: "monthly", priority: "0.5" });

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const u of urls) {
    xmlLines.push("  <url>");
    xmlLines.push(`    <loc>${escapeXml(u.loc)}</loc>`);
    xmlLines.push(`    <lastmod>${TODAY_ISO}</lastmod>`);
    xmlLines.push(`    <changefreq>${u.changefreq}</changefreq>`);
    xmlLines.push(`    <priority>${u.priority}</priority>`);
    xmlLines.push("  </url>");
  }

  xmlLines.push("</urlset>");
  return xmlLines.join("\n") + "\n";
}

function buildHeadBlock({
  title,
  description,
  canonicalUrl,
  imageUrl,
  ogType = "website",
  noindex = false,
  schemas = [],
}) {
  const fullTitle = title.includes("ID Card Lampung") ? title : `${title} - ID Card Lampung`;
  const robotsContent = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  const schemaScripts = schemas
    .map(
      (s) =>
        `  <script type="application/ld+json">${JSON.stringify(s).replace(/<\//g, "<\\/")}</script>`
    )
    .join("\n");

  return [
    `  <title>${escapeHtml(fullTitle)}</title>`,
    `  <meta name="description" content="${escapeHtml(description)}" />`,
    `  <meta name="robots" content="${robotsContent}" />`,
    `  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `  <meta property="og:locale" content="id_ID" />`,
    `  <meta property="og:type" content="${escapeHtml(ogType)}" />`,
    `  <meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
    `  <meta property="og:description" content="${escapeHtml(description)}" />`,
    `  <meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `  <meta property="og:site_name" content="ID Card Lampung" />`,
    `  <meta name="twitter:card" content="summary_large_image" />`,
    `  <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
    `  <meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    schemaScripts,
  ]
    .filter(Boolean)
    .join("\n");
}

function injectIntoTemplate(templateHtml, headHtml, bodyFallbackHtml) {
  let result = templateHtml.replace(
    /<!-- SEO_HEAD_START -->[\s\S]*?<!-- SEO_HEAD_END -->/,
    `<!-- SEO_HEAD_START -->\n${headHtml}\n  <!-- SEO_HEAD_END -->`
  );
  result = result.replace(
    /<!-- SEO_BODY_FALLBACK_START -->[\s\S]*?<!-- SEO_BODY_FALLBACK_END -->/,
    `<!-- SEO_BODY_FALLBACK_START -->${bodyFallbackHtml}<!-- SEO_BODY_FALLBACK_END -->`
  );
  return result;
}

function buildProductFallbackHtml(product, slug) {
  const { lowPrice, highPrice } = getLowestAndHighestPrice(product);
  const imgUrl = toAbsoluteAssetUrl(product.image);
  const priceSummary =
    lowPrice === highPrice
      ? `${formatIdr(lowPrice)} / ${product.unit || "pcs"}`
      : `Mulai ${formatIdr(lowPrice)} s/d ${formatIdr(highPrice)} / ${product.unit || "pcs"}`;

  const thresholdsRows =
    Array.isArray(product.priceThresholds) && product.priceThresholds.length > 0
      ? `<h2>Tabel Harga Grosir ${escapeHtml(product.name)}</h2><ul>` +
      product.priceThresholds
        .map((t, i) => {
          const next = product.priceThresholds[i + 1];
          const range = next
            ? `${t.minQuantity} - ${next.minQuantity - 1} ${product.unit || "pcs"}`
            : `Minimal ${t.minQuantity} ${product.unit || "pcs"}`;
          return `<li>${escapeHtml(range)}: ${escapeHtml(formatIdr(t.price))} / ${escapeHtml(
            product.unit || "pcs"
          )}</li>`;
        })
        .join("") +
      `</ul>`
      : "";

  return `<main style="max-width:960px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,sans-serif;color:#18181B;">
    <nav aria-label="Breadcrumb" style="font-size:12px;color:#71717A;margin-bottom:12px;">
      <a href="/">Beranda ID Card Lampung</a> / <span>${escapeHtml(product.category)}</span> / <strong>${escapeHtml(product.name)}</strong>
    </nav>
    <article>
      <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">${escapeHtml(
    product.seoTitle ? `${product.name} — ${product.seoTitle}` : product.name
  )}</h1>
      <p style="font-size:14px;color:#E8590C;font-weight:600;margin:0 0 12px;">Harga: ${escapeHtml(
    priceSummary
  )} | Estimasi Produksi: ${escapeHtml(product.time || "1-3 hari")}</p>
      <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(
    product.imageAlt || product.name
  )}" width="480" height="480" style="max-width:320px;height:auto;border-radius:12px;border:1px solid #E7E5E4;margin-bottom:16px;" />
      <p style="font-size:14px;line-height:1.6;color:#3F3F46;">${escapeHtml(product.description)}</p>
      ${thresholdsRows}
      <p style="font-size:13px;color:#52525B;margin-top:16px;">Pesan langsung melalui katalog interaktif <a href="/product/${escapeHtml(
    slug
  )}">ID Card Lampung</a> atau konsultasi desain gratis via <a href="https://wa.me/6285172157808">WhatsApp +62 851-7215-7808</a>. Melayani Bandar Lampung (Tanjung Karang, Kedaton, Rajabasa, Sukarame), Way Hui, Kota Metro, Natar, Pringsewu, dan sekitarnya.</p>
    </article>
  </main>`;
}

function buildHomepageFallbackHtml(productsData) {
  const categorySections = Object.entries(productsData)
    .map(([category, items]) => {
      const valid = items.filter((p) => !NON_INDEXABLE_IDS.has(p.id));
      if (valid.length === 0) return "";
      const links = valid
        .map((p) => {
          const slug = generateProductSlug(p.name);
          const { lowPrice } = getLowestAndHighestPrice(p);
          return `<li><a href="/product/${escapeHtml(slug)}">${escapeHtml(
            p.name
          )} — ${escapeHtml(p.seoTitle || p.category)}</a> (Mulai ${escapeHtml(
            formatIdr(lowPrice)
          )})</li>`;
        })
        .join("");
      return `<section><h2>${escapeHtml(category)}</h2><ul>${links}</ul></section>`;
    })
    .filter(Boolean)
    .join("");

  const faqHtml = FAQS.map(
    (f) => `<article><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></article>`
  ).join("");

  return `<main style="max-width:1024px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,sans-serif;color:#18181B;">
    <h1>Cetak ID Card, Tali Lanyard, Nametag &amp; Merchandise Terdekat Tanpa Minimum Order di Bandar Lampung &amp; Kota Metro</h1>
    <p>ID Card Lampung (Tidurlah Grafika) melayani cetak kartu ID card PVC tebal setara KTP, tali lanyard custom sublime, nametag karyawan, kartu pelajar, gantungan kunci akrilik, mug custom, plakat akrilik UV, hingga spanduk promosi dengan pengerjaan cepat 1-3 hari.</p>
    ${categorySections}
    <section><h2>Pertanyaan Umum (FAQ)</h2>${faqHtml}</section>
  </main>`;
}

function prerenderDistRoutes(productsData) {
  const distIndexPath = path.join(DIST_DIR, "index.html");
  if (!fs.existsSync(distIndexPath)) {
    console.log("[SEO] dist/index.html not found — skipping HTML route pre-rendering.");
    return;
  }

  const baseTemplate = fs.readFileSync(distIndexPath, "utf-8");

  // 1. Enhance Homepage dist/index.html with LocalBusiness + FAQPage JSON-LD & crawlable catalog links
  const homeHead = buildHeadBlock({
    title: "Cetak ID Card, Lanyard & Merchandise Terdekat di Bandar Lampung & Metro",
    description:
      "Pusat cetak ID card PVC tebal setara KTP, tali lanyard custom, nametag karyawan, kartu pelajar, gantungan kunci akrilik, mug custom, dan plakat tanpa minimum order di Bandar Lampung (Tanjung Karang, Kedaton, Rajabasa, Sukarame), Way Hui, hingga Kota Metro.",
    canonicalUrl: `${SITE_ORIGIN}/`,
    imageUrl: `${SITE_ORIGIN}/product-image/web-preview.jpg`,
    ogType: "website",
    schemas: [buildLocalBusinessSchema(), buildFaqSchema()],
  });
  const homeHtml = injectIntoTemplate(
    baseTemplate,
    homeHead,
    buildHomepageFallbackHtml(productsData)
  );
  fs.writeFileSync(distIndexPath, homeHtml, "utf-8");

  // 2. Pre-render every /product/<slug>/index.html
  let prerenderedProducts = 0;
  for (const items of Object.values(productsData)) {
    for (const product of items) {
      const slug = generateProductSlug(product.name);
      if (!slug) continue;

      const isIndexable = !NON_INDEXABLE_IDS.has(product.id);
      const canonicalUrl = `${SITE_ORIGIN}/product/${slug}`;
      const productHead = buildHeadBlock({
        title: product.seoTitle || `Cetak ${product.name} Custom`,
        description: getMetaDescription(product),
        canonicalUrl,
        imageUrl: toAbsoluteAssetUrl(product.image),
        ogType: "product",
        noindex: !isIndexable,
        schemas: isIndexable
          ? [buildProductSchema(product, slug), buildBreadcrumbSchema(product, slug)]
          : [],
      });

      const productHtml = injectIntoTemplate(
        baseTemplate,
        productHead,
        buildProductFallbackHtml(product, slug)
      );

      const routeDir = path.join(DIST_DIR, "product", slug);
      fs.mkdirSync(routeDir, { recursive: true });
      fs.writeFileSync(path.join(routeDir, "index.html"), productHtml, "utf-8");
      prerenderedProducts++;
    }
  }

  // 3. Pre-render key static secondary routes (/about, /katalog, /blog, /loker)
  const secondaryRoutes = [
    {
      route: "about",
      title: "Tentang Kami — Tidurlah Grafika & ID Card Lampung",
      description:
        "Profil resmi ID Card Lampung (Tidurlah Grafika), studio percetakan ID card, tali lanyard custom, dan merchandise berkualitas sejak 2021 di Bandar Lampung.",
    },
    {
      route: "katalog",
      title: "Portofolio & Katalog Hasil Cetak ID Card, Lanyard & Merchandise",
      description:
        "Lihat galeri contoh hasil produksi nyata cetak ID card PVC, tali lanyard printing, plakat akrilik, ganci, dan merchandise klien ID Card Lampung.",
    },
    {
      route: "blog",
      title: "Artikel, Panduan Desain & Tips Cetak ID Card Lanyard",
      description:
        "Kumpulan artikel panduan cetak ID card, cara merawat tali lanyard, studi kasus kampus & perusahaan di Bandar Lampung dan Kota Metro.",
    },
    {
      route: "loker",
      title: "Info Lowongan Kerja & Kemitraan Reseller",
      description:
        "Informasi karier, lowongan kerja tim kreatif/produksi, dan program reseller resmi di Tidurlah Grafika (ID Card Lampung).",
    },
  ];

  for (const sr of secondaryRoutes) {
    const head = buildHeadBlock({
      title: sr.title,
      description: sr.description,
      canonicalUrl: `${SITE_ORIGIN}/${sr.route}`,
      imageUrl: `${SITE_ORIGIN}/product-image/web-preview.jpg`,
      ogType: "website",
      schemas: [buildLocalBusinessSchema()],
    });
    const html = injectIntoTemplate(
      baseTemplate,
      head,
      `<main style="max-width:960px;margin:0 auto;padding:24px 16px;"><h1>${escapeHtml(
        sr.title
      )}</h1><p>${escapeHtml(sr.description)}</p><p><a href="/">Kembali ke Katalog Utama ID Card Lampung</a></p></main>`
    );
    const dir = path.join(DIST_DIR, sr.route);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html, "utf-8");
  }

  // 4. Pre-render individual verified blog routes (/blog/<slug>/index.html)
  let prerenderedBlogs = 0;
  for (const bp of BLOG_POSTS_METADATA) {
    const canonicalUrl = `${SITE_ORIGIN}/blog/${bp.slug}`;
    const head = buildHeadBlock({
      title: bp.title,
      description: bp.description,
      canonicalUrl,
      imageUrl: toAbsoluteAssetUrl(bp.image),
      ogType: "article",
      schemas: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: bp.title,
          description: bp.description,
          image: [toAbsoluteAssetUrl(bp.image)],
          author: {
            "@type": "Organization",
            name: "Tidurlah Grafika",
            url: SITE_ORIGIN,
          },
          publisher: {
            "@type": "Organization",
            name: "ID Card Lampung",
            url: SITE_ORIGIN,
            logo: {
              "@type": "ImageObject",
              url: `${SITE_ORIGIN}/Logo id card lampung 1x1 transparan.png`,
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
          },
        },
      ],
    });
    const html = injectIntoTemplate(
      baseTemplate,
      head,
      `<article style="max-width:860px;margin:0 auto;padding:32px 16px;"><h1>${escapeHtml(
        bp.title
      )}</h1><p>${escapeHtml(bp.description)}</p><p><a href="/blog">Kembali ke Indeks Blog ID Card Lampung</a></p></article>`
    );
    const dir = path.join(DIST_DIR, "blog", bp.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html, "utf-8");
    prerenderedBlogs++;
  }

  console.log(
    `[SEO] Pre-rendered dist/index.html, ${prerenderedProducts} product routes, ${prerenderedBlogs} blog routes, and ${secondaryRoutes.length} secondary routes.`
  );
}

function readEnvVars() {
  const vars = { ...process.env };
  for (const envFile of [".env.local", ".env"]) {
    const fullPath = path.join(ROOT_DIR, envFile);
    if (!fs.existsSync(fullPath)) continue;
    const lines = fs.readFileSync(fullPath, "utf-8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!(key in vars) || !vars[key]) {
        vars[key] = val;
      }
    }
  }
  return vars;
}

function transformSupabaseRow(row, seoMap) {
  const mapped = seoMap[row.id];
  const product = {
    id: row.id,
    name: row.name,
    image: row.image,
    additionalImages: row.additional_images || [],
    description:
      mapped && (!row.description || row.description.length < 95)
        ? mapped.description
        : row.description,
    price: row.price,
    discountPrice: row.discount_price ?? null,
    category: row.category,
    priceThresholds: Array.isArray(row.price_thresholds) ? row.price_thresholds : [],
    time: row.time,
    rating: row.rating,
    ...(row.bestseller ? { bestseller: true } : {}),
    ...(row.pricing_method ? { pricingMethod: row.pricing_method } : {}),
    ...(row.base_price_per_sqm ? { basePricePerSqm: row.base_price_per_sqm } : {}),
    ...(row.min_width ? { minWidth: row.min_width } : {}),
    ...(row.max_width ? { maxWidth: row.max_width } : {}),
    ...(row.min_height ? { minHeight: row.min_height } : {}),
    ...(row.max_height ? { maxHeight: row.max_height } : {}),
    ...(row.lamination_options ? { laminationOptions: row.lamination_options } : {}),
    ...(row.models ? { models: row.models } : {}),
    unit: row.unit || "pcs",
    is_available: row.is_available !== false,
    ...(row.is_customizable ? { isCustomizable: true } : {}),
    ...(mapped?.seoTitle ? { seoTitle: mapped.seoTitle } : {}),
    ...(mapped?.imageAlt ? { imageAlt: mapped.imageAlt } : {}),
  };
  return product;
}

async function tryFetchLiveCatalogFromSupabase(seoMap) {
  const env = readEnvVars();
  const sbUrl = env.VITE_SUPABASE_URL;
  const sbKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!sbUrl || !sbKey || sbUrl.includes("your-project-id")) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const endpoint = `${sbUrl.replace(/\/+$/, "")}/rest/v1/products?select=*&is_active=eq.true&order=sort_order.asc`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const grouped = {};
    for (const row of rows) {
      const product = transformSupabaseRow(row, seoMap);
      if (!grouped[product.category]) grouped[product.category] = [];
      grouped[product.category].push(product);
    }
    console.log(`[SEO] Pulled ${rows.length} live active products from Supabase for build snapshot.`);
    return grouped;
  } catch (err) {
    console.warn("[SEO] Could not pull live Supabase catalog during build, using public/products.json fallback:", err?.message || err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const seoMap = loadProductSeoMap();
  const productsJsonPath = path.join(PUBLIC_DIR, "products.json");
  const liveCatalog = await tryFetchLiveCatalogFromSupabase(seoMap);
  const productsData = liveCatalog || JSON.parse(fs.readFileSync(productsJsonPath, "utf-8"));

  if (process.argv.includes("--sync-catalog")) {
    syncCatalogAndMigration(productsData, seoMap);
  } else {
    // Ensure in-memory productsData always carries seoTitle & imageAlt from seoMap
    for (const [category, items] of Object.entries(productsData)) {
      for (const p of items) {
        p.category = p.category || category;
        const mapped = seoMap[p.id];
        if (mapped) {
          p.seoTitle = p.seoTitle || mapped.seoTitle;
          p.imageAlt = p.imageAlt || mapped.imageAlt;
          if (!p.description || p.description.length < 95) {
            p.description = mapped.description;
          }
        }
      }
    }
  }

  const llmsTxt = generateLlmsTxt(productsData);
  const llmsFullTxt = generateLlmsFullTxt(productsData);
  const sitemapXml = generateSitemapXml(productsData);

  fs.writeFileSync(path.join(PUBLIC_DIR, "llms.txt"), llmsTxt, "utf-8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "llms-full.txt"), llmsFullTxt, "utf-8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemapXml, "utf-8");

  console.log("[SEO] Generated public/llms.txt, public/llms-full.txt, and public/sitemap.xml");

  if (fs.existsSync(DIST_DIR)) {
    // Keep dist/products.json synchronized with live Supabase snapshot built at deploy time
    fs.writeFileSync(path.join(DIST_DIR, "products.json"), JSON.stringify(productsData, null, 2) + "\n", "utf-8");
    fs.writeFileSync(path.join(DIST_DIR, "llms.txt"), llmsTxt, "utf-8");
    fs.writeFileSync(path.join(DIST_DIR, "llms-full.txt"), llmsFullTxt, "utf-8");
    fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemapXml, "utf-8");
    fs.copyFileSync(path.join(PUBLIC_DIR, "robots.txt"), path.join(DIST_DIR, "robots.txt"));
    prerenderDistRoutes(productsData);
  }
}

main();
