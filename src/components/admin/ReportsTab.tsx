import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Wallet,
  Layers,
  Store,
  Package,
  UserCheck,
} from "lucide-react";
import { fetchMonthlyReport, type MonthlyReportData } from "@/utils/adminApi";
import {
  fetchExpenseSummary,
  type MonthlyExpenseSummary,
  type ExpenseItem,
} from "@/services/expenses";

const formatCurrency = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function ReportsTab() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<MonthlyReportData | null>(null);
  const [expenseSummary, setExpenseSummary] = useState<MonthlyExpenseSummary | null>(null);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [month, year]);

  const loadReport = async (useCache = true) => {
    setIsLoading(true);
    try {
      const [orderResult, expenseResult] = await Promise.all([
        fetchMonthlyReport(month, year, useCache),
        fetchExpenseSummary(month, year),
      ]);

      if (orderResult.success) {
        setData(orderResult);
      }
      if (expenseResult.success) {
        setExpenseSummary(expenseResult.summary);
        setExpenseItems(expenseResult.expenses);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = data?.totals.revenue || 0;
  const totalExpense = expenseSummary?.totalAmount || 0;
  const netProfit = totalRevenue - totalExpense;
  const profitMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

  const handleExportPDF = async () => {
    if (!data) return;
    setIsExporting(true);

    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const margin = 16;
      const contentW = pw - margin * 2;
      let y = 16;

      // Color Palette (Shadcn Executive Minimalist)
      const slate900 = [15, 23, 42];
      const slate700 = [51, 65, 85];
      const slate600 = [71, 85, 105];
      const slate500 = [100, 116, 139];
      const slate400 = [148, 163, 184];
      const slate200 = [226, 232, 240];
      const slate100 = [241, 245, 249];
      const slate50 = [248, 250, 252];
      const emerald600 = [5, 150, 105];
      const rose600 = [225, 29, 72];

      // ── MINIMALIST EXECUTIVE HEADER ──
      y = 20;

      // Header Row (Brand Title & Document Badge)
      doc.setTextColor(slate900[0], slate900[1], slate900[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TIDURLAH GRAFIKA', margin, y);

      // Period & Print Info (Right Aligned)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(slate700[0], slate700[1], slate700[2]);
      doc.text(`LAPORAN KEUANGAN & OPERASIONAL`, pw - margin, y - 2, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(slate500[0], slate500[1], slate500[2]);
      doc.text(
        `Periode: ${MONTHS[month - 1]} ${year}  |  Dicetak: ${new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}`,
        pw - margin,
        y + 3,
        { align: 'right' }
      );

      y += 8;

      // Thin divider line
      doc.setDrawColor(slate200[0], slate200[1], slate200[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pw - margin, y);
      y += 6;

      // ── EXECUTIVE FINANCIAL KPI GRID (4 Cards) ──
      const cardGap = 3;
      const cardW = (contentW - cardGap * 3) / 4;
      const cardH = 22;

      const summaryCards = [
        {
          label: 'PENDAPATAN KOTOR',
          value: formatCurrency(totalRevenue),
          sub: `${data.totals.orders} total pesanan`,
          color: slate900,
        },
        {
          label: 'TOTAL PENGELUARAN',
          value: formatCurrency(totalExpense),
          sub: `${expenseSummary?.totalCount || 0} catatan belanja`,
          color: rose600,
        },
        {
          label: 'LABA BERSIH (MARGIN)',
          value: formatCurrency(netProfit),
          sub: `${netProfit >= 0 ? '+' : ''}${profitMarginPercent}% rasio margin`,
          color: netProfit >= 0 ? emerald600 : rose600,
        },
        {
          label: 'RATA-RATA ORDER',
          value: formatCurrency(data.totals.avgOrderValue),
          sub: 'Nilai per transaksi',
          color: slate900,
        },
      ];

      summaryCards.forEach((c, idx) => {
        const cx = margin + idx * (cardW + cardGap);
        // Card Background (Slate 50)
        doc.setFillColor(slate50[0], slate50[1], slate50[2]);
        doc.roundedRect(cx, y, cardW, cardH, 1.5, 1.5, 'F');
        // Card Border (Slate 200 Hairline)
        doc.setDrawColor(slate200[0], slate200[1], slate200[2]);
        doc.setLineWidth(0.25);
        doc.roundedRect(cx, y, cardW, cardH, 1.5, 1.5, 'S');

        // Card Label
        doc.setTextColor(slate500[0], slate500[1], slate500[2]);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(c.label, cx + 3.5, y + 6);

        // Card Value
        doc.setTextColor(c.color[0], c.color[1], c.color[2]);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text(c.value, cx + 3.5, y + 13);

        // Card Subtext
        doc.setTextColor(slate400[0], slate400[1], slate400[2]);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(c.sub, cx + 3.5, y + 18.5);
      });

      y += cardH + 8;

      // ── HELPER FUNCTION: DRAW SECTION HEADER ──
      const drawSectionHeader = (title: string, subtitle?: string) => {
        if (y > ph - 35) {
          doc.addPage();
          y = 20;
        }

        // Text title (left aligned)
        doc.setTextColor(slate900[0], slate900[1], slate900[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);

        // Subtitle (right aligned - eliminates any text overlap)
        if (subtitle) {
          doc.setTextColor(slate500[0], slate500[1], slate500[2]);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.text(subtitle, pw - margin, y, { align: 'right' });
        }

        y += 2.5;
        doc.setDrawColor(slate200[0], slate200[1], slate200[2]);
        doc.setLineWidth(0.2);
        doc.line(margin, y, pw - margin, y);
        y += 4.5;
      };

      // ============================================================
      // PAGE 1: SUMMARY, PRODUK TERLARIS & PERFORMA KASIR
      // ============================================================

      // ── SECTION 1 (PAGE 1): PRODUK TERLARIS (TOP 10) ──
      if (data.topProducts.length > 0) {
        drawSectionHeader('Produk Terlaris & Kontribusi Omzet', '10 produk dengan volume tertinggi');

        doc.setFillColor(slate100[0], slate100[1], slate100[2]);
        doc.rect(margin, y, contentW, 6, 'F');
        doc.setTextColor(slate700[0], slate700[1], slate700[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('#', margin + 3, y + 4.2);
        doc.text('Nama Produk', margin + 8, y + 4.2);
        doc.text('Volume', margin + contentW * 0.7, y + 4.2, { align: 'right' });
        doc.text('Total Omzet (IDR)', margin + contentW - 3, y + 4.2, { align: 'right' });
        y += 6.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        data.topProducts.slice(0, 10).forEach((p, idx) => {
          if (idx % 2 === 1) {
            doc.setFillColor(slate50[0], slate50[1], slate50[2]);
            doc.rect(margin, y - 3, contentW, 5.5, 'F');
          }

          doc.setTextColor(slate500[0], slate500[1], slate500[2]);
          doc.text(`${idx + 1}`, margin + 3, y + 1);
          doc.setTextColor(slate900[0], slate900[1], slate900[2]);
          doc.text(p.name.substring(0, 48), margin + 8, y + 1);
          doc.setTextColor(slate500[0], slate500[1], slate500[2]);
          doc.text(`${p.quantity} pcs`, margin + contentW * 0.7, y + 1, { align: 'right' });
          doc.setTextColor(slate900[0], slate900[1], slate900[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(formatCurrency(p.revenue), margin + contentW - 3, y + 1, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          y += 5.5;
        });

        y += 6;
      }

      // ── SECTION 2 (PAGE 1): PERFORMA KASIR ──
      if (data.byCashier.length > 0) {
        drawSectionHeader('Performa Transaksi per Kasir', 'Pencatatan kasir dan volume');

        doc.setFillColor(slate100[0], slate100[1], slate100[2]);
        doc.rect(margin, y, contentW, 6, 'F');
        doc.setTextColor(slate700[0], slate700[1], slate700[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Nama Kasir', margin + 3, y + 4.2);
        doc.text('Jumlah Pesanan', margin + contentW * 0.5, y + 4.2);
        doc.text('Total Penjualan (IDR)', margin + contentW - 3, y + 4.2, { align: 'right' });
        y += 6.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        data.byCashier.forEach((c, idx) => {
          if (idx % 2 === 1) {
            doc.setFillColor(slate50[0], slate50[1], slate50[2]);
            doc.rect(margin, y - 3, contentW, 5.5, 'F');
          }

          doc.setTextColor(slate900[0], slate900[1], slate900[2]);
          doc.text(c.cashier, margin + 3, y + 1);
          doc.setTextColor(slate500[0], slate500[1], slate500[2]);
          doc.text(`${c.orders} pesanan`, margin + contentW * 0.5, y + 1);
          doc.setTextColor(slate900[0], slate900[1], slate900[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(formatCurrency(c.revenue), margin + contentW - 3, y + 1, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          y += 5.5;
        });
      }

      // ============================================================
      // PAGE 2+: EXPENSES DETAILS & OPERATIONAL ALLOCATION
      // ============================================================
      doc.addPage();
      y = 16;

      // Header Page 2
      y = 20;

      doc.setTextColor(slate900[0], slate900[1], slate900[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TIDURLAH GRAFIKA', margin, y);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(slate700[0], slate700[1], slate700[2]);
      doc.text(`RINCIAN PENGELUARAN OPERASIONAL`, pw - margin, y - 2, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(slate500[0], slate500[1], slate500[2]);
      doc.text(`Periode: ${MONTHS[month - 1]} ${year}`, pw - margin, y + 3, { align: 'right' });

      y += 8;
      doc.setDrawColor(slate200[0], slate200[1], slate200[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pw - margin, y);
      y += 6;

      // ── SECTION A (PAGE 2): ALOKASI PER KATEGORI ──
      if (expenseSummary && expenseSummary.byCategory.length > 0) {
        drawSectionHeader('Alokasi Pengeluaran per Kategori', 'Komposisi biaya operasional');

        doc.setFillColor(slate100[0], slate100[1], slate100[2]);
        doc.rect(margin, y, contentW, 6, 'F');
        doc.setTextColor(slate700[0], slate700[1], slate700[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Kategori', margin + 3, y + 4.2);
        doc.text('Jumlah Catatan', margin + contentW * 0.48, y + 4.2);
        doc.text('Total Nominal (IDR)', margin + contentW * 0.72, y + 4.2, { align: 'right' });
        doc.text('Rasio Finansial', margin + contentW - 3, y + 4.2, { align: 'right' });
        y += 6.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        expenseSummary.byCategory.forEach((cat, idx) => {
          if (idx % 2 === 1) {
            doc.setFillColor(slate50[0], slate50[1], slate50[2]);
            doc.rect(margin, y - 3, contentW, 5.5, 'F');
          }

          doc.setTextColor(slate900[0], slate900[1], slate900[2]);
          doc.text(cat.category, margin + 3, y + 1);
          doc.setTextColor(slate500[0], slate500[1], slate500[2]);
          doc.text(`${cat.count} transaksi`, margin + contentW * 0.48, y + 1);
          doc.setTextColor(slate900[0], slate900[1], slate900[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(formatCurrency(cat.total), margin + contentW * 0.72, y + 1, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(slate500[0], slate500[1], slate500[2]);
          doc.text(`${cat.percentage}%`, margin + contentW - 3, y + 1, { align: 'right' });
          y += 5.5;
        });

        y += 5;
      }

      // ── SECTION B (PAGE 2): TEMPAT BELANJA / VENDOR ──
      if (expenseSummary && expenseSummary.byPlatform.length > 0) {
        drawSectionHeader('Tempat Belanja & Platform Pembelian', 'Shopee, Toko Offline / Agen, dsb.');

        doc.setFillColor(slate100[0], slate100[1], slate100[2]);
        doc.rect(margin, y, contentW, 6, 'F');
        doc.setTextColor(slate700[0], slate700[1], slate700[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Tempat Belanja / Vendor', margin + 3, y + 4.2);
        doc.text('Frekuensi', margin + contentW * 0.48, y + 4.2);
        doc.text('Total Pembelian (IDR)', margin + contentW * 0.72, y + 4.2, { align: 'right' });
        doc.text('Porsi Belanja', margin + contentW - 3, y + 4.2, { align: 'right' });
        y += 6.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        expenseSummary.byPlatform.forEach((plat, idx) => {
          if (idx % 2 === 1) {
            doc.setFillColor(slate50[0], slate50[1], slate50[2]);
            doc.rect(margin, y - 3, contentW, 5.5, 'F');
          }

          doc.setTextColor(slate900[0], slate900[1], slate900[2]);
          doc.text(plat.platform, margin + 3, y + 1);
          doc.setTextColor(slate500[0], slate500[1], slate500[2]);
          doc.text(`${plat.count} kali`, margin + contentW * 0.48, y + 1);
          doc.setTextColor(slate900[0], slate900[1], slate900[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(formatCurrency(plat.total), margin + contentW * 0.72, y + 1, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(slate500[0], slate500[1], slate500[2]);
          doc.text(`${plat.percentage}%`, margin + contentW - 3, y + 1, { align: 'right' });
          y += 5.5;
        });

        y += 5;
      }

      // ── SECTION C (PAGE 2+): RINCIAN LENGKAP TRANSAKSI PENGELUARAN ──
      drawSectionHeader(
        'Rincian Transaksi Pengeluaran',
        `${expenseItems.length} catatan belanja & operasional`
      );

      if (expenseItems.length > 0) {
        // Table Header
        const renderExpenseTableHeader = (currY: number) => {
          doc.setFillColor(slate100[0], slate100[1], slate100[2]);
          doc.rect(margin, currY, contentW, 6, 'F');
          doc.setTextColor(slate700[0], slate700[1], slate700[2]);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('Tanggal', margin + 3, currY + 4.2);
          doc.text('Keterangan Belanja', margin + 24, currY + 4.2);
          doc.text('Kategori', margin + 78, currY + 4.2);
          doc.text('Tempat Belanja', margin + 114, currY + 4.2);
          doc.text('Metode', margin + 142, currY + 4.2);
          doc.text('Nominal (IDR)', margin + contentW - 3, currY + 4.2, { align: 'right' });
          return currY + 6.5;
        };

        y = renderExpenseTableHeader(y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        expenseItems.forEach((item, idx) => {
          if (y > ph - 25) {
            doc.addPage();
            y = 20;
            // Draw continuation header
            doc.setTextColor(slate700[0], slate700[1], slate700[2]);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('Rincian Transaksi Pengeluaran (Lanjutan)', margin, y);
            y += 4;
            y = renderExpenseTableHeader(y);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
          }

          if (idx % 2 === 1) {
            doc.setFillColor(slate50[0], slate50[1], slate50[2]);
            doc.rect(margin, y - 3, contentW, 5.5, 'F');
          }

          doc.setTextColor(slate500[0], slate500[1], slate500[2]);
          doc.text(item.date, margin + 3, y + 1);
          doc.setTextColor(slate900[0], slate900[1], slate900[2]);
          doc.text(item.title.substring(0, 26), margin + 24, y + 1);
          doc.setTextColor(slate600[0], slate600[1], slate600[2]);
          doc.text(item.category.substring(0, 18), margin + 78, y + 1);
          doc.text(item.platform.substring(0, 14), margin + 114, y + 1);
          doc.text(item.payment_method.substring(0, 12), margin + 142, y + 1);
          doc.setTextColor(slate900[0], slate900[1], slate900[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(formatCurrency(item.amount), margin + contentW - 3, y + 1, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          y += 5.5;
        });

        // Summary row at bottom of expenses
        y += 2;
        doc.setDrawColor(slate200[0], slate200[1], slate200[2]);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pw - margin, y);
        y += 4.5;

        doc.setTextColor(slate900[0], slate900[1], slate900[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL PENGELUARAN:', margin + 3, y);
        doc.setTextColor(rose600[0], rose600[1], rose600[2]);
        doc.text(formatCurrency(totalExpense), margin + contentW - 3, y, { align: 'right' });
      } else {
        // Empty State Box for Expenses
        doc.setFillColor(slate50[0], slate50[1], slate50[2]);
        doc.rect(margin, y, contentW, 8, 'F');
        doc.setDrawColor(slate200[0], slate200[1], slate200[2]);
        doc.setLineWidth(0.2);
        doc.rect(margin, y, contentW, 8, 'S');
        doc.setTextColor(slate400[0], slate400[1], slate400[2]);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text('Tidak ada catatan transaksi pengeluaran operasional pada periode ini (Total: Rp 0).', margin + 4, y + 5);
        y += 12;
      }

      // ── FOOTER ON EVERY PAGE ──
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        // Hairline divider
        doc.setDrawColor(slate200[0], slate200[1], slate200[2]);
        doc.setLineWidth(0.2);
        doc.line(margin, ph - 13, pw - margin, ph - 13);

        // Footer Text
        doc.setTextColor(slate400[0], slate400[1], slate400[2]);
        doc.setFontSize(6.8);
        doc.setFont('helvetica', 'normal');
        doc.text('Tidurlah Grafika — Laporan Resmi Pembukuan Bisnis (idcardlampung.com)', margin, ph - 8);
        doc.text(`Halaman ${p} dari ${totalPages}`, pw - margin, ph - 8, { align: 'right' });
      }

      doc.save(`laporan-keuangan-${MONTHS[month - 1].toLowerCase()}-${year}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Month/Year picker & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border rounded-lg px-3 py-1.5 shadow-sm text-xs text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1" />
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="bg-transparent font-medium outline-none cursor-pointer"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <span className="text-gray-300">/</span>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="bg-transparent font-medium outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadReport(false)}
            disabled={isLoading}
            className="h-8 px-2.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Button
          size="sm"
          onClick={handleExportPDF}
          disabled={isExporting || !data || (data.totals.orders === 0 && totalExpense === 0)}
          className="h-8 text-xs bg-[#FF5E01] hover:bg-[#e54d00] text-white shadow-sm"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-1.5" />
          )}
          Export Dokumen PDF
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF5E01]" />
          <p className="text-xs text-gray-500 mt-2">Memuat pembukuan laporan...</p>
        </div>
      ) : !data || (data.totals.orders === 0 && totalExpense === 0) ? (
        <div className="text-center py-16 text-gray-400 text-xs border border-dashed rounded-xl bg-white">
          Tidak ada data transaksi atau pengeluaran untuk {MONTHS[month - 1]} {year}
        </div>
      ) : (
        <>
          {/* Executive Summary Cards (Pendapatan, Pengeluaran, Laba Bersih, Rata-rata) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Pendapatan */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50/60 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-green-700">Total Pendapatan</span>
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-green-700" />
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
                <p className="text-[10px] text-gray-400 mt-1">{data.totals.orders} transaksi pesanan</p>
              </CardContent>
            </Card>

            {/* Pengeluaran */}
            <Card className="border-rose-200 bg-gradient-to-br from-rose-50/60 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-rose-700">Total Pengeluaran</span>
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-700" />
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(totalExpense)}</div>
                <p className="text-[10px] text-gray-400 mt-1">{expenseSummary?.totalCount || 0} catatan belanja</p>
              </CardContent>
            </Card>

            {/* Laba Bersih */}
            <Card
              className={`border ${netProfit >= 0
                  ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white'
                  : 'border-rose-200 bg-gradient-to-br from-rose-50/60 to-white'
                }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                  >
                    Laba Bersih
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${netProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(netProfit)}</div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Margin: {netProfit >= 0 ? '+' : ''}
                  {profitMarginPercent}%
                </p>
              </CardContent>
            </Card>

            {/* Rata-rata per Pesanan */}
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700">Rata-rata Order</span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(data.totals.avgOrderValue)}</div>
                <p className="text-[10px] text-gray-400 mt-1">Nilai per nota pesanan</p>
              </CardContent>
            </Card>
          </div>

          {/* Section: Category & Platform Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breakdown Pengeluaran per Kategori */}
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-[#FF5E01]" />
                  <h3 className="text-sm font-semibold text-gray-800">Alokasi Biaya per Kategori</h3>
                </div>
                {expenseSummary && expenseSummary.byCategory.length > 0 ? (
                  <div className="space-y-2">
                    {expenseSummary.byCategory.map((cat, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0 border-slate-100">
                        <div>
                          <span className="font-medium text-gray-800">{cat.category}</span>
                          <span className="text-[11px] text-gray-400 ml-2">({cat.count} transaksi)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 font-mono">{formatCurrency(cat.total)}</span>
                          <Badge variant="secondary" className="text-[10px] font-normal w-12 text-center justify-center">
                            {cat.percentage}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-4 text-center">Belum ada data pengeluaran bulan ini</p>
                )}
              </CardContent>
            </Card>

            {/* Breakdown Tempat Belanja / Platform */}
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Store className="w-4 h-4 text-[#FF5E01]" />
                  <h3 className="text-sm font-semibold text-gray-800">Tempat Belanja / Vendor</h3>
                </div>
                {expenseSummary && expenseSummary.byPlatform.length > 0 ? (
                  <div className="space-y-2">
                    {expenseSummary.byPlatform.map((plat, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0 border-slate-100">
                        <div>
                          <span className="font-medium text-gray-800">{plat.platform}</span>
                          <span className="text-[11px] text-gray-400 ml-2">({plat.count} kali)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 font-mono">{formatCurrency(plat.total)}</span>
                          <Badge variant="secondary" className="text-[10px] font-normal w-12 text-center justify-center">
                            {plat.percentage}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-4 text-center">Belum ada data tempat belanja bulan ini</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section: Top Products & Cashier Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Products */}
            {data.topProducts.length > 0 && (
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-[#FF5E01]" />
                    <h3 className="text-sm font-semibold text-gray-800">Produk Terlaris</h3>
                  </div>
                  <div className="space-y-1.5">
                    {data.topProducts.slice(0, 8).map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0 border-slate-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="truncate text-gray-700">{p.name}</span>
                        </div>
                        <div className="flex gap-3 ml-2 whitespace-nowrap">
                          <span className="text-gray-400">{p.quantity} pcs</span>
                          <span className="font-semibold text-gray-900 font-mono">{formatCurrency(p.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* By Cashier */}
            {data.byCashier.length > 0 && (
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck className="w-4 h-4 text-[#FF5E01]" />
                    <h3 className="text-sm font-semibold text-gray-800">Performa Kasir</h3>
                  </div>
                  <div className="space-y-1.5">
                    {data.byCashier.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0 border-slate-100">
                        <span className="font-medium text-gray-700">{c.cashier}</span>
                        <div className="flex gap-3 ml-2 whitespace-nowrap">
                          <span className="text-gray-400">{c.orders} pesanan</span>
                          <span className="font-semibold text-gray-900 font-mono">{formatCurrency(c.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
