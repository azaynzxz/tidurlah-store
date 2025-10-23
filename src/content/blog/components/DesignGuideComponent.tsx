import { useState } from "react";

const DesignGuideComponent = () => {
  const [activeSection, setActiveSection] = useState<'main' | 'idcard-lanyard' | 'mug-tumbler'>('main');
  const [modalImage, setModalImage] = useState<string | null>(null);

  const showSection = (section: 'main' | 'idcard-lanyard' | 'mug-tumbler') => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openImageModal = (imageSrc: string) => {
    setModalImage(imageSrc);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Panduan Desain</h1>
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">Selamat datang di halaman Panduan Desain! Di sini, kami menyediakan panduan lengkap untuk mendesain produk ID Card, Lanyard, Mug, dan Tumbler.</p>
          <p className="text-gray-700 leading-relaxed">Panduan ini bertujuan untuk menyesuaikan ukuran desain dengan hasil cetak produk yang diinginkan. Dengan mengikuti panduan desain kami, Anda akan memahami berbagai elemen penting seperti ukuran, format, tata letak, warna, dan tipografi yang ideal untuk setiap produk.</p>
        </div>
      </div>

      {/* Main Navigation Sections */}
      {activeSection === 'main' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID Card & Lanyard Section */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <img 
                  src="/product-image/lanyard-icon.webp" 
                  alt="ID Card dan Lanyard Icon" 
                  className="w-12 h-12 object-contain mr-4"
                />
                <h2 className="text-xl font-bold text-gray-900">Panduan Desain ID Card dan Lanyard</h2>
              </div>
              <p className="text-gray-600 mb-4">Tips dan panduan untuk menciptakan desain ID Card dan Lanyard yang profesional dengan spesifikasi yang tepat.</p>
              <button 
                onClick={() => showSection('idcard-lanyard')}
                className="w-full bg-[#FF5E01] text-white rounded-lg py-2 px-4 font-medium hover:bg-[#e54d00] transition-colors"
              >
                Selengkapnya
              </button>
            </div>

            {/* Mug & Tumbler Section */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <img 
                  src="/product-image/mug-icon.webp" 
                  alt="Mug dan Tumbler Icon" 
                  className="w-12 h-12 object-contain mr-4"
                />
                <h2 className="text-xl font-bold text-gray-900">Panduan Desain Mug & Tumbler</h2>
              </div>
              <p className="text-gray-600 mb-4">Panduan lengkap untuk mendesain Mug dan Tumbler dengan layout dan batas aman yang optimal.</p>
              <button 
                onClick={() => showSection('mug-tumbler')}
                className="w-full bg-[#FF5E01] text-white rounded-lg py-2 px-4 font-medium hover:bg-[#e54d00] transition-colors"
              >
                Selengkapnya
              </button>
            </div>
          </div>

          {/* Quote Section */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 text-center">
            <blockquote className="text-xl font-semibold text-gray-800 italic">
              "Not everyone knows design, but everything is designed."
            </blockquote>
          </div>
        </>
      )}

      {/* ID Card & Lanyard Detail Section */}
      {activeSection === 'idcard-lanyard' && (
        <div className="border-t-4 border-[#FF5E01] pt-8">
          <button 
            onClick={() => showSection('main')}
            className="mb-6 text-[#FF5E01] hover:text-[#e54d00] flex items-center font-medium"
          >
            ← Kembali ke Menu Utama
          </button>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Panduan Desain ID Card dan Lanyard</h2>
          <div className="space-y-4 mb-8">
            <p className="text-gray-700 leading-relaxed font-semibold">Tips dan Inspirasi untuk Menciptakan Desain Profesional</p>
            <p className="text-gray-700 leading-relaxed">Selamat datang di Panduan Desain ID Card dan Lanyard dari ID Card Lampung. Di halaman ini, kami akan memberikan panduan untuk membantu Anda menciptakan desain ID Card dan lanyard yang sesuai dengan standar cetak ID Card dan Lanyard kami.</p>
            <p className="text-gray-700 leading-relaxed">Apakah Anda mendesain untuk perusahaan, acara, atau organisasi, panduan ini akan memastikan desain Anda sesuai dan memenuhi kebutuhan Anda.</p>
          </div>

          {/* Product Guides */}
          <div className="space-y-8 mb-8">
            {/* ID Card Guide */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Panduan Desain ID Card</h3>
              <p className="text-gray-600 mb-4">Ukuran: 56 mm x 86 mm</p>
              <div className="text-center">
                <div 
                  className="cursor-pointer group"
                  onClick={() => openImageModal('/product-image/panduan-id-card.webp')}
                >
                  <img 
                    src="/product-image/panduan-id-card.webp" 
                    alt="Panduan desain ID Card dengan spesifikasi lengkap" 
                    className="w-full h-auto object-contain rounded-lg shadow-md mb-3 group-hover:scale-105 transition-transform duration-300"
                    style={{maxHeight: '600px'}}
                  />
                  <p className="text-sm text-gray-600 italic hover:text-[#FF5E01]">Klik untuk memperbesar panduan desain ID Card</p>
                </div>
              </div>
            </div>

            {/* Lanyard Guide */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Panduan Desain Lanyard</h3>
              <p className="text-gray-600 mb-4">Ukuran: 90 cm x 2,25 cm</p>
              <div className="text-center">
                <div 
                  className="cursor-pointer group"
                  onClick={() => openImageModal('/product-image/panduan-lanyard.webp')}
                >
                  <img 
                    src="/product-image/panduan-lanyard.webp" 
                    alt="Panduan desain Lanyard dengan spesifikasi lengkap" 
                    className="w-full h-auto object-contain rounded-lg shadow-md mb-3 group-hover:scale-105 transition-transform duration-300"
                    style={{maxHeight: '600px'}}
                  />
                  <p className="text-sm text-gray-600 italic hover:text-[#FF5E01]">Klik untuk memperbesar panduan desain Lanyard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Examples Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Lihat Contoh Berikut</h3>
            <div className="flex justify-center">
              <div 
                className="cursor-pointer group"
                onClick={() => openImageModal('/product-image/contoh-lanyard.webp')}
              >
                <img 
                  src="/product-image/contoh-lanyard.webp" 
                  alt="Contoh desain lanyard profesional" 
                  className="max-w-full h-auto object-contain rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                  style={{maxHeight: '400px'}}
                />
                <p className="text-gray-600 text-sm text-center mt-3 italic hover:text-[#FF5E01]">Klik untuk memperbesar contoh desain lanyard</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mug & Tumbler Detail Section */}
      {activeSection === 'mug-tumbler' && (
        <div className="border-t-4 border-[#FF5E01] pt-8">
          <button 
            onClick={() => showSection('main')}
            className="mb-6 text-[#FF5E01] hover:text-[#e54d00] flex items-center font-medium"
          >
            ← Kembali ke Menu Utama
          </button>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Panduan Desain Mug & Tumbler</h2>
          <p className="text-gray-700 leading-relaxed mb-8">Panduan desain ini ditujukan untuk memastikan desain Mug dan Tumbler Anda sesuai dengan ukuran dan spesifikasi cetak kami. Pastikan Anda mengikuti layout dan batas aman agar hasil cetak optimal.</p>

          {/* Product Guides */}
          <div className="space-y-8">
            {/* Mug Guide */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Panduan Desain Mug</h3>
              <div className="text-center">
                <div 
                  className="cursor-pointer group"
                  onClick={() => openImageModal('/product-image/panduan-cetak-mug.webp')}
                >
                  <img 
                    src="/product-image/panduan-cetak-mug.webp" 
                    alt="Panduan desain mug dengan spesifikasi lengkap" 
                    className="w-full h-auto object-contain rounded-lg shadow-md mb-3 group-hover:scale-105 transition-transform duration-300"
                    style={{maxHeight: '600px'}}
                  />
                  <p className="text-sm text-gray-600 italic hover:text-[#FF5E01]">Klik untuk memperbesar panduan desain Mug</p>
                </div>
              </div>
            </div>

            {/* Tumbler Guide */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Panduan Desain Tumbler</h3>
              <div className="text-center">
                <div 
                  className="cursor-pointer group"
                  onClick={() => openImageModal('/product-image/panduan-cetak-tumbler.webp')}
                >
                  <img 
                    src="/product-image/panduan-cetak-tumbler.webp" 
                    alt="Panduan desain tumbler dengan spesifikasi lengkap" 
                    className="w-full h-auto object-contain rounded-lg shadow-md mb-3 group-hover:scale-105 transition-transform duration-300"
                    style={{maxHeight: '600px'}}
                  />
                  <p className="text-sm text-gray-600 italic hover:text-[#FF5E01]">Klik untuk memperbesar panduan desain Tumbler</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={closeModal}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              style={{ zIndex: 10000 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={modalImage}
              alt="Panduan desain diperbesar"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignGuideComponent;





