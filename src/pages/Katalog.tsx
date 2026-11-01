import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Image as ImageIcon, Share2, Check, ArrowUpRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/common/SEO";
import PublicHeader from "@/components/common/PublicHeader";
import { BetaFooter } from "@/components/beta/BetaFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SITE_ORIGIN } from "@/utils/productSeo";

interface GalleryImage {
  id: number;
  src: string;
  title: string;
  category: string;
  description?: string;
}

export default function Katalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [linkCopied, setLinkCopied] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch images from katalog.json
  useEffect(() => {
    let isMounted = true;
    const fetchImages = async () => {
      try {
        const response = await fetch("/katalog.json");
        const data = await response.json();
        if (isMounted) {
          setGalleryImages(data.images || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Gagal memuat katalog:", error);
        toast.error("Gagal memuat katalog gambar. Silakan coba lagi.");
        if (isMounted) setIsLoading(false);
      }
    };
    fetchImages();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(galleryImages.map((img) => img.category)))],
    [galleryImages]
  );

  const filteredImages =
    selectedCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  // Synchronize URL search params with state
  useEffect(() => {
    const imageParam = searchParams.get("image");
    const categoryParam = searchParams.get("category");

    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }

    if (imageParam && galleryImages.length > 0) {
      const id = parseInt(imageParam, 10);
      const exists = galleryImages.some((img) => img.id === id);
      if (exists) {
        setSelectedImageId(id);
      }
    }
  }, [searchParams, galleryImages, categories]);

  const handleImageClick = (id: number) => {
    setSelectedImageId(id);
    const img = galleryImages.find((item) => item.id === id);
    if (img) {
      setSearchParams({ image: id.toString(), category: img.category });
    }
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      setSelectedImageId(null);
      if (selectedCategory !== "All") {
        setSearchParams({ category: selectedCategory });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleShare = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = `${SITE_ORIGIN}/katalog?image=${id}`;
    const img = galleryImages.find((item) => item.id === id);

    if (navigator.share) {
      try {
        await navigator.share({
          title: img?.title || "Katalog Desain Tidurlah Grafika",
          text: `Inspirasi desain: ${img?.title} di Tidurlah Store`,
          url: shareUrl,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        toast.success("Link desain berhasil disalin ke clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      } catch {
        toast.error("Gagal menyalin link.");
      }
    }
  };

  const activeImage = galleryImages.find((img) => img.id === selectedImageId);
  const pageUrl = `${SITE_ORIGIN}/katalog`;

  const jsonLdGallery = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Katalog Desain & Portofolio Karya - Tidurlah Grafika",
    description: "Koleksi portofolio desain kartu identitas PVC, lanyard sublimasi, plakat akrilik, dan merchandise kustom.",
    url: pageUrl,
    hasPart: filteredImages.slice(0, 12).map((img) => ({
      "@type": "ImageObject",
      name: img.title,
      contentUrl: `${SITE_ORIGIN}${img.src}`,
      caption: img.category,
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      <SEO
        title="Katalog Desain & Portofolio Karya Cetak"
        description="Jelajahi inspirasi portofolio desain ID Card, tali lanyard sublimasi, stiker, plakat akrilik, dan merchandise resmi karya Tidurlah Grafika."
        keywords="katalog desain id card, contoh lanyard lampung, portofolio percetakan, desain plakat akrilik bandar lampung"
        url={pageUrl}
        jsonLd={jsonLdGallery}
      />

      {/* Shared Clean Navigation Header */}
      <PublicHeader sectionName="Katalog" sectionHref="/katalog" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        
        {/* Header & Description */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Badge variant="outline" className="text-xs font-mono font-medium">
              Galeri Portofolio
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {isLoading ? "Memuat..." : `${filteredImages.length} Desain`}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Katalog Desain & Karya Produksi
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Kumpulan referensi dan hasil cetak ID Card PVC, tali lanyard sublimasi, banner, serta merchandise kustom yang telah kami selesaikan untuk berbagai instansi dan komunitas.
          </p>
        </div>

        {/* Category Filters Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Button
                key={cat}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategorySelect(cat)}
                className="h-8 text-xs rounded-md transition-colors"
              >
                {cat}
              </Button>
            );
          })}
        </div>

        {/* Masonry Grid */}
        {isLoading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-muted/40 animate-pulse break-inside-avoid"
                style={{ height: `${180 + (i % 3) * 60}px` }}
              />
            ))}
          </div>
        ) : filteredImages.length > 0 ? (
          <div
            className="columns-2 sm:columns-3 lg:columns-4 gap-4"
            style={{ columnFill: "balance" }}
          >
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => handleImageClick(image.id)}
                className="group relative mb-4 break-inside-avoid rounded-lg border border-border bg-card overflow-hidden cursor-pointer hover:border-foreground/40 transition-all duration-200"
              >
                {/* Image View */}
                <div className="relative w-full bg-muted/20">
                  <img
                    src={image.src}
                    alt={image.title}
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("web-preview.jpg")) {
                        target.src = "/product-image/web-preview.jpg";
                      }
                    }}
                  />
                  {/* Share button overlay */}
                  <button
                    type="button"
                    onClick={(e) => handleShare(image.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-background/90 text-foreground border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    title="Bagikan tautan desain"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Caption Bar */}
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-xs text-foreground truncate group-hover:underline">
                      {image.title}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 font-normal">
                      {image.category}
                    </Badge>
                  </div>
                  {image.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {image.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="rounded-lg border border-border bg-card p-12 text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                Tidak Ada Desain Ditemukan
              </h3>
              <p className="text-xs text-muted-foreground">
                Tidak ada portofolio yang cocok dengan kategori &quot;{selectedCategory}&quot;.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCategorySelect("All")}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tampilkan Semua Desain</span>
            </Button>
          </div>
        )}

      </main>

      {/* Detail Dialog Modal (Shadcn Dialog) */}
      <Dialog
        open={selectedImageId !== null}
        onOpenChange={handleCloseDialog}
      >
        <DialogContent className="max-w-3xl p-5 space-y-4">
          {activeImage && (
            <>
              <DialogHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {activeImage.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: #{activeImage.id}
                  </span>
                </div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {activeImage.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {activeImage.description || "Inspirasi portofolio desain dari Tidurlah Grafika."}
                </DialogDescription>
              </DialogHeader>

              {/* Full Image Preview */}
              <div className="rounded-lg border border-border bg-muted/20 overflow-hidden flex items-center justify-center p-2 max-h-[60vh]">
                <img
                  src={activeImage.src}
                  alt={activeImage.title}
                  className="max-h-[55vh] w-auto object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("web-preview.jpg")) {
                      target.src = "/product-image/web-preview.jpg";
                    }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(activeImage.id)}
                  className="w-full sm:w-auto text-xs gap-1.5"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-foreground" />
                      <span>Link Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Bagikan Tautan</span>
                    </>
                  )}
                </Button>

                <a
                  href={`https://wa.me/6285172157808?text=Halo%20Tidurlah%20Grafika,%20saya%20tertarik%20dengan%20desain%20${encodeURIComponent(
                    activeImage.title
                  )}%20(Kategori:%20${encodeURIComponent(activeImage.category)})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
                >
                  <span>Pesan Desain Ini via WhatsApp</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Standard Minimalist Footer */}
      <BetaFooter />
    </div>
  );
}
