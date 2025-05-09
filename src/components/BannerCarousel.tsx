
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
    image: "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=820&h=360&q=80",
    title: "Special Promo",
    description: "Get 15% off on all media promotion items",
    linkUrl: "#promo",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=820&h=360&q=80",
    title: "New Collection",
    description: "Check out our latest merchandise",
    linkUrl: "#merch",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=820&h=360&q=80",
    title: "Premium Lanyards",
    description: "Custom designs for your organization",
    linkUrl: "#lanyards",
  },
];

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay]);

  return (
    <div className="relative mb-4">
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
              <div className="relative h-[360px] w-full overflow-hidden rounded-lg">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
                  <h3 className="text-xl font-bold">{banner.title}</h3>
                  <p className="mt-1 text-sm">{banner.description}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-white">
          <ChevronLeft className="h-6 w-6" />
        </CarouselPrevious>
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-white">
          <ChevronRight className="h-6 w-6" />
        </CarouselNext>
      </Carousel>

      {/* Pagination dots */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-2">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentSlide % banners.length
                ? "bg-white"
                : "bg-white bg-opacity-50"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
