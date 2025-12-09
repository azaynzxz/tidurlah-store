import React, { useState, useEffect, useMemo, useCallback } from "react";
import SEO from "@/components/common/SEO";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Check, Trash2, ChevronLeft, ChevronRight, X, Facebook, Instagram, Youtube, Mail, MapPin, Phone, Newspaper, CreditCard, Megaphone, Gift, Flower, Share2, Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BannerCarousel from "@/components/BannerCarousel";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";
import ChatBot from "@/components/ChatBot";
import MusicPlayer from "@/components/MusicPlayer";
import PromotedProducts from "@/components/PromotedProducts";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import TutorialPopup from "@/components/TutorialPopup";
import { AnimatedElement, StaggeredContainer, LoadingState } from "@/components/animations/AnimatedElement";

// Import extracted modules
import type { Product, CartItem, OrderData } from "@/types/product";
import { validPromoCodes, promotedProducts, caseVariants, idCardWithCaseIds, stikerWithLaminationIds, JASA_DESAIN_PRICE, categories, PRODUCT_VERSION } from "@/constants";
import { findProductBySlug, generateProductUrl, calculateBannerPrice, getApplicablePrice, calculateSavings } from "@/utils/product";
import { addToCart, removeFromCart, deleteFromCart, calculateTotal, calculateTotalSavings, calculateTotalDiscount, handlePromoCodeChange, addBannerToCart, FlyingBubble } from "@/utils/cart";
import { submitToGoogleSheet, handleWhatsAppRedirect } from "@/utils/api";
import { handleNameChange, handlePhoneChange, openProductDetails, nextImage, prevImage, generateInvoiceNumber, handleSearch } from "@/utils/form";

// Set document title and load Google Fonts
if (typeof document !== 'undefined') {
  document.title = "Spesialis ID Card Lanyard Lampung dan Merchandise Custom - TIDURLAH STORE";

  // Add Google Fonts Material Symbols if not already added
  if (!document.querySelector('link[href*="material+symbols"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=category,mail,language,location_on,poll,description,pending';
    document.head.appendChild(link);
  }
}

const Index = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState("ID Card & Lanyard");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [products, setProducts] = useState<any>({});
  const [filteredProducts, setFilteredProducts] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [promoCodeError, setPromoCodeError] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [bannerWidth, setBannerWidth] = useState(1);
  const [bannerHeight, setBannerHeight] = useState(1);
  const [bannerWidthInput, setBannerWidthInput] = useState<string | null>(null);
  const [bannerHeightInput, setBannerHeightInput] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [instansi, setInstansi] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isShipping, setIsShipping] = useState(false);
  const [address, setAddress] = useState("");
  const [designNote, setDesignNote] = useState("");
  const [isExpressPrint, setIsExpressPrint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [requestJasaDesain, setRequestJasaDesain] = useState(false);
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedLamination, setSelectedLamination] = useState("");
  const [showAngryCase, setShowAngryCase] = useState(false);
  const [showAngryLamination, setShowAngryLamination] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [showAngryQuantity, setShowAngryQuantity] = useState(false);
  const [flyingBubbles, setFlyingBubbles] = useState<FlyingBubble[]>([]);
  const [previousCartLength, setPreviousCartLength] = useState(0);

  // Tooltip states
  const [showExpressTooltip, setShowExpressTooltip] = useState(false);
  const [showShippingTooltip, setShowShippingTooltip] = useState(false);
  const [showJasaDesainTooltip, setShowJasaDesainTooltip] = useState(false);

  // Footer visibility state
  const [showFooter, setShowFooter] = useState(false);

  // Handle scroll for footer visibility
  useEffect(() => {
    const handleScroll = () => {
      // Show footer if scrolled down more than 100px
      const isScrolled = window.scrollY > 100;
      if (isScrolled !== showFooter) {
        setShowFooter(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showFooter]);


  // Generate invoice number when component mounts
  useEffect(() => {
    setInvoiceNumber(generateInvoiceNumber());
  }, []);

  // Load products from JSON
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/products.json?v=${PRODUCT_VERSION}`);
        const data = await response.json();

        // Ensure we create fresh copies to prevent reference issues
        const productsCopy = JSON.parse(JSON.stringify(data));
        const filteredProductsCopy = JSON.parse(JSON.stringify(data));

        setProducts(productsCopy);
        setFilteredProducts(filteredProductsCopy);

        // Add a small delay for smooth loading animation
        setTimeout(() => {
          setIsProductsLoading(false);
        }, 150);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Gagal memuat produk. Silakan coba lagi nanti.", { position: 'top-center', style: { marginTop: '60px' } });
        setIsProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);


  // Handle product URL deep linking
  useEffect(() => {
    if (slug && Object.keys(products).length > 0) {
      const product = findProductBySlug(slug, products);
      if (product) {
        // Set the appropriate category tab
        setActiveTab(product.category);
        // Open the product details modal
        openProductDetails(
          product,
          setSelectedProduct,
          setCurrentImageIndex,
          setModalQuantity,
          setShowAngryQuantity,
          setActiveTab,
          setSelectedModel,
          setSelectedCase,
          setSelectedLamination,
          setBannerWidth,
          setBannerHeight,
          navigate,
          slug
        );
      } else {
        // If product not found, redirect to home and show error
        navigate('/');
        toast.error("Produk tidak ditemukan", { position: 'top-center', style: { marginTop: '60px' } });
      }
    }
  }, [slug, navigate, products]);

  // Handle open-from-blog by product ID stored in localStorage
  useEffect(() => {
    if (Object.keys(products).length === 0) return;
    try {
      const pendingId = localStorage.getItem('openProductId');
      if (!pendingId) return;
      const idNum = parseInt(pendingId, 10);
      if (Number.isNaN(idNum)) {
        localStorage.removeItem('openProductId');
        return;
      }
      const all = Object.values(products).flat();
      const product: any = all.find((p: any) => p.id === idNum);
      localStorage.removeItem('openProductId');
      if (!product) return;
      setActiveTab(product.category);
      openProductDetails(
        product,
        setSelectedProduct,
        setCurrentImageIndex,
        setModalQuantity,
        setShowAngryQuantity,
        setActiveTab,
        setSelectedModel,
        setSelectedCase,
        setSelectedLamination,
        setBannerWidth,
        setBannerHeight,
        navigate,
        slug
      );
    } catch { }
  }, [products, navigate, slug]);

  // On component mount, load cartItems from localStorage if present
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        // ignore parse error
      }
    }
  }, []);

  // Whenever cartItems changes, save to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Close modal when item is successfully added to cart
  useEffect(() => {
    if (cartItems.length > previousCartLength && selectedProduct) {
      // Item was added successfully - close modal and reset selected state
      setSelectedProduct(null);
      setSelectedCase("");
      setSelectedLamination("");
      setModalQuantity(1);
    }
    setPreviousCartLength(cartItems.length);
  }, [cartItems.length, previousCartLength, selectedProduct]);

  // Initialize banner input values when dimensional product is selected
  useEffect(() => {
    if (selectedProduct && selectedProduct.pricingMethod === "dimensional") {
      // Initialize input strings with current numeric values
      setBannerWidthInput(bannerWidth.toString());
      setBannerHeightInput(bannerHeight.toString());
    } else {
      // Reset input strings when not a dimensional product
      setBannerWidthInput(null);
      setBannerHeightInput(null);
    }
  }, [selectedProduct?.id]); // Only re-run when product ID changes

  // Handle search functionality
  const handleSearchCallback = (term: string) => {
    handleSearch(
      term,
      products,
      setSearchTerm,
      setFilteredProducts,
      setActiveTab,
      setActiveCategory
    );
  };

  // Validate and apply promo code
  const handlePromoCodeCallback = (code: string) => {
    handlePromoCodeChange(
      code,
      cartItems,
      setPromoCode,
      setPromoCodeError,
      setPromoDiscount
    );
  };

  // Add to cart function using extracted logic
  const addToCartCallback = (product: any, sourceElement?: HTMLElement, quantity: number = 1) => {
    addToCart(
      product,
      cartItems,
      setCartItems,
      selectedModel,
      selectedCase,
      selectedLamination,
      setShowAngryCase,
      setShowAngryLamination,
      setShowAngryQuantity,
      sourceElement,
      quantity
    );
  };

  // Remove from cart function using extracted logic
  const removeFromCartCallback = (id: number) => {
    removeFromCart(id, cartItems, setCartItems, products);
  };

  // Delete item completely from cart using extracted logic
  const deleteFromCartCallback = (id: number) => {
    deleteFromCart(id, cartItems, setCartItems);
  };

  // Calculate total price with promo discount using extracted logic
  const calculateTotalCallback = () => {
    return calculateTotal(cartItems, promoCode);
  };

  // Calculate total savings using extracted logic
  const calculateTotalSavingsCallback = () => {
    return calculateTotalSavings(cartItems);
  };

  // Open product details modal using extracted logic
  const openProductDetailsCallback = (product: any) => {
    openProductDetails(
      product,
      setSelectedProduct,
      setCurrentImageIndex,
      setModalQuantity,
      setShowAngryQuantity,
      setActiveTab,
      setSelectedModel,
      setSelectedCase,
      setSelectedLamination,
      setBannerWidth,
      setBannerHeight,
      navigate,
      slug
    );
  };

  // Navigate through product images using extracted logic
  const nextImageCallback = () => {
    nextImage(selectedProduct, currentImageIndex, setCurrentImageIndex);
  };

  const prevImageCallback = () => {
    prevImage(selectedProduct, currentImageIndex, setCurrentImageIndex);
  };

  // Google Sheet submission function using extracted logic
  const submitToGoogleSheetCallback = async (orderData: OrderData) => {
    return await submitToGoogleSheet(orderData);
  };

  // WhatsApp redirection function using extracted logic
  const handleWhatsAppRedirectCallback = async () => {
    try {
      const orderData: OrderData = {
        invoiceNumber,
        customerName,
        instansi,
        phoneNumber,
        designNote,
        cartItems,
        subtotal: cartItems.reduce((total, item) => total + (item.appliedPrice * item.quantity), 0),
        promoCode,
        promoDiscount,
        total: calculateTotalCallback() + (requestJasaDesain ? JASA_DESAIN_PRICE : 0) + (isExpressPrint ? JASA_DESAIN_PRICE : 0),
        isShipping,
        address,
        requestJasaDesain,
        isExpressPrint
      };

      const result = await handleWhatsAppRedirect(
        orderData,
        cartItems,
        promoCode,
        promoDiscount,
        JASA_DESAIN_PRICE,
        isExpressPrint,
        requestJasaDesain,
        customerName,
        phoneNumber,
        instansi,
        address,
        isShipping,
        designNote,
        setIsSubmitting,
        setWhatsAppUrl,
        setShowOrderSuccess,
        calculateTotalCallback,
        calculateTotalSavingsCallback,
        caseVariants
      );

      return result;
    } catch (error) {
      setIsSubmitting(false);
      toast.error("Gagal menyimpan data pesanan. Silakan coba lagi.", { position: 'top-center', style: { marginTop: '60px' } });
      console.error(error);
    }
  };

  const addBannerToCartCallback = (product: any, width: number, height: number) => {
    const calculatedPrice = calculateBannerPrice(product, width, height, 1);
    const newItem = {
      ...product,
      width,
      height,
      appliedPrice: calculatedPrice,
      quantity: 1,
      savings: product.price - calculatedPrice > 0 ? product.price - calculatedPrice : 0,
      isDimensionalProduct: true,
      dimensionText: `${width}m × ${height}m`,
      area: (width * height).toFixed(2) + ' m²'
    };

    setCartItems([...cartItems, newItem]);
    setSelectedProduct(null);

    toast.success(`${product.name} ditambahkan ke keranjang`, {
      position: 'top-center',
      duration: 2000,
      style: {
        marginTop: '60px',
        fontSize: '12px',
        padding: '6px 10px',
        minHeight: '36px',
        maxWidth: '260px'
      }
    });
  };

  const calculateTotalDiscountCallback = () => {
    return calculateTotalDiscount(cartItems, promoCode);
  };





  // ... imports

  return (
    <div key={PRODUCT_VERSION} className="min-h-screen bg-background notranslate flex flex-col" translate="no">
      <SEO
        title="Cetak ID Card & Lanyard Lampung"
        description="Pusat cetak ID Card, Lanyard, Tali Id Card, dan Merchandise Custom di Bandar Lampung. Harga murah, pengerjaan cepat, dan berkualitas."
        keywords="id card lampung, lanyard custom, cetak id card bandar lampung, lanyard bisa dicuci, cetak id card terdekat, plakat, merchandise lampung"
      />
      {/* Header - Full Width */}
      <Header
        cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onCartClick={() => setShowCart(true)}
        onSearch={handleSearchCallback}
        showSearch={true}
      />

      <div className="container mx-auto max-w-full md:max-w-full lg:max-w-7xl bg-background flex-1 flex flex-col px-2">

        {!showOrderForm ? (
          /* Product Listing */
          <div className="p-3 flex-1 mb-8 md:max-w-full lg:max-w-[75%] lg:mx-auto">
            {/* Banner Carousel */}
            <AnimatedElement direction="up" delay={100} duration={300}>
              <BannerCarousel />
            </AnimatedElement>

            {/* Desktop: Side by Side Layout | Mobile: Stacked */}
            <div className="mt-0 mb-4 flex flex-col gap-6">
              {/* Promoted Products - Hidden for now */}
              {/* 
              <div className="lg:w-1/3 lg:flex-shrink-0">
                <AnimatedElement direction="up" delay={200} duration={300}>
                  <PromotedProducts 
                    products={products as Record<string, any[]>}
                    promotedProducts={promotedProducts}
                    onAddToCart={(product: any) => addToCartCallback(product)}
                    onOpenDetails={(product: any) => openProductDetailsCallback(product)}
                  />
                </AnimatedElement>
              </div>
              */}

              {/* Category Grid */}
              <div className="mt-4 lg:mt-0 w-full">
                <AnimatedElement direction="up" delay={300} duration={300}>
                  <div className="mb-3">
                    <h2 className="text-sm font-bold mb-2 text-foreground flex items-center">
                      <span className="material-symbols-outlined text-[#FF5E01] mr-1" style={{ fontSize: '16px' }}>category</span>
                      Kategori Produk:
                    </h2>
                    <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 pt-0">
                      {categories.map(category => {
                        const IconComponent = category.icon;
                        const isActive = activeTab === category.id;
                        const showBadge = category.tooltip && isActive;
                        
                        return (
                          <div key={category.id} className="relative">
                            {/* Bubble badge - shown on top when active */}
                            {showBadge && (
                              <div 
                                className="absolute -top-9 left-1/2 z-10"
                                style={{
                                  animation: 'slideUpFade 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards'
                                }}
                              >
                                <div className="relative bg-foreground text-background px-2.5 py-1 rounded-full font-medium shadow-lg text-center" style={{ fontSize: '10px' }}>
                                  <div className="leading-tight">
                                    Dikelola oleh
                                    <br />
                                    @papan_idcraft
                                  </div>
                                  {/* Small triangle pointing down */}
                                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-foreground rotate-45"></div>
                                </div>
                              </div>
                            )}
                            
                            {/* Category card */}
                            <div
                              onClick={() => {
                                setActiveTab(category.id);
                                // Reset search when switching tabs to prevent stale filtered data
                                if (searchTerm) {
                                  setSearchTerm("");
                                  setFilteredProducts(JSON.parse(JSON.stringify(products)));
                                  setActiveCategory("");
                                }
                              }}
                              className={`p-3 rounded-lg shadow-sm flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all duration-200 hover:scale-105 min-h-[80px] ${isActive
                                ? `${category.color} ${category.textColor}`
                                : `${category.inactiveColor} ${category.inactiveText} ${category.hoverColor}`
                                }`}
                            >
                              <IconComponent className="h-6 w-6" />
                              <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </AnimatedElement>
              </div>
            </div>

            <AnimatedElement direction="up" delay={400} duration={300}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                {Object.keys(filteredProducts).map(category => (
                  <TabsContent key={category} value={category}>
                    <LoadingState isLoading={isProductsLoading}>
                      <StaggeredContainer
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4"
                        staggerDelay={25}
                      >
                        {filteredProducts[category].map((product: any) => (
                          <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow duration-200 group">
                            <div
                              className="relative cursor-pointer"
                              onClick={() => openProductDetailsCallback(product)}
                            >
                              <div className="relative pt-[100%]">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {product.bestseller && (
                                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md z-[5]">
                                    Produk Terlaris
                                  </div>
                                )}
                              </div>
                              <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-tl-md">
                                Lihat detail
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const shareUrl = generateProductUrl(product);
                                  if (navigator.share) {
                                    navigator.share({
                                      title: product.name,
                                      text: `Lihat produk ${product.name} di TIDURLAH STORE`,
                                      url: shareUrl,
                                    });
                                  } else {
                                    navigator.clipboard.writeText(shareUrl);
                                    toast.success("Link produk disalin!", { position: 'top-center', style: { marginTop: '60px' }, duration: 2000 });
                                  }
                                }}
                                className="absolute top-2 right-2 bg-background bg-opacity-80 hover:bg-background p-1.5 rounded-full transition-colors z-[5]"
                                title="Bagikan produk"
                              >
                                <Share2 className="h-3 w-3 text-[#FF5E01]" />
                              </button>
                            </div>
                            <div className="p-2 lg:p-3 flex flex-col flex-grow">
                              <h3 className="font-medium text-xs lg:text-sm line-clamp-2 mb-1">{product.name}</h3>

                              <div className="mt-auto pt-1">
                                {product.discountPrice !== null ? (
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[#FF5E01] font-bold text-base lg:text-lg">
                                        Rp {product.discountPrice.toLocaleString('id-ID')}
                                      </span>
                                      {product.rating && (
                                        <div className="flex items-center gap-1">
                                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                          <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="line-through text-muted-foreground text-xxs">
                                        Rp {product.price.toLocaleString('id-ID')}
                                      </span>
                                      <span className="text-xxs text-green-600 font-medium">
                                        Hemat Rp {(product.price - product.discountPrice).toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[#FF5E01] font-bold text-base lg:text-lg">
                                        Rp {product.price.toLocaleString('id-ID')}
                                      </span>
                                      {product.rating && (
                                        <div className="flex items-center gap-1">
                                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                          <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="h-4"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </StaggeredContainer>
                    </LoadingState>
                  </TabsContent>
                ))}
              </Tabs>
            </AnimatedElement>

          </div>
        ) : (
          /* Order Form */
          <div className="p-3 flex-1 mb-8">
            <button
              onClick={() => setShowOrderForm(false)}
              className="mb-3 text-[#FF5E01] flex items-center"
            >
              ← Kembali ke Produk
            </button>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Informasi Pesanan</h2>
              <p className="text-sm text-muted-foreground">No. Invoice: {invoiceNumber}</p>
            </div>

            {/* Desktop: Two Column Layout, Mobile: Single Column */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">

              {/* Left Column: Customer Information */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nama</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={customerName}
                      onChange={(e) => handleNameChange(e.target.value, setCustomerName, setNameError)}
                      placeholder="Nama Panggilan"
                      required
                    />
                    {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Instansi/Alias</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={instansi}
                      onChange={(e) => setInstansi(e.target.value)}
                      placeholder="Nama Sekolah, Kampus/Perusahaan kamu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nomor Telepon</label>
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value, setPhoneNumber, setPhoneError)}
                      placeholder="Nomor Telepon Kamu"
                      required
                    />
                    {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note/Link Desain (Jika Ada) </label>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={designNote}
                      onChange={(e) => setDesignNote(e.target.value)}
                      placeholder="Masukkan note cetak dan atau link desain kamu (canva/Google Drive), pastikan akses sudah dibuka"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3 p-3 bg-muted rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700">Opsi Tambahan</h3>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="shippingOption"
                        checked={isShipping}
                        onChange={() => setIsShipping(!isShipping)}
                        className="mt-1 mr-3 h-4 w-4 text-[#FF5E01] focus:ring-[#FF5E01] border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <label htmlFor="shippingOption" className="text-sm text-gray-700 leading-relaxed mr-2">
                            Perlu pengiriman?
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowShippingTooltip(!showShippingTooltip)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <span className="text-sm border border-gray-400 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</span>
                          </button>
                        </div>
                        {showShippingTooltip && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                            Jika tidak dicentang, ambil di tempat, jasa kirim JNT, JNE, Maxim/Gojek, ongkir ditanggung customer
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="jasaDesainOption"
                        checked={requestJasaDesain}
                        onChange={() => setRequestJasaDesain(!requestJasaDesain)}
                        className="mt-1 mr-3 h-4 w-4 text-[#FF5E01] focus:ring-[#FF5E01] border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <label htmlFor="jasaDesainOption" className="text-sm text-gray-700 leading-relaxed mr-2">
                            Request Jasa Desain? (+Rp 25.000)
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowJasaDesainTooltip(!showJasaDesainTooltip)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <span className="text-sm border border-gray-400 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</span>
                          </button>
                        </div>
                        {showJasaDesainTooltip && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                            Desain kami yang buatkan, gratis revisi 2x, dengan desain terbaik. bisa request sesuai contoh
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="expressPrintOption"
                        checked={isExpressPrint}
                        onChange={() => setIsExpressPrint(!isExpressPrint)}
                        className="mt-1 mr-3 h-4 w-4 text-[#FF5E01] focus:ring-[#FF5E01] border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <label htmlFor="expressPrintOption" className="text-sm text-gray-700 leading-relaxed mr-2">
                            Cetak Express (+Rp 25.000)
                          </label>
                          <span className="bg-[#FF5E01] text-white text-xs px-2 py-1 rounded-full mr-1">HOT</span>
                          <button
                            type="button"
                            onClick={() => setShowExpressTooltip(!showExpressTooltip)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <span className="text-sm border border-gray-400 rounded-full w-4 h-4 flex items-center justify-center text-xs">?</span>
                          </button>
                        </div>
                        {showExpressTooltip && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
                            Cetak express artinya cetakan akan masuk urutan prioritas, dan akan di cetak lebih dulu estimasi:<br /><span className="line-through">2-3 hari</span> <span className="font-semibold">(1 hari)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isShipping && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman</label>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 p-2"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Masukkan alamat lengkap pengiriman"
                        rows={3}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="space-y-4">
                <div className="border-t border-b xl:border xl:rounded-lg py-3 xl:p-4 my-3 xl:my-0 xl:bg-muted">
                  <h3 className="font-medium mb-3 text-sm">Ringkasan Pesanan</h3>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm mb-3">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.modelCode && (
                          <p className="text-xs text-gray-600">Kode: {item.modelCode}</p>
                        )}
                        {item.width && item.height && (
                          <p className="text-xs text-gray-600">
                            {item.width}m × {item.height}m ({(item.width * item.height).toFixed(2)} m²)
                          </p>
                        )}
                        {item.caseVariant && (
                          <p className="text-xs text-gray-600">
                            Casing: {caseVariants.find(c => c.code === item.caseVariant)?.name}
                          </p>
                        )}
                        {item.laminationVariant && (
                          <p className="text-xs text-gray-600">
                            Laminasi: {item.laminationVariant}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => removeFromCartCallback(item.id)}
                            className="p-1 rounded-full hover:bg-gray-100 border"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              const product = Object.values(products).flat().find((p: any) => p.id === item.id);
                              if (product) {
                                const newPrice = getApplicablePrice(product, newQuantity);
                                setCartItems(
                                  cartItems.map(cartItem =>
                                    cartItem.id === item.id
                                      ? {
                                        ...cartItem,
                                        quantity: newQuantity,
                                        appliedPrice: newPrice,
                                        savings: calculateSavings(product, newQuantity)
                                      }
                                      : cartItem
                                  )
                                );
                              }
                            }}
                            className="w-12 text-center border border-input bg-background text-foreground rounded p-1"
                          />
                          <button
                            onClick={() => addToCartCallback(item)}
                            className="p-1 rounded-full hover:bg-gray-100 border"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-right">Rp {(item.appliedPrice * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                  ))}

                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <p>Subtotal</p>
                      <p>Rp {cartItems.reduce((total, item) => total + (item.appliedPrice * item.quantity), 0).toLocaleString('id-ID')}</p>
                    </div>

                    {calculateTotalDiscountCallback() > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <p>Diskon Promo{promoDiscount > 0 ? ` (${promoDiscount}%)` : ''}</p>
                        <p>- Rp {calculateTotalDiscountCallback().toLocaleString('id-ID')}</p>
                      </div>
                    )}

                    {requestJasaDesain && (
                      <div className="flex justify-between items-center text-sm text-[#FF5E01]">
                        <p>Jasa Desain</p>
                        <p>Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}</p>
                      </div>
                    )}

                    {isExpressPrint && (
                      <div className="flex justify-between items-center text-sm text-[#FF5E01]">
                        <p>Cetak Express</p>
                        <p>Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center font-medium mt-2">
                      <p>Total</p>
                      <p>Rp {(calculateTotalCallback() + (requestJasaDesain ? JASA_DESAIN_PRICE : 0) + (isExpressPrint ? JASA_DESAIN_PRICE : 0)).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Promo (Opsional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-gray-300 p-2"
                        value={promoCode}
                        onChange={(e) => handlePromoCodeCallback(e.target.value)}
                        placeholder="Masukkan kode promo"
                      />
                      {promoCodeError && (
                        <p className="text-red-500 text-xs mt-1">{promoCodeError}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleWhatsAppRedirectCallback}
                    disabled={
                      Boolean(isSubmitting) ||
                      Boolean(nameError) ||
                      Boolean(phoneError) ||
                      customerName.length < 3 ||
                      phoneNumber.length < 10
                    }
                    className={`w-full bg-[#FF5E01] text-white rounded-lg py-3 font-medium shadow-md text-base ${Boolean(isSubmitting) || Boolean(nameError) || Boolean(phoneError) || customerName.length < 3 || phoneNumber.length < 10 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isSubmitting ? 'Memproses...' : 'Lanjut ke WhatsApp'}
                  </button>

                  <div className="flex items-center justify-center text-sm text-green-600 mt-2">
                    <Check className="h-4 w-4 mr-1" />
                    <p>Pesanan kamu akan kami alihkan ke admin resmi kami</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="sm:max-w-md lg:max-w-2xl max-w-[calc(100%-2rem)] mx-auto rounded-lg overflow-hidden max-h-[90vh] p-0">
            <DialogHeader className="p-4 border-b bg-background">
              <DialogTitle className="font-semibold text-lg">Keranjang Kamu</DialogTitle>
              <DialogDescription>
                Review produk yang telah ditambahkan ke keranjang belanja Anda.
              </DialogDescription>
            </DialogHeader>
            <div className="relative h-full flex flex-col" style={{ maxHeight: "80vh" }}>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(80vh - 150px)" }}>
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-500">Keranjang masih kosong</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          {item.width && item.height && (
                            <p className="text-xs text-gray-600">
                              {item.width}m × {item.height}m ({(item.width * item.height).toFixed(2)} m²)
                            </p>
                          )}
                          <p className="text-gray-500 text-xs">Rp {item.appliedPrice.toLocaleString('id-ID')}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => removeFromCartCallback(item.id)}
                              className="p-1 rounded-full hover:bg-gray-100 border"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1;
                                const product = Object.values(products).flat().find((p: any) => p.id === item.id);
                                if (product) {
                                  const newPrice = getApplicablePrice(product, newQuantity);
                                  setCartItems(
                                    cartItems.map(cartItem =>
                                      cartItem.id === item.id
                                        ? {
                                          ...cartItem,
                                          quantity: newQuantity,
                                          appliedPrice: newPrice,
                                          savings: calculateSavings(product, newQuantity)
                                        }
                                        : cartItem
                                    )
                                  );
                                }
                              }}
                              className="w-12 text-center border border-input bg-background text-foreground rounded p-1"
                            />
                            <button
                              onClick={() => addToCartCallback(item)}
                              className="p-1 rounded-full hover:bg-gray-100 border"
                            >
                              +
                            </button>
                            <button
                              onClick={() => deleteFromCartCallback(item.id)}
                              className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {item.caseVariant && (
                            <p className="text-xs text-gray-600">Casing: {caseVariants.find(c => c.code === item.caseVariant)?.name}</p>
                          )}
                          {item.laminationVariant && (
                            <p className="text-xs text-gray-600">Laminasi: {item.laminationVariant}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fixed Footer */}
              {cartItems.length > 0 && (
                <div className="p-4 border-t bg-background">
                  <div className="flex justify-between items-center text-sm">
                    <p>Subtotal</p>
                    <p>Rp {cartItems.reduce((total, item) => total + (item.appliedPrice * item.quantity), 0).toLocaleString('id-ID')}</p>
                  </div>

                  {calculateTotalDiscountCallback() > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <p>Diskon Promo{promoDiscount > 0 ? ` (${promoDiscount}%)` : ''}</p>
                      <p>- Rp {calculateTotalDiscountCallback().toLocaleString('id-ID')}</p>
                    </div>
                  )}

                  {requestJasaDesain && (
                    <div className="flex justify-between items-center text-sm text-blue-600">
                      <p>Jasa Desain</p>
                      <p>Rp {JASA_DESAIN_PRICE.toLocaleString('id-ID')}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center font-medium mt-2">
                    <p>Total</p>
                    <p>Rp {(calculateTotalCallback() + (requestJasaDesain ? JASA_DESAIN_PRICE : 0)).toLocaleString('id-ID')}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowCart(false);
                      setShowOrderForm(true);
                    }}
                    className="w-full bg-[#FF5E01] text-white rounded-lg py-2 font-medium mt-3"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Product Details Modal */}
        <Dialog open={!!selectedProduct} onOpenChange={() => {
          setSelectedProduct(null);
          setSelectedModel(""); // Reset model selection
          // Clear URL slug when modal is closed without affecting tab state
          if (slug) {
            // Use window.history to avoid triggering route effects
            window.history.replaceState({}, '', '/');
          }
        }}>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-1rem)] w-[calc(100%-1rem)] sm:w-auto mx-auto rounded-lg overflow-hidden max-h-[90vh] p-0 [&>button]:bg-[#FF5E01] [&>button]:text-white [&>button]:rounded-full [&>button]:opacity-100 [&>button]:hover:bg-[#e54d00] [&>button]:transition-colors">
            <DialogTitle className="sr-only">Detail Produk</DialogTitle>
            {selectedProduct && (
              <div className="relative h-full flex flex-col" style={{ maxHeight: "90vh" }}>
                {/* Fixed Header */}
                <div className="p-4 border-b bg-background relative">
                  <div className="pr-20">
                    <h2 className="font-semibold text-lg">{selectedProduct.name}</h2>
                    <DialogDescription>
                      Detail lengkap produk termasuk variasi, ukuran, dan opsi konfigurasi.
                    </DialogDescription>
                  </div>
                  {/* Share button positioned to align with close button */}
                  <button
                    onClick={() => {
                      const shareUrl = generateProductUrl(selectedProduct);
                      if (navigator.share) {
                        navigator.share({
                          title: selectedProduct.name,
                          text: `Lihat produk ${selectedProduct.name} di TIDURLAH STORE`,
                          url: shareUrl,
                        });
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success("Link produk disalin ke clipboard!", { position: 'top-center', style: { marginTop: '60px' } });
                      }
                    }}
                    className="absolute right-14 top-2 p-2 hover:bg-gray-100 rounded-full transition-colors z-[5]"
                    title="Bagikan produk"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
                      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
                    </svg>
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
                  <div className="relative">
                    <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "75%" }}>
                      <img
                        src={selectedProduct.models ? selectedProduct.models.find(m => m.code === selectedModel)?.image || selectedProduct.models[0].image : [selectedProduct.image, ...selectedProduct.additionalImages][currentImageIndex]}
                        alt={selectedProduct.name}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      {/* Navigation buttons - show for all products with multiple images */}
                      {((selectedProduct.models && selectedProduct.models.length > 1) ||
                        (!selectedProduct.models && selectedProduct.additionalImages.length > 0)) && (
                          <>
                            <button
                              onClick={selectedProduct.models ? () => {
                                const currentIndex = selectedProduct.models.findIndex(m => m.code === selectedModel);
                                const prevIndex = currentIndex > 0 ? currentIndex - 1 : selectedProduct.models.length - 1;
                                setSelectedModel(selectedProduct.models[prevIndex].code);
                              } : prevImageCallback}
                              className="absolute left-1 top-1/2 -translate-y-1/2 bg-background bg-opacity-50 hover:bg-background h-8 w-8 rounded-full flex items-center justify-center transition-all hover:shadow-md"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={selectedProduct.models ? () => {
                                const currentIndex = selectedProduct.models.findIndex(m => m.code === selectedModel);
                                const nextIndex = currentIndex < selectedProduct.models.length - 1 ? currentIndex + 1 : 0;
                                setSelectedModel(selectedProduct.models[nextIndex].code);
                              } : nextImageCallback}
                              className="absolute right-1 top-1/2 -translate-y-1/2 bg-background bg-opacity-50 hover:bg-background h-8 w-8 rounded-full flex items-center justify-center transition-all hover:shadow-md"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        )}
                    </div>

                    {/* Model Selector for Plakat */}
                    {selectedProduct.models && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Pilih Model:</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedProduct.models.map((model) => (
                            <button
                              key={model.code}
                              onClick={() => setSelectedModel(model.code)}
                              className={`px-2 py-1.5 rounded-lg text-xs transition-colors text-center ${selectedModel === model.code
                                ? "bg-[#FF5E01] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                              {model.code}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Thumbnails */}
                    <div className="mt-2">
                      <div className="grid grid-cols-8 gap-1.5 overflow-x-auto scrollbar-hide pb-2">
                        {selectedProduct.models ? (
                          selectedProduct.models.slice(0, 8).map((model, index) => (
                            <div
                              key={`${model.code}-${index}`}
                              className={`relative flex-shrink-0 w-8 h-8 rounded-md overflow-hidden cursor-pointer transition-all ${model.code === selectedModel ? 'ring-2 ring-[#FF5E01] scale-105' : 'hover:scale-105'
                                }`}
                              onClick={() => setSelectedModel(model.code)}
                            >
                              <img
                                src={model.image}
                                alt={`${model.code}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))
                        ) : (
                          [selectedProduct.image, ...selectedProduct.additionalImages].map((image, index) => (
                            <div
                              key={`img-${index}`}
                              className={`relative flex-shrink-0 w-8 h-8 rounded-md overflow-hidden cursor-pointer transition-all ${index === currentImageIndex ? 'ring-2 ring-[#FF5E01] scale-105' : 'hover:scale-105'
                                }`}
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <img
                                src={image}
                                alt={`${selectedProduct.name} - Gambar ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))
                        )}
                      </div>
                      {selectedProduct.models && selectedProduct.models.length > 8 && (
                        <div className="text-center text-xs text-gray-500 mt-1">
                          +{selectedProduct.models.length - 8} model lainnya tersedia
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm break-words">{selectedProduct.description}</p>
                    {selectedProduct && idCardWithCaseIds.includes(selectedProduct.id) && (
                      <div className="mt-4">
                        <h4 className={`text-sm font-medium mb-2 transition-colors ${showAngryCase ? "text-orange-600 font-bold" : ""
                          }`}>
                          Pilih Jenis Casing:
                        </h4>
                        <div
                          className={`flex flex-wrap gap-2 transition-all duration-300 ${showAngryCase ? "angry-wiggle" : ""
                            }`}
                          id="case-selection-container"
                        >
                          {caseVariants.map((variant) => (
                            <button
                              key={variant.code}
                              onClick={() => {
                                setSelectedCase(variant.code);
                                if (showAngryCase) {
                                  setShowAngryCase(false); // Reset angry state when user selects
                                  toast.success(`Casing dipilih!`, {
                                    position: 'top-center',
                                    style: {
                                      marginTop: '60px',
                                      fontSize: '12px',
                                      padding: '6px 10px',
                                      minHeight: '36px',
                                      maxWidth: '260px'
                                    },
                                    duration: 2000
                                  });
                                }
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${selectedCase === variant.code
                                ? "bg-[#FF5E01] text-white"
                                : showAngryCase
                                  ? "angry-highlight angry-pulse"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                              {variant.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lamination Selection */}
                    {selectedProduct && stikerWithLaminationIds.includes(selectedProduct.id) && (
                      <div className="space-y-2">
                        <h4 className={`font-medium text-sm transition-all duration-300 ${showAngryLamination ? "text-orange-600 font-bold" : ""
                          }`}>
                          Pilih Jenis Laminasi:
                        </h4>
                        <div
                          className={`flex flex-wrap gap-2 transition-all duration-300 ${showAngryLamination ? "angry-wiggle" : ""
                            }`}
                          id="lamination-selection-container"
                        >
                          {selectedProduct.laminationOptions.map((lamination) => (
                            <button
                              key={lamination.type}
                              onClick={() => {
                                setSelectedLamination(lamination.type);
                                if (showAngryLamination) {
                                  setShowAngryLamination(false); // Reset angry state when user selects
                                  toast.success(`Laminasi dipilih!`, {
                                    position: 'top-center',
                                    style: {
                                      marginTop: '60px',
                                      fontSize: '12px',
                                      padding: '6px 10px',
                                      minHeight: '36px',
                                      maxWidth: '260px'
                                    },
                                    duration: 2000
                                  });
                                }
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${selectedLamination === lamination.type
                                ? "bg-[#FF5E01] text-white"
                                : showAngryLamination
                                  ? "angry-highlight angry-pulse"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                              {lamination.type}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProduct.priceThresholds && !selectedProduct.pricingMethod && (
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Daftar Harga:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedProduct.priceThresholds.map((threshold: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-muted p-2 rounded-lg border border-gray-100"
                            >
                              <div className="text-xs font-medium text-gray-500">
                                {threshold.minQuantity}+ item
                              </div>
                              <div className="text-sm font-semibold text-[#FF5E01]">
                                Rp {threshold.price.toLocaleString('id-ID')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between bg-muted p-2 rounded-lg">
                      <span className="text-sm">Waktu Pengerjaan:</span>
                      <span className="text-sm text-gray-600">{selectedProduct.time}</span>
                    </div>

                    <div className="flex items-center justify-between bg-muted p-2 rounded-lg">
                      <span className="text-sm">Rating:</span>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                                }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {selectedProduct.rating}/5.0
                        </span>
                      </div>
                    </div>

                    {selectedProduct.pricingMethod === "dimensional" && (
                      <div className="space-y-2 mt-3 bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-sm">Ukuran Banner:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Lebar (m)</label>
                            <input
                              type="number"
                              min={selectedProduct.minWidth}
                              max={selectedProduct.maxWidth}
                              step="0.5"
                              value={bannerWidthInput !== null ? bannerWidthInput : bannerWidth}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                // Allow empty input for easier editing on mobile
                                setBannerWidthInput(inputValue);
                                // Only update numeric state if we have a valid number
                                if (inputValue !== '' && inputValue !== null && inputValue !== undefined) {
                                  const val = parseFloat(inputValue);
                                  if (!isNaN(val)) {
                                    let roundedVal = Math.round(val * 2) / 2;
                                    if (roundedVal < selectedProduct.minWidth) roundedVal = selectedProduct.minWidth;
                                    if (roundedVal > selectedProduct.maxWidth) roundedVal = selectedProduct.maxWidth;
                                    setBannerWidth(roundedVal);
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (isNaN(val) || e.target.value === '' || val < selectedProduct.minWidth) {
                                  setBannerWidth(selectedProduct.minWidth);
                                  setBannerWidthInput(selectedProduct.minWidth.toString());
                                } else if (val > selectedProduct.maxWidth) {
                                  setBannerWidth(selectedProduct.maxWidth);
                                  setBannerWidthInput(selectedProduct.maxWidth.toString());
                                } else {
                                  const roundedVal = Math.round(val * 2) / 2;
                                  setBannerWidth(roundedVal);
                                  setBannerWidthInput(roundedVal.toString());
                                }
                              }}
                              onFocus={(e) => {
                                // Initialize input string when focused if not initialized
                                if (bannerWidthInput === null) {
                                  setBannerWidthInput(bannerWidth.toString());
                                  e.target.select(); // Select all text for easy replacement
                                }
                              }}
                              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                              placeholder={`Min: ${selectedProduct.minWidth}m`}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Tinggi (m)</label>
                            <input
                              type="number"
                              min={selectedProduct.minHeight}
                              max={selectedProduct.maxHeight}
                              step="0.5"
                              value={bannerHeightInput !== null ? bannerHeightInput : bannerHeight}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                // Allow empty input for easier editing on mobile
                                setBannerHeightInput(inputValue);
                                // Only update numeric state if we have a valid number
                                if (inputValue !== '' && inputValue !== null && inputValue !== undefined) {
                                  const val = parseFloat(inputValue);
                                  if (!isNaN(val)) {
                                    let roundedVal = Math.round(val * 2) / 2;
                                    if (roundedVal < selectedProduct.minHeight) roundedVal = selectedProduct.minHeight;
                                    if (roundedVal > selectedProduct.maxHeight) roundedVal = selectedProduct.maxHeight;
                                    setBannerHeight(roundedVal);
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (isNaN(val) || e.target.value === '' || val < selectedProduct.minHeight) {
                                  setBannerHeight(selectedProduct.minHeight);
                                  setBannerHeightInput(selectedProduct.minHeight.toString());
                                } else if (val > selectedProduct.maxHeight) {
                                  setBannerHeight(selectedProduct.maxHeight);
                                  setBannerHeightInput(selectedProduct.maxHeight.toString());
                                } else {
                                  const roundedVal = Math.round(val * 2) / 2;
                                  setBannerHeight(roundedVal);
                                  setBannerHeightInput(roundedVal.toString());
                                }
                              }}
                              onFocus={(e) => {
                                // Initialize input string when focused if not initialized
                                if (bannerHeightInput === null) {
                                  setBannerHeightInput(bannerHeight.toString());
                                  e.target.select(); // Select all text for easy replacement
                                }
                              }}
                              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                              placeholder={`Min: ${selectedProduct.minHeight}m`}
                            />
                          </div>
                        </div>
                        <div className="text-sm font-medium text-[#FF5E01] mt-2">
                          Ukuran: {bannerWidth}m × {bannerHeight}m ({(bannerWidth * bannerHeight).toFixed(2)} m²)
                        </div>
                        <div className="text-sm font-medium text-[#FF5E01]">
                          Harga: Rp {calculateBannerPrice(selectedProduct, bannerWidth, bannerHeight, modalQuantity).toLocaleString('id-ID')}
                        </div>
                      </div>
                    )}

                    {/* Add some bottom padding to ensure content doesn't get hidden behind the fixed footer */}
                    <div className="h-4"></div>
                  </div>
                </div>

                {/* Fixed Footer with Quantity Selector and Action Button */}
                <div className="border-t bg-background">
                  {/* Quantity Selector */}
                  <div className="p-4 pb-2">
                    {/* Progress Text for Discount - Moved Above */}
                    {selectedProduct && modalQuantity > 0 && modalQuantity < 4 && selectedProduct.priceThresholds && selectedProduct.priceThresholds.some(t => t.minQuantity === 4) && (
                      <div className="mb-3 text-center px-2">
                        <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md block">
                          Tambah {4 - modalQuantity} lagi untuk diskon maksimal!
                        </span>
                      </div>
                    )}

                    <div className={`bg-muted p-3 rounded-lg transition-all duration-300 ${showAngryQuantity ? "angry-wiggle" : ""
                      }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm transition-colors ${showAngryQuantity ? "text-orange-600 font-bold" : ""
                          }`}>Jumlah:</span>
                        <div className={`flex items-center gap-3 transition-all duration-300 ${showAngryQuantity ? "angry-highlight angry-pulse" : ""
                          }`}>
                          <button
                            onClick={() => {
                              if (modalQuantity > 0) {
                                setModalQuantity(modalQuantity - 1);
                                if (showAngryQuantity) {
                                  setShowAngryQuantity(false);
                                }
                              }
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${modalQuantity <= 0
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : showAngryQuantity
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                              }`}
                            disabled={modalQuantity <= 0}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="9999"
                            value={modalQuantity === 0 ? '' : modalQuantity}
                            placeholder="0"
                            onFocus={(e) => {
                              // Select all text when focused for easy replacement
                              e.target.select();
                            }}
                            onChange={(e) => {
                              let rawValue = e.target.value;

                              // Handle empty input
                              if (rawValue === '' || rawValue === null || rawValue === undefined) {
                                setModalQuantity(0);
                                return;
                              }

                              // Remove leading zeros but keep single zero
                              rawValue = rawValue.replace(/^0+(?=\d)/, '');

                              // Convert to number
                              const value = parseInt(rawValue) || 0;

                              if (value >= 0 && value <= 9999) {
                                setModalQuantity(value);
                                if (showAngryQuantity && value > 0) {
                                  setShowAngryQuantity(false);
                                }
                              }
                            }}
                            className={`min-w-[3rem] w-16 text-center font-medium border rounded px-1 py-1 transition-all duration-300 ${showAngryQuantity ? "text-orange-600 font-bold border-orange-300 bg-orange-50" : "border-input bg-background text-foreground"
                              } ${modalQuantity === 0 ? "text-red-500 border-red-300" : ""}`}
                            style={{ fontSize: '14px' }}
                          />
                          <button
                            onClick={() => {
                              setModalQuantity(modalQuantity + 1);
                              if (showAngryQuantity) {
                                setShowAngryQuantity(false);
                                toast.success(`Jumlah dipilih!`, {
                                  position: 'top-center',
                                  style: {
                                    marginTop: '60px',
                                    fontSize: '12px',
                                    padding: '6px 10px',
                                    minHeight: '36px',
                                    maxWidth: '260px'
                                  },
                                  duration: 2000
                                });
                              }
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${showAngryQuantity
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-[#FF5E01] text-white hover:bg-[#e54d00]'
                              }`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Show total price based on quantity */}
                      {selectedProduct && !selectedProduct.pricingMethod && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 flex-shrink-0">Total Harga:</span>
                            <span className="font-medium text-[#FF5E01] text-right break-words">
                              Rp {(getApplicablePrice(selectedProduct, modalQuantity) * modalQuantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                          {modalQuantity > 1 && calculateSavings(selectedProduct, modalQuantity) > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-green-600 flex-shrink-0">Hemat:</span>
                              <span className="text-green-600 font-medium text-right break-words">
                                Rp {calculateSavings(selectedProduct, modalQuantity).toLocaleString('id-ID')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-4 pb-4">
                    {selectedProduct.pricingMethod === "dimensional" ? (
                      <button
                        onClick={() => addBannerToCartCallback(selectedProduct, bannerWidth, bannerHeight)}
                        className="w-full bg-[#FF5E01] text-white rounded-lg py-3 font-medium shadow-md"
                      >
                        Tambahkan ke Keranjang
                      </button>
                    ) : selectedProduct.models ? (
                      <button
                        onClick={() => {
                          // Check if model is selected and quantity is valid
                          if (selectedModel && modalQuantity > 0) {
                            addToCartCallback(selectedProduct, undefined, modalQuantity);
                            // Close modal after successful add for model products
                            setSelectedProduct(null);
                          }
                        }}
                        className={`w-full bg-[#FF5E01] text-white rounded-lg py-3 font-medium shadow-md ${!selectedModel || modalQuantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!selectedModel || modalQuantity <= 0}
                      >
                        Tambahkan ke Keranjang ({modalQuantity}×)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          // addToCart function will validate case/lamination and show angry animations
                          addToCartCallback(selectedProduct, undefined, modalQuantity);
                          // Don't close modal if validation failed (validation is in addToCart)
                          // We'll handle closing in useEffect watching the modal state
                        }}
                        className={`w-full bg-[#FF5E01] text-white rounded-lg py-3 font-medium shadow-md transition-opacity`}
                      >
                        Tambahkan ke Keranjang ({modalQuantity}×)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Order Success Modal */}
        <Dialog open={showOrderSuccess} onOpenChange={setShowOrderSuccess}>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] mx-auto rounded-lg">
            <DialogTitle className="sr-only">Status Pesanan</DialogTitle>
            <div className="text-center py-4">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5E01] mx-auto mb-3"></div>
                  <h3 className="text-lg font-medium mb-2">Menyimpan Pesanan...</h3>
                  <DialogDescription>Mohon tunggu sebentar</DialogDescription>
                </>
              ) : (
                <>
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">Pesanan Berhasil!</h3>
                  <DialogDescription>Data pesanan telah tersimpan. Silakan lanjutkan ke WhatsApp untuk konfirmasi dengan admin kami.</DialogDescription>

                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#25D366] text-white rounded-lg py-3 font-medium shadow-md mt-4"
                  >
                    <div className="flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                        <path d="M17.6 6.31999C16.2 4.91999 14.2 4.09999 12.1 4.09999C7.79995 4.09999 4.29995 7.59999 4.29995 11.9C4.29995 13.3 4.69995 14.7 5.39995 15.9L4.19995 19.9L8.29995 18.7C9.49995 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.79999 19 7.79999 17.6 6.31999ZM12.1 18.3C10.9 18.3 9.69995 17.9 8.69995 17.2L8.39995 17L5.99995 17.7L6.69995 15.4L6.39995 15.1C5.59995 14 5.19995 13 5.19995 11.9C5.19995 8.09999 8.29995 5.09999 12 5.09999C13.8 5.09999 15.5 5.79999 16.7 6.99999C17.9 8.19999 18.6 9.89999 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.89995 11.5C9.69995 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.79995 9.19999 9.59995 8.79999C9.39995 8.39999 9.19995 8.39999 8.99995 8.39999C8.89995 8.39999 8.69995 8.39999 8.49995 8.39999C8.29995 8.39999 7.99995 8.49999 7.79995 8.79999C7.59995 9.09999 7.09995 9.49999 7.09995 10.4C7.09995 11.3 7.79995 12.2 7.89995 12.4C8.09995 12.6 9.69995 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z" fill="white" />
                      </svg>
                      Lanjutkan ke WhatsApp
                    </div>
                  </a>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>


        {/* Tutorial Popup - Shows on first visit */}
        <TutorialPopup />

        {/* ChatBot component */}
        <ChatBot />

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
            } as any}
          />
        ))}
      </div>

      {/* Footer - Regular Document Flow - Only visible when scrolling down */}
      <div
        className={`transition-opacity duration-500 ease-in-out ${showFooter ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <Footer />
      </div>
    </div>
  );
};

export default Index;
