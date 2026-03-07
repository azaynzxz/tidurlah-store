import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { HelpCircle, Clock, History, Search, X, User, Settings, Menu, Layout, MapPin, ExternalLink, LayoutDashboard, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface POSHeaderProps {
  onShowOrderHistory?: () => void;
  onSearch?: (searchTerm: string) => void;
  searchTerm?: string;
  cashierName?: string;
  onCashierNameChange?: (name: string) => void;
}

export function POSHeader({ onShowOrderHistory, onSearch, searchTerm, cashierName, onCashierNameChange }: POSHeaderProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm || "");
  const [showCashierDialog, setShowCashierDialog] = useState(false);
  const [tempCashierName, setTempCashierName] = useState(cashierName || "");
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const location = useLocation();

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

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
    setShowCashierDialog(false);
  };

  // Update temp name when cashier name changes from parent
  useEffect(() => {
    setTempCashierName(cashierName || "");
  }, [cashierName]);

  return (
    <header className="bg-[#FF5E01] text-white">
      <div className="px-2 md:px-4 py-2">
        {/* Cashier Settings Dialog - Shared for both mobile and desktop */}
        <Dialog open={showCashierDialog} onOpenChange={setShowCashierDialog}>
          <DialogContent className="sm:max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle>Pengaturan Kasir</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cashier-name">Nama Kasir/Admin</Label>
                <Input
                  id="cashier-name"
                  type="text"
                  placeholder="Masukkan nama kasir"
                  value={tempCashierName}
                  onChange={(e) => setTempCashierName(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Nama ini akan muncul di struk dan riwayat pesanan
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCashierDialog(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleCashierNameSave}
                  className="bg-[#FF5E01] hover:bg-[#e54d00]"
                >
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mobile Layout - Stacked */}
        <div className="md:hidden space-y-2">
          {/* Top Row: Logo + Time + Settings + Tools + History */}
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              title="Kembali ke website utama"
            >
              <img
                src="/product-image/Logo Tidurlah Grafika 1x1 outlined.png"
                alt="TIDURLAH GRAFIKA"
                className="h-6 w-6 object-contain bg-white rounded p-0.5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">TIDURLAH GRAFIKA</h1>
                <p className="text-[10px] text-orange-100 leading-tight">POS System</p>
              </div>
            </a>

            <div className="flex-1"></div>

            <div className="flex items-center justify-end gap-2">
              {/* Compact Time */}
              <div className="bg-black bg-opacity-20 rounded px-1.5 py-0.5">
                <div className="flex items-center gap-1 text-xs text-white font-mono">
                  <Clock className="w-3 h-3" />
                  <span className="font-bold">
                    {new Date().toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </span>
                </div>
              </div>

              {/* Cashier Settings Button - Mobile */}
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-[#FF5E01] hover:bg-orange-50 h-7 px-2"
                title="Pengaturan Kasir"
                onClick={() => setShowCashierDialog(true)}
              >
                <Settings className="w-3 h-3" />
              </Button>

              {/* Tools Menu */}
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-[#FF5E01] hover:bg-orange-50 h-7 px-2"
                  onClick={() => setShowToolsMenu(!showToolsMenu)}
                >
                  <Menu className="w-3 h-3" />
                </Button>

                {showToolsMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <a
                      href="/layout"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                      onClick={() => setShowToolsMenu(false)}
                    >
                      <Layout className="h-4 w-4 mr-3" />
                      Layout Editor
                    </a>
                    <a
                      href="/hello"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                      onClick={() => setShowToolsMenu(false)}
                    >
                      <MapPin className="h-4 w-4 mr-3" />
                      Hello Page
                    </a>
                    <a
                      href="https://docs.google.com/spreadsheets/d/1Z1u_5qExy6_K0rgjQZExeIGyItXKY-7wUnyplVDthSU/edit?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                      onClick={() => setShowToolsMenu(false)}
                    >
                      <ExternalLink className="h-4 w-4 mr-3" />
                      Order Data
                    </a>
                    <div className="border-t my-1"></div>
                    <a
                      href="/cashier"
                      className={`flex items-center px-4 py-2 text-sm hover:bg-orange-50 transition-colors ${location.pathname === '/cashier' ? 'text-[#FF5E01] font-bold bg-orange-50' : 'text-gray-700'}`}
                      onClick={() => setShowToolsMenu(false)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-3" />
                      Cashier POS
                    </a>
                    <a
                      href="/admin"
                      className={`flex items-center px-4 py-2 text-sm hover:bg-orange-50 transition-colors ${location.pathname === '/admin' ? 'text-[#FF5E01] font-bold bg-orange-50' : 'text-gray-700'}`}
                      onClick={() => setShowToolsMenu(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-3" />
                      Admin Dashboard
                    </a>
                  </div>
                )}
              </div>

              {/* Compact History Button */}
              {onShowOrderHistory && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-[#FF5E01] hover:bg-orange-50 h-7 px-2"
                  onClick={onShowOrderHistory}
                >
                  <History className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Bottom Row: Search */}
          {onSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <Input
                type="text"
                placeholder="Cari produk..."
                value={internalSearchTerm}
                onChange={handleSearchChange}
                className="pl-7 pr-8 h-8 w-full bg-white text-gray-900 border-white placeholder-gray-500 focus:ring-1 focus:ring-white text-xs"
              />
              {internalSearchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                  onClick={clearSearch}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Desktop Layout - Original Grid */}
        <div className="hidden md:grid grid-cols-3 items-center">
          {/* Left section - Logo and Title */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              title="Kembali ke website utama"
            >
              <img
                src="/product-image/Logo Tidurlah Grafika 1x1 outlined.png"
                alt="TIDURLAH GRAFIKA"
                className="h-8 w-8 object-contain bg-white rounded p-0.5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">TIDURLAH GRAFIKA</h1>
                <p className="text-xs text-orange-100 leading-tight">Point of Sale System</p>
              </div>
            </a>
          </div>

          {/* Center section - Search Bar (or empty space to keep grid alignment) */}
          <div className="flex justify-center">
            {onSearch && (
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  type="text"
                  placeholder="Cari produk..."
                  value={internalSearchTerm}
                  onChange={handleSearchChange}
                  className="pl-7 pr-8 h-8 w-full bg-white text-gray-900 border-white placeholder-gray-500 focus:ring-1 focus:ring-white text-sm"
                />
                {internalSearchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                    onClick={clearSearch}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right section - Cashier, Time and History */}
          <div className="flex items-center justify-end gap-3">
            {/* Cashier Name Settings - Desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white hover:bg-white hover:bg-opacity-20 h-8 px-2 text-xs"
              title="Pengaturan Kasir"
              onClick={() => setShowCashierDialog(true)}
            >
              <User className="w-3 h-3" />
              <span className="max-w-20 truncate">{cashierName || "Kasir"}</span>
              <Settings className="w-3 h-3" />
            </Button>

            {/* Time Display */}
            <div className="bg-black bg-opacity-20 rounded px-2 py-1">
              <div className="flex items-center gap-1.5 text-sm text-white font-mono">
                <Clock className="w-3 h-3" />
                <span className="font-bold text-sm">
                  {new Date().toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </span>
                <span className="text-xs text-orange-200">
                  {new Date().toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Tools Menu */}
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 bg-white text-[#FF5E01] hover:bg-orange-50 h-8 px-3 text-sm"
                onClick={() => setShowToolsMenu(!showToolsMenu)}
              >
                <Menu className="w-3 h-3" />
                Tools
              </Button>

              {showToolsMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <a
                    href="/layout"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                    onClick={() => setShowToolsMenu(false)}
                  >
                    <Layout className="h-4 w-4 mr-3" />
                    Layout Editor
                  </a>
                  <a
                    href="/hello"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                    onClick={() => setShowToolsMenu(false)}
                  >
                    <MapPin className="h-4 w-4 mr-3" />
                    Hello Page
                  </a>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1Z1u_5qExy6_K0rgjQZExeIGyItXKY-7wUnyplVDthSU/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                    onClick={() => setShowToolsMenu(false)}
                  >
                    <ExternalLink className="h-4 w-4 mr-3" />
                    Order Data
                  </a>
                  <div className="border-t my-1"></div>
                  <a
                    href="/cashier"
                    className={`flex items-center px-4 py-2 text-sm hover:bg-orange-50 transition-colors ${location.pathname === '/cashier' ? 'text-[#FF5E01] font-bold bg-orange-50' : 'text-gray-700'}`}
                    onClick={() => setShowToolsMenu(false)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-3" />
                    Cashier POS
                  </a>
                  <a
                    href="/admin"
                    className={`flex items-center px-4 py-2 text-sm hover:bg-orange-50 transition-colors ${location.pathname === '/admin' ? 'text-[#FF5E01] font-bold bg-orange-50' : 'text-gray-700'}`}
                    onClick={() => setShowToolsMenu(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3" />
                    Admin Dashboard
                  </a>
                </div>
              )}
            </div>

            {/* History Button */}
            {onShowOrderHistory && (
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 bg-white text-[#FF5E01] hover:bg-orange-50 h-8 px-3 text-sm"
                onClick={onShowOrderHistory}
              >
                <History className="w-3 h-3" />
                Riwayat
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
