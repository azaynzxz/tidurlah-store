import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, FileText, TrendingUp, ShoppingCart, RefreshCw, Calendar } from "lucide-react";
import { fetchMonthlyReport, type MonthlyReportData } from "@/utils/adminApi";

const formatCurrency = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function ReportsTab() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState<MonthlyReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => { loadReport(); }, [month, year]);

    const loadReport = async (useCache = true) => {
        setIsLoading(true);
        try {
            const result = await fetchMonthlyReport(month, year, useCache);
            if (result.success) setData(result);
        } catch { /* ignore */ }
        finally { setIsLoading(false); }
    };

    const handleExportPDF = async () => {
        if (!data) return;
        setIsExporting(true);

        try {
            const jsPDF = (await import('jspdf')).default;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pw = doc.internal.pageSize.getWidth();
            const ph = doc.internal.pageSize.getHeight();
            const margin = 18;
            const contentW = pw - margin * 2;
            let y = 0;

            // ── HEADER BAND ──
            doc.setFillColor(255, 94, 1); // #FF5E01
            doc.rect(0, 0, pw, 38, 'F');
            // White accent line
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.3);
            doc.line(margin, 32, pw - margin, 32);

            // Company name
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('TIDURLAH GRAFIKA', margin, 16);

            // Report title
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Laporan Bulanan — ${MONTHS[month - 1]} ${year}`, margin, 24);

            // Date stamp right-aligned
            doc.setFontSize(8);
            doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, pw - margin, 16, { align: 'right' });

            y = 48;

            // ── SUMMARY CARDS ──
            const cardW = (contentW - 8) / 3;
            const cards = [
                { label: 'Total Pesanan', value: `${data.totals.orders}`, sub: 'pesanan' },
                { label: 'Total Pendapatan', value: formatCurrency(data.totals.revenue), sub: '' },
                { label: 'Rata-rata / Pesanan', value: formatCurrency(data.totals.avgOrderValue), sub: '' },
            ];

            cards.forEach((c, i) => {
                const x = margin + i * (cardW + 4);
                // Card background
                doc.setFillColor(250, 250, 250);
                doc.roundedRect(x, y, cardW, 22, 2, 2, 'F');
                // Card border
                doc.setDrawColor(230, 230, 230);
                doc.setLineWidth(0.2);
                doc.roundedRect(x, y, cardW, 22, 2, 2, 'S');
                // Label
                doc.setTextColor(130, 130, 130);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.text(c.label, x + 4, y + 7);
                // Value
                doc.setTextColor(30, 30, 30);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(c.value, x + 4, y + 16);
            });

            y += 32;

            // ── SECTION: TOP PRODUCTS ──
            if (data.topProducts.length > 0) {
                // Section title with accent bar
                doc.setFillColor(255, 94, 1);
                doc.rect(margin, y, 3, 6, 'F');
                doc.setTextColor(30, 30, 30);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('Produk Terlaris', margin + 6, y + 5);
                y += 12;

                // Table header
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, y, contentW, 7, 'F');
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'bold');
                doc.text('#', margin + 3, y + 5);
                doc.text('Nama Produk', margin + 10, y + 5);
                doc.text('Qty', margin + contentW * 0.65, y + 5);
                doc.text('Pendapatan', margin + contentW * 0.78, y + 5);
                y += 9;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                data.topProducts.slice(0, 15).forEach((p, i) => {
                    if (y > ph - 30) { doc.addPage(); y = 20; }

                    // Zebra stripe
                    if (i % 2 === 0) {
                        doc.setFillColor(252, 252, 252);
                        doc.rect(margin, y - 3.5, contentW, 7, 'F');
                    }

                    // Rank badge
                    doc.setFillColor(255, 94, 1);
                    if (i < 3) {
                        doc.circle(margin + 5, y - 0.5, 2.5, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(6);
                        doc.text(`${i + 1}`, margin + 5, y + 0.5, { align: 'center' });
                    } else {
                        doc.setTextColor(150, 150, 150);
                        doc.setFontSize(7);
                        doc.text(`${i + 1}`, margin + 5, y, { align: 'center' });
                    }

                    doc.setTextColor(50, 50, 50);
                    doc.setFontSize(8);
                    doc.text(p.name.substring(0, 45), margin + 10, y);
                    doc.setTextColor(80, 80, 80);
                    doc.text(`${p.quantity}`, margin + contentW * 0.65, y);
                    doc.text(formatCurrency(p.revenue), margin + contentW * 0.78, y);
                    y += 7;
                });
                y += 6;
            }

            // ── SECTION: CASHIER PERFORMANCE ──
            if (data.byCashier.length > 0) {
                if (y > ph - 50) { doc.addPage(); y = 20; }

                doc.setFillColor(255, 94, 1);
                doc.rect(margin, y, 3, 6, 'F');
                doc.setTextColor(30, 30, 30);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('Performa Kasir', margin + 6, y + 5);
                y += 12;

                // Table header
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, y, contentW, 7, 'F');
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'bold');
                doc.text('Kasir', margin + 4, y + 5);
                doc.text('Pesanan', margin + contentW * 0.55, y + 5);
                doc.text('Pendapatan', margin + contentW * 0.72, y + 5);
                y += 9;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                data.byCashier.forEach((c, i) => {
                    if (y > ph - 30) { doc.addPage(); y = 20; }

                    if (i % 2 === 0) {
                        doc.setFillColor(252, 252, 252);
                        doc.rect(margin, y - 3.5, contentW, 7, 'F');
                    }

                    doc.setTextColor(50, 50, 50);
                    doc.text(c.cashier, margin + 4, y);
                    doc.text(`${c.orders}`, margin + contentW * 0.55, y);
                    doc.setTextColor(34, 139, 34);
                    doc.text(formatCurrency(c.revenue), margin + contentW * 0.72, y);
                    y += 7;
                });
            }

            // ── FOOTER ──
            const totalPages = doc.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) {
                doc.setPage(p);
                // Footer line
                doc.setDrawColor(230, 230, 230);
                doc.setLineWidth(0.3);
                doc.line(margin, ph - 14, pw - margin, ph - 14);
                // Footer text
                doc.setTextColor(170, 170, 170);
                doc.setFontSize(7);
                doc.text('Tidurlah Grafika — tidurlah.com', margin, ph - 9);
                doc.text(`Halaman ${p} dari ${totalPages}`, pw - margin, ph - 9, { align: 'right' });
            }

            doc.save(`laporan-${MONTHS[month - 1].toLowerCase()}-${year}.pdf`);
        } catch (err) {
            console.error('PDF export error:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4">

            {/* Month/Year picker */}
            <div className="flex gap-2 items-center">
                <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-4 h-4" />
                </div>
                <select
                    value={month}
                    onChange={e => setMonth(Number(e.target.value))}
                    className="text-sm border rounded-lg px-3 py-1.5 bg-white"
                >
                    {MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                    ))}
                </select>
                <select
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="text-sm border rounded-lg px-3 py-1.5 bg-white"
                >
                    {[2024, 2025, 2026, 2027].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                <Button variant="outline" size="sm" onClick={() => loadReport(false)} disabled={isLoading} className="h-8">
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>

                <Button
                    size="sm"
                    onClick={handleExportPDF}
                    disabled={isExporting || !data || data.totals.orders === 0}
                    className="ml-auto h-8 text-xs bg-[#FF5E01] hover:bg-[#e54d00] text-white"
                >
                    {isExporting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Download className="w-3 h-3 mr-1" />}
                    Export PDF
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF5E01]" />
                    <p className="text-sm text-gray-500 mt-2">Memuat laporan...</p>
                </div>
            ) : !data || data.totals.orders === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                    Tidak ada data untuk {MONTHS[month - 1]} {year}
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card className="border border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                            <CardContent className="p-3 text-center">
                                <ShoppingCart className="w-4 h-4 mx-auto mb-1.5 text-orange-600" />
                                <div className="text-2xl font-bold text-orange-700">{data.totals.orders}</div>
                                <div className="text-[10px] text-orange-600 mt-0.5">Total Pesanan</div>
                            </CardContent>
                        </Card>
                        <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-white">
                            <CardContent className="p-3 text-center">
                                <TrendingUp className="w-4 h-4 mx-auto mb-1.5 text-green-600" />
                                <div className="text-lg font-bold text-green-700">{formatCurrency(data.totals.revenue)}</div>
                                <div className="text-[10px] text-green-600 mt-0.5">Total Pendapatan</div>
                            </CardContent>
                        </Card>
                        <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                            <CardContent className="p-3 text-center">
                                <FileText className="w-4 h-4 mx-auto mb-1.5 text-blue-600" />
                                <div className="text-lg font-bold text-blue-700">{formatCurrency(data.totals.avgOrderValue)}</div>
                                <div className="text-[10px] text-blue-600 mt-0.5">Rata-rata</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Products */}
                    {data.topProducts.length > 0 && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-semibold mb-3 text-gray-700">Produk Terlaris</h3>
                                <div className="space-y-1.5">
                                    {data.topProducts.slice(0, 10).map((p, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0 border-gray-100">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-5 h-5 rounded-full bg-[#FF5E01] text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                                                <span className="truncate text-gray-700">{p.name}</span>
                                            </div>
                                            <div className="flex gap-4 ml-2 whitespace-nowrap">
                                                <span className="text-gray-500">{p.quantity} pcs</span>
                                                <span className="font-medium text-green-600 min-w-[80px] text-right">{formatCurrency(p.revenue)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* By Cashier */}
                    {data.byCashier.length > 0 && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="text-sm font-semibold mb-3 text-gray-700">Performa Kasir</h3>
                                <div className="space-y-1.5">
                                    {data.byCashier.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0 border-gray-100">
                                            <span className="font-medium text-gray-700">{c.cashier}</span>
                                            <div className="flex gap-4 ml-2 whitespace-nowrap">
                                                <span className="text-gray-500">{c.orders} pesanan</span>
                                                <span className="font-medium text-green-600 min-w-[80px] text-right">{formatCurrency(c.revenue)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
