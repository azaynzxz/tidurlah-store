import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, ShoppingCart, Users, Package, RefreshCw, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchDashboardData, fetchMonthlyReport, type DashboardData, type DailyBreakdown, type ProductRanking } from "@/utils/adminApi";
import { fetchOrderHistory, type OrderHistoryItem } from "@/utils/api";

const formatCurrency = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;
const formatCompact = (n: number) => {
    if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`;
    if (n >= 1000) return `Rp ${(n / 1000).toFixed(0)}rb`;
    return `Rp ${n}`;
};

const STATUS_CARDS = [
    { key: 'pending', label: 'Pending', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
    { key: 'partial', label: 'DP', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
    { key: 'done', label: 'Selesai', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
];

export function DashboardTab() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [dailyData, setDailyData] = useState<DailyBreakdown[]>([]);
    const [topProducts, setTopProducts] = useState<ProductRanking[]>([]);
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
    const [uniqueCustomers, setUniqueCustomers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => { loadData(); }, []);

    const loadData = async (useCache = true) => {
        setIsLoading(true);
        setError("");
        try {
            const [dashboard, monthly, ordersResult] = await Promise.all([
                fetchDashboardData(useCache),
                fetchMonthlyReport(new Date().getMonth() + 1, new Date().getFullYear(), useCache),
                fetchOrderHistory({ limit: 500 }),
            ]);

            if (dashboard.success) setData(dashboard);
            else setError(dashboard.error || "Gagal memuat data");

            if (monthly.success) {
                setDailyData(monthly.dailyBreakdown);
                setTopProducts(monthly.topProducts.slice(0, 5));
            }

            // Compute status counts & unique customers from all orders
            if (ordersResult.success && ordersResult.orders) {
                const counts: Record<string, number> = { pending: 0, partial: 0, done: 0 };
                const customers = new Set<string>();
                ordersResult.orders.forEach((o: OrderHistoryItem) => {
                    const s = (o.orderStatus || '').toLowerCase();
                    if (counts[s] !== undefined) counts[s]++;
                    if (o.customerName) customers.add(o.customerName.toLowerCase());
                });
                setStatusCounts(counts);
                setUniqueCustomers(customers.size);
            }
        } catch {
            setError("Gagal memuat data dashboard");
        } finally {
            setIsLoading(false);
        }
    };

    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[#FF5E01]" />
                <span className="ml-2 text-gray-500">Memuat dashboard...</span>
            </div>
        );
    }

    if (error && !data) {
        return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>;
    }

    if (!data) return null;

    return (
        <div className="space-y-5">
            {/* Header Refresh */}
            <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" onClick={() => loadData(false)} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </div>

            {/* Main: KPI Cards + Revenue Chart in 2-column */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Left: 2x2 KPI Cards */}
                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                    {/* Total Revenue */}
                    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white col-span-1">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-orange-600">Total Pendapatan</span>
                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                                    <ArrowUpRight className="w-3 h-3 text-orange-600" />
                                </div>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{formatCompact(data.allTime.revenue)}</div>
                            <p className="text-[10px] text-gray-400 mt-1">Sepanjang waktu</p>
                        </CardContent>
                    </Card>

                    {/* Total Orders */}
                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white col-span-1">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-blue-600">Total Pesanan</span>
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                    <ShoppingCart className="w-3 h-3 text-blue-600" />
                                </div>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{data.allTime.orders}</div>
                            <p className="text-[10px] text-gray-400 mt-1">Sepanjang waktu</p>
                        </CardContent>
                    </Card>

                    {/* This Month Revenue */}
                    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white col-span-1">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-green-600">Bulan Ini</span>
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                </div>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{formatCompact(data.thisMonth.revenue)}</div>
                            <p className="text-[10px] text-gray-400 mt-1">{data.thisMonth.orders} pesanan</p>
                        </CardContent>
                    </Card>

                    {/* Unique Customers */}
                    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white col-span-1">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-purple-600">Pelanggan</span>
                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Users className="w-3 h-3 text-purple-600" />
                                </div>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{uniqueCustomers}</div>
                            <p className="text-[10px] text-gray-400 mt-1">Pelanggan unik</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Revenue Chart */}
                <Card className="md:col-span-3">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">Pendapatan</h3>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Bulan ini</span>
                        </div>
                        {dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} tickFormatter={formatCompact} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), "Pendapatan"]}
                                        labelFormatter={(label) => `Tanggal ${label}`}
                                        contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #eee' }}
                                    />
                                    <Bar dataKey="revenue" fill="#FF5E01" radius={[6, 6, 0, 0]} maxBarSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                                Belum ada data bulan ini
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Status Cards + Top Products */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Status Cards - 3 cards */}
                <div className="md:col-span-3 grid grid-cols-3 gap-3">
                    {STATUS_CARDS.map(sc => (
                        <Card key={sc.key} className={`${sc.border} ${sc.bg}`}>
                            <CardContent className="p-4 text-center">
                                <div className={`w-2 h-2 rounded-full ${sc.dot} mx-auto mb-2`} />
                                <div className={`text-2xl font-bold ${sc.text}`}>{statusCounts[sc.key] || 0}</div>
                                <p className={`text-xs mt-1 ${sc.text} opacity-75`}>{sc.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Top Products */}
                <Card className="md:col-span-2">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-[#FF5E01]" />
                            <h3 className="text-sm font-semibold text-gray-700">Produk Terlaris</h3>
                        </div>
                        {topProducts.length > 0 ? (
                            <div className="space-y-2">
                                {topProducts.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-5 h-5 rounded-full bg-[#FF5E01] text-white text-[10px] flex-shrink-0 flex items-center justify-center font-bold">{i + 1}</span>
                                            <span className="truncate text-gray-700">{p.name}</span>
                                        </div>
                                        <span className="text-gray-500 whitespace-nowrap ml-2">{p.quantity} pcs</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-4">Belum ada data</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
