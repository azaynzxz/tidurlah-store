import { useState } from "react";
import { Mail } from "lucide-react";
import { BlogSpecTable, BlogCallout, BlogSpecItem } from "@/components/blog";

export default function SponsorshipFormComponent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.institution.trim()) {
      newErrors.institution = "Instansi / Organisasi wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const subject = encodeURIComponent("Permohonan Sponsorship - ID Card Lampung");
    const body = encodeURIComponent(
      `Halo Tim Kerjasama ID Card Lampung,

Nama: ${formData.name}
Email: ${formData.email}
Instansi / Organisasi: ${formData.institution}

Saya ingin mengajukan proposal permohonan kerjasama sponsorship untuk kegiatan kami. Terlampir informasi dan kami siap mendiskusikan peluang kerjasama lebih lanjut.

Terima kasih atas perhatiannya.

Hormat saya,
${formData.name}`
    );

    const email = "partnership@idcardlampung.com";
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;

    setTimeout(() => {
      setFormData({ name: "", email: "", institution: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const benefitSpecs: BlogSpecItem[] = [
    {
      property: "Diskon Biaya Produksi",
      specification: "Potongan harga khusus kepanitiaan dan bundle ID card + lanyard",
      note: "Pencantuman logo resmi pada materi promosi (banner, poster, ID card)"
    },
    {
      property: "Kualitas Standar Industri",
      specification: "Bahan PVC solid setara kartu ATM dan tali tissue sublimasi anti-luntur",
      note: "Tag akun Instagram (@idcardlampung) dan penyebutan sebagai official print partner"
    },
    {
      property: "Jadwal Produksi Prioritas",
      specification: "Waktu pengerjaan disesuaikan dengan timeline kegiatan Anda",
      note: "Dokumentasi foto penggunaan merchandise resmi saat event berlangsung"
    }
  ];

  const termsSpecs: BlogSpecItem[] = [
    {
      property: "Waktu Pengajuan",
      specification: "Minimal 2 minggu sebelum hari H kegiatan",
      note: "Hindari permohonan mendadak (< 1 minggu)"
    },
    {
      property: "Dokumen Proposal",
      specification: "Proposal resmi mencantumkan target audiens, jumlah peserta, & benefit",
      note: "Hindari proposal tanpa profil acara yang jelas"
    },
    {
      property: "Narahubung Resmi",
      specification: "Kontak penanggung jawab sponsorship (WhatsApp & email aktif)",
      note: "Komunikasi wajib transparan dan profesional"
    },
    {
      property: "Komitmen Produksi",
      specification: "Konfirmasi kuantitas dan file desain final tepat waktu",
      note: "Tidak dapat membatalkan sepihak setelah produksi dimulai"
    }
  ];

  return (
    <div className="space-y-8 text-foreground font-sans">
      {/* Intro */}
      <div className="space-y-2">
        <p className="text-base text-muted-foreground leading-relaxed">
          Tidurlah Grafika (ID Card Lampung) membuka peluang kerjasama sponsorship dan media partner untuk event kampus, organisasi mahasiswa, komunitas kreatif, dan institusi di wilayah Lampung dan sekitarnya.
        </p>
      </div>

      {/* Program Concept Callout */}
      <BlogCallout variant="info" title="Bentuk Kerjasama Sponsorship:">
        Sponsorship berupa dukungan pemotongan biaya produksi cetak (diskon khusus kepanitiaan), paket bundle lanyard & ID card, atau merchandise official event dengan timbal balik eksposur media promosi dan penempatan logo pada publikasi acara.
      </BlogCallout>

      {/* Benefits Table */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Matriks Benefit & Timbal Balik Kerjasama
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Kolaborasi saling menguntungkan antara kepanitiaan event dan Tidurlah Grafika:
        </p>

        <BlogSpecTable
          caption="Tabel 1: Rincian dukungan sponsorship dan bentuk publikasi kemitraan"
          headers={["Bentuk Dukungan", "Benefit untuk Acara Anda", "Timbal Balik untuk Kami"]}
          items={benefitSpecs}
        />
      </section>

      {/* Terms & Conditions Table */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Ketentuan Pengajuan Sponsorship
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Panduan kelayakan proposal kegiatan sebelum diajukan ke tim kurasi:
        </p>

        <BlogSpecTable
          caption="Tabel 2: Parameter kelayakan proposal sponsorship"
          headers={["Aspek Kerjasama", "Standar yang Diharapkan", "Hal yang Dihindari"]}
          items={termsSpecs}
        />
      </section>

      {/* Curating Notice */}
      <BlogCallout variant="default" title="Proses Kurasi Proposal:">
        Review proposal sponsorship memakan waktu 2–3 hari kerja. Tim kami akan menghubungi narahubung terdaftar melalui WhatsApp atau email untuk konfirmasi persetujuan paket sponsorship yang disetujui.
      </BlogCallout>

      {/* Sponsorship Form */}
      <section className="rounded-lg border border-border bg-card p-6 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Form Pengajuan Sponsorship
          </h2>
          <p className="text-xs text-muted-foreground">
            Kirim data ringkas kegiatan Anda. Form ini akan otomatis membuka email untuk pengiriman proposal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-medium text-foreground">
              Nama Lengkap Narahubung *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full rounded-md border bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors ${
                errors.name ? "border-destructive" : "border-input"
              }`}
              placeholder="Contoh: Budi Santoso"
            />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium text-foreground">
              Alamat Email Aktif *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full rounded-md border bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors ${
                errors.email ? "border-destructive" : "border-input"
              }`}
              placeholder="email@instansi.ac.id"
            />
            {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="institution" className="block text-xs font-medium text-foreground">
              Instansi / Himpunan / Komunitas *
            </label>
            <input
              type="text"
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
              className={`w-full rounded-md border bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors ${
                errors.institution ? "border-destructive" : "border-input"
              }`}
              placeholder="Contoh: HIMA TI ITERA / Panitia Seminar Nasional"
            />
            {errors.institution && <p className="text-[11px] text-destructive">{errors.institution}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Menyiapkan Email..." : "Kirim Pengajuan via Email"}
            </button>
          </div>
        </form>
      </section>

      {/* Direct Contact */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Punya proposal dalam format PDF? Kirimkan langsung ke email resmi sponsorship:
        </p>
        <a
          href="mailto:partnership@idcardlampung.com"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>partnership@idcardlampung.com</span>
        </a>
      </div>
    </div>
  );
}
