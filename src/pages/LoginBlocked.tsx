import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";

const LoginBlocked = () => {
  const navigate = useNavigate();

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

        {/* Main Login Blocked Content */}
        <div className="bg-background rounded-2xl shadow-xl p-8 mb-6">
          {/* Error Illustration */}
          <div className="mb-6">
            <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#fff6e5' }}>
              <img 
                src="/product-image/403-Error.png"
                alt="403 - Login Blocked"
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Akses Login Diblokir
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Maaf, akses login Anda telah diblokir. 
            Silakan hubungi administrator untuk informasi lebih lanjut.
          </p>

          {/* Disclaimer Text */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 mb-1">Pemberitahuan Penting</p>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Akses login Anda telah dinonaktifkan karena alasan keamanan atau pelanggaran kebijakan. 
                  Jika Anda yakin ini adalah kesalahan, silakan hubungi tim support kami untuk bantuan lebih lanjut.
                </p>
              </div>
            </div>
          </div>

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

export default LoginBlocked;

