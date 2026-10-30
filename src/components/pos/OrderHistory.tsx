import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Download,
  MessageCircle,
  RefreshCw,
  Loader2,
  Search,
  Trash2,
  LayoutGrid,
  List,
  Pencil,
  Copy,
  Check,
  X,
  QrCode,
  ClipboardList,
  ClipboardCheck,
  Table as TableIcon,
  SlidersHorizontal,
  UserCheck,
  Calendar,
  Clock,
  RotateCcw,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { convertImageToBase64 } from "@/utils/product";
import { generateReceiptHTML, type ReceiptData } from "@/utils/receiptTemplate";
import { fetchOrderHistory, type OrderHistoryItem } from "@/utils/api";
import { updateOrderStatus, deleteOrder, clearAdminCache, restoreOrder, assignDesigner } from "@/utils/adminApi";
import { EditOrderModal } from "./EditOrderModal";
import { ProductionScheduleModal } from "./ProductionScheduleModal";
import { ClosingUpdateModal } from "./ClosingUpdateModal";
import { submitPOSOrder } from "@/utils/api";

interface OrderHistoryProps {
  onBack?: () => void;
  cashierName?: string;
  cabang?: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'partial', label: 'DP', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'done', label: 'Selesai', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const STATUS_PRIORITY: Record<string, number> = { pending: 0, partial: 1, done: 2 };

const CHANNEL_OPTIONS = [
  { value: 'all', label: 'Semua Channel' },
  { value: 'pos', label: 'POS' },
  { value: 'website', label: 'Web' },
  { value: 'migrated', label: 'Old' },
];

function apiOrderToReceiptData(order: OrderHistoryItem): ReceiptData {
  return {
    receiptId: order.orderId,
    timestamp: order.timestamp,
    cashier: order.cashier || "Kasir",
    cabang: order.cabang || undefined,
    customer: order.customerName ? {
      name: order.customerName,
      phone: String(order.customerPhone || ''),
      instansi: order.institution || '',
      delivery: order.address ? {
        recipientName: order.customerName,
        recipientPhone: String(order.customerPhone || ''),
        address: order.address,
      } : undefined,
    } : undefined,
    items: (order.items || []).map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal || (item.price * item.quantity),
      modelCode: item.modelCode || undefined,
      caseVariant: item.caseVariant || undefined,
      laminationVariant: item.lamination || undefined,
      width: item.width || undefined,
      height: item.height || undefined,
    })),
    summary: {
      subtotal: order.subtotal,
      discount: order.discount || 0,
      total: order.total,
      downPayment: order.downPayment || undefined,
      remainingBalance: order.remainingBalance || undefined,
    },
  };
}

const formatCurrency = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;

const formatPhoneForWA = (phone: string | number): string => {
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('08')) return '62' + cleaned.substring(1);
  if (cleaned.startsWith('62')) return cleaned;
  if (cleaned.startsWith('8')) return '62' + cleaned;
  return '62' + cleaned;
};

// Clean 2-line date styling helper
interface ParsedDateDisplay {
  datePart: string;
  timePart: string | null;
}

const parseDeadline = (deadlineVal?: string | null): ParsedDateDisplay => {
  if (!deadlineVal) return { datePart: 'Belum diatur', timePart: null };
  try {
    const dl = String(deadlineVal).trim();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = new Date(dl);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = d.getHours();
      const mins = d.getMinutes();
      const datePart = `${day} ${month} ${year}`;
      const timePart = (hours !== 0 || mins !== 0) ? `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}` : null;
      return { datePart, timePart };
    }
    return { datePart: dl, timePart: null };
  } catch {
    return { datePart: String(deadlineVal), timePart: null };
  }
};

export function OrderHistory({ onBack, cashierName, cabang }: OrderHistoryProps) {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [logoTidurlah, setLogoTidurlah] = useState<string>("");
  const [logoUnila, setLogoUnila] = useState<string>("");
  const [logoBelwis, setLogoBelwis] = useState<string>("");
  const [surveyQRBase64, setSurveyQRBase64] = useState<string>("");
  const [qrisBase64, setQrisBase64] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Month date range filter (default: current month e.g. "2026-10")
  const getCurrentMonthStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };
  const [monthFilter, setMonthFilter] = useState<string>(getCurrentMonthStr);

  // Set default view: Table for desktop (window.innerWidth >= 1024), else List for mobile
  const [viewMode, setViewMode] = useState<'table' | 'list' | 'grid'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return 'table';
    }
    return 'list';
  });

  const [statusFilter, setStatusFilter] = useState<string>('partial');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [cabangFilter, setCabangFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<string>('priority');
  const [editingOrder, setEditingOrder] = useState<OrderHistoryItem | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);

  // Designer Assignment State
  const DEFAULT_DESIGNERS = ["Fitri", "Windy", "Stevan"];
  const [customDesigners, setCustomDesigners] = useState<string[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [designerPopoverOpen, setDesignerPopoverOpen] = useState<string | null>(null);
  const [isAddingNewDesigner, setIsAddingNewDesigner] = useState<string | null>(null);
  const [newDesignerName, setNewDesignerName] = useState("");

  useEffect(() => {
    if (channelFilter !== 'trash') {
      const cached = localStorage.getItem('orderHistory_cache');
      if (cached) {
        try { setOrders(JSON.parse(cached)); } catch { /* ignore */ }
      }
    }
    loadImages();

    try {
      const savedDesigners = localStorage.getItem('customDesigners');
      if (savedDesigners) setCustomDesigners(JSON.parse(savedDesigners));
    } catch { /* ignore */ }
  }, [channelFilter]);

  const loadImages = async () => {
    try {
      const logoT = await convertImageToBase64('/product-image/Tidurlah Logo Horizontal.png');
      setLogoTidurlah(logoT);

      const logoU = await convertImageToBase64('/logo_nono.jpeg');
      setLogoUnila(logoU);

      const logoB = await convertImageToBase64('/logo-idcard-lampung.jpg');
      setLogoBelwis(logoB);

      const qr = await convertImageToBase64('/product-image/survey-qr.png');
      setSurveyQRBase64(qr);

      const qris = await convertImageToBase64('/qris.jpeg');
      setQrisBase64(qris);
    } catch {
      setLogoTidurlah('/product-image/Tidurlah Logo Horizontal.png');
      setLogoUnila('/logo_nono.jpeg');
      setLogoBelwis('/logo-idcard-lampung.jpg');
      setSurveyQRBase64('/product-image/survey-qr.png');
      setQrisBase64('/qris.jpeg');
    }
  };

  const PAGE_SIZE = 50;

  const refreshFromAPI = async (forceChannel?: string, forceSearch?: string) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const activeChannel = forceChannel ?? channelFilter;
      const chParam = activeChannel === 'trash' ? 'trash' : undefined;
      const searchParam = forceSearch !== undefined ? forceSearch : search;

      const result = await fetchOrderHistory({
        limit: PAGE_SIZE,
        channel: chParam,
        search: searchParam.trim() || undefined
      });
      if (result.success && result.orders) {
        setOrders(result.orders);
        setTotalOrders(result.total || result.orders.length);
        if (activeChannel !== 'trash' && !searchParam.trim()) {
          localStorage.setItem('orderHistory_cache', JSON.stringify(result.orders));
        }
      } else if (result.error) {
        setLoadError(result.error);
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat data dari server");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreOrders = async () => {
    if (isLoadingMore || orders.length >= totalOrders) return;
    setIsLoadingMore(true);
    try {
      const chParam = channelFilter === 'trash' ? 'trash' : undefined;
      const result = await fetchOrderHistory({
        limit: PAGE_SIZE,
        offset: orders.length,
        channel: chParam,
        search: search.trim() || undefined
      });
      if (result.success && result.orders) {
        const existingIds = new Set(orders.map(o => o.orderId));
        const newOrders = result.orders.filter(o => !existingIds.has(o.orderId));
        if (newOrders.length > 0) {
          const merged = [...orders, ...newOrders];
          setOrders(merged);
          setTotalOrders(result.total || merged.length);
          if (channelFilter !== 'trash' && !search.trim()) {
            localStorage.setItem('orderHistory_cache', JSON.stringify(merged));
          }
        } else {
          setTotalOrders(orders.length);
        }
      }
    } catch {
      toast.error("Gagal memuat lebih banyak pesanan");
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      refreshFromAPI(channelFilter, search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search, channelFilter]);

  useEffect(() => {
    if (channelFilter === 'trash') {
      refreshFromAPI('trash');
    } else {
      const cached = localStorage.getItem('orderHistory_cache');
      if (cached) {
        try { setOrders(JSON.parse(cached)); } catch { /* ignore */ }
      }
      refreshFromAPI(channelFilter);
    }
  }, [channelFilter]);

  // Compute status counts for filter badges
  const statusCounts = useMemo(() => {
    let base = orders;
    if (cabangFilter !== 'all') {
      base = base.filter(o => (o.cabang || 'Cabang Belwis') === cabangFilter);
    }
    if (monthFilter !== 'all') {
      base = base.filter(o => {
        const target = o.timestamp || o.deadline || '';
        return target.startsWith(monthFilter);
      });
    }

    const counts: Record<string, number> = { all: base.length, pending: 0, partial: 0, done: 0 };
    base.forEach(o => {
      const s = (o.orderStatus || '').toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [orders, cabangFilter, monthFilter]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Date Range (Month) Filter
    if (monthFilter !== 'all') {
      result = result.filter(o => {
        const target = o.timestamp || o.deadline || '';
        return target.startsWith(monthFilter);
      });
    }

    if (statusFilter !== 'all') {
      result = result.filter(o => (o.orderStatus || '').toLowerCase() === statusFilter);
    }

    if (channelFilter !== 'all' && channelFilter !== 'trash') {
      result = result.filter(o => (o.channel || '') === channelFilter);
    }

    if (cabangFilter !== 'all') {
      result = result.filter(o => (o.cabang || 'Cabang Belwis') === cabangFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        (o.orderId || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        String(o.customerPhone || '').includes(q)
      );
    }

    if (sortMode === 'deadline_asc') {
      result = [...result].sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (da === db) {
          const pa = STATUS_PRIORITY[(a.orderStatus || '').toLowerCase()] ?? 99;
          const pb = STATUS_PRIORITY[(b.orderStatus || '').toLowerCase()] ?? 99;
          return pa - pb;
        }
        return da - db;
      });
    } else if (sortMode === 'name_asc') {
      result = [...result].sort((a, b) => {
        const na = (a.customerName || '').toLowerCase();
        const nb = (b.customerName || '').toLowerCase();
        if (na === nb) {
          const pa = STATUS_PRIORITY[(a.orderStatus || '').toLowerCase()] ?? 99;
          const pb = STATUS_PRIORITY[(b.orderStatus || '').toLowerCase()] ?? 99;
          return pa - pb;
        }
        return na.localeCompare(nb);
      });
    } else {
      result = [...result].sort((a, b) => {
        const pa = STATUS_PRIORITY[(a.orderStatus || '').toLowerCase()] ?? 99;
        const pb = STATUS_PRIORITY[(b.orderStatus || '').toLowerCase()] ?? 99;
        return pa - pb;
      });
    }

    return result;
  }, [orders, search, statusFilter, channelFilter, cabangFilter, sortMode, monthFilter]);

  const handleDownloadReceipt = async (order: OrderHistoryItem, showQRIS: boolean = false) => {
    setDownloadingId(order.orderId);
    const receiptData = apiOrderToReceiptData(order);

    try {
      const div = document.createElement('div');
      const topLogo = order.cabang === 'Cabang Unila' ? logoUnila : logoBelwis;
      div.innerHTML = generateReceiptHTML(receiptData, topLogo, surveyQRBase64, logoTidurlah, showQRIS, qrisBase64);
      div.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:350px;background:white;padding:0;margin:0;box-sizing:border-box;';
      document.body.appendChild(div);
      const imgs = div.querySelectorAll('img');
      await Promise.all(Array.from(imgs).map(img =>
        img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
      ));
      await new Promise(r => setTimeout(r, 200));
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(div, {
        backgroundColor: '#ffffff', scale: 3, width: 350, height: div.scrollHeight,
        useCORS: true, allowTaint: true, logging: false, removeContainer: true,
      });
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `receipt-${showQRIS ? 'qris-' : ''}${receiptData.receiptId}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        document.body.removeChild(div);
      });
    } catch (err) {
      console.error('Error generating receipt:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleChatCustomer = (order: OrderHistoryItem) => {
    if (!order.customerPhone) return;
    const phone = formatPhoneForWA(order.customerPhone);
    const name = order.customerName || 'Pelanggan';
    const shippingAddr = order.delivery?.address || order.address;
    const hasShipping = !!shippingAddr;
    const isPaid = (order.remainingBalance !== undefined ? order.remainingBalance : (order.total - (order.downPayment || 0))) <= 0;

    let msg = `*PESANAN SELESAI*\n\n`;
    msg += `Halo Kak *${name}*,\n`;
    msg += `Pesanan dengan nomor invoice *${order.orderId}* sudah selesai diproses.\n\n`;

    if (order.items && order.items.length > 0) {
      msg += `*Detail Pesanan:*\n`;
      order.items.forEach(item => {
        msg += `- ${item.name} (${item.quantity}x)\n`;
      });
      msg += `\n`;
    }

    msg += `*Total Pesanan:* ${formatCurrency(order.total)}\n`;
    if (order.downPayment > 0) {
      msg += `*Sudah Dibayar (DP):* ${formatCurrency(order.downPayment)}\n`;
      msg += `*Sisa Pembayaran:* ${isPaid ? 'Lunas' : formatCurrency(order.remainingBalance || 0)}\n\n`;
    } else {
      msg += `*Sisa Pembayaran:* ${isPaid ? 'Lunas' : formatCurrency(order.remainingBalance !== undefined ? order.remainingBalance : order.total)}\n\n`;
    }

    if (hasShipping) {
      msg += `*Tujuan Pengiriman:*\n${shippingAddr}\n\n`;
      if (isPaid) {
        msg += `Untuk pengiriman akan segera kami proses ya Kak.\n\n`;
        msg += `*Catatan:* Barang yang sudah diterima tidak dapat ditukar atau dikembalikan.`;
      } else {
        msg += `Untuk pengiriman akan kami proses segera setelah pelunasan ya Kak.\n\n`;
        msg += `*Catatan:* Mohon lakukan pelunasan terlebih dahulu sebelum paket dikirimkan. Barang yang sudah diterima tidak dapat ditukar atau dikembalikan.`;
      }
    } else {
      msg += `*Pengambilan di Toko:*\nhttps://idcardlampung.com/hello\n\n`;
      if (isPaid) {
        msg += `Pesanan Kakak sudah dapat diambil di toko ya Kak. Mohon konfirmasi kembali kapan Kakak ingin mengambil pesanan ini.\n\n`;
        msg += `*Catatan:* Barang yang sudah diterima tidak dapat ditukar atau dikembalikan.`;
      } else {
        msg += `Mohon konfirmasi kembali kapan Kakak ingin mengambil pesanan ini ya.\n\n`;
        msg += `*Catatan:* Mohon melakukan pelunasan terlebih dahulu. Barang yang sudah diterima tidak dapat ditukar atau dikembalikan.`;
      }
    }

    msg += `\n\nTerima kasih atas kepercayaannya!\n*ID Card Lampung by Tidurlah Grafika*`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Teks disalin ke clipboard!");
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));

    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      clearAdminCache();
      setTimeout(() => refreshFromAPI(), 1500);
    }
    setUpdatingId(null);
  };

  const handleDelete = async (orderId: string) => {
    setDeletingId(orderId);
    const result = await deleteOrder(orderId, cashierName || 'Cashier');
    if (result.success) {
      setOrders(prev => prev.filter(o => o.orderId !== orderId));
      setConfirmDeleteId(null);
      clearAdminCache();
      setTimeout(() => refreshFromAPI(), 1500);
    } else {
      toast.error("Gagal menghapus pesanan");
    }
    setDeletingId(null);
  };

  const handleRestore = async (orderId: string) => {
    setUpdatingId(orderId);
    const result = await restoreOrder(orderId);
    if (result.success) {
      setOrders(prev => prev.filter(o => o.orderId !== orderId));
      clearAdminCache();
    } else {
      toast.error("Gagal mengembalikan pesanan");
    }
    setUpdatingId(null);
  };

  const handleSaveEdit = async (updatedOrderData: any) => {
    clearAdminCache();
    await submitPOSOrder(updatedOrderData);
    refreshFromAPI();
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'deleted') {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-semibold py-0.5 px-2">
          Terhapus
        </Badge>
      );
    }
    const opt = STATUS_OPTIONS.find(item => item.value === s);
    if (opt) {
      return (
        <Badge variant="outline" className={`text-[10px] font-semibold py-0.5 px-2 ${opt.className}`}>
          {opt.label}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px] py-0.5 px-2">
        {status}
      </Badge>
    );
  };

  const getChannelBadge = (ch: string) => {
    if (ch === 'website') return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] py-0 px-1.5 font-medium">Web</Badge>;
    if (ch === 'pos') return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] py-0 px-1.5 font-medium">POS</Badge>;
    if (ch === 'migrated') return <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] py-0 px-1.5 font-medium">Old</Badge>;
    return null;
  };

  const getCabangBadge = (cabangName?: string | null) => {
    const branch = cabangName || 'Cabang Belwis';
    const isUnila = branch.toLowerCase().includes('unila');
    return (
      <Badge variant="outline" className={`text-[10px] py-0 px-1.5 font-medium ${isUnila ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>
        {isUnila ? 'Unila' : 'Belwis'}
      </Badge>
    );
  };

  const handleAssignDesigner = async (orderId: string, designerName: string) => {
    if (!designerName) return;
    setAssigningId(orderId);
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, designer: designerName } : o));

    const result = await assignDesigner(orderId, designerName);
    if (result.success) {
      toast.success(`Desainer ditetapkan ke ${designerName}`);
      clearAdminCache();
      setDesignerPopoverOpen(null);
    } else {
      toast.error("Gagal menetapkan desainer");
    }
    setAssigningId(null);
  };

  const handleAddNewDesigner = (orderId: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const name = newDesignerName.trim();
    if (name) {
      if (!DEFAULT_DESIGNERS.includes(name) && !customDesigners.includes(name)) {
        const added = [...customDesigners, name];
        setCustomDesigners(added);
        localStorage.setItem('customDesigners', JSON.stringify(added));
      }
      handleAssignDesigner(orderId, name);
      setIsAddingNewDesigner(null);
      setNewDesignerName("");
    }
  };

  const handleDeleteDesigner = (nameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Hapus ${nameToDelete} dari daftar?`)) {
      const filtered = customDesigners.filter(d => d !== nameToDelete);
      setCustomDesigners(filtered);
      localStorage.setItem('customDesigners', JSON.stringify(filtered));
    }
  };

  // Compact Designer Picker Popover
  const renderDesignerPopover = (order: OrderHistoryItem) => {
    const hasJasaDesain = order.items?.some(i => i.name.toLowerCase().includes("jasa desain"));
    if (!hasJasaDesain || order.orderStatus === 'deleted') return null;

    const currentDesigner = order.designer;
    const allDesigners = Array.from(new Set([...DEFAULT_DESIGNERS, ...customDesigners]));

    return (
      <div onClick={e => e.stopPropagation()}>
        <Popover
          open={designerPopoverOpen === order.orderId}
          onOpenChange={(open) => setDesignerPopoverOpen(open ? order.orderId : null)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-6 px-2 text-[10px] font-semibold gap-1 border rounded-full transition-all ${
                currentDesigner
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-muted/70 text-muted-foreground border-dashed border-border hover:border-amber-400 hover:text-amber-700'
              }`}
              title="Atur Desainer"
            >
              <UserCheck className="size-3 text-amber-600" />
              <span className="truncate max-w-[80px]">
                {currentDesigner ? currentDesigner : "Pilih Desain"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between pb-1 border-b">
                <span className="text-xs font-semibold text-foreground">Pilih Desainer</span>
                {assigningId === order.orderId && <Loader2 className="size-3 animate-spin text-primary" />}
              </div>

              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pt-1">
                {allDesigners.map(d => (
                  <div
                    key={d}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                      currentDesigner === d ? 'bg-amber-100/70 text-amber-900 font-bold' : 'hover:bg-muted text-foreground'
                    }`}
                    onClick={() => handleAssignDesigner(order.orderId, d)}
                  >
                    <span>{d}</span>
                    <div className="flex items-center gap-1">
                      {currentDesigner === d && <Check className="size-3 text-amber-700" />}
                      {customDesigners.includes(d) && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDesigner(d, e)}
                          className="p-0.5 text-muted-foreground hover:text-destructive rounded"
                          title="Hapus desainer"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {isAddingNewDesigner === order.orderId ? (
                <form onSubmit={(e) => handleAddNewDesigner(order.orderId, e)} className="flex items-center gap-1 mt-1">
                  <Input
                    autoFocus
                    className="h-7 text-xs px-2"
                    placeholder="Nama baru..."
                    value={newDesignerName}
                    onChange={e => setNewDesignerName(e.target.value)}
                  />
                  <Button type="submit" size="sm" className="h-7 px-2 text-xs">Simpan</Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5"
                    onClick={() => setIsAddingNewDesigner(null)}
                  >
                    <X className="size-3" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground justify-start px-2 font-normal"
                  onClick={() => {
                    setIsAddingNewDesigner(order.orderId);
                    setNewDesignerName("");
                  }}
                >
                  + Tambah Desainer Baru
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const activeFiltersCount = (cabangFilter !== 'all' ? 1 : 0) + (channelFilter !== 'all' ? 1 : 0) + (sortMode !== 'priority' ? 1 : 0) + (monthFilter !== 'all' ? 1 : 0);

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-5 bg-background text-foreground">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" className="size-8" onClick={onBack} title="Kembali">
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">Riwayat Pesanan</h2>
                <Badge variant="secondary" className="font-mono text-xs font-semibold">
                  {totalOrders}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">Kelola status, struk, dan penugasan desainer</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClosingModal(true)}
              className="gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/60 border-blue-200 hover:bg-blue-100/60 h-8"
              title="Laporan Closing"
            >
              <ClipboardCheck className="size-3.5" />
              <span className="hidden md:inline">Laporan Closing</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScheduleModal(true)}
              className="gap-1.5 text-xs font-semibold h-8"
              title="Jadwal Produksi"
            >
              <ClipboardList className="size-3.5" />
              <span className="hidden md:inline">Jadwal Produksi</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => refreshFromAPI()}
              disabled={isLoading}
              title="Refresh dari server"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama pelanggan, invoice ID, atau nomor WhatsApp..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-9 h-10 text-sm bg-card border-border"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { value: 'all', label: 'Semua', count: statusCounts.all || 0 },
              { value: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
              { value: 'partial', label: 'DP', count: statusCounts.partial || 0 },
              { value: 'done', label: 'Selesai', count: statusCounts.done || 0 },
            ].map(tab => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Desktop Inline / Mobile Popover */}
          <div className="flex items-center justify-between md:justify-end gap-2">
            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Month Date Range Picker */}
              <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-2 py-1 text-xs">
                <Calendar className="size-3.5 text-muted-foreground" />
                <input
                  type="month"
                  value={monthFilter === 'all' ? '' : monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value || 'all')}
                  className="bg-transparent text-xs font-medium text-foreground cursor-pointer outline-none"
                  title="Filter Bulan"
                />
                {monthFilter !== 'all' && (
                  <button
                    onClick={() => setMonthFilter('all')}
                    className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    title="Tampilkan Semua Bulan"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              <select
                value={cabangFilter}
                onChange={e => setCabangFilter(e.target.value)}
                className="text-xs font-medium border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">Semua Cabang</option>
                <option value="Cabang Belwis">Cabang Belwis</option>
                <option value="Cabang Unila">Cabang Unila</option>
              </select>

              <select
                value={channelFilter}
                onChange={e => setChannelFilter(e.target.value)}
                className="text-xs font-medium border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {CHANNEL_OPTIONS.map(ch => (
                  <option key={ch.value} value={ch.value}>{ch.label}</option>
                ))}
              </select>

              <select
                value={sortMode}
                onChange={e => setSortMode(e.target.value)}
                disabled={channelFilter === 'trash'}
                className="text-xs font-medium border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
              >
                <option value="priority">Urut: Status</option>
                <option value="deadline_asc">Urut: Deadline</option>
                <option value="name_asc">Urut: Nama (A-Z)</option>
              </select>
            </div>

            {/* Mobile Filter Popover Trigger */}
            <div className="flex lg:hidden items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <SlidersHorizontal className="size-3.5" />
                    <span>Filter</span>
                    {activeFiltersCount > 0 && (
                      <span className="size-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-68 p-3 flex flex-col gap-3" align="start">
                  <div className="text-xs font-bold text-foreground">Filter & Urutan</div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-semibold text-muted-foreground">Periode Bulan</label>
                    <div className="flex items-center gap-1.5 border rounded-md px-2 py-1 bg-background">
                      <input
                        type="month"
                        value={monthFilter === 'all' ? '' : monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value || 'all')}
                        className="bg-transparent text-xs w-full outline-none"
                      />
                      {monthFilter !== 'all' && (
                        <button onClick={() => setMonthFilter('all')} className="text-muted-foreground hover:text-foreground text-[10px]">
                          Semua
                        </button>
                      )}
                    </div>

                    <label className="text-[11px] font-semibold text-muted-foreground">Cabang</label>
                    <select
                      value={cabangFilter}
                      onChange={e => setCabangFilter(e.target.value)}
                      className="text-xs border rounded-md px-2 py-1.5 bg-background text-foreground"
                    >
                      <option value="all">Semua Cabang</option>
                      <option value="Cabang Belwis">Cabang Belwis</option>
                      <option value="Cabang Unila">Cabang Unila</option>
                    </select>

                    <label className="text-[11px] font-semibold text-muted-foreground">Channel</label>
                    <select
                      value={channelFilter}
                      onChange={e => setChannelFilter(e.target.value)}
                      className="text-xs border rounded-md px-2 py-1.5 bg-background text-foreground"
                    >
                      {CHANNEL_OPTIONS.map(ch => (
                        <option key={ch.value} value={ch.value}>{ch.label}</option>
                      ))}
                    </select>

                    <label className="text-[11px] font-semibold text-muted-foreground">Urutkan</label>
                    <select
                      value={sortMode}
                      onChange={e => setSortMode(e.target.value)}
                      disabled={channelFilter === 'trash'}
                      className="text-xs border rounded-md px-2 py-1.5 bg-background text-foreground"
                    >
                      <option value="priority">Status Prioritas</option>
                      <option value="deadline_asc">Deadline Terdekat</option>
                      <option value="name_asc">Nama (A-Z)</option>
                    </select>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Trash Button */}
            <Button
              variant={channelFilter === 'trash' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => {
                setChannelFilter(channelFilter === 'trash' ? 'all' : 'trash');
                if (channelFilter !== 'trash') setStatusFilter('all');
              }}
              className={`h-8 gap-1.5 text-xs font-semibold ${
                channelFilter !== 'trash' ? 'text-destructive border-destructive/20 hover:bg-destructive/10' : ''
              }`}
              title="Lihat Pesanan Terhapus"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Sampah</span>
            </Button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-muted p-0.5 rounded-lg border border-border">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                title="Tampilan Tabel"
              >
                <TableIcon className="size-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                title="Tampilan List"
              >
                <List className="size-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all hidden sm:block ${viewMode === 'grid' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Menampilkan <strong className="text-foreground">{filteredOrders.length}</strong> dari {totalOrders} pesanan</span>
          {channelFilter === 'trash' && (
            <Badge variant="destructive" className="text-[10px]">Mode Kotak Sampah</Badge>
          )}
        </div>

        {/* Error / Loading alerts */}
        {loadError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs px-3 py-2 rounded-lg">
            {loadError}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-xs">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Memperbarui data pesanan...</span>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && !isLoading ? (
          <div className="text-center py-16 border rounded-xl bg-card">
            <p className="text-base font-semibold text-foreground mb-1">Belum ada riwayat pesanan</p>
            <p className="text-xs text-muted-foreground mb-4">Klik tombol refresh untuk memuat data dari server</p>
            <Button variant="outline" size="sm" onClick={() => refreshFromAPI()}>
              <RefreshCw className="size-4 mr-2" /> Muat Data
            </Button>
          </div>
        ) : (
          <>
            {/* TABLE VIEW (Desktop Optimized with Full Comprehensive Headers) */}
            {viewMode === 'table' ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[190px] min-w-[180px] font-semibold text-xs whitespace-nowrap">Invoice & Kasir</TableHead>
                      <TableHead className="font-semibold text-xs min-w-[160px]">Pelanggan & Instansi</TableHead>
                      <TableHead className="w-[140px] min-w-[130px] font-semibold text-xs whitespace-nowrap">Deadline</TableHead>
                      <TableHead className="w-[180px] min-w-[170px] font-semibold text-xs">Rincian Item</TableHead>
                      <TableHead className="w-[110px] min-w-[100px] font-semibold text-xs">Status</TableHead>
                      <TableHead className="w-[120px] min-w-[110px] font-semibold text-xs">Desainer</TableHead>
                      <TableHead className="w-[140px] min-w-[130px] font-semibold text-xs text-right whitespace-nowrap">Total & Sisa</TableHead>
                      <TableHead className="w-[130px] min-w-[120px] font-semibold text-xs text-right whitespace-nowrap">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map(order => {
                      const isPaid = (order.remainingBalance !== undefined ? order.remainingBalance : (order.total - (order.downPayment || 0))) <= 0;
                      const dl = parseDeadline(order.deadline);
                      const isExpanded = expandedOrder === order.orderId;

                      return (
                        <>
                          <TableRow
                            key={order.orderId}
                            className="hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
                          >
                            {/* Invoice, Channel, Branch & Cashier */}
                            <TableCell className="py-3">
                              <div className="flex flex-col gap-1">
                                <span className="font-mono text-xs font-semibold text-foreground whitespace-nowrap" title={order.orderId}>
                                  {order.orderId}
                                </span>
                                <div className="flex items-center gap-1 flex-wrap">
                                  {getChannelBadge(order.channel)}
                                  {getCabangBadge(order.cabang)}
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  Kasir: {order.cashier ? (order.cashier.includes('@') ? order.cashier.split('@')[0] : order.cashier) : 'Kasir'}
                                </span>
                              </div>
                            </TableCell>

                            {/* Pelanggan, Telepon & Instansi */}
                            <TableCell className="py-3">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                                  <span className="truncate max-w-[150px]" title={order.customerName || '-'}>
                                    {order.customerName || '-'}
                                  </span>
                                  {order.orderStatus !== 'deleted' && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setEditingOrder(order); }}
                                      className="text-muted-foreground hover:text-primary transition-colors p-0.5 shrink-0"
                                      title="Edit Pesanan"
                                    >
                                      <Pencil className="size-3" />
                                    </button>
                                  )}
                                </div>
                                <span className="text-[11px] text-foreground/80 font-medium truncate max-w-[150px]">
                                  {order.institution || 'Umum'}
                                </span>
                                {order.customerPhone && (
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    {order.customerPhone}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Deadline: 2-line format */}
                            <TableCell className="py-3">
                              {order.deadline ? (
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1 text-xs font-medium text-foreground whitespace-nowrap">
                                    <Calendar className="size-3 text-muted-foreground shrink-0" />
                                    <span>{dl.datePart}</span>
                                  </div>
                                  {dl.timePart && (
                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 whitespace-nowrap pl-4">
                                      <Clock className="size-2.5 shrink-0" />
                                      <span>{dl.timePart} WIB</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Belum diatur</span>
                              )}
                            </TableCell>

                            {/* Rincian Item: Compact Item List Preview */}
                            <TableCell className="py-3">
                              <div className="flex flex-col gap-0.5 max-w-[180px]">
                                {order.items && order.items.length > 0 ? (
                                  order.items.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="text-[11px] text-foreground truncate" title={`${item.name} (${item.quantity}x)`}>
                                      • {item.name} <span className="text-muted-foreground font-mono">×{item.quantity}</span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">-</span>
                                )}
                                {order.items && order.items.length > 2 && (
                                  <span className="text-[10px] text-muted-foreground font-medium">
                                    +{order.items.length - 2} item lainnya...
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Status Dropdown/Badge */}
                            <TableCell className="py-3" onClick={e => e.stopPropagation()}>
                              {order.orderStatus === 'deleted' ? (
                                getStatusBadge(order.orderStatus)
                              ) : (
                                <select
                                  value={(order.orderStatus || '').toLowerCase()}
                                  onChange={e => handleStatusChange(order.orderId, e.target.value)}
                                  disabled={updatingId === order.orderId}
                                  className="text-xs font-semibold border rounded-md px-2 py-1 bg-background text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                  {STATUS_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>
                              )}
                            </TableCell>

                            {/* Desainer */}
                            <TableCell className="py-3">
                              {renderDesignerPopover(order)}
                            </TableCell>

                            {/* Total & DP / Sisa */}
                            <TableCell className="py-3 text-right">
                              <div className="flex flex-col items-end whitespace-nowrap">
                                <span className="font-bold text-sm text-emerald-600">{formatCurrency(order.total)}</span>
                                {order.downPayment > 0 && (
                                  <span className="text-[10px] text-muted-foreground">DP: {formatCurrency(order.downPayment)}</span>
                                )}
                                {order.downPayment > 0 && !isPaid && (
                                  <span className="text-[10px] text-destructive font-semibold">Sisa: {formatCurrency(order.remainingBalance)}</span>
                                )}
                              </div>
                            </TableCell>

                            {/* Aksi */}
                            <TableCell className="py-3 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                {order.orderStatus === 'deleted' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs text-blue-600 gap-1"
                                    onClick={() => handleRestore(order.orderId)}
                                    disabled={updatingId === order.orderId}
                                  >
                                    {updatingId === order.orderId ? <Loader2 className="size-3 animate-spin" /> : <RotateCcw className="size-3" />}
                                    <span>Restore</span>
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="size-7 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleDownloadReceipt(order)}
                                      disabled={downloadingId === order.orderId}
                                      title="Unduh Struk"
                                    >
                                      {downloadingId === order.orderId ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                                    </Button>

                                    {order.customerPhone && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                        onClick={() => handleChatCustomer(order)}
                                        title="Kirim Pesan WhatsApp"
                                      >
                                        <MessageCircle className="size-3.5" />
                                      </Button>
                                    )}

                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="size-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                      onClick={() => handleDownloadReceipt(order, true)}
                                      disabled={downloadingId === order.orderId}
                                      title="Struk QRIS"
                                    >
                                      <QrCode className="size-3.5" />
                                    </Button>

                                    {confirmDeleteId === order.orderId ? (
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="h-7 px-2 text-xs"
                                          onClick={() => handleDelete(order.orderId)}
                                          disabled={deletingId === order.orderId}
                                        >
                                          Ya
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 px-2 text-xs"
                                          onClick={() => setConfirmDeleteId(null)}
                                        >
                                          Batal
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => setConfirmDeleteId(order.orderId)}
                                        title="Hapus Pesanan"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Detail Subrow when clicked */}
                          {isExpanded && (
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                              <TableCell colSpan={8} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  {/* Detail Informasi */}
                                  <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-background border border-border">
                                    <span className="font-semibold text-foreground flex items-center gap-1">
                                      <Package className="size-3.5 text-primary" />
                                      Informasi Pesanan
                                    </span>
                                    <div className="flex justify-between py-0.5 border-b border-border/40">
                                      <span className="text-muted-foreground">Kasir:</span>
                                      <span className="font-medium text-foreground">{order.cashier || 'Kasir'}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 border-b border-border/40">
                                      <span className="text-muted-foreground">Cabang:</span>
                                      <span className="font-medium text-foreground">{order.cabang || 'Cabang Belwis'}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 border-b border-border/40">
                                      <span className="text-muted-foreground">Telepon:</span>
                                      <span className="font-mono text-foreground">{order.customerPhone || '-'}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5">
                                      <span className="text-muted-foreground">Instansi:</span>
                                      <span className="font-medium text-foreground">{order.institution || 'Umum'}</span>
                                    </div>
                                  </div>

                                  {/* Pembayaran */}
                                  <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-background border border-border">
                                    <span className="font-semibold text-foreground">Rincian Pembayaran</span>
                                    <div className="flex justify-between py-0.5 border-b border-border/40">
                                      <span className="text-muted-foreground">Subtotal:</span>
                                      <span className="font-medium text-foreground">{formatCurrency(order.subtotal || order.total)}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 border-b border-border/40">
                                      <span className="text-muted-foreground">Uang Muka (DP):</span>
                                      <span className="font-medium text-foreground">{formatCurrency(order.downPayment || 0)}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5">
                                      <span className="text-muted-foreground">Sisa Pembayaran:</span>
                                      <span className={`font-bold ${isPaid ? 'text-emerald-600' : 'text-destructive'}`}>
                                        {isPaid ? 'Lunas' : formatCurrency(order.remainingBalance || 0)}
                                      </span>
                                    </div>
                                    {(order.delivery?.address || order.address) && (
                                      <div className="mt-1 pt-1 border-t border-border/40 flex items-start gap-1 text-muted-foreground">
                                        <span className="shrink-0 font-medium">Alamat:</span>
                                        <span className="truncate" title={order.delivery?.address || order.address}>{order.delivery?.address || order.address}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Rincian Lengkap Produk */}
                                  <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-background border border-border max-h-40 overflow-y-auto">
                                    <span className="font-semibold text-foreground">Semua Item ({order.items?.length || 0})</span>
                                    {order.items?.map((item, idx) => (
                                      <div key={idx} className="flex justify-between py-0.5 border-b border-border/30 last:border-0">
                                        <span className="truncate pr-2">{item.name} ×{item.quantity}</span>
                                        <span className="font-mono text-muted-foreground shrink-0">{formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* CARD / LIST VIEW (Mobile Optimized) */
              <div className={viewMode === 'list' ? "flex flex-col gap-2" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                {filteredOrders.map(order => {
                  const isExpanded = expandedOrder === order.orderId;
                  const isPaid = (order.remainingBalance !== undefined ? order.remainingBalance : (order.total - (order.downPayment || 0))) <= 0;
                  const dl = parseDeadline(order.deadline);

                  return (
                    <div
                      key={order.orderId}
                      className="rounded-xl border border-border bg-card shadow-2xs hover:border-border/80 transition-all overflow-hidden"
                    >
                      {/* Clean 2-Row Collapsed Card Header */}
                      <div
                        className="p-3.5 cursor-pointer flex flex-col gap-2 hover:bg-muted/20 transition-colors"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
                      >
                        {/* Row 1: Customer Name + Price + Shadcn More Menu Button */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-sm sm:text-base text-foreground truncate">
                              {order.customerName || '-'}
                            </span>
                            {order.orderStatus !== 'deleted' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingOrder(order); }}
                                className="text-muted-foreground hover:text-primary transition-colors p-0.5 shrink-0"
                                title="Edit Pesanan"
                              >
                                <Pencil className="size-3" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-extrabold text-sm sm:text-base text-emerald-600">
                              {formatCurrency(order.total)}
                            </span>

                            {/* Shadcn More Actions Menu in card header */}
                            <div onClick={e => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="size-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem onClick={() => handleDownloadReceipt(order)} className="gap-2 text-xs">
                                    <Download className="size-3.5" />
                                    <span>Unduh Struk</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownloadReceipt(order, true)} className="gap-2 text-xs">
                                    <QrCode className="size-3.5 text-amber-600" />
                                    <span>Struk QRIS</span>
                                  </DropdownMenuItem>
                                  {order.customerPhone && (
                                    <DropdownMenuItem onClick={() => handleChatCustomer(order)} className="gap-2 text-xs">
                                      <MessageCircle className="size-3.5 text-emerald-600" />
                                      <span>Chat WhatsApp</span>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => setEditingOrder(order)} className="gap-2 text-xs">
                                    <Pencil className="size-3.5 text-blue-600" />
                                    <span>Edit Pesanan</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {order.orderStatus === 'deleted' ? (
                                    <DropdownMenuItem onClick={() => handleRestore(order.orderId)} className="gap-2 text-xs text-blue-600">
                                      <RotateCcw className="size-3.5" />
                                      <span>Kembalikan</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => setConfirmDeleteId(order.orderId)} className="gap-2 text-xs text-destructive">
                                      <Trash2 className="size-3.5" />
                                      <span>Hapus Pesanan</span>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Invoice ID, Channel/Branch Badge (Desktop/Tablet), Status */}
                        <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                          <div className="flex items-center gap-1.5 flex-nowrap min-w-0">
                            <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                              {order.orderId}
                            </span>
                            <span className="hidden sm:inline-flex">{getChannelBadge(order.channel)}</span>
                            <span className="hidden sm:inline-flex">{getCabangBadge(order.cabang)}</span>
                            {getStatusBadge(order.orderStatus)}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {renderDesignerPopover(order)}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details Panel */}
                      {isExpanded && (
                        <div className="border-t border-border px-3.5 py-3 bg-muted/30 flex flex-col gap-3 text-xs">
                          {/* Metadata Grid */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            <div className="text-muted-foreground font-medium">Deadline</div>
                            <div className={`font-semibold ${order.deadline ? 'text-amber-700' : 'text-muted-foreground'}`}>
                              {dl.datePart} {dl.timePart ? `(${dl.timePart} WIB)` : ''}
                            </div>

                            <div className="text-muted-foreground font-medium">Kasir</div>
                            <div className="text-foreground">{order.cashier ? (order.cashier.includes('@') ? order.cashier.split('@')[0] : order.cashier) : 'Kasir'}</div>

                            {order.cabang && (
                              <>
                                <div className="text-muted-foreground font-medium">Cabang</div>
                                <div className="text-foreground font-medium">{order.cabang}</div>
                              </>
                            )}

                            {order.customerPhone && (
                              <>
                                <div className="text-muted-foreground font-medium">Telepon</div>
                                <div className="text-foreground">{order.customerPhone}</div>
                              </>
                            )}

                            {order.institution && (
                              <>
                                <div className="text-muted-foreground font-medium">Instansi</div>
                                <div className="text-foreground">{order.institution}</div>
                              </>
                            )}

                            {order.downPayment > 0 && (
                              <>
                                <div className="text-muted-foreground font-medium">Uang Muka (DP)</div>
                                <div className="text-foreground">{formatCurrency(order.downPayment)}</div>
                                <div className="text-muted-foreground font-medium">Sisa Pembayaran</div>
                                <div className="font-bold text-destructive">{isPaid ? 'Lunas' : formatCurrency(order.remainingBalance)}</div>
                              </>
                            )}

                            {(order.delivery?.address || order.address) && (
                              <>
                                <div className="text-muted-foreground font-medium">Alamat</div>
                                <div className="flex items-center gap-1 text-foreground">
                                  <span className="truncate max-w-[150px]" title={order.delivery?.address || order.address}>
                                    {order.delivery?.address || order.address}
                                  </span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(order.delivery?.address || order.address || ''); }}
                                    className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                  >
                                    <Copy className="size-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Items Breakdown */}
                          {order.items && order.items.length > 0 && (
                            <div className="pt-2 border-t border-border/60 flex flex-col gap-1">
                              <span className="text-[11px] font-semibold text-muted-foreground">Rincian Item:</span>
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs py-0.5">
                                  <span className="text-foreground truncate mr-2">
                                    {item.name} {item.modelCode ? `[${item.modelCode}]` : ''} ×{item.quantity}
                                  </span>
                                  <span className="text-muted-foreground font-medium shrink-0">
                                    {formatCurrency(item.subtotal || item.price * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Action Toolbar */}
                          <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                            {order.orderStatus === 'deleted' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs text-blue-600 gap-1.5 h-8"
                                onClick={() => handleRestore(order.orderId)}
                                disabled={updatingId === order.orderId}
                              >
                                {updatingId === order.orderId ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                                <span>Kembalikan Pesanan</span>
                              </Button>
                            ) : (
                              <>
                                <select
                                  value={(order.orderStatus || '').toLowerCase()}
                                  onChange={e => handleStatusChange(order.orderId, e.target.value)}
                                  disabled={updatingId === order.orderId}
                                  className="text-xs font-semibold border rounded-md px-2 py-1 bg-background text-foreground h-8 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                  {STATUS_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>

                                <div className="flex items-center gap-1.5 ml-auto">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs gap-1"
                                    onClick={() => handleDownloadReceipt(order)}
                                    disabled={downloadingId === order.orderId}
                                  >
                                    {downloadingId === order.orderId ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3.5" />}
                                    <span>Struk</span>
                                  </Button>

                                  {order.customerPhone && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                      onClick={() => handleChatCustomer(order)}
                                    >
                                      <MessageCircle className="size-3.5" />
                                      <span>WA</span>
                                    </Button>
                                  )}

                                  {confirmDeleteId === order.orderId ? (
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-8 px-2 text-xs"
                                        onClick={() => handleDelete(order.orderId)}
                                        disabled={deletingId === order.orderId}
                                      >
                                        Hapus
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 px-2 text-xs"
                                        onClick={() => setConfirmDeleteId(null)}
                                      >
                                        Batal
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="size-8 text-destructive hover:bg-destructive/10"
                                      onClick={() => setConfirmDeleteId(order.orderId)}
                                      title="Hapus"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {filteredOrders.length === 0 && search && (
              <div className="text-center py-10 text-muted-foreground text-sm border rounded-xl bg-card">
                Tidak ditemukan pesanan dengan kata kunci "{search}"
              </div>
            )}

            {/* Load More Pagination */}
            {orders.length < totalOrders && !isLoading && (
              <div className="text-center mt-4 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMoreOrders}
                  disabled={isLoadingMore}
                  className="text-xs font-semibold"
                >
                  {isLoadingMore ? (
                    <><Loader2 className="size-3.5 animate-spin mr-1.5" /> Memuat...</>
                  ) : (
                    <>Muat Lebih Banyak ({orders.length}/{totalOrders})</>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <EditOrderModal
        order={editingOrder}
        isOpen={editingOrder !== null}
        onClose={() => setEditingOrder(null)}
        onSave={handleSaveEdit}
      />

      <ProductionScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        orders={orders}
        cashierName={cashierName || ''}
        cabang={cabang || localStorage.getItem('posCabang') || orders[0]?.cabang || 'Cabang Belwis'}
        logoBelwis={logoBelwis}
        logoUnila={logoUnila}
        logoTidurlah={logoTidurlah}
      />

      {showClosingModal && (
        <ClosingUpdateModal onClose={() => setShowClosingModal(false)} />
      )}
    </div>
  );
}