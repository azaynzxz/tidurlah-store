import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, User, Tag, ShoppingBag, Star, Phone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import MusicPlayer from "@/components/MusicPlayer";

// Import products from Index.tsx structure
const products = {
  "ID Card & Lanyard": [
    {
      id: 1,
      name: "ID Card 1S",
      image: "/product-image/ID Card 1S.jpg",
      description: "ID card satu sisi dengan bahan premium berkualitas.",
      price: 9000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 9000 },
        { minQuantity: 4, price: 8000 },
        { minQuantity: 25, price: 7000 },
        { minQuantity: 100, price: 6000 }
      ],
      time: "1-2 hari",
      rating: 4.7
    },
    {
      id: 2,
      name: "ID Card 2S",
      image: "/product-image/ID Card 2S.jpg",
      description: "ID card dua sisi dengan bahan premium berkualitas.",
      price: 10000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 10000 },
        { minQuantity: 4, price: 9000 },
        { minQuantity: 25, price: 8000 },
        { minQuantity: 100, price: 7000 }
      ],
      time: "2-3 hari",
      rating: 4.8
    },
    {
      id: 8,
      name: "Paket IDC LYD 2S",
      image: "/product-image/paket-idc-2s.jpg",
      description: "Paket lengkap dengan ID card dua sisi dan lanyard yang sesuai.",
      price: 25000,
      discountPrice: null,
      category: "ID Card & Lanyard",
      priceThresholds: [
        { minQuantity: 1, price: 25000 },
        { minQuantity: 4, price: 23000 },
        { minQuantity: 25, price: 20000 },
        { minQuantity: 100, price: 17000 }
      ],
      time: "2-3 hari",
      rating: 4.9
    }
  ],
  "Merchandise": [
    {
      id: 20,
      name: "Mug Custom",
      image: "/product-image/Mug 1.jpg",
      description: "Mug keramik dengan desain cetak, aman untuk microwave dan mesin pencuci piring.",
      price: 40000,
      discountPrice: null,
      category: "Merchandise",
      time: "3-5 hari",
      rating: 4.8
    }
  ]
};

interface BlogPostData {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  tags: string[];
  content: string;
  relatedProducts: string[];
}

// Blog post image mapping
const blogImageMap: Record<string, string> = {
  "pengalaman-cetak-perdana-sma-ar-raihan-bandar-lampung": "/blog-thumbnail/1_result.webp",
  "pt-bisi-international-percayakan-id-card-karyawan": "/blog-thumbnail/2_result.webp",
  "diskon-khusus-mahasiswa-kkn-15-persen": "/blog-thumbnail/3_result.webp",
  "rahasia-produksi-super-cepat-aplikasi-custom": "/blog-thumbnail/4_result.webp",
  "pondok-pesantren-natar-makin-hitz-pakai-id-card": "/blog-thumbnail/5_result.webp",
  "andalan-karyawan-bumn-id-card-lampung": "/blog-thumbnail/6_result.webp",
  "cetak-id-card-online-dari-rumah": "/blog-thumbnail/7_result.webp",
  "tembus-1000-pcs-per-bulan-kampus-lampung": "/blog-thumbnail/8_result.webp",
  "tradisi-mahasiswa-kkn-uin-raden-intan-lampung": "/blog-thumbnail/9_result.webp",
  "itera-percayakan-produksi-massal-1000-id-card": "/blog-thumbnail/10_result.webp",
  "standar-kualitas-tinggi-fakultas-kedokteran-malahayati": "/blog-thumbnail/11_result.webp",
  "lanyard-cepat-kusam-4-cara-mudah-merawatnya": "/blog-thumbnail/12_result.webp",
  "lampung-creative-week-sukses-branding-lanyard-custom": "/blog-thumbnail/13_result.webp",
  "panduan-memilih-id-card-tepat-kantor-bandar-lampung": "/blog-thumbnail/14_result.webp",
  "5-ide-desain-lanyard-anti-bosan-event-hits-lampung": "/blog-thumbnail/15_result.webp"
};

// Blog posts content based on real customer experiences
const blogPostsContent: Record<string, BlogPostData> = {
  "pengalaman-cetak-perdana-sma-ar-raihan-bandar-lampung": {
    title: "Pengalaman Cetak Perdana: Kisah di Balik Produksi 500+ ID Card & Lanyard untuk SMA Ar-Raihan Bandar Lampung",
    subtitle: "Tantangan dan proses di balik pesanan perdana dalam jumlah besar dari salah satu sekolah Islam terpadu terbaik di Lampung",
    author: "ID Card Lampung",
    date: "2024-01-20",
    tags: ["Sekolah", "ID Card", "Lanyard", "Studi Kasus", "Pendidikan"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Setiap pesanan punya cerita, terutama pesanan perdana dalam jumlah besar. Kami di ID Card Lampung (bagian dari Tidurlah Grafika) ingin berbagi pengalaman berkesan saat pertama kali dipercaya oleh salah satu sekolah Islam terpadu terbaik di kota ini, SMA Ar-Raihan Bandar Lampung, untuk memproduksi lebih dari 500 set ID Card dan lanyard.</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Tantangan Pesanan Perdana</h3>
          <p class="text-gray-700 leading-relaxed">SMA Ar-Raihan membutuhkan ID Card yang tidak hanya berfungsi sebagai kartu pelajar, tetapi juga mencerminkan identitas sekolah yang modern dan Islami. Kualitas cetak harus tajam, warna logo harus presisi, dan bahan lanyard harus nyaman dipakai siswa seharian.</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Proses Kami</h3>
          <ol class="list-decimal list-inside space-y-3 text-gray-700">
            <li><strong>Konsultasi Desain:</strong> Tim kami bekerja sama dengan pihak sekolah untuk menyempurnakan desain, memastikan semua elemen, mulai dari logo hingga penempatan foto, sudah sempurna.</li>
            <li><strong>Pemilihan Material:</strong> Kami merekomendasikan ID Card PVC tebal yang awet dan lanyard bahan tissue yang lembut, pilihan terbaik untuk aktivitas siswa yang padat.</li>
            <li><strong>Produksi Cepat:</strong> Dengan alur kerja yang efisien, kami berhasil menyelesaikan seluruh 500+ set ID Card dan lanyard tepat waktu sebelum tahun ajaran baru dimulai.</li>
          </ol>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Hasil yang Memuaskan</h3>
          <p class="text-gray-700 leading-relaxed">Pihak sekolah sangat puas dengan hasilnya. ID Card yang profesional dan lanyard yang seragam tidak hanya memudahkan identifikasi siswa tetapi juga meningkatkan rasa bangga dan persatuan di antara mereka.</p>
          
          <p class="text-gray-700 leading-relaxed mt-4">Pengalaman ini membuktikan komitmen TidurLah Grafika untuk memberikan kualitas terbaik, berapa pun jumlah pesanannya. Apakah sekolah Anda selanjutnya?</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },
  
  "pt-bisi-international-percayakan-id-card-karyawan": {
    title: "Bukan Cuma Mahasiswa, PT. Bisi International Tbk. Lampung Juga Percayakan ID Card Karyawan pada Kami",
    subtitle: "Kepercayaan perusahaan nasional pada vendor lokal untuk kebutuhan ID Card karyawan berkualitas korporat",
    author: "ID Card Lampung",
    date: "2024-01-18",
    tags: ["Korporat", "BUMN", "ID Card", "Profesional", "Testimoni"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Saat sebuah perusahaan nasional sekelas PT. Bisi International Tbk. (produsen benih hibrida terkemuka) memilih vendor lokal untuk kebutuhan sepenting ID Card karyawan, itu adalah sebuah pernyataan tentang kepercayaan dan kualitas. Kami di ID Card Lampung bangga menjadi mitra yang dipercaya oleh cabang mereka di Lampung.</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Standar Korporat yang Berbeda</h3>
          <p class="text-gray-700 leading-relaxed">Berbeda dengan kebutuhan event yang sifatnya sementara, ID card karyawan adalah representasi perusahaan yang dipakai setiap hari. Oleh karena itu, standar kualitasnya pun berbeda.</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Mengapa PT. Bisi International Tbk. Memilih Kami?</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Kualitas Cetak Korporat:</strong> Kami menjamin warna logo perusahaan tercetak akurat dan konsisten di setiap kartu.</li>
            <li><strong>Bahan Tahan Lama:</strong> Kami menggunakan ID Card PVC tebal standar ATM yang tidak mudah patah atau luntur, cocok untuk pemakaian jangka panjang.</li>
            <li><strong>Layanan Profesional:</strong> Proses pemesanan yang mudah dan pengiriman tepat waktu adalah prioritas kami untuk klien korporat.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Bukti Kepercayaan</h3>
          <p class="text-gray-700 leading-relaxed">Kepercayaan dari PT. Bisi International Tbk. adalah bukti bahwa TidurLah Grafika mampu memenuhi standar tertinggi dari dunia industri. Kami siap memberikan layanan serupa untuk perusahaan Anda.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },
  
  "diskon-khusus-mahasiswa-kkn-15-persen": {
    title: "KHUSUS MAHASISWA KKN! Diskon 15% untuk ID Card & Lanyard di ID Card Lampung",
    subtitle: "Apresiasi untuk semangat pengabdian mahasiswa KKN dengan diskon spesial dan layanan terbaik",
    author: "ID Card Lampung",
    date: "2024-01-12",
    tags: ["KKN", "Mahasiswa", "Diskon", "Promo", "Pengabdian"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Halo Pejuang KKN Lampung! Siap mengabdi untuk masyarakat? Pastikan kelompokmu tampil kompak dan profesional dengan ID Card dan lanyard custom. Identitas yang jelas tidak hanya memudahkan interaksi dengan warga, tapi juga jadi kenang-kenangan tak terlupakan.</p>
        
        <div class="bg-[#FF5E01]/10 border border-[#FF5E01]/20 rounded-lg p-4 my-6">
          <h3 class="text-xl font-bold text-[#FF5E01] mb-3 text-center">DISKON SPESIAL KKN 15%</h3>
          <p class="text-center text-gray-700">Untuk setiap pemesanan ID Card + Lanyard!</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Kenapa Harus Pesan di Tidurlah.com?</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Harga Dijamin Lebih Murah:</strong> Manfaatkan diskon 15% untuk menghemat anggaran kelompokmu.</li>
            <li><strong>Desain Gratis:</strong> Bingung soal desain? Tim kami siap bantu membuatkan desain yang keren untuk kelompok KKN-mu, GRATIS!</li>
            <li><strong>Produksi Cepat:</strong> Jangan khawatir dikejar deadline. Kami pastikan pesananmu selesai sebelum penerjunan.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Cara Klaim Diskon</h3>
          <ol class="list-decimal list-inside space-y-2 text-gray-700">
            <li>Kunjungi website kami di tidurlah.com atau hubungi WhatsApp.</li>
            <li>Sebutkan bahwa Anda adalah peserta KKN.</li>
            <li>Nikmati potongan harga 15% untuk pesananmu!</li>
          </ol>
          
          <p class="text-[#FF5E01] font-semibold mt-4">Promo terbatas selama musim KKN. Pesan sekarang!</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },
  
  "rahasia-produksi-super-cepat-aplikasi-custom": {
    title: "Rahasia Produksi Super Cepat di ID Card Lampung: Aplikasi Custom Buatan Sendiri!",
    subtitle: "Inovasi teknologi auto-layout yang mengubah cara kami memproduksi ratusan ID Card dengan cepat dan akurat",
    author: "ID Card Lampung",
    date: "2024-01-10",
    tags: ["Teknologi", "Inovasi", "Auto-layout", "Produksi", "Efisiensi"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Pernah bertanya-tanya bagaimana ID Card Lampung bisa menyelesaikan pesanan ratusan ID Card dalam waktu yang sangat singkat? Jawabannya bukan sihir, tapi teknologi!</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Investasi pada Teknologi</h3>
          <p class="text-gray-700 leading-relaxed">Di TidurLah Grafika, kami tidak hanya berinvestasi pada mesin cetak terbaik, tapi juga pada sistem kerja. Kami mengembangkan aplikasi layout otomatis (auto-layout) buatan kami sendiri.</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Bagaimana Cara Kerjanya?</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Secara tradisional, desainer harus menata nama, foto, dan nomor induk satu per satu ke dalam template ID Card. Proses ini memakan waktu berjam-jam, terutama untuk ratusan data.</p>
          
          <p class="text-gray-700 leading-relaxed">Aplikasi kami mengotomatiskan proses ini. Cukup masukkan data dari file Excel dan folder foto, program kami akan secara cerdas:</p>
          
          <ol class="list-decimal list-inside space-y-2 text-gray-700 mt-3">
            <li>Membaca setiap baris data (nama, NIP/NIM, jabatan).</li>
            <li>Mencocokkannya dengan file foto yang sesuai.</li>
            <li>Menatanya secara otomatis ke dalam template desain dengan presisi tinggi.</li>
            <li>Menghasilkan file siap cetak dalam hitungan menit, bukan jam!</li>
          </ol>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Keuntungan untuk Anda</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Produksi Lebih Cepat:</strong> Waktu tunggu Anda berkurang drastis. Pesanan mendesak? Kami siap!</li>
            <li><strong>Minim Kesalahan:</strong> Mengurangi risiko human error seperti salah ketik nama atau salah pasang foto.</li>
            <li><strong>Harga Lebih Efisien:</strong> Efisiensi waktu produksi memungkinkan kami memberikan harga yang lebih kompetitif.</li>
          </ul>
          
          <p class="text-gray-700 leading-relaxed mt-4">Inovasi inilah yang membuat kami menjadi yang tercepat. Butuh ID Card cepat dan akurat? Tidurlah Grafika solusinya.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },
  
  "pondok-pesantren-natar-makin-hitz-pakai-id-card": {
    title: "Tampil Beda! Pondok Pesantren di Natar Makin Hitz Pakai ID Card Keren dari ID Card Lampung",
    subtitle: "Modernisasi identitas santri: bagaimana pondok pesantren meningkatkan keamanan dan rasa memiliki dengan ID Card",
    author: "ID Card Lampung",
    date: "2024-01-16",
    tags: ["Pesantren", "Komunitas", "Modern", "Identitas", "Natar"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Siapa bilang pondok pesantren tidak bisa tampil modern dan keren? Di tengah kesibukan mengaji dan belajar, identitas dan kerapian tetap jadi nomor satu. Inilah cerita inspiratif dari salah satu pondok pesantren modern di Natar, Lampung Selatan, yang membuat gebrakan baru.</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Tujuan Modernisasi</h3>
          <p class="text-gray-700 leading-relaxed">Mereka memesan ratusan set ID Card dan lanyard dari ID Card Lampung dengan tujuan:</p>
          <ol class="list-decimal list-inside space-y-2 text-gray-700 mt-3">
            <li><strong>Meningkatkan Keamanan:</strong> Membedakan dengan jelas antara santri, pengajar, dan tamu.</li>
            <li><strong>Menumbuhkan Rasa Memiliki:</strong> Desain yang seragam dengan logo pondok membuat para santri merasa lebih bangga menjadi bagian dari almamater mereka.</li>
            <li><strong>Memudahkan Manajemen:</strong> Membantu pengelolaan data santri dan absensi kegiatan.</li>
          </ol>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Hasil yang Menggembirakan</h3>
          <p class="text-gray-700 leading-relaxed">Hasilnya? Pondok pesantren tersebut kini terlihat lebih teratur dan "hitz"! Para santri pun senang memakai kartu identitas baru mereka. Ini membuktikan bahwa ID Card bukan hanya untuk kantor atau event, tapi juga untuk memperkuat komunitas.</p>
          
          <p class="text-gray-700 leading-relaxed mt-4">TidurLah Grafika siap melayani semua jenis komunitas di Lampung, dari yang tradisional hingga yang paling modern.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },
  
  "andalan-karyawan-bumn-id-card-lampung": {
    title: "Jadi Andalan Karyawan BUMN, Ini Alasan Mereka Terus Kembali Cetak ID Card di ID Card Lampung",
    subtitle: "Konsistensi kualitas dan pelayanan yang membuat karyawan BUMN menjadi pelanggan setia kami",
    author: "ID Card Lampung",
    date: "2024-01-14",
    tags: ["BUMN", "Loyalitas", "Kualitas", "Pelanggan Setia", "Testimoni"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Pelanggan yang datang sekali itu biasa. Pelanggan yang datang berkali-kali? Itu adalah bukti kepuasan. Kami di ID Card Lampung merasa terhormat telah menjadi pilihan utama bagi banyak karyawan BUMN di Bandar Lampung untuk kebutuhan cetak ID Card mereka.</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Klien BUMN Setia Kami</h3>
          <p class="text-gray-700 leading-relaxed">Mulai dari karyawan bank, pelabuhan, hingga perkebunan, banyak yang secara personal atau melalui instansinya kembali memesan pada kami.</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Apa yang Membuat Mereka Setia?</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Konsistensi Kualitas:</strong> Pesanan pertama, kedua, dan seterusnya, kualitasnya tetap sama. Warna akurat, bahan tebal, dan cetakan tidak luntur.</li>
            <li><strong>Proses Cepat dan Mudah:</strong> Mereka tahu prosesnya tidak ribet. Cukup kirim file via WhatsApp atau email, pesanan akan diproses dengan cepat.</li>
            <li><strong>Harga Kompetitif:</strong> Kami menawarkan harga terbaik tanpa mengorbankan kualitas, sebuah nilai lebih yang dihargai.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Terima Kasih atas Kepercayaan</h3>
          <p class="text-gray-700 leading-relaxed">Kepercayaan dari para profesional BUMN adalah jaminan kualitas dari TidurLah Grafika. Terima kasih telah menjadi pelanggan setia kami!</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },
  
  "cetak-id-card-online-dari-rumah": {
    title: "Gak Perlu Keluar Rumah, Cetak ID Card & Lanyard di Lampung Kini Bisa dari Mana Saja via Tidurlah.com",
    subtitle: "Kemudahan memesan ID Card secara online: dari konsultasi hingga pengiriman ke rumah tanpa ribet",
    author: "ID Card Lampung",
    date: "2024-01-08",
    tags: ["Online", "Kemudahan", "Digital", "Pemesanan", "Anti-ribet"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Di zaman yang serba digital, macet dan panas di jalan bukan lagi alasan untuk menunda pekerjaan. Kami di TidurLah Grafika paham betul bahwa waktu Anda sangat berharga. Itulah mengapa kami merancang proses pemesanan yang super mudah, memungkinkan Anda pesan ID card dari rumah atau dari mana saja!</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Proses Anti-Ribet Kami</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Lupakan cara lama yang ribet. Begini proses mudah kami:</p>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">Langkah 1: Hubungi Kami via Online</h4>
          <ul class="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li><strong>WhatsApp:</strong> Simpan nomor kami dan mulailah chat. Anda bisa kirim brief, file desain, atau sekadar bertanya-tanya. Tim kami responsif!</li>
            <li><strong>Website Tidurlah.com:</strong> Kunjungi website kami untuk melihat portofolio dan informasi lengkap, lalu hubungi kami melalui kontak yang tersedia.</li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">Langkah 2: Konsultasi & Kirim File Digital</h4>
          <ul class="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Belum punya desain? Diskusikan idemu dengan desainer kami secara online. Kami akan siapkan mock-up digital.</li>
            <li>Sudah punya desain? Cukup kirimkan filenya melalui email atau WhatsApp.</li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">Langkah 3: Pembayaran & Produksi</h4>
          <p class="text-gray-700 leading-relaxed mb-4">Lakukan pembayaran via transfer bank. Setelah konfirmasi, pesananmu langsung masuk antrian produksi. Anda akan kami update mengenai progresnya.</p>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">Langkah 4: Ambil atau Tunggu di Rumah!</h4>
          <p class="text-gray-700 leading-relaxed mb-4">Setelah selesai, kami akan memberitahumu. Anda bisa mengambilnya langsung atau menggunakan jasa ojek online untuk pengiriman langsung ke depan pintu rumah atau kantormu.</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Mudah, Bukan?</h3>
          <p class="text-gray-700 leading-relaxed">"cetak apa aja, tidurlah grafika." Kami serius dengan slogan itu. Biarkan kami yang bekerja, Anda tinggal duduk tenang.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },
  
  "tembus-1000-pcs-per-bulan-kampus-lampung": {
    title: "Tembus 1000 pcs/Bulan! ITERA, UNILA, UMITRA, UBL, UTB, UIN Kompak Cetak ID Card di ID Card Lampung",
    subtitle: "Pencapaian produksi 1000+ ID Card per bulan dan kepercayaan dari kampus-kampus terbesar di Lampung",
    author: "ID Card Lampung",
    date: "2024-01-06",
    tags: ["Universitas", "Kampus", "Milestone", "Volume", "Kepercayaan"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Angka tidak pernah bohong. Saat dalam sebulan kami memproduksi lebih dari 1000 pcs ID Card dan lanyard hanya untuk lingkungan kampus, itu adalah sebuah tanda kepercayaan yang luar biasa.</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Kampus-Kampus Terbaik Lampung</h3>
          <p class="text-gray-700 leading-relaxed">Kami di ID Card Lampung sangat bangga telah menjadi pilihan utama bagi sivitas akademika dari kampus-kampus terbesar dan terbaik di Lampung:</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700 mt-3">
            <li>Institut Teknologi Sumatera (ITERA)</li>
            <li>Universitas Lampung (UNILA)</li>
            <li>Universitas Mitra Indonesia (UMITRA)</li>
            <li>Universitas Bandar Lampung (UBL)</li>
            <li>Universitas Teknokrat Indonesia (UTB)</li>
            <li>UIN Raden Intan Lampung</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Kenapa Dunia Kampus Memilih Kami?</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Kapasitas Produksi Besar:</strong> Mampu menangani pesanan massal untuk acara ospek, KKN, atau seminar besar.</li>
            <li><strong>Harga Mahasiswa:</strong> Kami mengerti anggaran mahasiswa, sehingga kami tawarkan harga yang sangat kompetitif.</li>
            <li><strong>Kualitas Teruji:</strong> Kualitas kami sudah terbukti awet untuk kegiatan mahasiswa yang dinamis.</li>
            <li><strong>Desain Gratis:</strong> Layanan desain gratis kami sangat membantu UKM dan panitia event kampus.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Terima Kasih Kampus Lampung</h3>
          <p class="text-gray-700 leading-relaxed">Terima kasih kepada seluruh mahasiswa, dosen, dan staf dari semua universitas di Lampung yang telah memercayakan kebutuhannya pada TidurLah Grafika. Pencapaian ini adalah energi bagi kami untuk terus memberikan yang terbaik.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },
  
  "tradisi-mahasiswa-kkn-uin-raden-intan-lampung": {
    title: "Sudah Jadi Tradisi, Mahasiswa KKN UIN Raden Intan Lampung Selalu Jadi Langganan Cetak ID Card di Sini!",
    subtitle: "Bagaimana informasi dari angkatan ke angkatan membuat kami menjadi 'tradisi' bagi mahasiswa KKN UIN",
    author: "ID Card Lampung",
    date: "2024-01-04",
    tags: ["UIN", "KKN", "Tradisi", "Mahasiswa", "Loyalitas"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Ada yang namanya pelanggan, ada juga yang namanya "langganan". Di dunia KKN (Kuliah Kerja Nyata), informasi tentang vendor terbaik biasanya menyebar dari angkatan ke angkatan. Dan kami di ID Card Lampung sangat bersyukur telah menjadi bagian dari "tradisi" itu bagi mahasiswa KKN UIN Raden Intan Lampung.</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Tradisi Turun Temurun</h3>
          <p class="text-gray-700 leading-relaxed">Setiap tahun, saat musim KKN tiba, kami selalu menyambut gelombang pesanan dari kelompok-kelompok KKN UIN. Mereka tahu ke mana harus pergi untuk mendapatkan ID Card dan lanyard yang:</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700 mt-3">
            <li><strong>Cepat Jadinya:</strong> Karena persiapan KKN selalu dikejar waktu.</li>
            <li><strong>Harganya Ramah di Kantong:</strong> Sesuai dengan anggaran mahasiswa.</li>
            <li><strong>Kualitasnya Oke:</strong> Cukup tangguh untuk menemani kegiatan di desa selama 40 hari.</li>
            <li><strong>Pelayanannya Mudah:</strong> Pesan via WhatsApp, diskusi desain, transfer, beres!</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Kehormatan Tertinggi</h3>
          <p class="text-gray-700 leading-relaxed">Menjadi vendor langganan adalah kehormatan tertinggi bagi kami. Ini adalah bukti bahwa pelayanan dan kualitas kami konsisten dari tahun ke tahun.</p>
          
          <p class="text-gray-700 leading-relaxed mt-4">Terima kasih teman-teman KKN UIN Raden Intan! Sampai jumpa di musim KKN berikutnya! Dan jangan lupa, Diskon KKN 15% selalu menanti kalian di TidurLah Grafika.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },
  
  "itera-percayakan-produksi-massal-1000-id-card": {
    title: "Sebar 1000+ Mahasiswa KKN, ITERA Percayakan Produksi Massal ID Card & Lanyard pada ID Card Lampung",
    subtitle: "Studi kasus produksi massal: mengelola pesanan 1000+ ID Card untuk KKN ITERA dalam waktu singkat",
    author: "ID Card Lampung",
    date: "2024-01-02",
    tags: ["ITERA", "Produksi Massal", "KKN", "Volume Tinggi", "Manajemen"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Memproduksi seratus atau dua ratus ID Card itu biasa. Tapi bagaimana jika pesanannya lebih dari 1000 buah untuk satu acara dalam waktu singkat? Ini adalah ujian sesungguhnya bagi kapasitas dan manajemen sebuah vendor percetakan.</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Ujian Skala Besar</h3>
          <p class="text-gray-700 leading-relaxed">Dan ID Card Lampung berhasil melaluinya dengan sukses saat dipercaya oleh Institut Teknologi Sumatera (ITERA) untuk memproduksi seluruh kebutuhan ID Card dan lanyard bagi ribuan mahasiswa KKN mereka.</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Tantangan Proyek Skala Besar</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Volume:</strong> Mengelola data dan mencetak lebih dari 1000 ID Card unik tanpa kesalahan.</li>
            <li><strong>Waktu:</strong> Deadline yang sangat ketat sebelum upacara pelepasan mahasiswa KKN.</li>
            <li><strong>Kualitas:</strong> Menjaga standar kualitas yang sama dari kartu pertama hingga kartu ke-1000.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Bagaimana Kami Mengatasinya?</h3>
          <p class="text-gray-700 leading-relaxed">Berkat sistem auto-layout kami dan manajemen produksi yang terstruktur, kami mampu memproses data ribuan mahasiswa secara efisien, mencetaknya dengan mesin berkapasitas tinggi, dan menyelesaikannya sesuai jadwal.</p>
          
          <p class="text-gray-700 leading-relaxed mt-4">Keberhasilan proyek ini adalah penegasan kapasitas TidurLah Grafika untuk menangani pesanan dalam skala apa pun. Institusi Anda butuh produksi massal? Jangan ragu, kami siap.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },
  
  "standar-kualitas-tinggi-fakultas-kedokteran-malahayati": {
    title: "Standar Kualitas Tinggi: Fakultas Kedokteran Malahayati Selalu Pesan ID Card dalam Jumlah Banyak di Sini",
    subtitle: "Memenuhi standar presisi dan profesionalisme untuk lingkungan medis yang mengutamakan kualitas premium",
    author: "ID Card Lampung",
    date: "2023-12-30",
    tags: ["Kedokteran", "Premium", "Malahayati", "Kualitas Tinggi", "Medis"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Fakultas Kedokteran dikenal dengan standar yang sangat tinggi dalam segala hal, mulai dari pendidikan hingga penampilan. Setiap detail harus mencerminkan presisi dan profesionalisme. Oleh karena itu, kami di ID Card Lampung sangat bangga menjadi vendor kepercayaan bagi Fakultas Kedokteran Universitas Malahayati.</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Layanan Rutin untuk Fakultas Kedokteran</h3>
          <p class="text-gray-700 leading-relaxed">Secara rutin, kami melayani pesanan dalam jumlah besar dari mereka untuk berbagai kebutuhan:</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700 mt-3">
            <li>ID Card untuk mahasiswa baru</li>
            <li>Kartu panitia untuk seminar dan workshop medis berskala nasional</li>
            <li>Tanda pengenal untuk dokter muda (co-ass) di rumah sakit</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Apa yang Membuat Mereka Yakin pada Kami?</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Presisi Cetak:</strong> Kami mampu mencetak logo dan detail-detail kecil dengan sangat tajam.</li>
            <li><strong>Material Premium:</strong> Kami selalu menyarankan bahan terbaik yang memberikan kesan kokoh dan profesional.</li>
            <li><strong>Kerahasiaan Data:</strong> Kami menjaga kerahasiaan data mahasiswa dan instansi dengan sangat serius.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Validasi Kualitas Terbaik</h3>
          <p class="text-gray-700 leading-relaxed">Kepercayaan dari lingkungan yang sangat mengutamakan kualitas seperti Fakultas Kedokteran Malahayati adalah validasi terbaik bagi layanan kami. Jika kualitas adalah prioritas utama Anda, maka Anda berada di tempat yang tepat.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },

  "lanyard-cepat-kusam-4-cara-mudah-merawatnya": {
    title: "Lanyard Cepat Kusam? Ini 4 Cara Mudah Merawatnya (Bedanya Printing vs Sablon)",
    subtitle: "Tips praktis merawat lanyard dan ID card agar awet bertahun-tahun, plus perbedaan perawatan printing vs sablon",
    author: "ID Card Lampung",
    date: "2024-01-25",
    tags: ["Tips", "Perawatan", "Lanyard", "Printing", "Sablon"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Anda baru saja membuat tali id card custom Lampung yang keren di Tidurlah Grafika. Selamat! Tapi sayangnya, banyak yang membiarkan lanyard dan ID card mereka menjadi kusam, kotor, atau bahkan rusak setelah beberapa lama dipakai.</p>
        
        <p class="text-gray-700 leading-relaxed">Padahal, dengan sedikit perawatan, Anda bisa membuatnya awet bertahun-tahun, lho. Ini tidak hanya menghemat uang, tapi juga menjaga citra profesional Anda tetap bersih. Yuk, ikuti 4 tips mudah ini!</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">1. Kenali Jenis Lanyard Anda: Printing vs Sablon</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Tahukah Anda, cara mencuci lanyard berbeda tergantung teknik cetaknya? Ini adalah kelebihan lanyard printing vs sablon dalam hal perawatan.</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Lanyard Printing (Bahan Tissue/Satin):</strong> Tinta pada lanyard ini meresap ke dalam serat kain. Perawatannya lebih mudah dan lebih tahan cuci. Anda bisa menguceknya dengan lembut tanpa takut desain akan retak.</li>
            <li><strong>Lanyard Sablon (Polyester):</strong> Tinta pada sablon tali lanyard menempel di permukaan kain. Perawatannya harus lebih hati-hati karena rentan retak atau terkelupas jika disikat terlalu keras atau disetrika langsung.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">2. Cara Mencuci yang Benar</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Rendam:</strong> Gunakan air hangat dan sedikit deterjen cair (bukan bubuk). Rendam selama 10-15 menit.</li>
            <li><strong>Kucek Lembut:</strong> Gunakan tangan untuk mengucek bagian yang kotor. Hindari sikat! Sikat dapat merusak serat kain dan desain.</li>
            <li><strong>Bilas & Keringkan:</strong> Bilas hingga tidak ada sisa sabun. Keringkan dengan cara diangin-anginkan. Jangan menjemur di bawah matahari langsung agar warna tidak pudar.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">3. Jaga Kebersihan ID Card PVC</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Kartu id card pvc tebal Anda memang kuat, tapi tidak kebal noda.</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li>Gunakan kain mikrofiber (seperti kain kacamata) yang sedikit lembap.</li>
            <li>Usap perlahan untuk menghilangkan debu dan sidik jari.</li>
            <li>Jangan gunakan alkohol atau thinner, karena bisa merusak lapisan pelindung dan hasil cetak kartu.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">4. Simpan dengan Baik</h3>
          <p class="text-gray-700 leading-relaxed">Kebiasaan sepele ini punya dampak besar. Saat tidak digunakan, gantung lanyard Anda. Jangan melipatnya dan menaruh di saku atau di dasar tas, karena bisa membuat kartu ID Card bengkok dan pengaitnya rusak.</p>
          
          <p class="text-gray-700 leading-relaxed mt-4">Dengan merawatnya, Anda menunjukkan bahwa Anda peduli pada detail. Butuh koleksi lanyard atau ID card baru dengan kualitas yang sudah terjamin? Anda tahu harus mencari kami di mana.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },

  "lampung-creative-week-sukses-branding-lanyard-custom": {
    title: "Studi Kasus: Begini Cara 'Lampung Creative Week' Sukses Branding dengan Lanyard Custom",
    subtitle: "Kisah sukses kolaborasi strategis antara Tidurlah Grafika dengan festival kreatif terbesar di Lampung",
    author: "ID Card Lampung",
    date: "2024-01-23",
    tags: ["Studi Kasus", "Event", "Branding", "Creative Week", "Lanyard Custom"],
    content: `
      <div class="space-y-6">
        <p class="text-gray-700 leading-relaxed">Bagaimana sebuah event lokal bisa memiliki nuansa sekelas acara nasional hanya dari detail kecil seperti lanyard? Ini bukan sekadar teori. Simak kisah sukses nyata kolaborasi strategis antara Tidurlah Grafika dengan "Lampung Creative Week", salah satu festival kreatif terbesar di kota ini.</p>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">SITUATION (Situasi Awal)</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Tim "Lampung Creative Week" datang kepada kami dengan tantangan yang umum dihadapi banyak event organizer:</p>
          <ol class="list-decimal list-inside space-y-2 text-gray-700">
            <li><strong>Bujet Terbatas:</strong> Mereka membutuhkan solusi lanyard printing murah Lampung untuk 1000 pcs tanpa terlihat murahan.</li>
            <li><strong>Deadline Ketat:</strong> Waktu produksi hanya 7 hari kerja sebelum acara dimulai.</li>
            <li><strong>Kebutuhan Kompleks:</strong> Desain lanyard harus bisa membedakan 3 kategori: Panitia Inti (Akses Penuh), Tenant Bazaar (Akses Terbatas), dan Media (Akses Panggung & Media Center).</li>
          </ol>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">TASK (Tugas Kami)</h3>
          <p class="text-gray-700 leading-relaxed">Tugas kami di Tidurlah Grafika jelas: menjadi partner produksi yang bisa diandalkan. Kami harus memproduksi 1000 set lanyard dan ID card yang tidak hanya fungsional, tetapi juga menjadi elemen branding yang kuat dan membanggakan untuk dikenakan.</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">ACTION (Tindakan yang Diambil)</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Kami tidak langsung mencetak. Kami melakukan pendekatan strategis:</p>
          <ol class="list-decimal list-inside space-y-3 text-gray-700">
            <li><strong>Konsultasi Desain & Material:</strong> Tim kami menggelar sesi brainstorm dengan klien. Kami menyarankan penggunaan bahan lanyard tissue karena paling ideal untuk menampilkan desain full color yang detail.</li>
            <li><strong>Desain Mock-up Gratis:</strong> Kami menyajikan tiga mock-up digital dengan skema warna berbeda (Biru untuk Panitia, Oranye untuk Tenant, Abu-abu untuk Media) untuk persetujuan cepat.</li>
            <li><strong>Produksi Prioritas:</strong> Setelah desain disetujui, kami memasukkan order ini ke jalur produksi prioritas dan berhasil menyelesaikan seluruh 1000 pcs dalam 5 hari kerja, 2 hari lebih cepat dari deadline.</li>
          </ol>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">RESULT (Hasil yang Dicapai)</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Hasilnya berdampak langsung pada kesuksesan acara:</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Branding Profesional:</strong> Acara terlihat sangat terorganisir. Tamu dan peserta bisa dengan mudah mengidentifikasi staf yang tepat untuk bertanya.</li>
            <li><strong>Efek Viral Organik:</strong> Lebih dari 150+ unggahan Instagram Story dari panitia yang dengan bangga memamerkan lanyard mereka, menciptakan promosi dari mulut ke mulut secara gratis.</li>
            <li><strong>Kepuasan Klien 100%:</strong> Klien sangat puas dengan kualitas, kecepatan, dan pelayanan. Mereka berhasil mendapatkan produk premium yang sesuai bujet dan kini menjadi klien tetap kami.</li>
          </ul>
          
          <p class="text-gray-700 leading-relaxed mt-4">Kisah sukses ini membuktikan bahwa lanyard yang tepat adalah investasi cerdas. Siap menjadikan acara Anda yang berikutnya?</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },

  "panduan-memilih-id-card-tepat-kantor-bandar-lampung": {
    title: "Investasi Profesional: Panduan Memilih ID Card yang Tepat untuk Kantor di Bandar Lampung",
    subtitle: "Panduan lengkap memilih antara ID Card PVC standar atau kartu proximity untuk kebutuhan profesional kantor",
    author: "ID Card Lampung",
    date: "2024-01-21",
    tags: ["Panduan", "ID Card", "Kantor", "PVC", "Proximity", "Profesional"],
    content: `
      <div class="space-y-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Apakah Sistem Identitas Karyawan di Kantor Anda Sudah Profesional?</h3>
          <p class="text-gray-700 leading-relaxed">Bapak/Ibu manajer atau pemilik usaha di Bandar Lampung, seiring berkembangnya perusahaan, tantangan dalam mengelola identitas dan keamanan karyawan pun meningkat. Mungkin saat ini Anda merasa sistem yang ada—mengandalkan kunci biasa atau kartu identitas seadanya—sudah tidak lagi efisien dan tidak mencerminkan citra profesional perusahaan Anda.</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Risiko di Balik ID Card yang Biasa Saja</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Mempertahankan sistem yang usang bisa menimbulkan masalah:</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Citra Perusahaan Stagnan:</strong> ID card yang tipis dan mudah rusak memberikan kesan bahwa perusahaan tidak peduli pada detail.</li>
            <li><strong>Keamanan Rentan:</strong> Tanpa kontrol akses yang jelas, area-area penting di kantor bisa diakses oleh siapa saja.</li>
            <li><strong>Tidak Efisien:</strong> Proses absensi manual atau penggunaan kunci fisik memakan waktu dan sulit dilacak.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Pilihan 1: ID Card PVC Tebal - Fondasi Profesionalisme</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Ini adalah standar emas untuk identitas visual. Terbuat dari bahan PVC berkualitas, kartu ini adalah pilihan tepat jika fokus utama Anda adalah identitas.</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Kualitas Terbaik:</strong> Kami menggunakan id card pvc tebal yang kokoh dengan hasil cetak tajam dan warna yang akurat, menampilkan logo perusahaan Anda secara maksimal.</li>
            <li><strong>Sangat Terjangkau:</strong> Pilihan paling efisien untuk kebutuhan identitas visual karyawan dalam jumlah banyak.</li>
            <li><strong>Fleksibel:</strong> Perlu kartu untuk karyawan baru? Kami melayani cetak id card satuan Bandar Lampung, jadi Anda tidak perlu menunggu pemesanan massal.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Pilihan 2: Kartu Proximity (RFID) - Keamanan & Efisiensi Modern</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Ini adalah upgrade signifikan. Selain sebagai identitas, kartu ini memiliki chip internal yang berfungsi sebagai kunci akses digital.</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Keamanan Superior:</strong> Batasi akses ke ruang server, gudang, atau ruang direksi hanya untuk pemegang kartu yang berwenang.</li>
            <li><strong>Efisiensi Tinggi:</strong> Integrasikan dengan sistem absensi tap-and-go yang cepat dan akurat.</li>
            <li><strong>Membangun Citra Modern:</strong> Menunjukkan bahwa perusahaan Anda mengadopsi teknologi dan serius dalam hal keamanan.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Perbandingan Pilihan</h3>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-300 p-2 text-left">Pertimbangan</th>
                  <th class="border border-gray-300 p-2 text-left">ID Card PVC Tebal</th>
                  <th class="border border-gray-300 p-2 text-left">Kartu Proximity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-gray-300 p-2">Fokus Utama</td>
                  <td class="border border-gray-300 p-2">Identitas Visual & Profesionalisme</td>
                  <td class="border border-gray-300 p-2">Keamanan & Efisiensi</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-2">Biaya</td>
                  <td class="border border-gray-300 p-2">Sangat Terjangkau</td>
                  <td class="border border-gray-300 p-2">Investasi Jangka Panjang</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-2">Teknologi</td>
                  <td class="border border-gray-300 p-2">Cetak Berkualitas Tinggi</td>
                  <td class="border border-gray-300 p-2">Cetak + Chip RFID</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-2">Rekomendasi</td>
                  <td class="border border-gray-300 p-2">Startup, Toko, UKM, Kantor</td>
                  <td class="border border-gray-300 p-2">Perusahaan Skala Menengah-Besar, Pabrik, Instansi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Saatnya Ambil Langkah Profesional Berikutnya</h3>
          <p class="text-gray-700 leading-relaxed">Sebagai tempat buat id card karyawan di Bandar Lampung yang terpercaya, Tidurlah Grafika siap membantu Anda menentukan pilihan terbaik sesuai bujet dan kebutuhan. Hubungi kami hari ini untuk mendapatkan penawaran harga dan konsultasi gratis!</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },

  "5-ide-desain-lanyard-anti-bosan-event-hits-lampung": {
    title: "5 Ide Desain Lanyard Anti-Bosan untuk Event Hits di Lampung",
    subtitle: "Inspirasi desain lanyard kreatif untuk event organizer dan kreator acara di Lampung",
    author: "ID Card Lampung",
    date: "2024-01-19",
    tags: ["Desain", "Inspirasi", "Event", "Lanyard", "Kreatif"],
    content: `
      <div class="space-y-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Punya Rencana Event Keren, Tapi Lanyard Panitia Gitu-Gitu Aja?</h3>
          <p class="text-gray-700 leading-relaxed">Halo, Kak Rina dan semua kreator acara di Lampung! Kamu pasti setuju, suksesnya sebuah event terletak pada detailnya. Namun, seringkali kita fokus pada bintang tamu dan dekorasi panggung, sampai lupa pada satu elemen penting yang dilihat semua orang: lanyard dan ID card panitia. Jangan sampai lanyard yang biasa saja membuat branding acaramu jadi kurang "nendang"!</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Lanyard Bukan Sekadar Tali, Tapi Kanvas Branding Anda</h3>
          <p class="text-gray-700 leading-relaxed mb-3">Sebuah lanyard dengan desain yang tepat guna bisa menjadi pembeda. Ia bukan hanya berfungsi sebagai gantungan id card panitia, tapi juga:</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Meningkatkan Profesionalisme:</strong> Menunjukkan acaramu digarap dengan serius.</li>
            <li><strong>Memperkuat Identitas Acara:</strong> Menjadi media promosi berjalan yang dikenakan oleh seluruh tim.</li>
            <li><strong>Memudahkan Koordinasi:</strong> Membantu peserta dan tamu mengenali panitia dengan cepat.</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">5 Ide Desain yang Bisa Kamu Curi</h3>
          
          <div class="space-y-4">
            <div>
              <h4 class="text-lg font-semibold text-gray-800 mb-2">1. Minimalis Elegan untuk Acara Formal</h4>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Konsep:</strong> Fokus pada logo acara yang bersih dan tipografi yang modern. Gunakan 1-2 warna dasar yang sesuai palet warna brand Anda.</li>
                <li><strong>Cocok untuk:</strong> Seminar, workshop, atau pameran korporat di Bandar Lampung.</li>
                <li><strong>Tips Pro:</strong> Gunakan bahan lanyard tissue dengan teknik printing untuk hasil yang premium dan nyaman dipakai seharian.</li>
              </ul>
            </div>
            
            <div>
              <h4 class="text-lg font-semibold text-gray-800 mb-2">2. Sentuhan Etnik Khas Lampung</h4>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Konsep:</strong> Angkat kekayaan lokal! Masukkan elemen modern dari motif Tapis atau siluet Menara Siger ke dalam desainmu.</li>
                <li><strong>Cocok untuk:</strong> Festival budaya, acara pariwisata, atau event yang ingin menonjolkan kebanggaan lokal.</li>
                <li><strong>Tips Pro:</strong> Desain etnik akan sangat menonjol pada lanyard lebar 2.5 cm. Jangan ragu konsultasi, desainer kami siap membantu!</li>
              </ul>
            </div>
            
            <div>
              <h4 class="text-lg font-semibold text-gray-800 mb-2">3. Berani & Penuh Warna untuk Festival Musik</h4>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Konsep:</strong> Tabrak warna! Gunakan warna-warna cerah, ilustrasi playful, atau kutipan ikonik yang berhubungan dengan acaramu.</li>
                <li><strong>Cocok untuk:</strong> Konser musik, pentas seni, atau acara anak muda yang enerjik.</li>
                <li><strong>Tips Pro:</strong> Teknik sablon tali lanyard berkualitas bisa jadi pilihan untuk desain dengan warna solid yang kontras dan bujet yang lebih efisien.</li>
              </ul>
            </div>
            
            <div>
              <h4 class="text-lg font-semibold text-gray-800 mb-2">4. Fungsional dengan QR Code</h4>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Konsep:</strong> Integrasikan QR code yang mengarah ke rundown acara, peta lokasi, atau link media sosial. Praktis dan modern!</li>
                <li><strong>Cocok untuk:</strong> Konferensi, pameran, dan event yang ingin mengurangi penggunaan kertas.</li>
                <li><strong>Tips Pro:</strong> Pastikan ada ruang khusus pada desain untuk QR code yang cukup besar agar mudah di-scan.</li>
              </ul>
            </div>
            
            <div>
              <h4 class="text-lg font-semibold text-gray-800 mb-2">5. Tipografi yang Menginspirasi</h4>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Konsep:</strong> Jadikan slogan atau tagline acaramu sebagai elemen desain utama dengan jenis huruf yang artistik. Simpel tapi powerful.</li>
                <li><strong>Cocok untuk:</strong> Acara motivasi, kegiatan sosial, atau perayaan internal komunitas.</li>
                <li><strong>Tips Pro:</strong> Keterbacaan adalah kunci. Pilih maksimal dua jenis font yang serasi untuk menghindari kesan berantakan.</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Jangan Tunda Lagi, Wujudkan Lanyard Impianmu Sekarang!</h3>
          <p class="text-gray-700 leading-relaxed">Sudah punya gambaran untuk acaramu? Jangan biarkan ide brilian ini mengendap. Sebagai pusat cetak lanyard Lampung yang mengerti kebutuhan anak muda dan para profesional, Tidurlah Grafika siap menjadi partner kreatifmu.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  },

  "kebijakan-privasi": {
    title: "Komitmen Kami terhadap Privasi Anda",
    subtitle: "Kebijakan privasi lengkap tentang bagaimana Tidurlah Grafika melindungi dan mengelola informasi pribadi pelanggan",
    author: "Tidurlah Grafika",
    date: "2024-01-30",
    tags: ["Kebijakan", "Privasi", "Keamanan", "Informasi", "Perlindungan"],
    content: `
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Komitmen Kami terhadap Privasi Anda</h1>
          <p class="text-gray-700 leading-relaxed">Di Tidurlah Grafika (termasuk sub-brand ID Card Lampung), kami menghargai privasi Anda dan berkomitmen untuk melindungi informasi pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat Anda menggunakan layanan kami atau mengunjungi situs web kami. Kami ingin Anda merasa aman dan percaya bahwa informasi pribadi Anda diperlakukan dengan hati-hati dan bertanggung jawab.</p>
        </div>
        
        <!-- Collapsible Section 1 -->
        <div class="border border-gray-200 rounded-lg">
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg">
              <h2 class="text-xl font-bold text-gray-900">Informasi yang Kami Kumpulkan</h2>
              <span class="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div class="p-4 space-y-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Kami dapat mengumpulkan informasi pribadi dari Anda saat Anda memesan ID Card, termasuk:</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Nama</li>
                  <li>Alamat email</li>
                  <li>Nomor telepon</li>
                  <li>Alamat pengiriman</li>
                  <li>Data pribadi yang tertera di ID Card</li>
                </ul>
              </div>
              
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Kami juga mengumpulkan informasi tentang penggunaan Anda terhadap situs web kami, termasuk:</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Halaman yang Anda kunjungi</li>
                  <li>Produk yang Anda lihat</li>
                  <li>Waktu Anda menggunakan situs web kami</li>
                </ul>
              </div>
            </div>
          </details>
        </div>
        
        <!-- Collapsible Section 2 -->
        <div class="border border-gray-200 rounded-lg">
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg">
              <h2 class="text-xl font-bold text-gray-900">Cara Kami Menggunakan Informasi Anda</h2>
              <span class="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div class="p-4">
              <p class="text-gray-700 leading-relaxed mb-3">Kami menggunakan informasi Anda untuk:</p>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Memproses pesanan Anda</li>
                <li>Menawarkan layanan dan dukungan kepada Anda</li>
                <li>Meningkatkan pengalaman Anda di situs web kami</li>
                <li>Mengirimkan informasi tentang produk dan layanan kami</li>
                <li>Menyediakan iklan yang relevan dan informasi promosi, dengan persetujuan Anda</li>
              </ul>
            </div>
          </details>
        </div>
        
        <!-- Collapsible Section 3 -->
        <div class="border border-gray-200 rounded-lg">
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg">
              <h2 class="text-xl font-bold text-gray-900">Berbagi Informasi Anda</h2>
              <span class="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div class="p-4">
              <p class="text-gray-700 leading-relaxed mb-3">Kami tidak akan membagikan informasi pribadi Anda dengan pihak ketiga tanpa izin Anda, kecuali:</p>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Kami diwajibkan oleh hukum untuk melakukannya</li>
                <li>Kami bekerja sama dengan perusahaan lain untuk menyediakan produk atau layanan kepada Anda, seperti penyedia jasa pengiriman</li>
                <li>Kami menggunakan penyedia layanan pihak ketiga untuk membantu kami menjalankan bisnis kami, seperti penyedia hosting atau layanan analitik</li>
              </ul>
            </div>
          </details>
        </div>
        
        <!-- Collapsible Section 4 -->
        <div class="border border-gray-200 rounded-lg">
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg">
              <h2 class="text-xl font-bold text-gray-900">Keamanan Informasi Anda</h2>
              <span class="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div class="p-4">
              <p class="text-gray-700 leading-relaxed mb-3">Kami mengambil langkah-langkah untuk melindungi keamanan informasi Anda, termasuk:</p>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Menggunakan enkripsi untuk melindungi informasi saat Anda mengirimkannya melalui internet</li>
                <li>Menyimpan informasi Anda di drive yang aman dengan akses ketat</li>
                <li>Melakukan audit keamanan berkala dan prosedur tanggap insiden</li>
                <li>Membatasi akses ke informasi Anda hanya kepada karyawan dan pihak ketiga yang memerlukan akses untuk tujuan operasional</li>
              </ul>
            </div>
          </details>
        </div>
        
        <!-- Collapsible Section 5 -->
        <div class="border border-gray-200 rounded-lg">
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg">
              <h2 class="text-xl font-bold text-gray-900">Hak Anda</h2>
              <span class="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div class="p-4">
              <p class="text-gray-700 leading-relaxed mb-3">Anda memiliki hak untuk:</p>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Mengakses informasi pribadi Anda yang kami miliki</li>
                <li>Mengoreksi informasi pribadi Anda yang tidak akurat atau sudah usang</li>
                <li>Menghapus informasi pribadi Anda, kecuali jika kami memiliki kewajiban hukum untuk menyimpannya</li>
                <li>Meminta portabilitas data Anda</li>
                <li>Menolak pemrosesan data Anda untuk tujuan tertentu</li>
                <li>Menarik kembali persetujuan Anda kapan saja tanpa mempengaruhi legalitas pemrosesan berdasarkan persetujuan sebelum penarikannya</li>
              </ul>
            </div>
          </details>
        </div>
        
        <!-- Collapsible Section 6 -->
        <div class="border border-gray-200 rounded-lg">
          <details class="group">
            <summary class="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg">
              <h2 class="text-xl font-bold text-gray-900">Perubahan Kebijakan Privasi</h2>
              <span class="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div class="p-4">
              <p class="text-gray-700 leading-relaxed">Kami dapat mengubah kebijakan privasi ini dari waktu ke waktu. Setiap perubahan akan diposting di situs web kami dan, jika perubahan tersebut signifikan, kami akan memberikan pemberitahuan lebih lanjut, seperti melalui email atau pemberitahuan langsung di situs web kami.</p>
            </div>
          </details>
        </div>
        
        <div class="mt-8 p-4 bg-blue-50 rounded-lg">
          <p class="text-gray-700 leading-relaxed">Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menggunakan hak Anda, silakan hubungi kami melalui informasi kontak yang tersedia di website.</p>
        </div>
      </div>
    `,
    relatedProducts: ["ID Card & Lanyard"]
  }
};

// Default blog post for non-matching slugs
const defaultBlogPost: BlogPostData = {
  title: "Panduan Lengkap Memilih ID Card yang Tepat untuk Perusahaan Anda",
  subtitle: "Tips dan trik dalam memilih desain, material, dan fitur ID card yang sesuai dengan kebutuhan bisnis modern",
  author: "ID Card Lampung",
  date: "2024-01-15",
  tags: ["ID Card", "Bisnis", "Keamanan", "Desain", "Tips"],
  content: `
    <div class="space-y-6">
      <p class="text-gray-700 leading-relaxed">ID card atau kartu identitas merupakan salah satu elemen penting dalam sistem keamanan dan identifikasi karyawan di perusahaan. Pemilihan ID card yang tepat tidak hanya berkaitan dengan aspek keamanan, tetapi juga mencerminkan profesionalitas dan brand image perusahaan.</p>
      
      <div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Mengapa ID Card Penting untuk Perusahaan?</h3>
        <p class="text-gray-700 leading-relaxed">Dalam era digital saat ini, ID card bukan hanya sebagai alat identifikasi biasa. ID card modern dilengkapi dengan berbagai fitur keamanan dan teknologi yang dapat meningkatkan efisiensi operasional perusahaan.</p>
      </div>
      
      <div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Proses Pembuatan ID Card di TIDURLAH STORE</h3>
        <p class="text-gray-700 leading-relaxed mb-3">Di TIDURLAH STORE, kami menggunakan teknologi printing terdepan dan material berkualitas tinggi. Proses pembuatan ID card kami meliputi:</p>
        <ol class="list-decimal list-inside space-y-2 text-gray-700">
          <li>Konsultasi desain gratis</li>
          <li>Proof design untuk approval</li>
          <li>Produksi menggunakan printer card profesional</li>
          <li>Quality control ketat</li>
          <li>Pengiriman tepat waktu</li>
        </ol>
      </div>
      
      <div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Kesimpulan</h3>
        <p class="text-gray-700 leading-relaxed">Untuk konsultasi lebih lanjut mengenai pembuatan ID card untuk perusahaan Anda, jangan ragu untuk menghubungi tim TIDURLAH STORE. Kami siap membantu merealisasikan kebutuhan ID card dengan kualitas terbaik dan harga yang kompetitif.</p>
      </div>
    </div>
  `,
  relatedProducts: ["ID Card & Lanyard", "Merchandise"]
};

const BlogPost = () => {
  const navigate = useNavigate();
  const { title } = useParams();
  const [blogPost, setBlogPost] = useState<BlogPostData>(defaultBlogPost);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    // Get blog post content based on URL slug
    const slug = title || "";
    const foundBlogPost = blogPostsContent[slug] || defaultBlogPost;
    setBlogPost(foundBlogPost);
    
    // Set document title
    document.title = `${foundBlogPost.title} - TIDURLAH STORE Blog`;
    
    // Set dynamic OG meta tags
    const updateMetaTags = () => {
      // Update OG title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', foundBlogPost.title);

      // Update OG description
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', foundBlogPost.subtitle);

      // Update OG image - use dynamic generator
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', `${window.location.origin}/product-image/web-preview.jpg`);

      // Update OG URL
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', window.location.href);
    };
    
    updateMetaTags();
    
    // Get related products
    const related: any[] = [];
    foundBlogPost.relatedProducts.forEach(category => {
      if (products[category as keyof typeof products]) {
        related.push(...products[category as keyof typeof products].slice(0, 2));
      }
    });
    setRelatedProducts(related);
  }, [title]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 notranslate" translate="no">
      <div className="container mx-auto max-w-4xl bg-white min-h-screen">
        {/* Header - Same as Index.tsx */}
        <div className="bg-white shadow-sm p-3 flex justify-between items-center sticky top-0 z-10">
          <img 
            src="https://zkreatif.wordpress.com/wp-content/uploads/2025/05/logo-tidurlah-grafika-horizontal.png"
            alt="TIDURLAH STORE"
            className="h-8 object-contain"
          />
          <div className="flex items-center">
            <MusicPlayer />
            <button 
              onClick={() => navigate('/')}
              className="ml-3 text-[#FF5E01] hover:text-[#FF5E01]/80 flex items-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Kembali ke Toko</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <span className="text-gray-500 text-sm">
                <button onClick={() => navigate('/')} className="hover:text-[#FF5E01]">Home</button> / 
                <span className="text-gray-700"> Blog / {title || 'Artikel'}</span>
              </span>
            </nav>

            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {blogPost.title}
              </h1>
              
              <h2 className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
                {blogPost.subtitle}
              </h2>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>{blogPost.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(blogPost.date)}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {blogPost.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FF5E01]/10 text-[#FF5E01] border border-[#FF5E01]/20"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            {/* Featured Image */}
            {blogImageMap[title || ""] && (
              <div className="mb-8">
                <img 
                  src={blogImageMap[title || ""]}
                  alt={blogPost.title}
                  className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
                  loading="lazy"
                />
              </div>
            )}

            {/* Article Content */}
            <article className="mb-12">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blogPost.content }}
              />
            </article>

            {/* Mini Ads Section */}
            <div className="bg-gradient-to-r from-[#FF5E01]/5 to-[#FF5E01]/10 rounded-xl p-6 mb-8 border border-[#FF5E01]/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-[#FF5E01]" />
                Produk Terkait
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative pt-[75%]">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-[#FF5E01]">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500 ml-1">{product.rating}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate('/')}
                        className="w-full bg-[#FF5E01] text-white rounded-lg py-2 px-4 text-xs font-medium hover:bg-[#FF5E01]/90 transition-colors"
                      >
                        Lihat Produk
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-[#FF5E01] text-white rounded-lg py-3 px-6 font-medium hover:bg-[#FF5E01]/90 transition-colors"
                >
                  Lihat Semua Produk
                </button>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gray-50 rounded-xl p-6 text-center border">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Butuh Konsultasi untuk Proyek ID Card Anda?
              </h3>
              <p className="text-gray-600 mb-4">
                Tim ahli kami siap membantu memberikan solusi terbaik untuk kebutuhan ID card perusahaan Anda.
              </p>
              <a 
                href="https://wa.me/6285172157808?text=Halo, saya ingin konsultasi mengenai pembuatan ID card untuk perusahaan."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-[#25D366] text-white rounded-lg py-2 px-6 font-medium hover:bg-[#25D366]/90 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <path d="M17.6 6.31999C16.2 4.91999 14.2 4.09999 12.1 4.09999C7.79995 4.09999 4.29995 7.59999 4.29995 11.9C4.29995 13.3 4.69995 14.7 5.39995 15.9L4.19995 19.9L8.29995 18.7C9.49995 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.79999 19 7.79999 17.6 6.31999ZM12.1 18.3C10.9 18.3 9.69995 17.9 8.69995 17.2L8.39995 17L5.99995 17.7L6.69995 15.4L6.39995 15.1C5.59995 14 5.19995 13 5.19995 11.9C5.19995 8.09999 8.29995 5.09999 12 5.09999C13.8 5.09999 15.5 5.79999 16.7 6.99999C17.9 8.19999 18.6 9.89999 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.89995 11.5C9.69995 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.79995 9.19999 9.59995 8.79999C9.39995 8.39999 9.19995 8.39999 8.99995 8.39999C8.89995 8.39999 8.69995 8.39999 8.49995 8.39999C8.29995 8.39999 7.99995 8.49999 7.79995 8.79999C7.59995 9.09999 7.09995 9.49999 7.09995 10.4C7.09995 11.3 7.79995 12.2 7.89995 12.4C8.09995 12.6 9.69995 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z" fill="white"/>
                </svg>
                Konsultasi Gratis
              </a>
            </div>
          </div>
        </div>

        {/* Footer - Same as Index.tsx */}
        <footer className="bg-gray-100 px-4 py-5 mt-6 text-xs">
          <div className="grid grid-cols-3 gap-4">
            {/* Column 1: Logo and Slogan */}
            <div>
              <h4 className="font-bold text-[#FF5E01] mb-2">TIDURLAH</h4>
              <p className="text-gray-600 text-[10px] leading-tight">
                "Cetak apa aja,<br />
                Tidurlah Grafika!"
              </p>
            </div>
            
            {/* Column 2: Contact */}
            <div>
              <h4 className="font-bold text-gray-700 mb-2">Contact</h4>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-center">
                  <Phone size={10} className="mr-1" /> +62 851-7215-7808
                </li>
              </ul>
            </div>
            
            {/* Column 3: Address */}
            <div>
              <h4 className="font-bold text-gray-700 mb-2">Address</h4>
              <p className="text-gray-600 text-[10px] leading-tight">
                Perum. Korpri Raya, Blok D3. No. 3, Sukarame, Bandar Lampung
              </p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 text-[10px] text-center text-gray-500">
            &copy; {new Date().getFullYear()} TIDURLAH STORE
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BlogPost; 