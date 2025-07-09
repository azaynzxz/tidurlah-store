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


const IDCardLampung = () => {
  const data = micrositeData;
  const [currentCard, setCurrentCard] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flyingBubbles, setFlyingBubbles] = useState<Array<{id: string, startX: number, startY: number, endX: number, endY: number}>>([]);

  // Flying animation function
  const triggerFlyingAnimation = (sourceElement?: HTMLElement) => {
    // Get source position (product location)
    let startX = window.innerWidth / 2; // Default to center
    let startY = window.innerHeight / 2;
    
    if (sourceElement) {
      const rect = sourceElement.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }
    
    // Create spectacular bubble burst with ULTRA-WIDE SPREAD! 🎉✨
    const bubbleCount = 20; // More bubbles for fuller coverage
    const bubblesToCreate = [];
    
    // Calculate MAXIMUM spread - use full screen dimensions for epic effect
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const maxSpread = Math.max(screenWidth, screenHeight) * 0.95; // 95% of larger dimension!
    const minSpread = Math.min(screenWidth, screenHeight) * 0.4; // 40% for inner ring
    
    // Generate all bubble data with ULTRA-WIDE spread
    for (let i = 0; i < bubbleCount; i++) {
      const angle = (i / bubbleCount) * 2 * Math.PI; // Perfect circular distribution
      
      // Create varied spread distances for epic coverage
      const baseRadius = minSpread + Math.random() * (maxSpread - minSpread);
      const radiusVariation = (Math.random() - 0.5) * 200; // More randomness for natural look
      const finalRadius = baseRadius + radiusVariation;
      
      // Calculate end positions with ULTRA-WIDE spread
      const endX = startX + Math.cos(angle) * finalRadius + (Math.random() - 0.5) * 250;
      const endY = startY + Math.sin(angle) * finalRadius + (Math.random() - 0.5) * 250;
      
      // Ensure bubbles stay within screen bounds with minimal padding
      const padding = 20;
      const clampedEndX = Math.max(padding, Math.min(screenWidth - padding, endX));
      const clampedEndY = Math.max(padding, Math.min(screenHeight - padding, endY));
      
      bubblesToCreate.push({
        id: Date.now().toString() + i,
        startX,
        startY,
        endX: clampedEndX,
        endY: clampedEndY
      });
    }
    
    // Create ALL bubbles simultaneously for instant spectacular effect!
    setFlyingBubbles(prev => [...prev, ...bubblesToCreate]);
    
    // Remove all bubbles after animation completes
    setTimeout(() => {
      setFlyingBubbles(prev => 
        prev.filter(bubble => !bubblesToCreate.some(created => created.id === bubble.id))
      );
    }, 1300); // Match CSS animation duration
  };

  // Show intro notifications on component mount
  useEffect(() => {
    // First notification - Welcome
    const welcomeTimer = setTimeout(() => {
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
    const swipeTimer = setTimeout(() => {
      toast.info("👆 Geser kartu untuk melihat info lainnya", { 
        position: 'top-center', 
        duration: 4000, 
        style: { 
          marginTop: '60px',
          fontSize: '13px',
          padding: '8px 12px',
          minHeight: '38px',
          backgroundColor: '#3B82F6',
          color: 'white',
          fontWeight: '500',
          border: '2px solid #60A5FA',
          boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
        }
      });
    }, 4000); // Show 3.5 seconds after welcome

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(swipeTimer);
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


      </div>

      {/* Flying Bubbles */}
      {flyingBubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="flying-bubble"
          style={{
            left: bubble.startX,
            top: bubble.startY,
            '--end-x': `${bubble.endX}px`,
            '--end-y': `${bubble.endY}px`,
            '--start-x': `${bubble.startX}px`,
            '--start-y': `${bubble.startY}px`,
          } as React.CSSProperties & {
            '--end-x': string;
            '--end-y': string;
            '--start-x': string;
            '--start-y': string;
          }}
        />
      ))}
    </div>
  );
};

export default IDCardLampung; 