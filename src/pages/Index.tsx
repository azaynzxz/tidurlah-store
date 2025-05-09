
import { useState, useEffect } from "react";
import { ShoppingCart, ShoppingBag } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Product Data
const products = {
  "ID Card Lanyard": [
    {
      id: 1,
      name: "Basic ID Card Lanyard",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      description: "Standard ID card lanyard with clip attachment, perfect for everyday use.",
      price: 25000,
      discountPrice: null,
      category: "ID Card Lanyard"
    },
    {
      id: 2,
      name: "Premium ID Card Lanyard",
      image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      description: "High quality lanyard with custom printing options and durable materials.",
      price: 35000,
      discountPrice: 30000,
      category: "ID Card Lanyard"
    },
    {
      id: 3,
      name: "Custom Print Lanyard",
      image: "https://images.unsplash.com/photo-1559310589-2673bfe16970?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      description: "Fully customizable lanyard with your logo or design printed on both sides.",
      price: 40000,
      discountPrice: null,
      category: "ID Card Lanyard"
    }
  ],
  "Merch": [
    {
      id: 4,
      name: "T-Shirt with Logo",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      description: "Premium cotton t-shirt with embroidered logo, available in multiple sizes.",
      price: 120000,
      discountPrice: 99000,
      category: "Merch"
    },
    {
      id: 5,
      name: "Coffee Mug",
      image: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      description: "Ceramic mug with printed design, microwave and dishwasher safe.",
      price: 45000,
      discountPrice: null,
      category: "Merch"
    },
    {
      id: 6,
      name: "Notebook Set",
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      description: "Set of 3 notebooks with different paper types and custom cover designs.",
      price: 50000,
      discountPrice: 40000,
      category: "Merch"
    }
  ],
  "Media Promosi": [
    {
      id: 7,
      name: "Roll Up Banner",
      image: "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      description: "Portable roll-up banner with stand, perfect for events and trade shows.",
      price: 250000,
      discountPrice: 220000,
      category: "Media Promosi"
    },
    {
      id: 8,
      name: "Flyer Design (100pcs)",
      image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      description: "Custom flyer designs printed on high-quality paper, pack of 100 pieces.",
      price: 150000,
      discountPrice: null,
      category: "Media Promosi"
    },
    {
      id: 9,
      name: "Backdrop Banner",
      image: "https://images.unsplash.com/photo-1580130379256-ef084aa4c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      additionalImages: [
        "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      ],
      description: "Large format backdrop banner for events, exhibitions and photo opportunities.",
      price: 350000,
      discountPrice: 300000,
      category: "Media Promosi"
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

  // Add to cart function
  const addToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(
        cartItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  // Remove from cart function
  const removeFromCart = (id: number) => {
    const existingItem = cartItems.find(item => item.id === id);
    
    if (existingItem && existingItem.quantity > 1) {
      setCartItems(
        cartItems.map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    } else {
      setCartItems(cartItems.filter(item => item.id !== id));
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountPrice !== null ? item.discountPrice : item.price;
      return total + (price * item.quantity);
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
      alert("Please fill in your name and phone number.");
      return;
    }

    if (isShipping && !address) {
      alert("Please provide your delivery address.");
      return;
    }

    const productList = cartItems.map(item => 
      `${item.name} (${item.quantity}x) - Rp ${(item.discountPrice || item.price).toLocaleString('id-ID')}`
    ).join('\n');

    const message = `
*Invoice: ${invoiceNumber}*
*Order Details*
Name: ${customerName}
Institution: ${instansi}
Phone: ${phoneNumber}
${promoCode ? `Promo Code: ${promoCode}` : ''}
${isShipping ? `Shipping Address: ${address}` : 'Pickup: Yes (No shipping required)'}

*Products:*
${productList}

*Total: Rp ${calculateTotal().toLocaleString('id-ID')}*
    `;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6283143790990?text=${encodedMessage}`, '_blank');
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4 bg-gray-100">
                {Object.keys(products).map(category => (
                  <TabsTrigger 
                    key={category}
                    value={category} 
                    className="flex-1 data-[state=active]:bg-[#FF5E01] data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.keys(products).map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-2 gap-4">
                    {products[category as keyof typeof products].map(product => (
                      <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm">
                        <div 
                          className="relative cursor-pointer"
                          onClick={() => openProductDetails(product)}
                        >
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-tl-md">
                            View details
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                          <div className="mt-2">
                            {product.discountPrice !== null ? (
                              <div className="flex flex-col">
                                <span className="line-through text-gray-500 text-xs">
                                  Rp {product.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[#FF5E01] font-semibold">
                                  Rp {product.discountPrice.toLocaleString('id-ID')}
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
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[#FF5E01] font-medium">
                          Rp {(item.discountPrice || item.price).toLocaleString('id-ID')}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          x{item.quantity}
                        </span>
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
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 p-2"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code if available"
              />
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-700">Total</span>
              <span className="text-xl font-bold text-[#FF5E01]">
                Rp {calculateTotal().toLocaleString('id-ID')}
              </span>
            </div>
            
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-[#FF5E01] text-white rounded-full py-3 font-medium shadow-md mb-4"
            >
              Order via WhatsApp
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
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[#FF5E01] font-medium">
                                Rp {(item.discountPrice || item.price).toLocaleString('id-ID')}
                              </span>
                              <span className="text-gray-500 text-sm ml-2">
                                x{item.quantity}
                              </span>
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
                      <div className="flex justify-between mb-4">
                        <span>Total</span>
                        <span className="font-bold">
                          Rp {calculateTotal().toLocaleString('id-ID')}
                        </span>
                      </div>
                      
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
