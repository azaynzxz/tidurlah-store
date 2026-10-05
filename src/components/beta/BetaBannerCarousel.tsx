import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BannerSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  categoryTag?: string;
  targetCategory?: string;
  searchTerm?: string;
}

export const STORE_BANNERS: BannerSlide[] = [
  {
    id: "banner-authority",
    image: "/banners/banner-main_result.webp",
    title: "Ahlinya Cetak ID Card & Lanyard",
    subtitle: "Hasil presisi, cepat, dan bergaransi resmi dengan review 4.9 di Bandar Lampung.",
    categoryTag: "Layanan Unggulan",
    targetCategory: "ID Card & Lanyard",
  },
  {
    id: "banner-website-promo",
    image: "/banners/banner-2_result.webp",
    title: "Order Online Tidurlah Store",
    subtitle: "Klaim diskon s/d 15% untuk pemesanan langsung melalui website resmi.",
    categoryTag: "Promo Website",
    targetCategory: "Semua",
  },
  {
    id: "banner-bundle-kkn",
    image: "/banners/banner-3_result.webp",
    title: "Paket Bundle Spesial Mahasiswa KKN & PKL",
    subtitle: "Paket lengkap ID card, tali lanyard cetak, casing, dan plakat akrilik resmi.",
    categoryTag: "Paket Spesial",
    targetCategory: "ID Card & Lanyard",
    searchTerm: "KKN",
  },
  {
    id: "banner-sale-event",
    image: "/banners/banner-1_result.webp",
    title: "Super Sale Mahasiswa & Komunitas",
    subtitle: "Diskon bertingkat untuk event kampus & instansi tanpa minimum kuantiti.",
    categoryTag: "Diskon Khusus",
    targetCategory: "ID Card & Lanyard",
  },
];

interface BetaBannerCarouselProps {
  banners?: BannerSlide[];
  onBannerClick?: (banner: BannerSlide) => void;
  autoPlayInterval?: number;
}

export const BetaBannerCarousel: React.FC<BetaBannerCarouselProps> = ({
  banners = STORE_BANNERS,
  onBannerClick,
  autoPlayInterval = 5000,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 25,
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync selected index with Embla carousel
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay functionality with pause on hover/focus (WCAG 2.2 compliant)
  useEffect(() => {
    if (!emblaApi || isPaused || banners.length <= 1) return;

    autoPlayTimerRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [emblaApi, isPaused, banners.length, autoPlayInterval]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  return (
    <section
      className="relative w-full group select-none"
      aria-roledescription="carousel"
      aria-label="Promo & Banner Utama Tidurlah Store"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Outer Card Frame: Clean border, subtle backdrop, disciplined corners */}
      <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl border border-[#E7E5E4] bg-[#18181B] shadow-sm">
        {/* Embla Viewport */}
        <div ref={emblaRef} className="overflow-hidden w-full">
          <div className="flex touch-pan-y">
            {banners.map((banner, index) => {
              return (
                <div
                  key={banner.id}
                  className="relative flex-[0_0_100%] min-w-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} dari ${banners.length}: ${banner.title}`}
                >
                  <button
                    type="button"
                    onClick={() => onBannerClick?.(banner)}
                    className="relative block w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8590C] focus-visible:ring-inset group/slide"
                    aria-label={`Lihat penawaran ${banner.title}`}
                  >
                    {/* Native Aspect Ratio: 3.88:1 (1940x500 / 970x250) ensures zero cut-out across mobile and desktop */}
                    <div className="relative w-full aspect-[3.88/1] overflow-hidden bg-[#18181B]">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover/slide:scale-[1.012]"
                      />

                      {/* Subtle hover shade to signal clickability */}
                      <div className="absolute inset-0 bg-black/0 group-hover/slide:bg-black/5 transition-colors duration-200 pointer-events-none" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Navigation Arrows (Desktop / Mouse) */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Slide sebelumnya"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/65 text-white backdrop-blur-md border border-white/15 flex items-center justify-center opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={scrollNext}
              aria-label="Slide berikutnya"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/65 text-white backdrop-blur-md border border-white/15 flex items-center justify-center opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.2} />
            </button>
          </>
        )}
      </div>

      {/* Disciplined Pagination Bar Below Banner — Never obscures artwork or text */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 sm:pt-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E7E5E4] shadow-xs">
            {/* Slide Counter */}
            <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-[#71717A] mr-1 tabular-nums">
              0{selectedIndex + 1} / 0{banners.length}
            </span>

            {/* Indicator Pills */}
            <div className="flex items-center gap-1.5">
              {banners.map((b, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => scrollTo(idx)}
                    aria-label={`Pindah ke slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ease-out focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E8590C] ${
                      isActive
                        ? "w-5 sm:w-6 bg-[#E8590C]"
                        : "w-1.5 bg-[#D4D4D8] hover:bg-[#A1A1AA]"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
