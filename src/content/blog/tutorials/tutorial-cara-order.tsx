import { BlogPostData } from "../index";
import { BlogSteps, BlogCallout, BlogStepItem } from "@/components/blog";

function TutorialCaraOrderContent() {
  const steps: BlogStepItem[] = [
    {
      title: "Pilih Produk di Etalase",
      description: "Telusuri katalog produk cetak seperti ID Card PVC, Tali Lanyard Sublimasi, Stiker, Plakat Akrilik, atau Banner. Klik kartu produk untuk membuka detail harga dan spesifikasi lengkap.",
      tip: "Tersedia filter kategori di bagian atas katalog untuk memudahkan pencarian."
    },
    {
      title: "Pilih Model & Varian",
      description: "Sesuaikan spesifikasi kebutuhan Anda, seperti tipe casing kartu (casing bening, transparan, silikon lentur), ukuran lebar tali lanyard (2.0 cm atau 2.5 cm), atau jenis laminasi stiker (Glossy / Doff).",
      tip: "Beberapa produk mewajibkan pemilihan varian sebelum dapat dimasukkan ke keranjang."
    },
    {
      title: "Tentukan Jumlah (Qty)",
      description: "Masukkan total kebutuhan cetak. Sistem menghitung harga diskon grosir secara instan — semakin banyak kuantitas pesanan Anda, semakin hemat biaya cetak per satuannya.",
      tip: "Periksa tabel harga bertingkat pada halaman produk untuk melihat batas minimum diskon grosir."
    },
    {
      title: "Tambahkan ke Keranjang",
      description: "Klik tombol 'Tambahkan ke Keranjang'. Anda dapat melanjutkan memilih produk perlengkapan acara lainnya atau langsung membuka drawer keranjang untuk checkout.",
    },
    {
      title: "Review Keranjang Belanja",
      description: "Periksa ringkasan pesanan, varian pilihan, dan total nominal. Anda dapat memasukkan kode promo jika memiliki voucher event, KKN, atau program sponsorship.",
    },
    {
      title: "Lengkapi Data Pemesan & Link Desain",
      description: "Masukkan nama lengkap, nomor WhatsApp aktif, alamat pengiriman atau opsi pickup di workshop, serta lampirkan link Google Drive / Canva file desain Anda.",
      tip: "Pastikan link Google Drive atau Canva sudah dibuka aksesnya ke 'Public' agar tim produksi dapat langsung mengunduh file."
    },
    {
      title: "Pilih Layanan Tambahan (Opsional)",
      description: "Tersedia pilihan Jasa Express jika Anda membutuhkan pesanan selesai di hari yang sama, atau layanan Jasa Desain jika Anda belum memiliki file siap cetak.",
    },
    {
      title: "Konfirmasi Pesanan via WhatsApp",
      description: "Klik 'Lanjut ke WhatsApp'. Format invoice dan rincian pesanan otomatis terisi ke chat WhatsApp admin kami untuk verifikasi kesiapan file dan pembayaran.",
      tip: "Admin kami memverifikasi resolusi file desain sebelum pesanan dinaikkan ke mesin cetak."
    }
  ];

  return (
    <div className="space-y-8 text-foreground font-sans">
      {/* Video Tutorial Container */}
      <div className="rounded-lg border border-border overflow-hidden bg-card p-4 sm:p-5">
        <h2 className="text-base font-semibold text-foreground mb-3 text-center tracking-tight">
          Video Panduan Alur Pemesanan
        </h2>
        <div className="max-w-2xl mx-auto">
          {/* Mobile: Vertical aspect ratio */}
          <div className="relative w-full md:hidden rounded-md overflow-hidden border border-border" style={{ paddingBottom: "177.78%", height: 0 }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/H6JlqiVTXZQ?si=efV2B9xtQl5r4IsU"
              title="Tutorial Cara Order di TIDURLAH STORE"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          {/* Desktop: Horizontal 16:9 ratio */}
          <div className="hidden md:block relative w-full rounded-md overflow-hidden border border-border" style={{ paddingBottom: "56.25%", height: 0 }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/H6JlqiVTXZQ?si=efV2B9xtQl5r4IsU"
              title="Tutorial Cara Order di TIDURLAH STORE"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Tonton video di atas untuk melihat demonstrasi alur pemesanan dari katalog hingga pesan terkirim ke WhatsApp.
        </p>
      </div>

      {/* Sequential Steps Section */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Langkah-Langkah Pemesanan Online
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ikuti alur belanja mandiri yang cepat dan praktis melalui sistem checkout otomatis kami:
        </p>

        <BlogSteps steps={steps} />
      </section>

      {/* Tips Callout */}
      <BlogCallout variant="info" title="Tips Mempercepat Verifikasi & Pengerjaan Pesanan:">
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground leading-relaxed mt-1">
          <li>Pastikan link Google Drive atau Canva diatur ke akses <strong>&quot;Siapa saja yang memiliki link dapat melihat (Public)&quot;</strong>.</li>
          <li>Kirim file desain dengan resolusi minimal 300 DPI dalam format PDF, AI, CDR, atau TIFF kurva outline agar hasil cetak tajam.</li>
          <li>Untuk pesanan dalam jumlah besar (&gt;100 pcs), diskusikan jadwal deadline acara Anda dengan admin kami agar kami jadwalkan di slot antrean prioritas.</li>
        </ul>
      </BlogCallout>
    </div>
  );
}

export const blogPost: BlogPostData = {
  id: 13,
  slug: "tutorial-cara-order",
  title: "Tutorial Cara Order di TIDURLAH STORE",
  subtitle: "Panduan lengkap cara memesan produk ID Card, Lanyard, dan merchandise custom di website kami",
  author: "ID Card Lampung",
  date: "2024-01-26",
  tags: ["Tutorial", "Cara Order", "Panduan", "ID Card", "Lanyard"],
  readTime: "5 menit",
  views: 2000,
  image: "/blog-thumbnail/cara-order.gif",
  category: "tutorials",
  content: TutorialCaraOrderContent,
  relatedProducts: ["ID Card & Lanyard", "Stiker & Label", "Plakat & Trophy"]
};
