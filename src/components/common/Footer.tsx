import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  // Navigation helper with scroll to top - optimized for mobile
  const navigateWithScrollToTop = (path: string) => {
    // For mobile, we need to be more aggressive with scrolling
    const scrollToTop = () => {
      // Try multiple methods to ensure it works on mobile
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Also try smooth scroll as fallback
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }, 10);
    };
    
    // Scroll immediately
    scrollToTop();
    
    // Navigate
    navigate(path);
    
    // Scroll again after navigation (for mobile)
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 200);
  };

  return (
    <footer className="w-screen" style={{ backgroundColor: '#121939' }}>
      {/* Main Footer Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Top Section - Brand, Navigation, Contact, Map */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold text-white mb-2">TIDURLAH GRAFIKA</h3>
              <p className="text-[#FF5E01] text-sm mb-4">"Cetak apa aja, Tidurlah Grafika!"</p>
              <div className="w-full h-px bg-gray-400 mb-4"></div>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Spesialis ID Card Lanyard Lampung dan Merchandise Custom. Kami menyediakan berbagai produk cetak berkualitas tinggi untuk kebutuhan bisnis dan personal Anda.
              </p>
            </div>

            {/* Navigation Section */}
            <div className="lg:col-span-1">
              <h4 className="text-lg font-bold text-white mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigateWithScrollToTop('/')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Home</button></li>
                <li><button onClick={() => navigateWithScrollToTop('/blog')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Blog</button></li>
                <li><button onClick={() => navigateWithScrollToTop('/loker')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Loker</button></li>
                <li><button onClick={() => navigateWithScrollToTop('/loker/reseller')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Reseller</button></li>
                <li><button onClick={() => navigateWithScrollToTop('/blog/sponsorship')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Sponsorship</button></li>
                <li><button onClick={() => navigateWithScrollToTop('/hello')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Contact</button></li>
                <li><button onClick={() => navigateWithScrollToTop('/blog/panduan-desain')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Panduan Desain</button></li>
                <li><button onClick={() => navigateWithScrollToTop('/blog/kebijakan-privasi')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigateWithScrollToTop('/blog/syarat-ketentuan-pengembalian')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Return Policy</button></li>
              </ul>
          </div>

            {/* Contact Section */}
            <div className="lg:col-span-1">
              <h4 className="text-lg font-bold text-white mb-4">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#FF5E01] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                  </div>
                  <a href="tel:+6285172157808" className="text-gray-300 hover:text-[#FF5E01] transition-colors">
                    +62 851 7215 7808
                  </a>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#FF5E01] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <a href="mailto:halo.idcardlampung@gmail.com" className="text-gray-300 hover:text-[#FF5E01] transition-colors">
                    halo.idcardlampung@gmail.com
                  </a>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#FF5E01] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                </svg>
                  </div>
                  <a href="https://instagram.com/tidurlah_grafika" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FF5E01] transition-colors">
                    Instagram
              </a>
            </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#FF5E01] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
          </div>
                  <button onClick={() => navigateWithScrollToTop('/survey')} className="text-gray-300 hover:text-[#FF5E01] transition-colors text-sm">
                    Survei Kepuasan Pelanggan
              </button>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="lg:col-span-1">
              <h4 className="text-lg font-bold text-white mb-4">Location</h4>
              <div className="relative">
                <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.3172077629824!2d105.29815628833796!3d-5.368497780713509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40dbe8e9453b63%3A0xb5127739986bb77f!2sID%20Card%20Lampung!5e0!3m2!1sen!2sid!4v1761448204595!5m2!1sen!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
        
      {/* Bottom Legal Section */}
      <div className="w-full bg-[#FF5E01] py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <p className="text-white text-sm">
            © 2022-{new Date().getFullYear()} TIDURLAH GRAFIKA. All rights reserved.
          </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
