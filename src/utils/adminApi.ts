import { isSupabaseConfigured } from '@/lib/supabase';
import { fetchDashboardDataSupabase, fetchMonthlyReportSupabase } from '@/services/admin';
import { updateOrderStatusSupabase, softDeleteOrder, restoreOrderSupabase, assignDesignerSupabase } from '@/services/orders';

// ============================================================
// DASHBOARD API — Fetch analytics from Supabase
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

    if (!isSupabaseConfigured()) {
        return {
            success: false,
            today: { orders: 0, revenue: 0 },
            thisWeek: { orders: 0, revenue: 0 },
            thisMonth: { orders: 0, revenue: 0 },
            allTime: { orders: 0, revenue: 0 },
            error: 'Supabase is not configured',
        };
    }

    try {
        const sbData = await fetchDashboardDataSupabase();
        if (sbData?.success) {
            writeCache(CACHE_DASHBOARD, sbData);
            return sbData;
        }
        throw new Error(sbData?.error || 'Failed to fetch dashboard data');
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            today: { orders: 0, revenue: 0 },
            thisWeek: { orders: 0, revenue: 0 },
            thisMonth: { orders: 0, revenue: 0 },
            allTime: { orders: 0, revenue: 0 },
            error: msg,
        };
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

    if (!isSupabaseConfigured()) {
        return {
            success: false,
            month, year,
            totals: { orders: 0, revenue: 0, avgOrderValue: 0 },
            dailyBreakdown: [], topProducts: [], byCashier: [],
            error: 'Supabase is not configured',
        };
    }

    try {
        const sbData = await fetchMonthlyReportSupabase(month, year);
        if (sbData?.success) {
            writeCache(cacheKey, sbData);
            return sbData;
        }
        throw new Error(sbData?.error || 'Failed to fetch monthly report');
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
 * Update order status
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<{ success: boolean }> => {
    if (!isSupabaseConfigured()) return { success: false };
    try {
        const result = await updateOrderStatusSupabase(orderId, status);
        return { success: result.success };
    } catch (error) {
        console.error('Update status error:', error);
        return { success: false };
    }
};

/**
 * Soft-delete an order
 */
export const deleteOrder = async (orderId: string, deletedBy: string = 'Admin'): Promise<{ success: boolean }> => {
    if (!isSupabaseConfigured()) return { success: false };
    try {
        const result = await softDeleteOrder(orderId, deletedBy);
        return { success: result.success };
    } catch (error) {
        console.error('Delete order error:', error);
        return { success: false };
    }
};

/**
 * Restore an order
 */
export const restoreOrder = async (orderId: string): Promise<{ success: boolean }> => {
    if (!isSupabaseConfigured()) return { success: false };
    try {
        const result = await restoreOrderSupabase(orderId);
        return { success: result.success };
    } catch (error) {
        console.error('Restore order error:', error);
        return { success: false };
    }
};

/**
 * Assign designer to an order
 */
export const assignDesigner = async (orderId: string, designer: string): Promise<{ success: boolean }> => {
    if (!isSupabaseConfigured()) return { success: false };
    try {
        const result = await assignDesignerSupabase(orderId, designer);
        return { success: result.success };
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
