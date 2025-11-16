import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HalloweenThemeProvider } from "@/contexts/HalloweenThemeContext";
import { DialogProvider } from "@/contexts/DialogContext";
import HalloweenDecorations from "@/components/HalloweenDecorations";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HalloweenThemeProvider>
      <DialogProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HalloweenDecorations />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product/:slug" element={<Index />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:title" element={<BlogPost />} />
              <Route path="/hello" element={<Spotlight />} />
              <Route path="/cashier" element={<Cashier />} />
              <Route path="/receipt" element={<Receipt />} />
              <Route path="/loker" element={<Loker />} />
              <Route path="/loker/:jobSlug" element={<Loker />} />
              <Route path="/twibbon-hut-3-id-card-lampung" element={<TwibbonMaker />} />
              <Route path="/layout" element={<Layout />} />
              <Route path="/katalog" element={<Katalog />} />
              <Route path="/login-blocked" element={<LoginBlocked />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DialogProvider>
    </HalloweenThemeProvider>
  </QueryClientProvider>
);

export default App;
