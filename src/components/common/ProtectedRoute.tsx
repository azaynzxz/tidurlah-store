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

  // If Supabase is not configured, allow access (dev/fallback mode)
  if (!isSupabaseConfigured()) {
    return <>{children}</>;
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
