import { useState, useRef } from "react";
import { MapPin, Store, Instagram, Facebook, MessageCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Card {
  id: string;
  title: string;
  description: string;
  icon: typeof MapPin;
  gradient: string;
  link: string;
}

const cards: Card[] = [
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Chat dengan kami sekarang",
    icon: MessageCircle,
    gradient: "bg-gradient-to-br from-green-500 via-green-600 to-emerald-600",
    link: "https://wa.me/6285172157808"
  },
  {
    id: "visit-stores",
    title: "Kunjungi toko kami",
    description: "Pilih cabang terdekat",
    icon: MapPin,
    gradient: "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700",
    link: "multiple" // Special indicator for multiple buttons
  },
  {
    id: "store",
    title: "Toko Online",
    description: "Jelajahi produk kami",
    icon: Store,
    gradient: "bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600",
    link: "/"
  },
  {
    id: "instagram",
    title: "Instagram",
    description: "Ikuti kami @tidurlah_grafika",
    icon: Instagram,
    gradient: "bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600",
    link: "https://instagram.com/tidurlah_grafika"
  },
  {
    id: "facebook",
    title: "Facebook",
    description: "Sukai halaman kami",
    icon: Facebook,
    gradient: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
    link: "https://facebook.com/tidurlahgrafika"
  }
];

export const CardStack = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartIndex = useRef(0);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    dragStartIndex.current = activeIndex;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = dragStartY.current - clientY;

    // Only allow one card change per drag gesture with higher threshold
    if (Math.abs(diff) > 80) {
      if (diff > 0) {
        // Swipe up - go to next card (with infinite wrapping)
        setActiveIndex(prev => (prev + 1) % cards.length);
      } else {
        // Swipe down - go to previous card (with infinite wrapping)
        setActiveIndex(prev => prev === 0 ? cards.length - 1 : prev - 1);
      }
      // Reset drag to prevent multiple changes in one gesture
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleCardClick = (index: number) => {
    if (isDragging) return;

    if (index === activeIndex) {
      // Open link - but skip for multiple button cards
      if (cards[index].link === "multiple") {
        // Do nothing, let the individual buttons handle clicks
        return;
      } else if (cards[index].link === "/") {
        // Navigate to home page
        window.location.href = "/";
      } else {
        window.open(cards[index].link, '_blank');
      }
    } else {
      // Bring card to front
      setActiveIndex(index);
    }
  };

  const handleStoreLocationClick = (url: string, storeName: string) => {
    window.open(url, '_blank');
  };

  const getCardStyle = (index: number) => {
    const offset = index - activeIndex;
    const isActive = index === activeIndex;

    return {
      transform: `translateY(${offset * 20}px) scale(${isActive ? 1 : 0.95 - Math.abs(offset) * 0.05})`,
      zIndex: cards.length - Math.abs(offset),
      opacity: Math.max(0.3, 1 - Math.abs(offset) * 0.2),
    };
  };

  return (
    <div
      className="relative w-full max-w-md mx-auto h-[500px] perspective-1000 select-none"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isActive = index === activeIndex;

        return (
          <div
            key={card.id}
            className={cn(
              "absolute inset-x-0 top-0 w-full h-[400px] rounded-3xl p-8",
              "cursor-grab active:cursor-grabbing transition-all duration-500 ease-out",
              "shadow-2xl hover:shadow-3xl",
              card.gradient,
              "backdrop-blur-sm touch-none"
            )}
            style={getCardStyle(index)}
            onClick={() => handleCardClick(index)}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex flex-col h-full text-white">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
                  <Icon className="w-8 h-8" />
                </div>
                {isActive && (
                  <ExternalLink className="w-6 h-6 opacity-80" />
                )}
              </div>

              <div className="flex-1 flex flex-col justify-end">
                <h3 className="text-3xl font-bold mb-2">{card.title}</h3>
                <p className="text-white/90 text-lg mb-4">{card.description}</p>

                {/* Special content for visit-stores card */}
                {card.id === "visit-stores" && isActive && (
                  <div className="space-y-3 animate-fade-in">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStoreLocationClick("https://maps.app.goo.gl/XVJYoKbzU5FRwVuJA", "Cabang Belwis");
                      }}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm py-3"
                      size="lg"
                    >
                      <MapPin className="mr-2 h-5 w-5" />
                      Cabang Belwis
                    </Button>
                  </div>
                )}
              </div>

              {isActive && card.id !== "visit-stores" && (
                <div className="mt-6 text-sm text-white/70 animate-fade-in">
                  Ketuk untuk membuka • Geser ↕ untuk navigasi
                </div>
              )}

              {isActive && card.id === "visit-stores" && (
                <div className="mt-6 text-sm text-white/70 animate-fade-in">
                  Pilih cabang • Geser ↕ untuk navigasi
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Navigation dots */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === activeIndex
                ? "bg-white w-8"
                : "bg-white/30"
            )}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
