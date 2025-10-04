import { toast } from 'sonner';

// Form validation functions
export const validateName = (name: string): string => {
  if (name.length < 3) {
    return "Nama minimal 3 karakter";
  }
  return "";
};

export const validatePhone = (phone: string): string => {
  if (phone.length < 10) {
    return "Nomor telepon minimal 10 digit";
  }
  return "";
};

// Form state management functions
export const handleNameChange = (
  value: string,
  setCustomerName: React.Dispatch<React.SetStateAction<string>>,
  setNameError: React.Dispatch<React.SetStateAction<string>>
) => {
  setCustomerName(value);
  setNameError(validateName(value));
};

export const handlePhoneChange = (
  value: string,
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>,
  setPhoneError: React.Dispatch<React.SetStateAction<string>>
) => {
  setPhoneNumber(value);
  setPhoneError(validatePhone(value));
};

// Modal state management functions
export const openProductDetails = (
  product: any,
  setSelectedProduct: React.Dispatch<React.SetStateAction<any>>,
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>,
  setModalQuantity: React.Dispatch<React.SetStateAction<number>>,
  setShowAngryQuantity: React.Dispatch<React.SetStateAction<boolean>>,
  setActiveTab: React.Dispatch<React.SetStateAction<string>>,
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>,
  setSelectedCase: React.Dispatch<React.SetStateAction<string>>,
  setSelectedLamination: React.Dispatch<React.SetStateAction<string>>,
  setBannerWidth: React.Dispatch<React.SetStateAction<number>>,
  setBannerHeight: React.Dispatch<React.SetStateAction<number>>,
  navigate: any,
  slug?: string
) => {
  setSelectedProduct(product);
  setCurrentImageIndex(0);
  setModalQuantity(1); // Set initial quantity to 1 instead of 0
  setShowAngryQuantity(false); // Reset angry quantity state

  // Set the active tab to match the product's category
  setActiveTab(product.category);

  // Initialize model selection for products with models
  if (product.models && product.models.length > 0) {
    setSelectedModel(product.models[0].code);
  } else {
    setSelectedModel("");
  }

  if ((window as any).idCardWithCaseIds?.includes(product.id)) {
    setSelectedCase("");
  }
  if ((window as any).stikerWithLaminationIds?.includes(product.id)) {
    setSelectedLamination("");
  }

  // Set default dimensions for dimensional products
  if (product.pricingMethod === "dimensional") {
    // Set default dimensions based on the product type
    // Default to a reasonable size like 1x1 or match any predefined dimensions
    setBannerWidth(1);
    setBannerHeight(1);

    // If it's the banner product, set a more standard banner size
    if (product.name === "Banner") {
      setBannerWidth(2);
      setBannerHeight(1);
    }
  }

  // Update URL to product-specific URL (only if not already a product URL)
  if (!slug) {
    const productSlug = (window as any).generateProductSlug?.(product.name);
    if (productSlug) {
      navigate(`/product/${productSlug}`, { replace: true });
    }
  }
};

// Image navigation functions
export const nextImage = (
  selectedProduct: any,
  currentImageIndex: number,
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  if (selectedProduct) {
    const totalImages = [selectedProduct.image, ...selectedProduct.additionalImages].length;
    setCurrentImageIndex((currentImageIndex + 1) % totalImages);
  }
};

export const prevImage = (
  selectedProduct: any,
  currentImageIndex: number,
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>
) => {
  if (selectedProduct) {
    const totalImages = [selectedProduct.image, ...selectedProduct.additionalImages].length;
    setCurrentImageIndex((currentImageIndex - 1 + totalImages) % totalImages);
  }
};

// Generate invoice number
export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `INV-${year}${month}${day}-${random}`;
};

// Handle search functionality
export const handleSearch = (
  term: string,
  products: any,
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>,
  setFilteredProducts: React.Dispatch<React.SetStateAction<any>>,
  setActiveTab: React.Dispatch<React.SetStateAction<string>>,
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>
) => {
  setSearchTerm(term);

  if (!term.trim()) {
    // Create a deep copy to prevent reference issues
    setFilteredProducts(JSON.parse(JSON.stringify(products)));
    setActiveCategory("");
    return;
  }

  const loweredTerm = term.toLowerCase();
  const filtered: any = {};
  let foundInCategory = "";

  // Ensure we're working with a fresh copy of products
  Object.entries(products).forEach(([category, categoryProducts]) => {
    if (Array.isArray(categoryProducts)) {
      const matchedProducts = categoryProducts.filter(product =>
        product && product.name && product.description &&
        (product.name.toLowerCase().includes(loweredTerm) ||
         product.description.toLowerCase().includes(loweredTerm))
      );

      if (matchedProducts.length > 0) {
        // Create a deep copy of matched products to prevent reference issues
        filtered[category] = JSON.parse(JSON.stringify(matchedProducts));
        if (!foundInCategory) foundInCategory = category;
      }
    }
  });

  setFilteredProducts(filtered);

  // Auto-select the first category with results
  if (foundInCategory) {
    setActiveTab(foundInCategory);
    setActiveCategory(foundInCategory);
  }
};


