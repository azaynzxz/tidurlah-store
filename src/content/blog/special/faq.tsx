import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { BlogPostData } from "../index";
import { BlogCallout } from "@/components/blog";

function FaqContent() {
  const productFaqs = [
    {
      q: "Berapa ukuran standar cetak ID Card dan Lanyard?",
      a: "Ukuran standar ID Card PVC adalah 54 mm × 86 mm (standar ISO 7810 ID-1 setara kartu ATM/KTP) dengan ketebalan 0.76 mm. Tali lanyard memiliki panjang total 90 cm (±45 cm saat terpasang) dengan pilihan lebar 2.0 cm atau 2.5 cm."
    },
    {
      q: "Apa saja jenis ID card yang tersedia di Tidurlah Store?",
      a: "Kami menyediakan ID Card PVC Standar (cetak 1 atau 2 sisi), ID Card Ketebalan Khusus, Kartu Member Barcode/QR, Kartu Akses RFID Proximity (125 kHz), Mifare (13.56 MHz), hingga custom E-Money/Flazz."
    },
    {
      q: "Apakah bisa memesan cetak ID Card dan Lanyard tanpa minimal order?",
      a: "Bisa! Kami melayani pemesanan satuan (mulai 1 pcs) hingga ribuan pcs. Untuk pesanan dalam jumlah banyak, berlaku harga diskon grosir bertingkat secara otomatis."
    },
    {
      q: "Bahan apa yang digunakan untuk tali lanyard?",
      a: "Tali lanyard dicetak menggunakan metode transfer paper sublimasi pada bahan tisu (polyester tissue halus) yang tidak mudah brudul, warna tajam tahan air, dan nyaman tidak gatal di leher."
    },
    {
      q: "Pilihan casing dan aksesoris ID Card apa saja yang tersedia?",
      a: "Tersedia card holder plastik doff satu sisi, casing transparan bening dua sisi, casing silikon lentur, jepit buaya, yoyo gantungan putar, hingga stopper klik lepas-pasang."
    }
  ];

  const orderFaqs = [
    {
      q: "Bagaimana alur pemesanan secara online?",
      a: "Pilih produk dan kuantitas di etalase website kami, tambahkan ke keranjang belanja, lengkapi data kontak dan lampirkan link Google Drive/Canva file desain Anda, lalu klik 'Lanjut ke WhatsApp' untuk konfirmasi invoice dan pembayaran."
    },
    {
      q: "Berapa lama estimasi pengerjaan pesanan?",
      a: "Pengerjaan standar memakan waktu 1–3 hari kerja tergantung jumlah antrean pesanan. Kami juga menyediakan layanan Cetak Kilat / Express untuk kebutuhan acara mendadak."
    },
    {
      q: "Apakah melayani pengiriman ke luar Bandar Lampung?",
      a: "Ya, kami melayani pengiriman ke seluruh wilayah Lampung (Metro, Pringsewu, Pesawaran, Lampung Selatan, dll.) dan seluruh Indonesia via JNE, J&T, SiCepat, atau kargo."
    },
    {
      q: "Metode pembayaran apa saja yang didukung?",
      a: "Kami menerima transfer bank resmi (BCA, Mandiri, BRI, BNI), QRIS, dan e-wallet (GoPay, OVO, Dana)."
    }
  ];

  const serviceFaqs = [
    {
      q: "Bagaimana jika saya belum memiliki file desain siap cetak?",
      a: "Tim desainer in-house kami siap membantu setting tata letak, pemasangan logo, dan penyesuaian ukuran dengan biaya jasa desain terjangkau."
    },
    {
      q: "Apakah ada garansi jika hasil cetak salah atau cacat produksi?",
      a: "Ada. Kami memberikan garansi cetak ulang 100% atau penggantian barang jika terjadi kesalahan produksi dari pihak kami, seperti warna pudar atau hasil potong tidak presisi."
    }
  ];

  return (
    <div className="space-y-8 text-foreground font-sans">
      <div className="space-y-2">
        <p className="text-base text-muted-foreground leading-relaxed">
          Temukan jawaban atas pertanyaan teknis seputar spesifikasi produk, minimal order, estimasi waktu produksi, dan pengiriman di Tidurlah Grafika.
        </p>
      </div>

      {/* Product Section Accordion */}
      <section className="space-y-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Spesifikasi Produk & Bahan
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {productFaqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`prod-${idx}`}>
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Ordering Section Accordion */}
      <section className="space-y-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Pemesanan & Pembayaran
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {orderFaqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`order-${idx}`}>
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Services Section Accordion */}
      <section className="space-y-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Layanan Desain & Garansi
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {serviceFaqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`srv-${idx}`}>
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <BlogCallout variant="info" title="Punya Pertanyaan Spesifik Lainnya?">
        Jika pertanyaan atau kebutuhan custom cetak Anda belum terjawab di atas, tim customer service kami siap berkonsultasi via WhatsApp untuk memberikan solusi terbaik.
      </BlogCallout>
    </div>
  );
}

export const blogPost: BlogPostData = {
  id: 17,
  slug: "faq-pertanyaan-umum",
  title: "Pertanyaan yang Sering Diajukan (FAQ)",
  subtitle: "Panduan lengkap seputar spesifikasi ID card, tali lanyard, minimal order, dan estimasi waktu produksi",
  author: "ID Card Lampung",
  date: "2024-02-01",
  tags: ["FAQ", "Bantuan", "ID Card", "Lanyard", "Panduan"],
  readTime: "4 menit",
  views: 680,
  image: "/blog-thumbnail/2_result.webp",
  category: "special",
  content: FaqContent,
  relatedProducts: ["ID Card & Lanyard", "Merchandise"]
};
