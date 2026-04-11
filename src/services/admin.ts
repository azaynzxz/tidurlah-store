import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { DashboardData, MonthlyReportData } from '@/utils/adminApi';

// ============================================================
// Admin Service — Supabase analytics with Google Sheets fallback
// ============================================================

/**
 * Fetch dashboard KPI data from Supabase.
 * Returns null if Supabase is not configured (caller should fall back to Sheets).
 */
export async function fetchDashboardDataSupabase(): Promise<DashboardData | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.rpc('get_dashboard_data');
    if (error) throw error;

    const result = data as unknown as DashboardData;
    return { ...result, success: true };
  } catch (err: unknown) {
    console.error('[Admin] Dashboard fetch failed:', err);
    return null;
  }
}

/**
 * Fetch monthly report from Supabase.
 * Returns null if Supabase is not configured (caller should fall back to Sheets).
 */
export async function fetchMonthlyReportSupabase(
  month: number,
  year: number
): Promise<MonthlyReportData | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.rpc('get_monthly_report', {
      p_month: month,
      p_year: year,
    });
    if (error) throw error;

    const result = data as unknown as MonthlyReportData;
    return { ...result, success: true };
  } catch (err: unknown) {
    console.error('[Admin] Monthly report fetch failed:', err);
    return null;
  }
}
