import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  CreditCard,
  ShoppingBag,
  Trash2,
  Edit,
  RefreshCw,
  Loader2,
  TrendingDown,
  Layers,
  Store,
  FileSpreadsheet,
  AlertTriangle,
  Copy,
  Check,
  Database as DatabaseIcon,
  Users,
  UserPlus,
  Send,
  CheckCircle2,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  fetchExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
  formatIDR,
  fetchEmployees,
  saveEmployee,
  deleteEmployee,
  checkMonthPayrollStatus,
  postMonthlyPayrollToExpenses,
  EXPENSE_CATEGORIES,
  EXPENSE_PLATFORMS,
  EXPENSE_PAYMENT_METHODS,
  type ExpenseItem,
  type ExpenseInput,
  type ExpenseCategory,
  type ExpensePlatform,
  type ExpensePaymentMethod,
  type EmployeeItem,
  type EmployeeInput,
} from '@/services/expenses';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Bahan Baku': 'bg-amber-50 text-amber-700 border-amber-200',
  'Gaji Karyawan': 'bg-blue-50 text-blue-700 border-blue-200',
  'Operasional & Listrik': 'bg-purple-50 text-purple-700 border-purple-200',
  'Alat & Maintenance': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Lainnya': 'bg-slate-50 text-slate-700 border-slate-200',
};

const PLATFORM_ICONS: Record<string, string> = {
  'Shopee': 'bg-orange-50 text-orange-700 border-orange-200',
  'Tokopedia': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Toko Offline / Agen': 'bg-slate-100 text-slate-800 border-slate-200',
  'Vendor Langsung': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Lainnya': 'bg-gray-100 text-gray-700 border-gray-200',
};

const EXPENSES_SQL_SCRIPT = `-- Jalankan SQL ini di Supabase Dashboard -> SQL Editor
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  amount numeric(15, 2) not null check (amount >= 0),
  date date not null default current_date,
  payment_method text not null default 'Cash',
  platform text not null default 'Toko Offline / Agen',
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default 'Staff',
  base_salary numeric(15, 2) not null default 0 check (base_salary >= 0),
  payment_method text not null default 'Transfer Bank',
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_expenses_date on public.expenses(date);
create index if not exists idx_expenses_category on public.expenses(category);
create index if not exists idx_expenses_platform on public.expenses(platform);

alter table public.expenses enable row level security;
alter table public.employees enable row level security;

drop policy if exists "Allow all access to expenses" on public.expenses;
create policy "Allow all access to expenses"
  on public.expenses for all
  using (true)
  with check (true);

drop policy if exists "Allow all access to employees" on public.employees;
create policy "Allow all access to employees"
  on public.employees for all
  using (true)
  with check (true);`;

export function ExpensesTab() {
  const { profile } = useAuth();
  const now = new Date();
  const [activeSubView, setActiveSubView] = useState<'expenses' | 'payroll'>('expenses');
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTableMissing, setIsTableMissing] = useState<boolean>(false);
  const [hasCopiedSql, setHasCopiedSql] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  // Employee Payroll Master state
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState<boolean>(false);
  const [monthPayrollStatus, setMonthPayrollStatus] = useState<{
    hasPosted: boolean;
    totalPosted: number;
    count: number;
    items: ExpenseItem[];
  }>({ hasPosted: false, totalPosted: 0, count: 0, items: [] });

  // Employee Form Modal state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(null);
  const [employeeName, setEmployeeName] = useState<string>('');
  const [employeeRole, setEmployeeRole] = useState<string>('');
  const [employeeSalary, setEmployeeSalary] = useState<string>('');
  const [employeeMethod, setEmployeeMethod] = useState<ExpensePaymentMethod>('Transfer Bank');
  const [employeeActive, setEmployeeActive] = useState<boolean>(true);
  const [isSavingEmployee, setIsSavingEmployee] = useState<boolean>(false);

  // Post Payroll Confirmation Modal state
  const [isPayrollPostOpen, setIsPayrollPostOpen] = useState<boolean>(false);
  const [isPostingPayroll, setIsPostingPayroll] = useState<boolean>(false);
  const [payrollPostDate, setPayrollPostDate] = useState<string>(now.toISOString().slice(0, 10));

  // Regular Expense Modal Dialog Form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Bahan Baku');
  const [formPlatform, setFormPlatform] = useState<ExpensePlatform>('Toko Offline / Agen');
  const [formPaymentMethod, setFormPaymentMethod] = useState<ExpensePaymentMethod>('Cash');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(now.toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState<string>('');

  // Delete Expense Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<ExpenseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Delete Employee Confirmation state
  const [deleteEmployeeTarget, setDeleteEmployeeTarget] = useState<EmployeeItem | null>(null);

  useEffect(() => {
    loadExpenses();
    loadEmployees();
    checkPayrollStatus();
  }, [selectedMonth, selectedYear]);

  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const res = await fetchExpenseSummary(selectedMonth, selectedYear);
      if (res.success) {
        setExpenses(res.expenses);
        setIsTableMissing(false);
      } else {
        if (res.isTableMissing) {
          setIsTableMissing(true);
        } else {
          toast.error(res.error || 'Gagal memuat daftar pengeluaran');
        }
      }
    } catch (err: unknown) {
      console.error('[ExpensesTab] Load error:', err);
      toast.error('Terjadi kesalahan saat memuat data pengeluaran');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const res = await fetchEmployees();
      if (res.success) {
        setEmployees(res.data);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const checkPayrollStatus = async () => {
    try {
      const status = await checkMonthPayrollStatus(selectedMonth, selectedYear);
      setMonthPayrollStatus(status);
    } catch {
      /* ignore */
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(EXPENSES_SQL_SCRIPT);
    setHasCopiedSql(true);
    toast.success('SQL Migrasi berhasil disalin ke clipboard');
    setTimeout(() => setHasCopiedSql(false), 3000);
  };

  // Regular Expense Form Handlers
  const handleOpenCreateModal = () => {
    setEditingExpense(null);
    setFormTitle('');
    setFormCategory('Bahan Baku');
    setFormPlatform('Toko Offline / Agen');
    setFormPaymentMethod('Cash');
    setFormAmount('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (item: ExpenseItem) => {
    setEditingExpense(item);
    setFormTitle(item.title);
    setFormCategory(item.category as ExpenseCategory);
    setFormPlatform(item.platform as ExpensePlatform);
    setFormPaymentMethod(item.payment_method as ExpensePaymentMethod);
    setFormAmount(item.amount.toString());
    setFormDate(item.date);
    setFormNotes(item.notes || '');
    setIsFormOpen(true);
  };

  const handleSelectEmployeePreset = (empName: string) => {
    const selected = employees.find(e => e.name === empName);
    if (selected) {
      setFormTitle(`Gaji Karyawan: ${selected.name}`);
      setFormCategory('Gaji Karyawan');
      setFormAmount(selected.base_salary.toString());
      setFormPaymentMethod(selected.payment_method as ExpensePaymentMethod);
      setFormPlatform('Toko Offline / Agen');
      setFormNotes(`Gaji bulanan ${selected.role} (Periode ${selectedMonth}/${selectedYear})`);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = formTitle.trim();
    const parsedAmount = parseFloat(formAmount.replace(/[^0-9]/g, ''));

    if (!cleanTitle) {
      toast.error('Keterangan pengeluaran wajib diisi');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Nominal pengeluaran harus lebih besar dari Rp 0');
      return;
    }
    if (!formDate) {
      toast.error('Tanggal pengeluaran wajib ditentukan');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExpense) {
        const res = await updateExpense(editingExpense.id, {
          title: cleanTitle,
          category: formCategory,
          platform: formPlatform,
          payment_method: formPaymentMethod,
          amount: parsedAmount,
          date: formDate,
          notes: formNotes,
        });

        if (res.success) {
          toast.success('Pengeluaran berhasil diperbarui');
          setIsFormOpen(false);
          loadExpenses();
          checkPayrollStatus();
        } else {
          toast.error(res.error || 'Gagal memperbarui pengeluaran');
        }
      } else {
        const payload: ExpenseInput = {
          title: cleanTitle,
          category: formCategory,
          platform: formPlatform,
          payment_method: formPaymentMethod,
          amount: parsedAmount,
          date: formDate,
          notes: formNotes,
          created_by: profile?.full_name || 'Admin',
        };

        const res = await createExpense(payload);
        if (res.success) {
          toast.success('Pengeluaran berhasil dicatat');
          setIsFormOpen(false);
          loadExpenses();
          checkPayrollStatus();
        } else {
          toast.error(res.error || 'Gagal mencatat pengeluaran');
        }
      }
    } catch {
      toast.error('Terjadi kendala saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteExpense(deleteTarget.id);
      if (res.success) {
        toast.success('Pengeluaran berhasil dihapus');
        setDeleteTarget(null);
        loadExpenses();
        checkPayrollStatus();
      } else {
        toast.error(res.error || 'Gagal menghapus catatan pengeluaran');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus data');
    } finally {
      setIsDeleting(false);
    }
  };

  // Employee Master Handlers
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeName('');
    setEmployeeRole('Staff');
    setEmployeeSalary('');
    setEmployeeMethod('Transfer Bank');
    setEmployeeActive(true);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: EmployeeItem) => {
    setEditingEmployee(emp);
    setEmployeeName(emp.name);
    setEmployeeRole(emp.role);
    setEmployeeSalary(emp.base_salary.toString());
    setEmployeeMethod(emp.payment_method as ExpensePaymentMethod);
    setEmployeeActive(emp.is_active);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = employeeName.trim();
    const cleanRole = employeeRole.trim();
    const parsedSalary = parseFloat(employeeSalary.replace(/[^0-9]/g, ''));

    if (!cleanName) {
      toast.error('Nama karyawan wajib diisi');
      return;
    }
    if (isNaN(parsedSalary) || parsedSalary < 0) {
      toast.error('Nominal gaji tidak valid');
      return;
    }

    setIsSavingEmployee(true);
    try {
      const payload: EmployeeInput = {
        name: cleanName,
        role: cleanRole || 'Staff',
        base_salary: parsedSalary,
        payment_method: employeeMethod,
        is_active: employeeActive,
      };

      const res = await saveEmployee(payload, editingEmployee?.id);
      if (res.success) {
        toast.success(`Data gaji ${cleanName} berhasil disimpan`);
        setIsEmployeeModalOpen(false);
        loadEmployees();
      } else {
        toast.error(res.error || 'Gagal menyimpan data karyawan');
      }
    } catch {
      toast.error('Terjadi kendala saat menyimpan karyawan');
    } finally {
      setIsSavingEmployee(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteEmployeeTarget) return;
    try {
      const res = await deleteEmployee(deleteEmployeeTarget.id);
      if (res.success) {
        toast.success(`Karyawan ${deleteEmployeeTarget.name} berhasil dihapus`);
        setDeleteEmployeeTarget(null);
        loadEmployees();
      } else {
        toast.error('Gagal menghapus karyawan');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus');
    }
  };

  const handlePostPayroll = async () => {
    setIsPostingPayroll(true);
    try {
      const res = await postMonthlyPayrollToExpenses(
        selectedMonth,
        selectedYear,
        employees,
        payrollPostDate,
        profile?.full_name || 'Admin'
      );

      if (res.success) {
        toast.success(
          `Gaji ${res.count} karyawan berhasil dicatat ke pengeluaran (Total: ${formatIDR(res.total)})`
        );
        setIsPayrollPostOpen(false);
        loadExpenses();
        checkPayrollStatus();
      } else {
        toast.error(res.error || 'Gagal mencatat penggajian');
      }
    } catch {
      toast.error('Terjadi kendala saat memproses penggajian');
    } finally {
      setIsPostingPayroll(false);
    }
  };

  // Calculations for summary metrics
  const totalAmount = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const highestExpense = useMemo(() => {
    if (expenses.length === 0) return null;
    return [...expenses].sort((a, b) => b.amount - a.amount)[0];
  }, [expenses]);

  const topCategory = useMemo(() => {
    if (expenses.length === 0) return null;
    const catTotals: Record<string, number> = {};
    expenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], total: sorted[0][1] } : null;
  }, [expenses]);

  const topPlatform = useMemo(() => {
    if (expenses.length === 0) return null;
    const platCounts: Record<string, number> = {};
    expenses.forEach(e => {
      platCounts[e.platform] = (platCounts[e.platform] || 0) + 1;
    });
    const sorted = Object.entries(platCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, [expenses]);

  const totalMonthlyPayroll = useMemo(() => {
    return employees
      .filter(e => e.is_active)
      .reduce((acc, curr) => acc + curr.base_salary, 0);
  }, [employees]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(item => {
      const matchSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        filterCategory === 'all' || item.category === filterCategory;

      const matchPlatform =
        filterPlatform === 'all' || item.platform === filterPlatform;

      return matchSearch && matchCategory && matchPlatform;
    });
  }, [expenses, searchQuery, filterCategory, filterPlatform]);

  return (
    <div className="space-y-5">
      {/* Missing Table Setup Alert Banner */}
      {isTableMissing && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm text-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                <DatabaseIcon className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-sm">
                  Tabel Database "expenses" & "employees" Belum Dibuat di Supabase
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-2xl">
                  Fitur pencatatan pengeluaran & gaji karyawan memerlukan tabel baru di Supabase. Salin script SQL di bawah ini dan jalankan pada menu{' '}
                  <strong className="text-gray-900 font-semibold">SQL Editor</strong> di dashboard Supabase Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopySql}
                className="h-8 text-xs bg-white border-amber-300 hover:bg-amber-100/50 text-amber-900"
              >
                {hasCopiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Salin SQL Migrasi
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  loadExpenses();
                  loadEmployees();
                }}
                className="h-8 text-xs bg-[#FF5E01] hover:bg-[#e54d00] text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Cek Ulang
              </Button>
            </div>
          </div>

          <div className="mt-3 relative">
            <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-36">
              {EXPENSES_SQL_SCRIPT}
            </pre>
          </div>
        </div>
      )}

      {/* Header & Sub-View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Sub-view Navigation Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border text-xs shadow-inner">
            <button
              onClick={() => setActiveSubView('expenses')}
              className={cn(
                'px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5',
                activeSubView === 'expenses'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <Receipt className="w-3.5 h-3.5 text-[#FF5E01]" />
              Catatan Pengeluaran
            </button>
            <button
              onClick={() => setActiveSubView('payroll')}
              className={cn(
                'px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5',
                activeSubView === 'payroll'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Gaji Karyawan & Payroll
              <Badge variant="secondary" className="ml-1 text-[10px] font-mono px-1.5 py-0 h-4">
                {formatIDR(totalMonthlyPayroll)}
              </Badge>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Month / Year Selector */}
          <div className="flex items-center gap-1.5 bg-white border rounded-lg px-2.5 py-1.5 shadow-sm text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <span className="text-gray-300">/</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadExpenses();
              loadEmployees();
              checkPayrollStatus();
            }}
            disabled={isLoading || isLoadingEmployees}
            className="h-8 px-2.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isLoadingEmployees ? 'animate-spin' : ''}`} />
          </Button>

          {activeSubView === 'expenses' ? (
            <Button
              size="sm"
              onClick={handleOpenCreateModal}
              className="h-8 bg-[#FF5E01] hover:bg-[#e54d00] text-white shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Catat Pengeluaran
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleOpenAddEmployee}
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              Tambah Karyawan
            </Button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-VIEW 1: CATATAN PENGELUARAN                         */}
      {/* ======================================================== */}
      {activeSubView === 'expenses' && (
        <>
          {/* Quick Payroll Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>Penggajian Bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}:</span>
                  {monthPayrollStatus.hasPosted ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                      Sudah Dicatat ({formatIDR(monthPayrollStatus.totalPosted)})
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                      Belum Dicatat ({formatIDR(totalMonthlyPayroll)})
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Gaji tetap Stevan, Windy, Zayn, Freelance Desain & tim dapat langsung diposting tanpa ketik ulang.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveSubView('payroll')}
                className="h-7 text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-100/50"
              >
                Kelola Daftar Gaji
              </Button>
              {!monthPayrollStatus.hasPosted && totalMonthlyPayroll > 0 && (
                <Button
                  size="sm"
                  onClick={() => setIsPayrollPostOpen(true)}
                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Hitung Gaji Bulan Ini
                </Button>
              )}
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Total Expenses */}
            <Card className="border-rose-100 bg-gradient-to-br from-rose-50/50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-rose-600">Total Pengeluaran</span>
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                    <TrendingDown className="w-3 h-3 text-rose-600" />
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">{formatIDR(totalAmount)}</div>
                <p className="text-[10px] text-gray-400 mt-1">{expenses.length} catatan pengeluaran</p>
              </CardContent>
            </Card>

            {/* Highest Expense */}
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">Pengeluaran Terbesar</span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <CreditCard className="w-3 h-3 text-slate-600" />
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {highestExpense ? formatIDR(highestExpense.amount) : 'Rp 0'}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 truncate">
                  {highestExpense ? highestExpense.title : 'Belum ada data'}
                </p>
              </CardContent>
            </Card>

            {/* Top Category */}
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">Kategori Tertinggi</span>
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <Layers className="w-3 h-3 text-amber-600" />
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {topCategory ? formatIDR(topCategory.total) : 'Rp 0'}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 truncate">
                  {topCategory ? topCategory.name : 'Belum ada data'}
                </p>
              </CardContent>
            </Card>

            {/* Top Platform */}
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">Platform Terbanyak</span>
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Store className="w-3 h-3 text-indigo-600" />
                  </div>
                </div>
                <div className="text-base font-bold text-gray-900 truncate">
                  {topPlatform ? topPlatform.name : '-'}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {topPlatform ? `${topPlatform.count} kali transaksi` : 'Belum ada data'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar & Data Table */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="p-4 border-b bg-slate-50/50">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Cari keterangan atau catatan..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Category Filter */}
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="h-8 text-xs bg-white w-[160px]">
                      <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent className="z-[100050]">
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Platform Filter */}
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="h-8 text-xs bg-white w-[160px]">
                      <SelectValue placeholder="Semua Platform" />
                    </SelectTrigger>
                    <SelectContent className="z-[100050]">
                      <SelectItem value="all">Semua Platform</SelectItem>
                      {EXPENSE_PLATFORMS.map(plat => (
                        <SelectItem key={plat} value={plat}>
                          {plat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF5E01] mb-2" />
                  <span className="text-xs">Memuat data pengeluaran...</span>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Belum ada catatan pengeluaran</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">
                    {searchQuery || filterCategory !== 'all' || filterPlatform !== 'all'
                      ? 'Tidak ada pengeluaran yang sesuai dengan filter pencarian.'
                      : 'Catat belanja bahan baku, operasional, atau gaji karyawan dengan menekan tombol Catat Pengeluaran.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[110px] text-xs">Tanggal</TableHead>
                        <TableHead className="text-xs">Keterangan Transaksi</TableHead>
                        <TableHead className="text-xs">Kategori</TableHead>
                        <TableHead className="text-xs">Tempat Belanja</TableHead>
                        <TableHead className="text-xs">Metode</TableHead>
                        <TableHead className="text-xs text-right">Nominal</TableHead>
                        <TableHead className="w-[80px] text-xs text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map(item => (
                        <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <TableCell className="text-xs font-medium text-gray-600 whitespace-nowrap">
                            {item.date}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="font-semibold text-gray-900">{item.title}</div>
                            {item.notes && (
                              <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                                {item.notes}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-medium border ${CATEGORY_COLORS[item.category] || 'bg-gray-50 text-gray-700'}`}
                            >
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-medium border ${PLATFORM_ICONS[item.platform] || 'bg-gray-50 text-gray-700'}`}
                            >
                              {item.platform}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 font-mono text-[11px]">
                            {item.payment_method}
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold text-gray-900 font-mono">
                            {formatIDR(item.amount)}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEditModal(item)}
                                className="h-7 w-7 text-gray-500 hover:text-blue-600"
                                title="Edit Pengeluaran"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget(item)}
                                className="h-7 w-7 text-gray-500 hover:text-red-600"
                                title="Hapus Pengeluaran"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2: DAFTAR KARYAWAN & PAYROLL (PERSISTENT UI)    */}
      {/* ======================================================== */}
      {activeSubView === 'payroll' && (
        <div className="space-y-4">
          {/* Payroll Banner & Quick Posting */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Total Monthly Payroll */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50/70 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-blue-700">Total Beban Gaji Bulanan</span>
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 font-mono">{formatIDR(totalMonthlyPayroll)}</div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Akumulasi {employees.filter(e => e.is_active).length} karyawan & tim aktif
                </p>
              </CardContent>
            </Card>

            {/* Posting Status Card */}
            <Card className="border-slate-200 bg-white md:col-span-2">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">
                      Status Periode: {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                    </span>
                    {monthPayrollStatus.hasPosted ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                        Sudah Diposting
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
                        Belum Dicatat
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {monthPayrollStatus.hasPosted
                      ? `Telah tercatat ${monthPayrollStatus.count} transaksi gaji sebesar ${formatIDR(monthPayrollStatus.totalPosted)} di pembukuan bulan ini.`
                      : `Tekan tombol di samping untuk mencatat beban gaji seluruh karyawan aktif ke pengeluaran bulan ini secara otomatis.`}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    onClick={() => setIsPayrollPostOpen(true)}
                    disabled={totalMonthlyPayroll === 0}
                    className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm w-full sm:w-auto"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {monthPayrollStatus.hasPosted ? 'Posting Ulang / Tambah Gaji' : 'Posting Gaji Bulan Ini'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Persistent Employees Table */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="p-4 border-b bg-slate-50/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-gray-900">Daftar Karyawan & Nominal Gaji</CardTitle>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Nominal disimpan secara persisten. Anda tidak perlu mengetik ulang setiap bulan.
                </p>
              </div>

              <Button
                size="sm"
                onClick={handleOpenAddEmployee}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Tambah Karyawan
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {isLoadingEmployees ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                  <span className="text-xs">Memuat daftar karyawan...</span>
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Belum ada data karyawan. Tekan tombol Tambah Karyawan di atas.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-xs">Nama Karyawan</TableHead>
                        <TableHead className="text-xs">Jabatan / Peran</TableHead>
                        <TableHead className="text-xs">Metode Pembayaran</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs text-right">Gaji Bulanan (Rp)</TableHead>
                        <TableHead className="w-[80px] text-xs text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map(emp => (
                        <TableRow key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                          <TableCell className="text-xs font-bold text-gray-900">
                            {emp.name}
                          </TableCell>
                          <TableCell className="text-xs text-gray-600">
                            {emp.role}
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 font-mono text-[11px]">
                            {emp.payment_method}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] font-medium border',
                                emp.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              )}
                            >
                              {emp.is_active ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold text-gray-900 font-mono">
                            {formatIDR(emp.base_salary)}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEditEmployee(emp)}
                                className="h-7 w-7 text-gray-500 hover:text-blue-600"
                                title="Edit Gaji Karyawan"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteEmployeeTarget(emp)}
                                className="h-7 w-7 text-gray-500 hover:text-red-600"
                                title="Hapus Karyawan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: POST MONTHLY PAYROLL CONFIRMATION                 */}
      {/* ======================================================== */}
      <Dialog open={isPayrollPostOpen} onOpenChange={setIsPayrollPostOpen}>
        <DialogContent className="sm:max-w-md z-[100050]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">
              Posting Gaji Bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Sistem akan mencatat pengeluaran gaji untuk seluruh karyawan aktif secara otomatis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Tanggal Pencatatan Pengeluaran</label>
              <Input
                type="date"
                value={payrollPostDate}
                onChange={e => setPayrollPostDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="border rounded-lg p-3 bg-slate-50 space-y-2">
              <span className="font-semibold text-gray-700 text-[11px] uppercase tracking-wider block">
                Rincian Karyawan yang Akan Dicatat:
              </span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {employees
                  .filter(e => e.is_active && e.base_salary > 0)
                  .map(e => (
                    <div key={e.id} className="flex items-center justify-between py-1 border-b last:border-0 border-slate-200">
                      <div>
                        <span className="font-bold text-gray-900">{e.name}</span>
                        <span className="text-[10px] text-gray-400 ml-1.5">({e.role})</span>
                      </div>
                      <span className="font-mono font-semibold text-gray-900">{formatIDR(e.base_salary)}</span>
                    </div>
                  ))}
              </div>
              <div className="pt-2 border-t border-slate-300 flex items-center justify-between font-bold text-gray-900">
                <span>Total Beban Gaji:</span>
                <span className="font-mono text-blue-700">{formatIDR(totalMonthlyPayroll)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPayrollPostOpen(false)}
              disabled={isPostingPayroll}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePostPayroll}
              disabled={isPostingPayroll || totalMonthlyPayroll === 0}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPostingPayroll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  Mencatat Penggajian...
                </>
              ) : (
                'Konfirmasi & Posting Gaji'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT EMPLOYEE PERSISTENT                    */}
      {/* ======================================================== */}
      <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
        <DialogContent className="sm:max-w-md z-[100050]">
          <form onSubmit={handleSaveEmployee}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                {editingEmployee ? 'Edit Data Gaji Karyawan' : 'Tambah Karyawan Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Data gaji disimpan secara persisten dan akan digunakan untuk penggajian bulanan.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Nama Karyawan / Posisi</label>
                <Input
                  placeholder="Contoh: Stevan / Windy / Freelance Desain"
                  value={employeeName}
                  onChange={e => setEmployeeName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Jabatan / Peran</label>
                <Input
                  placeholder="Contoh: Staff Operasional / Kasir / Desainer"
                  value={employeeRole}
                  onChange={e => setEmployeeRole(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Gaji Standar Bulanan (Rp)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Contoh: 3000000"
                    value={employeeSalary}
                    onChange={e => setEmployeeSalary(e.target.value)}
                    className="h-9 text-xs font-mono font-semibold"
                    required
                  />
                  {employeeSalary && !isNaN(Number(employeeSalary)) && (
                    <div className="text-[10px] text-gray-400 font-mono">
                      {formatIDR(Number(employeeSalary))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Metode Bayar</label>
                  <Select
                    value={employeeMethod}
                    onValueChange={(val: ExpensePaymentMethod) => setEmployeeMethod(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Metode" />
                    </SelectTrigger>
                    <SelectContent className="z-[100050]">
                      {EXPENSE_PAYMENT_METHODS.map(m => (
                        <SelectItem key={m} value={m} className="text-xs">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="employeeActive"
                  checked={employeeActive}
                  onChange={e => setEmployeeActive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="employeeActive" className="text-xs text-gray-700 cursor-pointer">
                  Karyawan aktif (diikutsertakan dalam penggajian bulanan)
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEmployeeModalOpen(false)}
                disabled={isSavingEmployee}
                className="h-8 text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingEmployee}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSavingEmployee ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Karyawan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: DELETE EMPLOYEE CONFIRMATION                      */}
      {/* ======================================================== */}
      <Dialog
        open={!!deleteEmployeeTarget}
        onOpenChange={open => !open && setDeleteEmployeeTarget(null)}
      >
        <DialogContent className="sm:max-w-sm z-[100050]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-gray-900">
              Hapus Data Karyawan
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Apakah Anda yakin ingin menghapus data karyawan{' '}
              <strong className="text-gray-900 font-semibold">{deleteEmployeeTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteEmployeeTarget(null)}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteEmployee}
              className="h-8 text-xs"
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT EXPENSE                             */}
      {/* ======================================================== */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md z-[100050]">
          <form onSubmit={handleSubmitForm}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                {editingExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Isi rincian pengeluaran operasional atau pembelian bahan baku untuk pembukuan.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-4 text-xs">
              {/* Tanggal */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Tanggal Pengeluaran</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              {/* Kategori */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Kategori</label>
                  <Select
                    value={formCategory}
                    onValueChange={(val: ExpenseCategory) => {
                      setFormCategory(val);
                      if (val === 'Gaji Karyawan' && !formTitle.startsWith('Gaji')) {
                        setFormTitle('Gaji Karyawan');
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="z-[100050]">
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-xs">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tempat Belanja */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Tempat Belanja / Checkout</label>
                  <Select
                    value={formPlatform}
                    onValueChange={(val: ExpensePlatform) => setFormPlatform(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Pilih Tempat" />
                    </SelectTrigger>
                    <SelectContent className="z-[100050]">
                      {EXPENSE_PLATFORMS.map(plat => (
                        <SelectItem key={plat} value={plat} className="text-xs">
                          {plat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Employee Preset when Category is Gaji Karyawan */}
              {formCategory === 'Gaji Karyawan' && employees.length > 0 && (
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                  <span className="font-semibold text-blue-900 text-[11px] block">
                    Pilih Cepat dari Master Karyawan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {employees.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelectEmployeePreset(emp.name)}
                        className="px-2 py-1 rounded bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-medium transition-colors"
                      >
                        {emp.name} ({formatIDR(emp.base_salary)})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Judul / Keterangan */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Keterangan / Nama Belanja</label>
                <Input
                  placeholder="Contoh: Belanja Kertas PVC 500 Lembar / Gaji Stevan"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              {/* Nominal & Metode Pembayaran */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Nominal (Rp)</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Contoh: 350000"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    className="h-9 text-xs font-mono font-semibold"
                    required
                  />
                  {formAmount && !isNaN(Number(formAmount)) && (
                    <div className="text-[10px] text-gray-400 font-mono">
                      {formatIDR(Number(formAmount))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Metode Pembayaran</label>
                  <Select
                    value={formPaymentMethod}
                    onValueChange={(val: ExpensePaymentMethod) => setFormPaymentMethod(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Pilih Metode" />
                    </SelectTrigger>
                    <SelectContent className="z-[100050]">
                      {EXPENSE_PAYMENT_METHODS.map(met => (
                        <SelectItem key={met} value={met} className="text-xs">
                          {met}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Catatan Opsional */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">
                  Catatan Tambahan <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <Textarea
                  placeholder="Detail nama toko, nomor resi pengiriman, atau catatan penting lainnya..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="text-xs min-h-[60px] resize-none"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
                className="h-8 text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8 text-xs bg-[#FF5E01] hover:bg-[#e54d00] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    Menyimpan...
                  </>
                ) : editingExpense ? (
                  'Simpan Perubahan'
                ) : (
                  'Tambah Pengeluaran'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: DELETE EXPENSE CONFIRMATION                       */}
      {/* ======================================================== */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm z-[100050]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-gray-900">
              Hapus Catatan Pengeluaran
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Apakah Anda yakin ingin menghapus catatan pengeluaran{' '}
              <strong className="text-gray-900 font-semibold">{deleteTarget?.title}</strong> sebesar{' '}
              <strong className="text-gray-900 font-semibold font-mono">
                {deleteTarget ? formatIDR(deleteTarget.amount) : ''}
              </strong>
              ? Data yang dihapus tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-8 text-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
