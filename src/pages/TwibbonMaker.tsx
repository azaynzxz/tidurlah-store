import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, ZoomIn, ZoomOut, RotateCcw, Download, X } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;

const TwibbonMaker = () => {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lastTouchDistanceRef = useRef<number | null>(null);
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null);
  const initialScaleRef = useRef<number>(1.0);

  // Load overlay image on mount
  useEffect(() => {
    const overlay = new Image();
    overlay.crossOrigin = "anonymous";
    overlay.onload = () => {
      setOverlayImage(overlay);
    };
    overlay.onerror = () => {
      toast.error("Gagal memuat overlay Twibbon", { position: 'top-center', style: { marginTop: '60px' } });
    };
    overlay.src = "/twibbon/Twibbon.png";
  }, []);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw user uploaded image if available
    if (uploadedImage) {
      ctx.save();
      ctx.translate(imagePosition.x + CANVAS_WIDTH / 2, imagePosition.y + CANVAS_HEIGHT / 2);
      ctx.scale(scale, scale);

      const scaledWidth = uploadedImage.width * scale;
      const scaledHeight = uploadedImage.height * scale;

      ctx.drawImage(
        uploadedImage,
        -scaledWidth / 2,
        -scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );
      ctx.restore();
    }

    // Draw overlay on top
    if (overlayImage) {
      ctx.drawImage(overlayImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, [uploadedImage, overlayImage, imagePosition, scale]);

  // Update canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar", { position: 'top-center', style: { marginTop: '60px' } });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        // Auto-scale to match canvas width
        const autoScale = CANVAS_WIDTH / img.width;
        // Constrain to min/max scale limits
        const constrainedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, autoScale));
        setScale(constrainedScale);
        // Reset position to center
        setImagePosition({ x: 0, y: 0 });
        toast.success("Foto berhasil diunggah", { position: 'top-center', style: { marginTop: '60px' } });
      };
      img.onerror = () => {
        toast.error("Gagal memuat gambar", { position: 'top-center', style: { marginTop: '60px' } });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Constrain image position to stay within bounds
  const constrainPosition = useCallback((x: number, y: number, currentScale: number) => {
    if (!uploadedImage) return { x: 0, y: 0 };

    const scaledWidth = uploadedImage.width * currentScale;
    const scaledHeight = uploadedImage.height * currentScale;

    const maxX = CANVAS_WIDTH / 2 + scaledWidth / 2;
    const minX = CANVAS_WIDTH / 2 - scaledWidth / 2;
    const maxY = CANVAS_HEIGHT / 2 + scaledHeight / 2;
    const minY = CANVAS_HEIGHT / 2 - scaledHeight / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  }, [uploadedImage]);

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return;

    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const x = (e.clientX - rect.left) * scaleX - CANVAS_WIDTH / 2;
    const y = (e.clientY - rect.top) * scaleY - CANVAS_HEIGHT / 2;

    setDragStart({ x: x - imagePosition.x, y: y - imagePosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !uploadedImage) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const x = (e.clientX - rect.left) * scaleX - CANVAS_WIDTH / 2;
    const y = (e.clientY - rect.top) * scaleY - CANVAS_HEIGHT / 2;

    const newPos = constrainPosition(x - dragStart.x, y - dragStart.y, scale);
    setImagePosition(newPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return;

    if (e.touches.length === 1) {
      // Single touch - drag
      setIsDragging(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;

      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) * scaleX - CANVAS_WIDTH / 2;
      const y = (touch.clientY - rect.top) * scaleY - CANVAS_HEIGHT / 2;

      setDragStart({ x: x - imagePosition.x, y: y - imagePosition.y });
      lastTouchDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      lastTouchDistanceRef.current = distance;
      initialScaleRef.current = scale;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;

        const centerX = ((touch1.clientX + touch2.clientX) / 2 - rect.left) * scaleX - CANVAS_WIDTH / 2;
        const centerY = ((touch1.clientY + touch2.clientY) / 2 - rect.top) * scaleY - CANVAS_HEIGHT / 2;
        lastTouchCenterRef.current = { x: centerX, y: centerY };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return;

    if (e.touches.length === 1 && isDragging) {
      // Single touch - drag
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;

      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) * scaleX - CANVAS_WIDTH / 2;
      const y = (touch.clientY - rect.top) * scaleY - CANVAS_HEIGHT / 2;

      const newPos = constrainPosition(x - dragStart.x, y - dragStart.y, scale);
      setImagePosition(newPos);
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastTouchDistanceRef.current !== null) {
        const scaleChange = distance / lastTouchDistanceRef.current;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, initialScaleRef.current * scaleChange));
        setScale(newScale);

        // Adjust position to keep zoom centered
        if (lastTouchCenterRef.current) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const scaleX = CANVAS_WIDTH / rect.width;
            const scaleY = CANVAS_HEIGHT / rect.height;

            const centerX = ((touch1.clientX + touch2.clientX) / 2 - rect.left) * scaleX - CANVAS_WIDTH / 2;
            const centerY = ((touch1.clientY + touch2.clientY) / 2 - rect.top) * scaleY - CANVAS_HEIGHT / 2;

            const scaleRatio = newScale / initialScaleRef.current;
            const offsetX = centerX - lastTouchCenterRef.current.x;
            const offsetY = centerY - lastTouchCenterRef.current.y;

            const newPos = constrainPosition(
              imagePosition.x - offsetX * (1 - scaleRatio),
              imagePosition.y - offsetY * (1 - scaleRatio),
              newScale
            );
            setImagePosition(newPos);
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistanceRef.current = null;
    lastTouchCenterRef.current = null;
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return;

    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * delta));

    if (newScale !== scale) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;

        const x = (e.clientX - rect.left) * scaleX - CANVAS_WIDTH / 2;
        const y = (e.clientY - rect.top) * scaleY - CANVAS_HEIGHT / 2;

        const scaleRatio = newScale / scale;
        const offsetX = x - imagePosition.x;
        const offsetY = y - imagePosition.y;

        const newPos = constrainPosition(
          imagePosition.x - offsetX * (1 - scaleRatio),
          imagePosition.y - offsetY * (1 - scaleRatio),
          newScale
        );
        setImagePosition(newPos);
        setScale(newScale);
      }
    }
  };

  // Reset image
  const handleReset = () => {
    setImagePosition({ x: 0, y: 0 });
    setScale(1.0);
    toast.success("Posisi dan zoom direset", { position: 'top-center', style: { marginTop: '60px' } });
  };

  // Zoom controls
  const handleZoomIn = () => {
    const newScale = Math.min(MAX_SCALE, scale * 1.2);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(MIN_SCALE, scale * 0.8);
    setScale(newScale);
  };

  // Download final image
  const handleDownload = async () => {
    if (!uploadedImage || !overlayImage) {
      toast.error("Silakan unggah foto terlebih dahulu", { position: 'top-center', style: { marginTop: '60px' } });
      return;
    }

    setIsLoading(true);

    try {
      // Create a temporary canvas for export
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = CANVAS_WIDTH;
      exportCanvas.height = CANVAS_HEIGHT;
      const ctx = exportCanvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Draw user image
      ctx.save();
      ctx.translate(imagePosition.x + CANVAS_WIDTH / 2, imagePosition.y + CANVAS_HEIGHT / 2);
      ctx.scale(scale, scale);

      const scaledWidth = uploadedImage.width * scale;
      const scaledHeight = uploadedImage.height * scale;

      ctx.drawImage(
        uploadedImage,
        -scaledWidth / 2,
        -scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );
      ctx.restore();

      // Draw overlay
      ctx.drawImage(overlayImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Convert to blob and download
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Failed to create blob");
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `twibbon-hut-3-id-card-lampung-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Gambar berhasil diunduh", { position: 'top-center', style: { marginTop: '60px' } });
      }, "image/png");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal mengunduh gambar", { position: 'top-center', style: { marginTop: '60px' } });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate display scale for responsive canvas
  const getDisplayScale = () => {
    if (!containerRef.current) return 1;
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 32; // padding
    const containerHeight = window.innerHeight * 0.6;

    const scaleX = containerWidth / CANVAS_WIDTH;
    const scaleY = containerHeight / CANVAS_HEIGHT;

    return Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1:1
  };

  const displayScale = getDisplayScale();
  const displayWidth = CANVAS_WIDTH * displayScale;
  const displayHeight = CANVAS_HEIGHT * displayScale;

  return (
    <div className="min-h-screen bg-background flex flex-col page-transition">
      <Header cartItemsCount={0} showSearch={false} />

      <div className="container mx-auto max-w-full md:max-w-full lg:max-w-7xl bg-background flex-1 flex flex-col px-4 md:px-6 lg:px-6 py-6">
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            Twibbon HUT 3 th ID Card Lampung
          </h1>

          <div className="w-full max-w-4xl">
            {/* Controls */}
            <div className="mb-4 flex flex-wrap gap-3 justify-center items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Unggah Foto
              </Button>

              {uploadedImage && (
                <>
                  <Button
                    onClick={handleZoomOut}
                    variant="outline"
                    size="icon"
                    disabled={scale <= MIN_SCALE}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2 min-w-[150px]">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      Zoom: {Math.round(scale * 100)}%
                    </span>
                    <Slider
                      value={[scale]}
                      min={MIN_SCALE}
                      max={MAX_SCALE}
                      step={0.1}
                      onValueChange={(value) => setScale(value[0])}
                      className="flex-1"
                    />
                  </div>

                  <Button
                    onClick={handleZoomIn}
                    variant="outline"
                    size="icon"
                    disabled={scale >= MAX_SCALE}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>

                  <Button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-[#FF5E01] text-white hover:bg-[#e54d00]"
                  >
                    <Download className="h-4 w-4" />
                    {isLoading ? "Mengunduh..." : "Unduh PNG"}
                  </Button>

                  <Button
                    onClick={() => {
                      setUploadedImage(null);
                      setImagePosition({ x: 0, y: 0 });
                      setScale(1.0);
                    }}
                    variant="ghost"
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Canvas Container */}
            <div
              ref={containerRef}
              className="w-full flex justify-center items-center bg-gray-100 rounded-lg p-4 overflow-auto"
              style={{ minHeight: "400px" }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                  cursor: uploadedImage ? (isDragging ? "grabbing" : "grab") : "default",
                  touchAction: "none",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
              />
            </div>

            {/* Instructions */}
            {!uploadedImage && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Unggah foto Anda untuk memulai membuat Twibbon</p>
                <p className="mt-2">Gunakan mouse untuk drag, scroll untuk zoom, atau pinch di mobile</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 mb-8">
        <Footer />
      </div>
    </div>
  );
};

export default TwibbonMaker;
