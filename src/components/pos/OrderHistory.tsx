import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, MessageCircle, RefreshCw, Loader2, ChevronDown, ChevronUp, Search, Trash2, LayoutGrid, List, Pencil, Copy, Check, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { convertImageToBase64 } from "@/utils/product";
import { generateReceiptHTML, type ReceiptData } from "@/utils/receiptTemplate";
import { fetchOrderHistory, type OrderHistoryItem } from "@/utils/api";
import { updateOrderStatus, deleteOrder, clearAdminCache, restoreOrder, assignDesigner } from "@/utils/adminApi";
import { EditOrderModal } from "./EditOrderModal";
import { submitPOSOrder } from "@/utils/api";

interface OrderHistoryProps {
  onBack?: () => void;
  cashierName?: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', className: 'bg-orange-100 text-orange-700' },
  { value: 'partial', label: 'DP', className: 'bg-yellow-100 text-yellow-700' },
  { value: 'done', label: 'Selesai', className: 'bg-green-100 text-green-700' },
];

const STATUS_PRIORITY: Record<string, number> = { pending: 0, partial: 1, done: 2 };

const CHANNEL_OPTIONS = [
  { value: 'all', label: 'Semua' },
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
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('08')) return '62' + cleaned.substring(1);
  if (cleaned.startsWith('62')) return cleaned;
  if (cleaned.startsWith('8')) return '62' + cleaned;
  return '62' + cleaned;
};

export function OrderHistory({ onBack, cashierName }: OrderHistoryProps) {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [logoTidurlah, setLogoTidurlah] = useState<string>("");
  const [logoUnila, setLogoUnila] = useState<string>("");
  const [logoBelwis, setLogoBelwis] = useState<string>("");
  const [surveyQRBase64, setSurveyQRBase64] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('partial');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [cabangFilter, setCabangFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<string>('priority');
  const [editingOrder, setEditingOrder] = useState<OrderHistoryItem | null>(null);

  // Designer Assignment State
  const DEFAULT_DESIGNERS = ["Fitri", "Windy", "Stevan"];
  const [customDesigners, setCustomDesigners] = useState<string[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedDesignerForOrder, setSelectedDesignerForOrder] = useState<Record<string, string>>({});
  const [isAddingNewDesigner, setIsAddingNewDesigner] = useState<string | null>(null);
  const [newDesignerName, setNewDesignerName] = useState("");

  useEffect(() => {
    // Cache-first: load from localStorage cache immediately (unless trash is selected)
    if (channelFilter !== 'trash') {
      const cached = localStorage.getItem('orderHistory_cache');
      if (cached) {
        try { setOrders(JSON.parse(cached)); } catch { }
      }
    }
    loadImages();

    try {
      const savedDesigners = localStorage.getItem('customDesigners');
      if (savedDesigners) setCustomDesigners(JSON.parse(savedDesigners));
    } catch { }
  }, []);

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
    } catch {
      setLogoTidurlah('/product-image/Tidurlah Logo Horizontal.png');
      setLogoUnila('/logo_nono.jpeg');
      setLogoBelwis('/logo-idcard-lampung.jpg');
      setSurveyQRBase64('/product-image/survey-qr.png');
    }
  };

  // Only fetch from API when user clicks refresh or changes to trash tab
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
        setLoadError("Gagal memuat: " + result.error);
      }
    } catch {
      setLoadError("Gagal memuat dari server");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreOrders = async () => {
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
          // No new orders found — we've reached the end
          setTotalOrders(orders.length);
        }
      }
    } catch {
      toast.error("Gagal memuat lebih banyak pesanan");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      refreshFromAPI(channelFilter, search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (channelFilter === 'trash') {
      refreshFromAPI('trash');
    } else {
      // when switching back from trash, load cache fast, then refresh
      const cached = localStorage.getItem('orderHistory_cache');
      if (cached) {
        try { setOrders(JSON.parse(cached)); } catch { }
      }
      refreshFromAPI(channelFilter);
    }
  }, [channelFilter]);

  // Compute status counts for filter badges
  const statusCounts = useMemo(() => {
    // Filter orders by active branch first so the count badges align with the branch selection
    const branchFiltered = cabangFilter === 'all' 
      ? orders 
      : orders.filter(o => (o.cabang || 'Cabang Belwis') === cabangFilter);

    const counts: Record<string, number> = { all: branchFiltered.length, pending: 0, partial: 0, done: 0 };
    branchFiltered.forEach(o => {
      const s = (o.orderStatus || '').toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [orders, cabangFilter]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(o => (o.orderStatus || '').toLowerCase() === statusFilter);
    }

    // Channel filter
    if (channelFilter !== 'all' && channelFilter !== 'trash') {
      result = result.filter(o => (o.channel || '') === channelFilter);
    }

    // Cabang filter
    if (cabangFilter !== 'all') {
      result = result.filter(o => (o.cabang || 'Cabang Belwis') === cabangFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
          (o.orderId || '').toLowerCase().includes(q) ||
          (o.customerName || '').toLowerCase().includes(q) ||
          String(o.customerPhone || '').includes(q)
      );
    }

    // Sort
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
      // Priority sort: pending → partial → done
      result = [...result].sort((a, b) => {
        const pa = STATUS_PRIORITY[(a.orderStatus || '').toLowerCase()] ?? 99;
        const pb = STATUS_PRIORITY[(b.orderStatus || '').toLowerCase()] ?? 99;
        return pa - pb;
      });
    }

    return result;
  }, [orders, search, statusFilter, channelFilter, cabangFilter, sortMode]);

  const handleDownloadReceipt = async (order: OrderHistoryItem) => {
    setDownloadingId(order.orderId);
    const receiptData = apiOrderToReceiptData(order);

    try {
      const div = document.createElement('div');
      const topLogo = order.cabang === 'Cabang Unila' ? logoUnila : logoBelwis;
      div.innerHTML = generateReceiptHTML(receiptData, topLogo, surveyQRBase64, logoTidurlah);
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
          link.download = `receipt-${receiptData.receiptId}.jpg`;
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

    // Check for shipping address (from order.address or nested order.delivery.address)
    const shippingAddr = order.delivery?.address || order.address;
    const hasShipping = !!shippingAddr;

    let msg = `*PESANAN SELESAI*\n\n`;
    msg += `Halo Kak *${name}*,\n`;
    msg += `Pesanan dengan nomor invoice *${order.orderId}* sudah selesai diproses.\n\n`;

    // Add items list
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
      msg += `*Sisa Pembayaran:* ${formatCurrency(order.remainingBalance || 0)}\n\n`;
    } else {
      msg += `*Sisa Pembayaran:* ${formatCurrency(order.remainingBalance !== undefined ? order.remainingBalance : order.total)}\n\n`;
    }

    if (hasShipping) {
      msg += `*Tujuan Pengiriman:*\n${shippingAddr}\n\n`;
      msg += `Untuk pengiriman akan kami proses segera setelah pelunasan ya Kak.\n\n`;
      msg += `*Catatan:* Mohon lakukan pelunasan terlebih dahulu sebelum paket dikirimkan. Barang yang sudah diterima tidak dapat ditukar atau dikembalikan.`;
    } else {
      msg += `*Pengambilan di Toko:*\nhttps://idcardlampung.com/hello\n\n`;
      msg += `Mohon konfirmasi kembali kapan Kakak ingin mengambil pesanan ini ya.\n\n`;
      msg += `*Catatan:* Mohon melakukan pelunasan terlebih dahulu. Barang yang sudah diterima tidak dapat ditukar atau dikembalikan.`;
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
    // Optimistic update
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));

    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      // Clear all caches and refresh from API to get fresh data
      clearAdminCache();
      // Small delay to let the sheet update, then refresh
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
      alert("Gagal menghapus pesanan");
    }
    setDeletingId(null);
  };

  const handleRestore = async (orderId: string) => {
    setUpdatingId(orderId);
    const result = await restoreOrder(orderId);
    if (result.success) {
      setOrders(prev => prev.filter(o => o.orderId !== orderId)); // Remove from trash view
      clearAdminCache();
    } else {
      alert("Gagal mengembalikan pesanan");
    }
    setUpdatingId(null);
  };

  const handleSaveEdit = async (updatedOrderData: any) => {
    clearAdminCache();
    // submitPOSOrder will send 'isEdit: true' since we appended it inside EditOrderModal
    await submitPOSOrder(updatedOrderData as any);
    refreshFromAPI();
  };

  const getStatusBadge = (status: string) => {
    if ((status || '').toLowerCase() === 'deleted') {
      return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-medium">Terhapus</span>;
    }
    const opt = STATUS_OPTIONS.find(s => s.value === (status || '').toLowerCase());
    if (opt) return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${opt.className}`}>{opt.label}</span>;
    return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
  };

  const getChannelBadge = (ch: string) => {
    if (ch === 'website') return <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-100 text-blue-700 font-medium">Web</span>;
    if (ch === 'pos') return <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-100 text-purple-700 font-medium">POS</span>;
    if (ch === 'migrated') return <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-500 font-medium">Old</span>;
    return null;
  };

  const getCabangBadge = (cabang?: string | null) => {
    const branchName = cabang || 'Cabang Belwis';
    const isUnila = branchName.toLowerCase().includes('unila');
    return (
      <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium border ${
        isUnila ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200'
      }`}>
        {branchName}
      </span>
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
      setSelectedDesignerForOrder(prev => ({ ...prev, [orderId]: name }));
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

  const renderDesignerAssignment = (order: OrderHistoryItem) => {
    const hasJasaDesain = order.items?.some(i => i.name.toLowerCase().includes("jasa desain"));
    if (!hasJasaDesain || order.orderStatus === 'deleted') return null;

    const currentAssigned = selectedDesignerForOrder[order.orderId] ?? order.designer ?? "";

    return (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        {isAddingNewDesigner === order.orderId ? (
          <form onSubmit={(e) => handleAddNewDesigner(order.orderId, e)} className="flex items-center gap-1">
            <Input autoFocus size={1} className="h-6 w-24 text-[10px] px-1" placeholder="Nama..." value={newDesignerName} onChange={e => setNewDesignerName(e.target.value)} />
            <button type="submit" className="text-green-600 bg-green-50 p-1 rounded hover:bg-green-100"><Check className="w-3 h-3" /></button>
            <button type="button" onClick={() => setIsAddingNewDesigner(null)} className="text-red-500 bg-red-50 p-1 rounded hover:bg-red-100"><X className="w-3 h-3" /></button>
          </form>
        ) : (
          <div className="flex items-center gap-1 bg-amber-50 rounded pl-1 pr-0.5 border border-amber-200 h-6">
            <select
              className="bg-transparent text-[10px] font-medium text-amber-800 outline-none cursor-pointer border-r border-amber-200 pr-1 max-w-[80px]"
              value={currentAssigned}
              onChange={(e) => {
                if (e.target.value === "ADD_NEW") {
                  setIsAddingNewDesigner(order.orderId);
                  setNewDesignerName("");
                } else {
                  setSelectedDesignerForOrder(prev => ({ ...prev, [order.orderId]: e.target.value }));
                }
              }}
            >
              <option value="" disabled>Pilih Desainer</option>
              {DEFAULT_DESIGNERS.map(d => <option key={d} value={d}>{d}</option>)}
              {customDesigners.length > 0 && <optgroup label="Tersimpan">
                {customDesigners.map(d => <option key={d} value={d}>{d}</option>)}
              </optgroup>}
              <option value="ADD_NEW">+ Tambah Baru...</option>
            </select>

            <button
              className="p-1 rounded text-amber-700 hover:bg-amber-200 disabled:opacity-50 transition-colors ml-0.5"
              onClick={() => handleAssignDesigner(order.orderId, currentAssigned)}
              disabled={assigningId === order.orderId || !currentAssigned || currentAssigned === order.designer}
              title="Simpan Pilihan"
            >
              {assigningId === order.orderId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            </button>

            {customDesigners.includes(currentAssigned) && (
              <button type="button" onClick={(e) => handleDeleteDesigner(currentAssigned, e)} className="p-0.5 ml-0.5 text-red-500 hover:bg-red-100 rounded" title="Hapus dari daftar">
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h2 className="text-lg font-semibold">Riwayat Pesanan</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => { refreshFromAPI(); }} disabled={isLoading} title="Refresh dari server">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nama, ID, atau telepon..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Filters Row: status + channel + view toggle — single row on desktop, wraps on mobile */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Status Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {[
              { value: 'all', label: 'Semua', inactiveBg: 'bg-gray-200 text-gray-700 border-gray-300', activeColor: 'bg-gray-800 text-white border-gray-800' },
              { value: 'pending', label: 'Pending', inactiveBg: 'bg-orange-100 text-orange-800 border-orange-300', activeColor: 'bg-orange-500 text-white border-orange-500' },
              { value: 'partial', label: 'DP', inactiveBg: 'bg-yellow-100 text-yellow-800 border-yellow-300', activeColor: 'bg-yellow-500 text-white border-yellow-500' },
              { value: 'done', label: 'Selesai', inactiveBg: 'bg-green-100 text-green-800 border-green-300', activeColor: 'bg-green-600 text-white border-green-600' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${statusFilter === tab.value
                  ? `${tab.activeColor} shadow-sm`
                  : `${tab.inactiveBg} hover:brightness-95`
                  }`}
              >
                {tab.label}
                <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${statusFilter === tab.value ? 'bg-white/30 text-white' : 'bg-black/10'
                  }`}>
                  {statusCounts[tab.value] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-5 bg-gray-300" />

          {/* Channel Filter Dropdown */}
          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            className="text-xs font-semibold border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FF5E01] focus:border-[#FF5E01]"
          >
            {CHANNEL_OPTIONS.map(ch => (
              <option key={ch.value} value={ch.value}>{ch.label}</option>
            ))}
          </select>

          {/* Cabang Filter Dropdown */}
          <select
            value={cabangFilter}
            onChange={e => setCabangFilter(e.target.value)}
            className="text-xs font-semibold border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FF5E01] focus:border-[#FF5E01] ml-1"
          >
            <option value="all">Semua Cabang</option>
            <option value="Cabang Belwis">Cabang Belwis</option>
            <option value="Cabang Unila">Cabang Unila</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortMode}
            onChange={e => setSortMode(e.target.value)}
            className={`text-xs font-semibold border rounded-lg px-2 py-1 bg-white cursor-pointer focus:outline-none focus:ring-1 ml-1 ${channelFilter === 'trash' ? 'border-gray-200 text-gray-400 opacity-50' : 'border-gray-300 text-gray-700 focus:ring-[#FF5E01] focus:border-[#FF5E01]'
              }`}
            disabled={channelFilter === 'trash'}
          >
            <option value="priority">Status</option>
            <option value="deadline_asc">Deadline Terdekat</option>
            <option value="name_asc">Nama (A-Z)</option>
          </select>

          {/* Tong Sampah Button */}
          <button
            onClick={() => {
              setChannelFilter(channelFilter === 'trash' ? 'all' : 'trash');
              // Auto reset status filter when entering trash view
              if (channelFilter !== 'trash') setStatusFilter('all');
            }}
            title="Lihat Pesanan Terhapus"
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all ml-1 border ${channelFilter === 'trash'
              ? 'bg-red-500 text-white border-red-500 shadow-sm'
              : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'
              }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sampah</span>
          </button>

          {/* Results count + view toggle */}
          <div className="flex flex-1 sm:flex-none items-center justify-between sm:justify-end gap-3 ml-auto">
            <p className="text-xs text-gray-500 font-medium">{filteredOrders.length} pesanan</p>
            <div className="flex bg-gray-200 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-shadow ${viewMode === 'list' ? 'bg-white shadow-sm text-[#FF5E01]' : 'text-gray-500 hover:text-gray-700'}`}
                title="Tampilan List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-shadow ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#FF5E01]' : 'text-gray-500 hover:text-gray-700'}`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Error / Loading */}
        {loadError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded-lg mb-3">
            {loadError}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#FF5E01]" />
            <p className="text-xs text-gray-500 mt-1">Memperbarui data...</p>
          </div>
        )}

        {orders.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-base mb-2">Belum ada riwayat pesanan</p>
            <p className="text-xs mb-4">Klik tombol refresh untuk memuat data dari server</p>
            <Button variant="outline" onClick={() => { refreshFromAPI(); }}>
              <RefreshCw className="w-4 h-4 mr-2" /> Muat Data
            </Button>
          </div>
        ) : (
          <>
          <div className={viewMode === 'list' ? "space-y-1.5" : "grid grid-cols-1 sm:grid-cols-2 gap-3 items-start"}>
            {filteredOrders.map(order => {
              const isExpanded = expandedOrder === order.orderId;
              return (
                <div key={order.orderId} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                  {/* Row / Card Header */}
                  <div
                    className={`px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${viewMode === 'list' ? 'flex items-center justify-between' : 'space-y-2'}`}
                    onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
                  >
                    {viewMode === 'list' ? (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-gray-500 truncate">{order.orderId}</span>
                            {getChannelBadge(order.channel)}
                            {getCabangBadge(order.cabang)}
                            {getStatusBadge(order.orderStatus)}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-sm font-medium truncate flex items-center gap-1.5">
                              {order.customerName || '-'}
                              {order.orderStatus !== 'deleted' && (
                                <button onClick={(e) => { e.stopPropagation(); setEditingOrder(order); }} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Pesanan">
                                  <Pencil className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                            {renderDesignerAssignment(order)}
                            <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">{order.itemCount || order.items?.length || 0} item</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm font-bold text-green-600 whitespace-nowrap">{formatCurrency(order.total)}</span>
                          <button
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-[#FF5E01] transition-colors disabled:opacity-50"
                            title="Download Struk"
                            onClick={e => { e.stopPropagation(); handleDownloadReceipt(order); }}
                            disabled={downloadingId === order.orderId}
                          >
                            {downloadingId === order.orderId
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Download className="w-4 h-4" />
                            }
                          </button>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-gray-400 truncate max-w-[120px]">{order.orderId}</span>
                          <div className="flex gap-1">
                            {getChannelBadge(order.channel)}
                            {getCabangBadge(order.cabang)}
                            {getStatusBadge(order.orderStatus)}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-base font-bold text-gray-800 truncate flex items-center gap-1.5">
                              {order.customerName || '-'}
                              {order.orderStatus !== 'deleted' && (
                                <button onClick={(e) => { e.stopPropagation(); setEditingOrder(order); }} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Pesanan">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </span>
                            {renderDesignerAssignment(order)}
                          </div>
                          <span className="text-[10px] text-gray-400">{order.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                          <span className="text-sm font-extrabold text-green-600">{formatCurrency(order.total)}</span>
                          <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                            <button
                              className="p-1 rounded hover:bg-gray-200 hover:text-[#FF5E01] transition-colors disabled:opacity-50"
                              title="Download Struk"
                              onClick={e => { e.stopPropagation(); handleDownloadReceipt(order); }}
                              disabled={downloadingId === order.orderId}
                            >
                              {downloadingId === order.orderId
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Download className="w-4 h-4" />
                              }
                            </button>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="border-t px-3 py-2.5 bg-gray-50 space-y-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div className="text-gray-500 font-semibold">Deadline</div>
                        <div className={`font-bold ${order.deadline ? 'text-orange-600' : 'text-gray-400 italic'}`}>
                          {order.deadline ? (() => {
                            try {
                              const dl = String(order.deadline).trim();
                              const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                              // Try parsing as Date (handles ISO strings like "2026-03-02T17:00:00.000Z")
                              const d = new Date(dl);
                              if (!isNaN(d.getTime())) {
                                // Use local methods to match user-entered time exactly
                                const day = d.getDate();
                                const month = months[d.getMonth()];
                                const year = d.getFullYear();
                                const hours = d.getHours();
                                const mins = d.getMinutes();
                                const dateStr = `${day} ${month} ${year}`;
                                // Only show time if it's not midnight (00:00)
                                return (hours !== 0 || mins !== 0) ? `${dateStr}, ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}` : dateStr;
                              }
                              return dl;
                            } catch { return String(order.deadline); }
                          })() : 'Belum ditentukan'}
                        </div>
                        <div className="text-gray-500">Kasir</div><div>{order.cashier}</div>
                        {order.cabang && <><div className="text-gray-500 font-semibold">Cabang</div><div className="font-medium text-gray-800">{order.cabang}</div></>}
                        {order.customerPhone && <><div className="text-gray-500">Telepon</div><div>{order.customerPhone}</div></>}
                        {order.institution && <><div className="text-gray-500">Instansi</div><div>{order.institution}</div></>}
                        {order.paymentMethod && <><div className="text-gray-500">Pembayaran</div><div>{order.paymentMethod}</div></>}
                        {order.downPayment > 0 && <>
                          <div className="text-gray-500">DP</div><div>{formatCurrency(order.downPayment)}</div>
                          <div className="text-gray-500">Sisa</div><div className="font-medium text-red-600">{formatCurrency(order.remainingBalance)}</div>
                        </>}
                        {(order.delivery?.address || order.address) && (
                          <>
                            <div className="text-gray-500">Alamat</div>
                            <div className="flex items-center gap-1.5 group">
                              <span className="truncate max-w-[150px] inline-block" title={order.delivery?.address || order.address}>
                                {order.delivery?.address || order.address}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(order.delivery?.address || order.address || ''); }}
                                className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-1">Items:</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs py-0.5">
                              <span className="text-gray-700 truncate mr-2">
                                {item.name} {item.modelCode ? `[${item.modelCode}]` : ''} ×{item.quantity}
                              </span>
                              <span className="text-gray-600 whitespace-nowrap">{formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 flex-wrap">
                        {order.orderStatus === 'deleted' ? (
                          <div className="flex gap-2 w-full">
                            <Button size="sm" variant="outline" className="h-7 text-xs flex-1 text-blue-600" onClick={() => handleRestore(order.orderId)} disabled={updatingId === order.orderId}>
                              {updatingId === order.orderId ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />} Restore
                            </Button>
                          </div>
                        ) : (
                          <>
                            {/* Status dropdown */}
                            <select
                              value={(order.orderStatus || '').toLowerCase()}
                              onChange={e => handleStatusChange(order.orderId, e.target.value)}
                              disabled={updatingId === order.orderId}
                              className="text-xs border rounded px-2 py-1 bg-white"
                            >
                              {STATUS_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>

                            {/* Auto-download receipt */}
                            <Button
                              size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => handleDownloadReceipt(order)}
                              disabled={downloadingId === order.orderId}
                            >
                              {downloadingId === order.orderId
                                ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Membuat...</>
                                : <><Download className="w-3 h-3 mr-1" /> Struk</>
                              }
                            </Button>

                            {order.customerPhone && (
                              <Button size="sm" variant="outline" className="h-7 text-xs text-green-600" onClick={() => handleChatCustomer(order)}>
                                <MessageCircle className="w-3 h-3 mr-1" /> WA
                              </Button>
                            )}

                            {/* Delete */}
                            {confirmDeleteId === order.orderId ? (
                              <div className="flex gap-1 ml-auto">
                                <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleDelete(order.orderId)} disabled={deletingId === order.orderId}>
                                  {deletingId === order.orderId ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ya, Hapus'}
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmDeleteId(null)}>Batal</Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 ml-auto" onClick={() => setConfirmDeleteId(order.orderId)}>
                                <Trash2 className="w-3 h-3 mr-1" /> Hapus
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredOrders.length === 0 && search && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Tidak ditemukan "{search}"
              </div>
            )}
          </div>

          {/* Load More */}
          {orders.length < totalOrders && !isLoading && (
            <div className="text-center mt-4 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMoreOrders}
                disabled={isLoadingMore}
                className="text-xs"
              >
                {isLoadingMore ? (
                  <><Loader2 className="w-3 h-3 animate-spin mr-1.5" /> Memuat...</>
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
    </div>
  );
}
