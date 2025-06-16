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
    image: "/banners/banner-1.jpg",
    title: "SUPER SALE",
    description: "Diskon Khusus Mahasiswa KKN",
    linkUrl: "#promo",
  },
  {
    id: 2,
    image: "/banners/banner-2.jpg",
    title: "TIDURLAH STORE",
    description: "UP TO 15% OFF",
    linkUrl: "#shop",
  },
  {
    id: 3,
    image: "/banners/banner-3.jpg",
    title: "BUNDLE SPESIAL",
    description: "Promo Spesial Mahasiswa KKN",
    linkUrl: "#bundle",
  },
];

const BannerCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Auto-advance slides every 3.5 seconds
  useEffect(() => {
    if (!api || !autoplay) return;

    const startAutoplay = () => {
      intervalRef.current = setInterval(() => {
        api.scrollNext();
      }, 3500); // 3.5 seconds delay
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
    <div className="relative mb-3">
      <Carousel
        setApi={setApi}
        className="w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <a href={banner.linkUrl} className="block">
                <div className="relative w-full overflow-hidden rounded-lg bg-orange-50" style={{ paddingBottom: "45%" }}>
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-white h-8 w-8">
          <ChevronLeft className="h-5 w-5" />
        </CarouselPrevious>
        <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-white h-8 w-8">
          <ChevronRight className="h-5 w-5" />
        </CarouselNext>
        
        {/* Dot indicators */}
        <div className="flex justify-center mt-2 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === current ? 'bg-[#FF5E01]' : 'bg-gray-300'
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
