import { CardStack } from "@/components/CardStack";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { ShoppingCart, Newspaper } from "lucide-react";
import MusicPlayer from "@/components/MusicPlayer";

const Spotlight = () => {
  const { toast } = useToast();
  const idleTimerRef = useRef<NodeJS.Timeout>();
  const hasShownToast = useRef(false);

  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      hasShownToast.current = false;
      
      idleTimerRef.current = setTimeout(() => {
        if (!hasShownToast.current) {
          toast({
            title: "Halo! 👋",
            description: "Geser kartu untuk melihat kontak kami yang lain",
            duration: 4000,
          });
          hasShownToast.current = true;
        }
      }, 5000);
    };

    // Listen for user activity
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
    };
  }, [toast]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-white flex flex-col">
      {/* Header - Same as main site */}
      <div className="bg-white shadow-sm p-3 lg:p-4 flex justify-between items-center sticky top-0 z-50 px-4 md:px-6 lg:px-6">
        <img 
          src="/product-image/Tidurlah Logo Horizontal.png"
          alt="TIDURLAH STORE"
          className="h-8 lg:h-10 object-contain"
        />
        <div className="flex items-center space-x-2 lg:space-x-4">
          <MusicPlayer />
          <button 
            onClick={() => window.open('/blog', '_blank')}
            className="text-[#FF5E01] hover:text-[#FF5E01]/80 text-xs font-medium flex items-center p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <Newspaper className="h-5 w-5 lg:h-6 lg:w-6" />
          </button>
          <button 
            className="relative p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-colors"
            onClick={() => window.location.href = '/'}
          >
            <ShoppingCart className="h-6 w-6 text-[#FF5E01]" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_50%)] animate-pulse" />
        
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
          Tidurlah Store
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

      {/* Card Stack */}
      <main className="container max-w-4xl mx-auto">
        <CardStack />
      </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-muted-foreground text-sm animate-fade-in">
          <p>© 2025 Tidurlah Store. Hak Cipta Dilindungi.</p>
        </footer>
      </div>
    </div>
  );
};

export default Spotlight;
