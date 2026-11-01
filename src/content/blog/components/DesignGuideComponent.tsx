import { BlogSpecTable, BlogSpecItem } from "@/components/blog";

export default function DesignGuideComponent() {
  const idCardSpecs: BlogSpecItem[] = [
    {
      property: "Ukuran Jadi Kartu",
      specification: "54 mm × 86 mm",
      note: "Standar ISO 7810 ID-1 (setara KTP / kartu ATM)"
    },
    {
      property: "Ukuran Desain (Bleed)",
      specification: "56 mm × 88 mm",
      note: "Tambahkan bleed 1–2 mm per sisi untuk mencegah garis putih saat die-cut"
    },
    {
      property: "Batas Aman (Safe Zone)",
      specification: "48 mm × 80 mm",
      note: "Jarak teks & barcode minimal 3 mm dari tepi garis potong jadi"
    },
    {
      property: "Ketebalan Bahan",
      specification: "0.76 mm – 0.8 mm",
      note: "PVC solid standar perbankan / instansi kedap air"
    },
    {
      property: "Resolusi Gambar",
      specification: "300 DPI (Skala 1:1)",
      note: "Foto wajah & QR code tidak buram atau pecah"
    },
    {
      property: "Mode Warna",
      specification: "CMYK",
      note: "Hindari RGB agar warna hasil cetak konsisten dengan monitor"
    }
  ];

  const lanyardSpecs: BlogSpecItem[] = [
    {
      property: "Panjang Pola Cetak",
      specification: "90 cm total",
      note: "Panjang keliling (sekitar 45 cm saat terpasang mengalung di leher)"
    },
    {
      property: "Pilihan Lebar Pita",
      specification: "2.0 cm atau 2.5 cm",
      note: "2.0 cm standar populer kepanitiaan; 2.5 cm premium eksekutif"
    },
    {
      property: "Batas Aman Desain",
      specification: "Minimal 2 mm dari tepi",
      note: "Beri jarak aman atas & bawah pita agar tidak terpotong jahitan"
    },
    {
      property: "Area Lipatan & Stopper",
      specification: "5 cm ujung bawah",
      note: "Hindari logo utama di 5 cm terbawah karena tertutup kaitan besi / stopper"
    },
    {
      property: "Metode & Bahan",
      specification: "Sublimasi Full Color",
      note: "Bahan polyester tissue halus, 2 sisi bolak-balik, tahan cuci"
    }
  ];

  const mugSpecs: BlogSpecItem[] = [
    {
      property: "Area Cetak Maksimal",
      specification: "20 cm × 8.5 cm",
      note: "Format melingkar horizontal pada bodi mug keramik 11 oz"
    },
    {
      property: "Jarak Aman Handle",
      specification: "Minimal 2 – 2.5 cm",
      note: "Margin kosong di sisi kiri dan kanan pangkal gagang mug"
    },
    {
      property: "Resolusi File",
      specification: "Minimal 300 DPI",
      note: "Format TIFF, PDF, atau PNG transparan untuk ketajaman foto"
    }
  ];

  const tumblerSpecs: BlogSpecItem[] = [
    {
      property: "Grafir Laser Logam",
      specification: "Vektor 1 Warna (Hitam-Putih)",
      note: "File wajib berupa AI, EPS, CDR, atau PDF kurva tanpa efek gradasi"
    },
    {
      property: "Print UV Flatbed",
      specification: "Full Color (CMYK + White Ink)",
      note: "Area cetak satu sisi 4 cm × 12 cm atau keliling sesuai tipe tumbler"
    },
    {
      property: "Resolusi File UV",
      specification: "Minimal 300 DPI",
      note: "Format PNG transparan resolusi tinggi atau PDF vector"
    }
  ];

  const prePressChecklist: BlogSpecItem[] = [
    {
      property: "Format File Disukai",
      specification: "PDF (Press Quality), AI, CDR, TIFF, PNG",
      note: "Hindari file kompresi rendah dari media sosial / screenshot"
    },
    {
      property: "Font / Typography",
      specification: "Convert to Curves / Outlines",
      note: "Wajib di-convert agar huruf tidak hilang / bergeser saat diproses"
    },
    {
      property: "Profil Warna",
      specification: "CMYK 8-Bit",
      note: "Warna digital RGB akan otomatis dikonversi ke palet CMYK mesin cetak"
    },
    {
      property: "Safe Zone & Bleed",
      specification: "Toleransi 1–2 mm bleed, 3 mm safe zone",
      note: "Mencegah teks penting terpotong pisau plong atau mesin heat-press"
    }
  ];

  return (
    <div className="space-y-10 text-foreground">
      <div className="space-y-3">
        <p className="text-base text-muted-foreground leading-relaxed">
          Halaman ini berisi spesifikasi teknis ukuran, format file, batas aman (safe zone), dan toleransi potong (bleed) untuk cetak ID Card PVC, tali lanyard, mug keramik, dan tumbler custom di Tidurlah Grafika.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Mengikuti panduan ini memastikan file desain Anda tidak terpotong pada bagian teks penting, tidak buram saat dicetak, dan warnanya tetap akurat sesuai standar mesin produksi.
        </p>
      </div>

      {/* ID Card Guide */}
      <section id="panduan-id-card" className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight text-foreground scroll-mt-20">
          1. Panduan Ukuran & Spesifikasi ID Card PVC
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ID card standar dicetak menggunakan bahan PVC solid setara kartu ATM / KTP dengan ketebalan standar 0.76 mm hingga 0.8 mm.
        </p>

        <BlogSpecTable
          caption="Tabel 1: Spesifikasi teknis ukuran dan resolusi cetak ID Card PVC"
          headers={["Parameter Teknis", "Ukuran / Standar", "Catatan Produksi"]}
          items={idCardSpecs}
        />

        <figure className="my-6">
          <img
            src="/product-image/panduan-id-card.webp"
            alt="Diagram Panduan Ukuran Desain ID Card 54 x 86 mm"
            className="w-full max-w-2xl mx-auto rounded-lg border border-border object-contain bg-muted/20"
            loading="lazy"
          />
          <figcaption className="text-center text-xs text-muted-foreground mt-2">
            Gambar 1: Diagram batas bleed, ukuran jadi, dan safe zone ID Card PVC.
          </figcaption>
        </figure>
      </section>

      {/* Lanyard Guide */}
      <section id="panduan-lanyard" className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight text-foreground scroll-mt-20">
          2. Panduan Ukuran & Pola Tali Lanyard
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tali lanyard diproduksi dengan metode cetak sublimasi full color 2 sisi (bolak-balik) pada bahan polyester tissue lembut yang tahan air dan tidak luntur.
        </p>

        <BlogSpecTable
          caption="Tabel 2: Spesifikasi ukuran dan pola layout tali lanyard sublimasi"
          headers={["Parameter Pola", "Ukuran / Dimensi", "Catatan Pengerjaan"]}
          items={lanyardSpecs}
        />

        <figure className="my-6">
          <img
            src="/product-image/panduan-lanyard.webp"
            alt="Diagram Panduan Ukuran dan Layout Desain Tali Lanyard"
            className="w-full max-w-2xl mx-auto rounded-lg border border-border object-contain bg-muted/20"
            loading="lazy"
          />
          <figcaption className="text-center text-xs text-muted-foreground mt-2">
            Gambar 2: Diagram layout cetak lanyard sublimasi 90 cm.
          </figcaption>
        </figure>

        <figure className="my-6">
          <img
            src="/product-image/contoh-lanyard.webp"
            alt="Contoh Hasil Produksi Tali Lanyard Sublimasi Berkualitas"
            className="w-full max-w-xl mx-auto rounded-lg border border-border object-contain bg-muted/20"
            loading="lazy"
          />
          <figcaption className="text-center text-xs text-muted-foreground mt-2">
            Gambar 3: Contoh hasil cetak lanyard sublimasi dengan aksesoris kait dan stopper.
          </figcaption>
        </figure>
      </section>

      {/* Mug Guide */}
      <section id="panduan-mug" className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight text-foreground scroll-mt-20">
          3. Panduan Ukuran Cetak Mug Keramik
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Mug keramik standar 11 oz menggunakan lapisan coating sublimasi khusus. Desain dicetak melingkar pada bodi mug.
        </p>

        <BlogSpecTable
          caption="Tabel 3: Dimensi area cetak mug keramik custom"
          headers={["Parameter Cetak", "Ukuran / Resolusi", "Catatan Mesin Press"]}
          items={mugSpecs}
        />

        <figure className="my-6">
          <img
            src="/product-image/panduan-cetak-mug.webp"
            alt="Panduan Area Cetak Mug Keramik Standar 20 x 8.5 cm"
            className="w-full max-w-xl mx-auto rounded-lg border border-border object-contain bg-muted/20"
            loading="lazy"
          />
          <figcaption className="text-center text-xs text-muted-foreground mt-2">
            Gambar 4: Area cetak melingkar pada mug keramik standar.
          </figcaption>
        </figure>
      </section>

      {/* Tumbler Guide */}
      <section id="panduan-tumbler" className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight text-foreground scroll-mt-20">
          4. Panduan Ukuran & Format Cetak Tumbler
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Untuk tumbler stainless steel (seperti tipe Niagara, Sakura, atau Travel Cup), metode cetak tersedia dalam bentuk grafir laser permanen (satu warna logam) atau print UV flatbed (full color).
        </p>

        <BlogSpecTable
          caption="Tabel 4: Spesifikasi metode pengerjaan tumbler stainless custom"
          headers={["Metode Cetak", "Format File", "Ketentuan Desain"]}
          items={tumblerSpecs}
        />

        <figure className="my-6">
          <img
            src="/product-image/panduan-cetak-tumbler.webp"
            alt="Panduan Area Cetak dan Grafir Tumbler Custom"
            className="w-full max-w-xl mx-auto rounded-lg border border-border object-contain bg-muted/20"
            loading="lazy"
          />
          <figcaption className="text-center text-xs text-muted-foreground mt-2">
            Gambar 5: Area cetak tumbler custom.
          </figcaption>
        </figure>
      </section>

      {/* File Format Standards */}
      <section id="standar-format-file" className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight text-foreground scroll-mt-20">
          5. Standar Format File & Checklist Sebelum Kirim
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sebelum mengirimkan file ke tim produksi, pastikan file Anda telah memenuhi standar pra-cetak (pre-press) berikut:
        </p>

        <BlogSpecTable
          caption="Tabel 5: Checklist verifikasi file pra-cetak"
          headers={["Item Verifikasi", "Spesifikasi Wajib", "Tujuan / Dampak"]}
          items={prePressChecklist}
        />
      </section>
    </div>
  );
}
