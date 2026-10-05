import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Phone,
  TrendingUp,
  CreditCard,
  Search,
  RefreshCw,
  Download,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Pencil,
  FileSpreadsheet,
  ArrowUpDown,
  Building,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  HelpCircle,
  Clock,
  MapPin,
  Receipt,
  Send,
  Sparkles,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchCustomersData,
  fetchCustomerOrders,
  updateCustomerInSupabase,
  downloadGoogleContactsCsv,
  buildGoogleContactsCsv,
  formatCurrencyIDR,
  formatDateTime,
  formatRelativeTime,
  formatPhoneNumber,
  normalizeIndonesianPhone,
  WHATSAPP_TEMPLATES,
  type CustomerSummary,
  type CustomerOrderDetail,
  type ExportGoogleContactsConfig,
  DEFAULT_EXPORT_CONFIG,
} from '@/services/customers';

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-teal-100 text-teal-700 border-teal-200',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'PL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CustomersTab() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [phoneFilter, setPhoneFilter] = useState<'all' | 'with-phone' | 'without-phone'>('all');
  const [loyaltyFilter, setLoyaltyFilter] = useState<'all' | 'repeat' | 'single'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'orders' | 'spent' | 'name-asc' | 'name-desc'>('recent');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Copy feedback state: key is customer.id or invoiceId
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Detail Modal
  const [detailCustomer, setDetailCustomer] = useState<CustomerSummary | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrderDetail[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Edit Modal
  const [editCustomer, setEditCustomer] = useState<CustomerSummary | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    institution: '',
    address: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Export Modal
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected'>('all');
  const [exportConfig, setExportConfig] = useState<ExportGoogleContactsConfig>(DEFAULT_EXPORT_CONFIG);

  // WhatsApp Chat Modal
  const [chatCustomer, setChatCustomer] = useState<CustomerSummary | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('followup');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [copiedChatMessage, setCopiedChatMessage] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const result = await fetchCustomersData();
      if (result.success) {
        setCustomers(result.customers);
        setTotalOrdersCount(result.totalOrders);
      } else {
        toast.error('Gagal memuat data pelanggan: ' + (result.error || 'Kesalahan tidak diketahui'));
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghubungi database');
    } finally {
      setIsLoading(false);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalCount = customers.length;
    let withPhoneCount = 0;
    let repeatCount = 0;
    let totalRevenue = 0;

    for (const c of customers) {
      if (c.cleanPhone || c.phone.trim()) withPhoneCount++;
      if (c.orderCount > 1) repeatCount++;
      totalRevenue += c.totalSpent;
    }

    return {
      totalCount,
      withPhoneCount,
      repeatCount,
      totalRevenue,
      repeatRate: totalCount > 0 ? Math.round((repeatCount / totalCount) * 100) : 0,
    };
  }, [customers]);

  // Filtering & Sorting
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Search match
        if (search.trim()) {
          const query = search.toLowerCase().trim();
          const matchName = c.name.toLowerCase().includes(query);
          const matchPhone = c.phone.toLowerCase().includes(query) || c.cleanPhone.includes(query);
          const matchInst = c.institution.toLowerCase().includes(query);
          const matchAddr = c.address.toLowerCase().includes(query);
          const matchInvoice = (c.lastInvoiceId || '').toLowerCase().includes(query);
          if (!matchName && !matchPhone && !matchInst && !matchAddr && !matchInvoice) {
            return false;
          }
        }

        // Phone filter
        if (phoneFilter === 'with-phone' && !c.cleanPhone && !c.phone.trim()) {
          return false;
        }
        if (phoneFilter === 'without-phone' && (c.cleanPhone || c.phone.trim())) {
          return false;
        }

        // Loyalty filter
        if (loyaltyFilter === 'repeat' && c.orderCount <= 1) {
          return false;
        }
        if (loyaltyFilter === 'single' && c.orderCount !== 1) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
        }
        if (sortBy === 'orders') {
          return b.orderCount - a.orderCount;
        }
        if (sortBy === 'spent') {
          return b.totalSpent - a.totalSpent;
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name, 'id');
        }
        if (sortBy === 'name-desc') {
          return b.name.localeCompare(a.name, 'id');
        }
        return 0;
      });
  }, [customers, search, phoneFilter, loyaltyFilter, sortBy]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, phoneFilter, loyaltyFilter, sortBy, pageSize]);

  // Selection handlers
  const handleSelectAllCurrentPage = (checked: boolean) => {
    const updated = new Set(selectedIds);
    paginatedCustomers.forEach((c) => {
      if (checked) {
        updated.add(c.id);
      } else {
        updated.delete(c.id);
      }
    });
    setSelectedIds(updated);
  };

  const handleToggleSelect = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const isCurrentPageAllSelected =
    paginatedCustomers.length > 0 &&
    paginatedCustomers.every((c) => selectedIds.has(c.id));

  // Copy text helper
  const handleCopyText = (text: string, key: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} disalin: ${text}`);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  // Open Chat WhatsApp Modal
  const handleOpenChat = (customer: CustomerSummary, templateId = 'followup') => {
    const tpl = WHATSAPP_TEMPLATES.find((t) => t.id === templateId) || WHATSAPP_TEMPLATES[0];
    setChatCustomer(customer);
    setSelectedTemplateId(tpl.id);
    setChatMessage(tpl.buildText(customer));
    setCopiedChatMessage(false);
  };

  // Switch template in Chat Modal
  const handleSelectTemplate = (templateId: string) => {
    if (!chatCustomer) return;
    const tpl = WHATSAPP_TEMPLATES.find((t) => t.id === templateId);
    if (tpl) {
      setSelectedTemplateId(templateId);
      setChatMessage(tpl.buildText(chatCustomer));
    }
  };

  // Send WhatsApp message
  const handleSendWhatsApp = () => {
    if (!chatCustomer) return;
    const rawPhone = chatCustomer.phone || chatCustomer.cleanPhone;
    const normalized = normalizeIndonesianPhone(rawPhone);
    if (!normalized) {
      toast.error('Pelanggan ini tidak memiliki nomor telepon valid');
      return;
    }

    const encoded = encodeURIComponent(chatMessage);
    const waUrl = `https://wa.me/${normalized}?text=${encoded}`;
    window.open(waUrl, '_blank');
    toast.success(`Membuka WhatsApp untuk ${chatCustomer.name}`);
    setChatCustomer(null);
  };

  // Copy Chat Message
  const handleCopyChatMessage = () => {
    if (!chatMessage) return;
    navigator.clipboard.writeText(chatMessage);
    setCopiedChatMessage(true);
    toast.success('Pesan WhatsApp disalin ke clipboard');
    setTimeout(() => setCopiedChatMessage(false), 2000);
  };

  // Detail Modal opener
  const handleOpenDetail = async (customer: CustomerSummary) => {
    setDetailCustomer(customer);
    setLoadingOrders(true);
    try {
      const orders = await fetchCustomerOrders(customer.orderIds);
      setCustomerOrders(orders);
    } catch {
      toast.error('Gagal mengambil rincian pesanan pelanggan');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Edit Modal opener
  const handleOpenEdit = (customer: CustomerSummary) => {
    setEditCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      institution: customer.institution,
      address: customer.address,
    });
  };

  // Save Edit Handler
  const handleSaveEdit = async () => {
    if (!editCustomer) return;
    if (!editForm.name.trim()) {
      toast.error('Nama pelanggan tidak boleh kosong');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await updateCustomerInSupabase({
        oldPhone: editCustomer.phone,
        oldName: editCustomer.name,
        newName: editForm.name,
        newPhone: editForm.phone,
        newInstitution: editForm.institution,
        newAddress: editForm.address,
      });

      if (res.success) {
        toast.success('Data pelanggan berhasil diperbarui di Supabase');
        setEditCustomer(null);
        await loadCustomers();
      } else {
        toast.error('Gagal menyimpan perubahan: ' + (res.error || ''));
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Export Modal Open
  const handleOpenExport = (initialScope?: 'all' | 'filtered' | 'selected') => {
    if (initialScope) {
      setExportScope(initialScope);
    } else if (selectedIds.size > 0) {
      setExportScope('selected');
    } else if (search || phoneFilter !== 'all' || loyaltyFilter !== 'all') {
      setExportScope('filtered');
    } else {
      setExportScope('all');
    }
    setExportModalOpen(true);
  };

  // Resolve target customers to export
  const exportTargetCustomers = useMemo(() => {
    if (exportScope === 'selected') {
      return customers.filter((c) => selectedIds.has(c.id));
    }
    if (exportScope === 'filtered') {
      return filteredCustomers;
    }
    return customers;
  }, [exportScope, selectedIds, filteredCustomers, customers]);

  // Sample CSV Preview (3 rows)
  const csvPreviewRows = useMemo(() => {
    if (!exportTargetCustomers.length) return [];
    const sample = exportTargetCustomers.slice(0, 3);
    const rawCsv = buildGoogleContactsCsv(sample, exportConfig);
    const lines = rawCsv.split('\r\n').filter(Boolean);
    return lines;
  }, [exportTargetCustomers, exportConfig]);

  // Perform CSV Download
  const handleExecuteExport = () => {
    if (!exportTargetCustomers.length) {
      toast.error('Tidak ada data pelanggan untuk diekspor');
      return;
    }

    downloadGoogleContactsCsv(exportTargetCustomers, exportConfig);
    toast.success(
      `Berhasil mengekspor ${exportTargetCustomers.length} kontak siap impor Google Contacts!`
    );
    setExportModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white border rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5E01] flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Data Pelanggan</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
              Pantau riwayat order, invoice terakhir, dan hubungi pelanggan via WhatsApp dengan template siap kirim.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCustomers}
              disabled={isLoading}
              className="text-gray-700 hover:text-gray-900 border-gray-200 hover:bg-gray-50 text-xs sm:text-sm h-9 px-3 whitespace-nowrap flex-shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </Button>

            <Button
              size="sm"
              onClick={() => handleOpenExport()}
              className="bg-[#FF5E01] hover:bg-[#e54d00] text-white font-medium shadow-sm text-xs sm:text-sm h-9 px-3.5 whitespace-nowrap flex-shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Ekspor Google Contacts</span>
              <span className="sm:hidden">Ekspor CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Customers */}
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500">Total Pelanggan</p>
              <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {stats.totalCount.toLocaleString('id-ID')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contacts with Phone */}
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500">No. HP Terdata</p>
              <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {stats.withPhoneCount.toLocaleString('id-ID')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Repeat Customers */}
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500">Pelanggan Loyal (2x+)</p>
              <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {stats.repeatCount.toLocaleString('id-ID')}{' '}
                <span className="text-[10px] sm:text-xs font-normal text-amber-700">({stats.repeatRate}%)</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Spend */}
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 flex-shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500">Total Transaksi</p>
              <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {formatCurrencyIDR(stats.totalRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border rounded-xl p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari nama, no. telp, invoice, instansi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 text-xs sm:text-sm h-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Phone filter select */}
            <select
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value as any)}
              className="border border-gray-200 rounded-md text-xs sm:text-sm px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF5E01] h-9"
            >
              <option value="all">Semua Nomor</option>
              <option value="with-phone">Punya No. HP</option>
              <option value="without-phone">Tanpa No. HP</option>
            </select>

            {/* Repeat order filter select */}
            <select
              value={loyaltyFilter}
              onChange={(e) => setLoyaltyFilter(e.target.value as any)}
              className="border border-gray-200 rounded-md text-xs sm:text-sm px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF5E01] h-9"
            >
              <option value="all">Semua Frekuensi</option>
              <option value="repeat">Repeat Order (2+)</option>
              <option value="single">1x Transaksi</option>
            </select>

            {/* Sort select */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-md px-2 bg-white h-9">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs sm:text-sm py-1 bg-transparent text-gray-700 focus:outline-none"
              >
                <option value="recent">Order Terbaru</option>
                <option value="orders">Order Terbanyak</option>
                <option value="spent">Total Belanja Terbesar</option>
                <option value="name-asc">Nama (A-Z)</option>
                <option value="name-desc">Nama (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info & Bulk Actions Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>
              Menampilkan <span className="font-semibold text-gray-800">{filteredCustomers.length}</span> dari {customers.length} pelanggan
            </span>
            {(search || phoneFilter !== 'all' || loyaltyFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setPhoneFilter('all');
                  setLoyaltyFilter('all');
                }}
                className="text-xs text-[#FF5E01] hover:underline flex items-center gap-0.5 ml-1"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#FF5E01]">
                {selectedIds.size} dipilih
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenExport('selected')}
                className="h-7 text-xs border-[#FF5E01] text-[#FF5E01] hover:bg-orange-50"
              >
                <Download className="w-3 h-3 mr-1" />
                Ekspor Terpilih
              </Button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer List Container */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF5E01] mb-2" />
            <p className="text-sm font-medium">Memuat data pelanggan dari Supabase...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16 px-4 text-gray-500">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-base font-semibold text-gray-700">Tidak ada pelanggan ditemukan</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau bersihkan filter di atas.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW: Table (Hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto relative">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[840px]">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">
                      <Checkbox
                        checked={isCurrentPageAllSelected}
                        onCheckedChange={handleSelectAllCurrentPage}
                        aria-label="Pilih semua di halaman ini"
                      />
                    </th>
                    <th className="py-2.5 px-3 font-semibold min-w-[170px]">Pelanggan</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap min-w-[125px]">Nomor Telepon</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap min-w-[105px]">Instansi</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap min-w-[80px]">Total Order</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap min-w-[135px]">Pesanan Terakhir</th>
                    <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap min-w-[105px]">Total Belanja</th>
                    <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap min-w-[85px]">Chat WA</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-20 min-w-[70px] sticky right-0 bg-gray-50 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {paginatedCustomers.map((customer) => {
                    const isSelected = selectedIds.has(customer.id);
                    const isPhoneCopied = copiedKey === `phone-${customer.id}`;
                    const isInvoiceCopied = copiedKey === `inv-${customer.id}`;
                    const hasPhone = Boolean(customer.cleanPhone || customer.phone.trim());

                    return (
                      <tr
                        key={customer.id}
                        className={`group hover:bg-gray-50/80 transition-colors ${
                          isSelected ? 'bg-orange-50/40' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelect(customer.id)}
                            aria-label={`Pilih ${customer.name}`}
                          />
                        </td>

                        {/* Customer Name & Avatar */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs flex-shrink-0 ${getAvatarColor(
                                customer.name
                              )}`}
                            >
                              {getInitials(customer.name)}
                            </div>
                            <div className="min-w-0 max-w-[160px] lg:max-w-[200px] xl:max-w-[240px]">
                              <span
                                className="font-semibold text-gray-900 truncate block text-xs sm:text-sm"
                                title={customer.name}
                              >
                                {customer.name}
                              </span>
                              {customer.address && (
                                <p
                                  className="text-[11px] text-gray-400 truncate max-w-[150px] lg:max-w-[190px]"
                                  title={customer.address}
                                >
                                  {customer.address}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {hasPhone ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-gray-800">
                                {customer.formattedPhone || customer.phone}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopyText(
                                    customer.phone || customer.cleanPhone,
                                    `phone-${customer.id}`,
                                    'Nomor telepon'
                                  )
                                }
                                title="Salin nomor telepon"
                                className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                              >
                                {isPhoneCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Tanpa No. HP</span>
                          )}
                        </td>

                        {/* Institution */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {customer.institution && customer.institution !== '-' ? (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 max-w-[120px] truncate"
                              title={customer.institution}
                            >
                              {customer.institution}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </td>

                        {/* Total Order (Frequency) */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">
                            {customer.orderCount}x
                          </span>
                        </td>

                        {/* Last Order (Invoice ID & Date) */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="space-y-0.5">
                            {customer.lastInvoiceId ? (
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[11px] font-semibold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200/80">
                                  {customer.lastInvoiceId}
                                </span>
                                <button
                                  onClick={() =>
                                    handleCopyText(customer.lastInvoiceId, `inv-${customer.id}`, 'Invoice ID')
                                  }
                                  title="Salin Invoice ID"
                                  className="p-0.5 text-gray-400 hover:text-gray-600"
                                >
                                  {isInvoiceCopied ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                            <div
                              className="text-[11px] text-gray-500 font-medium cursor-help"
                              title={formatDateTime(customer.lastOrderDate)}
                            >
                              {formatRelativeTime(customer.lastOrderDate)}
                            </div>
                          </div>
                        </td>

                        {/* Total Spent */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-gray-900 text-xs sm:text-sm">
                          {formatCurrencyIDR(customer.totalSpent)}
                        </td>

                        {/* Chat WhatsApp Button */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {hasPhone ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenChat(customer)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm h-7 px-2.5 text-xs inline-flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Chat</span>
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </td>

                        {/* Menu Actions (Sticky Right) */}
                        <td
                          className={`py-2.5 px-3 text-center whitespace-nowrap sticky right-0 z-10 transition-colors shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] ${
                            isSelected ? 'bg-orange-50' : 'bg-white group-hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenDetail(customer)}
                              title="Lihat riwayat transaksi"
                              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(customer)}
                              title="Edit data pelanggan"
                              className="p-1.5 text-gray-500 hover:text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW: Mobile-Friendly Cards (Shown on mobile devices) */}
            <div className="block md:hidden divide-y divide-gray-100">
              {paginatedCustomers.map((customer) => {
                const isSelected = selectedIds.has(customer.id);
                const hasPhone = Boolean(customer.cleanPhone || customer.phone.trim());
                const isPhoneCopied = copiedKey === `phone-${customer.id}`;
                const isInvoiceCopied = copiedKey === `inv-${customer.id}`;

                return (
                  <div
                    key={customer.id}
                    className={`p-4 space-y-3 transition-colors ${
                      isSelected ? 'bg-orange-50/30' : 'bg-white'
                    }`}
                  >
                    {/* Customer Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(customer.id)}
                          aria-label={`Pilih ${customer.name}`}
                          className="mt-0.5"
                        />
                        <div
                          className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs flex-shrink-0 ${getAvatarColor(
                            customer.name
                          )}`}
                        >
                          {getInitials(customer.name)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {customer.name}
                          </h4>
                          {customer.institution && customer.institution !== '-' && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {customer.institution}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Menu for Mobile */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 text-xs">
                          <DropdownMenuItem onClick={() => handleOpenDetail(customer)}>
                            <Eye className="w-3.5 h-3.5 mr-2" />
                            Riwayat Pesanan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(customer)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />
                            Edit Pelanggan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Highlight Box: Pesanan Terakhir & Invoice ID */}
                    <div className="bg-orange-50/40 border border-orange-100 rounded-lg p-2.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-gray-500 text-[11px]">
                        <span className="flex items-center gap-1 font-medium text-orange-950">
                          <Receipt className="w-3 h-3 text-[#FF5E01]" />
                          Pesanan Terakhir:
                        </span>
                        <span className="font-semibold text-orange-800">
                          {formatRelativeTime(customer.lastOrderDate)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-xs font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-orange-200 truncate">
                            {customer.lastInvoiceId || 'INV-'}
                          </span>
                          {customer.lastInvoiceId && (
                            <button
                              onClick={() =>
                                handleCopyText(customer.lastInvoiceId, `inv-${customer.id}`, 'Invoice ID')
                              }
                              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-white"
                              title="Salin Invoice ID"
                            >
                              {isInvoiceCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {formatDateTime(customer.lastOrderDate)}
                        </span>
                      </div>

                      {customer.lastOrderItems && (
                        <p className="text-[11px] text-gray-500 truncate pt-0.5">
                          {customer.lastOrderItems}
                        </p>
                      )}
                    </div>

                    {/* Contact & Total Row */}
                    <div className="flex items-center justify-between text-xs text-gray-600 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {hasPhone ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs font-medium text-gray-800">
                              {customer.formattedPhone || customer.phone}
                            </span>
                            <button
                              onClick={() =>
                                handleCopyText(
                                  customer.phone || customer.cleanPhone,
                                  `phone-${customer.id}`,
                                  'Nomor telepon'
                                )
                              }
                              className="p-0.5 text-gray-400 hover:text-gray-600"
                            >
                              {isPhoneCopied ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Tanpa No. HP</span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-gray-400 block">Total Belanja</span>
                        <span className="font-bold text-gray-900 text-sm">
                          {formatCurrencyIDR(customer.totalSpent)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {hasPhone ? (
                        <Button
                          size="sm"
                          onClick={() => handleOpenChat(customer)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chat WhatsApp</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled
                          variant="outline"
                          className="text-xs h-9 text-gray-400"
                        >
                          Tanpa No. HP
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetail(customer)}
                        className="text-xs h-9 text-gray-700 hover:text-gray-900 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Riwayat ({customer.orderCount})</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination Bar */}
        {filteredCustomers.length > 0 && (
          <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>Baris per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="hidden sm:inline">
                Halaman {currentPage} dari {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Sebelumnya
              </Button>
              <span className="px-2 font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 text-xs"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CHAT WHATSAPP DENGAN TEMPLATE */}
      <Dialog open={Boolean(chatCustomer)} onOpenChange={(open) => !open && setChatCustomer(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <MessageCircle className="w-4 h-4" />
              </div>
              Kirim Pesan WhatsApp
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Pilih template pesan di bawah, sesuaikan teks jika diperlukan, lalu klik tombol kirim.
            </DialogDescription>
          </DialogHeader>

          {chatCustomer && (
            <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs sm:text-sm">
              {/* Customer Profile Banner */}
              <div className="bg-gray-50 border rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-sm truncate">
                      {chatCustomer.name}
                    </span>
                    {chatCustomer.institution && chatCustomer.institution !== '-' && (
                      <span className="text-[11px] text-gray-500 font-normal">
                        ({chatCustomer.institution})
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-gray-600 mt-0.5">
                    {chatCustomer.formattedPhone || chatCustomer.phone}
                  </p>
                </div>

                {chatCustomer.lastInvoiceId && (
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Invoice Terakhir</span>
                    <span className="font-mono text-xs font-bold text-[#FF5E01] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                      {chatCustomer.lastInvoiceId}
                    </span>
                  </div>
                )}
              </div>

              {/* Template Selection Pills */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Pilih Template Pesan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WHATSAPP_TEMPLATES.map((tpl) => {
                    const isActive = selectedTemplateId === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          isActive
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-semibold shadow-xs'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                            {tpl.badge}
                          </span>
                          {isActive && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <p className="text-xs truncate">{tpl.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Editor Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Isi Pesan WhatsApp
                  </label>
                  <span className="text-[11px] text-gray-400">
                    {chatMessage.length} karakter
                  </span>
                </div>
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  rows={5}
                  className="text-xs sm:text-sm leading-relaxed"
                  placeholder="Tulis pesan..."
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Pesan di atas akan otomatis terisi ke dalam ruang obrolan WhatsApp pelanggan.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyChatMessage}
              className="text-xs h-9 text-gray-700"
            >
              {copiedChatMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Salin Teks
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleSendWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Buka WhatsApp Langsung
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: DETAIL RIWAYAT PELANGGAN */}
      <Dialog open={Boolean(detailCustomer)} onOpenChange={(open) => !open && setDetailCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="w-5 h-5 text-[#FF5E01]" />
              Detail Riwayat Pelanggan
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Informasi lengkap dan seluruh daftar invoice yang tercatat di Supabase.
            </DialogDescription>
          </DialogHeader>

          {detailCustomer && (
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Customer Profile Summary */}
              <div className="bg-gray-50 border rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-400 block text-xs">Nama</span>
                  <span className="font-semibold text-gray-900 block truncate">{detailCustomer.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Nomor HP</span>
                  <span className="font-mono text-gray-900 block truncate">
                    {detailCustomer.formattedPhone || detailCustomer.phone || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Instansi</span>
                  <span className="font-medium text-gray-800 block truncate">
                    {detailCustomer.institution || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Total Belanja</span>
                  <span className="font-bold text-gray-900 block">
                    {formatCurrencyIDR(detailCustomer.totalSpent)}
                  </span>
                </div>
              </div>

              {/* Order List Header */}
              <div className="flex items-center justify-between pt-1">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Daftar Transaksi ({detailCustomer.orderCount})
                </h4>
                {detailCustomer.cleanPhone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDetailCustomer(null);
                      handleOpenChat(detailCustomer);
                    }}
                    className="text-xs h-7 text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Kirim Pesan WhatsApp
                  </Button>
                )}
              </div>

              {/* Orders Table */}
              {loadingOrders ? (
                <div className="py-12 flex items-center justify-center text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#FF5E01]" />
                  <span>Memuat daftar pesanan...</span>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  Tidak ada riwayat detail pesanan yang ditemukan.
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[500px]">
                    <thead className="bg-gray-100 text-gray-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">Ringkasan Item</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customerOrders.map((ord) => {
                        const statusColors: Record<string, string> = {
                          done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          partial: 'bg-blue-50 text-blue-700 border-blue-200',
                          pending: 'bg-amber-50 text-amber-700 border-amber-200',
                          cancelled: 'bg-red-50 text-red-700 border-red-200',
                        };

                        return (
                          <tr key={ord.orderId} className="hover:bg-gray-50/50">
                            <td className="py-2.5 px-3 font-mono font-medium text-gray-900">
                              {ord.orderId}
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                              {formatDateTime(ord.timestamp)}
                            </td>
                            <td className="py-2.5 px-3 text-gray-700 max-w-xs truncate">
                              {ord.itemsSummary || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <Badge
                                variant="outline"
                                className={`text-[10px] uppercase px-1.5 py-0 ${
                                  statusColors[ord.orderStatus] || 'bg-gray-50 text-gray-600'
                                }`}
                              >
                                {ord.orderStatus}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-gray-900 whitespace-nowrap">
                              {formatCurrencyIDR(ord.total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setDetailCustomer(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: EDIT PELANGGAN */}
      <Dialog open={Boolean(editCustomer)} onOpenChange={(open) => !open && setEditCustomer(null)}>
        <DialogContent className="max-w-md p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Pencil className="w-5 h-5 text-[#FF5E01]" />
              Edit Data Pelanggan
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Perubahan akan langsung diperbarui ke seluruh pesanan terkait di database Supabase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Pelanggan <span className="text-red-500">*</span>
              </label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nama lengkap pelanggan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Contoh: 081234567890"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Nomor akan distandarisasi otomatis saat chat WA atau ekspor ke Google Contacts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Instansi / Organisasi
              </label>
              <Input
                value={editForm.institution}
                onChange={(e) => setEditForm((prev) => ({ ...prev, institution: e.target.value }))}
                placeholder="Contoh: KKN ITERA, Bawaslu, PT XYZ"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alamat / Catatan Pengiriman
              </label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Alamat pelanggan"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditCustomer(null)}
              disabled={isSavingEdit}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className="bg-[#FF5E01] hover:bg-[#e54d00] text-white"
            >
              {isSavingEdit ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan ke Supabase'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: EKSPOR GOOGLE CONTACTS CSV */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileSpreadsheet className="w-5 h-5 text-[#FF5E01]" />
              Ekspor ke Google Contacts (.csv)
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              File CSV ini diformat khusus sesuai template 21 kolom resmi Google Contacts untuk langsung diimpor ke akun Google.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs sm:text-sm">
            {/* Scope Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Target Pelanggan yang Diekspor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setExportScope('all')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    exportScope === 'all'
                      ? 'border-[#FF5E01] bg-orange-50/50 text-[#FF5E01] font-semibold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="text-xs">Semua Pelanggan</p>
                  <p className="text-base font-bold">{customers.length}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setExportScope('filtered')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    exportScope === 'filtered'
                      ? 'border-[#FF5E01] bg-orange-50/50 text-[#FF5E01] font-semibold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="text-xs">Hasil Filter Saat Ini</p>
                  <p className="text-base font-bold">{filteredCustomers.length}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setExportScope('selected')}
                  disabled={selectedIds.size === 0}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    exportScope === 'selected'
                      ? 'border-[#FF5E01] bg-orange-50/50 text-[#FF5E01] font-semibold'
                      : selectedIds.size === 0
                      ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="text-xs">Pelanggan Terpilih</p>
                  <p className="text-base font-bold">{selectedIds.size}</p>
                </button>
              </div>
            </div>

            {/* Export Configuration Options */}
            <div className="bg-gray-50 border rounded-xl p-3.5 space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Pengaturan Format Google Contacts
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Format Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Format Nomor Telepon
                  </label>
                  <select
                    value={exportConfig.phoneFormat}
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        phoneFormat: e.target.value as any,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-md text-xs p-2 bg-white text-gray-800"
                  >
                    <option value="formatted">+62 8xx-xxxx-xxxx (Standar Kontak)</option>
                    <option value="e164">+628xxxxxxxxxx (Internasional E.164)</option>
                    <option value="raw">Sesuai Database (Tanpa Diubah)</option>
                  </select>
                </div>

                {/* Last Name Mode */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Belakang (Last Name)
                  </label>
                  <select
                    value={exportConfig.lastNameMode}
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        lastNameMode: e.target.value as any,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-md text-xs p-2 bg-white text-gray-800"
                  >
                    <option value="institution">Gunakan Instansi (Contoh: Salsa KKN UB)</option>
                    <option value="blank">Kosongkan Nama Belakang</option>
                  </select>
                </div>

                {/* Google Contacts Label */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Label Kontak (Google Contacts)
                  </label>
                  <Input
                    value={exportConfig.label}
                    onChange={(e) =>
                      setExportConfig((prev) => ({ ...prev, label: e.target.value }))
                    }
                    placeholder="Contoh: * myContacts ::: Tidurlah Store"
                    className="text-xs h-8"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Wajib menyertakan <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-700">* myContacts</code> agar kontak muncul di daftar utama HP.
                  </p>
                </div>

                {/* Phone Label */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Label Telepon
                  </label>
                  <select
                    value={exportConfig.phoneLabel}
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        phoneLabel: e.target.value as any,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-md text-xs p-2 bg-white text-gray-800"
                  >
                    <option value="Mobile">Mobile (Ponsel)</option>
                    <option value="Home">Home (Rumah)</option>
                    <option value="Work">Work (Kantor)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-gray-200/60 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={exportConfig.onlyWithPhone}
                    onCheckedChange={(checked) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        onlyWithPhone: Boolean(checked),
                      }))
                    }
                  />
                  <span className="text-xs text-gray-700 font-medium">
                    Hanya ekspor pelanggan yang memiliki nomor telepon
                  </span>
                </label>

                {exportConfig.lastNameMode === 'institution' && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox
                      checked={exportConfig.ignoreGenericInstitution}
                      onCheckedChange={(checked) =>
                        setExportConfig((prev) => ({
                          ...prev,
                          ignoreGenericInstitution: Boolean(checked),
                        }))
                      }
                    />
                    <span className="text-xs text-gray-700 font-medium">
                      Abaikan instansi umum (seperti &quot;Umum&quot; atau &quot;-&quot;) dari nama belakang
                    </span>
                  </label>
                )}

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={exportConfig.includeNotes}
                    onCheckedChange={(checked) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        includeNotes: Boolean(checked),
                      }))
                    }
                  />
                  <span className="text-xs text-gray-700 font-medium">
                    Sertakan ringkasan pesanan & tanggal terakhir di kolom Catatan (Notes)
                  </span>
                </label>
              </div>
            </div>

            {/* Live CSV Preview Box */}
            <div className="border rounded-xl p-3 bg-gray-900 text-gray-100 font-mono text-[11px] overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-gray-400 text-xs">
                <span>Pratinjau Format CSV (3 Baris Pertama):</span>
                <span className="text-[10px] text-gray-500">21 Kolom Standar Google Contacts</span>
              </div>
              <div className="overflow-x-auto pt-2 max-h-32 text-gray-300">
                {csvPreviewRows.length > 0 ? (
                  csvPreviewRows.map((line, idx) => (
                    <div
                      key={idx}
                      className={`whitespace-pre py-0.5 ${
                        idx === 0 ? 'text-orange-400 font-bold' : ''
                      }`}
                    >
                      {line}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">Tidak ada baris yang memenuhi kriteria</div>
                )}
              </div>
            </div>

            {/* Import Guidance */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-blue-800">
                <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Petunjuk Impor ke Google Contacts:</span>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-blue-800/90 pl-1">
                <li>Klik tombol <strong>Unduh CSV Google Contacts</strong> di bawah ini.</li>
                <li>Buka situs <a href="https://contacts.google.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">contacts.google.com</a> di browser Anda.</li>
                <li>Pilih menu <strong>Impor</strong> di panel navigasi sebelah kiri.</li>
                <li>Pilih file CSV yang baru saja diunduh, lalu klik <strong>Impor</strong>.</li>
                <li>Semua nomor pelanggan langsung tersinkronisasi otomatis ke WhatsApp dan buku telepon ponsel Anda.</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setExportModalOpen(false)}>
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteExport}
              disabled={exportTargetCustomers.length === 0}
              className="bg-[#FF5E01] hover:bg-[#e54d00] text-white font-medium"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Unduh CSV ({exportTargetCustomers.length} Kontak)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
