import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  Send,
  MessageSquare,
  Navigation,
  HelpCircle,
} from "lucide-react";
import { BetaHeader } from "@/components/beta/BetaHeader";
import { BetaFooter } from "@/components/beta/BetaFooter";
import SEO from "@/components/common/SEO";
import { WhatsAppFloatingButton } from "@/components/common/WhatsAppFloatingButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const INQUIRY_CATEGORIES = [
  "Konsultasi Cetak ID Card & Lanyard",
  "Konfirmasi Pengambilan di Toko (Pickup)",
  "Permintaan Penawaran / SPK Resmi",
  "Tanya Status Desain & Produksi",
  "Pertanyaan Umum Lainnya",
];

export const Spotlight: React.FC = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState(INQUIRY_CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const addressText =
    "Perumahan Pemda (Belwis), Way Hui, Kec. Jati Agung, Kabupaten Lampung Selatan, Lampung 35365";

  const handleCopyAddress = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(addressText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = addressText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address", err);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedMessage = [
      "Halo Admin ID Card Lampung, saya ingin berkonsultasi:",
      `Nama: ${name.trim()}`,
      phone.trim() ? `WhatsApp / Kontak: ${phone.trim()}` : "",
      `Keperluan: ${category}`,
      message.trim() ? `\nPesan / Catatan:\n${message.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const waUrl = `https://wa.me/6285172157808?text=${encodeURIComponent(formattedMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary/20 selection:text-primary">
      <SEO
        title="Hubungi Kami & Layanan Pelanggan - ID Card Lampung"
        description="ID Card Terdekat Premium Lampung - Kirim pesan langsung ke tim customer service kami atau kunjungi workshop fisik di Way Hui, Lampung Selatan."
        keywords="kontak id card lampung, whatsapp id card lampung, alamat percetakan lampung, pickup id card lampung"
      />

      {/* Header */}
      <BetaHeader showSearchBar={false} />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8 sm:gap-10">
        {/* Navigation & Page Intro */}
        <div className="flex flex-col gap-2.5">
          <div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground -ml-2 mb-1"
            >
              <a href="/">
                <ArrowLeft className="mr-1.5 size-4" />
                Kembali ke Katalog
              </a>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
              Bantuan & Layanan
            </Badge>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-medium">
              ID Card Lampung
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Hubungi Customer Service
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl leading-relaxed">
            Punya pertanyaan mengenai spesifikasi produk, kebutuhan tender, atau konfirmasi
            pengambilan pesanan? Isi form di bawah untuk langsung terhubung dengan admin kami.
          </p>
        </div>

        {/* 2-Column: Interactive Form (Left 7 cols) & Quick Actions (Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <MessageSquare className="size-4 text-primary" />
                    Kirim Pesan Cepat
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground">Respons Langsung via WA</span>
                </div>
                <CardDescription className="text-xs">
                  Pesan Anda akan otomatis diformat dan diteruskan ke WhatsApp resmi kami.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
                  {/* Nama */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-name" className="text-xs font-medium">
                      Nama Lengkap / Instansi <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contact-name"
                      required
                      placeholder="Contoh: Budi Santoso (Universitas Lampung)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-xs sm:text-sm h-9"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-phone" className="text-xs font-medium">
                      Nomor WhatsApp Anda
                    </Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="Contoh: 08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-xs sm:text-sm h-9"
                    />
                  </div>

                  {/* Kategori Keperluan */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium">Kategori Keperluan</Label>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {INQUIRY_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`text-[11px] sm:text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                            category === cat
                              ? "bg-foreground text-background border-foreground font-medium shadow-2xs"
                              : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pesan */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="contact-message" className="text-xs font-medium">
                      Pesan atau Detail Pertanyaan
                    </Label>
                    <Textarea
                      id="contact-message"
                      rows={3}
                      placeholder="Tuliskan jumlah pcs, ukuran, atau pertanyaan yang ingin Anda konsultasikan..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="text-xs sm:text-sm resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium text-xs sm:text-sm h-10 mt-1 gap-2 shadow-xs"
                  >
                    <Send className="size-4" />
                    Hubungi Admin via WhatsApp
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Direct Quick Action Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Direct WhatsApp Card */}
            <Card className="border-border shadow-2xs">
              <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Phone className="size-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-foreground">
                        WhatsApp Customer Service
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        +62 851-7215-7808
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px]">
                    Online
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full text-xs h-8 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
                >
                  <a
                    href="https://wa.me/6285172157808?text=Halo%20Admin%20ID%20Card%20Lampung%2C%20saya%20ingin%20konsultasi%20pemesanan."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat WhatsApp Langsung
                    <ExternalLink className="ml-1.5 size-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Store Pickup & Directions Card */}
            <Card className="border-border shadow-2xs">
              <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="size-8 rounded-lg bg-orange-50 text-[#E8590C] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="size-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-foreground">
                      Workshop & Pengambilan di Toko
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {addressText}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs h-8 text-foreground gap-1.5"
                  >
                    <a
                      href="https://maps.app.goo.gl/XVJYoKbzU5FRwVuJA"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="size-3" />
                      Petunjuk Arah
                      <ExternalLink className="size-2.5" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="text-xs h-8 border border-border gap-1.5"
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Salin Alamat</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Jam Operasional & Email */}
            <Card className="border-border shadow-2xs bg-muted/30">
              <CardContent className="p-4 sm:p-5 flex flex-col gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Clock className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-foreground">Jam Kerja Workshop</span>
                    <span className="text-muted-foreground block text-[11px] mt-0.5">
                      Senin – Sabtu: 08.00 – 17.30 WIB
                    </span>
                    <span className="text-muted-foreground block text-[11px]">
                      Minggu: Tutup (Order web tetap diterima)
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">cs@idcardlampung.com</span>
                  </div>
                  <a
                    href="mailto:cs@idcardlampung.com"
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5"
                  >
                    Kirim Email
                    <ExternalLink className="size-2.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section: Pertanyaan Umum (Mobile-Friendly Compact FAQ) */}
        <div className="pt-2 border-t border-border flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-4 text-muted-foreground" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full flex flex-col gap-2">
            <AccordionItem value="faq-1" className="border rounded-xl px-4 py-0 bg-card shadow-2xs">
              <AccordionTrigger className="text-left text-xs sm:text-sm font-medium py-3 hover:no-underline gap-3 [&>svg]:size-4">
                Apakah bisa pesan ID Card atau lanyard satuan tanpa minimum order?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-0 pb-3">
                Bisa. Kami melayani pemesanan mulai dari 1 pcs tanpa minimum order, hingga pesanan
                skala ribuan pcs untuk instansi dan event dengan harga grosir bertingkat.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="border rounded-xl px-4 py-0 bg-card shadow-2xs">
              <AccordionTrigger className="text-left text-xs sm:text-sm font-medium py-3 hover:no-underline gap-3 [&>svg]:size-4">
                Bagaimana cara mengambil pesanan langsung di toko (pickup)?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-0 pb-3">
                Saat status pesanan siap diinformasikan oleh CS, Anda bisa datang langsung ke
                workshop kami di Way Hui pada jam operasional (Senin – Sabtu, 08.00 – 17.30 WIB)
                dengan menunjukkan nomor invoice pesanan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="border rounded-xl px-4 py-0 bg-card shadow-2xs">
              <AccordionTrigger className="text-left text-xs sm:text-sm font-medium py-3 hover:no-underline gap-3 [&>svg]:size-4">
                Bagaimana jika saya belum memiliki file desain siap cetak?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-0 pb-3">
                Tim desainer kami siap membantu menata layout file cetak Anda. Cukup kirimkan logo,
                data teks, atau referensi warna melalui WhatsApp.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="border rounded-xl px-4 py-0 bg-card shadow-2xs">
              <AccordionTrigger className="text-left text-xs sm:text-sm font-medium py-3 hover:no-underline gap-3 [&>svg]:size-4">
                Apakah melayani pengiriman ke luar kota Bandar Lampung?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-0 pb-3">
                Ya, kami mengirim ke seluruh daerah di Lampung serta seluruh Indonesia melalui
                ekspedisi kargo (JNE, J&T, SiCepat, Indah Kargo) atau kurir instan lokal.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>

      {/* Clean Minimal Footer (Zero Duplicate Contacts & Maps on /hello) */}
      <BetaFooter variant="minimal" />

      {/* Floating WhatsApp FAB */}
      <WhatsAppFloatingButton />
    </div>
  );
};

export default Spotlight;
