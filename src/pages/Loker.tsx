import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Clock,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Share2,
  ArrowRight,
  Search,
  RotateCcw,
  Sparkles,
  Users,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/common/SEO";
import PublicHeader from "@/components/common/PublicHeader";
import { BetaFooter } from "@/components/beta/BetaFooter";
import { BlogSpecTable, BlogCallout, BlogSpecItem } from "@/components/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ApplyButton from "@/components/ApplyButton";
import { SITE_ORIGIN } from "@/utils/productSeo";

interface Job {
  id: string;
  title: string;
  location: string;
  workHours: string;
  education: string;
  workType: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits?: string[];
  isAvailable: boolean;
}

const jobs: Job[] = [
  {
    id: "desainer-grafis",
    title: "Desainer Grafis",
    location: "Remote (Work from Home)",
    workHours: "8 jam/hari (09.00 - 17.00 WIB)",
    education: "SMA/SMK Sederajat",
    workType: "Remote",
    description: "Posisi ini bertanggung jawab untuk seluruh kebutuhan layout desain cetak dan print media di Tidurlah Store, khususnya ID Card PVC, Lanyard Sublimasi, Plakat Akrilik, dan Merchandise. Posisi bekerja secara remote dari rumah.",
    responsibilities: [
      "Membuat layout desain ID Card PVC dan merchandise custom (gantungan kunci akrilik, mug sublimasi, tumbler, banner promosi).",
      "Menyiapkan, memeriksa resolusi, dan menyelaraskan file desain dari pelanggan agar siap masuk antrean cetak mesin.",
      "Membuat mockup visual 2D/3D produk untuk persetujuan (ACC) pelanggan sebelum proses produksi.",
      "Berkolaborasi aktif dengan tim admin dan operator mesin untuk memastikan presisi warna dan margin potong."
    ],
    qualifications: [
      "Portofolio desain yang menunjukkan keahlian layout design kuat dan rapi (wajib dilampirkan).",
      "Memahami color theory untuk kebutuhan cetak digital dan konversi warna RGB ke CMYK.",
      "Mahir mengoperasikan software grafis seperti CorelDRAW, Adobe Illustrator, Canva, atau Photoshop.",
      "Disiplin, teliti, komunikatif, dan terbiasa bekerja sesuai target tenggat waktu (deadline).",
      "Memiliki perangkat laptop/PC kerja pribadi dan koneksi internet yang stabil untuk koordinasi remote."
    ],
    isAvailable: true
  },
  {
    id: "admin-toko",
    title: "Admin Toko & Layanan Pelanggan",
    location: "Bandar Lampung (Workshop Belwis)",
    workHours: "8 jam/hari (09.00 - 17.00 WIB)",
    education: "SMA/SMK Sederajat",
    workType: "Full-time",
    description: "Posisi ini bertanggung jawab mengelola komunikasi pelanggan melalui WhatsApp dan media sosial, menginput data pesanan, menyusun invoice resmi, dan berkoordinasi dengan tim produksi.",
    responsibilities: [
      "Merespons pesan konsultasi, DM, dan chat pemesanan pelanggan dengan ramah, cepat, dan solutif.",
      "Mencatat serta merekapitulasi data pesanan harian ke dalam sistem database toko.",
      "Berkoordinasi dengan divisi produksi terkait jadwal antrean pesanan reguler dan express.",
      "Melakukan pengecekan ketersediaan bahan baku (PVC, pita lanyard, casing, dan packaging)."
    ],
    qualifications: [
      "Teliti, terorganisir, dan memiliki kemampuan administrasi dokumen yang rapi.",
      "Keterampilan komunikasi interpersonal yang santun dan profesional.",
      "Terbiasa menggunakan WhatsApp Business, Instagram, serta aplikasi spreadsheet (Google Sheets / Excel).",
      "Jujur, bertanggung jawab, dan bersedia bekerja secara langsung (on-site) di workshop Bandar Lampung."
    ],
    isAvailable: false
  },
  {
    id: "bagian-produksi",
    title: "Operator Mesin & Bagian Produksi",
    location: "Bandar Lampung (Workshop Belwis)",
    workHours: "8 jam/hari (09.00 - 17.00 WIB)",
    education: "SMA/SMK Sederajat",
    workType: "Full-time",
    description: "Posisi inti di lini produksi yang bertanggung jawab mengoperasikan mesin cetak digital, mesin heat-press sublimasi, mesin pemotong kartu plong, serta pengemasan produk dengan standar quality control ketat.",
    responsibilities: [
      "Mengoperasikan mesin cetak kartu PVC, mesin press lanyard, dan mesin die-cut potong plong (disediakan pelatihan kerja).",
      "Melakukan inspeksi quality control menyeluruh pada setiap produk sebelum masuk ke tahap pengemasan.",
      "Mengemas (packing) pesanan pelanggan secara rapi, aman, dan menyertakan kartu garansi resmi.",
      "Menjaga kebersihan dan perawatan berkala seluruh peralatan mesin di area workshop."
    ],
    qualifications: [
      "Sangat teliti, gesit, dan memiliki perhatian tinggi terhadap detail kerapian fisik produk.",
      "Memiliki kemauan belajar yang kuat untuk menguasai operasional mesin percetakan digital.",
      "Dapat bekerja sama dalam tim dan terbiasa dengan ritme kerja berorientasi target waktu.",
      "Fisik sehat, jujur, rajin, dan berdomisili di wilayah Bandar Lampung atau sekitarnya."
    ],
    isAvailable: false
  },
  {
    id: "reseller",
    title: "Program Kemitraan Reseller & Afiliasi",
    location: "Fleksibel (Remote / Seluruh Indonesia)",
    workHours: "Fleksibel (Tanpa Ikatan Jam Kerja)",
    education: "Terbuka untuk Semua Jenjang",
    workType: "Kemitraan Komisi",
    description: "Raih penghasilan tambahan tanpa modal awal dengan menjadi mitra resmi penjualan ID Card, Lanyard, dan merchandise custom Tidurlah Grafika. Sangat cocok bagi mahasiswa, panitia organisasi, freelancer, maupun pelaku usaha kreatif.",
    responsibilities: [
      "Mempromosikan portofolio dan katalog produk cetak Tidurlah Grafika kepada relasi kampus, komunitas, sekolah, atau instansi.",
      "Menjembatani komunikasi kebutuhan spesifikasi pesanan antara calon pelanggan dan tim admin kami.",
      "Membantu pengumpulan file data mentah nama dan foto peserta dari pelanggan.",
      "Memberikan informasi spesifikasi dan estimasi harga grosir yang akurat sesuai panduan katalog."
    ],
    qualifications: [
      "Memiliki smartphone dan akses internet aktif.",
      "Aktif di media sosial (WhatsApp, Instagram, TikTok, LinkedIn, dll.) atau memiliki jaringan komunitas luas.",
      "Komunikatif, ramah, dan memiliki motivasi wirausaha yang tinggi.",
      "Tidak memerlukan modal awal maupun kewajiban stok fisik barang di rumah."
    ],
    benefits: [
      "Komisi Menarik: Peroleh komisi 10% – 15% dari setiap nilai transaksi pesanan yang berhasil diselesaikan.",
      "Akses Harga Reseller: Dapatkan harga pokok khusus untuk dijual kembali dengan margin keuntungan Anda sendiri.",
      "Bonus Target Bulanan: Reward insentif tambahan untuk pencapaian kuantitas pesanan tertentu setiap bulan.",
      "Materi Promosi Gratis: Disediakan materi desain konten promosi digital siap posting untuk media sosial Anda.",
      "Pencairan Cepat: Sistem transfer komisi langsung setelah transaksi pesanan selesai dan diverifikasi.",
      "Tanpa Target Minimum: Bebas berjualan kapan saja sesuai kapasitas dan waktu luang Anda."
    ],
    isAvailable: true
  }
];

export default function Loker() {
  const navigate = useNavigate();
  const { jobSlug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.workType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && job.isAvailable) ||
      (statusFilter === "closed" && !job.isAvailable);

    return matchesSearch && matchesStatus;
  });

  // Render Job Detail View if slug is in URL
  if (jobSlug) {
    const job = jobs.find((j) => j.id === jobSlug);
    if (!job) {
      navigate("/loker", { replace: true });
      return null;
    }
    return <JobDetailView job={job} />;
  }

  const pageUrl = `${SITE_ORIGIN}/loker`;
  const availableCount = jobs.filter((j) => j.isAvailable).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      <SEO
        title="Karir & Lowongan Kerja - Bergabung Bersama Tim Percetakan"
        description="Temukan peluang karir dan kemitraan di Tidurlah Grafika. Posisi Desainer Grafis Remote, Operator Produksi, Admin Toko, dan Program Reseller di Bandar Lampung."
        keywords="loker lampung, lowongan kerja percetakan lampung, karir desainer grafis remote, lowongan kerja bandar lampung, reseller merchandise"
        url={pageUrl}
      />

      {/* Shared Clean Navigation Header */}
      <PublicHeader sectionName="Karir" sectionHref="/loker" />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-10 sm:space-y-12">
        
        {/* Editorial Hero Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono font-medium">
              Peluang Karir & Kemitraan
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-mono">
              {availableCount} Posisi Terbuka
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Karir di Tidurlah Grafika
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Bergabunglah bersama tim kreatif kami dalam membangun standar percetakan digital modern yang efisien dan berkualitas tinggi di Lampung. Kami mencari individu yang teliti, bersemangat, dan berorientasi pada kepuasan pelanggan.
          </p>
        </div>

        {/* Culture Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-muted text-foreground">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                Fleksibilitas Kerja
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pilihan kerja remote (Work from Home) untuk tim kreatif dan kemitraan mandiri tanpa keterikatan jam kerja kaku.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-muted text-foreground">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                Pengembangan Skill
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pelatihan teknis pengoperasian mesin cetak digital offset, teknik sublimasi modern, dan manajemen layout pra-cetak.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-muted text-foreground">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                Budaya Terbuka
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Komunikasi langsung, suasana kerja suportif, dan apresiasi nyata terhadap kontribusi inovasi setiap anggota tim.
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari posisi pekerjaan atau keahlian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-card"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="h-9 text-xs"
            >
              Semua Posisi
            </Button>
            <Button
              type="button"
              variant={statusFilter === "available" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("available")}
              className="h-9 text-xs"
            >
              Membuka Lamaran ({availableCount})
            </Button>
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "instant" });
                  navigate(`/loker/${job.id}`);
                }}
                className="rounded-lg border border-border bg-card p-5 sm:p-6 hover:border-foreground/30 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:underline">
                        {job.title}
                      </h2>
                      {job.isAvailable ? (
                        <Badge variant="default" className="text-[11px] gap-1 font-normal">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Membuka Lamaran</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] gap-1 font-normal text-muted-foreground">
                          <XCircle className="w-3 h-3" />
                          <span>Posisi Terisi</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{job.workType}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {job.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-foreground" />
                      <span>{job.workHours}</span>
                    </span>
                    <span className="hidden sm:flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-foreground" />
                      <span>{job.education}</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-medium text-foreground group-hover:underline">
                    <span>Lihat Rincian & Syarat</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-border bg-card p-12 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Tidak Ada Lowongan yang Cocok
                </h3>
                <p className="text-xs text-muted-foreground">
                  Coba gunakan kata kunci pencarian yang berbeda atau reset filter status.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </Button>
            </div>
          )}
        </div>

        {/* General Career CTA */}
        <BlogCallout variant="info" title="Punya Pertanyaan Seputar Karir?">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Jika posisi yang Anda cari belum tersedia saat ini, Anda tetap dapat mengirimkan CV dan resume umum Anda ke database talenta kami di <strong>hrd@idcardlampung.com</strong>.
            </p>
          </div>
        </BlogCallout>

      </main>

      {/* Standard Minimalist Footer */}
      <BetaFooter />
    </div>
  );
}

// Job Detail Component
function JobDetailView({ job }: { job: Job }) {
  const navigate = useNavigate();

  const handleShare = async () => {
    const shareUrl = `${SITE_ORIGIN}/loker/${job.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Lowongan Kerja: ${job.title} - Tidurlah Grafika`,
          text: `Peluang karir ${job.title} di Tidurlah Store`,
          url: shareUrl,
        });
      } catch {
        // Dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Tautan lowongan berhasil disalin!");
      } catch {
        toast.error("Gagal menyalin link.");
      }
    }
  };

  const jobSpecs: BlogSpecItem[] = [
    {
      property: "Lokasi Kerja",
      specification: job.location,
      note: job.workType === "Remote" ? "Dapat bekerja dari mana saja (WFH)" : "Penempatan kerja on-site di workshop"
    },
    {
      property: "Jam Kerja",
      specification: job.workHours,
      note: "Pola kerja teratur dengan koordinasi harian"
    },
    {
      property: "Pendidikan Minimum",
      specification: job.education,
      note: "Keahlian praktis dan portofolio lebih diutamakan"
    },
    {
      property: "Tipe Kontrak",
      specification: job.workType,
      note: "Evaluasi kinerja berkala"
    },
    {
      property: "Status Lowongan",
      specification: job.isAvailable ? "Membuka Lamaran Aktif" : "Posisi Telah Terisi",
      note: job.isAvailable ? "Segera kirimkan berkas lamaran Anda" : "Penerimaan lamaran sedang ditutup"
    }
  ];

  const pageUrl = `${SITE_ORIGIN}/loker/${job.id}`;

  const jsonLdJob = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: "2024-01-01",
    employmentType: job.workType === "Remote" ? "FULL_TIME" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "Tidurlah Grafika",
      sameAs: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/Logo id card lampung 1x1 transparan.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bandar Lampung",
        addressRegion: "Lampung",
        addressCountry: "ID",
      },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      <SEO
        title={`${job.title} - Karir & Lowongan Kerja`}
        description={job.description}
        keywords={`loker ${job.title.toLowerCase()}, lowongan kerja ${job.title.toLowerCase()} lampung`}
        url={pageUrl}
        jsonLd={jsonLdJob}
      />

      {/* Shared Clean Navigation Header */}
      <PublicHeader sectionName="Karir" sectionHref="/loker" />

      {/* Main Detail Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/loker" className="hover:text-foreground transition-colors">
            Karir
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-md">
            {job.title}
          </span>
        </nav>

        {/* Position Header Card */}
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {job.isAvailable ? (
                  <Badge variant="default" className="text-xs gap-1 font-normal">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Membuka Lamaran</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs gap-1 font-normal text-muted-foreground">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Posisi Terisi</span>
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs font-normal">
                  {job.workType}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {job.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{job.workHours}</span>
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs shrink-0 self-start"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Posisi</span>
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border/60">
            {job.description}
          </p>
        </div>

        {/* Position Specifications Table */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Spesifikasi & Ketentuan Kerja
          </h2>
          <BlogSpecTable
            caption={`Tabel 1: Rincian spesifikasi posisi ${job.title}`}
            headers={["Parameter", "Keterangan Posisi", "Catatan"]}
            items={jobSpecs}
          />
        </section>

        {/* Responsibilities */}
        <section className="space-y-3 pt-2 border-t border-border">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Tanggung Jawab Utama
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {job.responsibilities.map((resp, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0 mt-2" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Qualifications */}
        <section className="space-y-3 pt-2 border-t border-border">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Kualifikasi yang Dicari
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {job.qualifications.map((qual, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0 mt-2" />
                <span>{qual}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Benefits (for Reseller / Partnerships) */}
        {job.benefits && job.benefits.length > 0 && (
          <section className="space-y-3 pt-2 border-t border-border">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Benefit & Keuntungan Kemitraan
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {job.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0 mt-2" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Requirements Notice Callout */}
        <BlogCallout variant="info" title="Dokumen Berkas yang Diperlukan:">
          <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground leading-relaxed mt-1">
            <li><strong>CV / Resume Lengkap:</strong> Memuat riwayat pendidikan, kontak aktif, dan pengalaman kerja.</li>
            {job.id === "desainer-grafis" && (
              <li>
                <strong>Portofolio Desain (Wajib):</strong> Lampirkan tautan Google Drive / Behance / PDF karya layout cetak (ID card, lanyard, banner).
              </li>
            )}
            <li>Pastikan nomor WhatsApp dan email yang Anda cantumkan aktif untuk proses interview.</li>
          </ul>
        </BlogCallout>

        {/* Application Action Section */}
        <div className="rounded-lg border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-sm sm:text-base text-foreground">
              Tertarik Melamar Posisi {job.title}?
            </h3>
            <p className="text-xs text-muted-foreground">
              {job.isAvailable
                ? "Kirimkan lamaran Anda secara online atau langsung melalui tombol di samping."
                : "Lowongan ini sedang ditutup saat ini. Anda dapat mengirimkan CV umum via email."}
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto flex justify-center">
            <ApplyButton
              posisi={job.title}
              isAvailable={job.isAvailable}
              onShare={handleShare}
            />
          </div>
        </div>

      </main>

      {/* Standard Minimalist Footer */}
      <BetaFooter />
    </div>
  );
}
