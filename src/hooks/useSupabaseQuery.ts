import { useQuery } from '@tanstack/react-query';
import {
  fetchAllProducts,
  fetchAllPromoCodes,
} from '@/services/products';

// ============================================================
// Query Keys — centralised to avoid stale-key bugs
// ============================================================
export const queryKeys = {
  products: {
    all: ['products'] as const,
    admin: ['products', 'admin'] as const,
  },
  promos: {
    all: ['promos'] as const,
  },
} as const;

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
