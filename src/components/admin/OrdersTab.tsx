import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Trash2, ChevronDown, ChevronUp, RefreshCw, MessageCircle, Download, LayoutGrid, List } from "lucide-react";
import { fetchOrderHistory, type OrderHistoryItem } from "@/utils/api";
import { updateOrderStatus, deleteOrder, clearAdminCache } from "@/utils/adminApi";

const formatCurrency = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', className: 'bg-orange-100 text-orange-700' },
    { value: 'partial', label: 'DP', className: 'bg-yellow-100 text-yellow-700' },
    { value: 'done', label: 'Selesai', className: 'bg-green-100 text-green-700' },
];

const STATUS_CARDS = [
    { key: '', label: 'Semua', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', activeBg: 'bg-gray-100', activeBorder: 'border-gray-400' },
    { key: 'pending', label: 'Pending', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', activeBg: 'bg-amber-100', activeBorder: 'border-amber-400' },
    { key: 'partial', label: 'DP', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', activeBg: 'bg-blue-100', activeBorder: 'border-blue-400' },
    { key: 'done', label: 'Selesai', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', activeBg: 'bg-emerald-100', activeBorder: 'border-emerald-400' },
];

export function OrdersTab() {
    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [channelFilter, setChannelFilter] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

    useEffect(() => {
        const cached = localStorage.getItem('admin_orders_cache');
        if (cached) {
            try { setOrders(JSON.parse(cached)); setIsLoading(false); } catch { }
        }
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const result = await fetchOrderHistory({ limit: 200 });
            if (result.success) {
                setOrders(result.orders);
                localStorage.setItem('admin_orders_cache', JSON.stringify(result.orders));
            }
        } catch {
            const cached = localStorage.getItem('admin_orders_cache');
            if (cached) setOrders(JSON.parse(cached));
        } finally {
            setIsLoading(false);
        }
    };

    // Status counts
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { '': orders.length, pending: 0, partial: 0, done: 0 };
        orders.forEach(o => {
            const s = (o.orderStatus || '').toLowerCase();
            if (counts[s] !== undefined) counts[s]++;
        });
        return counts;
    }, [orders]);

    const filteredOrders = useMemo(() => {
        let result = orders;

        if (statusFilter) {
            result = result.filter(o => (o.orderStatus || '').toLowerCase() === statusFilter);
        }
        if (channelFilter) {
            result = result.filter(o => o.channel === channelFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(o =>
                (o.orderId || '').toLowerCase().includes(q) ||
                (o.customerName || '').toLowerCase().includes(q) ||
                (o.customerPhone || '').toString().includes(q)
            );
        }

        return result;
    }, [orders, statusFilter, channelFilter, search]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
            clearAdminCache();
            setTimeout(() => loadOrders(), 1500);
        } else {
            loadOrders();
        }
        setUpdatingId(null);
    };

    const handleDelete = async (orderId: string) => {
        setDeletingId(orderId);
        const result = await deleteOrder(orderId, 'Admin');
        if (result.success) {
            setOrders(prev => prev.filter(o => o.orderId !== orderId));
            setConfirmDeleteId(null);
            clearAdminCache();
            setTimeout(() => loadOrders(), 1500);
        }
        setDeletingId(null);
    };

    const handleChatCustomer = (order: OrderHistoryItem) => {
        if (!order.customerPhone) return;
        let phone = String(order.customerPhone).replace(/\D/g, '');
        if (phone.startsWith('08')) phone = '62' + phone.substring(1);
        else if (phone.startsWith('8')) phone = '62' + phone;
        const msg = `Halo kak ${order.customerName || ''}, info pesanan ${order.orderId}.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
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
        <div className="space-y-4">
            {/* Status Count Cards */}
            <div className="grid grid-cols-4 gap-2">
                {STATUS_CARDS.map(sc => {
                    const isActive = statusFilter === sc.key;
                    return (
                        <button
                            key={sc.key}
                            onClick={() => setStatusFilter(sc.key)}
                            className={`rounded-xl border-2 p-3 text-center transition-all ${isActive ? `${sc.activeBg} ${sc.activeBorder} shadow-sm` : `${sc.bg} ${sc.border} hover:shadow-sm`
                                }`}
                        >
                            <div className={`text-xl font-bold ${sc.text}`}>{statusCounts[sc.key] || 0}</div>
                            <p className={`text-[10px] mt-0.5 ${sc.text} opacity-75`}>{sc.label}</p>
                        </button>
                    );
                })}
            </div>

            {/* Search + Channel Filter + Refresh */}
            <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Cari nama, ID, atau telepon..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 h-9 text-sm"
                    />
                </div>

                {/* Channel filter */}
                <select
                    value={channelFilter}
                    onChange={e => setChannelFilter(e.target.value)}
                    className="text-xs border rounded-lg px-3 py-2 bg-white text-gray-600"
                >
                    <option value="">Semua Channel</option>
                    <option value="pos">POS</option>
                    <option value="website">Website</option>
                </select>

                <Button variant="outline" size="sm" onClick={loadOrders} disabled={isLoading} className="h-9">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>

                <div className="flex bg-gray-100 p-0.5 rounded-lg ml-auto">
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

            {/* Results count */}
            <p className="text-xs text-gray-400">{filteredOrders.length} pesanan</p>

            {/* Loading */}
            {isLoading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF5E01]" />
                    <p className="text-sm text-gray-500 mt-2">Memuat pesanan...</p>
                </div>
            ) : (
                <div className={viewMode === 'list' ? "space-y-1.5" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start"}>
                    {filteredOrders.map(order => {
                        const isExpanded = expandedId === order.orderId;
                        return (
                            <div key={order.orderId} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                {/* Row / Card Header */}
                                <div
                                    className={`px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${viewMode === 'list' ? 'flex items-center justify-between' : 'space-y-2'}`}
                                    onClick={() => setExpandedId(isExpanded ? null : order.orderId)}
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
                                                    <span className="text-xs text-gray-400">{order.timestamp?.split(' ')[0]}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                                <span className="text-sm font-bold text-green-600 whitespace-nowrap">{formatCurrency(order.total)}</span>
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
                                                <div className="flex items-center text-gray-400 text-[10px]">
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Expanded */}
                                {isExpanded && (
                                    <div className="border-t px-3 py-2.5 bg-gray-50 space-y-2.5">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                            <div className="text-gray-500">Tanggal</div><div>{order.timestamp}</div>
                                            <div className="text-gray-500">Kasir</div><div>{order.cashier}</div>
                                            {order.customerPhone && <><div className="text-gray-500">Telepon</div><div>{order.customerPhone}</div></>}
                                            {order.institution && <><div className="text-gray-500">Instansi</div><div>{order.institution}</div></>}
                                            {order.paymentMethod && <><div className="text-gray-500">Pembayaran</div><div>{order.paymentMethod}</div></>}
                                            {order.downPayment > 0 && <>
                                                <div className="text-gray-500">DP</div><div>{formatCurrency(order.downPayment)}</div>
                                                <div className="text-gray-500">Sisa</div><div className="font-medium text-red-600">{formatCurrency(order.remainingBalance)}</div>
                                            </>}
                                        </div>

                                        {/* Items */}
                                        {order.items && order.items.length > 0 && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <p className="text-xs font-medium text-gray-500 mb-1">Items:</p>
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-xs py-0.5">
                                                        <span className="text-gray-700 truncate mr-2">{item.name} ×{item.quantity}</span>
                                                        <span className="text-gray-600 whitespace-nowrap">{formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 flex-wrap">
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

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            {search ? `Tidak ditemukan "${search}"` : 'Tidak ada pesanan'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
