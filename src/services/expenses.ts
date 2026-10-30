import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export const EXPENSE_CATEGORIES = [
  'Bahan Baku',
  'Gaji Karyawan',
  'Operasional & Listrik',
  'Alat & Maintenance',
  'Lainnya',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const EXPENSE_PLATFORMS = [
  'Toko Offline / Agen',
  'Shopee',
  'Tokopedia',
  'Vendor Langsung',
  'Lainnya',
] as const;

export type ExpensePlatform = typeof EXPENSE_PLATFORMS[number];

export const EXPENSE_PAYMENT_METHODS = [
  'Cash',
  'Transfer Bank',
  'QRIS',
  'ShopeePay',
  'DANA',
  'OVO',
  'GoPay',
  'Lainnya',
] as const;

export type ExpensePaymentMethod = typeof EXPENSE_PAYMENT_METHODS[number];

export interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  payment_method: string;
  platform: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ExpenseInput {
  title: string;
  category: string;
  amount: number;
  date: string;
  payment_method: string;
  platform: string;
  notes?: string | null;
  created_by?: string | null;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  total: number;
  percentage: number;
}

export interface PlatformBreakdown {
  platform: string;
  count: number;
  total: number;
  percentage: number;
}

export interface MonthlyExpenseSummary {
  totalAmount: number;
  totalCount: number;
  avgPerExpense: number;
  highestExpense: ExpenseItem | null;
  byCategory: CategoryBreakdown[];
  byPlatform: PlatformBreakdown[];
  dailyExpenses: Record<number, number>;
}

type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

/**
 * Format string number to IDR representation.
 */
export const formatIDR = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;

/**
 * Safely parse any error object (especially Supabase PostgrestError) into a readable string.
 */
export function extractErrorMessage(err: unknown): string {
  if (!err) return 'Terjadi kesalahan sistem';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string') {
      if (obj.code === '42P01' || obj.message.includes('relation "public.expenses" does not exist')) {
        return 'Tabel "expenses" belum dibuat di Supabase. Silakan jalankan script migrasi SQL 009_expenses.sql.';
      }
      return obj.message;
    }
    if (typeof obj.error_description === 'string') return obj.error_description;
    if (typeof obj.details === 'string') return obj.details;
    if (typeof obj.hint === 'string') return obj.hint;
    try {
      return JSON.stringify(err);
    } catch {
      return 'Terjadi kendala koneksi atau query ke database Supabase.';
    }
  }
  return String(err);
}

/**
 * Check if the error is specifically because the expenses table has not been created yet in Supabase.
 */
export function isMissingExpensesTableError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (obj.code === '42P01') return true;
    if (typeof obj.message === 'string' && obj.message.includes('public.expenses')) return true;
  }
  if (typeof err === 'string' && (err.includes('42P01') || err.includes('public.expenses'))) return true;
  return false;
}

/**
 * Fetch expenses for a given month and year.
 * If month/year omitted, fetches recent expenses (limit 200).
 */
export async function fetchExpenses(
  month?: number,
  year?: number
): Promise<{ success: boolean; data: ExpenseItem[]; isTableMissing?: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, data: [], error: 'Supabase tidak terhubung' };
  }

  try {
    let query = supabase
      .from('expenses')
      .select('*')
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (month && year) {
      const padMonth = String(month).padStart(2, '0');
      const startDate = `${year}-${padMonth}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${padMonth}-${String(lastDay).padStart(2, '0')}`;

      query = query.gte('date', startDate).lte('date', endDate);
    } else {
      query = query.limit(200);
    }

    const { data, error } = await query;
    if (error) {
      if (isMissingExpensesTableError(error)) {
        return {
          success: false,
          data: [],
          isTableMissing: true,
          error: 'Tabel "expenses" belum dibuat di Supabase. Silakan jalankan script SQL migrasi.',
        };
      }
      throw error;
    }

    const items: ExpenseItem[] = (data || []).map(row => ({
      ...row,
      amount: Number(row.amount) || 0,
      payment_method: row.payment_method || 'Cash',
      platform: row.platform || 'Toko Offline / Agen',
    }));

    return { success: true, data: items };
  } catch (err: unknown) {
    const message = extractErrorMessage(err);
    console.error('[Expenses] Fetch failed:', message);
    return {
      success: false,
      data: [],
      isTableMissing: isMissingExpensesTableError(err),
      error: message,
    };
  }
}

/**
 * Fetch monthly summary with categories, platforms, and daily map.
 */
export async function fetchExpenseSummary(
  month: number,
  year: number
): Promise<{
  success: boolean;
  summary: MonthlyExpenseSummary;
  expenses: ExpenseItem[];
  isTableMissing?: boolean;
  error?: string;
}> {
  const defaultSummary: MonthlyExpenseSummary = {
    totalAmount: 0,
    totalCount: 0,
    avgPerExpense: 0,
    highestExpense: null,
    byCategory: [],
    byPlatform: [],
    dailyExpenses: {},
  };

  const res = await fetchExpenses(month, year);
  if (!res.success) {
    return {
      success: false,
      summary: defaultSummary,
      expenses: [],
      isTableMissing: res.isTableMissing,
      error: res.error,
    };
  }

  const items = res.data;
  let totalAmount = 0;
  let highestExpense: ExpenseItem | null = null;
  const categoryMap: Record<string, { count: number; total: number }> = {};
  const platformMap: Record<string, { count: number; total: number }> = {};
  const dailyExpenses: Record<number, number> = {};

  items.forEach(item => {
    totalAmount += item.amount;

    if (!highestExpense || item.amount > highestExpense.amount) {
      highestExpense = item;
    }

    // Category
    const cat = item.category || 'Lainnya';
    if (!categoryMap[cat]) categoryMap[cat] = { count: 0, total: 0 };
    categoryMap[cat].count += 1;
    categoryMap[cat].total += item.amount;

    // Platform
    const plat = item.platform || 'Toko Offline / Agen';
    if (!platformMap[plat]) platformMap[plat] = { count: 0, total: 0 };
    platformMap[plat].count += 1;
    platformMap[plat].total += item.amount;

    // Daily
    const day = parseInt(item.date.split('-')[2], 10);
    if (!isNaN(day)) {
      dailyExpenses[day] = (dailyExpenses[day] || 0) + item.amount;
    }
  });

  const totalCount = items.length;
  const avgPerExpense = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  const byCategory: CategoryBreakdown[] = Object.entries(categoryMap)
    .map(([category, val]) => ({
      category,
      count: val.count,
      total: val.total,
      percentage: totalAmount > 0 ? Math.round((val.total / totalAmount) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const byPlatform: PlatformBreakdown[] = Object.entries(platformMap)
    .map(([platform, val]) => ({
      platform,
      count: val.count,
      total: val.total,
      percentage: totalAmount > 0 ? Math.round((val.total / totalAmount) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    success: true,
    expenses: items,
    summary: {
      totalAmount,
      totalCount,
      avgPerExpense,
      highestExpense,
      byCategory,
      byPlatform,
      dailyExpenses,
    },
  };
}

/**
 * Fetch daily expenses map for the dashboard chart.
 */
export async function fetchDailyExpenses(
  month: number,
  year: number
): Promise<Record<number, number>> {
  const result = await fetchExpenseSummary(month, year);
  if (!result.success) return {};
  return result.summary.dailyExpenses;
}

/**
 * Insert new expense record into Supabase.
 */
export async function createExpense(
  input: ExpenseInput
): Promise<{ success: boolean; data?: ExpenseItem; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase tidak terhubung' };
  }

  try {
    const insertPayload: ExpenseInsert = {
      title: input.title.trim(),
      category: input.category,
      amount: input.amount,
      date: input.date,
      payment_method: input.payment_method,
      platform: input.platform,
      notes: input.notes?.trim() || null,
      created_by: input.created_by || 'Admin',
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        ...data,
        amount: Number(data.amount) || 0,
      },
    };
  } catch (err: unknown) {
    const message = extractErrorMessage(err);
    console.error('[Expenses] Create failed:', message);
    return { success: false, error: message };
  }
}

/**
 * Update an existing expense record.
 */
export async function updateExpense(
  id: string,
  input: Partial<ExpenseInput>
): Promise<{ success: boolean; data?: ExpenseItem; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase tidak terhubung' };
  }

  try {
    const updatePayload: ExpenseUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updatePayload.title = input.title.trim();
    if (input.category !== undefined) updatePayload.category = input.category;
    if (input.amount !== undefined) updatePayload.amount = input.amount;
    if (input.date !== undefined) updatePayload.date = input.date;
    if (input.payment_method !== undefined) updatePayload.payment_method = input.payment_method;
    if (input.platform !== undefined) updatePayload.platform = input.platform;
    if (input.notes !== undefined) updatePayload.notes = input.notes?.trim() || null;

    const { data, error } = await supabase
      .from('expenses')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        ...data,
        amount: Number(data.amount) || 0,
      },
    };
  } catch (err: unknown) {
    const message = extractErrorMessage(err);
    console.error('[Expenses] Update failed:', message);
    return { success: false, error: message };
  }
}

/**
 * Soft delete or hard delete an expense record.
 */
export async function deleteExpense(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase tidak terhubung' };
  }

  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (err: unknown) {
    const message = extractErrorMessage(err);
    console.error('[Expenses] Delete failed:', message);
    return { success: false, error: message };
  }
}

// ============================================================
// EMPLOYEE & PAYROLL MASTER PERSISTENCE
// ============================================================

export interface EmployeeItem {
  id: string;
  name: string;
  role: string;
  base_salary: number;
  payment_method: string;
  is_active: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeInput {
  name: string;
  role: string;
  base_salary: number;
  payment_method: string;
  is_active?: boolean;
  notes?: string | null;
}

const LOCAL_STORAGE_EMPLOYEES_KEY = 'tidurlah_payroll_employees';

export const DEFAULT_EMPLOYEES: EmployeeItem[] = [
  { id: 'emp-1', name: 'Stevan', role: 'Staff Operasional / Admin', base_salary: 3000000, payment_method: 'Transfer Bank', is_active: true },
  { id: 'emp-2', name: 'Windy', role: 'Kasir & Front Office', base_salary: 2500000, payment_method: 'Transfer Bank', is_active: true },
  { id: 'emp-3', name: 'Zayn', role: 'Supervisor Percetakan', base_salary: 3500000, payment_method: 'Transfer Bank', is_active: true },
  { id: 'emp-4', name: 'Freelance Desain', role: 'Desainer Grafis', base_salary: 1500000, payment_method: 'Transfer Bank', is_active: true },
];

function getLocalEmployees(): EmployeeItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EMPLOYEES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_EMPLOYEES_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EMPLOYEES;
  } catch {
    return DEFAULT_EMPLOYEES;
  }
}

function setLocalEmployees(list: EmployeeItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_EMPLOYEES_KEY, JSON.stringify(list));
  } catch {
    /* quota ignore */
  }
}

/**
 * Fetch list of employees (from Supabase with LocalStorage fallback)
 */
export async function fetchEmployees(): Promise<{
  success: boolean;
  data: EmployeeItem[];
  isSupabase: boolean;
  error?: string;
}> {
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const items: EmployeeItem[] = data.map(row => ({
          ...row,
          base_salary: Number(row.base_salary) || 0,
          is_active: Boolean(row.is_active),
        }));
        setLocalEmployees(items);
        return { success: true, data: items, isSupabase: true };
      }
    } catch {
      // Fallback to local storage
    }
  }

  // Local storage fallback
  const localList = getLocalEmployees();
  return { success: true, data: localList, isSupabase: false };
}

/**
 * Add or update an employee in persistent storage
 */
export async function saveEmployee(
  input: EmployeeInput,
  id?: string
): Promise<{ success: boolean; data?: EmployeeItem; error?: string }> {
  const localList = getLocalEmployees();
  let savedItem: EmployeeItem;

  if (id) {
    const existingIndex = localList.findIndex(e => e.id === id);
    savedItem = {
      id,
      name: input.name.trim(),
      role: input.role.trim(),
      base_salary: input.base_salary,
      payment_method: input.payment_method,
      is_active: input.is_active !== undefined ? input.is_active : true,
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (existingIndex >= 0) {
      localList[existingIndex] = savedItem;
    } else {
      localList.push(savedItem);
    }
  } else {
    savedItem = {
      id: 'emp-' + Date.now(),
      name: input.name.trim(),
      role: input.role.trim(),
      base_salary: input.base_salary,
      payment_method: input.payment_method,
      is_active: input.is_active !== undefined ? input.is_active : true,
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localList.push(savedItem);
  }

  setLocalEmployees(localList);

  // Sync to Supabase if available
  if (supabase && isSupabaseConfigured()) {
    try {
      if (id && !id.startsWith('emp-')) {
        await supabase
          .from('employees')
          .update({
            name: input.name.trim(),
            role: input.role.trim(),
            base_salary: input.base_salary,
            payment_method: input.payment_method,
            is_active: input.is_active !== undefined ? input.is_active : true,
            notes: input.notes?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } else {
        const { data } = await supabase
          .from('employees')
          .insert({
            name: input.name.trim(),
            role: input.role.trim(),
            base_salary: input.base_salary,
            payment_method: input.payment_method,
            is_active: input.is_active !== undefined ? input.is_active : true,
            notes: input.notes?.trim() || null,
          })
          .select()
          .single();

        if (data) {
          savedItem.id = data.id;
          const idx = localList.findIndex(e => e.id === savedItem.id || e.id === id);
          if (idx >= 0) localList[idx] = savedItem;
          setLocalEmployees(localList);
        }
      }
    } catch {
      // Ignored; local persistence succeeded
    }
  }

  return { success: true, data: savedItem };
}

/**
 * Delete an employee from persistent storage
 */
export async function deleteEmployee(id: string): Promise<{ success: boolean; error?: string }> {
  const localList = getLocalEmployees().filter(e => e.id !== id);
  setLocalEmployees(localList);

  if (supabase && isSupabaseConfigured() && !id.startsWith('emp-')) {
    try {
      await supabase.from('employees').delete().eq('id', id);
    } catch {
      // ignore
    }
  }

  return { success: true };
}

/**
 * Check if the current month already has salary posted to Expenses.
 */
export async function checkMonthPayrollStatus(
  month: number,
  year: number
): Promise<{ hasPosted: boolean; totalPosted: number; count: number; items: ExpenseItem[] }> {
  const res = await fetchExpenses(month, year);
  if (!res.success) return { hasPosted: false, totalPosted: 0, count: 0, items: [] };

  const salaryExpenses = res.data.filter(
    e => e.category === 'Gaji Karyawan' || e.title.toLowerCase().startsWith('gaji')
  );

  const totalPosted = salaryExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  return {
    hasPosted: salaryExpenses.length > 0,
    totalPosted,
    count: salaryExpenses.length,
    items: salaryExpenses,
  };
}

/**
 * Post monthly payroll to Expenses in one click.
 * Generates expense items for each active employee without having to retype.
 */
export async function postMonthlyPayrollToExpenses(
  month: number,
  year: number,
  employees: EmployeeItem[],
  date: string,
  createdBy: string
): Promise<{ success: boolean; count: number; total: number; error?: string }> {
  const activeEmployees = employees.filter(e => e.is_active && e.base_salary > 0);
  if (activeEmployees.length === 0) {
    return { success: false, count: 0, total: 0, error: 'Tidak ada karyawan aktif dengan nominal gaji > Rp 0' };
  }

  let totalAdded = 0;
  let countAdded = 0;

  for (const emp of activeEmployees) {
    const payload: ExpenseInput = {
      title: `Gaji Karyawan: ${emp.name}`,
      category: 'Gaji Karyawan',
      amount: emp.base_salary,
      date,
      payment_method: emp.payment_method || 'Transfer Bank',
      platform: 'Toko Offline / Agen',
      notes: `Gaji bulanan ${emp.role} (Periode ${month}/${year})`,
      created_by: createdBy,
    };

    const res = await createExpense(payload);
    if (res.success) {
      countAdded++;
      totalAdded += emp.base_salary;
    }
  }

  return { success: countAdded > 0, count: countAdded, total: totalAdded };
}
