import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home, Menu, X, ArrowUpRight } from "lucide-react";
import { BetaFooter } from "@/components/beta/BetaFooter";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface EruditeBlogLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  toc?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function EruditeBlogLayout({
  children,
  sidebar,
  toc,
  breadcrumbs
}: EruditeBlogLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Katalog Toko", href: "/" },
    { label: "Blog & Panduan", href: "/blog" },
    { label: "Tentang Kami", href: "/about" },
    { label: "Portofolio", href: "/katalog" },
    { label: "Loker", href: "/loker" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo & Section Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/Logo id card lampung 1x1 transparan.png"
                alt="Tidurlah Store"
                className="h-7 w-7 object-contain"
              />
              <span className="font-semibold text-sm tracking-tight text-foreground">
                Tidurlah Store
              </span>
            </Link>

            <span className="text-border">/</span>

            <Link
              to="/blog"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`transition-colors hover:text-foreground ${
                    isActive ? "text-foreground font-semibold" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Action */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Buka Toko</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-xs font-medium ${
                  location.pathname === link.href
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Container - Full-width united layout with left/right attached rails */}
      <div className="max-w-[1400px] w-full mx-auto flex flex-1">
        {/* Left Sidebar attached flush */}
        {sidebar && (
          <aside className="w-64 shrink-0 border-r border-border hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-4 py-6">
            {sidebar}
          </aside>
        )}

        {/* Center Main Content Area */}
        <main className="flex-1 min-w-0 px-6 sm:px-8 lg:px-12 py-8 max-w-4xl mx-auto">
          {/* Breadcrumbs inside content column */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
              <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <Home className="w-3 h-3" />
                <span className="sr-only">Home</span>
              </Link>
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                    {crumb.href && !isLast ? (
                      <Link to={crumb.href} className="hover:text-foreground transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
                        {crumb.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>
          )}

          {children}
        </main>

        {/* Right Table of Contents rail attached flush */}
        {toc && (
          <aside className="w-64 shrink-0 border-l border-border hidden xl:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-4 py-6">
            {toc}
          </aside>
        )}
      </div>

      {/* Minimal Footer */}
      <BetaFooter variant="minimal" />
    </div>
  );
}
