import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  fetchProductsFromSupabase,
} from '@/services/products';
import { fetchOrders } from '@/services/orders';
import { fetchDashboardDataSupabase, fetchMonthlyReportSupabase } from '@/services/admin';
import type { Database } from '@/types/supabase';

type ProductRow = Database['public']['Tables']['products']['Row'];
type PromoRow = Database['public']['Tables']['promo_codes']['Row'];

// ============================================================
// Query Keys — centralised to avoid stale-key bugs
// ============================================================
export const queryKeys = {
  products: {
    all: ['products'] as const,
    catalog: ['products', 'catalog'] as const,
    admin: ['products', 'admin'] as const,
  },
  promos: {
    all: ['promos'] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (params: Record<string, unknown>) => ['orders', 'list', params] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    monthlyReport: (month: number, year: number) => ['admin', 'report', month, year] as const,
  },
} as const;

// ============================================================
// Products — Storefront (public, long cache)
// ============================================================

export function useProductCatalog() {
  return useQuery({
    queryKey: queryKeys.products.catalog,
    queryFn: fetchProductsFromSupabase,
    staleTime: 5 * 60_000,      // 5 min — catalog rarely changes
    gcTime: 15 * 60_000,
    retry: 2,
  });
}

// ============================================================
// Products — Admin CRUD
// ============================================================

export function useAdminProducts() {
  return useQuery({
    queryKey: queryKeys.products.admin,
    queryFn: fetchAllProducts,
    staleTime: 30_000,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product: Parameters<typeof createProduct>[0]) => createProduct(product),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Parameters<typeof updateProduct>[1] }) =>
      updateProduct(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

// ============================================================
// Promos — Admin CRUD
// ============================================================

export function useAdminPromos() {
  return useQuery({
    queryKey: queryKeys.promos.all,
    queryFn: fetchAllPromoCodes,
    staleTime: 30_000,
  });
}

export function useCreatePromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (promo: Parameters<typeof createPromoCode>[0]) => createPromoCode(promo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.promos.all });
    },
  });
}

export function useUpdatePromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Parameters<typeof updatePromoCode>[1] }) =>
      updatePromoCode(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.promos.all });
    },
  });
}

export function useDeletePromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePromoCode(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.promos.all });
    },
  });
}

// ============================================================
// Orders
// ============================================================

export function useOrders(params: {
  limit?: number;
  offset?: number;
  channel?: string;
  status?: string;
  cashier?: string;
  search?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...fetchParams } = params;
  return useQuery({
    queryKey: queryKeys.orders.list(fetchParams),
    queryFn: () => fetchOrders(fetchParams),
    staleTime: 30_000,           // 30s — orders need fresher data
    enabled,
  });
}

// ============================================================
// Admin Dashboard / Reports
// ============================================================

export function useDashboardData() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: fetchDashboardDataSupabase,
    staleTime: 60_000,           // 1 min
    gcTime: 5 * 60_000,
  });
}

export function useMonthlyReport(month: number, year: number) {
  return useQuery({
    queryKey: queryKeys.admin.monthlyReport(month, year),
    queryFn: () => fetchMonthlyReportSupabase(month, year),
    staleTime: 2 * 60_000,      // 2 min — reports are relatively static
    gcTime: 10 * 60_000,
    enabled: month > 0 && year > 0,
  });
}
