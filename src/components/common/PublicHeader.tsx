import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PublicHeaderProps {
  sectionName?: string;
  sectionHref?: string;
}

export function PublicHeader({ sectionName, sectionHref }: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Toko", href: "/" },
    { label: "Katalog", href: "/katalog" },
    { label: "Tentang", href: "/about" },
    { label: "Karir", href: "/loker" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand & Section Breadcrumb */}
        <div className="flex items-center gap-2.5">
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

          {sectionName && (
            <>
              <span className="text-border">/</span>
              {sectionHref ? (
                <Link
                  to={sectionHref}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {sectionName}
                </Link>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  {sectionName}
                </span>
              )}
            </>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  isActive && "text-foreground font-semibold"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/6285172157808?text=Halo%20Tidurlah%20Grafika,%20saya%20ingin%20konsultasi%20cetak."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            <span>Konsultasi WA</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md border border-border text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border mt-2">
            <a
              href="https://wa.me/6285172157808?text=Halo%20Tidurlah%20Grafika,%20saya%20ingin%20konsultasi%20cetak."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full rounded-md bg-foreground py-2 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              <span>Konsultasi via WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export default PublicHeader;
