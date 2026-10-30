import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronDown, ChevronUp, FileText, Calendar, Clock, Trash2, ShoppingCart, Truck, Palette, Zap, Search, User, Building2, Phone, Loader2 } from "lucide-react";
import { CartItem } from "./CartItem";
import { toast } from "sonner";
import { DeliveryInfoDialog } from "./DeliveryInfoDialog";
import { TimePicker } from "@/components/ui/TimePicker";
import newOrderSound from "@/components/new-order.mp3";
import { fetchCustomersData, normalizeIndonesianPhone, formatPhoneNumber, type CustomerSummary } from "@/services/customers";

// Cache customer database in-memory to prevent redundant queries during POS session
let posCustomerCache: CustomerSummary[] | null = null;
let posCustomerCacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

interface Product {
  id: number;
  name: string;
  image: string;
  additionalImages: string[];
  description: string;
  price: number;
  discountPrice: number | null;
  category: string;
  priceThresholds?: { minQuantity: number; price: number }[];
  time: string;
  rating: number;
  bestseller?: boolean;
  pricingMethod?: string;
  basePricePerSqm?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  laminationOptions?: { type: string; price: number }[];
  models?: { code: string; image: string; price?: number }[];
  is_available: boolean;
  unit: string;
}

interface CartItemType {
  cartItemId: string;
  product: Product;
  quantity: number;
  options?: {
    modelCode?: string;
    caseVariant?: string;
    laminationVariant?: string;
    width?: number;
    height?: number;
    customPrice?: number;
    overridePrice?: number;
    customPricePerSqm?: number;
    isDimensionalProduct?: boolean;
    dimensionText?: string;
    area?: string;
  };
}

interface CartProps {
  items: CartItemType[];
  onUpdateQuantityById: (cartItemId: string, quantity: number) => void;
  onRemoveItemById: (cartItemId: string) => void;
  onClearAll: () => void;
  onProcessOrder: (customerDetails: CustomerDetails) => void;
  onUpdateOptionsById: (cartItemId: string, options: any) => void;
  onPrintOrder?: (customerDetails: CustomerDetails) => Promise<boolean>;
  onExportPDF?: (customerDetails: CustomerDetails) => Promise<boolean>;
  onAddDesignService: () => void;
  onAddExpressService: () => void;
  onAddOngkir: (price: number) => void;
  isBluetoothSupported?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  defaultCabang?: string;
}

interface DeliveryInfo {
  recipientName: string;
  recipientPhone: string;
  address: string;
}

interface CustomerDetails {
  name: string;
  phone: string;
  instansi: string;
  delivery?: DeliveryInfo;
  downPayment?: number;
  deadline: string;
  deadlineTime?: string;
  cabang: string;
}

export function Cart({
  items,
  onUpdateQuantityById,
  onRemoveItemById,
  onClearAll,
  onProcessOrder,
  onUpdateOptionsById,
  onPrintOrder,
  onExportPDF,
  onAddDesignService,
  onAddExpressService,
  onAddOngkir,
  isBluetoothSupported,
  isMobile,
  onClose,
  defaultCabang
}: CartProps) {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    instansi: '',
    deadline: '',
    deadlineTime: '',
    cabang: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isDesignServiceSelected, setIsDesignServiceSelected] = useState(false);
  const [isDeliverySelected, setIsDeliverySelected] = useState(false);
  const [isExpressSelected, setIsExpressSelected] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [isLayananExpanded, setIsLayananExpanded] = useState(true);
  const [isPelangganExpanded, setIsPelangganExpanded] = useState(true);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [dpDisplayValue, setDpDisplayValue] = useState<string>('');

  // Customer database auto-suggest state
  const [customersList, setCustomersList] = useState<CustomerSummary[]>(() => {
    if (posCustomerCache) return posCustomerCache;
    try {
      const stored = localStorage.getItem('cached_pos_customers');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore JSON parse error
    }
    return [];
  });
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const customerNameInputRef = useRef<HTMLInputElement>(null);

  // Fetch customers from database on mount or if cache is stale
  useEffect(() => {
    const loadCustomers = async () => {
      const now = Date.now();
      if (posCustomerCache && now - posCustomerCacheTimestamp < CACHE_TTL_MS) {
        setCustomersList(posCustomerCache);
        return;
      }

      setIsLoadingCustomers(true);
      try {
        const result = await fetchCustomersData();
        if (result.success && result.customers) {
          posCustomerCache = result.customers;
          posCustomerCacheTimestamp = Date.now();
          setCustomersList(result.customers);
          try {
            localStorage.setItem('cached_pos_customers', JSON.stringify(result.customers));
          } catch {
            // ignore localStorage quota error
          }
        }
      } catch (err) {
        console.error('Failed to load customers in POS:', err);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, []);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        customerNameInputRef.current &&
        !customerNameInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Filtered customer suggestions based on typed query
  const filteredCustomers = useMemo(() => {
    const query = customerDetails.name.trim().toLowerCase();
    if (!query || !showSuggestions) return [];

    const cleanDigits = query.replace(/\D/g, '');

    return customersList
      .filter(cust => {
        const nameMatch = cust.name.toLowerCase().includes(query);
        const instMatch = cust.institution && cust.institution.toLowerCase().includes(query);
        const phoneMatch = cleanDigits.length >= 3 && cust.cleanPhone.includes(cleanDigits);
        return nameMatch || instMatch || phoneMatch;
      })
      .sort((a, b) => {
        // Exact name prefix match first
        const aStarts = a.name.toLowerCase().startsWith(query);
        const bStarts = b.name.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        // Prioritize repeat customers
        return (b.orderCount || 1) - (a.orderCount || 1);
      })
      .slice(0, 6);
  }, [customerDetails.name, customersList, showSuggestions]);

  // Handle customer selection from dropdown
  const handleSelectCustomer = (cust: CustomerSummary) => {
    setCustomerDetails(prev => ({
      ...prev,
      name: cust.name,
      phone: cust.phone || cust.cleanPhone || prev.phone,
      instansi: cust.institution && cust.institution !== '-' && cust.institution.toLowerCase() !== 'umum'
        ? cust.institution
        : (cust.institution || prev.instansi),
    }));
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    toast.success(`Data pelanggan ${cust.name} berhasil diterapkan`, { duration: 1500 });
  };

  // Keyboard navigation for dropdown
  const handleCustomerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredCustomers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev + 1) % filteredCustomers.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev - 1 + filteredCustomers.length) % filteredCustomers.length);
    } else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < filteredCustomers.length) {
        e.preventDefault();
        handleSelectCustomer(filteredCustomers[selectedSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  useEffect(() => {
    const expressServiceInCart = items.some(item => item.product.id === 2001);
    setIsExpressSelected(expressServiceInCart);
  }, [items]);

  useEffect(() => {
    if (defaultCabang) {
      setCustomerDetails(prev => ({ ...prev, cabang: defaultCabang }));
    }
  }, [defaultCabang]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  const getApplicablePrice = (product: Product, quantity: number, options?: any) => {
    if (product.id === 2002 && options?.customPrice) {
      return options.customPrice;
    }

    if (product.pricingMethod === "dimensional" && options?.width && options?.height) {
      const customPerSqm = (options.customPricePerSqm ?? options.overridePrice) as number | undefined;
      const basePerSqm = (customPerSqm && customPerSqm > 0)
        ? customPerSqm
        : (product.basePricePerSqm || product.price);
      const area = options.width * options.height;
      return basePerSqm * area;
    }

    if (options?.overridePrice && options.overridePrice > 0) {
      return options.overridePrice;
    }

    let basePrice = product.discountPrice || product.price;

    if (options?.modelCode && product.models) {
      const selectedModel = product.models.find(m => m.code === options.modelCode);
      if (selectedModel && selectedModel.price !== undefined) {
        basePrice = selectedModel.price;
      }
    }

    if (product.priceThresholds && product.priceThresholds.length > 0) {
      const applicableThreshold = product.priceThresholds
        .slice()
        .reverse()
        .find(threshold => quantity >= threshold.minQuantity);

      if (applicableThreshold) {
        basePrice = applicableThreshold.price;
      }
    }

    return basePrice;
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const unitPrice = getApplicablePrice(item.product, item.quantity, item.options);
      return total + (unitPrice * item.quantity);
    }, 0);
  };

  const calculateTotalDiscounts = () => {
    return items.reduce((total, item) => {
      const basePrice = item.product.price;
      const applicablePrice = getApplicablePrice(item.product, item.quantity, item.options);
      const discountPerItem = Math.max(0, basePrice - applicablePrice);
      return total + (discountPerItem * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const totalDiscounts = calculateTotalDiscounts();
  const finalTotal = subtotal;

  const handleDesignServiceChange = (checked: boolean) => {
    setIsDesignServiceSelected(checked);
    if (checked) {
      onAddDesignService();
    } else {
      const designServiceItem = items.find(item => item.product.id === 2000);
      if (designServiceItem) {
        onRemoveItemById(designServiceItem.cartItemId);
      }
    }
  };

  const handleExpressServiceChange = (checked: boolean) => {
    setIsExpressSelected(checked);
    if (checked) {
      onAddExpressService();
    } else {
      const expressItem = items.find(item => item.product.id === 2001);
      if (expressItem) {
        onRemoveItemById(expressItem.cartItemId);
      }
    }
  };

  const handleDeliveryChange = (checked: boolean) => {
    if (checked) {
      setShowDeliveryDialog(true);
    } else {
      setIsDeliverySelected(false);
      setCustomerDetails(prev => ({
        ...prev,
        delivery: undefined
      }));
      const deliveryItem = items.find(item => item.product.id === 2002);
      if (deliveryItem) {
        onRemoveItemById(deliveryItem.cartItemId);
      }
    }
  };

  const handleDeliveryInfoSubmit = (deliveryInfo: DeliveryInfo, shippingCost: number) => {
    setCustomerDetails(prev => ({
      ...prev,
      delivery: deliveryInfo
    }));
    setIsDeliverySelected(true);
    setShowDeliveryDialog(false);
    onAddOngkir(shippingCost);
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio(newOrderSound);
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleProcessOrder = () => {
    if (items.length === 0) {
      toast.error("Keranjang kosong. Tambahkan produk terlebih dahulu.");
      return;
    }

    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      toast.error("Mohon lengkapi nama dan nomor telepon pelanggan.");
      return;
    }

    if (!customerDetails.deadline) {
      toast.error("Mohon tentukan tanggal deadline pesanan.");
      return;
    }

    if (!customerDetails.cabang) {
      toast.error("Mohon pilih cabang transaksi.");
      return;
    }

    const idCardWithCaseIds = [1, 2, 6, 7, 8, 24];
    const stikerWithLaminationIds = [15];

    for (const item of items) {
      const needsCase = idCardWithCaseIds.includes(item.product.id);
      const needsLamination = stikerWithLaminationIds.includes(item.product.id);

      if (needsCase && !item.options?.caseVariant) {
        toast.error(`Pilih jenis casing untuk ${item.product.name}`);
        return;
      }

      if (needsLamination && !item.options?.laminationVariant) {
        toast.error(`Pilih jenis laminasi untuk ${item.product.name}`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      playNotificationSound();
      const deadlineValue = customerDetails.deadlineTime
        ? `${customerDetails.deadline} ${customerDetails.deadlineTime}`
        : customerDetails.deadline;

      onProcessOrder({
        ...customerDetails,
        downPayment,
        deadline: deadlineValue
      });

      // Immediately register customer into local cache and state so repeat orders don't need retyping
      if (customerDetails.name.trim()) {
        const normPhone = normalizeIndonesianPhone(customerDetails.phone);
        const key = normPhone || customerDetails.name.trim().toLowerCase();
        const existingIdx = (posCustomerCache || []).findIndex(c => c.id === key);

        const updatedCustomer: CustomerSummary = {
          id: key,
          name: customerDetails.name.trim(),
          phone: customerDetails.phone.trim(),
          cleanPhone: normPhone,
          formattedPhone: formatPhoneNumber(customerDetails.phone, 'formatted'),
          institution: customerDetails.instansi.trim(),
          address: customerDetails.delivery?.address || '',
          totalSpent: 0,
          orderCount: existingIdx >= 0 ? ((posCustomerCache?.[existingIdx]?.orderCount || 1) + 1) : 1,
          firstOrderDate: new Date().toISOString(),
          lastOrderDate: new Date().toISOString(),
          lastOrderStatus: 'Pending',
          lastInvoiceId: '',
          lastOrderItems: '',
          lastOrderTotal: 0,
          orderIds: [],
          channels: ['pos'],
          cabangs: [customerDetails.cabang || ''],
        };

        const nextList = [...(posCustomerCache || customersList)];
        if (existingIdx >= 0) {
          nextList[existingIdx] = {
            ...nextList[existingIdx],
            ...updatedCustomer,
            orderCount: (nextList[existingIdx].orderCount || 1) + 1,
            lastOrderDate: new Date().toISOString(),
          };
        } else {
          nextList.unshift(updatedCustomer);
        }

        posCustomerCache = nextList;
        posCustomerCacheTimestamp = Date.now();
        setCustomersList(nextList);
        try {
          localStorage.setItem('cached_pos_customers', JSON.stringify(nextList));
        } catch {
          // ignore localStorage error
        }
      }

      setCustomerDetails({
        name: '',
        phone: '',
        instansi: '',
        deadline: '',
        deadlineTime: '',
        cabang: defaultCabang || ''
      });
      setDownPayment(0);
      setDpDisplayValue('');
      setIsExpressSelected(false);
      setIsDesignServiceSelected(false);
      setIsDeliverySelected(false);

      if (isMobile && onClose) {
        setTimeout(() => onClose(), 500);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <>
      <div className={isMobile ? "flex flex-col h-full bg-background" : "flex flex-col h-full bg-card"}>
        {/* Cart Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Keranjang Kasir</h2>
            <Badge variant="secondary" className="font-mono text-xs px-1.5 py-0">
              {totalItemCount}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            disabled={items.length === 0}
            className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2 font-medium"
          >
            <Trash2 className="size-3 mr-1" />
            Hapus Semua
          </Button>
        </div>

        {/* Workspace Body */}
        <div className={isMobile ? "flex flex-col flex-1 overflow-y-auto" : "flex-1 flex overflow-hidden"}>
          {/* Items Section */}
          <div className={isMobile ? "p-3 flex flex-col gap-2.5 bg-muted/20" : "w-1/2 overflow-y-auto p-3 flex flex-col gap-2.5 bg-muted/20 border-r border-border"}>
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center gap-2">
                <ShoppingCart className="size-8 opacity-40" />
                <p className="text-xs font-semibold">Keranjang masih kosong</p>
                <p className="text-[11px]">Pilih produk dari katalog untuk memulai pesanan</p>
              </div>
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.cartItemId}
                  item={item}
                  onUpdateQuantityById={onUpdateQuantityById}
                  onRemoveById={onRemoveItemById}
                  onUpdateOptionsById={onUpdateOptionsById}
                />
              ))
            )}
          </div>

          {/* Form & Financial Summary */}
          <div className={isMobile ? "p-3 flex flex-col gap-3" : "w-1/2 overflow-y-auto p-3.5 flex flex-col gap-3 bg-card"}>
            {items.length > 0 && (
              <>
                {/* Additional Services Bar */}
                <div className="rounded-xl border border-border bg-muted/30 p-2.5 flex flex-col gap-2">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsLayananExpanded(!isLayananExpanded)}
                  >
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Zap className="size-3.5 text-primary" />
                      Layanan Tambahan
                    </span>
                    {isLayananExpanded ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
                  </div>

                  {isLayananExpanded && (
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {/* Jasa Desain */}
                      <button
                        type="button"
                        onClick={() => handleDesignServiceChange(!isDesignServiceSelected)}
                        className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center text-center transition-all border ${
                          isDesignServiceSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-card text-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <Palette className="size-3.5 mb-0.5" />
                        <span>Desain</span>
                        <span className="text-[10px] opacity-80 font-normal">+25k</span>
                      </button>

                      {/* Pengiriman */}
                      <button
                        type="button"
                        onClick={() => handleDeliveryChange(!isDeliverySelected)}
                        className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center text-center transition-all border ${
                          isDeliverySelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-card text-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <Truck className="size-3.5 mb-0.5" />
                        <span>Kirim</span>
                        <span className="text-[10px] opacity-80 font-normal">Kurir</span>
                      </button>

                      {/* Kilat / Express */}
                      <button
                        type="button"
                        onClick={() => handleExpressServiceChange(!isExpressSelected)}
                        className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center text-center transition-all border ${
                          isExpressSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-card text-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <Zap className="size-3.5 mb-0.5" />
                        <span>Kilat</span>
                        <span className="text-[10px] opacity-80 font-normal">Prioritas</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Customer Details Form */}
                <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2.5">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsPelangganExpanded(!isPelangganExpanded)}
                  >
                    <span className="text-xs font-bold text-foreground">Data Pemesan</span>
                    {isPelangganExpanded ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
                  </div>

                  {isPelangganExpanded && (
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1 relative">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="customer-name" className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                              <User className="size-3 text-primary" />
                              <span>Nama Pelanggan *</span>
                            </Label>
                            {isLoadingCustomers && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Loader2 className="size-2.5 animate-spin text-primary" />
                                <span>Sinkron...</span>
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Input
                              ref={customerNameInputRef}
                              id="customer-name"
                              placeholder="Ketik nama atau no. telepon..."
                              value={customerDetails.name}
                              onChange={(e) => {
                                setCustomerDetails(prev => ({ ...prev, name: e.target.value }));
                                setShowSuggestions(true);
                                setSelectedSuggestionIndex(-1);
                              }}
                              onFocus={() => {
                                if (customerDetails.name.trim().length >= 1) {
                                  setShowSuggestions(true);
                                }
                              }}
                              onKeyDown={handleCustomerKeyDown}
                              className="h-8 text-xs bg-background pr-6"
                              required
                              autoComplete="off"
                            />
                            <Search className="size-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                          </div>

                          {/* Customer Suggestions Dropdown */}
                          {showSuggestions && filteredCustomers.length > 0 && (
                            <div
                              ref={suggestionsRef}
                              className="absolute left-0 top-full mt-1.5 w-[280px] sm:w-[320px] max-w-[90vw] z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-xl overflow-hidden py-1 animate-in fade-in-0 zoom-in-95 duration-150"
                            >
                              <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 flex items-center justify-between bg-muted/30">
                                <span>Riwayat Pelanggan ({filteredCustomers.length})</span>
                                <span className="text-[9px] font-normal lowercase">Enter / klik untuk isi</span>
                              </div>
                              <div className="max-h-56 overflow-y-auto divide-y divide-border/40">
                                {filteredCustomers.map((cust, idx) => {
                                  const isSelected = idx === selectedSuggestionIndex;
                                  return (
                                    <button
                                      key={cust.id}
                                      type="button"
                                      onClick={() => handleSelectCustomer(cust)}
                                      onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                                      className={`w-full text-left px-2.5 py-2 flex flex-col gap-0.5 transition-colors ${
                                        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-semibold text-xs text-foreground truncate">
                                          {cust.name}
                                        </span>
                                        {cust.orderCount > 1 && (
                                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20 shrink-0">
                                            {cust.orderCount}x order
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                                        <span className="flex items-center gap-1 shrink-0">
                                          <Phone className="size-2.5 text-muted-foreground/70" />
                                          <span>{cust.phone || cust.formattedPhone || '-'}</span>
                                        </span>
                                        {cust.institution && cust.institution !== '-' && cust.institution.toLowerCase() !== 'umum' && (
                                          <span className="flex items-center gap-1 truncate">
                                            <Building2 className="size-2.5 text-muted-foreground/70 shrink-0" />
                                            <span className="truncate">{cust.institution}</span>
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label htmlFor="customer-phone" className="text-[11px] font-semibold text-muted-foreground">
                            No. WhatsApp *
                          </Label>
                          <Input
                            id="customer-phone"
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            value={customerDetails.phone}
                            onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                            className="h-8 text-xs bg-background"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <Label htmlFor="customer-cabang" className="text-[11px] font-semibold text-muted-foreground">
                            Cabang Transaksi *
                          </Label>
                          <select
                            id="customer-cabang"
                            value={customerDetails.cabang}
                            onChange={(e) => setCustomerDetails(prev => ({ ...prev, cabang: e.target.value }))}
                            className="h-8 text-xs font-medium border border-border rounded-md bg-background text-foreground px-2"
                            required
                          >
                            <option value="" disabled>Pilih Cabang</option>
                            <option value="Cabang Belwis">Cabang Belwis</option>
                            <option value="Cabang Unila">Cabang Unila</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label htmlFor="customer-instansi" className="text-[11px] font-semibold text-muted-foreground">
                            Instansi (Opsional)
                          </Label>
                          <Input
                            id="customer-instansi"
                            placeholder="Kampus, kantor, dll"
                            value={customerDetails.instansi}
                            onChange={(e) => setCustomerDetails(prev => ({ ...prev, instansi: e.target.value }))}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                      </div>

                      {/* Deadline Pickers */}
                      <div className="flex flex-col gap-1 pt-1.5 border-t border-border">
                        <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                          <Calendar className="size-3 text-primary" />
                          <span>Deadline Pengerjaan *</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={customerDetails.deadline}
                            onChange={(e) => setCustomerDetails(prev => ({ ...prev, deadline: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="h-8 px-2 text-xs border border-border rounded-md bg-background text-foreground outline-none cursor-pointer"
                          />
                          <TimePicker
                            value={customerDetails.deadlineTime || ''}
                            onChange={(time) => setCustomerDetails(prev => ({ ...prev, deadlineTime: time }))}
                            placeholder="Waktu selesai"
                            className="h-8 text-xs bg-background border-border"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2">
                  <span className="text-xs font-bold text-foreground">Ringkasan Pembayaran</span>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal Item</span>
                      <span className="font-mono font-medium text-foreground">{formatCurrency(subtotal)}</span>
                    </div>

                    {totalDiscounts > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Potongan Diskon</span>
                        <span className="font-mono">- {formatCurrency(totalDiscounts)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-black text-foreground pt-1.5 border-t border-border">
                      <span>Total Tagihan</span>
                      <span className="font-mono text-primary text-base">{formatCurrency(finalTotal)}</span>
                    </div>

                    {/* DP Input */}
                    <div className="pt-2 border-t border-border flex flex-col gap-1">
                      <Label htmlFor="downPayment" className="text-[11px] font-semibold text-muted-foreground">
                        Uang Muka / DP (Ketik nominal, misal: 100 = 100.000)
                      </Label>
                      <Input
                        id="downPayment"
                        type="text"
                        placeholder="Masukkan nominal DP..."
                        value={dpDisplayValue}
                        onChange={(e) => {
                          let inputValue = e.target.value.replace(/[^\d.]/g, '');
                          const parts = inputValue.split('.');
                          if (parts.length > 2) {
                            inputValue = parts[0] + '.' + parts.slice(1).join('');
                          }
                          const numericValue = inputValue === '' || inputValue === '.' ? 0 : parseFloat(inputValue);
                          const actualValue = numericValue * 1000;

                          if (actualValue <= finalTotal) {
                            setDownPayment(actualValue);
                            setDpDisplayValue(inputValue);
                          } else {
                            setDownPayment(finalTotal);
                            const displayValue = (finalTotal / 1000).toFixed(1).replace(/\.?0+$/, '');
                            setDpDisplayValue(displayValue);
                            toast.warning('DP tidak boleh melebihi total');
                          }
                        }}
                        className="h-8 text-xs bg-background font-mono"
                      />
                      {dpDisplayValue && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Tercatat: <strong>{formatCurrency(downPayment)}</strong>
                        </span>
                      )}
                    </div>

                    {/* Sisa Tagihan */}
                    {downPayment > 0 && (
                      <div className="flex justify-between text-xs font-bold text-destructive pt-1">
                        <span>Sisa Pelunasan:</span>
                        <span className="font-mono">{formatCurrency(finalTotal - downPayment)}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary CTA Button */}
                  <Button
                    className="w-full h-10 mt-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-2 shadow-xs cursor-pointer"
                    onClick={handleProcessOrder}
                    disabled={
                      items.length === 0 ||
                      isProcessing ||
                      isPrinting ||
                      isExportingPDF ||
                      !customerDetails.name.trim() ||
                      !customerDetails.phone.trim() ||
                      !customerDetails.deadline ||
                      !customerDetails.cabang
                    }
                  >
                    <Check className="size-4" />
                    <span>{isProcessing ? "Memproses Transaksi..." : "Proses Pesanan"}</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Info Dialog */}
      <DeliveryInfoDialog
        open={showDeliveryDialog}
        onOpenChange={setShowDeliveryDialog}
        onSubmit={handleDeliveryInfoSubmit}
        onCancel={() => {
          setIsDeliverySelected(false);
          setShowDeliveryDialog(false);
        }}
      />
    </>
  );
}