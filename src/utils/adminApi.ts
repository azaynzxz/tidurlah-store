import { POS_GOOGLE_SHEETS_URL } from '@/constants';

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

/**
 * Fetch dashboard KPI data (with cache)
 */
export const fetchDashboardData = async (useCache = true): Promise<DashboardData> => {
    // Try cache first
    if (useCache) {
        const cached = localStorage.getItem(CACHE_DASHBOARD);
        if (cached) {
            try { return JSON.parse(cached); } catch { }
        }
    }

    try {
        const res = await fetch(`${POS_GOOGLE_SHEETS_URL}?action=dashboard`);
        const data = await res.json();
        if (data.success) localStorage.setItem(CACHE_DASHBOARD, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Dashboard fetch error:', error);
        return {
            success: false,
            today: { orders: 0, revenue: 0 },
            thisWeek: { orders: 0, revenue: 0 },
            thisMonth: { orders: 0, revenue: 0 },
            allTime: { orders: 0, revenue: 0 },
            error: error.message,
        };
    }
};

/**
 * Fetch monthly report data (with cache)
 */
export const fetchMonthlyReport = async (month: number, year: number, useCache = true): Promise<MonthlyReportData> => {
    const cacheKey = `${CACHE_MONTHLY_PREFIX}${month}_${year}`;

    if (useCache) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try { return JSON.parse(cached); } catch { }
        }
    }

    try {
        const res = await fetch(`${POS_GOOGLE_SHEETS_URL}?action=monthly&month=${month}&year=${year}`);
        const data = await res.json();
        if (data.success) localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Monthly report error:', error);
        return {
            success: false,
            month, year,
            totals: { orders: 0, revenue: 0, avgOrderValue: 0 },
            dailyBreakdown: [], topProducts: [], byCashier: [],
            error: error.message,
        };
    }
};

/**
 * Update order status — uses no-cors since we can't read GAS POST responses
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<{ success: boolean }> => {
    try {
        await fetch(POS_GOOGLE_SHEETS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'updateStatus', orderId, status }),
            mode: 'no-cors',
        });
        // With no-cors we can't read response, assume success if no error thrown
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
