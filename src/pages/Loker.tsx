import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Briefcase, MapPin, Clock, GraduationCap, CheckCircle, XCircle, Share2, ArrowRight } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ApplyButton from "@/components/ApplyButton";
import { toast } from "sonner";

// Job data structure
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
    location: "Remote",
    workHours: "8 jam/hari (fleksibel)",
    education: "SMA/SLTA Sederajat atau S1 semua bidang",
    workType: "Full-time",
    description: "Posisi ini bertanggung jawab untuk semua kebutuhan desain grafis Tidurlah Store, mulai dari aset media sosial hingga desain pesanan klien. Ini adalah posisi remote (jarak jauh).",
    responsibilities: [
      "Membuat desain materi promosi untuk media sosial (IG, TikTok, dll.)",
      "Menyiapkan dan mengedit file desain dari klien agar siap cetak",
      "Mengembangkan mockup produk baru",
      "Berkolaborasi dengan tim admin untuk memahami kebutuhan klien"
    ],
    qualifications: [
      "Portofolio yang menunjukkan kemampuan layout design yang kuat (wajib dilampirkan)",
      "Memahami color theory untuk keperluan printing",
      "Mahir menggunakan CorelDRAW, Canva, dan/atau Photoshop",
      "Kreatif, komunikatif, dan dapat bekerja sesuai deadline",
      "Memiliki laptop/PC pribadi dan koneksi internet yang stabil"
    ],
    isAvailable: true
  },
  {
    id: "admin-toko",
    title: "Admin Toko",
    location: "Lampung",
    workHours: "8 jam/hari (09.00 - 17.00)",
    education: "SMA/SLTA Sederajat atau S1 semua bidang",
    workType: "Full-time",
    description: "Anda akan menjadi wajah dan suara dari Tidurlah Store. Posisi ini bertanggung jawab mengelola pesanan, komunikasi dengan pelanggan, dan administrasi umum.",
    responsibilities: [
      "Menerima dan membalas chat/DM/email dari pelanggan dengan ramah dan cepat",
      "Mencatat dan merekap data pesanan harian",
      "Berkoordinasi dengan tim produksi mengenai antrian pesanan",
      "Mengelola stok barang dan bahan baku"
    ],
    qualifications: [
      "Teliti, terorganisir, dan rapi dalam administrasi",
      "Dapat berkomunikasi dengan baik dan sopan",
      "Biasa menggunakan WhatsApp Business, Instagram, dan Spreadsheet (Google Sheets/Excel)",
      "Jujur dan bertanggung jawab",
      "Berdomisili di Lampung"
    ],
    isAvailable: true
  },
  {
    id: "bagian-produksi",
    title: "Bagian Produksi",
    location: "Lampung",
    workHours: "8 jam/hari (09.00 - 17.00)",
    education: "SMA/SLTA Sederajat atau S1 semua bidang",
    workType: "Full-time",
    description: "Posisi ini adalah jantung dari bisnis kami. Anda bertanggung jawab untuk mencetak, memotong, dan mengemas semua pesanan ID card dan merchandise sesuai standar kualitas.",
    responsibilities: [
      "Mengoperasikan mesin cetak, press, dan mesin potong (akan ada training)",
      "Melakukan quality control (pengecekan kualitas) pada setiap produk",
      "Mengemas (packing) pesanan dengan rapi dan aman",
      "Memastikan area kerja selalu bersih dan terawat"
    ],
    qualifications: [
      "Sangat teliti dan memperhatikan detail",
      "Mau belajar mengoperasikan mesin",
      "Dapat bekerja dengan target dan gesit",
      "Rajin, jujur, dan memiliki fisik yang sehat",
      "Berdomisili di Lampung"
    ],
    isAvailable: true
  },
  {
    id: "reseller",
    title: "Reseller",
    location: "Fleksibel - Remote/Anywhere",
    workHours: "Fleksibel (tidak terikat waktu)",
    education: "SMA/SLTA Sederajat atau S1 semua bidang",
    workType: "Komisi & Insentif",
    description: "Jadilah mitra bisnis kami dan dapatkan penghasilan tambahan dengan menjual produk-produk Tidurlah Grafika. Cocok untuk mahasiswa, ibu rumah tangga, atau siapa saja yang ingin mendapat penghasilan fleksibel.",
    responsibilities: [
      "Mempromosikan produk Tidurlah Grafika melalui media sosial atau jaringan pribadi",
      "Menghubungkan calon pelanggan dengan tim kami",
      "Membantu proses komunikasi antara pelanggan dan tim produksi",
      "Memberikan informasi produk yang akurat kepada calon pelanggan"
    ],
    qualifications: [
      "Memiliki smartphone dan akses internet",
      "Aktif di media sosial (Instagram, WhatsApp, TikTok, Facebook, dll)",
      "Komunikatif dan senang berinteraksi dengan orang lain",
      "Jujur dan dapat dipercaya",
      "Tidak diperlukan modal awal atau stok barang",
      "Terbuka untuk semua usia dan latar belakang"
    ],
    benefits: [
      "Komisi menarik: Dapatkan 10-15% komisi dari setiap transaksi yang berhasil",
      "Harga khusus reseller: Akses harga lebih murah untuk dijual kembali dengan margin keuntungan Anda sendiri",
      "Bonus penjualan: Bonus tambahan untuk target penjualan bulanan (mencapai 10 transaksi/bulan)",
      "Gratis materi promosi: Kami sediakan desain promosi digital untuk media sosial Anda",
      "Sistem pembayaran fleksibel: Transfer langsung setelah transaksi selesai",
      "Tanpa target minimum: Tidak ada kewajiban penjualan, bekerja sesuai kemampuan Anda",
      "Pelatihan gratis: Training produk knowledge dan teknik penjualan"
    ],
    isAvailable: true
  }
];

const Loker = () => {
  const navigate = useNavigate();
  const { jobSlug } = useParams();

  // Handle individual job view
  if (jobSlug) {
    const job = jobs.find(j => j.id === jobSlug);
    if (!job) {
      navigate('/loker');
      return null;
    }
    return <JobDetailPage job={job} />;
  }

  const handleJobShare = (job: Job) => {
    const shareUrl = `${window.location.origin}/loker/${job.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Lowongan Kerja: ${job.title} - Tidurlah Store`,
        text: `Lihat lowongan kerja ${job.title} di Tidurlah Store`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link lowongan kerja disalin!", { 
        position: 'top-center', 
        style: { marginTop: '60px' } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden hero-section">
        <div className="container mx-auto max-w-7xl px-4 py-8 lg:py-12 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Punya <span className="text-[#FF5E01]">Bakat?</span><br />
                  Temui <span className="text-[#FF5E01]">Peluang!</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Kami mencari talenta kreatif sepertimu untuk berkembang bersama.
                </p>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Judul pekerjaan atau kata kunci"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF5E01] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Semua Lokasi"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF5E01] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <button className="bg-[#FF5E01] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#e54d00] transition-colors whitespace-nowrap">
                    Cari
                  </button>
                </div>
              </div>

            </div>

            {/* Right Side - Image Placeholder - Hidden on Mobile */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-64 sm:h-80 lg:h-96 xl:h-[500px]">
                {/* Background Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px] bg-gradient-to-br from-orange-100 to-pink-100 rounded-full opacity-80"></div>
                
                {/* Image Placeholder */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#FF5E01] to-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Briefcase className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Bergabung dengan Tim</h3>
                      <p className="text-gray-600 text-sm">Temukan peluang karir terbaik di Tidurlah Store</p>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-4 right-4 bg-yellow-100 rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">Job Alert</span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 bg-blue-400 rounded-full border-2 border-white"></div>
                      <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                      <div className="w-6 h-6 bg-purple-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-gray-700">Giliran Kamu</p>
                      <p className="text-gray-500">mendapat kerja</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-[#FF5E01] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              LOWONGAN KERJA
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Bergabung dengan <span className="text-[#FF5E01]">Tim Kami!</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Kami adalah layanan cetak ID card dan merchandise kreatif terkemuka di Lampung. 
              Seiring dengan perkembangan kami, kami mencari individu yang bersemangat, berbakat, 
              dan teliti untuk bergabung dengan tim kami.
            </p>
          </div>

          {/* Job Cards Grid - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {jobs.map((job) => (
              <div 
                key={job.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100"
                onClick={() => navigate(`/loker/${job.id}`)}
              >
                {/* Job Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {job.isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <XCircle className="h-3 w-3" />
                            Ditutup
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF5E01]/10 text-[#FF5E01]">
                          {job.workType}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FF5E01] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{job.workHours}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  {/* Quick Info */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-[#FF5E01]" />
                      <span className="text-gray-600">{job.education}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Klik untuk detail</span>
                    <ArrowRight className="h-5 w-5 text-[#FF5E01] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-[#FF5E01] to-[#e54d00] rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Tertarik Bergabung dengan Kami?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Kirim lamaran Anda melalui email atau hubungi kami untuk informasi lebih lanjut
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:idcardlampung@tidurlah.com"
                className="bg-white text-[#FF5E01] px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Kirim Email
              </a>
              <a 
                href="https://wa.me/6285172157808"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#25D366]/90 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Job Detail Page Component
const JobDetailPage = ({ job }: { job: Job }) => {
  const navigate = useNavigate();

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/loker/${job.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Lowongan Kerja: ${job.title} - Tidurlah Store`,
        text: `Lihat lowongan kerja ${job.title} di Tidurlah Store`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link lowongan kerja disalin!", { 
        position: 'top-center', 
        style: { marginTop: '60px' } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-4 md:py-8">
          {/* Breadcrumb - Compact on Mobile */}
          <nav className="mb-4 md:mb-6">
            <span className="text-gray-500 text-xs md:text-sm">
              <button onClick={() => navigate('/')} className="hover:text-[#FF5E01]">Home</button> / 
              <button onClick={() => navigate('/loker')} className="hover:text-[#FF5E01] ml-1"> Karir</button> / 
              <span className="text-gray-700 ml-1">{job.title}</span>
            </span>
          </nav>

          {/* Job Detail Card - Compact Design */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden">
            {/* Job Header - Compact */}
            <div className="bg-gradient-to-r from-[#FF5E01] to-[#e54d00] p-4 md:p-6 lg:p-8 text-white">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {job.isAvailable ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        Tersedia
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <XCircle className="h-3 w-3" />
                        Ditutup
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                      {job.workType}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3">{job.title}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm md:text-base">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.workHours}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Bagikan</span>
                </button>
              </div>
            </div>

            {/* Job Content - Compact Spacing */}
            <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Deskripsi Pekerjaan</h2>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">{job.description}</p>
              </div>

              {/* Education & Work Type - Compact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="flex items-start gap-2 md:gap-3">
                  <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-[#FF5E01] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">Pendidikan Minimum</h3>
                    <p className="text-xs md:text-sm text-gray-700">{job.education}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-[#FF5E01] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">Jenis Kerja</h3>
                    <p className="text-xs md:text-sm text-gray-700">{job.workType}</p>
                  </div>
                </div>
              </div>

              {/* Responsibilities - Compact */}
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Tanggung Jawab</h2>
                <ul className="space-y-2 md:space-y-3">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2 md:gap-3">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#FF5E01] rounded-full mt-2 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-700 leading-relaxed">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Qualifications - Compact */}
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Kualifikasi</h2>
                <ul className="space-y-2 md:space-y-3">
                  {job.qualifications.map((qualification, index) => (
                    <li key={index} className="flex items-start gap-2 md:gap-3">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#FF5E01] rounded-full mt-2 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-700 leading-relaxed">{qualification}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits (for Reseller) - Compact */}
              {job.benefits && (
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Benefit & Keuntungan</h2>
                  <ul className="space-y-2 md:space-y-3">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 md:gap-3">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-gray-700 leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons - Compact */}
              <div className="pt-4 md:pt-6 border-t border-gray-200">
                <ApplyButton 
                  posisi={job.title}
                  isAvailable={job.isAvailable}
                  onShare={handleShare}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Loker;