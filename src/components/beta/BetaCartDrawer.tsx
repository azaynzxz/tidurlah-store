import React, { useState, useEffect } from "react";
import { X, Trash2, Minus, Plus, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem, OrderData } from "@/types/product";
import { caseVariants } from "@/constants";
import { calculateTotal, calculateTotalSavings, calculateTotalDiscount, handlePromoCodeChange } from "@/utils/cart";
import { submitWebsiteOrder } from "@/utils/api";

interface BetaCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  products: any;
}

export const BetaCartDrawer: React.FC<BetaCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  setCartItems,
  products,
}) => {
  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Checkout form states
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instansi, setInstansi] = useState("");
  const [designNote, setDesignNote] = useState("");
  const [isShipping, setIsShipping] = useState(false);
  const [address, setAddress] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Price calculations
  const total = calculateTotal(cartItems, promoCode);
  const totalSavings = calculateTotalSavings(cartItems);
  const totalDiscount = calculateTotalDiscount(cartItems, promoCode);

  // Cart item manipulation
  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) {
      removeItem(index);
      return;
    }
    setCartItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: newQty };
      return copy;
    });
  };

  const removeItem = (index: number) => {
    const item = cartItems[index];
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    toast.info(`${item.name} dihapus dari keranjang`);
  };

  // Promo code validation
  const applyPromo = () => {
    if (!promoCode.trim()) return;
    handlePromoCodeChange(
      promoCode,
      cartItems,
      setPromoCode,
      setPromoError,
      setPromoDiscount
    );
  };

  // Checkout submission
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Keranjang belanja masih kosong.");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Silakan masukkan nama pemesan.");
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      toast.error("Silakan masukkan nomor WhatsApp yang valid.");
      return;
    }
    if (isShipping && !address.trim()) {
      toast.error("Silakan masukkan alamat pengiriman.");
      return;
    }

    const orderData: OrderData = {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerName,
      phoneNumber,
      instansi: instansi || "-",
      promoCode,
      promoDiscount,
      total,
      subtotal: total + totalDiscount,
      isShipping,
      address: isShipping ? address : "Ambil di toko",
      designNote,
      requestJasaDesain: false,
      isExpressPrint: false,
      cartItems,
    };

    setIsSubmitting(true);
    try {
      await submitWebsiteOrder(orderData);

      const productList = cartItems
        .map((item) => {
          let str = `• ${item.name} (${item.quantity} pcs) - Rp ${(item.appliedPrice * item.quantity).toLocaleString("id-ID")}`;
          if (item.modelCode) str += `\n   Model: ${item.modelCode}`;
          if (item.caseVariant) {
            const caseName = caseVariants.find((c) => c.code === item.caseVariant)?.name || item.caseVariant;
            str += `\n   Casing: ${caseName}`;
          }
          if (item.laminationVariant) str += `\n   Laminasi: ${item.laminationVariant}`;
          if (item.width && item.height) str += `\n   Ukuran: ${item.width}m × ${item.height}m`;
          return str;
        })
        .join("\n");

      const message = `Halo Tidurlah Store, saya ingin konfirmasi pesanan:
No. Invoice: ${orderData.invoiceNumber}
Nama: ${customerName}
WhatsApp: ${phoneNumber}
Instansi/Brand: ${instansi || "-"}
Metode: ${isShipping ? `Kirim ke alamat: ${address}` : "Ambil langsung di toko"}
${designNote ? `Catatan Desain: ${designNote}\n` : ""}${promoCode ? `Kode Promo: ${promoCode} (Hemat Rp ${promoDiscount.toLocaleString("id-ID")})\n` : ""}
Detail Pesanan:
${productList}

Total Pembayaran: Rp ${total.toLocaleString("id-ID")}`;

      const whatsappUrl = `https://wa.me/6285172157808?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      toast.success("Pesanan berhasil diproses, menghubungkan ke WhatsApp...");
      setCartItems([]);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - dims and blurs concurrently with the drawer from t=0 */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            style={{ willChange: "opacity" }}
            className="fixed inset-0 bg-[#18181B]/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Slide-over panel - slides concurrently from t=0 */}
          <div className="fixed inset-y-0 right-0 z-50 max-w-full flex pl-10 pointer-events-none">
            <motion.div
              key="cart-panel"
              initial={{ transform: "translateX(100%)" }}
              animate={{ transform: "translateX(0%)" }}
              exit={{ transform: "translateX(100%)" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              style={{ willChange: "transform" }}
              className="w-screen max-w-md bg-white border-l border-[#E7E5E4] shadow-2xl flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#E7E5E4] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-[#18181B]">Keranjang Belanja</h2>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A]">
                    {cartItems.length} produk
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] active:scale-90 transition-all"
                  aria-label="Tutup keranjang"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <p className="text-sm font-medium text-[#18181B]">Keranjang Anda kosong</p>
                    <p className="text-xs text-[#71717A] max-w-xs mx-auto">
                      Pilih produk percetakan atau merchandise dari katalog untuk memulai pemesanan.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18181B] text-white text-xs font-medium hover:bg-[#27272A] active:scale-[0.98] transition-all"
                    >
                      Lihat Katalog Produk
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Items List */}
                    <div className="divide-y divide-[#F0EFEB]">
                      <AnimatePresence initial={false}>
                        {cartItems.map((item, index) => {
                          const caseName = item.caseVariant
                            ? caseVariants.find((c) => c.code === item.caseVariant)?.name || item.caseVariant
                            : null;

                          return (
                            <motion.div
                              key={`${item.id}-${index}`}
                              initial={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                              className="py-3.5 first:pt-0 last:pb-0"
                            >
                              <div className="flex gap-3 items-start">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-14 h-14 object-cover rounded-lg bg-[#F5F5F4] border border-[#E7E5E4] flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xs font-semibold text-[#18181B] truncate">
                                    {item.name}
                                  </h3>

                            {/* Option tags */}
                            <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-[#71717A]">
                              {item.width && item.height && (
                                <span className="bg-[#F5F5F4] px-1.5 py-0.5 rounded">
                                  {item.width}m × {item.height}m
                                </span>
                              )}
                              {item.modelCode && (
                                <span className="bg-[#F5F5F4] px-1.5 py-0.5 rounded">
                                  Model: {item.modelCode}
                                </span>
                              )}
                              {caseName && (
                                <span className="bg-[#F5F5F4] px-1.5 py-0.5 rounded">
                                  Casing: {caseName}
                                </span>
                              )}
                              {item.laminationVariant && (
                                <span className="bg-[#F5F5F4] px-1.5 py-0.5 rounded">
                                  Laminasi: {item.laminationVariant}
                                </span>
                              )}
                            </div>

                            {/* Price & Stepper */}
                            <div className="flex items-center justify-between mt-2.5">
                              <span className="font-mono text-xs font-semibold text-[#18181B]">
                                Rp {(item.appliedPrice * item.quantity).toLocaleString("id-ID")}
                              </span>

                              <div className="flex items-center gap-2">
                                <div className="inline-flex items-center border border-[#E7E5E4] rounded-md bg-white">
                                  <button
                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                    className="p-1 text-[#71717A] hover:text-[#18181B] active:scale-90 transition-transform duration-100"
                                    aria-label="Kurangi"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-8 text-center text-xs font-mono font-medium">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                    className="p-1 text-[#71717A] hover:text-[#18181B] active:scale-90 transition-transform duration-100"
                                    aria-label="Tambah"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeItem(index)}
                                  className="p-1 text-[#A1A1AA] hover:text-red-600 active:scale-90 transition-all duration-100"
                                  aria-label="Hapus item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

                {/* Promo Code Section */}
                <div className="p-3.5 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl space-y-2">
                  <label className="text-xs font-semibold text-[#18181B] block">Kode Promo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode promo..."
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-white border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:border-[#E8590C]"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-3 py-1.5 bg-[#18181B] text-white text-xs font-medium rounded-lg hover:bg-[#27272A] transition-colors"
                    >
                      Terapkan
                    </button>
                  </div>
                  {promoDiscount > 0 && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Promo aktif: diskon {promoDiscount}% berhasil diterapkan.
                    </p>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-red-600 font-medium">{promoError}</p>
                  )}
                </div>

                {/* Direct Order Form Details */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-[#18181B]">Data Pemesan</h4>

                  <div>
                    <label className="text-[11px] text-[#71717A] block mb-1">
                      Nama Lengkap <span className="text-[#E8590C]">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full bg-white border border-[#E7E5E4] rounded-lg px-3 py-1.5 text-xs text-[#18181B] focus:outline-none focus:border-[#E8590C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#71717A] block mb-1">
                      Nomor WhatsApp <span className="text-[#E8590C]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full bg-white border border-[#E7E5E4] rounded-lg px-3 py-1.5 text-xs text-[#18181B] focus:outline-none focus:border-[#E8590C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#71717A] block mb-1">
                      Instansi / Perusahaan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={instansi}
                      onChange={(e) => setInstansi(e.target.value)}
                      placeholder="Nama kantor, universitas, atau organisasi"
                      className="w-full bg-white border border-[#E7E5E4] rounded-lg px-3 py-1.5 text-xs text-[#18181B] focus:outline-none focus:border-[#E8590C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#71717A] block mb-1">
                      Link Desain / Catatan Khusus (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={designNote}
                      onChange={(e) => setDesignNote(e.target.value)}
                      placeholder="Sertakan link Google Drive file desain atau instruksi cetak..."
                      className="w-full bg-white border border-[#E7E5E4] rounded-lg px-3 py-1.5 text-xs text-[#18181B] focus:outline-none focus:border-[#E8590C] resize-none"
                    />
                  </div>

                  {/* Delivery Mode Toggle */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs text-[#18181B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isShipping}
                        onChange={(e) => setIsShipping(e.target.checked)}
                        className="rounded border-[#E7E5E4] text-[#E8590C] focus:ring-[#E8590C]"
                      />
                      <span>Kirim ke Alamat (Bukan ambil di tempat)</span>
                    </label>

                    {isShipping && (
                      <div className="mt-2">
                        <textarea
                          rows={2}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Alamat lengkap penerima beserta kecamatan & kota..."
                          className="w-full bg-white border border-[#E7E5E4] rounded-lg px-3 py-1.5 text-xs text-[#18181B] focus:outline-none focus:border-[#E8590C] resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & CTA */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-[#E7E5E4] bg-[#FAFAF9] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#71717A]">
                  <span>Subtotal</span>
                  <span className="font-mono">Rp {(total + totalDiscount).toLocaleString("id-ID")}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Diskon Grosir</span>
                    <span className="font-mono">- Rp {totalSavings.toLocaleString("id-ID")}</span>
                  </div>
                )}
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Diskon Promo</span>
                    <span className="font-mono">- Rp {totalDiscount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E7E5E4] flex justify-between text-sm font-bold text-[#18181B]">
                  <span>Total Pembayaran</span>
                  <span className="font-mono text-base">Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-[#E8590C] hover:bg-[#d04f0a] active:scale-[0.98] disabled:opacity-60 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{isSubmitting ? "Menyiapkan Pesanan..." : "Lanjut Pemesanan ke WhatsApp"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#71717A]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pesanan akan dikonfirmasi langsung oleh tim percetakan.</span>
              </div>
            </div>
          )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
