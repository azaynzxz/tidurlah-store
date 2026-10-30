import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchDashboardData,
  fetchMonthlyReport,
  type DashboardData,
  type DailyBreakdown,
  type ProductRanking,
} from "@/utils/adminApi";
import { fetchOrderHistory, type OrderHistoryItem } from "@/utils/api";
import { fetchExpenseSummary } from "@/services/expenses";

const formatCurrency = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;
const formatCompact = (n: number) => {
  if (Math.abs(n) >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`;
  if (Math.abs(n) >= 1000) return `Rp ${(n / 1000).toFixed(0)}rb`;
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
  const [dailyExpensesMap, setDailyExpensesMap] = useState<Record<number, number>>({});
  const [monthExpensesTotal, setMonthExpensesTotal] = useState<number>(0);
  const [topProducts, setTopProducts] = useState<ProductRanking[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [uniqueCustomers, setUniqueCustomers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (useCache = true) => {
    setIsLoading(true);
    setError("");
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    try {
      const [dashboard, monthly, ordersResult, expenseRes] = await Promise.all([
        fetchDashboardData(useCache),
        fetchMonthlyReport(currentMonth, currentYear, useCache),
        fetchOrderHistory({ limit: 500 }),
        fetchExpenseSummary(currentMonth, currentYear),
      ]);

      if (dashboard.success) setData(dashboard);
      else setError(dashboard.error || "Gagal memuat data");

      if (monthly.success) {
        setDailyData(monthly.dailyBreakdown);
        setTopProducts(monthly.topProducts.slice(0, 5));
      }

      if (expenseRes.success) {
        setMonthExpensesTotal(expenseRes.summary.totalAmount);
        setDailyExpensesMap(expenseRes.summary.dailyExpenses);
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

  // Merge daily revenue & daily expense for Area Chart
  const mergedChartData = useMemo(() => {
    const revenueMap: Record<number, number> = {};
    dailyData.forEach(d => {
      revenueMap[d.day] = d.revenue;
    });

    const todayDate = new Date().getDate();
    // Gather all days from 1 to max day or todayDate
    const allDays = new Set<number>();
    for (let d = 1; d <= Math.max(todayDate, ...dailyData.map(x => x.day), ...Object.keys(dailyExpensesMap).map(Number)); d++) {
      allDays.add(d);
    }

    const sortedDays = Array.from(allDays).sort((a, b) => a - b);
    return sortedDays.map(day => {
      const rev = revenueMap[day] || 0;
      const exp = dailyExpensesMap[day] || 0;
      return {
        day,
        revenue: rev,
        expense: exp,
        profit: rev - exp,
      };
    });
  }, [dailyData, dailyExpensesMap]);

  const thisMonthNetProfit = useMemo(() => {
    const rev = data?.thisMonth.revenue || 0;
    return rev - monthExpensesTotal;
  }, [data, monthExpensesTotal]);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Ringkasan Finansial & Operasional</h2>
          <p className="text-xs text-gray-500">Performa penjualan, pengeluaran, dan margin laba</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadData(false)} disabled={isLoading} className="h-8">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Main: KPI Cards + Area Chart in 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: 2x2 KPI Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {/* This Month Revenue */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50/60 to-white col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-green-700">Pendapatan Bulan Ini</span>
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-green-700" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCompact(data.thisMonth.revenue)}</div>
              <p className="text-[10px] text-gray-400 mt-1">{data.thisMonth.orders} pesanan masuk</p>
            </CardContent>
          </Card>

          {/* This Month Expense */}
          <Card className="border-rose-200 bg-gradient-to-br from-rose-50/60 to-white col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-rose-700">Pengeluaran Bulan Ini</span>
                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-700" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCompact(monthExpensesTotal)}</div>
              <p className="text-[10px] text-gray-400 mt-1">Bahan baku & operasional</p>
            </CardContent>
          </Card>

          {/* Net Profit This Month */}
          <Card
            className={`col-span-1 border ${
              thisMonthNetProfit >= 0
                ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white'
                : 'border-amber-200 bg-gradient-to-br from-amber-50/60 to-white'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-medium ${
                    thisMonthNetProfit >= 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  Laba Bersih Bulan Ini
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    thisMonthNetProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCompact(thisMonthNetProfit)}</div>
              <p className="text-[10px] text-gray-400 mt-1">
                {thisMonthNetProfit >= 0 ? 'Surplus operasional' : 'Defisit operasional'}
              </p>
            </CardContent>
          </Card>

          {/* All-time Revenue */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-white col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-orange-700">Total Omzet All-Time</span>
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-orange-700" />
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">{formatCompact(data.allTime.revenue)}</div>
              <p className="text-[10px] text-gray-400 mt-1">{data.allTime.orders} pesanan selesai</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Dual Area/Line Chart (Pendapatan vs Pengeluaran) */}
        <Card className="lg:col-span-3 border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Tren Pendapatan vs Pengeluaran</h3>
                <p className="text-[11px] text-gray-400">Perbandingan arus kas harian bulan ini</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E01]" />
                  <span>Pendapatan</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
                  <span>Pengeluaran</span>
                </div>
              </div>
            </div>

            {mergedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={mergedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5E01" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FF5E01" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E11D48" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={formatCompact} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const rev = (payload.find(p => p.dataKey === 'revenue')?.value as number) || 0;
                        const exp = (payload.find(p => p.dataKey === 'expense')?.value as number) || 0;
                        const margin = rev - exp;
                        return (
                          <div className="bg-white/95 backdrop-blur-sm border rounded-lg p-2.5 shadow-md text-xs space-y-1.5 font-sans min-w-[170px]">
                            <p className="font-semibold text-gray-700">Tanggal {label}</p>
                            <div className="flex items-center justify-between gap-4 text-gray-600">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#FF5E01]" />
                                Pendapatan:
                              </span>
                              <span className="font-bold font-mono text-gray-900">{formatCurrency(rev)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-gray-600">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                                Pengeluaran:
                              </span>
                              <span className="font-bold font-mono text-gray-900">{formatCurrency(exp)}</span>
                            </div>
                            <div className="pt-1 border-t flex items-center justify-between gap-4 text-[11px]">
                              <span className="text-gray-500">Laba Harian:</span>
                              <span
                                className={`font-bold font-mono ${
                                  margin >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {margin >= 0 ? '+' : ''}
                                {formatCurrency(margin)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF5E01"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradientRevenue)"
                    name="Pendapatan"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#E11D48"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradientExpense)"
                    name="Pengeluaran"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[230px] text-gray-400 text-sm">
                Belum ada data transaksi bulan ini
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
        <Card className="md:col-span-2 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-[#FF5E01]" />
              <h3 className="text-sm font-semibold text-gray-700">Produk Terlaris Bulan Ini</h3>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#FF5E01] text-white text-[10px] flex-shrink-0 flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="truncate text-gray-700">{p.name}</span>
                    </div>
                    <span className="text-gray-500 whitespace-nowrap ml-2 font-mono">{p.quantity} pcs</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada data produk</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
