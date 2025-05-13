import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [autoplay, setAutoplay] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      // The carousel will handle the slide change internally
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay]);

  return (
    <div className="relative mb-3">
      <Carousel
        className="w-full"
        onMouseEnter={() => setAutoplay(false)}
        onMouseLeave={() => setAutoplay(true)}
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
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
