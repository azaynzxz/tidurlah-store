
import { useState, useEffect } from "react";
import { ShoppingCart, ShoppingBag, Check, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BannerCarousel from "@/components/BannerCarousel";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";

// Valid promo codes with their discount percentage
const validPromoCodes = {
  "DISCOUNT10": 10,
  "SAVE15": 15,
  "PROMO20": 20
};

// Product Data with Price Thresholds
const products = {
  "ID Card Lanyard": [
    {
      id: 1,
      name: "Basic ID Card Lanyard",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Standard ID card lanyard with clip attachment, perfect for everyday use.",
      price: 25000,
      discountPrice: null,
      category: "ID Card Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 25000 },
        { minQuantity: 4, price: 20000 },
        { minQuantity: 35, price: 18000 },
        { minQuantity: 100, price: 17000 }
      ],
      time: "1-2 days",
      rating: 4.7
    },
    {
      id: 2,
      name: "Premium ID Card Lanyard",
      image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "High quality lanyard with custom printing options and durable materials.",
      price: 35000,
      discountPrice: 30000,
      category: "ID Card Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 30000 },
        { minQuantity: 5, price: 28000 },
        { minQuantity: 25, price: 26000 },
        { minQuantity: 100, price: 25000 }
      ],
      time: "2-3 days",
      rating: 4.8
    },
    {
      id: 3,
      name: "Custom Print Lanyard",
      image: "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Fully customizable lanyard with your logo or design printed on both sides.",
      price: 40000,
      discountPrice: null,
      category: "ID Card Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 40000 },
        { minQuantity: 10, price: 37000 },
        { minQuantity: 50, price: 35000 },
        { minQuantity: 150, price: 32000 }
      ],
      time: "3-5 days",
      rating: 4.9
    }
  ],
  "Merch": [
    {
      id: 4,
      name: "T-Shirt with Logo",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Premium cotton t-shirt with embroidered logo, available in multiple sizes.",
      price: 120000,
      discountPrice: 99000,
      category: "Merch",
      priceThresholds: [
        { minQuantity: 1, price: 99000 },
        { minQuantity: 5, price: 89000 },
        { minQuantity: 25, price: 79000 },
        { minQuantity: 100, price: 69000 }
      ],
      time: "1 week",
      rating: 4.6
    },
    {
      id: 5,
      name: "Coffee Mug",
      image: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Ceramic mug with printed design, microwave and dishwasher safe.",
      price: 45000,
      discountPrice: null,
      category: "Merch",
      priceThresholds: [
        { minQuantity: 1, price: 45000 },
        { minQuantity: 5, price: 42000 },
        { minQuantity: 20, price: 38000 },
        { minQuantity: 50, price: 35000 }
      ],
      time: "3-5 days",
      rating: 4.5
    },
    {
      id: 6,
      name: "Notebook Set",
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Set of 3 notebooks with different paper types and custom cover designs.",
      price: 50000,
      discountPrice: 40000,
      category: "Merch",
      priceThresholds: [
        { minQuantity: 1, price: 40000 },
        { minQuantity: 3, price: 38000 },
        { minQuantity: 10, price: 36000 },
        { minQuantity: 25, price: 33000 }
      ],
      time: "2-4 days",
      rating: 4.7
    }
  ],
  "Media Promosi": [
    {
      id: 7,
      name: "Roll Up Banner",
      image: "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Portable roll-up banner with stand, perfect for events and trade shows.",
      price: 250000,
      discountPrice: 220000,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 220000 },
        { minQuantity: 2, price: 200000 },
        { minQuantity: 5, price: 180000 },
        { minQuantity: 10, price: 170000 }
      ],
      time: "3-5 days",
      rating: 4.8
    },
    {
      id: 8,
      name: "Flyer Design (100pcs)",
      image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Custom flyer designs printed on high-quality paper, pack of 100 pieces.",
      price: 150000,
      discountPrice: null,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 150000 },
        { minQuantity: 3, price: 140000 },
        { minQuantity: 5, price: 130000 },
        { minQuantity: 10, price: 120000 }
      ],
      time: "2-3 days",
      rating: 4.6
    },
    {
      id: 9,
      name: "Backdrop Banner",
      image: "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80",
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
      ],
      description: "Large format backdrop banner for events, exhibitions and photo opportunities.",
      price: 350000,
      discountPrice: 300000,
      category: "Media Promosi",
      priceThresholds: [
        { minQuantity: 1, price: 300000 },
        { minQuantity: 2, price: 280000 },
        { minQuantity: 3, price: 260000 },
        { minQuantity: 5, price: 250000 }
      ],
      time: "4-7 days",
      rating: 4.9
    }
  ]
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("ID Card Lanyard");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any>(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [promoCodeError, setPromoCodeError] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [instansi, setInstansi] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isShipping, setIsShipping] = useState(false);
  const [address, setAddress] = useState("");

  // Generate invoice number when component mounts
  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    setInvoiceNumber(`INV-${year}${month}${day}-${random}`);
  }, []);

  // Handle search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredProducts(products);
      setActiveCategory("");
      return;
    }
    
    const loweredTerm = term.toLowerCase();
    const filtered: any = {};
    let foundInCategory = "";
    
    Object.entries(products).forEach(([category, categoryProducts]) => {
      const matchedProducts = (categoryProducts as any[]).filter(product => 
        product.name.toLowerCase().includes(loweredTerm) || 
        product.description.toLowerCase().includes(loweredTerm)
      );
      
      if (matchedProducts.length > 0) {
        filtered[category] = matchedProducts;
        if (!foundInCategory) foundInCategory = category;
      }
    });
    
    setFilteredProducts(filtered);
    
    // Auto-select the first category with results
    if (foundInCategory) {
      setActiveTab(foundInCategory);
      setActiveCategory(foundInCategory);
    }
  };

  // Validate and apply promo code
  const handlePromoCodeChange = (code: string) => {
    setPromoCode(code);
    setPromoCodeError("");
    
    if (!code) {
      setPromoDiscount(0);
      return;
    }
    
    if (validPromoCodes[code as keyof typeof validPromoCodes]) {
      setPromoDiscount(validPromoCodes[code as keyof typeof validPromoCodes]);
      toast.success(`Promo code ${code} applied! ${validPromoCodes[code as keyof typeof validPromoCodes]}% discount`);
    } else if (code) {
      setPromoDiscount(0);
      setPromoCodeError("Invalid promo code");
    }
  };

  // Calculate appropriate price based on quantity and thresholds
  const getApplicablePrice = (product: any, quantity: number) => {
    if (!product.priceThresholds) {
      return product.discountPrice !== null ? product.discountPrice : product.price;
    }
    
    // Sort thresholds in descending order by minQuantity
    const sortedThresholds = [...product.priceThresholds].sort((a, b) => b.minQuantity - a.minQuantity);
    
    // Find the first threshold that applies
    for (const threshold of sortedThresholds) {
      if (quantity >= threshold.minQuantity) {
        return threshold.price;
      }
    }
    
    // If no threshold applies, use the default price
    return product.discountPrice !== null ? product.discountPrice : product.price;
  };

  // Calculate savings compared to base price
  const calculateSavings = (product: any, quantity: number) => {
    const basePrice = product.price;
    const appliedPrice = getApplicablePrice(product, quantity);
    
    return (basePrice - appliedPrice) * quantity;
  };

  // Add to cart function
  const addToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      const newPrice = getApplicablePrice(product, newQuantity);
      
      setCartItems(
        cartItems.map(item =>
          item.id === product.id 
            ? { 
                ...item, 
                quantity: newQuantity, 
                appliedPrice: newPrice,
                savings: calculateSavings(product, newQuantity)
              } 
            : item
        )
      );
    } else {
      const newItem = { 
        ...product, 
        quantity: 1, 
        appliedPrice: getApplicablePrice(product, 1),
        savings: calculateSavings(product, 1)
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  // Remove from cart function
  const removeFromCart = (id: number) => {
    const existingItem = cartItems.find(item => item.id === id);
    
    if (existingItem && existingItem.quantity > 1) {
      const newQuantity = existingItem.quantity - 1;
      const product = Object.values(products).flat().find((p: any) => p.id === id);
      const newPrice = getApplicablePrice(product, newQuantity);
      
      setCartItems(
        cartItems.map(item =>
          item.id === id 
            ? { 
                ...item, 
                quantity: newQuantity, 
                appliedPrice: newPrice,
                savings: calculateSavings(product, newQuantity)
              } 
            : item
        )
      );
    } else {
      setCartItems(cartItems.filter(item => item.id !== id));
    }
  };

  // Delete item completely from cart
  const deleteFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Calculate total price with promo discount
  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.appliedPrice * item.quantity);
    }, 0);
    
    return promoDiscount > 0 
      ? subtotal * (1 - promoDiscount / 100) 
      : subtotal;
  };

  // Calculate total savings
  const calculateTotalSavings = () => {
    return cartItems.reduce((total, item) => {
      return total + item.savings;
    }, 0);
  };

  // Open product details modal
  const openProductDetails = (product: any) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  // Navigate through product images
  const nextImage = () => {
    if (selectedProduct) {
      const totalImages = [selectedProduct.image, ...selectedProduct.additionalImages].length;
      setCurrentImageIndex((currentImageIndex + 1) % totalImages);
    }
  };

  const prevImage = () => {
    if (selectedProduct) {
      const totalImages = [selectedProduct.image, ...selectedProduct.additionalImages].length;
      setCurrentImageIndex((currentImageIndex - 1 + totalImages) % totalImages);
    }
  };

  // Handle WhatsApp redirect
  const handleWhatsAppRedirect = () => {
    if (!customerName || !phoneNumber) {
      toast.error("Please fill in your name and phone number.");
      return;
    }

    if (isShipping && !address) {
      toast.error("Please provide your delivery address.");
      return;
    }

    setShowOrderSuccess(true);

    setTimeout(() => {
      const productList = cartItems.map(item => 
        `${item.name} (${item.quantity}x) - Rp ${item.appliedPrice.toLocaleString('id-ID')}`
      ).join('\n');

      const totalSavings = calculateTotalSavings();
      const savingsMessage = totalSavings > 0 ? 
        `\n*You saved: Rp ${totalSavings.toLocaleString('id-ID')}*` : '';
        
      const promoMessage = promoDiscount > 0 ?
        `\n*Promo discount: ${promoDiscount}%*` : '';

      const message = `
*Invoice: ${invoiceNumber}*
*Order Details*
Name: ${customerName}
Institution: ${instansi}
Phone: ${phoneNumber}
${promoCode ? `Promo Code: ${promoCode}${promoMessage}` : ''}
${isShipping ? `Shipping Address: ${address}` : 'Pickup: Yes (No shipping required)'}

*Products:*
${productList}

*Total: Rp ${calculateTotal().toLocaleString('id-ID')}*${savingsMessage}
      `;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/6283143790990?text=${encodedMessage}`, '_blank');
      setShowOrderSuccess(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-bold">Shopping Cart</h1>
          <button 
            className="relative p-2"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="h-6 w-6 text-[#FF5E01]" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {!showOrderForm ? (
          /* Product Listing */
          <div className="p-4">
            {/* Search Bar above banner */}
            <SearchBar onSearch={handleSearch} />
            
            {/* Banner Carousel */}
            <BannerCarousel />
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4 bg-gray-100">
                {Object.keys(filteredProducts).map(category => (
                  <TabsTrigger 
                    key={category}
                    value={category} 
                    className="flex-1 data-[state=active]:bg-[#FF5E01] data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.keys(filteredProducts).map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-2 gap-4">
                    {filteredProducts[category].map((product: any) => (
                      <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
                        <div 
                          className="relative cursor-pointer"
                          onClick={() => openProductDetails(product)}
                        >
                          <div className="relative pt-[100%]">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-tl-md">
                            View details
                          </div>
                        </div>
                        <div className="p-3 flex flex-col flex-grow">
                          <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                          {product.priceThresholds && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.priceThresholds.slice(0, 2).map((threshold: any, idx: number) => (
                                <div 
                                  key={idx}
                                  className="px-2 py-1 bg-[#FF5E01] bg-opacity-10 rounded-full text-[#FF5E01] text-xs font-medium"
                                >
                                  {threshold.minQuantity}
                                  {idx < product.priceThresholds.length - 1 ? '-' + (product.priceThresholds[idx + 1].minQuantity - 1) : '+'} pcs: Rp {threshold.price.toLocaleString('id-ID')}
                                </div>
                              ))}
                              {product.priceThresholds.length > 2 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  +{product.priceThresholds.length - 2} more pricing options
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mt-auto pt-2">
                            {product.discountPrice !== null ? (
                              <div className="flex flex-col">
                                <span className="line-through text-gray-500 text-xs">
                                  Rp {product.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[#FF5E01] font-semibold">
                                  Rp {product.discountPrice.toLocaleString('id-ID')}
                                </span>
                                <span className="text-xs text-green-500">
                                  Anda hemat Rp {(product.price - product.discountPrice).toLocaleString('id-ID')}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold">
                                Rp {product.price.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="mt-2 w-full bg-[#FF5E01] text-white rounded-full py-1 px-3 text-sm flex items-center justify-center"
                          >
                            <ShoppingBag className="h-4 w-4 mr-1" /> Add to cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {cartItems.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowOrderForm(true)}
                  className="bg-[#FF5E01] text-white rounded-full py-2 px-8 font-medium shadow-md"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Order Form */
          <div className="p-4">
            <button
              onClick={() => setShowOrderForm(false)}
              className="mb-4 text-[#FF5E01] flex items-center"
            >
              ← Back to Products
            </button>
            
            <h2 className="text-xl font-bold mb-4">Order Information</h2>
            <p className="text-sm text-gray-600 mb-4">Invoice: {invoiceNumber}</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution/Alias</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={instansi}
                  onChange={(e) => setInstansi(e.target.value)}
                  placeholder="Your Institution or Alias"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Your Phone Number"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shippingOption"
                  checked={isShipping}
                  onChange={() => setIsShipping(!isShipping)}
                  className="mr-2"
                />
                <label htmlFor="shippingOption" className="text-sm">Need shipping? (If unchecked, pickup only)</label>
              </div>
              
              {isShipping && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 p-2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete shipping address"
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="border-t border-b py-4 my-4">
              <h3 className="font-medium mb-3">Order Summary</h3>
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center mb-3">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.name}</h4>
                      <button 
                        onClick={() => deleteFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[#FF5E01] font-medium">
                          Rp {item.appliedPrice.toLocaleString('id-ID')}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          x{item.quantity}
                        </span>
                        {item.savings > 0 && (
                          <span className="text-xs block text-green-500">
                            Anda hemat Rp {item.savings.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded"
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
              <div className="relative">
                <input
                  type="text"
                  className={`w-full rounded-lg border ${promoCodeError ? 'border-red-500' : 'border-gray-300'} p-2`}
                  value={promoCode}
                  onChange={(e) => handlePromoCodeChange(e.target.value)}
                  placeholder="Enter promo code if available"
                />
                {promoCodeError && (
                  <p className="text-red-500 text-xs mt-1">{promoCodeError}</p>
                )}
                {promoDiscount > 0 && (
                  <p className="text-green-500 text-xs mt-1">Promo code applied: {promoDiscount}% discount</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Total</span>
              <span className="text-xl font-bold text-[#FF5E01]">
                Rp {calculateTotal().toLocaleString('id-ID')}
              </span>
            </div>
            
            {calculateTotalSavings() > 0 && (
              <div className="flex justify-end items-center mb-6">
                <span className="text-green-500 text-sm">
                  Total hemat: Rp {calculateTotalSavings().toLocaleString('id-ID')}
                </span>
              </div>
            )}
            
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-[#FF5E01] text-white rounded-full py-3 font-medium shadow-md mb-4 relative"
              disabled={showOrderSuccess}
            >
              {showOrderSuccess ? (
                <div className="flex items-center justify-center">
                  <div className="bg-white rounded-full p-1 mr-2">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  Processing...
                </div>
              ) : (
                "Order via WhatsApp"
              )}
            </button>
            
            <p className="text-center text-sm text-gray-500 italic">
              Pesanan kamu akan kami alihkan ke admin whatsapp
            </p>
          </div>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md h-full overflow-y-auto">
              <div className="p-4 border-b sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Your Cart</h3>
                  <button onClick={() => setShowCart(false)}>✕</button>
                </div>
              </div>

              <div className="p-4">
                {cartItems.length > 0 ? (
                  <>
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center mb-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{item.name}</h4>
                            <button 
                              onClick={() => deleteFromCart(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[#FF5E01] font-medium">
                                Rp {item.appliedPrice.toLocaleString('id-ID')}
                              </span>
                              <span className="text-gray-500 text-sm ml-2">
                                x{item.quantity}
                              </span>
                              {item.savings > 0 && (
                                <span className="text-xs block text-green-500">
                                  Anda hemat Rp {item.savings.toLocaleString('id-ID')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded"
                              >
                                -
                              </button>
                              <span className="mx-2">{item.quantity}</span>
                              <button
                                onClick={() => addToCart(item)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between mb-2">
                        <span>Total</span>
                        <span className="font-bold">
                          Rp {calculateTotal().toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      {calculateTotalSavings() > 0 && (
                        <div className="flex justify-end mb-4">
                          <span className="text-green-500 text-sm">
                            Total hemat: Rp {calculateTotalSavings().toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                      
                      <button
                        className="w-full bg-[#FF5E01] text-white rounded-full py-2 font-medium"
                        onClick={() => {
                          setShowCart(false);
                          setShowOrderForm(true);
                        }}
                      >
                        Checkout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-16 w-16 text-gray-300" />
                    <p className="mt-2 text-gray-500">Your cart is empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedProduct?.name}</DialogTitle>
            </DialogHeader>
            
            {selectedProduct && (
              <div className="mt-2">
                <div className="relative">
                  <img 
                    src={
                      currentImageIndex === 0 
                        ? selectedProduct.image 
                        : selectedProduct.additionalImages[currentImageIndex - 1]
                    } 
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-md"
                  />
                  
                  {([selectedProduct.image, ...selectedProduct.additionalImages].length > 1) && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1"
                      >
                        ←
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1"
                      >
                        →
                      </button>
                      
                      <div className="flex justify-center mt-2 gap-1">
                        {[selectedProduct.image, ...selectedProduct.additionalImages].map((_, index) => (
                          <div 
                            key={index}
                            className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-[#FF5E01]' : 'bg-gray-300'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-600 text-sm mb-4">{selectedProduct.description}</p>
                  
                  {selectedProduct.priceThresholds && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Price by quantity:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {selectedProduct.priceThresholds.map((threshold: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="px-3 py-2 bg-[#FF5E01] bg-opacity-10 rounded-full text-[#FF5E01] text-sm font-medium flex flex-col items-center"
                          >
                            <span className="font-medium">
                              {threshold.minQuantity}
                              {idx < selectedProduct.priceThresholds.length - 1 ? '-' + (selectedProduct.priceThresholds[idx + 1].minQuantity - 1) : '+'} pcs
                            </span>
                            <span className="block">
                              Rp {threshold.price.toLocaleString('id-ID')}
                            </span>
                            {threshold.price < selectedProduct.price && (
                              <span className="text-xs text-green-500">
                                Save Rp {(selectedProduct.price - threshold.price).toLocaleString('id-ID')}/pc
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    {selectedProduct.discountPrice !== null ? (
                      <div>
                        <span className="line-through text-gray-500">
                          Rp {selectedProduct.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[#FF5E01] font-bold ml-2">
                          Rp {selectedProduct.discountPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold">
                        Rp {selectedProduct.price.toLocaleString('id-ID')}
                      </span>
                    )}
                    
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="bg-[#FF5E01] text-white px-4 py-2 rounded-full text-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
