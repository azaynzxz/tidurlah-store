import { MapPin, Store, Instagram, Facebook, MessageCircle, ExternalLink, Clock } from "lucide-react";
import Header from "@/components/common/Header";
import SEO from "@/components/common/SEO";
import { AnimatedElement } from "@/components/animations/AnimatedElement";
import { Button } from "@/components/ui/button";
import Footer from "@/components/common/Footer";
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
    link: "https://www.facebook.com/idcardlampung"
  },
  {
    id: "visit-stores",
    title: "Lokasi Toko",
    description: "Kunjungi toko fisik kami",
    icon: MapPin,
    gradient: "bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600",
    link: "multiple"
  },
  {
    id: "open-hours",
    title: "Jam Operasional",
    description: "Waktu buka toko kami",
    icon: Clock,
    gradient: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
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
    <div className="min-h-screen bg-white overflow-hidden relative selection:bg-black/20 page-transition">
      <SEO
        title="Hubungi Kami"
        description="Hubungi Tidurlah Grafika untuk konsultasi produk, pemesanan, dan informasi lebih lanjut. Kami siap melayani kebutuhan cetak Anda."
        keywords="kontak tidurlah grafika, alamat tidurlah grafika, whatsapp tidurlah grafika, lokasi percetakan lampung"
      />
      {/* Universal Header */}
      <Header
        cartItemsCount={0}
        onCartClick={() => window.location.href = '/'}
        onSearch={() => { }}
        showSearch={false}
      />

      {/* Main Content */}
      <div className="flex-1 p-2">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_50%)]" />

        {/* Header */}
        <AnimatedElement direction="up" delay={200} duration={300}>
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              Hubungi Kami
            </h1>

            {/* Brand Pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {["ID Card Lampung", "Papan ID Craft", "Tidurlah Grafika"].map((brand) => (
                <div
                  key={brand}
                  className="px-4 py-1.5 bg-black/5 backdrop-blur-sm rounded-full text-xs font-medium text-gray-800 border border-gray-200"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card, index) => {
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
                      ${card.id === "store" ? "card-shine" : ""}
                    `}
                    onClick={() => handleCardClick(card)}
                  >
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="bg-white/20 backdrop-blur-md rounded-xl p-2.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      {card.id !== "visit-stores" && card.id !== "open-hours" && (
                        <ExternalLink className="w-4 h-4 opacity-80" />
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-1 relative z-10">{card.title}</h3>
                    <p className="text-white/90 text-sm mb-3 relative z-10">{card.description}</p>

                    {card.id === "visit-stores" && (
                      <div className="space-y-2 mt-4 relative z-10">
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

                    {card.id === "open-hours" && (
                      <div className="space-y-3 mt-4 relative z-10">

                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                          <div className="flex items-start gap-2 mb-1">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">Cabang Belwis</h4>
                              <p className="text-white/90 text-xs leading-relaxed">
                                08.00 - 17.30
                                <br />
                                (Order dan Pengambilan)
                              </p>
                              <p className="text-white/80 text-xs mt-1">
                                Senin - Sabtu
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </AnimatedElement>

        {/* Interactive Google Maps & Studio Location */}
        <AnimatedElement direction="up" delay={500} duration={300}>
          <section className="container max-w-4xl mx-auto mt-8 mb-12">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5E01]/10 text-[#FF5E01] text-xs font-semibold mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Studio & Workshop Fisik</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    Tidurlah Grafika — Cabang Belwis
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    Kunjungi workshop kami untuk konsultasi langsung, cek sample bahan, atau pengambilan pesanan.
                  </p>
                </div>
                <Button
                  onClick={() => window.open("https://maps.app.goo.gl/XVJYoKbzU5FRwVuJA", "_blank")}
                  className="bg-[#FF5E01] hover:bg-[#e54d00] text-white shadow-sm shrink-0"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Buka di Google Maps
                </Button>
              </div>

              {/* Map Embed and Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 h-64 md:h-72 rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d358.8368063702099!2d105.3159073944683!3d-5.352631091802125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40c384e8ee58ef%3A0xa4e876abbc74d8a5!2sTidurlah%20Grafika!5e1!3m2!1sen!2sid!4v1762012258485!5m2!1sen!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Peta Lokasi Studio Tidurlah Grafika Belwis Lampung"
                    className="w-full h-full"
                  />
                </div>

                <div className="lg:col-span-5 space-y-4 text-sm text-gray-700">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <span className="font-semibold text-gray-900 block text-xs uppercase tracking-wider text-[#FF5E01]">
                      Alamat Lengkap
                    </span>
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                      Perumahan Pemda (Belwis), Way Hui, Kec. Jati Agung, Kabupaten Lampung Selatan, Lampung 35365
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <span className="font-semibold text-gray-900 block text-xs uppercase tracking-wider text-[#FF5E01]">
                      Jam Buka & Layanan
                    </span>
                    <p className="text-xs md:text-sm text-gray-700">
                      <strong>Senin – Sabtu:</strong> 08.00 – 17.30 WIB<br />
                      <span className="text-xs text-gray-500">(Order, konsultasi desain, & pengambilan pesanan)</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open("https://wa.me/6285172157808", "_blank")}
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 text-xs"
                    >
                      <MessageCircle className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                      Chat WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedElement>
      </div>

      {/* Footer */}
      <Footer />

      {/* Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default Spotlight;
