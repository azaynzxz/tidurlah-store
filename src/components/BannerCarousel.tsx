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
    image: "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=1080&q=80",
    title: "Special Promo",
    description: "Get 15% off on all media promotion items",
    linkUrl: "#promo",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=1080&q=80",
    title: "New Collection",
    description: "Check out our latest merchandise",
    linkUrl: "#merch",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=1080&q=80",
    title: "Premium Lanyards",
    description: "Custom designs for your organization",
    linkUrl: "#lanyards",
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
              <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 text-white">
                  <h3 className="text-lg font-bold">{banner.title}</h3>
                  <p className="text-xs">{banner.description}</p>
                </div>
              </div>
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
