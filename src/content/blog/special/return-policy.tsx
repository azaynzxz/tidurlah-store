import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { BlogPostData } from "../index";
import { BlogSpecTable, BlogCallout, BlogSpecItem } from "@/components/blog";

function ReturnPolicyContent() {
  const warrantyCoverage: BlogSpecItem[] = [
    {
      property: "Cacat Cetak / Mesin",
      specification: "Garis tinta bergeser, bercak tinta, atau kartu patah saat diterima",
      note: "Garansi Cetak Ulang 100% Gratis"
    },
    {
      property: "Salah Ukuran / Potong",
      specification: "Ukuran fisik tidak sesuai spesifikasi pesanan (contoh: margin potong meleset)",
      note: "Garansi Cetak Ulang 100% Gratis"
    },
    {
      property: "Ketidaksesuaian File ACC",
      specification: "Hasil cetak berbeda dari mockup / file final yang telah disetujui pelanggan",
      note: "Garansi Cetak Ulang 100% Gratis"
    },
    {
      property: "Kekurangan Jumlah Qty",
      specification: "Jumlah fisik yang diterima kurang dari total invoice pesanan",
      note: "Pengiriman susulan gratis atau refund selisih"
    },
    {
      property: "Typo Dari File Pelanggan",
      specification: "Kesalahan ejaan nama/nomor yang sudah ada pada file mentah dari pemesan",
      note: "Di luar cakupan garansi retur"
    },
    {
      property: "File Asal Pecah (<150 DPI)",
      specification: "Gambar buram akibat resolusi rendah yang tetap disetujui pemesan untuk dicetak",
      note: "Di luar cakupan garansi retur"
    }
  ];

  const sections = [
    {
      id: "claim-period",
      title: "Batas Waktu & Prosedur Pengajuan Klaim",
      content: (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Klaim garansi atau komplain kekurangan barang wajib disampaikan maksimal dalam waktu <strong>2 × 24 jam</strong> sejak paket diterima (berdasarkan status tracking ekspedisi) dengan menyertakan video unboxing utuh dan foto detail cacat produk ke WhatsApp customer service kami.
        </p>
      )
    },
    {
      id: "resolution",
      title: "Solusi Garansi & Biaya Pengiriman",
      content: (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Jika klaim terverifikasi sebagai kelalaian produksi pihak kami, Tidurlah Grafika akan segera mencetak ulang produk yang rusak secara <strong>GRATIS 100%</strong> dan mengirimkannya ke alamat Anda tanpa biaya ongkos kirim tambahan.
        </p>
      )
    },
    {
      id: "cancellation",
      title: "Kebijakan Pembatalan Pesanan",
      content: (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pesanan custom printing yang telah masuk ke antrean cetak mesin atau telah dicetak tidak dapat dibatalkan secara sepihak, karena bahan baku dan pelat cetak telah dipersonalisasi khusus sesuai data pemesan.
        </p>
      )
    }
  ];

  return (
    <div className="space-y-6 text-foreground font-sans">
      <div className="space-y-2">
        <p className="text-base text-muted-foreground leading-relaxed">
          Tidurlah Grafika mengutamakan kepuasan dan ketenangan berbelanja Anda. Seluruh produk kami didukung oleh garansi cetak ulang jika terjadi ketidaksesuaian spesifikasi atau cacat produksi.
        </p>
      </div>

      {/* Warranty Matrix Table */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Matriks Cakupan Garansi & Retur
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tabel acuan verifikasi klaim garansi untuk produk ID Card, Lanyard, dan merchandise:
        </p>

        <BlogSpecTable
          caption="Tabel 1: Rincian kondisi klaim garansi cetak ulang Tidurlah Grafika"
          headers={["Jenis Kasus", "Indikator Kondisi", "Ketentuan Solusi"]}
          items={warrantyCoverage}
        />
      </section>

      {/* Additional Accordion Details */}
      <section className="space-y-3 pt-4 border-t border-border">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Prosedur & Ketentuan Tambahan
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {sections.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline hover:text-primary">
                {item.title}
              </AccordionTrigger>
              <AccordionContent>
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <BlogCallout variant="info" title="Butuh Bantuan Klaim Garansi?">
        Hubungi tim customer service kami melalui WhatsApp dengan menyertakan nomor invoice dan lampiran video unboxing agar penanganan cetak ulang dapat segera diproses prioritas.
      </BlogCallout>
    </div>
  );
}

export const blogPost: BlogPostData = {
  id: 18,
  slug: "syarat-ketentuan-pengembalian",
  title: "Syarat & Ketentuan Pengembalian serta Garansi Cetak",
  subtitle: "Ketentuan garansi cetak ulang dan pengembalian barang untuk kepuasan pelanggan Tidurlah Grafika",
  author: "ID Card Lampung",
  date: "2024-02-02",
  tags: ["Kebijakan", "Pengembalian", "Syarat", "Ketentuan", "Garansi"],
  readTime: "4 menit",
  views: 320,
  image: "/blog-thumbnail/3_result.webp",
  category: "special",
  content: ReturnPolicyContent,
  relatedProducts: []
};
