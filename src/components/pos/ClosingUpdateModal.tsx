import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Loader2, RefreshCw, Edit2, X, ChevronDown } from "lucide-react";
import { fetchOrderHistory, type OrderHistoryItem } from "@/utils/api";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

interface ClosingUpdateModalProps {
    onClose: () => void;
}

export function ClosingUpdateModal({ onClose }: ClosingUpdateModalProps) {
    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [kendala, setKendala] = useState("");
    const [cashSistem, setCashSistem] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [isEditingStats, setIsEditingStats] = useState(false);
    const [manualSelesaiIds, setManualSelesaiIds] = useState<string[] | null>(null);
    const [manualBelumIds, setManualBelumIds] = useState<string[] | null>(null);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            // Fetch the latest 200 orders to ensure we get all of today's orders
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

    // Use estimated cash as placeholder or pre-fill if cashSistem is empty, but let's just use it dynamically when generating
    const displayCash = cashSistem || formatCurrency(estimatedCash);

    const activeSelesaiIds = manualSelesaiIds ?? completedOrders.map(o => o.orderId);
    const activeBelumIds = manualBelumIds ?? uncompletedOrders.map(o => o.orderId);

    const toggleSelesai = (id: string) => {
        const current = manualSelesaiIds || completedOrders.map(o => o.orderId);
        if (current.includes(id)) setManualSelesaiIds(current.filter(i => i !== id));
        else setManualSelesaiIds([...current, id]);
    };

    const toggleBelum = (id: string) => {
        const current = manualBelumIds || uncompletedOrders.map(o => o.orderId);
        if (current.includes(id)) setManualBelumIds(current.filter(i => i !== id));
        else setManualBelumIds([...current, id]);
    };

    const displaySelesai = activeSelesaiIds.length.toString();
    const displayBelum = activeBelumIds.length.toString();

    const getQty = (o: OrderHistoryItem) => {
        return o.items?.reduce((sum, item) => sum + item.quantity, 0) || o.itemCount || 0;
    };

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
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-semibold">Tinjauan Data Hari Ini</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditingStats(!isEditingStats)}
                                        className={`h-7 px-2 text-xs ${isEditingStats ? 'bg-gray-100 text-gray-800' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'}`}
                                    >
                                        {isEditingStats ? <Check className="w-3.5 h-3.5 mr-1" /> : <Edit2 className="w-3.5 h-3.5 mr-1" />}
                                        {isEditingStats ? 'Selesai Edit' : 'Edit'}
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-md border border-green-100 min-h-[44px]">
                                        <span className="text-sm text-green-800 font-medium">Order Selesai</span>
                                        {isEditingStats ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-7 text-xs px-2 min-w-[70px] bg-white text-green-700">
                                                        Pilih ({activeSelesaiIds.length}) <ChevronDown className="w-3 h-3 ml-1" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[300px] max-h-[300px] overflow-y-auto">
                                                    {todayOrders.map(o => (
                                                        <DropdownMenuCheckboxItem
                                                            key={o.orderId}
                                                            checked={activeSelesaiIds.includes(o.orderId)}
                                                            onCheckedChange={() => toggleSelesai(o.orderId)}
                                                        >
                                                            {o.customerName || 'Pelanggan'} ({getQty(o)} pcs)
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <span className="font-bold text-green-700">{displaySelesai}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center bg-orange-50 px-3 py-2 rounded-md border border-orange-100 min-h-[44px]">
                                        <span className="text-sm text-orange-800 font-medium">Order Belum Selesai (Pending/DP)</span>
                                        {isEditingStats ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-7 text-xs px-2 min-w-[70px] bg-white text-orange-700">
                                                        Pilih ({activeBelumIds.length}) <ChevronDown className="w-3 h-3 ml-1" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[300px] max-h-[300px] overflow-y-auto">
                                                    {todayOrders.map(o => (
                                                        <DropdownMenuCheckboxItem
                                                            key={o.orderId}
                                                            checked={activeBelumIds.includes(o.orderId)}
                                                            onCheckedChange={() => toggleBelum(o.orderId)}
                                                        >
                                                            {o.customerName || 'Pelanggan'} ({getQty(o)} pcs)
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <span className="font-bold text-orange-700">{displayBelum}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-md border border-blue-100 min-h-[44px]">
                                        <span className="text-sm text-blue-800 font-medium">Estimasi Cash Masuk</span>
                                        <span className="font-bold text-blue-700">{displayCash}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-sm font-semibold">Input Tambahan</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">3. Kendala (Opsional)</label>
                                        <Textarea
                                            placeholder="Tulis kendala hari ini (jika ada)..."
                                            value={kendala}
                                            onChange={(e) => setKendala(e.target.value)}
                                            className="min-h-[80px] text-sm resize-y"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">4. Cash Masuk di Store</label>
                                        <Input
                                            placeholder={`Contoh: ${formatCurrency(estimatedCash)}`}
                                            value={cashSistem}
                                            onChange={(e) => setCashSistem(e.target.value)}
                                            className="text-sm"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Biarkan kosong untuk menggunakan nominal estimasi dari sistem.
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
                                    <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center z-10 backdrop-blur-[1px]">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#FF5E01] mb-2" />
                                        <span className="text-xs text-gray-600 font-medium">Memuat pesanan...</span>
                                    </div>
                                ) : null}
                                <textarea
                                    readOnly
                                    value={generatedText}
                                    className="w-full h-full min-h-[350px] p-4 text-sm font-mono bg-transparent outline-none resize-none text-gray-700"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
