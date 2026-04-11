import { POS_GOOGLE_SHEETS_URL } from '@/constants';
import { isSupabaseConfigured } from '@/lib/supabase';
import { fetchDashboardDataSupabase, fetchMonthlyReportSupabase } from '@/services/admin';
import { updateOrderStatusSupabase, softDeleteOrder, restoreOrderSupabase, assignDesignerSupabase } from '@/services/orders';

// ============================================================
// DASHBOARD API — Fetch analytics from Google Sheets
// ============================================================

export interface KPISummary {
    orders: number;
    revenue: number;
}

export interface DashboardData {
    success: boolean;
    today: KPISummary;
    thisWeek: KPISummary;
    thisMonth: KPISummary;
    allTime: KPISummary;
    error?: string;
}

export interface DailyBreakdown {
    day: number;
    orders: number;
    revenue: number;
}

export interface ProductRanking {
    name: string;
    quantity: number;
    revenue: number;
}

export interface CashierPerformance {
    cashier: string;
    orders: number;
    revenue: number;
}

export interface MonthlyReportData {
    success: boolean;
    month: number;
    year: number;
    totals: { orders: number; revenue: number; avgOrderValue: number };
    dailyBreakdown: DailyBreakdown[];
    topProducts: ProductRanking[];
    byCashier: CashierPerformance[];
    error?: string;
}

// Cache keys
const CACHE_DASHBOARD = 'admin_dashboard_cache';
const CACHE_MONTHLY_PREFIX = 'admin_monthly_';

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data as T;
  } catch { return null; }
}

function writeCache(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

/**
 * Fetch dashboard KPI data (with cache)
 */
export const fetchDashboardData = async (useCache = true): Promise<DashboardData> => {
    // Try cache first
    if (useCache) {
        const cached = readCache<DashboardData>(CACHE_DASHBOARD);
        if (cached) {
            return cached;
        }
    }

    // Supabase is the primary data source (all historical data has been migrated)
    if (isSupabaseConfigured()) {
        try {
            const sbData = await fetchDashboardDataSupabase();
            if (sbData?.success) {
                writeCache(CACHE_DASHBOARD, sbData);
                return sbData;
            }
        } catch (err) {
            console.warn('[Dashboard] Supabase read failed, falling back to Sheets:', err);
        }
    }

    // Fallback to Google Sheets (if Supabase is down or not configured)
    try {
        const t = new Date().getTime();
        const res = await fetch(`${POS_GOOGLE_SHEETS_URL}?action=dashboard&t=${t}`);
        const data = await res.json();
        if (data.success) {
            writeCache(CACHE_DASHBOARD, data);
            return data;
        }
        return {
            success: false,
            today: { orders: 0, revenue: 0 },
            thisWeek: { orders: 0, revenue: 0 },
            thisMonth: { orders: 0, revenue: 0 },
            allTime: { orders: 0, revenue: 0 },
            error: data.error || 'Unknown error',
        };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, today: { orders: 0, revenue: 0 }, thisWeek: { orders: 0, revenue: 0 }, thisMonth: { orders: 0, revenue: 0 }, allTime: { orders: 0, revenue: 0 }, error: msg };
    }
};

/**
 * Fetch monthly report data (with cache)
 */
export const fetchMonthlyReport = async (month: number, year: number, useCache = true): Promise<MonthlyReportData> => {
    const cacheKey = `${CACHE_MONTHLY_PREFIX}${month}_${year}`;

    if (useCache) {
        const cached = readCache<MonthlyReportData>(cacheKey);
        if (cached) {
            return cached;
        }
    }

    // Supabase is the primary data source (all historical data has been migrated)
    if (isSupabaseConfigured()) {
        try {
            const sbData = await fetchMonthlyReportSupabase(month, year);
            if (sbData?.success) {
                writeCache(cacheKey, sbData);
                return sbData;
            }
        } catch (err) {
            console.warn('[MonthlyReport] Supabase read failed, falling back to Sheets:', err);
        }
    }

    // Fallback to Google Sheets (if Supabase is down or not configured)
    try {
        const t = new Date().getTime();
        const res = await fetch(`${POS_GOOGLE_SHEETS_URL}?action=monthly&month=${month}&year=${year}&t=${t}`);
        const data = await res.json();
        if (data.success) {
            writeCache(cacheKey, data);
            return data;
        }
        return {
            success: false,
            month, year,
            totals: { orders: 0, revenue: 0, avgOrderValue: 0 },
            dailyBreakdown: [], topProducts: [], byCashier: [],
            error: data.error || 'Unknown error',
        };
    } catch (error) {
        console.error('Monthly report error:', error);
        return {
            success: false,
            month, year,
            totals: { orders: 0, revenue: 0, avgOrderValue: 0 },
            dailyBreakdown: [], topProducts: [], byCashier: [],
            error: error instanceof Error ? error.message : String(error),
        };
    }
};

/**
 * Update order status — uses no-cors since we can't read GAS POST responses
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<{ success: boolean }> => {
    // Write to Supabase first
    if (isSupabaseConfigured()) {
        try {
            const result = await updateOrderStatusSupabase(orderId, status);
            if (!result.success) console.warn('[updateOrderStatus] Supabase write failed:', result.error);
        } catch (err) {
            console.warn('[updateOrderStatus] Supabase write error:', err);
        }
    }

    // Always write to Google Sheets (backup during transition)
    try {
        await fetch(POS_GOOGLE_SHEETS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'updateStatus', orderId, status }),
            mode: 'no-cors',
        });
        return { success: true };
    } catch (error) {
        console.error('Update status error:', error);
        return { success: false };
    }
};

/**
 * Soft-delete an order — uses no-cors
 */
export const deleteOrder = async (orderId: string, deletedBy: string = 'Admin'): Promise<{ success: boolean }> => {
    // Write to Supabase first
    if (isSupabaseConfigured()) {
        try {
            const result = await softDeleteOrder(orderId, deletedBy);
            if (!result.success) console.warn('[deleteOrder] Supabase write failed:', result.error);
        } catch (err) {
            console.warn('[deleteOrder] Supabase write error:', err);
        }
    }

    // Always write to Google Sheets (backup during transition)
    try {
        await fetch(POS_GOOGLE_SHEETS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'deleteOrder', orderId, deletedBy }),
            mode: 'no-cors',
        });
        return { success: true };
    } catch (error) {
        console.error('Delete order error:', error);
        return { success: false };
    }
};

/**
 * Restore an order — uses no-cors
 */
export const restoreOrder = async (orderId: string): Promise<{ success: boolean }> => {
    // Write to Supabase first
    if (isSupabaseConfigured()) {
        try {
            const result = await restoreOrderSupabase(orderId);
            if (!result.success) console.warn('[restoreOrder] Supabase write failed:', result.error);
        } catch (err) {
            console.warn('[restoreOrder] Supabase write error:', err);
        }
    }

    // Always write to Google Sheets (backup during transition)
    try {
        await fetch(POS_GOOGLE_SHEETS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'restoreOrder', orderId }),
            mode: 'no-cors',
        });
        return { success: true };
    } catch (error) {
        console.error('Restore order error:', error);
        return { success: false };
    }
};

/**
 * Assign designer to an order - uses no-cors
 */
export const assignDesigner = async (orderId: string, designer: string): Promise<{ success: boolean }> => {
    // Write to Supabase first
    if (isSupabaseConfigured()) {
        try {
            const result = await assignDesignerSupabase(orderId, designer);
            if (!result.success) console.warn('[assignDesigner] Supabase write failed:', result.error);
        } catch (err) {
            console.warn('[assignDesigner] Supabase write error:', err);
        }
    }

    // Always write to Google Sheets (backup during transition)
    try {
        await fetch(POS_GOOGLE_SHEETS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'assignDesigner', orderId, designer }),
            mode: 'no-cors',
        });
        return { success: true };
    } catch (error) {
        console.error('Assign designer error:', error);
        return { success: false };
    }
};

/**
 * Clear all admin caches — call after status change or delete
 */
export const clearAdminCache = () => {
    localStorage.removeItem(CACHE_DASHBOARD);
    localStorage.removeItem('admin_orders_cache');
    localStorage.removeItem('orderHistory_cache');
    // Clear all monthly caches
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_MONTHLY_PREFIX)) {
            localStorage.removeItem(key);
        }
    }
};
