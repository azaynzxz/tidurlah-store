import { MapPin, Store, Instagram, Facebook, MessageCircle, ExternalLink } from "lucide-react";
import Header from "@/components/common/Header";
import { AnimatedElement } from "@/components/animations/AnimatedElement";
import { Button } from "@/components/ui/button";
import ChatBot from "@/components/ChatBot";

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
    id: "store",
    title: "Toko Online",
    description: "Order online sat set bayar via WA",
    icon: Store,
    gradient: "bg-gradient-to-br from-orange-500 via-red-500 to-orange-600",
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
  },
  {
    id: "visit-stores",
    title: "Lokasi Toko",
    description: "Kunjungi toko fisik kami",
    icon: MapPin,
    gradient: "bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600",
    link: "multiple"
  }
];

const Spotlight = () => {
  const handleCardClick = (card: Card) => {
    if (card.link === "multiple") {
      return;
    } else if (card.link === "/") {
      window.location.href = "/";
    } else {
      window.open(card.link, '_blank');
    }
  };

  const handleStoreLocationClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex flex-col">
      {/* Universal Header */}
      <Header 
        cartItemsCount={0}
        onCartClick={() => window.location.href = '/'}
        onSearch={() => {}}
        showSearch={false}
      />

      {/* Main Content */}
      <div className="flex-1 py-12 px-4">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        {/* Header */}
        <AnimatedElement direction="up" delay={200} duration={300}>
          <header className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              Hubungi Kami
            </h1>
            
            {/* Brand Pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {["ID Card Lampung", "Papan ID Craft", "Tidurlah Grafika"].map((brand) => (
                <div
                  key={brand}
                  className="px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full text-xs font-medium text-foreground/80 border border-border/50"
                >
                  {brand}
                </div>
              ))}
            </div>
          </header>
        </AnimatedElement>

        {/* Card List */}
        <AnimatedElement direction="up" delay={400} duration={300}>
          <main className="container max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => {
                const Icon = card.icon;
                
                return (
                  <div
                    key={card.id}
                    className={`
                      ${card.gradient} 
                      rounded-2xl p-4 
                      text-white 
                      hover:scale-105 
                      transition-transform duration-300 
                      cursor-pointer
                      shadow-lg hover:shadow-xl
                    `}
                    onClick={() => handleCardClick(card)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-white/20 backdrop-blur-md rounded-xl p-2.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      {card.id !== "visit-stores" && (
                        <ExternalLink className="w-4 h-4 opacity-80" />
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                    <p className="text-white/90 text-sm mb-3">{card.description}</p>
                    
                    {card.id === "visit-stores" && (
                      <div className="space-y-2 mt-4">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStoreLocationClick("https://maps.app.goo.gl/hVwcunR4E5LobVBTA");
                          }}
                          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Cabang Korpri
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStoreLocationClick("https://maps.app.goo.gl/XVJYoKbzU5FRwVuJA");
                          }}
                          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Cabang Belwis
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </AnimatedElement>

        {/* Footer */}
        <AnimatedElement direction="up" delay={600} duration={300}>
          <footer className="text-center mt-16 text-muted-foreground text-sm">
            <p>© 2025 Tidurlah Store. Hak Cipta Dilindungi.</p>
          </footer>
        </AnimatedElement>
      </div>
      
      {/* Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default Spotlight;
