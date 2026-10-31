import type { Product } from "@/types/product";
import { generateProductSlug } from "@/utils/product";

export const SITE_ORIGIN = "https://idcardlampung.com";

/**
 * Internal helper items (shipping fee & express surcharge) excluded from
 * public sitemap.xml and search engine indexing.
 */
export const NON_INDEXABLE_PRODUCT_Ids = new Set<number>([2001, 2002]);

export interface ProductSeoEntry {
  seoTitle: string;
  imageAlt: string;
  description: string;
}

/**
 * GSC-driven SEO titles, image alt texts, and rich product descriptions
 * mapped by Product ID. Serves both static products.json and runtime fallback
 * when products are loaded from Supabase.
 */
export const PRODUCT_SEO_MAP: Record<number, ProductSeoEntry> = {
  // === ID CARD & LANYARD ===
  8: {
    seoTitle: "Cetak Paket ID Card 2 Sisi & Tali Lanyard Custom",
    imageAlt: "Cetak Paket ID Card PVC 2 Sisi dan Tali Lanyard Custom di Bandar Lampung dan Metro",
    description:
      "Paket lengkap cetak ID card PVC tebal 2 sisi (setara KTP/ATM) plus tali lanyard printing full color dan casing holder. Pilihan utama untuk nametag karyawan kantor, BUMN, panitia event, kartu pelajar, hingga mahasiswa KKN. Bisa cetak satuan tanpa minimum order maupun grosir harga hemat untuk area Bandar Lampung (Kedaton, Rajabasa, Tanjung Karang, Sukarame), Way Hui, hingga pengiriman cepat ke Kota Metro dan Natar.",
  },
  9: {
    seoTitle: "Paket Cetak ID Card, Case Kulit & Lanyard Custom",
    imageAlt: "Paket Cetak ID Card PVC dengan Holder Case Kulit Sintetis dan Tali Lanyard Custom Lampung",
    description:
      "Paket eksklusif cetak ID card PVC tebal dengan holder case kulit sintetis rapi serta tali lanyard printing yang serasi. Cocok untuk kartu identitas instansi pemerintahan, BUMN, bank, dosen, dan perusahaan profesional di Bandar Lampung, Tanjung Karang, Teluk Betung, maupun Kota Metro. Melayani pemesanan satuan hingga ratusan pcs dengan diskon bertingkat.",
  },
  10: {
    seoTitle: "Paket Cetak ID Card 2 Sisi, Case Premium & Lanyard",
    imageAlt: "Paket ID Card 2 Sisi Casing Akrilik Premium dan Tali Lanyard Custom Bandar Lampung",
    description:
      "Paket deluxe cetak ID card PVC 2 sisi tajam, casing akrilik keras transparan anti-bengkok, dan tali lanyard tisu custom full color. Solusi nametag awet untuk staf korporat, rumah sakit, dan panitia konferensi di Bandar Lampung (Rajabasa, Sukarame, Kedaton), Jati Agung, Pesawaran, serta Pringsewu.",
  },
  7: {
    seoTitle: "Cetak Paket ID Card 1 Sisi & Tali Lanyard Murah",
    imageAlt: "Paket Cetak ID Card 1 Sisi dan Tali Lanyard Custom Murah Satuan Grosir Lampung",
    description:
      "Paket ekonomis cetak ID card PVC 1 sisi lengkap dengan tali lanyard printing custom dan casing kartu. Sangat diminati untuk nametag kepanitiaan kampus, orientasi siswa, peserta seminar, dan organisasi mahasiswa di sekitar ITERA Way Hui, UIN Sukarame, Unila Rajabasa, Bandar Lampung, hingga Kota Metro.",
  },
  3: {
    seoTitle: "Cetak ID Card Holder Case Kulit & Tali Kulit",
    imageAlt: "Cetak ID Card dengan Casing Kulit dan Tali Gantungan Kulit Eksklusif di Lampung",
    description:
      "Set ID card PVC kualitas tinggi dipadukan dengan frame holder kulit dan tali kulit elegan berkesan formal. Ideal untuk name tag pejabat dinas, manajer kantor, dan tamu VIP di Bandar Lampung, Tanjung Karang, Teluk Betung, serta Lampung Selatan. Bisa pesan satuan maupun kolektif.",
  },
  2: {
    seoTitle: "Cetak ID Card PVC 2 Sisi Satuan & Grosir (Setara KTP)",
    imageAlt: "Tempat Cetak ID Card PVC Tebal 2 Sisi Satuan Terdekat di Bandar Lampung dan Metro",
    description:
      "Cetak kartu ID card PVC tebal 0,76 mm dua sisi depan-belakang (bahan standar kartu ATM/KTP, tahan air dan tidak luntur). Cocok untuk cetak kartu pelajar, kartu mahasiswa, member card toko, kartu parkir, dan ID karyawan. Melayani cetak ID card satuan terdekat di Bandar Lampung (Kedaton, Tanjung Karang, Kemiling, Rajabasa), Way Hui, Natar, dan pengiriman ke Kota Metro.",
  },
  1: {
    seoTitle: "Cetak ID Card PVC 1 Sisi Murah Tanpa Minimal Order",
    imageAlt: "Jasa Cetak ID Card PVC 1 Sisi Satuan Murah Cepat di Bandar Lampung",
    description:
      "Jasa cetak ID card PVC tebal 1 sisi dengan warna tajam dan pengerjaan cepat 1-2 hari jadi. Pilihan hemat untuk kartu tanda pengenal, kartu akses, kartu panitia, atau kartu komunitas tanpa minimum order di Bandar Lampung, Sukarame, Way Hui, Jati Agung, hingga Pesawaran.",
  },
  4: {
    seoTitle: "Cetak Tali Lanyard Custom 1 Sisi Satuan & Grosir",
    imageAlt: "Tempat Cetak Tali Lanyard ID Card 1 Sisi Custom Terdekat di Bandar Lampung",
    description:
      "Cetak tali lanyard tisu lembut 1 sisi dengan teknik digital sublime tajam, lengkap kait besi oval dan stopper. Nyaman dipakai seharian untuk gantungan ID card kantor, nametag event, atau gantungan pod/kunci. Melayani pembuatan lanyard satuan maupun partai besar untuk area Bandar Lampung, Tanjung Karang, Kedaton, dan Kota Metro.",
  },
  5: {
    seoTitle: "Cetak Tali Lanyard Custom 2 Sisi Full Color Premium",
    imageAlt: "Cetak Tali Lanyard Printing 2 Sisi Bolak Balik Kait Stopper di Bandar Lampung dan Metro",
    description:
      "Jual dan cetak tali lanyard ID card 2 sisi bolak-balik bahan tisu halus berkualitas tinggi, warna pekat tidak pudar saat dicuci, sudah termasuk kait besi dan stopper. Tersedia harga satuan dan grosir murah untuk instansi, BUMN, sekolah, dan event kampus di Bandar Lampung, Rajabasa, Sukarame, Natar, hingga Pringsewu.",
  },
  6: {
    seoTitle: "Paket Cetak ID Card & Tali Lanyard Polos Ekonomis",
    imageAlt: "Cetak ID Card dengan Tali Lanyard Polos dan Casing Standar Murah Lampung",
    description:
      "Paket hemat cetak ID card PVC plus casing holder dan tali lanyard polos siap pakai dengan proses kilat 1-2 hari. Solusi tepat untuk kebutuhan mendadak nametag ujian, kunjungan industri, magang PKL, dan kepanitiaan sekolah di Bandar Lampung, Kemiling, Teluk Betung, serta Lampung Selatan.",
  },
  24: {
    seoTitle: "Cetak ID Card PVC + Tali Lanyard Hitam Polos",
    imageAlt: "Paket ID Card PVC dan Tali Lanyard Hitam Polos Kait Besi Elegan Bandar Lampung",
    description:
      "Paket praktis cetak kartu ID card PVC dilengkapi casing dan tali lanyard hitam polos minimalis yang rapi dan profesional. Banyak digunakan untuk kartu tamu gedung, staf operasional, peserta pelatihan, dan panitia acara di Bandar Lampung, Tanjung Karang, Kedaton, dan Kota Metro.",
  },
  25: {
    seoTitle: "Cetak Nametag Panitia Ukuran B4 & Tali Hitam Polos",
    imageAlt: "Cetak ID Card Kertas Nametag Panitia Ukuran Besar B4 dan Tali Hitam di Lampung",
    description:
      "Cetak nametag kertas art carton tebal ukuran besar B4 (15,5 x 16,6 cm) lengkap plastik pelindung dan tali lanyard hitam polos. Pilihan paling ekonomis dan jelas terbaca dari jauh untuk co-card panitia konser, turnamen olahraga, ospek kampus, dan pameran di Bandar Lampung, Rajabasa, Sukarame, hingga Metro.",
  },
  26: {
    seoTitle: "Jual Yoyo ID Card Putar & Holder Kartu Nama",
    imageAlt: "ID Card Yoyo Tarik Ulur Praktis Berbagai Warna Ready Stock Bandar Lampung",
    description:
      "Gantungan yoyo ID card tarik-ulur otomatis untuk tap kartu akses gedung, absensi kantor, dan nametag saku seragam. Ready stock berbagai pilihan warna untuk kebutuhan karyawan rumah sakit, perbankan, dan instansi di Bandar Lampung, Tanjung Karang, Kedaton, serta Jati Agung.",
  },
  27: {
    seoTitle: "Cetak Logo Stiker Resin Yoyo ID Card Custom",
    imageAlt: "Cetak Stiker Logo Timbul Yoyo ID Card Custom Instansi di Bandar Lampung",
    description:
      "Layanan cetak logo custom presisi untuk ditempel pada bagian tengah yoyo ID card sehingga tampilan seragam kantor, rumah sakit, atau universitas tampak resmi. Melayani pemesanan satuan dan kolektif di Bandar Lampung, Kota Metro, Natar, dan Pringsewu.",
  },
  28: {
    seoTitle: "Yoyo ID Card Premium Casing Akrilik Bening",
    imageAlt: "Yoyo ID Card Premium dengan Case Akrilik Transparan Kuat di Lampung",
    description:
      "Set yoyo ID card kualitas premium dengan pegas tarik kuat dan casing akrilik bening tebal yang melindungi kartu dari goresan. Cocok untuk tenaga medis, pegawai BUMN, dan staf korporat di Bandar Lampung (Tanjung Karang, Teluk Betung, Sukarame) hingga Kota Metro.",
  },
  30: {
    seoTitle: "Yoyo ID Card Premium Case Semi Transparan",
    imageAlt: "Yoyo ID Card Premium Case Semi Transparan Modern Bandar Lampung",
    description:
      "Gantungan yoyo ID card seri premium dipadukan dengan holder kartu semi-transparan modern yang ringan dan kokoh. Ideal untuk kartu akses pintu elektrik dan tanda pengenal karyawan di Bandar Lampung, Kedaton, Rajabasa, serta Pesawaran.",
  },
  34: {
    seoTitle: "Cetak Cue Card / Que Card MC Ukuran A5 Tebal",
    imageAlt: "Cetak Que Card MC Acara Bahan Tebal Ukuran A5 Full Color di Bandar Lampung",
    description:
      "Cetak cue card (que card) panduan MC dan host ukuran A5 ISO (14,8 x 21,0 cm) menggunakan bahan tebal tidak mudah melengkung dengan hasil cetak tajam. Wajib dimiliki untuk pemandu acara seminar, wisuda kampus, pernikahan, dan event formal di Bandar Lampung maupun Kota Metro.",
  },
  2200: {
    seoTitle: "Jual Casing Holder ID Card (Bening, Warna, Kulit, Akrilik)",
    imageAlt: "Jual Berbagai Casing Holder ID Card Bening, Kulit, dan Akrilik Ready Stock Lampung",
    description:
      "Tersedia lengkap berbagai varian tempat/casing pelindung ID card ready stock: Case Reguler Warna-warni, Case Bening, Case Putih Susu, Case Akrilik Premium, hingga Case Kulit sintetis. Melayani pembelian eceran mulai Rp 2.000 maupun grosir di Bandar Lampung, Way Hui, Natar, dan sekitarnya.",
  },

  // === MEDIA PROMOSI ===
  11: {
    seoTitle: "Cetak Banner & Spanduk Custom Outdoor/Indoor per Meter",
    imageAlt: "Tempat Cetak Banner Spanduk Outdoor dan Indoor Cepat Murah di Bandar Lampung",
    description:
      "Jasa cetak banner dan spanduk flexi ukuran bebas per meter persegi untuk media promosi toko, backdrop panggung, spanduk kegiatan kampus, dan pengumuman instansi. Warna cerah tahan cuaca panas dan hujan, melayani area Bandar Lampung (Sukarame, Rajabasa, Kedaton, Tanjung Karang), Way Hui, hingga pengiriman ke Kota Metro dan Natar.",
  },
  12: {
    seoTitle: "Cetak X Banner Custom 60x160 cm Lengkap dengan Tiang Stand",
    imageAlt: "Cetak X Banner Ukuran 60x160 Lengkap Stand Penyangga Murah Bandar Lampung",
    description:
      "Paket cetak X-Banner ukuran standar 60 x 160 cm sudah termasuk tiang penyangga lipat dan tas sarung praktis. Solusi display promosi berdiri untuk pintu ruko, kafe, klinik, seminar kampus, dan bazar UMKM di Bandar Lampung, Kemiling, Teluk Betung, Kota Metro, serta Pringsewu.",
  },
  13: {
    seoTitle: "Cetak Roll Up Banner Portable Lengkap Stand Aluminium",
    imageAlt: "Cetak Roll Up Banner Stand Aluminium Kokoh untuk Pameran dan Kantor di Lampung",
    description:
      "Cetak Roll Up Banner gulung otomatis dengan rangka aluminium kokoh dan tampilan tegak rapi berkelas. Sangat cocok untuk booth pameran, lobi kantor, hotel, bank, dan presentasi instansi di Bandar Lampung, Tanjung Karang, Kedaton, maupun Kota Metro.",
  },
  14: {
    seoTitle: "Cetak Poster A3+ Art Paper Berkualitas Tinggi",
    imageAlt: "Jasa Cetak Poster Ukuran A3 Warna Tajam Satuan dan Grosir di Bandar Lampung",
    description:
      "Cetak poster ukuran A3 pada kertas art carton/art paper tebal dengan resolusi tinggi dan warna akurat. Cocok untuk poster edukasi sekolah, promosi menu kafe, dekorasi dinding, serta publikasi event kampus di Bandar Lampung, Rajabasa, Sukarame, dan Way Hui.",
  },

  // === MERCHANDISE ===
  15: {
    seoTitle: "Cetak Cutting Stiker Chromo Custom (Kiss Cut / Die Cut)",
    imageAlt: "Cetak Cutting Stiker Kontur Chromo Label Kemasan UMKM di Bandar Lampung",
    description:
      "Cetak stiker chromo sudah termasuk potong pola kontur otomatis sesuai bentuk logo Anda, dengan pilihan laminasi glossy atau doff. Solusi ekonomis untuk label kemasan makanan, botol minuman UMKM, dan stiker komunitas di Bandar Lampung, Tanjung Karang, Natar, hingga Kota Metro.",
  },
  32: {
    seoTitle: "Cetak Cutting Stiker Vinyl A3+ Tahan Air (Waterproof)",
    imageAlt: "Cetak Stiker Vinyl A3+ Tahan Air Potong Kontur Custom Lampung",
    description:
      "Cetak stiker bahan vinyl plastik tahan air dan anti-sobek per lembar A3+ lengkap jasa cutting presisi mengikuti lekuk desain. Ideal untuk label produk frozen food, kemasan kopi dingin, stiker helm/motor, dan merchandise event di Bandar Lampung, Kedaton, Sukarame, dan Pringsewu.",
  },
  33: {
    seoTitle: "Jasa Cutting Stiker Vinyl Papan Bunga Akrilik + Masking",
    imageAlt: "Jasa Cutting Stiker Huruf Papan Bunga Akrilik Ukuran A3 di Bandar Lampung",
    description:
      "Jasa potong cutting stiker vinyl presisi ukuran A3 (27,7 x 42 cm) khusus untuk huruf ucapan papan bunga akrilik, sudah termasuk plastik masking transfer siap tempel. Melayani vendor florist dan pengrajin plakat di Bandar Lampung, Way Hui, Jati Agung, Metro, serta Pesawaran.",
  },
  16: {
    seoTitle: "Custom Gantungan Kunci (Ganci) Akrilik Terdekat Satuan/Grosir",
    imageAlt: "Tempat Bikin Custom Gantungan Kunci Akrilik Terdekat di Bandar Lampung dan Metro",
    description:
      "Tempat bikin custom gantungan kunci (ganci) akrilik bening potong laser presisi dengan hasil cetak tajam dan ring besi kuat. Souvenir favorit untuk merchandise komunitas, kenang-kenangan KKN, kado wisuda, dan promosi brand tanpa minimal order di Bandar Lampung, Rajabasa, Kedaton, Tanjung Karang, hingga Kota Metro.",
  },
  17: {
    seoTitle: "Cetak Gantungan Kunci (Ganci) Bulat 3 cm Murah",
    imageAlt: "Cetak Gantungan Kunci Pin Bulat Ukuran 3 cm Souvenir Event Murah Lampung",
    description:
      "Cetak gantungan kunci bulat diameter 3 cm ringkas dengan laminasi pelindung mengkilap/doff. Pilihan souvenir paling terjangkau mulai Rp 2.300 untuk bagi-bagi hadiah event sekolah, bazar kampus, dan kampanye komunitas di Bandar Lampung, Sukarame, Natar, dan Metro.",
  },
  18: {
    seoTitle: "Cetak Gantungan Kunci (Ganci) Bulat 5 cm Custom Cepat",
    imageAlt: "Bikin Gantungan Kunci Custom Diameter 5 cm Pengerjaan 1 Hari Bandar Lampung",
    description:
      "Cetak gantungan kunci bulat ukuran lebih besar diameter 5 cm sehingga logo dan ilustrasi terlihat jelas, pengerjaan kilat mulai 1 hari jadi. Cocok untuk merchandise seminar, reuni, dan souvenir organisasi di Bandar Lampung, Tanjung Karang, Kemiling, serta Pringsewu.",
  },
  19: {
    seoTitle: "Cetak Gantungan Kunci Tali (Short Lanyard Keychain) 1S/2S",
    imageAlt: "Cetak Gantungan Kunci Tali Pendek Lanyard Custom Motor dan Tas di Lampung",
    description:
      "Gantungan kunci tali pendek (keychain lanyard) cetak full color 1 sisi atau 2 sisi yang trendi untuk gantungan kunci motor, mobil, dan resleting tas. Tersedia pemesanan satuan maupun grosir komunitas di Bandar Lampung, Kedaton, Rajabasa, Way Hui, dan Kota Metro.",
  },
  103: {
    seoTitle: "Cetak Pin Peniti Custom 3 cm Murah Satuan & Grosir",
    imageAlt: "Tempat Cetak Pin Custom Kait Peniti 3 cm Terdekat di Bandar Lampung",
    description:
      "Cetak pin bulat ukuran mungil 3 cm dengan pengait peniti kuat di bagian belakang untuk aksesoris tas, topi, jilbab, atau tanda peserta kegiatan sekolah dan kampus di Bandar Lampung, Sukarame, Tanjung Karang, hingga Pesawaran.",
  },
  104: {
    seoTitle: "Cetak Pin Peniti Custom 5 cm Souvenir Event & Komunitas",
    imageAlt: "Cetak Pin Custom Diameter 5 cm Peniti Kuat Murah di Bandar Lampung dan Metro",
    description:
      "Cetak pin peniti custom diameter 5 cm warna cerah berlaminasi rapi. Sangat cocok untuk tanda panitia, atribut kampanye edukasi, pin organisasi mahasiswa, dan souvenir acara di Bandar Lampung, Rajabasa, Kedaton, Natar, maupun Kota Metro.",
  },
  20: {
    seoTitle: "Cetak Mug Custom Keramik Printing Satuan & Harga Grosir",
    imageAlt: "Jasa Mug Printing Custom Gelas Keramik Souvenir Kantor dan Wisuda Bandar Lampung",
    description:
      "Jasa mug printing custom pada gelas keramik putih berkualitas tinggi dengan hasil cetak full color permanen, aman untuk minuman panas dan microwave. Pilihan tepat untuk kado ulang tahun, souvenir wisuda, hampers lebaran/natal, dan merchandise kantor di Bandar Lampung (Tanjung Karang, Kedaton, Teluk Betung), Kota Metro, hingga Pringsewu.",
  },
  21: {
    seoTitle: "Cetak Tumbler Custom Botol Minum Souvenir Kantor & Event",
    imageAlt: "Cetak Tumbler Insert Paper Custom Souvenir Seminar dan Perusahaan di Lampung",
    description:
      "Cetak tumbler botol minum travel custom desain penuh mengelilingi botol, ringan dibawa dan tahan suhu panas maupun dingin. Banyak dipesan untuk seminar kit instansi, hadiah pelanggan, dan souvenir KKN di Bandar Lampung, Sukarame, Rajabasa, serta Lampung Selatan.",
  },
  22: {
    seoTitle: "Buat Plakat Akrilik Custom Penghargaan, KKN & Wisuda",
    imageAlt: "Tempat Pembuatan Plakat Akrilik Custom Berbagai Model di Bandar Lampung",
    description:
      "Pembuatan plakat akrilik reguler berkualitas dengan 9 pilihan bentuk desain elegan untuk cenderamata pemateri seminar, kenang-kenangan lokasi KKN/PKL, piala kejuaraan, dan kado wisuda di Bandar Lampung, Way Hui, Kedaton, Kota Metro, dan sekitarnya.",
  },
  2100: {
    seoTitle: "Cetak Plakat Akrilik UV Print Tebal 3mm-20mm + Box Bludru",
    imageAlt: "Plakat Akrilik Cetak UV Flatbed Lengkap Box Bludru Eksklusif Bandar Lampung",
    description:
      "Plakat akrilik premium cetak langsung mesin UV flatbed bertekstur tajam dan awet, tersedia pilihan ketebalan 3 mm hingga 20 mm lengkap dengan kotak box bludru mewah. Standar cenderamata resmi untuk kunjungan dinas, BUMN, universitas, dan penghargaan korporat di Bandar Lampung, Tanjung Karang, Metro, hingga Pringsewu.",
  },

  // === PAPAN BUNGA ===
  1001: {
    seoTitle: "Papan Bunga Akrilik Meja Mini Pink Purple #PKK1",
    imageAlt: "Plakat Papan Bunga Akrilik Kecil Pink Purple Gradient Ucapan Wisuda Lampung",
    description:
      "Papan bunga akrilik meja ukuran kecil kode #PKK1 bertema gradasi pink-ungu dengan hiasan bunga artificial dan kupu-kupu cantik. Hadiah kekinian awet dipajang untuk ucapan selamat sidang skripsi, wisuda, ulang tahun, dan grand opening toko di Bandar Lampung, Rajabasa, Sukarame, Kedaton, serta Kota Metro.",
  },
  1002: {
    seoTitle: "Papan Bunga Akrilik Mini Bunga Matahari & Anggrek #PKK3",
    imageAlt: "Papan Bunga Akrilik Meja Bunga Matahari Mini dan Anggrek Putih Bandar Lampung",
    description:
      "Plakat papan bunga akrilik meja kode #PKK3 berhias rangkaian bunga matahari mini dan anggrek putih ceria, custom nama dan foto. Cocok untuk kado wisuda kampus Unila, ITERA, UIN Raden Intan, Malahayati, maupun ucapan selamat pembukaan usaha di Bandar Lampung dan Metro.",
  },
  1003: {
    seoTitle: "Papan Bunga Akrilik Mini Pink Gold Tropical #PKK5",
    imageAlt: "Plakat Papan Bunga Akrilik Tema Pink Gold Tropical Kado Sidang dan Grand Opening Lampung",
    description:
      "Papan bunga akrilik meja kode #PKK5 bernuansa pink gold tropical elegan dengan teks ucapan custom sesuai pesanan. Pilihan kado estetik pengganti karangan bunga konvensional untuk area Bandar Lampung, Tanjung Karang, Teluk Betung, Natar, dan sekitarnya.",
  },
  1004: {
    seoTitle: "Plakat Papan Bunga Akrilik Anggrek Biru Moonlight #PKB2",
    imageAlt: "Plakat Bunga Akrilik Custom Hiasan Anggrek Biru Moonlight di Bandar Lampung",
    description:
      "Plakat papan bunga akrilik eksklusif kode #PKB2 dengan rangkaian anggrek biru moonlight mewah dan dudukan stabil. Sangat cocok untuk hadiah kelulusan, promosi jabatan, peresmian kantor, dan apresiasi relasi bisnis di Bandar Lampung maupun Kota Metro.",
  },
  1005: {
    seoTitle: "Plakat Papan Bunga Akrilik Bulat Anggrek Putih #PKB1",
    imageAlt: "Plakat Akrilik Bulat Rangkaian Bunga Anggrek Putih Ucapan Selamat Lampung",
    description:
      "Plakat papan bunga akrilik bentuk bulat kode #PKB1 berpadu hiasan anggrek putih bersih yang anggun. Cocok untuk hadiah pernikahan, pertunangan, wisuda, maupun ucapan pembukaan klinik/kafe di Bandar Lampung, Kedaton, Kemiling, dan Pesawaran.",
  },
  1006: {
    seoTitle: "Plakat Papan Bunga Akrilik Pink Mawar Love #PKK6",
    imageAlt: "Papan Bunga Akrilik Custom Mawar Pink Kado Wisuda dan Anniversary Bandar Lampung",
    description:
      "Plakat papan bunga akrilik kode #PKK6 berwarna pink lembut dengan aksen bunga mawar dan ornamen hati di tepi. Favorit untuk kado sidang kompre, wisuda, ulang tahun, dan anniversary dengan pengerjaan cepat 1-2 hari di Bandar Lampung, Way Hui, dan Kota Metro.",
  },
  1007: {
    seoTitle: "Plakat Papan Bunga Akrilik Hitam Emas Mewah #PKK7",
    imageAlt: "Plakat Papan Bunga Akrilik Hitam Emas Monokrom Eksklusif di Bandar Lampung",
    description:
      "Plakat papan bunga akrilik kode #PKK7 dengan perpaduan warna hitam dan emas monokromatik yang maskulin serta berkelas. Pilihan tepat untuk ucapan pelantikan pejabat, promosi pimpinan, grand opening bisnis, dan wisuda di Bandar Lampung, Tanjung Karang, serta Pringsewu.",
  },
  1008: {
    seoTitle: "Plakat Papan Bunga Akrilik Biru Muda Mawar #PKK4",
    imageAlt: "Papan Bunga Akrilik Biru Muda Hiasan Mawar Kado Kelulusan Lampung",
    description:
      "Plakat papan bunga akrilik kode #PKK4 bernuansa pastel biru muda sejuk dengan dekorasi mawar di sekeliling tepi akrilik. Cocok untuk hadiah sempro, sidang akhir, wisuda sekolah/universitas, dan ucapan selamat di Bandar Lampung, Rajabasa, Sukarame, hingga Natar.",
  },

  // === JASA & LAYANAN ===
  200: {
    seoTitle: "Jasa Desain ID Card, Lanyard, Banner & Merchandise",
    imageAlt: "Layanan Jasa Desain Grafis ID Card Lanyard dan Media Promosi Bandar Lampung",
    description:
      "Layanan jasa desain grafis profesional khusus layout siap cetak untuk ID card karyawan/panitia, tali lanyard custom, banner promosi, stiker kemasan, hingga plakat akrilik. Gratis konsultasi konsep awal sehingga pelanggan di Bandar Lampung, Metro, dan luar kota tetap mudah memesan meski belum memiliki file desain.",
  },
  2001: {
    seoTitle: "Layanan Cetak Express Kilat 24 Jam",
    imageAlt: "Layanan Tambahan Produksi Cetak Express Selesai 24 Jam ID Card Lampung",
    description:
      "Layanan prioritas percepatan antrian produksi (express 24 jam selesai) untuk kebutuhan mendesak event, konferensi, atau kunjungan kerja di Bandar Lampung dan sekitarnya.",
  },
  2002: {
    seoTitle: "Biaya Pengiriman Pesanan",
    imageAlt: "Pengiriman Pesanan Percetakan ID Card Lampung via Kurir Instan dan Ekspedisi",
    description:
      "Penyesuaian ongkos kirim kurir instan dalam kota maupun ekspedisi antarkota untuk pengiriman pesanan percetakan.",
  },

  // === APPAREL ===
  101: {
    seoTitle: "Cetak Gelang Tiket Kertas Lisse Tahan Air Konser & Event",
    imageAlt: "Cetak Gelang Tiket Kertas Event Konser dan Wahana Wisata di Bandar Lampung",
    description:
      "Cetak gelang tiket masuk bahan kertas sintetis tahan cipratan air dan tidak mudah putus untuk konser musik, pensi sekolah, seminar akbar, maupun wahana wisata di Bandar Lampung, Tanjung Karang, Kedaton, Kota Metro, dan seluruh Lampung.",
  },
  102: {
    seoTitle: "Cetak Gelang Tiket Kain Lanyard Tissue + Pengunci",
    imageAlt: "Cetak Gelang Tiket Bahan Kain Tissue Lembut Lengkap Lock Pengunci Lampung",
    description:
      "Cetak gelang tiket VIP bahan tisu/lanyard lembut full color sudah termasuk potongan rapi dan klip pengunci sekali pakai atau geser. Sangat nyaman dipakai untuk festival musik, event lari, dan gathering perusahaan di Bandar Lampung maupun luar kota.",
  },
  23: {
    seoTitle: "Jasa Sablon Kaos Custom DTF Satuan & Lusinan",
    imageAlt: "Tempat Sablon Kaos DTF Custom Satuan dan Komunitas di Bandar Lampung",
    description:
      "Cetak kaos custom sablon DTF (Direct Transfer Film) warna pekat, detail tajam, tekstur lentur tidak mudah retak, lengkap kaos katun nyaman berbagai pilihan warna. Melayani pembuatan kaos panitia, kaos kelas, seragam KKN, dan gathering kantor satuan maupun lusinan di Bandar Lampung, Rajabasa, Sukarame, dan Kota Metro.",
  },
  105: {
    seoTitle: "Konveksi Baju PDH / Kemeja Korsa Organisasi & Kampus",
    imageAlt: "Pembuatan Baju Kemeja PDH Korsa Himpunan Mahasiswa dan Komunitas di Lampung",
    description:
      "Pembuatan kemeja PDH / PDL / korsa custom jahitan rapi lengkap bordir komputer presisi untuk himpunan mahasiswa (ITERA, Unila, UIN Raden Intan, Polinela, UM Metro), organisasi sekolah, dan seragam kerja instansi di Bandar Lampung, Kota Metro, hingga Pringsewu.",
  },
};

export function isProductIndexable(product: Pick<Product, "id">): boolean {
  return !NON_INDEXABLE_PRODUCT_Ids.has(product.id);
}

export function getProductSeoTitle(product: Product): string {
  const mapped = PRODUCT_SEO_MAP[product.id];
  return product.seoTitle || mapped?.seoTitle || `Cetak ${product.name} Custom`;
}

export function getProductRichDescription(product: Product): string {
  const mapped = PRODUCT_SEO_MAP[product.id];
  // If product description is still the short generic one (< 90 chars) and we have an upgraded SEO entry, prefer the rich one
  if (mapped && (!product.description || product.description.length < 95)) {
    return mapped.description;
  }
  return product.description || mapped?.description || "";
}

export function getProductMetaDescription(product: Product): string {
  const lowestPrice =
    product.priceThresholds && product.priceThresholds.length > 0
      ? Math.min(...product.priceThresholds.map((t) => t.price))
      : product.discountPrice || product.price;

  const priceSnippet =
    lowestPrice > 0
      ? ` Mulai Rp ${lowestPrice.toLocaleString("id-ID")}/${product.unit || "pcs"}.`
      : "";

  const baseDesc = getProductRichDescription(product);
  const combined = `${baseDesc}${priceSnippet}`.replace(/\s+/g, " ").trim();

  if (combined.length <= 160) return combined;
  return `${combined.slice(0, 156).replace(/\s+\S*$/, "")}...`;
}

export function getProductImageAlt(product: Product, variantLabel?: string): string {
  const mapped = PRODUCT_SEO_MAP[product.id];
  const baseAlt =
    product.imageAlt ||
    mapped?.imageAlt ||
    `${product.name} - Cetak ${product.category} di Bandar Lampung & Kota Metro`;

  return variantLabel ? `${baseAlt} (${variantLabel})` : baseAlt;
}

export function getProductCanonicalUrl(product: Pick<Product, "name">): string {
  const slug = generateProductSlug(product.name);
  return `${SITE_ORIGIN}/product/${slug}`;
}

export function toAbsoluteAssetUrl(assetPath?: string): string {
  if (!assetPath) return `${SITE_ORIGIN}/logo-idcard-lampung.jpg`;
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }
  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return new URL(encodeURI(normalizedPath), SITE_ORIGIN).href;
}

