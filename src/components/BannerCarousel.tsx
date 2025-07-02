import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CarouselApi } from "@/components/ui/carousel";

// Banner data type
interface Banner {
  id: number;
  image: string;
  title: string;
  description: string;
  linkUrl?: string;
}

// Sample banner data
const banners: Banner[] = [
  {
    id: 1,
    image: "/banners/banner-main_result.webp",
    title: "TIDURLAH GRAFIKA - Main Banner",
    description: "Cetak apa aja, Tidurlah Grafika!",
    linkUrl: "#shop",
  },
  {
    id: 2,
    image: "/banners/banner-1_result.webp",
    title: "TIDURLAH GRAFIKA - Promo 1",
    description: "Solusi cetak terbaik untuk kebutuhan Anda",
    linkUrl: "#shop",
  },
  {
    id: 3,
    image: "/banners/banner-2_result.webp", 
    title: "TIDURLAH GRAFIKA - Promo 2",
    description: "Kualitas premium dengan harga terjangkau",
    linkUrl: "#shop",
  },
  {
    id: 4,
    image: "/banners/banner-3_result.webp",
    title: "TIDURLAH GRAFIKA - Promo 3", 
    description: "Layanan profesional untuk semua kebutuhan cetak",
    linkUrl: "#shop",
  },
];

const BannerCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Auto-advance slides every 3.5 seconds (only if multiple banners)
  useEffect(() => {
    if (!api || !autoplay || banners.length <= 1) return;

    const startAutoplay = () => {
      intervalRef.current = setInterval(() => {
        api.scrollNext();
      }, 5000); // 5 seconds delay
    };

    const stopAutoplay = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    startAutoplay();

    return () => stopAutoplay();
  }, [api, autoplay]);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Handle mouse events for autoplay control
  const handleMouseEnter = () => {
    setAutoplay(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setAutoplay(true);
  };

  return (
    <div className="relative mb-2 lg:mb-3">
      <Carousel
        setApi={setApi}
        className="w-full max-w-6xl mx-auto"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        opts={{
          align: "start",
          loop: banners.length > 1, // Only loop if multiple banners
        }}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <a href={banner.linkUrl} className="block">
                <div className="relative w-full overflow-hidden rounded-lg lg:rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                  />
                  {/* Optional overlay for text */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Only show line indicators if there are multiple banners */}
        {banners.length > 1 && (
          <div className="flex justify-center mt-3 lg:mt-4 space-x-1">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-8 h-0.5 lg:w-12 lg:h-1 transition-colors ${
                  index === current ? 'bg-[#FF5E01]' : 'bg-gray-300'
                }`}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
