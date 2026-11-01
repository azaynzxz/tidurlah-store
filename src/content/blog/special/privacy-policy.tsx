import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { BlogPostData } from "../index";
import { BlogSpecTable, BlogCallout, BlogSpecItem } from "@/components/blog";

function PrivacyPolicyContent() {
  const dataCategories: BlogSpecItem[] = [
    {
      property: "Identitas & Kontak",
      specification: "Nama pemesan, institusi, alamat email, dan nomor WhatsApp aktif",
      note: "Digunakan untuk konfirmasi pesanan, bukti invoice, dan status produksi"
    },
    {
      property: "Alamat Pengiriman",
      specification: "Alamat fisik lengkap atau pilihan pengambilan mandiri (workshop pickup)",
      note: "Diteruskan ke kurir logistik (JNE, J&T, SiCepat) untuk keperluan pengiriman"
    },
    {
      property: "File & Data Personalisasi",
      specification: "Desain kartu, foto individu, nomor induk (NISN/NIP), dan QR Code",
      note: "Hanya diakses operator mesin cetak saat proses produksi berlangsung"
    },
    {
      property: "Riwayat Transaksi",
      specification: "Daftar produk, jumlah pcs, tanggal pesanan, dan bukti transfer pembayaran",
      note: "Disimpan secara aman untuk keperluan pembukuan dan verifikasi klaim garansi"
    }
  ];

  const sections = [
    {
      id: "keamanan-info",
      title: "Keamanan & Batas Penyimpanan File Desain",
      content: (
        <p className="text-xs text-muted-foreground leading-relaxed">
          File desain cetak Anda disimpan di penyimpanan terenkripsi dengan pembatasan hak akses ketat. File mentah dapat dihapus secara permanen dari server penyimpanan kami atas permintaan tertulis pelanggan setelah barang selesai diterima dan tidak ada klaim retur.
        </p>
      )
    },
    {
      id: "berbagi-info",
      title: "Perlindungan & Larangan Penjualan Data",
      content: (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Kami berkomitmen tidak pernah menjual, menyewakan, atau menyebarluaskan data pribadi atau database foto/nama pelanggan kepada pihak ketiga mana pun di luar kebutuhan pengiriman ekspedisi logistik atau instruksi resmi kewajiban hukum.
        </p>
      )
    },
    {
      id: "hak-pelanggan",
      title: "Hak Pelanggan atas Akses & Penghapusan Data",
      content: (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Anda berhak memperbarui data kontak yang tersimpan di sistem kami, meminta penghapusan database file desain pasca produksi, atau menolak penerimaan pesan promosi berkala kapan saja.
        </p>
      )
    }
  ];

  return (
    <div className="space-y-6 text-foreground font-sans">
      <div className="space-y-2">
        <p className="text-base text-muted-foreground leading-relaxed">
          Tidurlah Grafika (ID Card Lampung) berkomitmen penuh menjaga kerahasiaan dan keamanan data pribadi serta file dokumen identitas pelanggan yang dipercayakan kepada kami.
        </p>
      </div>

      {/* Data Category Table */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Kategori Informasi yang Kami Kelola
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Rincian jenis data yang dikumpulkan selama proses transaksi dan tujuannya:
        </p>

        <BlogSpecTable
          caption="Tabel 1: Matriks jenis data dan tujuan penggunaan di Tidurlah Grafika"
          headers={["Kategori Data", "Rincian Informasi", "Tujuan Operasional"]}
          items={dataCategories}
        />
      </section>

      {/* Policy Details Accordion */}
      <section className="space-y-3 pt-4 border-t border-border">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Ketentuan Perlindungan & Hak Pelanggan
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

      <BlogCallout variant="info" title="Permintaan Penghapusan File Desain:">
        Setelah pesanan Anda selesai diterima dengan baik, Anda dapat mengajukan permohonan penghapusan arsip file desain kartu dan spreadsheet data melalui email resmi support kami di support@idcardlampung.com.
      </BlogCallout>
    </div>
  );
}

export const blogPost: BlogPostData = {
  id: 16,
  slug: "kebijakan-privasi",
  title: "Kebijakan Privasi & Perlindungan Data",
  subtitle: "Komitmen perlindungan data pribadi dan kerahasiaan file desain pelanggan Tidurlah Grafika",
  author: "Tidurlah Grafika",
  date: "2024-01-30",
  tags: ["Kebijakan", "Privasi", "Keamanan", "Informasi", "Perlindungan"],
  readTime: "4 menit",
  views: 450,
  image: "/blog-thumbnail/2_result.webp",
  category: "special",
  content: PrivacyPolicyContent,
  relatedProducts: []
};
