import { BlogPostData } from "../index";
import { BlogSpecTable, BlogSteps, BlogCallout, BlogSpecItem, BlogStepItem } from "@/components/blog";

function SmaArRaihanCaseStudyContent() {
  const projectSummary: BlogSpecItem[] = [
    {
      property: "Mitra / Klien",
      specification: "SMA IT Ar-Raihan Bandar Lampung",
      note: "Salah satu sekolah Islam terpadu terkemuka di Kota Bandar Lampung"
    },
    {
      property: "Produk Dipesan",
      specification: "ID Card PVC Solid + Tali Lanyard Sublimasi 2 cm",
      note: "Digunakan sebagai kartu pelajar resmi, kartu perpustakaan, & kartu akses"
    },
    {
      property: "Kuantitas Produksi",
      specification: "500+ Set Lengkap",
      note: "Distribusi untuk seluruh peserta didik baru dan dewan guru"
    },
    {
      property: "Aksesoris Tambahan",
      specification: "Card Holder Bening + Kaitan Nikel Anti-Karat",
      note: "Pelindung kartu awet dan nyaman digunakan aktivitas harian"
    },
    {
      property: "Waktu Pengerjaan",
      specification: "3 Hari Kerja",
      note: "Selesai 100% sebelum tahun ajaran baru (MOS / MPLS) dimulai"
    }
  ];

  const workflowSteps: BlogStepItem[] = [
    {
      title: "Konsultasi & Finalisasi Desain Kartu",
      description: "Tim desainer Tidurlah Grafika berkoordinasi langsung dengan pihak kesiswaan SMA Ar-Raihan untuk memadukan identitas modern dan nilai Islami sekolah. Kami memastikan layout foto, resolusi logo, dan nomor induk siswa (NISN) terformat presisi.",
      tip: "Penyusunan database nama dan foto dilakukan menggunakan format spreadsheet standar agar tidak terjadi kekeliruan data siswa."
    },
    {
      title: "Pemilihan Material PVC Tebal & Lanyard Tissue Halus",
      description: "Untuk menunjang aktivitas siswa yang dinamis, kami merekomendasikan kartu PVC solid 0.76 mm anti-air serta tali lanyard printing sublimasi berbahan polyester tissue yang lembut dan tidak membuat gatal di leher.",
      tip: "Bahan sublimasi menjamin logo sekolah pada lanyard tidak akan terkelupas meski sering dicuci."
    },
    {
      title: "Produksi Cepat & Quality Control Berlapis",
      description: "Dengan alur kerja mesin cetak digital offset berkecepatan tinggi, seluruh 500+ set pesanan berhasil diselesaikan tepat waktu. Setiap kartu melalui proses inspeksi ketajaman warna, presisi pemotongan plong sudut oval, dan kelengkapan aksesoris sebelum dikemas rapi.",
    }
  ];

  return (
    <div className="space-y-8 text-foreground font-sans">
      <div className="space-y-3">
        <p className="text-base text-muted-foreground leading-relaxed">
          Setiap proyek cetak memiliki tantangan tersendiri, terutama pesanan institusi perdana dalam jumlah besar. Tidurlah Grafika (ID Card Lampung) merasa terhormat dipercaya oleh salah satu institusi pendidikan Islam terpadu unggulan di Lampung, SMA IT Ar-Raihan Bandar Lampung, untuk memproduksi lebih dari 500 set kartu identitas pelajar dan tali lanyard resmi.
        </p>
      </div>

      {/* Project Overview Table */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Ringkasan Proyek Pengadaan
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Rincian spesifikasi pengadaan kartu identitas siswa SMA IT Ar-Raihan:
        </p>

        <BlogSpecTable
          caption="Tabel 1: Spesifikasi teknis proyek pengadaan ID Card & Lanyard SMA IT Ar-Raihan"
          headers={["Parameter Proyek", "Rincian Spesifikasi", "Keterangan"]}
          items={projectSummary}
        />
      </section>

      {/* Challenges & Needs */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Tantangan & Kebutuhan Sekolah
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pihak sekolah membutuhkan ID Card yang tidak sekadar berfungsi sebagai penanda kehadiran, melainkan harus mencerminkan identitas sekolah yang rapi, profesional, dan membanggakan siswa. Kualitas cetak harus tajam, warna logo sekolah harus akurat sesuai standar brand guideline yayasan, serta bahan lanyard wajib nyaman dipakai berjam-jam selama proses belajar-mengajar.
        </p>
      </section>

      {/* Production Workflow */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Alur Kerja & Solusi Produksi
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Langkah sistematis yang kami terapkan untuk menjamin pesanan selesai tepat waktu tanpa kompromi kualitas:
        </p>

        <BlogSteps steps={workflowSteps} />
      </section>

      {/* Result & Client Satisfaction */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Hasil & Dampak
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Seluruh 500+ set ID Card dan tali lanyard diserahkan tepat pada jadwal yang disepakati. Pihak manajemen sekolah menyampaikan apresiasi tinggi terhadap kejernihan hasil cetak dan kenyamanan bahan lanyard saat dibagikan kepada para siswa di awal pekan orientasi.
        </p>

        <BlogCallout variant="success" title="Komitmen Layanan Institusi:">
          Studi kasus ini menegaskan komitmen Tidurlah Grafika dalam melayani kebutuhan cetak skala institusi dan korporat di Lampung dengan harga kompetitif, pengerjaan tepat waktu, dan garansi cetak ulang tanpa biaya tambahan.
        </BlogCallout>
      </section>
    </div>
  );
}

export const blogPost: BlogPostData = {
  id: 1,
  slug: "pengalaman-cetak-perdana-sma-ar-raihan-bandar-lampung",
  title: "Pengalaman Cetak Perdana: Kisah di Balik Produksi 500+ ID Card & Lanyard untuk SMA Ar-Raihan Bandar Lampung",
  subtitle: "Tantangan dan proses di balik pesanan perdana dalam jumlah besar dari salah satu sekolah Islam terpadu terbaik di Lampung",
  author: "ID Card Lampung",
  date: "2024-01-20",
  tags: ["Sekolah", "ID Card", "Lanyard", "Studi Kasus", "Pendidikan"],
  readTime: "6 menit",
  views: 1450,
  image: "/blog-thumbnail/1_result.webp",
  category: "case-studies",
  content: SmaArRaihanCaseStudyContent,
  relatedProducts: ["ID Card & Lanyard"]
};
