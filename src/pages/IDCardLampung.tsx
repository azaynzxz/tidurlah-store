import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, Instagram, Facebook, Map, ExternalLink, ChevronLeft, ChevronRight, CreditCard, Users, Share2, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";

// Import the JSON data
import micrositeData from './idcard_lampung_json.json';

// Swipe Tutorial Component
const SwipeTutorial = ({ isLoaded, currentCard, totalCards }: { isLoaded: boolean, currentCard: number, totalCards: number }) => {
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTutorial(false);
    }, 5000); // Hide tutorial after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center mt-6">
      {!isLoaded ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center space-x-2"
        >
          <motion.div
            className="w-2 h-2 bg-white/60 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-white/60 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-white/60 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
          <span className="text-white/60 text-sm ml-3">Materializing cards...</span>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Swipe Tutorial */}
          <AnimatePresence>
            {showTutorial && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 2.5, duration: 0.5 }}
                className="flex items-center justify-center space-x-4"
              >
                {/* Left swipe animation */}
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-10 h-7 border-2 border-white/50 rounded-lg flex items-center justify-center bg-white/5 backdrop-blur-sm"
                    animate={{ x: [-12, 12, -12] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="w-1.5 h-1.5 bg-white/70 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </motion.div>
                  <span className="text-white/70 text-sm font-medium">Swipe</span>
                </div>
                
                <span className="text-white/50 text-sm">atau tap</span>
                
                {/* Right swipe animation */}
                <div className="flex items-center space-x-2">
                  <span className="text-white/70 text-sm font-medium">Swipe</span>
                  <motion.div
                    className="w-10 h-7 border-2 border-white/50 rounded-lg flex items-center justify-center bg-white/5 backdrop-blur-sm"
                    animate={{ x: [12, -12, 12] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                  >
                    <motion.div
                      className="w-1.5 h-1.5 bg-white/70 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 1.2 }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Card counter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: showTutorial ? 6.5 : 2.5, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-white/60 text-sm font-medium">
              {currentCard + 1} dari {totalCards} layanan
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const IDCardLampung = () => {
  const data = micrositeData;
  const [currentCard, setCurrentCard] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flyingBubbles, setFlyingBubbles] = useState<Array<{
    id: string, 
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number,
    size?: string,
    duration?: number,
    delay?: number
  }>>([]);

  // Flying animation function
  const triggerFlyingAnimation = (sourceElement?: HTMLElement) => {
    // Get source position - start from bottom center for magical effect
    let startX = window.innerWidth / 2; // Center horizontally
    let startY = window.innerHeight - 100; // Bottom of screen with some padding
    
    if (sourceElement) {
      const rect = sourceElement.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }
    
    // Create many more bubbles for blowing bubbles celebration effect
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        // Create bubbles that spread out in different directions like being blown
        const angle = (i / 12) * 2 * Math.PI; // Spread bubbles in a circle
        const distance = 150 + Math.random() * 200; // Random distance
        const spread = Math.random() * 100 - 50; // Add some randomness
        
        let endX = startX + Math.cos(angle) * distance + spread;
        let endY = startY + Math.sin(angle) * distance + spread;
        
        // Some bubbles should float up like real bubbles
        if (Math.random() > 0.5) {
          endY = Math.random() * window.innerHeight * 0.3; // Float to top
          endX = startX + (Math.random() - 0.5) * window.innerWidth * 0.8;
        }
        
        // Ensure bubbles stay within screen bounds
        endX = Math.max(50, Math.min(window.innerWidth - 50, endX));
        endY = Math.max(50, Math.min(window.innerHeight - 50, endY));
        
        const bubbleId = Date.now().toString() + i;
        const newBubble = { 
          id: bubbleId, 
          startX, 
          startY, 
          endX, 
          endY,
          // Add properties for different bubble sizes and speeds
          size: Math.random() > 0.7 ? 'large' : Math.random() > 0.3 ? 'medium' : 'small',
          duration: 1000 + Math.random() * 1500, // Different animation durations
          delay: i * 50 + Math.random() * 200 // Staggered release
        };
        
        setFlyingBubbles(prev => [...prev, newBubble]);
        
        // Remove bubble after animation completes (varied timing)
        setTimeout(() => {
          setFlyingBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
        }, newBubble.duration + newBubble.delay + 500);
      }, i * 80); // Stagger the bubble creation
    }
    
    // Add some delayed secondary bubbles for extra effect
    setTimeout(() => {
      for (let j = 0; j < 6; j++) {
        setTimeout(() => {
          const angle = Math.random() * 2 * Math.PI;
          const distance = 100 + Math.random() * 150;
          
          // Use bottom center as start point for secondary bubbles too
          const secondaryStartX = window.innerWidth / 2;
          const secondaryStartY = window.innerHeight - 100;
          
          let endX = secondaryStartX + Math.cos(angle) * distance;
          let endY = secondaryStartY + Math.sin(angle) * distance - 100; // Float upward
          
          endX = Math.max(50, Math.min(window.innerWidth - 50, endX));
          endY = Math.max(50, Math.min(window.innerHeight - 50, endY));
          
          const bubbleId = Date.now().toString() + 'secondary' + j;
          const newBubble = { 
            id: bubbleId, 
            startX: secondaryStartX, 
            startY: secondaryStartY, 
            endX, 
            endY,
            size: 'small',
            duration: 2000,
            delay: 0
          };
          
          setFlyingBubbles(prev => [...prev, newBubble]);
          
          setTimeout(() => {
            setFlyingBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
          }, 2500);
        }, j * 150);
      }
    }, 800);
  };

  // Show intro notifications on component mount
  useEffect(() => {
    // First notification - Welcome
    const timer1 = setTimeout(() => {
      toast.success("🎉 Selamat datang di ID Card Lampung!", { 
        position: 'top-center', 
        duration: 3000, 
        style: { 
          marginTop: '60px',
          fontSize: '14px',
          padding: '8px 12px',
          minHeight: '40px',
          backgroundColor: '#FF5E01',
          color: 'white',
          fontWeight: 'bold',
          border: '2px solid #FF6B35',
          boxShadow: '0 0 20px rgba(255, 94, 1, 0.3)'
        }
      });
      
      // Trigger celebration animation
      triggerFlyingAnimation();
    }, 500);

    // Second notification - Swipe instruction
    const timer2 = setTimeout(() => {
      toast.info("👆 Geser kartu untuk melihat semua layanan", { 
        position: 'top-center', 
        duration: 4000, 
        style: { 
          marginTop: '60px',
          fontSize: '13px',
          padding: '8px 12px',
          minHeight: '40px',
          backgroundColor: '#3B82F6',
          color: 'white',
          fontWeight: 'bold',
          border: '2px solid #60A5FA',
          boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
        }
      });
      
             // Trigger smaller secondary bubble effect for second notification
       setTimeout(() => {
         for (let k = 0; k < 8; k++) {
           setTimeout(() => {
             const angle = Math.random() * 2 * Math.PI;
             const distance = 80 + Math.random() * 120;
             const startX = window.innerWidth / 2; // Center horizontally
             const startY = window.innerHeight - 100; // Bottom center
            
            let endX = startX + Math.cos(angle) * distance;
            let endY = startY + Math.sin(angle) * distance - 80;
            
            endX = Math.max(30, Math.min(window.innerWidth - 30, endX));
            endY = Math.max(30, Math.min(window.innerHeight - 30, endY));
            
            const bubbleId = Date.now().toString() + 'info' + k;
            const newBubble = { 
              id: bubbleId, 
              startX, 
              startY, 
              endX, 
              endY,
              size: 'small',
              duration: 1500 + Math.random() * 800,
              delay: k * 60
            };
            
            setFlyingBubbles(prev => [...prev, newBubble]);
            
            setTimeout(() => {
              setFlyingBubbles(prev => prev.filter(bubble => bubble.id !== bubbleId));
            }, newBubble.duration + newBubble.delay + 300);
          }, k * 100);
        }
      }, 200);
    }, 4200); // Show after first notification

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = "6285172157808";
    const message = encodeURIComponent("Halo, saya tertarik dengan layanan ID Card Lampung!");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleSocialMediaClick = (platform: string, text: string, url?: string) => {
    if (url) {
      window.open(url, '_blank');
      return;
    }

    switch (platform.toLowerCase()) {
      case 'instagram':
        window.open('https://instagram.com/idcard_lampung', '_blank');
        break;
      case 'instagram2':
        window.open('https://instagram.com/tidurlah_grafika', '_blank');
        break;
      case 'facebook':
        window.open('https://www.facebook.com/idcardlampung', '_blank');
        break;
      case 'tiktok':
        window.open('https://tiktok.com/@idcard_lampung', '_blank');
        break;
      case 'maps':
        window.open('https://g.co/kgs/a8JYPWq', '_blank');
        break;
      default:
        break;
    }
  };

  const cards = [
    // Welcome Card
    {
      id: 'welcome',
      title: 'ID Card Lampung',
      subtitle: 'Premium Quality',
      icon: <CreditCard className="h-6 w-6" />,
      gradient: 'from-blue-600 via-purple-600 to-blue-800',
      content: (
        <div className="text-center text-white h-full flex flex-col justify-center px-4">
          <div className="mb-6">
            <img 
              src="/product-image/Logo Tidurlah Grafika 1x1 outlined.png" 
              alt="Logo" 
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 p-2"
            />
            <h2 className="text-xl font-bold mb-3">{data.content.title}</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              {data.content.h1.substring(0, 150)}...
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 text-sm mx-auto">
            Swipe untuk layanan →
          </Badge>
        </div>
      )
    },
    // WhatsApp Card
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Chat Langsung',
      icon: <MessageCircle className="h-6 w-6" />,
      gradient: 'from-green-500 via-green-600 to-emerald-700',
      content: (
        <div className="text-center text-white h-full flex flex-col justify-center px-4">
          <div className="mb-6">
            <Phone className="h-16 w-16 mx-auto mb-4 text-white" />
            <h3 className="text-xl font-bold mb-3">{data.content.cta}</h3>
            <p className="text-green-100 text-base mb-6">+62 851-7215-7808</p>
          </div>
          <Button 
            onClick={handleWhatsAppClick}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm py-3"
            size="lg"
          >
            <Phone className="mr-2 h-5 w-5" />
            Chat WhatsApp
          </Button>
        </div>
      )
    },
    // Pricelist Card
    {
      id: 'pricelist',
      title: 'Pricelist',
      subtitle: 'Daftar Harga',
      icon: <ExternalLink className="h-6 w-6" />,
      gradient: 'from-orange-500 via-red-500 to-orange-700',
      content: (
        <div className="text-center text-white h-full flex flex-col justify-center px-4">
          <div className="mb-6">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-white" />
            <h3 className="text-xl font-bold mb-3">Lihat Harga</h3>
            <p className="text-orange-100 text-base mb-6">Cek semua layanan dan harga terbaru</p>
          </div>
          <Button 
            onClick={() => window.open(data.buttons.contact.pricelist.url, '_blank')}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm py-3"
            size="lg"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Buka Pricelist
          </Button>
        </div>
      )
    },
    // Instagram Card
    {
      id: 'instagram',
      title: 'Instagram',
      subtitle: '@idcard_lampung',
      icon: <Instagram className="h-6 w-6" />,
      gradient: 'from-pink-500 via-purple-500 to-pink-700',
      content: (
        <div className="text-center text-white h-full flex flex-col justify-center px-4">
          <div className="mb-6">
            <Instagram className="h-16 w-16 mx-auto mb-4 text-white" />
            <h3 className="text-xl font-bold mb-3">Follow Instagram</h3>
            <p className="text-pink-100 text-base mb-6">Follow kedua akun Instagram kami</p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={() => handleSocialMediaClick('instagram', '@idcard_lampung')}
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm py-2"
              size="sm"
            >
              <Instagram className="mr-2 h-4 w-4" />
              @idcard_lampung
            </Button>
            <Button 
              onClick={() => handleSocialMediaClick('instagram2', '@tidurlah_grafika')}
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm py-2"
              size="sm"
            >
              <Instagram className="mr-2 h-4 w-4" />
              @tidurlah_grafika
            </Button>
          </div>
        </div>
      )
    },
    // Facebook Card
    {
      id: 'facebook',
      title: 'Facebook',
      subtitle: 'ID Card Lampung',
      icon: <Facebook className="h-6 w-6" />,
      gradient: 'from-blue-500 via-blue-600 to-blue-800',
      content: (
        <div className="text-center text-white h-full flex flex-col justify-center px-4">
          <div className="mb-6">
            <Facebook className="h-16 w-16 mx-auto mb-4 text-white" />
            <h3 className="text-xl font-bold mb-3">Like Facebook</h3>
            <p className="text-blue-100 text-base mb-6">ID Card Lampung</p>
          </div>
          <Button 
            onClick={() => handleSocialMediaClick('facebook', 'ID Card Lampung')}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm py-3"
            size="lg"
          >
            <Facebook className="mr-2 h-5 w-5" />
            Like Facebook
          </Button>
        </div>
      )
    },
    // TikTok Card
    {
      id: 'tiktok',
      title: 'TikTok',
      subtitle: '@idcard_lampung',
      icon: <div className="h-6 w-6 bg-white rounded-sm flex items-center justify-center">
        <span className="text-black text-sm font-bold">T</span>
      </div>,
      gradient: 'from-gray-800 via-black to-gray-900',
      content: (
        <div className="text-center text-white h-full flex flex-col justify-center px-4">
          <div className="mb-6">
            <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-black text-3xl font-bold">T</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Follow TikTok</h3>
            <p className="text-gray-100 text-base mb-6">@idcard_lampung</p>
          </div>
          <Button 
            onClick={() => handleSocialMediaClick('tiktok', '@idcard_lampung')}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm py-3"
            size="lg"
          >
            Follow TikTok
          </Button>
        </div>
      )
    },
    // Google Maps Card
    {
      id: 'maps',
      title: 'Location',
      subtitle: 'Google Maps',
      icon: <Map className="h-6 w-6" />,
      gradient: 'from-red-500 via-red-600 to-red-700',
      content: (
        <div className="text-center text-white h-full flex flex-col justify-center px-4">
          <div className="mb-6">
            <Map className="h-16 w-16 mx-auto mb-4 text-white" />
            <h3 className="text-xl font-bold mb-3">Find Us</h3>
            <p className="text-red-100 text-base mb-6">Lokasi toko kami</p>
          </div>
          <Button 
            onClick={() => handleSocialMediaClick('maps', 'Google Maps')}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm py-3"
            size="lg"
          >
            <Map className="mr-2 h-5 w-5" />
            Open Maps
          </Button>
        </div>
      )
    },
    // Privacy Card
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Data Protection',
      icon: <Users className="h-6 w-6" />,
      gradient: 'from-slate-600 via-gray-700 to-slate-800',
      content: (
        <div className="text-white text-center h-full flex flex-col justify-center px-4">
          <div className="mb-6">
            <Users className="h-16 w-16 mx-auto mb-4 text-white" />
            <h3 className="text-xl font-bold mb-3">Kebijakan Privasi</h3>
            <p className="text-gray-200 text-sm leading-relaxed mb-6">
              {data.footer.disclaimer.content.substring(0, 120)}...
            </p>
          </div>
          <Button 
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm py-3"
            size="lg"
          >
            Baca Selengkapnya
          </Button>
        </div>
      )
    }
  ];

  // Generate consistent stack positions
  const getStackPosition = (index: number) => {
    const rotations = [-6, -3, 3, 6, -4, 4, -2, 2];
    const xOffsets = [-12, -6, 6, 12, -8, 8, -4, 4];
    const yOffsets = [4, 6, 8, 10, 5, 7, 3, 9];
    
    return {
      rotate: rotations[index % rotations.length],
      x: xOffsets[index % xOffsets.length],
      y: yOffsets[index % yOffsets.length]
    };
  };

  const morphVariants = {
    initial: {
      scale: 0,
      rotate: -360,
      opacity: 0,
      borderRadius: "50%",
      y: 100,
      z: -500,
      rotateX: -90,
      rotateY: -180
    },
    animate: {
      scale: [0, 1.2, 1],
      rotate: [0, 15, 0],
      opacity: [0, 0.8, 1],
      borderRadius: ["50%", "25%", "12px"],
      y: [100, -20, 0],
      z: [-500, 100, 0],
      rotateX: [-90, 15, 0],
      rotateY: [-180, -10, 0]
    }
  };

  // Enhanced 3D Card Variants with visible Z-axis emergence
  const cardVariants = {
    enter: ({ cardIndex }: { cardIndex: number }) => {
      // Enter from stack position (same as background cards for continuity)
      const stackPos = getStackPosition(0); // Use first stack position
      return {
        scale: 0.85, // Start from stack scale, not 0
        opacity: 0.7, // Start from stack opacity, not 0
        z: -120, // Start from stack depth
        y: 20, // Start from stack position
        rotate: stackPos.rotate,
        x: stackPos.x,
        rotateX: 0,
        rotateY: 0,
        zIndex: 30
      };
    },
    center: {
      zIndex: 40,
      scale: [0.85, 1.05, 1], // Smooth emergence with slight overshoot
      opacity: [0.7, 0.9, 1],
      z: [-120, 20, 0], // Emerge from stack depth
      rotateX: 0,
      rotateY: 0,
      rotate: 0,
      x: 0,
      y: 0
    },
    exit: ({ direction }: { direction: number }) => ({
      // Card flies in SAME direction as hand swipe
      zIndex: 0,
      scale: 0.5,
      opacity: 0,
      z: -300,
      x: direction > 0 ? -800 : 800,  // FIXED: direction > 0 = swipe left, card goes left
      y: direction > 0 ? -400 : 400,  // diagonal movement
      rotateX: direction > 0 ? -20 : 20,
      rotateY: direction > 0 ? -30 : 30,
      rotateZ: direction > 0 ? -15 : 15,
      rotate: direction > 0 ? -25 : 25
    })
  };

  // Enhanced stacked card animations with entrance effects
  const stackedCardVariants = {
    hidden: {
      scale: 0.3,
      opacity: 0,
      z: -1000,
      y: 200,
      rotate: 0,
      x: 0,
      zIndex: 0,
      rotateX: -60,
      rotateY: 45
    },
    visible: (index: number) => {
      const pos = getStackPosition(index);
      return {
        scale: [0.3, 0.95 - (index * 0.05), 0.85 - (index * 0.05)],
        opacity: [0, 0.9 - (index * 0.15), 0.7 - (index * 0.15)],
        z: [-1000, -60 - (index * 40), -80 - (index * 40)],
        y: [200, 10 + (index * 12), 20 + (index * 12)],
        rotate: [0, pos.rotate * 1.5, pos.rotate],
        x: [0, pos.x * 1.2, pos.x],
        zIndex: 30 - index,
        rotateX: [-60, 10, 0],
        rotateY: [45, -5, 0]
      };
    }
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const [direction, setDirection] = useState(0);

  // Get next card in proper sequence (simplified)
  const getNextCard = (current: number) => {
    return current === cards.length - 1 ? 0 : current + 1;
  };

  // Get previous card in proper sequence
  const getPrevCard = (current: number) => {
    return current === 0 ? cards.length - 1 : current - 1;
  };

  // Get cards in proper order for stacking
  const getCardStack = (current: number) => {
    const stack = [];
    for (let i = 1; i <= 3; i++) {
      const nextIndex = (current + i) % cards.length;
      stack.push(nextIndex);
    }
    return stack;
  };

  const paginate = (swipeDirection: number) => {
    setDirection(swipeDirection);
    // Both left and right swipes show next card
    setCurrentCard(prev => getNextCard(prev));
  };

  const cardStack = getCardStack(currentCard);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background particles for entrance */}
      {!isLoaded && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0],
                y: [0, -100, -200],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
        {/* 3D Card Container with enhanced perspective */}
        <motion.div 
          className="relative w-80 h-[500px] mx-auto"
          style={{ 
            perspective: "1500px",
            perspectiveOrigin: "center center"
          }}
          variants={morphVariants}
          initial={!isLoaded ? "initial" : false}
          animate={isLoaded ? "animate" : "initial"}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.6, 1],
            delayChildren: 0.3,
            staggerChildren: 0.1
          }}
        >
          {/* Background Cards Stack - ALL emerge from Z-axis */}
          {cardStack.map((cardIndex, stackIndex) => (
            <motion.div
              key={`stack-${cardIndex}-${currentCard}`}
              variants={stackedCardVariants}
              initial="hidden"
              animate="visible"
              custom={stackIndex}
                             transition={{
                 duration: 0.6,
                 delay: isLoaded ? (stackIndex * 0.1) : (0.6 + stackIndex * 0.15),
                 ease: [0.22, 1, 0.36, 1],
                 times: [0, 0.7, 1]
               }}
              className="absolute inset-0"
              style={{ 
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden"
              }}
            >
              <Card className={`w-full h-full bg-gradient-to-br ${cards[cardIndex].gradient} border-0 shadow-none`}>
                {/* Stacked Card Preview Content */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-2">
                      {cards[cardIndex].icon}
                      <div>
                        <h3 className="font-bold text-sm">{cards[cardIndex].title}</h3>
                        <p className="text-xs opacity-80">{cards[cardIndex].subtitle}</p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30 text-xs">
                      {cardIndex + 1}/{cards.length}
                    </Badge>
                  </div>
                </div>
                
                {/* Chip with depth */}
                <div className="absolute top-20 left-4 w-10 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-md opacity-80"></div>
                
                {/* Pattern */}
                <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10">
                  <div className="w-full h-full bg-gradient-to-tl from-white/30 to-transparent rounded-tl-full"></div>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Active Card with fast animations */}
          <AnimatePresence initial={false} custom={{ direction, cardIndex: currentCard }} mode="wait">
            <motion.div
              key={`active-${currentCard}-${direction}`}
              custom={{ direction, cardIndex: currentCard }}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                times: [0, 0.6, 1]
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
                             onDragEnd={(e, { offset, velocity }) => {
                 const swipe = swipePower(offset.x, velocity.x);

                 if (swipe < -swipeConfidenceThreshold) {
                   paginate(1); // swipe left = next card
                 } else if (swipe > swipeConfidenceThreshold) {
                   paginate(-1); // swipe right = next card
                 }
               }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{ 
                zIndex: 50,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden"
              }}
            >
              <Card className={`w-full h-full bg-gradient-to-br ${cards[currentCard].gradient} border-0 shadow-none overflow-hidden`}>
                {/* Card Header */}
                <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/20 to-transparent">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                      {cards[currentCard].icon}
                      <div>
                        <h3 className="font-bold text-lg">{cards[currentCard].title}</h3>
                        <p className="text-sm opacity-80">{cards[currentCard].subtitle}</p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {currentCard + 1}/{cards.length}
                    </Badge>
                  </div>
                </div>

                {/* Card Content */}
                <div className="absolute inset-0 pt-20 pb-6">
                  {cards[currentCard].content}
                </div>

                {/* 3D Card Chip */}
                <div className="absolute top-24 left-6 w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-md opacity-90 transform-gpu"></div>

                {/* Card Pattern with depth */}
                <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
                  <div className="w-full h-full bg-gradient-to-tl from-white/30 to-transparent rounded-tl-full"></div>
                </div>

                {/* Card Brand */}
                <div className="absolute bottom-6 right-6 text-white/20 text-xs font-bold tracking-wider">
                  TIDURLAH
                </div>


              </Card>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.6 }}
          className="flex items-center justify-center mt-8"
        >
          {/* Dots Indicator with improved styling */}
          <div className="flex space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
            {cards.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  const newDirection = index > currentCard ? 1 : -1;
                  setDirection(newDirection);
                  setCurrentCard(index);
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentCard 
                    ? 'bg-white shadow-lg shadow-white/30' 
                    : 'bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Instructions */}
        <SwipeTutorial isLoaded={isLoaded} currentCard={currentCard} totalCards={cards.length} />
      </div>

      {/* Enhanced Flying Bubbles with Size Variations */}
      {flyingBubbles.map((bubble) => {
        const sizeClass = bubble.size === 'large' ? 'w-4 h-4' : 
                         bubble.size === 'medium' ? 'w-3 h-3' : 'w-2 h-2';
        const glowIntensity = bubble.size === 'large' ? '0 0 12px rgba(59, 130, 246, 0.6)' :
                             bubble.size === 'medium' ? '0 0 8px rgba(59, 130, 246, 0.5)' : 
                             '0 0 6px rgba(59, 130, 246, 0.4)';
        
        return (
          <motion.div
            key={bubble.id}
            className={`absolute rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 ${sizeClass} opacity-70`}
            initial={{
              x: bubble.startX,
              y: bubble.startY,
              scale: 0,
              opacity: 0
            }}
            animate={{
              x: bubble.endX,
              y: bubble.endY,
              scale: [0, 1.2, 1, 0.8, 0],
              opacity: [0, 0.8, 0.9, 0.6, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: (bubble.duration || 1200) / 1000,
              delay: (bubble.delay || 0) / 1000,
              ease: "easeOut",
              times: [0, 0.2, 0.5, 0.8, 1]
            }}
            style={{
              boxShadow: glowIntensity,
              background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.9))`,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(1px)'
            }}
          >
            {/* Inner shine effect for realistic bubble look */}
            <div 
              className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/80 rounded-full"
              style={{
                transform: 'scale(0.5)',
                filter: 'blur(0.5px)'
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default IDCardLampung; 