import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHalloweenTheme } from "@/contexts/HalloweenThemeContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Footer = () => {
  const navigate = useNavigate();
  const { isHalloweenMode } = useHalloweenTheme();
  const [selectedLocation, setSelectedLocation] = useState<'korpri' | 'belwis'>('korpri');

  // Map URLs for different locations
  const mapUrls = {
    korpri: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d358.8274688427937!2d105.30290814455876!3d-5.3685203858369155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40dbe8e9453b63%3A0xb5127739986bb77f!2sID%20Card%20Lampung!5e1!3m2!1sen!2sid!4v1762012469415!5m2!1sen!2sid",
    belwis: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d358.8368063702099!2d105.3159073944683!3d-5.352631091802125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40c384e8ee58ef%3A0xa4e876abbc74d8a5!2sTidurlah%20Grafika!5e1!3m2!1sen!2sid!4v1762012258485!5m2!1sen!2sid"
  };

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
    <footer className={`w-screen halloween-decorations flex-shrink-0 ${isHalloweenMode ? 'bg-gray-900' : ''}`} style={{ backgroundColor: isHalloweenMode ? '#0f172a' : '#121939' }}>
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

            {/* Navigation Section - Accordion on Mobile, Always Expanded on Desktop */}
            <div className="lg:col-span-1">
              {/* Desktop: Always visible header and list */}
              <div className="hidden md:block">
                <h4 className="text-lg font-bold text-white mb-4">Navigasi</h4>
                <ul className="space-y-2">
                  <li><button onClick={() => navigateWithScrollToTop('/')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Home</button></li>
                  <li><button onClick={() => navigateWithScrollToTop('/blog')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Blog</button></li>
                  <li><button onClick={() => navigateWithScrollToTop('/loker')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Loker</button></li>
                  <li><button onClick={() => navigateWithScrollToTop('/loker/reseller')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Reseller</button></li>
                  <li><button onClick={() => navigateWithScrollToTop('/blog/sponsorship')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Sponsorship</button></li>
                  <li><button onClick={() => navigateWithScrollToTop('/hello')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Contact</button></li>
                  <li><button onClick={() => navigateWithScrollToTop('/twibbon-hut-3-id-card-lampung')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Twibbon HUT 3 th ID Card Lampung</button></li>
                  <li><button onClick={() => navigateWithScrollToTop('/blog/panduan-desain')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Panduan Desain</button></li>
                  <li><button onClick={() => navigateWithScrollToTop('/blog/kebijakan-privasi')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Privacy Policy</button></li>
                  <li><button onClick={() => navigateWithScrollToTop('/blog/syarat-ketentuan-pengembalian')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Return Policy</button></li>
                </ul>
              </div>

              {/* Mobile: Accordion */}
              <div className="block md:hidden">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="navigation" className="border-b border-gray-700">
                    <AccordionTrigger className="text-lg font-bold text-white hover:no-underline py-4 [&[data-state=open]>svg]:text-[#FF5E01] [&[data-state=open]>svg]:rotate-180 [&>svg]:text-gray-300 [&>svg]:transition-colors [&>svg]:transition-transform">
                      Navigation
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <ul className="space-y-2">
                        <li><button onClick={() => navigateWithScrollToTop('/')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Home</button></li>
                        <li><button onClick={() => navigateWithScrollToTop('/blog')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Blog</button></li>
                        <li><button onClick={() => navigateWithScrollToTop('/loker')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Loker</button></li>
                        <li><button onClick={() => navigateWithScrollToTop('/loker/reseller')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Reseller</button></li>
                        <li><button onClick={() => navigateWithScrollToTop('/blog/sponsorship')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Sponsorship</button></li>
                        <li><button onClick={() => navigateWithScrollToTop('/hello')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Contact</button></li>
                        <li><button onClick={() => navigateWithScrollToTop('/twibbon-hut-3-id-card-lampung')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Twibbon HUT 3 th ID Card Lampung</button></li>
                        <li><button onClick={() => navigateWithScrollToTop('/blog/panduan-desain')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Panduan Desain</button></li>
                        <li><button onClick={() => navigateWithScrollToTop('/blog/kebijakan-privasi')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Privacy Policy</button></li>
                        <li><button onClick={() => navigateWithScrollToTop('/blog/syarat-ketentuan-pengembalian')} className="text-gray-300 hover:text-[#FF5E01] transition-colors">Return Policy</button></li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Contact Section */}
            <div className="lg:col-span-1">
              <h4 className="text-lg font-bold text-white mb-4">Kontak</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#FF5E01] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.6 6.31999C16.2 4.91999 14.2 4.09999 12.1 4.09999C7.79995 4.09999 4.29995 7.59999 4.29995 11.9C4.29995 13.3 4.69995 14.7 5.39995 15.9L4.19995 19.9L8.29995 18.7C9.49995 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.79999 19 7.79999 17.6 6.31999ZM12.1 18.3C10.9 18.3 9.69995 17.9 8.69995 17.2L8.39995 17L5.99995 17.7L6.69995 15.4L6.39995 15.1C5.59995 14 5.19995 13 5.19995 11.9C5.19995 8.09999 8.29995 5.09999 12 5.09999C13.8 5.09999 15.5 5.79999 16.7 6.99999C17.9 8.19999 18.6 9.89999 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.89995 11.5C9.89995 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.79995 9.19999 9.59995 8.79999C9.39995 8.39999 9.19995 8.39999 8.99995 8.39999C8.89995 8.39999 8.69995 8.39999 8.49995 8.39999C8.29995 8.39999 7.99995 8.49999 7.79995 8.79999C7.59995 9.09999 7.09995 9.49999 7.09995 10.4C7.09995 11.3 7.79995 12.2 7.89995 12.4C8.09995 12.6 9.69995 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z" fill="white"/>
                </svg>
                  </div>
                  <a 
                    href="https://wa.me/6285172157808?text=Halo%2C%20saya%20tertarik%20untuk%20konsultasi%20produk%20dan%20layanan%20dari%20TIDURLAH%20GRAFIKA.%20Boleh%20minta%20informasi%20lebih%20lanjut%3F" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#FF5E01] transition-colors"
                  >
                    +62 851 7215 7808
                  </a>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#FF5E01] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <a href="mailto:cs@tidurlah.com" className="text-gray-300 hover:text-[#FF5E01] transition-colors">
                    cs@tidurlah.com
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
              <h4 className="text-lg font-bold text-white mb-4">Lokasi Cabang</h4>
              
              {/* Location Selector */}
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => setSelectedLocation('korpri')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedLocation === 'korpri'
                      ? 'bg-[#FF5E01] text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Cabang Korpri, Balam
                </button>
                <button
                  onClick={() => setSelectedLocation('belwis')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedLocation === 'belwis'
                      ? 'bg-[#FF5E01] text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Cabang Belwis, Jatiagung
                </button>
              </div>
              
              <div className="relative">
                <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    key={selectedLocation}
                    src={mapUrls[selectedLocation]}
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
