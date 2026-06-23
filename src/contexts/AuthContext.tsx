import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Profile } from '@/types/supabase';

// ============================================================
// Auth Context — Admin/Cashier authentication for Tidurlah Store
// ============================================================

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  authError: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isCashier: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    authError: null,
  });

  const mountedRef = useRef(true);
  const currentUserRef = useRef<User | null>(null);
  const isSigningInRef = useRef(false);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const safeSetState = useCallback((updater: AuthState | ((prev: AuthState) => AuthState)) => {
    if (mountedRef.current) {
      setState(prev => {
        const next = typeof updater === 'function' ? (updater as (p: AuthState) => AuthState)(prev) : updater;
        currentUserRef.current = next.user;
        return next;
      });
    }
  }, []);

  const clearError = useCallback(() => {
    safeSetState(prev => ({ ...prev, authError: null }));
  }, [safeSetState]);

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(async (userId: string): Promise<{ profile: Profile | null, error: string | null }> => {
    if (!supabase) return { profile: null, error: 'Supabase tidak dikonfigurasi.' };
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Failed to fetch profile:', error.message);
        return { profile: null, error: error.message };
      }
      return { profile: data as Profile, error: null };
    } catch (err) {
      console.error('[Auth] Profile fetch exception:', err);
      return { profile: null, error: err instanceof Error ? err.message : 'Kesalahan tidak dikenal saat mengambil profil.' };
    }
  }, []);

  // Refresh profile data (e.g. after role change)
  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const { profile } = await fetchProfile(state.user.id);
    safeSetState(prev => ({ ...prev, profile }));
  }, [state.user, fetchProfile, safeSetState]);

  // Initialize auth state — runs once on mount
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    let isSubscribed = true;

    // Listen for changes — Supabase client will fire INITIAL_SESSION synchronously on subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (!isSubscribed) return;

          // Skip if manual sign-in is currently processing (signIn handles it)
          if (event === 'SIGNED_IN' && isSigningInRef.current) {
            return;
          }

          // If user is unchanged, only update session details to avoid redundant profile fetches
          if (session?.user && currentUserRef.current?.id === session.user.id) {
            safeSetState(prev => ({ ...prev, session }));
            return;
          }

          if (session?.user) {
            const { profile, error: fetchErr } = await fetchProfile(session.user.id);
            if (!isSubscribed) return;

            const errorMsg = fetchErr 
              ? `Gagal memuat profil dari database: ${fetchErr}`
              : (profile ? null : 'Profil tidak ditemukan di database. Hubungi admin.');

            safeSetState({
              user: session.user,
              session,
              profile,
              isLoading: false,
              authError: errorMsg,
            });
          } else {
            // No session or signed out — clear state and ensure loading is false
            safeSetState({ user: null, session: null, profile: null, isLoading: false, authError: null });
          }
        } catch (err) {
          console.error('[Auth] Error in onAuthStateChange handler:', err);
          if (isSubscribed) {
            safeSetState(prev => ({ ...prev, isLoading: false }));
          }
        }
      }
    );

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, safeSetState]);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string): Promise<{ error: AuthError | Error | null }> => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    safeSetState(prev => ({ ...prev, isLoading: true, authError: null }));
    isSigningInRef.current = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        safeSetState(prev => ({ ...prev, isLoading: false }));
        isSigningInRef.current = false;
        return { error };
      }

      // Auth succeeded — fetch profile directly for immediate state update.
      if (data.user) {
        const { profile, error: fetchErr } = await fetchProfile(data.user.id);
        localStorage.setItem('session_login_time', Date.now().toString());

        const errorMsg = fetchErr 
          ? `Login berhasil, tetapi gagal memuat profil: ${fetchErr}`
          : (profile ? null : 'Login berhasil, tapi profil tidak ditemukan di database. Hubungi admin.');

        safeSetState({
          user: data.user,
          session: data.session,
          profile,
          isLoading: false,
          authError: errorMsg,
        });

        isSigningInRef.current = false;

        if (!profile) {
          return { error: new Error(errorMsg || 'Profil tidak ditemukan.') };
        }
      } else {
        isSigningInRef.current = false;
      }

      return { error: null };
    } catch (err) {
      console.error('[Auth] signIn exception:', err);
      isSigningInRef.current = false;
      safeSetState(prev => ({ ...prev, isLoading: false }));
      return { error: err instanceof Error ? err : new Error('Terjadi kesalahan saat login.') };
    }
  }, [fetchProfile, safeSetState]);

  // Sign out
  const signOut = useCallback(async () => {
    if (!supabase) return;
    localStorage.removeItem('session_login_time');
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Auth] Supabase signOut failed, clearing local state anyway:', err);
    } finally {
      safeSetState({ user: null, session: null, profile: null, isLoading: false, authError: null });
    }
  }, [safeSetState]);

  // Shift-based auto-logout (8 hours) check
  useEffect(() => {
    if (!state.user) return;

    const checkSessionExpiry = () => {
      const loginTimeStr = localStorage.getItem('session_login_time');
      if (loginTimeStr) {
        const loginTime = parseInt(loginTimeStr, 10);
        const elapsed = Date.now() - loginTime;
        const EIGHT_HOURS = 8 * 60 * 60 * 1000;
        
        if (elapsed >= EIGHT_HOURS) {
          console.log('[Auth] Session expired (8-hour shift limit reached). Logging out...');
          signOut();
        }
      } else {
        // Fallback: If logged in but no time set (e.g. page refreshed), set it now
        localStorage.setItem('session_login_time', Date.now().toString());
      }
    };

    checkSessionExpiry();

    const interval = setInterval(checkSessionExpiry, 60000);
    return () => clearInterval(interval);
  }, [state.user, signOut]);

  const devBypass = import.meta.env.DEV && localStorage.getItem('dev_bypass_auth') === 'true';

  const value: AuthContextType = {
    ...state,
    signIn,
    signOut,
    isAdmin: state.profile?.role === 'admin' || devBypass,
    isCashier: state.profile?.role === 'cashier' || devBypass,
    isAuthenticated: (!!state.user && !!state.profile) || devBypass,
    refreshProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// Hook
// ============================================================

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
