import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, ShoppingBag } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Header with Logo */}
        <div className="mb-8">
          <img 
            src="/product-image/Tidurlah Logo Horizontal.png"
            alt="TIDURLAH GRAFIKA"
            className="h-12 mx-auto mb-4 object-contain"
          />
        </div>

        {/* Main 404 Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* 404 Custom Illustration */}
          <div className="mb-6">
            <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#fff6e5' }}>
              <img 
                src="/product-image/404_result.webp"
                alt="404 - Halaman Tidak Ditemukan"
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. 
            Mungkin halaman telah dipindahkan atau URL salah.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#FF5E01] hover:bg-[#e54d00] text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Home className="h-5 w-5" />
              Kembali ke Beranda
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Halaman Sebelumnya
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500 mb-3">Atau kunjungi halaman populer:</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-[#FF5E01] hover:text-[#e54d00] text-sm font-medium transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Produk
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-1 text-[#FF5E01] hover:text-[#e54d00] text-sm font-medium transition-colors"
            >
              <Search className="h-4 w-4" />
              Blog
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            © 2022-{new Date().getFullYear()} TIDURLAH GRAFIKA
          </p>
          <p className="text-xs text-gray-400 italic mt-1">
            "Cetak apa aja, Tidurlah Grafika!"
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
