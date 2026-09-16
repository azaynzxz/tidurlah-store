import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Loader2, RefreshCw, X, Search, ChevronDown } from "lucide-react";
import { fetchOrderHistory, type OrderHistoryItem } from "@/utils/api";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";

const formatCurrency = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;

const isToday = (dateString: string | undefined) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

const getQty = (o: OrderHistoryItem) => {
    return o.items?.reduce((sum, item) => sum + item.quantity, 0) || o.itemCount || 0;
};

// Component for searchable multi-select
function OrderPicker({ title, selectedCount, orders, selectedIds, onToggle, className, textClassName }: any) {
    const [q, setQ] = useState("");
    const filtered = orders.filter((o: OrderHistoryItem) =>
        o.customerName?.toLowerCase().includes(q.toLowerCase()) ||
        o.orderId.toLowerCase().includes(q.toLowerCase())
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className={`flex justify-between items-center px-3 py-2 rounded-md border min-h-[44px] cursor-pointer hover:opacity-80 transition-opacity ${className}`}>
                    <span className={`text-sm font-medium ${textClassName}`}>{title}</span>
                    <span className={`font-bold flex items-center gap-1 ${textClassName}`}>
                        {selectedCount} <ChevronDown className="w-3 h-3 opacity-60" />
                    </span>
                </div>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[300px] p-2 bg-white z-[70] shadow-xl">
                <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Cari pelanggan atau invoice..."
                        className="h-8 pl-8 text-xs bg-gray-50 border-gray-200"
                    />
                </div>
                <div className="max-h-[250px] overflow-y-auto space-y-1 p-1">
                    {filtered.length === 0 && <p className="text-center text-xs text-gray-500 py-6">Tidak ada pesanan.</p>}
                    {filtered.map((o: OrderHistoryItem) => (
                        <div
                            key={o.orderId}
                            onClick={() => onToggle(o.orderId)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded-md text-sm border border-transparent hover:border-gray-200 transition-colors"
                        >
                            <Check className={`w-4 h-4 shrink-0 transition-opacity ${selectedIds.includes(o.orderId) ? "text-[#FF5E01] opacity-100" : "opacity-0"}`} />
                            <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{o.customerName || 'Pelanggan'}</p>
                            </div>
                            <span className="text-xs font-semibold text-gray-500 shrink-0 bg-gray-100 px-1.5 py-0.5 rounded">{getQty(o)} pcs</span>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

interface ClosingUpdateModalProps {
    onClose: () => void;
}

export function ClosingUpdateModal({ onClose }: ClosingUpdateModalProps) {
    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [kendala, setKendala] = useState("");
    const [cashSistem, setCashSistem] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [manualSelesaiIds, setManualSelesaiIds] = useState<string[] | null>(null);
    const [manualBelumIds, setManualBelumIds] = useState<string[] | null>(null);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const result = await fetchOrderHistory({ limit: 200 });
            if (result.success && result.orders) {
                setOrders(result.orders);
            } else {
                toast.error("Gagal memuat pesanan untuk laporan");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat memuat pesanan");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    // Filter today's active orders
    const todayOrders = useMemo(() => {
        return orders.filter(o => isToday(o.timestamp) && o.orderStatus !== 'deleted');
    }, [orders]);

    const completedOrders = useMemo(() => {
        return todayOrders.filter(o => o.orderStatus === 'done');
    }, [todayOrders]);

    const uncompletedOrders = useMemo(() => {
        return todayOrders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'partial');
    }, [todayOrders]);

    const estimatedCash = useMemo(() => {
        return todayOrders.reduce((sum, o) => {
            if (o.orderStatus === 'done') return sum + (o.total || 0);
            if (o.orderStatus === 'partial') return sum + (o.downPayment || 0);
            return sum;
        }, 0);
    }, [todayOrders]);

    const displayCash = cashSistem || formatCurrency(estimatedCash);

    const activeSelesaiIds = manualSelesaiIds ?? completedOrders.map(o => o.orderId);
    const activeBelumIds = manualBelumIds ?? uncompletedOrders.map(o => o.orderId);

    const toggleSelesai = (id: string) => {
        const current = manualSelesaiIds || completedOrders.map(o => o.orderId);
        if (current.includes(id)) {
            setManualSelesaiIds(current.filter(i => i !== id));
        } else {
            setManualSelesaiIds([...current, id]);
            // Auto uncheck from belom if moving to selesai
            const alt = manualBelumIds || uncompletedOrders.map(o => o.orderId);
            if (alt.includes(id)) setManualBelumIds(alt.filter(i => i !== id));
        }
    };

    const toggleBelum = (id: string) => {
        const current = manualBelumIds || uncompletedOrders.map(o => o.orderId);
        if (current.includes(id)) {
            setManualBelumIds(current.filter(i => i !== id));
        } else {
            setManualBelumIds([...current, id]);
            // Auto uncheck from selesai if moving to belom
            const alt = manualSelesaiIds || completedOrders.map(o => o.orderId);
            if (alt.includes(id)) setManualSelesaiIds(alt.filter(i => i !== id));
        }
    };

    const displaySelesai = activeSelesaiIds.length.toString();
    const displayBelum = activeBelumIds.length.toString();

    const generatedText = useMemo(() => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const finalCompleted = activeSelesaiIds.map(id => todayOrders.find(o => o.orderId === id)).filter(Boolean) as OrderHistoryItem[];
        const finalUncompleted = activeBelumIds.map(id => todayOrders.find(o => o.orderId === id)).filter(Boolean) as OrderHistoryItem[];

        let text = `Closing Update Sistem - ${dateStr} ${timeStr}\n\n`;
        text += `1. Apa orderan yang sudah selesai?\n`;
        if (finalCompleted.length > 0) {
            finalCompleted.forEach((o, i) => {
                text += `   ${i + 1}. ${o.customerName || 'Pelanggan'} (${getQty(o)} pcs)\n`;
            });
        } else {
            text += `   - Kosong\n`;
        }

        text += `2. Apa orderan yang belum selesai?\n`;
        if (finalUncompleted.length > 0) {
            finalUncompleted.forEach((o, i) => {
                text += `   ${i + 1}. ${o.customerName || 'Pelanggan'} (${getQty(o)} pcs) - ${o.orderStatus === 'partial' ? 'DP' : 'Belum Bayar'}\n`;
            });
        } else {
            text += `   - Kosong\n`;
        }

        text += `3. Apa kendala (opsional)\n`;
        text += `   ${kendala.trim() ? kendala.trim() : '-'}\n`;

        text += `4. Laporan cash masuk di store\n`;
        text += `   ${displayCash}`;

        return text;
    }, [activeSelesaiIds, activeBelumIds, todayOrders, kendala, displayCash]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText);
        setIsCopied(true);
        toast.success("Berhasil menyalin laporan");
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col relative max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Closing Update Laporan</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={loadOrders} disabled={isLoading} className="h-8">
                            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Form Input Section */}
                        <div className="space-y-4 flex flex-col h-full max-h-[80vh]">
                            <Card className="shrink-0">
                                <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-sm font-semibold">Data Hari Ini</CardTitle>
                                        <p className="text-xs text-gray-500 mt-1">Klik kotak untuk mengganti seleksi order secara manual.</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <OrderPicker
                                        title="Order Selesai"
                                        selectedCount={displaySelesai}
                                        orders={todayOrders}
                                        selectedIds={activeSelesaiIds}
                                        onToggle={toggleSelesai}
                                        className="bg-green-50 border-green-100"
                                        textClassName="text-green-800"
                                    />
                                    <OrderPicker
                                        title="Order Belum Selesai (Pending/DP)"
                                        selectedCount={displayBelum}
                                        orders={todayOrders}
                                        selectedIds={activeBelumIds}
                                        onToggle={toggleBelum}
                                        className="bg-orange-50 border-orange-100"
                                        textClassName="text-orange-800"
                                    />
                                    <div className="flex justify-between items-center bg-blue-50 px-4 py-2.5 rounded-md border border-blue-100 min-h-[44px]">
                                        <span className="text-sm font-medium text-blue-800">Estimasi Cash Masuk</span>
                                        <span className="font-bold text-blue-800 text-sm">{displayCash}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shrink-0">
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-sm font-semibold">Input Tambahan</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Kendala (Opsional)</label>
                                        <Textarea
                                            placeholder="Tulis kendala hari ini (jika ada)..."
                                            value={kendala}
                                            onChange={(e) => setKendala(e.target.value)}
                                            className="min-h-[60px] text-sm resize-y"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Cash Masuk di Store</label>
                                        <Input
                                            placeholder={`Contoh: ${formatCurrency(estimatedCash)}`}
                                            value={cashSistem}
                                            onChange={(e) => setCashSistem(e.target.value)}
                                            className="text-sm h-9"
                                        />
                                        <p className="text-[11px] text-gray-500 leading-tight">
                                            Biarkan kosong jika sistem sudah benar. Nominal ini akan menggantikan "Estimasi Cash Masuk" pada laporan.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Preview Section */}
                        <Card className="flex flex-col h-full bg-gray-50 border-gray-200">
                            <CardHeader className="pb-3 border-b bg-white">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">Preview Pesan (Siap Salin)</CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={handleCopy}
                                        className={`h-7 px-3 text-xs flex items-center transition-all ${isCopied ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#FF5E01] hover:bg-[#e54d00] text-white'
                                            }`}
                                    >
                                        {isCopied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                        {isCopied ? "Tersalin!" : "Salin Teks"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 relative">
                                {isLoading ? (
                                    <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center z-10 backdrop-blur-[1px]">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#FF5E01] mb-2" />
                                        <span className="text-xs text-gray-600 font-medium">Memuat pesanan...</span>
                                    </div>
                                ) : null}
                                <textarea
                                    readOnly
                                    value={generatedText}
                                    className="w-full h-full min-h-[350px] p-5 text-sm font-mono bg-transparent outline-none resize-none text-gray-700"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
