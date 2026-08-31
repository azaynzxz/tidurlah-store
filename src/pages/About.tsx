import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { AnimatedElement } from "@/components/animations/AnimatedElement";
import { ArrowUpRight, MapPin, Star, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import idCardLampungData from "./idcard_lampung_json.json";
import { PRODUCT_VERSION } from "@/constants";

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

const About = () => {
  const { about } = idCardLampungData;
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/products.json?v=${PRODUCT_VERSION}`);
        const data = await res.json();
        
        let allItems: ProductItem[] = [];
        if (data && typeof data === 'object') {
          Object.keys(data).forEach((cat) => {
            const arr = Array.isArray(data[cat]) ? data[cat] : [];
            arr.forEach((p: any) => {
              p.category = p.category || cat;
              allItems.push(p);
            });
          });
        }
        
        // Pick bestsellers or top featured products
        const topFeatured = allItems.filter(p => p.bestseller || (p.rating && p.rating >= 4.7)).slice(0, 10);
        setFeaturedProducts(topFeatured.length > 0 ? topFeatured : allItems.slice(0, 10));
      } catch (err) {
        console.error("Failed to load products for about page carousel:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (product: ProductItem) => {
    try {
      localStorage.setItem('openProductId', String(product.id));
    } catch {}
    navigate('/');
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const container = document.getElementById('about-product-carousel');
    if (container) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1918] selection:bg-[#FF5E01] selection:text-white flex flex-col notranslate" translate="no">
      <Helmet>
        <title>{about.seo.title}</title>
        <meta name="description" content={about.seo.description} />
        <meta name="keywords" content={about.seo.keywords} />
      </Helmet>

      <Header 
        cartItemsCount={0} 
        onCartClick={() => {}} 
        showSearch={false}
      />

      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16 w-full">
        
        {/* TOP SECTION: TITLE & SUBHEADER */}
        <AnimatedElement direction="up" delay={50} duration={350}>
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#FF5E01]"></span>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#666460]">About</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#111111] font-sans">
              Who we are
            </h1>
          </div>
        </AnimatedElement>

        {/* EDITORIAL GRID SECTION: GRID ILLUSTRATION (LEFT) + NUMBERED SECTIONS (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start mb-20 md:mb-28">
          
          {/* LEFT: MINIMALIST GEOMETRIC BRAND BOX */}
          <div className="lg:col-span-5 hidden lg:block sticky top-24">
            <div className="w-full aspect-square border border-[#E2DDD5] bg-[#F3EFE9] rounded-2xl relative p-8 flex flex-col justify-between overflow-hidden shadow-sm">
              {/* Grid Background Pattern */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: `linear-gradient(#1A1918 1px, transparent 1px), linear-gradient(90deg, #1A1918 1px, transparent 1px)`,
                backgroundSize: `40px 40px`
              }}></div>

              <div className="flex justify-between items-start z-10">
                <span className="text-xs font-mono text-[#88857F]">EST. 2021</span>
                <span className="text-xs font-mono text-[#FF5E01]">TIDURLAH GRAFIKA</span>
              </div>

              {/* Central Geometric Art */}
              <div className="my-auto text-center z-10 flex flex-col items-center justify-center py-6">
                <div className="w-28 h-28 border-2 border-[#FF5E01] rotate-45 rounded-xl flex items-center justify-center mb-6 shadow-sm transition-transform hover:rotate-90 duration-700">
                  <div className="w-16 h-16 border border-[#1A1918] -rotate-45 flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-[#FF5E01]">TG</span>
                  </div>
                </div>
                <p className="text-xs font-mono text-[#666460] tracking-wider uppercase">ID Card & Merchandise Studio</p>
              </div>

              <div className="flex justify-between items-end z-10 pt-4 border-t border-[#E2DDD5]/60">
                <span className="text-[11px] font-mono text-[#88857F]">BANDAR LAMPUNG</span>
                <span className="text-[11px] font-mono text-[#88857F]">INDONESIA</span>
              </div>
            </div>
          </div>

          {/* RIGHT: EDITORIAL NUMBERED CONTENT */}
          <div className="lg:col-span-7 space-y-12 md:space-y-16">
            
            {/* /01 OUR STORY */}
            <AnimatedElement direction="up" delay={100} duration={350}>
              <div className="border-t border-[#E2DDD5] pt-6">
                <div className="flex justify-between items-baseline mb-3">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#111111]">Our story</h2>
                  <span className="text-xs font-mono font-semibold text-[#FF5E01]">/01</span>
                </div>
                <p className="text-sm md:text-base text-[#55534E] leading-relaxed mb-4">
                  {about.the_story.content}
                </p>
                <div className="p-4 bg-[#F2EDE5] rounded-xl border border-[#E2DDD5] text-xs md:text-sm font-medium text-[#22211F] italic">
                  "{about.company_quote || 'Cetak apa aja, Tidurlah Grafika! ID Card Cepat Jalur Pintas.'}"
                </div>
              </div>
            </AnimatedElement>

            {/* /02 WHY WE STARTED */}
            <AnimatedElement direction="up" delay={150} duration={350}>
              <div className="border-t border-[#E2DDD5] pt-6">
                <div className="flex justify-between items-baseline mb-3">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#111111]">Why we started</h2>
                  <span className="text-xs font-mono font-semibold text-[#FF5E01]">/02</span>
                </div>
                <p className="text-sm md:text-base text-[#55534E] leading-relaxed">
                  {about.the_conflict.content}
                </p>
              </div>
            </AnimatedElement>

            {/* /03 OUR MISSION & VISION (FIXED EMPTY BUG) */}
            <AnimatedElement direction="up" delay={200} duration={350}>
              <div className="border-t border-[#E2DDD5] pt-6">
                <div className="flex justify-between items-baseline mb-3">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#111111]">Our mission & vision</h2>
                  <span className="text-xs font-mono font-semibold text-[#FF5E01]">/03</span>
                </div>
                <div className="space-y-6 text-sm md:text-base text-[#55534E]">
                  <div className="p-5 bg-[#F6F3EC] rounded-2xl border border-[#E2DDD5]">
                    <span className="text-xs font-mono font-bold text-[#FF5E01] uppercase tracking-wider block mb-2">MISI KAMI</span>
                    <p className="leading-relaxed text-[#22211F] font-medium">
                      {about.mission || "Menyediakan layanan cetak dan merchandise berkualitas tinggi, kreatif, dan cepat untuk pelanggan di Lampung dan sekitarnya."}
                    </p>
                  </div>
                  <div className="p-5 bg-[#F6F3EC] rounded-2xl border border-[#E2DDD5]">
                    <span className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider block mb-2">VISI KAMI</span>
                    <p className="leading-relaxed text-[#22211F] font-medium">
                      {about.vision || "Menjadi penyedia layanan percetakan dan merchandise terdepan di Lampung yang dikenal luas atas kualitas premium, kreativitas, dan pelayanan pelanggan terbaik."}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedElement>

            {/* /04 OUR VALUES */}
            <AnimatedElement direction="up" delay={250} duration={350}>
              <div className="border-t border-[#E2DDD5] pt-6">
                <div className="flex justify-between items-baseline mb-4">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#111111]">Our values</h2>
                  <span className="text-xs font-mono font-semibold text-[#FF5E01]">/04</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {about.the_resolution.features.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-[#E2DDD5] bg-[#F7F4EE]">
                      <h3 className="font-bold text-sm text-[#111111] mb-1">{item.title}</h3>
                      <p className="text-xs text-[#666460] leading-normal">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedElement>

          </div>
        </div>

        {/* FEATURED PRODUCTS CAROUSEL SECTION */}
        {featuredProducts.length > 0 && (
          <AnimatedElement direction="up" delay={100} duration={400}>
            <div className="mb-20 md:mb-28">
              <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#E2DDD5]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="w-4 h-4 text-[#FF5E01]" />
                    <span className="text-xs font-mono text-[#FF5E01] font-bold uppercase tracking-wider">Katalog Unggulan</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#111111]">
                    Produk Populer Kami
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => scrollCarousel('left')} 
                    className="p-2.5 rounded-full border border-[#E2DDD5] bg-[#F6F3EC] hover:bg-[#FF5E01] hover:text-white hover:border-[#FF5E01] transition-all"
                    aria-label="Previous Product"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => scrollCarousel('right')} 
                    className="p-2.5 rounded-full border border-[#E2DDD5] bg-[#F6F3EC] hover:bg-[#FF5E01] hover:text-white hover:border-[#FF5E01] transition-all"
                    aria-label="Next Product"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Horizontal Scroll Container */}
              <div 
                id="about-product-carousel"
                className="flex gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-4 px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {featuredProducts.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="min-w-[240px] sm:min-w-[280px] max-w-[280px] bg-[#F6F3EC] border border-[#E2DDD5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#FF5E01]/50 transition-all duration-300 flex flex-col cursor-pointer group"
                  >
                    <div className="relative aspect-square overflow-hidden bg-white">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.bestseller && (
                        <span className="absolute top-3 left-3 bg-[#FF5E01] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                          Terlaris
                        </span>
                      )}
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md">
                        {product.category}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[#111111] line-clamp-2 mb-2 group-hover:text-[#FF5E01] transition-colors">
                          {product.name}
                        </h3>
                        {product.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-[#55534E]">{product.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E2DDD5]/80 mt-2">
                        <div>
                          <span className="text-[10px] text-[#88857F] block uppercase font-mono">Mulai Dari</span>
                          <span className="font-bold text-sm text-[#FF5E01]">
                            Rp {(product.discountPrice || product.price).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="p-2 rounded-full bg-[#111111] text-white group-hover:bg-[#FF5E01] transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedElement>
        )}

        {/* MIDDLE EDITORIAL BANNER IMAGE */}
        <AnimatedElement direction="up" delay={150} duration={400}>
          <div className="mb-20 md:mb-28 rounded-2xl overflow-hidden border border-[#E2DDD5] shadow-sm relative group">
            <img 
              src="/about_banner.png" 
              alt="Tidurlah Grafika Workshop Studio" 
              className="w-full h-56 sm:h-80 md:h-[420px] object-cover filter brightness-[0.95] group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 md:p-8">
              <p className="text-white text-xs md:text-sm font-mono tracking-wide">
                TIDURLAH GRAFIKA & ID CARD LAMPUNG STUDIO — BANDAR LAMPUNG
              </p>
            </div>
          </div>
        </AnimatedElement>

        {/* TEAMS SECTION */}
        <AnimatedElement direction="up" delay={100} duration={400}>
          <div className="mb-20 md:mb-28">
            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-[#E2DDD5]">
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#111111]">
                  Teams
                </h2>
                <span className="text-xs font-mono font-semibold text-[#FF5E01]">02</span>
              </div>
              <div className="flex gap-4 text-xs font-mono text-[#666460]">
                <span>Founder & Owner</span>
                <span>•</span>
                <span>Co-Founder</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              
              {/* STEVAN */}
              <div className="bg-[#F6F3EC] border border-[#E2DDD5] p-6 md:p-8 rounded-2xl flex flex-col items-center text-center group hover:border-[#FF5E01]/50 transition-colors">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden mb-6 ring-4 ring-[#E2DDD5] group-hover:ring-[#FF5E01] transition-all shadow-md">
                  <img 
                    src="/stevan_avatar.png" 
                    alt={about.the_characters.team[0].name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-[#111111] mb-1">
                  {about.the_characters.team[0].name}
                </h3>
                <span className="text-xs font-mono font-bold text-[#FF5E01] uppercase tracking-wider mb-4">
                  {about.the_characters.team[0].role}
                </span>
                <p className="text-xs md:text-sm text-[#55534E] leading-relaxed max-w-md">
                  {about.the_characters.team[0].description}
                </p>
              </div>

              {/* ACHMAD */}
              <div className="bg-[#F6F3EC] border border-[#E2DDD5] p-6 md:p-8 rounded-2xl flex flex-col items-center text-center group hover:border-[#FF5E01]/50 transition-colors">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden mb-6 ring-4 ring-[#E2DDD5] group-hover:ring-[#FF5E01] transition-all shadow-md">
                  <img 
                    src="/achmad_avatar.png" 
                    alt={about.the_characters.team[1].name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-[#111111] mb-1">
                  {about.the_characters.team[1].name}
                </h3>
                <span className="text-xs font-mono font-bold text-[#FF5E01] uppercase tracking-wider mb-4">
                  {about.the_characters.team[1].role}
                </span>
                <p className="text-xs md:text-sm text-[#55534E] leading-relaxed max-w-md">
                  {about.the_characters.team[1].description}
                </p>
              </div>

            </div>
          </div>
        </AnimatedElement>

        {/* LOCATION & MAP SECTION */}
        <AnimatedElement direction="up" delay={100} duration={400}>
          <div className="mb-20 md:mb-24">
            <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-[#E2DDD5]">
              <h2 className="text-xl md:text-2xl font-bold text-[#111111]">Location</h2>
              <span className="text-xs font-mono text-[#88857F]">STUDIO ADDRESS</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F6F3EC] border border-[#E2DDD5] p-4 md:p-6 rounded-2xl items-center">
              <div className="lg:col-span-7 h-56 md:h-64 rounded-xl overflow-hidden border border-[#E2DDD5]">
                <iframe 
                  src={about.the_setting.embed_url}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location Map"
                />
              </div>
              <div className="lg:col-span-5 p-2 md:p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#FF5E01] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#111111] mb-1">Tidurlah Grafika / ID Card Lampung</h3>
                    <p className="text-xs md:text-sm text-[#55534E] leading-relaxed">
                      {about.the_setting.address}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#E2DDD5] flex flex-wrap gap-2 text-xs font-mono text-[#666460]">
                  <span>WA: 0851-7215-7808</span>
                  <span>•</span>
                  <span>idcardlampung.com</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedElement>

        {/* FOOTER CALL TO ACTION */}
        <AnimatedElement direction="up" delay={100} duration={400}>
          <div className="bg-[#111111] text-[#FAF8F5] p-8 md:p-14 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Siap untuk pesan cetak?</h2>
              <p className="text-xs md:text-sm text-[#AAAAAA] max-w-md">
                Konsultasikan kebutuhan ID Card, Lanyard, atau Merchandise custom Anda langsung dengan admin kami.
              </p>
            </div>
            <a 
              href={`https://wa.me/${about.the_credits.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FF5E01] text-white text-sm font-bold px-7 py-3.5 rounded-full hover:bg-[#e05200] transition-colors shadow-lg shrink-0"
            >
              <span>{about.the_credits.cta_text}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </AnimatedElement>

      </main>

      <Footer />
    </div>
  );
};

export default About;
