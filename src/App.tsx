import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { DialogProvider } from "@/contexts/DialogContext";
import StorefrontBeta from "./pages/StorefrontBeta";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { AnalyticsTracker } from "@/components/common/AnalyticsTracker";

// Lazy-load secondary, POS, and Admin routes so the primary storefront
// bundle stays small and fast without loading PDF/charting/POS libraries upfront.
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginBlocked = lazy(() => import("./pages/LoginBlocked"));
const Survey = lazy(() => import("./pages/Survey"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Spotlight = lazy(() => import("./pages/Spotlight"));
const Cashier = lazy(() => import("./pages/Cashier"));
const Receipt = lazy(() => import("./pages/Receipt"));
const Loker = lazy(() => import("./pages/Loker"));
const Layout = lazy(() => import("./pages/Layout"));
const Katalog = lazy(() => import("./pages/Katalog"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const About = lazy(() => import("./pages/About"));

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

const RouteFallback = () => (
  <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
    <div className="w-7 h-7 rounded-full border-2 border-[#E7E5E4] border-t-[#E8590C] animate-spin" />
  </div>
);

const ClassicProductRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={slug ? `/product/${slug}` : "/"} replace />;
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DialogProvider>
            <TooltipProvider>
              <Sonner />
              <BrowserRouter>
                {/* Global Analytics & SPA virtual pageview tracker */}
                <AnalyticsTracker />
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    {/* Main Storefront (idcardlampung.com) — Eagerly bundled for instant load */}
                    <Route path="/" element={<StorefrontBeta />} />
                    <Route path="/product/:slug" element={<StorefrontBeta />} />

                    {/* Beta routes alias */}
                    <Route path="/beta" element={<StorefrontBeta />} />
                    <Route path="/beta/product/:slug" element={<StorefrontBeta />} />

                    {/* Legacy storefront redirects */}
                    <Route path="/classic" element={<Navigate to="/" replace />} />
                    <Route path="/classic/product/:slug" element={<ClassicProductRedirect />} />
                    <Route path="/old" element={<Navigate to="/" replace />} />
                    <Route path="/survey" element={<Survey />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:title" element={<BlogPost />} />
                    <Route path="/hello" element={<Spotlight />} />
                    <Route
                      path="/cashier"
                      element={
                        <ProtectedRoute allowedRoles={["admin", "cashier"]}>
                          <Cashier />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/receipt" element={<Receipt />} />
                    <Route path="/loker" element={<Loker />} />
                    <Route path="/loker/:jobSlug" element={<Loker />} />
                    <Route path="/twibbon-hut-3-id-card-lampung" element={<Navigate to="/" replace />} />
                    <Route path="/layout" element={<Layout />} />
                    <Route path="/katalog" element={<Katalog />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/login-blocked" element={<LoginBlocked />} />
                    <Route path="/about" element={<About />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </DialogProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
