import { BlogPostData } from "../index";
import { Crown, Shield, Trophy, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { BlogCallout } from "@/components/blog";

const packageRows = [
  {
    item: "Lanyard 2 Sisi",
    silver: { regular: "20k", promo: "19k" },
    gold: { regular: "20k", promo: "18k" },
    platinum: { regular: "20k", promo: "17k" },
  },
  {
    item: "Lanyard 1 Sisi",
    silver: { regular: "17k", promo: "16k" },
    gold: { regular: "17k", promo: "16k" },
    platinum: { regular: "17k", promo: "15k" },
  },
  {
    item: "Stiker A3+",
    silver: { promo: "15k" },
    gold: { promo: "13k" },
    platinum: { promo: "15k (Bonus 1 lbr)" },
  },
  {
    item: "Gantungan Kunci Akrilik",
    silver: { promo: "9k / pcs" },
    gold: { promo: "8k / pcs" },
    platinum: { promo: "7k / pcs" },
  },
  {
    item: "Tumbler Custom",
    silver: { promo: "27k / pcs" },
    gold: { promo: "25k / pcs" },
    platinum: { promo: "24k (Bonus 1 pcs)" },
  },
  {
    item: "Mug Keramik Custom",
    silver: { promo: "28k / pcs" },
    gold: { promo: "26k / pcs" },
    platinum: { promo: "25k / pcs" },
  },
  {
    item: "Plakat Akrilik",
    silver: { regular: "130k", promo: "120k" },
    gold: { regular: "130k", promo: "105k" },
    platinum: { promo: "130k (Bonus 1 pcs)" },
  },
  {
    item: "Banner Promosi (Spanduk)",
    silver: { promo: "20k / m" },
    gold: { promo: "20k (Bonus 1 m)" },
    platinum: { promo: "20k (Bonus 3 m)" },
  },
];

const EasterPromoContent = () => {
  return (
    <div className="space-y-8 text-foreground font-sans">
      {/* Intro Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Paket Sponsorship Event Kampus & Komunitas
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pilih paket yang paling sesuai dengan kebutuhan kepanitiaan Anda. Nikmati potongan biaya cetak, bonus merchandise eksklusif, dan jaminan selesai tepat waktu.
        </p>
      </div>

      {/* Pricing Table */}
      <div className="my-6 rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-1/4 text-xs font-semibold text-foreground py-3 px-4 border-r border-border">
                Item Paket
              </TableHead>
              <TableHead className="w-1/4 text-center py-3 px-3 border-r border-border">
                <div className="flex items-center justify-center gap-1.5 font-bold text-foreground text-xs">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>Silver</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-normal mt-0.5">1 – 49 pcs</div>
              </TableHead>
              <TableHead className="w-1/4 text-center py-3 px-3 border-r border-border bg-muted/20">
                <div className="flex items-center justify-center gap-1.5 font-bold text-foreground text-xs">
                  <Trophy className="w-4 h-4 text-foreground" />
                  <span>Gold (Favorit)</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-normal mt-0.5">50 – 100 pcs</div>
              </TableHead>
              <TableHead className="w-1/4 text-center py-3 px-3 bg-muted/50">
                <div className="flex items-center justify-center gap-1.5 font-bold text-foreground text-xs">
                  <Crown className="w-4 h-4 text-foreground" />
                  <span>Platinum</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-normal mt-0.5">101 – 150+ pcs</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packageRows.map((row, idx) => (
              <TableRow key={idx} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-foreground py-2.5 px-4 text-xs border-r border-border">
                  {row.item}
                </TableCell>
                <TableCell className="text-center py-2.5 px-3 text-xs border-r border-border">
                  {row.silver.regular && (
                    <span className="text-muted-foreground line-through mr-1.5">{row.silver.regular}</span>
                  )}
                  <span className="font-semibold text-foreground">{row.silver.promo}</span>
                </TableCell>
                <TableCell className="text-center py-2.5 px-3 text-xs border-r border-border bg-muted/10">
                  {row.gold.regular && (
                    <span className="text-muted-foreground line-through mr-1.5">{row.gold.regular}</span>
                  )}
                  <span className="font-semibold text-foreground">{row.gold.promo}</span>
                </TableCell>
                <TableCell className="text-center py-2.5 px-3 text-xs bg-muted/20">
                  {row.platinum.regular && (
                    <span className="text-muted-foreground line-through mr-1.5">{row.platinum.regular}</span>
                  )}
                  <span className="font-semibold text-foreground">{row.platinum.promo}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Syarat & Ketentuan Sponsorship */}
      <section className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-base font-semibold text-foreground">
          Ketentuan & Timbal Balik Kerjasama
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2 p-3 rounded-md border border-border bg-card">
            <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
            <span>Penyebutan nama brand oleh MC pada saat pembukaan dan penutupan acara.</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-md border border-border bg-card">
            <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
            <span>Follow dan tag akun media sosial resmi Tidurlah Grafika (@idcardlampung).</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-md border border-border bg-card">
            <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
            <span>Pencantuman logo resmi pada materi publikasi cetak (banner, spanduk, atau ID Card).</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-md border border-border bg-card">
            <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
            <span>Pengiriman foto dokumentasi penggunaan merchandise saat kegiatan berlangsung.</span>
          </div>
        </div>
      </section>

      {/* Action Prompt */}
      <BlogCallout variant="info" title="Tertarik Mengajukan Kerjasama Sponsorship?">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Hubungi perwakilan tim kemitraan kami untuk memverifikasi tanggal kegiatan kepanitiaan Anda dan ketersediaan kuota paket sponsorship.
          </p>
          <a
            href="https://wa.me/6285172157808?text=Halo%20Tidurlah%20Grafika,%20saya%20ingin%20mengajukan%20proposal%20sponsorship%20event."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            Konsultasi Sponsorship via WhatsApp
          </a>
        </div>
      </BlogCallout>
    </div>
  );
};

export const blogPost: BlogPostData = {
  id: 21,
  slug: "easter-2026",
  title: "Promo Spesial Sponsorship Event & Kampus",
  subtitle: "Penawaran menarik Paket Silver, Gold, dan Platinum khusus event kampus/komunitas dengan bonus merchandise",
  author: "ID Card Lampung",
  date: "2024-04-02",
  tags: ["Promo", "Sponsorship", "Event", "Merchandise", "ID Card"],
  readTime: "3 menit",
  views: 0,
  image: "/blog-thumbnail/easter-promo.png",
  category: "special",
  content: EasterPromoContent,
  relatedProducts: ["ID Card & Lanyard", "Stiker & Label", "Tumbler Custom"]
};
