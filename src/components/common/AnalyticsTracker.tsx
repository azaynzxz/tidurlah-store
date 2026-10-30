import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initTrafficSourceCapture, trackPageView } from '@/utils/tracking';

/**
 * AnalyticsTracker listens to client-side route changes and emits
 * SPA virtual pageview events to GTM dataLayer.
 * It also captures traffic source (UTM/Referrer) on app mount.
 */
export const AnalyticsTracker = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);

  // Initialize traffic source on initial load
  useEffect(() => {
    initTrafficSourceCapture();
  }, []);

  // Track virtual pageviews on route change
  useEffect(() => {
    // Avoid double firing on first load if standard container handles initial pageview,
    // but fire for all SPA route transitions and deep links
    const currentPath = location.pathname + location.search;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Send initial pageview with full current path & search
      trackPageView(currentPath);
      return;
    }

    trackPageView(currentPath);
  }, [location.pathname, location.search]);

  return null;
};
