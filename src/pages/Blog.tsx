import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, User, Tag, Eye, Phone, Search, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MusicPlayer from "@/components/MusicPlayer";

// Declare window.instgrm for Instagram embed
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

interface BlogPost {
  id: number;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  tags: string[];
  readTime: string;
  views: number;
  image: string;
  slug: string;
}

// Blog posts data based on real customer experiences
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Pengalaman Cetak Perdana: Kisah di Balik Produksi 500+ ID Card & Lanyard untuk SMA Ar-Raihan Bandar Lampung",
    subtitle: "Tantangan dan proses di balik pesanan perdana dalam jumlah besar dari salah satu sekolah Islam terpadu terbaik di Lampung",
    author: "ID Card Lampung",
    date: "2024-01-20",
    tags: ["Sekolah", "ID Card", "Lanyard", "Studi Kasus", "Pendidikan"],
    readTime: "6 menit",
    views: 1450,
    image: "/blog-thumbnail/1_result.webp",
    slug: "pengalaman-cetak-perdana-sma-ar-raihan-bandar-lampung"
  },
  {
    id: 2,
    title: "Bukan Cuma Mahasiswa, PT. Bisi International Tbk. Lampung Juga Percayakan ID Card Karyawan pada Kami",
    subtitle: "Kepercayaan perusahaan nasional pada vendor lokal untuk kebutuhan ID Card karyawan berkualitas korporat",
    author: "ID Card Lampung",
    date: "2024-01-18",
    tags: ["Korporat", "BUMN", "ID Card", "Profesional", "Testimoni"],
    readTime: "5 menit",
    views: 1280,
    image: "/blog-thumbnail/2_result.webp",
    slug: "pt-bisi-international-percayakan-id-card-karyawan"
  },
  {
    id: 3,
    title: "Tampil Beda! Pondok Pesantren di Natar Makin Hitz Pakai ID Card Keren dari ID Card Lampung",
    subtitle: "Modernisasi identitas santri: bagaimana pondok pesantren meningkatkan keamanan dan rasa memiliki dengan ID Card",
    author: "ID Card Lampung",
    date: "2024-01-16",
    tags: ["Pesantren", "Komunitas", "Modern", "Identitas", "Natar"],
    readTime: "4 menit",
    views: 890,
    image: "/blog-thumbnail/3_result.webp",
    slug: "pondok-pesantren-natar-makin-hitz-pakai-id-card"
  },
  {
    id: 4,
    title: "Jadi Andalan Karyawan BUMN, Ini Alasan Mereka Terus Kembali Cetak ID Card di ID Card Lampung",
    subtitle: "Konsistensi kualitas dan pelayanan yang membuat karyawan BUMN menjadi pelanggan setia kami",
    author: "ID Card Lampung",
    date: "2024-01-14",
    tags: ["BUMN", "Loyalitas", "Kualitas", "Pelanggan Setia", "Testimoni"],
    readTime: "5 menit",
    views: 1150,
    image: "/blog-thumbnail/4_result.webp",
    slug: "andalan-karyawan-bumn-id-card-lampung"
  },
  {
    id: 5,
    title: "KHUSUS MAHASISWA KKN! Diskon 15% untuk ID Card & Lanyard di ID Card Lampung",
    subtitle: "Apresiasi untuk semangat pengabdian mahasiswa KKN dengan diskon spesial dan layanan terbaik",
    author: "ID Card Lampung",
    date: "2024-01-12",
    tags: ["KKN", "Mahasiswa", "Diskon", "Promo", "Pengabdian"],
    readTime: "3 menit",
    views: 2100,
    image: "/blog-thumbnail/5_result.webp",
    slug: "diskon-khusus-mahasiswa-kkn-15-persen"
  },
  {
    id: 6,
    title: "Rahasia Produksi Super Cepat di ID Card Lampung: Aplikasi Custom Buatan Sendiri!",
    subtitle: "Inovasi teknologi auto-layout yang mengubah cara kami memproduksi ratusan ID Card dengan cepat dan akurat",
    author: "ID Card Lampung",
    date: "2024-01-10",
    tags: ["Teknologi", "Inovasi", "Auto-layout", "Produksi", "Efisiensi"],
    readTime: "7 menit",
    views: 980,
    image: "/blog-thumbnail/6_result.webp",
    slug: "rahasia-produksi-super-cepat-aplikasi-custom"
  },
  {
    id: 7,
    title: "Gak Perlu Keluar Rumah, Cetak ID Card & Lanyard di Lampung Kini Bisa dari Mana Saja via Tidurlah.com",
    subtitle: "Kemudahan memesan ID Card secara online: dari konsultasi hingga pengiriman ke rumah tanpa ribet",
    author: "ID Card Lampung",
    date: "2024-01-08",
    tags: ["Online", "Kemudahan", "Digital", "Pemesanan", "Anti-ribet"],
    readTime: "4 menit",
    views: 1350,
    image: "/blog-thumbnail/7_result.webp",
    slug: "cetak-id-card-online-dari-rumah"
  },
  {
    id: 8,
    title: "Tembus 1000 pcs/Bulan! ITERA, UNILA, UMITRA, UBL, UTB, UIN Kompak Cetak ID Card di ID Card Lampung",
    subtitle: "Pencapaian produksi 1000+ ID Card per bulan dan kepercayaan dari kampus-kampus terbesar di Lampung",
    author: "ID Card Lampung",
    date: "2024-01-06",
    tags: ["Universitas", "Kampus", "Milestone", "Volume", "Kepercayaan"],
    readTime: "6 menit",
    views: 1680,
    image: "/blog-thumbnail/8_result.webp",
    slug: "tembus-1000-pcs-per-bulan-kampus-lampung"
  },
  {
    id: 9,
    title: "Sudah Jadi Tradisi, Mahasiswa KKN UIN Raden Intan Lampung Selalu Jadi Langganan Cetak ID Card di Sini!",
    subtitle: "Bagaimana informasi dari angkatan ke angkatan membuat kami menjadi 'tradisi' bagi mahasiswa KKN UIN",
    author: "ID Card Lampung",
    date: "2024-01-04",
    tags: ["UIN", "KKN", "Tradisi", "Mahasiswa", "Loyalitas"],
    readTime: "4 menit",
    views: 920,
    image: "/blog-thumbnail/9_result.webp",
    slug: "tradisi-mahasiswa-kkn-uin-raden-intan-lampung"
  },
  {
    id: 10,
    title: "Sebar 1000+ Mahasiswa KKN, ITERA Percayakan Produksi Massal ID Card & Lanyard pada ID Card Lampung",
    subtitle: "Studi kasus produksi massal: mengelola pesanan 1000+ ID Card untuk KKN ITERA dalam waktu singkat",
    author: "ID Card Lampung",
    date: "2024-01-02",
    tags: ["ITERA", "Produksi Massal", "KKN", "Volume Tinggi", "Manajemen"],
    readTime: "8 menit",
    views: 1320,
    image: "/blog-thumbnail/10_result.webp",
    slug: "itera-percayakan-produksi-massal-1000-id-card"
  },
  {
    id: 11,
    title: "Standar Kualitas Tinggi: Fakultas Kedokteran Malahayati Selalu Pesan ID Card dalam Jumlah Banyak di Sini",
    subtitle: "Memenuhi standar presisi dan profesionalisme untuk lingkungan medis yang mengutamakan kualitas premium",
    author: "ID Card Lampung",
    date: "2023-12-30",
    tags: ["Kedokteran", "Premium", "Malahayati", "Kualitas Tinggi", "Medis"],
    readTime: "5 menit",
    views: 1050,
    image: "/blog-thumbnail/11_result.webp",
    slug: "standar-kualitas-tinggi-fakultas-kedokteran-malahayati"
  },
  {
    id: 12,
    title: "Lanyard Cepat Kusam? Ini 4 Cara Mudah Merawatnya (Bedanya Printing vs Sablon)",
    subtitle: "Tips praktis merawat lanyard dan ID card agar awet bertahun-tahun, plus perbedaan perawatan printing vs sablon",
    author: "ID Card Lampung",
    date: "2024-01-25",
    tags: ["Tips", "Perawatan", "Lanyard", "Printing", "Sablon"],
    readTime: "4 menit",
    views: 750,
    image: "/blog-thumbnail/12_result.webp",
    slug: "lanyard-cepat-kusam-4-cara-mudah-merawatnya"
  },
  {
    id: 13,
    title: "Studi Kasus: Begini Cara 'Lampung Creative Week' Sukses Branding dengan Lanyard Custom",
    subtitle: "Kisah sukses kolaborasi strategis antara Tidurlah Grafika dengan festival kreatif terbesar di Lampung",
    author: "ID Card Lampung", 
    date: "2024-01-23",
    tags: ["Studi Kasus", "Event", "Branding", "Creative Week", "Lanyard Custom"],
    readTime: "6 menit",
    views: 1250,
    image: "/blog-thumbnail/13_result.webp",
    slug: "lampung-creative-week-sukses-branding-lanyard-custom"
  },
  {
    id: 14,
    title: "Investasi Profesional: Panduan Memilih ID Card yang Tepat untuk Kantor di Bandar Lampung",
    subtitle: "Panduan lengkap memilih antara ID Card PVC standar atau kartu proximity untuk kebutuhan profesional kantor",
    author: "ID Card Lampung",
    date: "2024-01-21",
    tags: ["Panduan", "ID Card", "Kantor", "PVC", "Proximity", "Profesional"],
    readTime: "7 menit",
    views: 980,
    image: "/blog-thumbnail/14_result.webp",
    slug: "panduan-memilih-id-card-tepat-kantor-bandar-lampung"
  },
  {
    id: 15,
    title: "5 Ide Desain Lanyard Anti-Bosan untuk Event Hits di Lampung",
    subtitle: "Inspirasi desain lanyard kreatif untuk event organizer dan kreator acara di Lampung",
    author: "ID Card Lampung",
    date: "2024-01-19",
    tags: ["Desain", "Inspirasi", "Event", "Lanyard", "Kreatif"],
    readTime: "5 menit",
    views: 1180,
    image: "/blog-thumbnail/15_result.webp", 
    slug: "5-ide-desain-lanyard-anti-bosan-event-hits-lampung"
  },
  {
    id: 16,
    title: "Komitmen Kami terhadap Privasi Anda",
    subtitle: "Kebijakan privasi lengkap tentang bagaimana Tidurlah Grafika melindungi dan mengelola informasi pribadi pelanggan",
    author: "Tidurlah Grafika",
    date: "2024-01-30",
    tags: ["Kebijakan", "Privasi", "Keamanan", "Informasi", "Perlindungan"],
    readTime: "8 menit",
    views: 450,
    image: "/blog-thumbnail/1_result.webp",
    slug: "kebijakan-privasi"
  },
  {
    id: 17,
    title: "Apa yang bisa kami bantu?",
    subtitle: "Pertanyaan umum seputar ID Card, Lanyard, dan layanan Tidurlah Grafika yang sering ditanyakan pelanggan",
    author: "ID Card Lampung",
    date: "2024-02-01",
    tags: ["FAQ", "Bantuan", "ID Card", "Lanyard", "Produk"],
    readTime: "6 menit",
    views: 680,
    image: "/blog-thumbnail/2_result.webp",
    slug: "faq-pertanyaan-umum"
  },
  {
    id: 18,
    title: "Syarat & Ketentuan Pengembalian Barang",
    subtitle: "Kebijakan pengembalian yang fleksibel dan mudah diikuti untuk kepuasan pelanggan Tidurlah Grafika",
    author: "ID Card Lampung",
    date: "2024-02-02",
    tags: ["Kebijakan", "Pengembalian", "Syarat", "Ketentuan", "Garansi"],
    readTime: "5 menit",
    views: 320,
    image: "/blog-thumbnail/3_result.webp",
    slug: "syarat-ketentuan-pengembalian"
  }
];

const Blog = () => {
  const navigate = useNavigate();
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(blogPosts);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Set document title
    document.title = "Blog - Tips dan Panduan ID Card, Merchandise & Promosi - TIDURLAH STORE";
    
    // Update current time
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeString);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    // Load Instagram embed script
    const loadInstagramScript = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      } else {
        const script = document.createElement('script');
        script.src = '//www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };
    
    // Delay to ensure DOM is ready
    setTimeout(loadInstagramScript, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Get all unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  const filterByTag = (tag: string) => {
    if (tag === selectedTag) {
      setSelectedTag("");
      applyFilters("", searchQuery);
    } else {
      setSelectedTag(tag);
      applyFilters(tag, searchQuery);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(selectedTag, query);
  };

  const applyFilters = (tag: string, search: string) => {
    let filtered = blogPosts;
    
    if (tag) {
      filtered = filtered.filter(post => post.tags.includes(tag));
    }
    
    if (search) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    setFilteredPosts(filtered);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: '2-digit', 
      month: 'short', 
      day: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 notranslate" translate="no">
      <div className="container mx-auto max-w-6xl bg-white min-h-screen">
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
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Blog TIDURLAH STORE
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Tips, panduan, dan informasi terbaru seputar ID Card, Merchandise Custom, dan Media Promosi
              </p>
            </div>

            {/* Main Layout with Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-3">
                {/* Search Results Info */}
                {(searchQuery || selectedTag) && (
                  <div className="mb-6 p-4 bg-[#FF5E01]/5 border border-[#FF5E01]/20 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Menampilkan {filteredPosts.length} artikel
                      {selectedTag && ` dengan tag "${selectedTag}"`}
                      {searchQuery && ` untuk pencarian "${searchQuery}"`}
                    </p>
                  </div>
                )}

                {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {filteredPosts.map((post) => (
                    <article 
                      key={post.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <div className="relative pt-[50%]">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="p-4">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.tags.slice(0, 2).map((tag, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FF5E01]/10 text-[#FF5E01]"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{post.tags.length - 2}</span>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 hover:text-[#FF5E01] transition-colors">
                          {post.title}
                        </h2>

                        {/* Subtitle */}
                        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                          {post.subtitle}
                        </p>

                        {/* Meta Information */}
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 font-medium">
                            {post.author}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center space-x-1.5">
                            <span>{formatDate(post.date)}</span>
                            <span>•</span>
                            <span>{post.views}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-[#FF5E01]/5 to-[#FF5E01]/10 rounded-xl p-6 text-center border border-[#FF5E01]/20">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Butuh Bantuan dengan Proyek Anda?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tim ahli TIDURLAH STORE siap membantu merealisasikan kebutuhan ID Card, Merchandise, dan Media Promosi Anda dengan kualitas terbaik.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => navigate('/')}
                      className="bg-[#FF5E01] text-white rounded-lg py-2 px-4 font-medium hover:bg-[#FF5E01]/90 transition-colors"
                    >
                      Lihat Produk Kami
                    </button>
                    <a 
                      href="https://wa.me/6285172157808?text=Halo, saya ingin konsultasi mengenai layanan TIDURLAH STORE."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-[#25D366] text-white rounded-lg py-2 px-4 font-medium hover:bg-[#25D366]/90 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                        <path d="M17.6 6.31999C16.2 4.91999 14.2 4.09999 12.1 4.09999C7.79995 4.09999 4.29995 7.59999 4.29995 11.9C4.29995 13.3 4.69995 14.7 5.39995 15.9L4.19995 19.9L8.29995 18.7C9.49995 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.79999 19 7.79999 17.6 6.31999ZM12.1 18.3C10.9 18.3 9.69995 17.9 8.69995 17.2L8.39995 17L5.99995 17.7L6.69995 15.4L6.39995 15.1C5.59995 14 5.19995 13 5.19995 11.9C5.19995 8.09999 8.29995 5.09999 12 5.09999C13.8 5.09999 15.5 5.79999 16.7 6.99999C17.9 8.19999 18.6 9.89999 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.89995 11.5C9.69995 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.79995 9.19999 9.59995 8.79999C9.39995 8.39999 9.19995 8.39999 8.99995 8.39999C8.89995 8.39999 8.69995 8.39999 8.49995 8.39999C8.29995 8.39999 7.99995 8.49999 7.79995 8.79999C7.59995 9.09999 7.09995 9.49999 7.09995 10.4C7.09995 11.3 7.79995 12.2 7.89995 12.4C8.09995 12.6 9.69995 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z" fill="white"/>
                      </svg>
                      Konsultasi Gratis
                    </a>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Search Widget */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Search className="h-5 w-5 mr-2 text-[#FF5E01]" />
                    Cari Artikel
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari topik, tag, atau kata kunci..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5E01]/20 focus:border-[#FF5E01] text-sm"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Tags Filter Widget */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-[#FF5E01]" />
                    Filter Kategori
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => filterByTag(tag)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedTag === tag
                            ? "bg-[#FF5E01] text-white"
                            : "bg-[#FF5E01]/10 text-[#FF5E01] border border-[#FF5E01]/20 hover:bg-[#FF5E01]/20"
                        }`}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Time Widget */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-[#FF5E01]" />
                    Waktu Sekarang
                  </h3>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {currentTime}
                  </div>
                </div>

                {/* Instagram Embed Widget */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: `
                        <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/idcard_lampung" data-instgrm-version="12" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:undefinedpx;height:undefinedpx;max-height:100%; width:undefinedpx;">
                          <div style="padding:16px;"> 
                            <a id="main_link" href="https://www.instagram.com/idcard_lampung" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> 
                              <div style=" display: flex; flex-direction: row; align-items: center;"> 
                                <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> 
                                <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> 
                                  <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> 
                                  <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
                                </div>
                              </div>
                              <div style="padding: 19% 0;"></div> 
                              <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
                                <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink">
                                  <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                                      <g>
                                        <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                                      </g>
                                    </g>
                                  </g>
                                </svg>
                              </div>
                              <div style="padding-top: 8px;"> 
                                <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;"> View this post on Instagram</div>
                              </div>
                              <div style="padding: 12.5% 0;"></div> 
                              <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;">
                                <div> 
                                  <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> 
                                  <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> 
                                  <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div>
                                </div>
                                <div style="margin-left: 8px;"> 
                                  <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> 
                                  <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div>
                                </div>
                                <div style="margin-left: auto;"> 
                                  <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> 
                                  <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> 
                                  <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div>
                                </div>
                              </div> 
                              <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> 
                                <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> 
                                <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div>
                              </div>
                            </a>
                            <p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;">
                              <a href="https://www.instagram.com/idcard_lampung" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">Shared post</a> on <time style=" font-family:Arial,sans-serif; font-size:14px; line-height:17px;">Instagram</time>
                            </p>
                          </div>
                        </blockquote>
                        <script async src="//www.instagram.com/embed.js"></script>
                        <script type="text/javascript" src="https://www.embedista.com/j/instagramfeed1707.js"></script>
                      `
                    }}
                  />
                </div>

                {/* Maps Widget */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-[#FF5E01]" />
                    Lokasi Kami
                  </h3>
                  <div style={{maxWidth: '100%', overflow: 'hidden', width: '100%', height: '200px'}}>
                    <div id="my-map-display" style={{height: '100%', width: '100%', maxWidth: '100%'}}>
                      <iframe 
                        style={{height: '100%', width: '100%', border: 0}} 
                        frameBorder="0" 
                        src="https://www.google.com/maps/embed/v1/search?q=id+card+lampung&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Perum. Korpri Raya, Blok D3. No. 3, Sukarame, Bandar Lampung
                  </p>
                </div>
              </div>
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

export default Blog; 