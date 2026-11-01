import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Award,
  Palette,
  Zap,
  Monitor,
  Star,
  ArrowUpRight,
  ShieldCheck,
  Building2,
} from "lucide-react";
import SEO from "@/components/common/SEO";
import PublicHeader from "@/components/common/PublicHeader";
import { BetaFooter } from "@/components/beta/BetaFooter";
import { BlogSpecTable, BlogCallout, BlogSpecItem } from "@/components/blog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import companyData from "@/data/companyProfile.json";
import { getInitialCatalogSync, loadCatalogWithSWR } from "@/services/products";
import { generateProductSlug } from "@/utils/product";
import { SITE_ORIGIN } from "@/utils/productSeo";
import type { Product } from "@/types/product";

interface ProductItem {
  id: number;
  name: string;
  image: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  rating?: number;
  bestseller?: boolean;
}

function extractFeaturedProducts(catalog: Record<string, Product[]> | null): ProductItem[] {
  if (!catalog || typeof catalog !== "object") return [];
  const allItems: ProductItem[] = [];
  Object.keys(catalog).forEach((cat) => {
    const arr = Array.isArray(catalog[cat]) ? catalog[cat] : [];
    arr.forEach((p) => {
      allItems.push({ ...p, category: p.category || cat });
    });
  });
  const topFeatured = allItems.filter((p) => p.bestseller || (p.rating && p.rating >= 4.7)).slice(0, 8);
  return topFeatured.length > 0 ? topFeatured : allItems.slice(0, 8);
}

export default function About() {
  const { companyProfile: about } = companyData;
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>(() =>
    extractFeaturedProducts(getInitialCatalogSync())
  );

  useEffect(() => {
    const cancel = loadCatalogWithSWR((freshCatalog) => {
      setFeaturedProducts(extractFeaturedProducts(freshCatalog));
    });
    return cancel;
  }, []);

  const studioSpecs: BlogSpecItem[] = [
    {
      property: "Tahun Berdiri",
      specification: "2021 di Bandar Lampung",
      note: "Pionir layanan cetak ID Card & merchandise tanpa minimal order"
    },
    {
      property: "Spesialisasi Produksi",
      specification: "ID Card PVC Solid, Lanyard Sublimasi, Plakat & Merchandise",
      note: "Menggunakan bahan PVC standar ATM ISO 7810 dan mesin sublimasi industri"
    },
    {
      property: "Cakupan Distribusi",
      specification: "Bandar Lampung, Kota Metro, dan Seluruh Indonesia",
      note: "Layanan pickup workshop atau pengiriman kilat via JNE, J&T, SiCepat"
    },
    {
      property: "Jaminan Kualitas",
      specification: "Garansi Cetak Ulang 100% Bebas Biaya",
      note: "Perlindungan penuh bagi pelanggan jika terjadi cacat produksi atau salah cetak"
    }
  ];

  const valueItems = [
    {
      title: "Kualitas Standar Industri",
      description: "Kartu PVC tebal 0.8 mm setara kartu perbankan kedap air dan tali polyester tissue sublimasi anti-luntur.",
      icon: Award
    },
    {
      title: "Solusi Desain Estetik",
      description: "Dukungan tim desainer in-house untuk memastikan layout, margin potong, dan ketajaman logo siap cetak.",
      icon: Palette
    },
    {
      title: "Pengerjaan Cepat & Tepat",
      description: "Estimasi produksi 1–3 hari kerja dengan opsi Layanan Kilat (Express) untuk kebutuhan acara mendesak.",
      icon: Zap
    },
    {
      title: "Pemesanan Mandiri 24/7",
      description: "Katalog online terintegrasi dengan perhitungan diskon grosir otomatis dan verifikasi berkas via WhatsApp.",
      icon: Monitor
    }
  ];

  const pageUrl = `${SITE_ORIGIN}/about`;
  const jsonLdLocalBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Tidurlah Grafika - ID Card Lampung",
    description: about.seo.description,
    url: pageUrl,
    telephone: "+6285172157808",
    priceRange: "IDR 5000 - 350000",
    address: {
      "@type": "PostalAddress",
      streetAddress: about.the_setting.address,
      addressLocality: "Lampung Selatan",
      addressRegion: "Lampung",
      postalCode: "35365",
      addressCountry: "ID"
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      <SEO
        title="Tentang Kami - Profil Studio Percetakan & Merchandise"
        description={about.seo.description}
        keywords={about.seo.keywords}
        url={pageUrl}
        jsonLd={jsonLdLocalBusiness}
      />

      {/* Shared Clean Navigation Header */}
      <PublicHeader sectionName="Tentang" sectionHref="/about" />

      {/* Main Editorial Body */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full space-y-12 sm:space-y-16">
        
        {/* Editorial Hero Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono font-medium">
              Profil Perusahaan
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-mono">Bandar Lampung, Indonesia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Tentang Tidurlah Grafika
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
            Pusat cetak kartu identitas PVC, tali lanyard sublimasi, dan merchandise kustom di Lampung. Kami hadir untuk menghapus hambatan kuantitas minimum order dan memberikan standar kualitas cetak profesional bagi instansi, kampus, panitia event, serta bisnis lokal.
          </p>
        </div>

        {/* Real Studio Workshop Hero Banner */}
        <figure className="space-y-2">
          <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
            <img
              src="/about_banner.png"
              alt="Workshop Percetakan Tidurlah Grafika dan ID Card Lampung"
              className="w-full h-64 sm:h-96 md:h-[420px] object-cover"
              loading="lazy"
            />
          </div>
          <figcaption className="text-xs text-muted-foreground text-center">
            Workshop Studio Tidurlah Grafika & ID Card Lampung — Melayani pesanan satuan hingga ribuan pcs tanpa minimum order.
          </figcaption>
        </figure>

        {/* Studio Quick Specifications Table */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Spesifikasi & Identitas Studio
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gambaran ringkas operasional dan standar layanan Tidurlah Grafika:
          </p>

          <BlogSpecTable
            caption="Tabel 1: Profil ringkas operasional Tidurlah Grafika & ID Card Lampung"
            headers={["Parameter Studio", "Rincian Profil", "Standar Pelayanan"]}
            items={studioSpecs}
          />
        </section>

        {/* The Story & Vision / Mission */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-2">
          {/* Left: The Story & Motivation */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Kisah & Alasan Kami Memulai
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {about.the_story.content}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {about.the_conflict.content}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs sm:text-sm italic text-foreground leading-relaxed">
              &quot;{about.company_quote}&quot;
            </div>
          </div>

          {/* Right: Mission & Vision Cards */}
          <div className="md:col-span-5 space-y-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>Visi Perusahaan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {about.vision}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Misi Perusahaan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {about.mission}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Service Core Values */}
        <section className="space-y-4 pt-4 border-t border-border">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Nilai Utama Layanan Kami
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Prinsip yang kami pegang dalam memproduksi setiap lembar kartu dan perlengkapan identitas:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {valueItems.map((val, idx) => {
              const IconComp = val.icon;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-2 hover:border-border/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-muted text-foreground">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">
                      {val.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Leadership Profile */}
        <section className="space-y-4 pt-4 border-t border-border">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Tim Pengelola
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tokoh di balik komitmen mutu produksi dan ekosistem digital Tidurlah Grafika:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Stevan */}
            <div className="rounded-lg border border-border bg-card p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <img
                src="/stevan_avatar.png"
                alt={about.the_characters.team[0].name}
                className="w-20 h-20 rounded-full object-cover border border-border shrink-0"
              />
              <div className="space-y-1">
                <h3 className="font-semibold text-sm sm:text-base text-foreground">
                  {about.the_characters.team[0].name}
                </h3>
                <Badge variant="secondary" className="text-[11px] font-mono">
                  {about.the_characters.team[0].role}
                </Badge>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  {about.the_characters.team[0].description}
                </p>
              </div>
            </div>

            {/* Achmad */}
            <div className="rounded-lg border border-border bg-card p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <img
                src="/achmad_avatar.png"
                alt={about.the_characters.team[1].name}
                className="w-20 h-20 rounded-full object-cover border border-border shrink-0"
              />
              <div className="space-y-1">
                <h3 className="font-semibold text-sm sm:text-base text-foreground">
                  {about.the_characters.team[1].name}
                </h3>
                <Badge variant="secondary" className="text-[11px] font-mono">
                  {about.the_characters.team[1].role}
                </Badge>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  {about.the_characters.team[1].description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Grid */}
        {featuredProducts.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Produk Populer Kami
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pilihan produk cetak yang paling sering dipesan oleh pelanggan:
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
              >
                <span>Lihat Semua</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${generateProductSlug(p.name)}`)}
                  className="rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/30 transition-all cursor-pointer flex flex-col group"
                >
                  <div className="aspect-square bg-muted/20 relative overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                        {p.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                    <h3 className="font-semibold text-xs text-foreground line-clamp-1 group-hover:underline">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-semibold text-foreground">
                        Rp {(p.discountPrice || p.price).toLocaleString("id-ID")}
                      </span>
                      {p.rating && (
                        <div className="flex items-center gap-0.5 text-muted-foreground text-[11px]">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{p.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Consultation Callout */}
        <BlogCallout variant="info" title="Siap Memulai Pesanan Cetak Anda?">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Konsultasikan kebutuhan cetak kartu identitas, tali lanyard instansi, atau merchandise souvenir Anda bersama kami. Nikmati harga hemat tanpa minimum pemesanan.
            </p>
            <a
              href={`https://wa.me/${about.the_credits.whatsapp}?text=Halo%20Tidurlah%20Grafika,%20saya%20ingin%20konsultasi%20cetak.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              <span>{about.the_credits.cta_text || "Hubungi Kami via WhatsApp"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </BlogCallout>

      </main>

      {/* Standard Minimalist Footer */}
      <BetaFooter />
    </div>
  );
}
