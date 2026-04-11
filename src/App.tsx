import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HalloweenThemeProvider } from "@/contexts/HalloweenThemeContext";
import { DialogProvider } from "@/contexts/DialogContext";
import { PromoBannerProvider } from "@/contexts/PromoBannerContext";
import HalloweenDecorations from "@/components/HalloweenDecorations";
import PromoBanner from "@/components/PromoBanner";
import "@/utils/applyDynamicColors"; // Import to apply dynamic colors
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginBlocked from "./pages/LoginBlocked";
import Survey from "./pages/Survey";
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Spotlight from './pages/Spotlight';
import Cashier from "./pages/Cashier";
import Receipt from "./pages/Receipt";
import Loker from "./pages/Loker";
import TwibbonMaker from "./pages/TwibbonMaker";
import Layout from "./pages/Layout";
import Katalog from "./pages/Katalog";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 60_000,        // 1 min default
      gcTime: 5 * 60_000,       // 5 min garbage collect
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <HalloweenThemeProvider>
        <DialogProvider>
          <PromoBannerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <HalloweenDecorations />
              <BrowserRouter>
                {/* Promo Banner - Shows on all pages */}
                <PromoBanner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/product/:slug" element={<Index />} />
                  <Route path="/survey" element={<Survey />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:title" element={<BlogPost />} />
                  <Route path="/hello" element={<Spotlight />} />
                  <Route path="/cashier" element={
                    <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                      <Cashier />
                    </ProtectedRoute>
                  } />
                  <Route path="/receipt" element={<Receipt />} />
                  <Route path="/loker" element={<Loker />} />
                  <Route path="/loker/:jobSlug" element={<Loker />} />
                  <Route path="/twibbon-hut-3-id-card-lampung" element={<TwibbonMaker />} />
                  <Route path="/layout" element={<Layout />} />
                  <Route path="/katalog" element={<Katalog />} />
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/login-blocked" element={<LoginBlocked />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </PromoBannerProvider>
        </DialogProvider>
      </HalloweenThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
  </ErrorBoundary>
);

export default App;
