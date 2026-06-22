import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { ReactNode } from 'react';

// ============================================================
// ProtectedRoute — Guards /cashier and /admin behind auth
// ============================================================

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ('admin' | 'cashier')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  // If Supabase is not configured
  if (!isSupabaseConfigured()) {
    // Only allow bypass in local development mode (localhost)
    if (import.meta.env.DEV) {
      return <>{children}</>;
    }
    // Fail-closed in production to prevent security bypasses
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 text-center">
        <div className="max-w-md bg-white p-6 rounded-lg shadow-lg border border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-2">Database Belum Terkonfigurasi</h2>
          <p className="text-gray-600 text-sm">
            Koneksi Supabase belum disetel di server produksi. Hubungi administrator untuk mengonfigurasi variabel lingkungan di Cloudflare Pages.
          </p>
        </div>
      </div>
    );
  }

  // Loading state — show centered spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5E01]" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Authenticated but wrong role → redirect to appropriate page
  if (profile && !allowedRoles.includes(profile.role)) {
    const fallback = profile.role === 'admin' ? '/admin' : '/cashier';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
