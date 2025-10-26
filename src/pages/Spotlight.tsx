import { CardStack } from "@/components/CardStack";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { ShoppingCart, Newspaper } from "lucide-react";
import MusicPlayer from "@/components/MusicPlayer";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { AnimatedElement } from "@/components/animations/AnimatedElement";

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
      {/* Universal Header */}
      <AnimatedElement direction="down" duration={200}>
        <Header 
          cartItemsCount={0}
          onCartClick={() => window.location.href = '/'}
          onSearch={() => {}}
          showSearch={false}
        />
      </AnimatedElement>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_50%)] animate-pulse" />
        
        {/* Header */}
        <AnimatedElement direction="up" delay={200} duration={300}>
          <header className="text-center mb-12">
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
        </AnimatedElement>

        {/* Card Stack */}
        <AnimatedElement direction="up" delay={400} duration={300}>
          <main className="container max-w-4xl mx-auto">
            <CardStack />
          </main>
        </AnimatedElement>

        {/* Footer */}
        <AnimatedElement direction="up" delay={600} duration={300}>
          <footer className="text-center mt-16 text-muted-foreground text-sm">
            <p>© 2025 Tidurlah Store. Hak Cipta Dilindungi.</p>
          </footer>
        </AnimatedElement>
      </div>
    </div>
  );
};

export default Spotlight;
