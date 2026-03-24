import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ChatBot from "@/components/ChatBot";
import { AnimatedElement, StaggeredContainer } from "@/components/animations/AnimatedElement";
import { Image as ImageIcon, Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  id: number;
  src: string;
  title: string;
  category: string;
  description?: string;
}

const Katalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [imageHeights, setImageHeights] = useState<Record<number, number>>({});
  const [linkCopied, setLinkCopied] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Load images from JSON file
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/katalog.json');
        const data = await response.json();
        setGalleryImages(data.images || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch katalog images:", error);
        toast.error("Gagal memuat katalog. Silakan coba lagi nanti.", {
          position: 'top-center',
          style: { marginTop: '60px' }
        });
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  const categories = ["All", ...Array.from(new Set(galleryImages.map(img => img.category)))];
  const filteredImages = selectedCategory === "All"
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  // Handle URL parameter for deep linking
  useEffect(() => {
    const imageId = searchParams.get('image');
    const categoryParam = searchParams.get('category');

    // Set category from URL if present
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }

    // Open image modal if image ID is in URL
    if (imageId) {
      const id = parseInt(imageId, 10);
      const image = galleryImages.find(img => img.id === id);
      if (image) {
        setSelectedImage(id);
        // Also set category if not already set from URL
        if (!categoryParam) {
          setSelectedCategory(image.category);
        }
      }
    }
  }, [searchParams, categories]);

  // Update URL when image is selected
  const handleImageClick = (imageId: number) => {
    setSelectedImage(imageId);
    const image = galleryImages.find(img => img.id === imageId);
    if (image) {
      setSearchParams({ image: imageId.toString(), category: image.category });
    }
  };

  // Handle closing modal and clearing URL
  const handleCloseModal = () => {
    setSelectedImage(null);
    setSearchParams({});
  };

  // Generate shareable link
  const generateShareLink = (imageId: number) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/katalog?image=${imageId}`;
  };

  // Share functionality
  const handleShare = async (imageId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const shareUrl = generateShareLink(imageId);
    const image = galleryImages.find(img => img.id === imageId);

    if (navigator.share) {
      try {
        await navigator.share({
          title: image?.title || 'Katalog Desain',
          text: `Lihat desain ${image?.title} di TIDURLAH STORE`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success("Link berhasil disalin!", {
        position: 'top-center',
        style: { marginTop: '60px' },
        duration: 2000
      });
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Measure images and calculate heights for masonry layout
  useEffect(() => {
    const measureImages = () => {
      const heights: Record<number, number> = {};
      filteredImages.forEach((image) => {
        const img = new window.Image();
        img.onload = () => {
          const aspectRatio = img.height / img.width;
          // Calculate height based on column width (approximately 250px on mobile, 300px on desktop)
          const columnWidth = window.innerWidth < 768 ? 150 : window.innerWidth < 1024 ? 200 : 250;
          const calculatedHeight = columnWidth * aspectRatio;
          heights[image.id] = calculatedHeight;
          setImageHeights((prev) => ({ ...prev, ...heights }));
        };
        img.src = image.src;
        // Fallback to placeholder if main image fails
        img.onerror = () => {
          const placeholderUrl = `https://placehold.co/300x400/FF5E01/FFFFFF?text=${encodeURIComponent(image.title)}`;
          img.src = placeholderUrl;
        };
      });
    };

    measureImages();
  }, [filteredImages]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex flex-col page-transition">
      {/* Universal Header */}
      <Header
        cartItemsCount={0}
        onCartClick={() => window.location.href = '/'}
        onSearch={() => { }}
        showSearch={false}
      />

      {/* Main Content */}
      <div className="flex-1 py-8 px-2 flex flex-col">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent_50%)]" />

        {/* Header */}
        <AnimatedElement direction="up" delay={200} duration={300}>
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Katalog Desain
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              Lihat koleksi desain kami yang telah dibuat untuk berbagai kebutuhan
            </p>
          </header>
        </AnimatedElement>

        {/* Category Filter */}
        <AnimatedElement direction="up" delay={300} duration={300}>
          <div className="container max-w-7xl mx-auto mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    // Update URL when category changes (but keep image if selected)
                    const imageId = searchParams.get('image');
                    if (imageId) {
                      if (category === "All") {
                        setSearchParams({ image: imageId });
                      } else {
                        setSearchParams({ image: imageId, category });
                      }
                    } else {
                      if (category === "All") {
                        setSearchParams({});
                      } else {
                        setSearchParams({ category });
                      }
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === category
                    ? "bg-[#FF5E01] text-white shadow-md"
                    : "bg-white/60 backdrop-blur-sm text-foreground/80 border border-border/50 hover:bg-white/80"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </AnimatedElement>

        {/* Gallery Grid - Pinterest Style Masonry */}
        <AnimatedElement direction="up" delay={400} duration={300}>
          <div className="container max-w-7xl mx-auto flex-1 pb-8 flex flex-col min-h-[400px]">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5E01] mx-auto mb-4"></div>
                <p className="text-muted-foreground">Memuat katalog...</p>
              </div>
            ) : (
              <div
                ref={galleryRef}
                className="columns-2 md:columns-3 lg:columns-4"
                style={{
                  columnFill: 'balance',
                  columnGap: '1rem'
                }}
              >
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 mb-3 lg:mb-4 break-inside-avoid"
                    onClick={() => handleImageClick(image.id)}
                  >
                    {/* Image Container - Natural Aspect Ratio */}
                    <div className="relative w-full bg-gray-100">
                      <img
                        src={image.src}
                        alt={image.title}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Show placeholder if image doesn't exist
                          const target = e.target as HTMLImageElement;
                          const placeholderUrl = `https://placehold.co/300x400/FF5E01/FFFFFF?text=${encodeURIComponent(image.title)}`;
                          if (!target.src.includes('placehold.co')) {
                            target.src = placeholderUrl;
                          }
                        }}
                        onLoad={(e) => {
                          // Ensure image maintains aspect ratio
                          const target = e.target as HTMLImageElement;
                          target.style.height = 'auto';
                        }}
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                          <ImageIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      {/* Share button */}
                      <button
                        onClick={(e) => handleShare(image.id, e)}
                        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                        title="Bagikan desain"
                      >
                        <Share2 className="h-4 w-4 text-[#FF5E01]" />
                      </button>
                    </div>
                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">{image.title}</p>
                      <p className="text-white/70 text-xxs">{image.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredImages.length === 0 && (
              <div className="text-center py-12 flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Tidak ada desain ditemukan untuk kategori ini.</p>
              </div>
            )}
            {/* Spacer to push footer down when content is short */}
            <div className="flex-1 min-h-[300px]"></div>
          </div>
        </AnimatedElement>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(selectedImage, e);
                }}
                className="bg-white/90 hover:bg-white text-[#FF5E01] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                title="Bagikan link desain"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Bagikan
                  </>
                )}
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-white/90 hover:bg-white text-gray-700 transition-colors text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center"
                title="Tutup"
              >
                ×
              </button>
            </div>
            <img
              src={galleryImages.find(img => img.id === selectedImage)?.src || ""}
              alt={galleryImages.find(img => img.id === selectedImage)?.title || ""}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const image = galleryImages.find(img => img.id === selectedImage);
                if (image) {
                  const placeholderUrl = `https://placehold.co/600x800/FF5E01/FFFFFF?text=${encodeURIComponent(image.title)}`;
                  target.src = placeholderUrl;
                }
              }}
            />
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-bold">
                {galleryImages.find(img => img.id === selectedImage)?.title}
              </h3>
              <p className="text-white/70 text-sm">
                {galleryImages.find(img => img.id === selectedImage)?.category}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default Katalog;

