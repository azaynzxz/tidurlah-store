import { BlogPostData } from "../index";
import { BlogSpecTable, BlogSteps, BlogCallout, BlogSpecItem, BlogStepItem } from "@/components/blog";

function LanyardCareTipsContent() {
  const comparisonSpecs: BlogSpecItem[] = [
    {
      property: "Penyerapan Tinta",
      specification: "Meresap langsung ke dalam serat kain melalui transfer sublimasi",
      note: "Menempel di lapisan luar kain menggunakan pasta sablon rubber"
    },
    {
      property: "Ketahanan Cuci",
      specification: "Sangat tinggi, warna tahan air dan tidak luntur/retak",
      note: "Rentan retak jika disikat kasar atau terkena panas setrika"
    },
    {
      property: "Kenyamanan Bahan",
      specification: "Bahan polyester tissue lembut, nyaman & tidak gatal di leher",
      note: "Bahan polyester standar berserat, agak kaku"
    },
    {
      property: "Perawatan Cuci",
      specification: "Bebas kucek lembut, aman deterjen cair",
      note: "Wajib cuci pelan, jangan disikat atau disetrika langsung"
    }
  ];

  const washSteps: BlogStepItem[] = [
    {
      title: "Rendam dengan Deterjen Cair Lembut",
      description: "Gunakan air hangat suam-suam kuku dan sedikit deterjen cair (hindari deterjen bubuk yang mengandung butiran keras). Rendam tali selama 10–15 menit untuk melarutkan noda debu dan minyak kulit.",
      tip: "Lepaskan kartu ID card dan casing plastik sebelum merendam tali."
    },
    {
      title: "Kucek Lembut Menggunakan Tangan",
      description: "Kucek perlahan pada bagian tali yang paling sering terkena keringat leher. Hindari penggunaan sikat baju yang kasar karena dapat merusak serat kain halus dan jahitan stopper.",
      tip: "Jika ada noda membandel, gunakan sabun bayi lembut dan gosok perlahan dengan jari."
    },
    {
      title: "Bilas Bersih & Keringkan di Tempat Teduh",
      description: "Bilas dengan air mengalir hingga tidak ada sisa busa deterjen. Keringkan dengan cara diangin-anginkan di tempat teduh. Hindari menjemur di bawah terik matahari langsung agar saturasi warna cetak tetap cerah bertahun-tahun.",
    }
  ];

  return (
    <div className="space-y-8 text-foreground font-sans">
      <div className="space-y-3">
        <p className="text-base text-muted-foreground leading-relaxed">
          Tali lanyard dan ID Card PVC merupakan representasi citra profesional Anda, organisasi kampus, atau institusi tempat Anda bernaung. Namun seiring waktu pemakaian harian, debu, keringat, dan minyak alami tubuh dapat membuat tali lanyard terlihat kusam jika tidak dirawat dengan benar.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Dengan teknik perawatan yang tepat, lanyard dan kartu PVC buatan Tidurlah Grafika dapat bertahan bertahun-tahun tetap bersih, cerah, dan tidak mudah patah.
        </p>
      </div>

      {/* Comparison Section */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. Kenali Jenis Cetak Lanyard: Sublimasi vs Sablon
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Metode produksi tali lanyard menentukan cara pembersihan yang aman bagi bahan dan tinta:
        </p>

        <BlogSpecTable
          caption="Tabel 1: Perbedaan karakteristik dan ketahanan lanyard printing sublimasi vs sablon manual"
          headers={["Karakteristik", "Lanyard Printing Sublimasi (Tissue)", "Lanyard Sablon (Polyester)"]}
          items={comparisonSpecs}
        />
      </section>

      {/* Wash Steps */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. Panduan Langkah Mencuci Tali Lanyard
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ikuti tiga langkah mudah berikut agar serat tali tetap lembut dan pengait logam tidak berkarat:
        </p>

        <BlogSteps steps={washSteps} />
      </section>

      {/* PVC ID Card Care */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          3. Cara Menjaga Kebersihan Kartu ID Card PVC
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bahan PVC solid setara kartu ATM kami dilapisi pelindung laminasi anti-gores, namun tetap membutuhkan penanganan yang tepat:
        </p>

        <BlogCallout variant="warning" title="Perhatian Perawatan Kartu PVC:">
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground leading-relaxed mt-1">
            <li>Gunakan kain lap kacamata (mikrofiber halus) yang sedikit dibasahi air untuk menyeka debu dan noda sidik jari.</li>
            <li><strong>Hindari alkohol, aseton, atau thinner:</strong> Cairan kimia keras dapat melarutkan lapisan laminasi dan memudarkan tinta barcode / QR code.</li>
            <li>Gunakan card holder / casing pelindung transparan untuk mencegah goresan fisik akibat gesekan kunci atau koin.</li>
          </ul>
        </BlogCallout>
      </section>

      {/* Storage Tips */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          4. Simpan dengan Cara Digantung
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ketika selesai digunakan di kantor atau kampus, gantungkan lanyard pada hanger khusus atau gantungan dinding. Jangan membiasakan melipat tali dan menyelipkannya ke dalam kantung saku belakang celana, karena tekanan saat duduk dapat mematahkan kartu PVC atau merusak per pegas pada kait stopper.
        </p>
      </section>
    </div>
  );
}

export const blogPost: BlogPostData = {
  id: 12,
  slug: "lanyard-cepat-kusam-4-cara-mudah-merawatnya",
  title: "Lanyard Cepat Kusam? Ini 4 Cara Mudah Merawatnya (Bedanya Printing vs Sablon)",
  subtitle: "Tips praktis merawat lanyard dan ID card agar awet bertahun-tahun, plus perbedaan perawatan printing vs sablon",
  author: "ID Card Lampung",
  date: "2024-01-25",
  tags: ["Tips", "Perawatan", "Lanyard", "Printing", "Sablon"],
  readTime: "4 menit",
  views: 750,
  image: "/blog-thumbnail/12_result.webp",
  category: "tutorials",
  content: LanyardCareTipsContent,
  relatedProducts: ["ID Card & Lanyard"]
};
