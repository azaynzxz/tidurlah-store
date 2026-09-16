import React, { useState, useEffect } from "react";
import { X, MessageCircle, Copy, Check, Package, Clock, MapPin, Building, ChevronDown, ChevronUp, ShoppingBag, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getLocalOrders, getLocalUser, type LocalOrder, type LocalUser } from "@/utils/localOrders";
import { caseVariants } from "@/constants";

interface BetaOrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShop?: () => void;
}

export const BetaOrdersDrawer: React.FC<BetaOrdersDrawerProps> = ({
  isOpen,
  onClose,
  onOpenShop,
}) => {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Reload orders and local user whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      const storedOrders = getLocalOrders();
      setOrders(storedOrders);
      setLocalUser(getLocalUser());

      // Expand the first order by default if exists
      if (storedOrders.length > 0) {
        setExpandedOrders({ [storedOrders[0].invoiceNumber]: true });
      }

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCopyInvoice = (invoice: string) => {
    navigator.clipboard.writeText(invoice);
    setCopiedInvoice(invoice);
    toast.success(`No. Invoice ${invoice} disalin!`);
    setTimeout(() => {
      setCopiedInvoice((prev) => (prev === invoice ? null : prev));
    }, 2000);
  };

  const toggleExpand = (invoice: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [invoice]: !prev[invoice],
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="orders-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            style={{ willChange: "opacity" }}
            className="fixed inset-0 bg-[#18181B]/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 z-50 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
            <motion.div
              key="orders-panel"
              initial={{ transform: "translateX(100%)" }}
              animate={{ transform: "translateX(0%)" }}
              exit={{ transform: "translateX(100%)" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              style={{ willChange: "transform" }}
              className="w-screen max-w-lg bg-[#FAFAF9] border-l border-[#E7E5E4] shadow-2xl flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-white border-b border-[#E7E5E4] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#18181B] flex items-center justify-center text-white">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#18181B]">Pesanan Saya</h2>
                    <span className="text-xs text-[#71717A]">
                      {orders.length} pesanan tersimpan di perangkat ini
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] active:scale-90 transition-all"
                  aria-label="Tutup pesanan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Bar (if registered locally) */}
              {localUser && (
                <div className="px-5 py-2.5 bg-[#F4F4F5] border-b border-[#E4E4E7] flex items-center justify-between text-xs text-[#52525B]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="truncate">
                      Pemesan: <strong className="text-[#18181B]">{localUser.name}</strong> ({localUser.phone})
                    </span>
                  </div>
                  {localUser.instansi && (
                    <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-white border border-[#E4E4E7] text-[#71717A] truncate max-w-[140px]">
                      {localUser.instansi}
                    </span>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {orders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-[#E7E5E4] flex items-center justify-center text-[#A1A1AA] shadow-sm">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 max-w-xs">
                      <p className="text-sm font-semibold text-[#18181B]">Belum ada pesanan</p>
                      <p className="text-xs text-[#71717A] leading-relaxed">
                        Pesanan yang Anda buat melalui checkout website akan otomatis tercatat di sini sebagai bukti konfirmasi.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenShop) onOpenShop();
                      }}
                      className="px-4 py-2 rounded-lg bg-[#18181B] text-white text-xs font-medium hover:bg-[#27272A] active:scale-95 transition-all"
                    >
                      Mulai Belanja Sekarang
                    </button>
                  </div>
                ) : (
                  orders.map((order) => {
                    const isExpanded = !!expandedOrders[order.invoiceNumber];
                    const isCopied = copiedInvoice === order.invoiceNumber;
                    const dateFormatted = new Date(order.timestamp).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={order.invoiceNumber}
                        className="bg-white border border-[#E7E5E4] rounded-xl overflow-hidden shadow-sm transition-all hover:border-[#D4D4D8]"
                      >
                        {/* Order Header Card */}
                        <div className="p-4 border-b border-[#F4F4F5] space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-[#18181B]">
                                  {order.invoiceNumber}
                                </span>
                                <button
                                  onClick={() => handleCopyInvoice(order.invoiceNumber)}
                                  className="p-1 rounded text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-all"
                                  title="Salin No. Invoice"
                                >
                                  {isCopied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-[#71717A] mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{dateFormatted}</span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex flex-col items-end">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Belum dibayar
                              </span>
                            </div>
                          </div>

                          {/* Instruction Callout */}
                          <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-2.5 text-xs text-[#92400E]">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                            <div className="flex-1 space-y-1">
                              <p className="font-medium leading-snug">
                                Selesaikan pembayaran melalui admin WA
                              </p>
                              <p className="text-[11px] text-[#B45309] leading-tight">
                                Pesanan Anda sudah masuk ke sistem. Hubungi admin untuk konfirmasi pembayaran & pengiriman file desain.
                              </p>
                            </div>
                          </div>

                          {/* Quick Action Button: Chat Admin WA */}
                          <a
                            href={order.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold shadow-sm active:scale-[0.98] transition-all"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Konfirmasi / Bayar via WhatsApp Admin</span>
                          </a>
                        </div>

                        {/* Order Summary & Products Preview */}
                        <div className="p-4 space-y-3 bg-[#FAFAF9]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#71717A]">Total Pembayaran</span>
                            <span className="text-sm font-bold text-[#E8590C] font-mono">
                              Rp {order.total.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E7E5E4]">
                            <button
                              onClick={() => toggleExpand(order.invoiceNumber)}
                              className="flex items-center gap-1 text-[#52525B] hover:text-[#18181B] font-medium transition-colors"
                            >
                              <span>Detail {order.cartItems.length} Produk</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <span className="text-[11px] text-[#71717A]">
                              {order.isShipping ? "Dikirim ke alamat" : "Ambil di toko"}
                            </span>
                          </div>

                          {/* Collapsible Item Details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden pt-2 space-y-2"
                              >
                                <div className="space-y-2 border-t border-[#E7E5E4] pt-2">
                                  {order.cartItems.map((item, idx) => {
                                    const caseName = item.caseVariant
                                      ? caseVariants.find((c) => c.code === item.caseVariant)?.name || item.caseVariant
                                      : null;

                                    return (
                                      <div
                                        key={idx}
                                        className="p-2.5 rounded-lg bg-white border border-[#E7E5E4] text-xs space-y-1"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="font-semibold text-[#18181B] leading-tight">
                                            {item.name}
                                          </span>
                                          <span className="font-mono text-[#52525B] whitespace-nowrap">
                                            {item.quantity} × Rp {item.appliedPrice.toLocaleString("id-ID")}
                                          </span>
                                        </div>

                                        {/* Variants summary */}
                                        <div className="flex flex-wrap gap-1 pt-0.5 text-[10px] text-[#71717A]">
                                          {item.modelCode && (
                                            <span className="px-1.5 py-0.5 rounded bg-[#F4F4F5] border border-[#E4E4E7]">
                                              Model: {item.modelCode}
                                            </span>
                                          )}
                                          {caseName && (
                                            <span className="px-1.5 py-0.5 rounded bg-[#F4F4F5] border border-[#E4E4E7]">
                                              Casing: {caseName}
                                            </span>
                                          )}
                                          {item.laminationVariant && (
                                            <span className="px-1.5 py-0.5 rounded bg-[#F4F4F5] border border-[#E4E4E7]">
                                              Laminasi: {item.laminationVariant}
                                            </span>
                                          )}
                                          {item.width && item.height && (
                                            <span className="px-1.5 py-0.5 rounded bg-[#F4F4F5] border border-[#E4E4E7]">
                                              {item.width}m × {item.height}m
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex justify-between items-center text-[11px] text-[#71717A] pt-1 border-t border-[#F4F4F5]">
                                          <span>Subtotal</span>
                                          <span className="font-semibold text-[#18181B] font-mono">
                                            Rp {(item.appliedPrice * item.quantity).toLocaleString("id-ID")}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Delivery & Notes Info */}
                                <div className="space-y-1.5 pt-2 text-[11px] text-[#71717A] bg-white p-2.5 rounded-lg border border-[#E7E5E4]">
                                  <div className="flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#A1A1AA] flex-shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Pengiriman:</strong> {order.address}
                                    </span>
                                  </div>
                                  {order.instansi && order.instansi !== "-" && (
                                    <div className="flex items-start gap-1.5">
                                      <Building className="w-3.5 h-3.5 text-[#A1A1AA] flex-shrink-0 mt-0.5" />
                                      <span>
                                        <strong>Instansi / Brand:</strong> {order.instansi}
                                      </span>
                                    </div>
                                  )}
                                  {order.designNote && (
                                    <div className="text-[11px] pt-1 text-[#52525B]">
                                      <strong>Catatan:</strong> {order.designNote}
                                    </div>
                                  )}
                                  {order.promoCode && (
                                    <div className="text-[11px] text-emerald-600 font-medium">
                                      Diskon Promo ({order.promoCode}): -Rp {order.promoDiscount.toLocaleString("id-ID")}
                                    </div>
                                  )}
                                </div>

                                {/* Guidance footer for changing order */}
                                <p className="text-[10px] text-[#71717A] italic leading-tight px-1">
                                  * Jika Anda ingin mengubah atau membatalkan pesanan, silakan hubungi WhatsApp Admin dengan menyertakan Nomor Invoice di atas.
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-white border-t border-[#E7E5E4] flex items-center justify-between text-xs text-[#71717A]">
                <span>Toko Tidurlah • Riwayat Lokal</span>
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F4F4F5] text-[#18181B] font-medium hover:bg-[#E4E4E7] transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
