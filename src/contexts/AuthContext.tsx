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

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const safeSetState = useCallback((updater: AuthState | ((prev: AuthState) => AuthState)) => {
    if (mountedRef.current) setState(updater);
  }, []);

  const clearError = useCallback(() => {
    safeSetState(prev => ({ ...prev, authError: null }));
  }, [safeSetState]);

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Failed to fetch profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('[Auth] Profile fetch exception:', err);
      return null;
    }
  }, []);

  // Refresh profile data (e.g. after role change)
  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    safeSetState(prev => ({ ...prev, profile }));
  }, [state.user, fetchProfile, safeSetState]);

  // Initialize auth state — runs once on mount
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Use Supabase's recommended pattern: listen first, then get session.
    // onAuthStateChange fires INITIAL_SESSION synchronously which handles
    // the existing-session case, so we don't need a separate getSession call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // signIn() handles SIGNED_IN directly — skip here to prevent race condition.
        // INITIAL_SESSION handles page refresh, TOKEN_REFRESHED handles token renewal.
        if (event === 'SIGNED_IN') return;

        if (
          (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') &&
          session?.user
        ) {
          const profile = await fetchProfile(session.user.id);
          safeSetState({
            user: session.user,
            session,
            profile,
            isLoading: false,
            authError: profile ? null : 'Gagal memuat profil. Hubungi admin.',
          });
        } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
          // No session on initial load, or user signed out
          safeSetState({ user: null, session: null, profile: null, isLoading: false, authError: null });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, safeSetState]);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string): Promise<{ error: AuthError | Error | null }> => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    safeSetState(prev => ({ ...prev, isLoading: true, authError: null }));

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      safeSetState(prev => ({ ...prev, isLoading: false }));
      return { error };
    }

    // Auth succeeded — fetch profile directly for immediate state update.
    // Mark timestamp so onAuthStateChange skips the duplicate SIGNED_IN event.
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      safeSetState({
        user: data.user,
        session: data.session,
        profile,
        isLoading: false,
        authError: profile ? null : 'Login berhasil, tapi profil tidak ditemukan. Hubungi admin.',
      });

      if (!profile) {
        return { error: new Error('Profil tidak ditemukan di database. Hubungi admin.') };
      }
    }

    return { error: null };
  }, [fetchProfile, safeSetState]);

  // Sign out
  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    safeSetState({ user: null, session: null, profile: null, isLoading: false, authError: null });
  }, [safeSetState]);

  const value: AuthContextType = {
    ...state,
    signIn,
    signOut,
    isAdmin: state.profile?.role === 'admin',
    isCashier: state.profile?.role === 'cashier',
    isAuthenticated: !!state.user && !!state.profile,
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
