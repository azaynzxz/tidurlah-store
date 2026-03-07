import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, MessageCircle, RefreshCw, Loader2, ChevronDown, ChevronUp, Search, Trash2, LayoutGrid, List } from "lucide-react";
import { convertImageToBase64 } from "@/utils/product";
import { generateReceiptHTML, type ReceiptData } from "@/utils/receiptTemplate";
import { fetchOrderHistory, type OrderHistoryItem } from "@/utils/api";
import { updateOrderStatus, deleteOrder, clearAdminCache } from "@/utils/adminApi";

interface OrderHistoryProps {
  onBack: () => void;
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
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [surveyQRBase64, setSurveyQRBase64] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('partial');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  useEffect(() => {
    // Cache-first: load from localStorage cache immediately
    const cached = localStorage.getItem('orderHistory_cache');
    if (cached) {
      try { setOrders(JSON.parse(cached)); } catch { }
    }
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const logo = await convertImageToBase64('/product-image/Tidurlah Logo Horizontal.png');
      setLogoBase64(logo);
      const qr = await convertImageToBase64('/product-image/survey-qr.png');
      setSurveyQRBase64(qr);
    } catch {
      setLogoBase64('/product-image/Tidurlah Logo Horizontal.png');
      setSurveyQRBase64('/product-image/survey-qr.png');
    }
  };

  // Only fetch from API when user clicks refresh
  const refreshFromAPI = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const result = await fetchOrderHistory({ limit: 100 });
      if (result.success && result.orders.length > 0) {
        setOrders(result.orders);
        localStorage.setItem('orderHistory_cache', JSON.stringify(result.orders));
      } else if (result.error) {
        setLoadError("Gagal memuat: " + result.error);
      }
    } catch {
      setLoadError("Gagal memuat dari server");
    } finally {
      setIsLoading(false);
    }
  };

  // Compute status counts for filter badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length, pending: 0, partial: 0, done: 0 };
    orders.forEach(o => {
      const s = (o.orderStatus || '').toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(o => (o.orderStatus || '').toLowerCase() === statusFilter);
    }

    // Channel filter
    if (channelFilter !== 'all') {
      result = result.filter(o => (o.channel || '') === channelFilter);
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

    // Priority sort: pending → partial → done
    result = [...result].sort((a, b) => {
      const pa = STATUS_PRIORITY[(a.orderStatus || '').toLowerCase()] ?? 99;
      const pb = STATUS_PRIORITY[(b.orderStatus || '').toLowerCase()] ?? 99;
      return pa - pb;
    });

    return result;
  }, [orders, search, statusFilter, channelFilter]);

  const handleDownloadReceipt = async (order: OrderHistoryItem) => {
    setDownloadingId(order.orderId);
    const receiptData = apiOrderToReceiptData(order);

    try {
      const div = document.createElement('div');
      div.innerHTML = generateReceiptHTML(receiptData, logoBase64, surveyQRBase64);
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
    const hasShipping = !!order.address;
    let msg = `Halo kak ${name}, pesanan kakak dengan nomor invoice ${order.orderId} sudah selesai di proses.`;
    if (hasShipping) {
      msg += ` Untuk pengiriman, akan kami proses segera ya kak.\n\nDimohon untuk melakukan pelunasan terlebih dahulu sebelum paket dikirimkan. Cek kembali pesanan kakak, barang yang sudah diterima tidak dapat ditukar/dikembalikan.`;
    } else {
      msg += ` Pengambilan bisa di toko: tidurlah.com/hello\n\nDimohon untuk konfirmasi kapan ingin mengambil, dan melakukan pelunasan terlebih dahulu. Barang yang sudah diterima tidak dapat ditukar/dikembalikan.`;
    }
    msg += `\n\nSalam,\nTidurlah Grafika`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
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
      // Clear all caches
      clearAdminCache();
      // Refresh from API after a delay
      setTimeout(() => refreshFromAPI(), 1500);
    }
    setDeletingId(null);
  };

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold">Riwayat Pesanan</h2>
            {orders.length > 0 && <span className="text-sm text-gray-400">({orders.length})</span>}
          </div>
          <Button variant="outline" size="sm" onClick={refreshFromAPI} disabled={isLoading} title="Refresh dari server">
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

          {/* Spacer */}
          <div className="flex-1" />

          {/* Results count + view toggle */}
          <div className="flex items-center gap-2">
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
            <Button variant="outline" onClick={refreshFromAPI}>
              <RefreshCw className="w-4 h-4 mr-2" /> Muat Data
            </Button>
          </div>
        ) : (
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
                            {getStatusBadge(order.orderStatus)}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-medium truncate">{order.customerName || '-'}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{order.itemCount || order.items?.length || 0} item</span>
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
                            {getStatusBadge(order.orderStatus)}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-gray-800 truncate">{order.customerName || '-'}</span>
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
                        {order.customerPhone && <><div className="text-gray-500">Telepon</div><div>{order.customerPhone}</div></>}
                        {order.institution && <><div className="text-gray-500">Instansi</div><div>{order.institution}</div></>}
                        {order.paymentMethod && <><div className="text-gray-500">Pembayaran</div><div>{order.paymentMethod}</div></>}
                        {order.downPayment > 0 && <>
                          <div className="text-gray-500">DP</div><div>{formatCurrency(order.downPayment)}</div>
                          <div className="text-gray-500">Sisa</div><div className="font-medium text-red-600">{formatCurrency(order.remainingBalance)}</div>
                        </>}
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
        )}
      </div>
    </div>
  );
}
