import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  History,
  Search,
  X,
  User,
  Settings,
  Menu,
  Layout,
  MapPin,
  ExternalLink,
  LayoutDashboard,
  ShoppingCart,
  Store,
  ChevronDown,
} from "lucide-react";

interface POSHeaderProps {
  onShowOrderHistory?: () => void;
  onSearch?: (searchTerm: string) => void;
  searchTerm?: string;
  cashierName?: string;
  onCashierNameChange?: (name: string) => void;
  cabang?: string;
  onCabangChange?: (cabang: string) => void;
}

export function POSHeader({
  onShowOrderHistory,
  onSearch,
  searchTerm,
  cashierName,
  onCashierNameChange,
  cabang,
  onCabangChange
}: POSHeaderProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm || "");
  const [showCashierDialog, setShowCashierDialog] = useState(false);
  const [tempCashierName, setTempCashierName] = useState(cashierName || "");
  const [tempCabang, setTempCabang] = useState(cabang || "");
  const location = useLocation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInternalSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const clearSearch = () => {
    setInternalSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
  };

  const handleCashierNameSave = () => {
    if (onCashierNameChange) {
      onCashierNameChange(tempCashierName);
    }
    if (onCabangChange) {
      onCabangChange(tempCabang);
    }
    setShowCashierDialog(false);
  };

  useEffect(() => {
    setTempCashierName(cashierName || "");
  }, [cashierName]);

  useEffect(() => {
    setTempCabang(cabang || "");
  }, [cabang]);

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-2xs">
      <div className="px-3 md:px-5 py-2.5">
        {/* Cashier Settings Dialog */}
        <Dialog open={showCashierDialog} onOpenChange={setShowCashierDialog}>
          <DialogContent className="sm:max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Pengaturan Kasir & Cabang</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cashier-name" className="text-xs font-semibold text-foreground">Nama Kasir/Admin</Label>
                <Input
                  id="cashier-name"
                  type="text"
                  placeholder="Masukkan nama kasir"
                  value={tempCashierName}
                  onChange={(e) => setTempCashierName(e.target.value)}
                  className="h-9 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Nama ini akan tertera pada struk cetak dan pencatatan transaksi.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cashier-cabang" className="text-xs font-semibold text-foreground">Cabang Default POS</Label>
                <select
                  id="cashier-cabang"
                  value={tempCabang}
                  onChange={(e) => setTempCabang(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-medium border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="" disabled>Pilih Cabang Default</option>
                  <option value="Cabang Belwis">Cabang Belwis</option>
                  <option value="Cabang Unila">Cabang Unila</option>
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Lokasi cabang yang otomatis digunakan saat memproses pesanan baru.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCashierDialog(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleCashierNameSave}
                  className="bg-[#FF5E01] hover:bg-[#e54d00] text-white text-xs font-semibold"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mobile View: Two Tiers */}
        <div className="flex flex-col gap-2 md:hidden">
          {/* Mobile Top Row */}
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-2 hover:opacity-85 transition-opacity"
              title="Kembali ke storefront"
            >
              <img
                src="/product-image/Logo Tidurlah Grafika 1x1 outlined.webp"
                alt="Tidurlah"
                className="size-6 object-contain"
              />
              <span className="font-extrabold text-sm tracking-tight text-foreground">
                POS
              </span>
              {cabang && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium border-[#FF5E01]/30 text-[#FF5E01] bg-[#FF5E01]/5">
                  {cabang.replace('Cabang ', '')}
                </Badge>
              )}
            </a>

            <div className="flex items-center gap-1.5">
              {/* Compact Clock */}
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-[11px] font-mono text-muted-foreground font-semibold">
                <Clock className="size-3 text-muted-foreground/70" />
                <span>
                  {new Date().toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </span>
              </div>

              {/* Cashier Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px] font-semibold gap-1 text-foreground"
                onClick={() => setShowCashierDialog(true)}
              >
                <Settings className="size-3 text-muted-foreground" />
                <span>{cashierName || "Kasir"}</span>
              </Button>

              {/* Tools Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
                    <Menu className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <a href="/layout" className="flex items-center gap-2 text-xs">
                      <Layout className="size-3.5" />
                      <span>Layout Editor</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/hello" className="flex items-center gap-2 text-xs">
                      <MapPin className="size-3.5" />
                      <span>Hello Page</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href="https://docs.google.com/spreadsheets/d/1Z1u_5qExy6_K0rgjQZExeIGyItXKY-7wUnyplVDthSU/edit?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs"
                    >
                      <ExternalLink className="size-3.5" />
                      <span>Order Data</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a
                      href="/cashier"
                      className={`flex items-center gap-2 text-xs ${location.pathname === '/cashier' ? 'font-bold text-[#FF5E01]' : ''}`}
                    >
                      <ShoppingCart className="size-3.5" />
                      <span>Kasir POS</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href="/admin"
                      className={`flex items-center gap-2 text-xs ${location.pathname === '/admin' ? 'font-bold text-[#FF5E01]' : ''}`}
                    >
                      <LayoutDashboard className="size-3.5" />
                      <span>Admin Dashboard</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Order History */}
              {onShowOrderHistory && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs font-semibold text-[#FF5E01] border-[#FF5E01]/30 hover:bg-[#FF5E01]/10 gap-1"
                  onClick={onShowOrderHistory}
                  title="Riwayat Pesanan"
                >
                  <History className="size-3" />
                  <span className="hidden xs:inline">Riwayat</span>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Bottom Row: Search */}
          {onSearch && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari produk / barcode..."
                value={internalSearchTerm}
                onChange={handleSearchChange}
                className="pl-8 pr-8 h-8 text-xs bg-muted/50 border-border focus:bg-background"
              />
              {internalSearchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                  onClick={clearSearch}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Desktop View: Sleek Workstation Top Bar */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Left: Brand Identity + Branch Badge */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
              title="Kembali ke website utama"
            >
              <img
                src="/product-image/Tidurlah Logo Horizontal.webp"
                alt="TIDURLAH"
                className="h-6 w-auto object-contain dark:invert"
              />
              <span className="text-foreground font-black text-sm tracking-tight border-l border-border pl-2.5">
                POS
              </span>
            </a>

            <button
              onClick={() => setShowCashierDialog(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer"
              title="Ubah Cabang & Kasir"
            >
              <Store className="size-3" />
              <span>{cabang || "Cabang Belwis"}</span>
              <ChevronDown className="size-3 opacity-60" />
            </button>
          </div>

          {/* Middle: Workstation Quick Search */}
          <div className="flex-1 max-w-md mx-auto">
            {onSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari produk berdasarkan nama, kode, atau kategori..."
                  value={internalSearchTerm}
                  onChange={handleSearchChange}
                  className="pl-9 pr-9 h-9 text-xs bg-muted/40 hover:bg-muted/60 focus:bg-background border-border transition-colors"
                />
                {internalSearchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                    onClick={clearSearch}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right: Cashier Info, Clock, Tools, History */}
          <div className="flex items-center gap-2">
            {/* Real-time Clock */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-mono text-xs font-semibold border border-border">
              <Clock className="size-3 text-muted-foreground/70" />
              <span>
                {new Date().toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </span>
            </div>

            {/* Cashier Profile Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCashierDialog(true)}
              className="h-8 gap-1.5 text-xs font-medium border-border hover:bg-muted"
            >
              <User className="size-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground truncate max-w-[100px]">
                {cashierName || "Kasir"}
              </span>
            </Button>

            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs font-medium border-border">
                  <Menu className="size-3.5" />
                  <span className="hidden lg:inline">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <a href="/layout" className="flex items-center gap-2.5 text-xs py-2">
                    <Layout className="size-4 text-muted-foreground" />
                    <span>Layout Editor</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/hello" className="flex items-center gap-2.5 text-xs py-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span>Hello Page</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1Z1u_5qExy6_K0rgjQZExeIGyItXKY-7wUnyplVDthSU/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-xs py-2"
                  >
                    <ExternalLink className="size-4 text-muted-foreground" />
                    <span>Order Data Sheet</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href="/cashier"
                    className={`flex items-center gap-2.5 text-xs py-2 ${location.pathname === '/cashier' ? 'font-bold text-[#FF5E01]' : ''}`}
                  >
                    <ShoppingCart className="size-4 text-[#FF5E01]" />
                    <span>Kasir POS</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="/admin"
                    className={`flex items-center gap-2.5 text-xs py-2 ${location.pathname === '/admin' ? 'font-bold text-[#FF5E01]' : ''}`}
                  >
                    <LayoutDashboard className="size-4 text-muted-foreground" />
                    <span>Admin Dashboard</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Order History Button */}
            {onShowOrderHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowOrderHistory}
                className="h-8 gap-1.5 text-xs font-bold text-[#FF5E01] border-[#FF5E01]/40 hover:bg-[#FF5E01]/10 hover:text-[#e54d00] transition-colors"
              >
                <History className="size-3.5" />
                <span>Riwayat Pesanan</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}