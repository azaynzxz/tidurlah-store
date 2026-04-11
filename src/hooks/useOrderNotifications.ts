import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2_000;

/**
 * Subscribe to real-time order INSERT events from Supabase.
 * Shows a toast notification when a new order arrives.
 * Includes automatic reconnection with exponential back-off.
 */
export function useOrderNotifications(enabled = true) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  const cleanup = useCallback(() => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    if (channelRef.current && supabase) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const subscribe = useCallback(() => {
    if (!supabase || !isSupabaseConfigured()) return;
    // Remove any previous channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setStatus('connecting');

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as Record<string, unknown>;
          const name = (order.customer_name as string) || 'Customer';
          const total = order.total
            ? `Rp ${Number(order.total).toLocaleString('id-ID')}`
            : '';
          const ch = order.channel === 'pos' ? 'POS' : 'Website';

          toast.info(`Pesanan baru dari ${name}`, {
            description: `${ch} • ${total}`,
            duration: 8000,
          });

          // Play notification sound if available
          try {
            const audio = new Audio('/audio/new-order.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch {
            // Audio playback is non-critical
          }
        }
      )
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') {
          retryCount.current = 0;
          setStatus('connected');
        } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') {
          console.warn('[Realtime] Channel error/timeout, will reconnect…', state);
          setStatus('error');
          scheduleRetry();
        } else if (state === 'CLOSED') {
          setStatus('disconnected');
        }
      });

    channelRef.current = channel;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleRetry = useCallback(() => {
    if (retryCount.current >= MAX_RETRIES) {
      console.error('[Realtime] Max retries reached, giving up');
      setStatus('error');
      return;
    }
    const delay = BASE_DELAY_MS * Math.pow(2, retryCount.current);
    retryCount.current += 1;
    retryTimer.current = setTimeout(() => {
      subscribe();
    }, delay);
  }, [subscribe]);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }
    subscribe();
    return cleanup;
  }, [enabled, subscribe, cleanup]);

  return { status };
}
