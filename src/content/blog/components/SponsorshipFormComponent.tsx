import { useState } from "react";

const SponsorshipFormComponent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.institution.trim()) {
      newErrors.institution = 'Instansi/Organisasi wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Generate WhatsApp message
    const message = `Halo, nama saya ${formData.name} dari ${formData.institution}. Saya tertarik untuk mengajukan permohonan sponsorship kepada ID Card Lampung. Saya telah membaca syarat dan ketentuan yang berlaku dan ingin berdiskusi lebih lanjut mengenai peluang kerjasama ini. Terima kasih.`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/6285172157808?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Reset form after a short delay
    setTimeout(() => {
      setFormData({ name: '', email: '', institution: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Program Sponsorship ID Card Lampung</h1>
        <div className="space-y-4">
          <p className="text-foreground leading-relaxed">Selamat datang di Program Sponsorship ID Card Lampung! Kami membuka peluang kerjasama sponsorship untuk berbagai acara, event kampus, kegiatan komunitas, dan organisasi di seluruh Lampung.</p>
          <p className="text-foreground leading-relaxed">Sebagai bagian dari Tidurlah Grafika, kami berkomitmen untuk mendukung kegiatan-kegiatan positif yang dapat memberikan dampak positif bagi masyarakat Lampung.</p>
        </div>
      </div>

      {/* Definition Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Apa itu Sponsorship?</h2>
        <p className="text-gray-700 leading-relaxed mb-4">Sponsorship adalah bentuk kerjasama timbal balik antara ID Card Lampung dengan penyelenggara acara, dimana kami memberikan dukungan berupa produk atau layanan kami sebagai imbalan atas eksposur dan promosi merek kami dalam acara tersebut.</p>
        <p className="text-gray-700 leading-relaxed">Ini adalah win-win solution yang menguntungkan kedua belah pihak dalam mencapai tujuan masing-masing.</p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Benefits for Sponsors */}
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Manfaat untuk Anda</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Brand Visibility:</strong> Meningkatkan visibilitas merek Anda di kalangan target audience</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Community Engagement:</strong> Membangun hubungan positif dengan komunitas</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>CSR Value:</strong> Mendukung kegiatan positif sebagai bentuk tanggung jawab sosial</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span><strong>Cost Effective:</strong> Mendapatkan produk berkualitas dengan nilai tambah promosi</span>
            </li>
          </ul>
        </div>

        {/* Benefits for ID Card Lampung */}
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Manfaat untuk Kami</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">✓</span>
              <span><strong>Brand Awareness:</strong> Memperluas jangkauan merek ID Card Lampung</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">✓</span>
              <span><strong>Market Reach:</strong> Menjangkau segmentasi pasar yang lebih luas</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">✓</span>
              <span><strong>Partnership:</strong> Membangun jaringan kerjasama yang berkelanjutan</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">✓</span>
              <span><strong>Community Impact:</strong> Berkontribusi pada pengembangan komunitas lokal</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Do's and Don'ts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-800 mb-4">✓ Yang Perlu Dilakukan</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Ajukan permohonan minimal 2 minggu sebelum acara</li>
            <li>• Sertakan proposal acara yang jelas dan terstruktur</li>
            <li>• Berikan informasi detail tentang target audience</li>
            <li>• Jelaskan nilai eksposur yang akan diberikan</li>
            <li>• Siapkan dokumen pendukung (surat resmi, proposal, dll)</li>
            <li>• Komunikasi yang transparan dan profesional</li>
          </ul>
        </div>

        <div className="bg-red-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-4">✗ Yang Harus Dihindari</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Mengajukan permohonan mendadak (kurang dari 1 minggu)</li>
            <li>• Proposal yang tidak jelas atau tidak lengkap</li>
            <li>• Acara yang tidak sesuai dengan nilai dan visi perusahaan</li>
            <li>• Tidak memberikan informasi yang akurat</li>
            <li>• Mengharapkan sponsorship tanpa memberikan nilai balik</li>
            <li>• Komunikasi yang tidak profesional</li>
          </ul>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-800 mb-4">⚠️ Disclaimer & Syarat Ketentuan</h3>
        <div className="space-y-3 text-gray-700">
          <p><strong>Proses Review:</strong> Setiap permohonan sponsorship akan melalui proses review yang mempertimbangkan kesesuaian acara, target audience, dan nilai eksposur yang ditawarkan.</p>
          <p><strong>Kriteria Approval:</strong> Keputusan approval bergantung pada kualitas proposal, relevansi acara dengan brand kami, dan ketersediaan budget sponsorship.</p>
          <p><strong>Partnership Terms:</strong> Jika disetujui, akan ada perjanjian kerjasama yang mengatur hak dan kewajiban kedua belah pihak.</p>
          <p><strong>Timeline:</strong> Proses review memakan waktu 3-5 hari kerja. Keputusan akan dikomunikasikan via WhatsApp atau email.</p>
          <p><strong>Keterbatasan:</strong> Kami berhak menolak permohonan tanpa memberikan alasan detail, dan keputusan kami bersifat final.</p>
        </div>
      </div>

      {/* Sponsorship Form */}
      <div className="bg-background border-2 border-[#FF5E01] rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Form Permohonan Sponsorship</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5E01] focus:border-[#FF5E01] transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan nama lengkap Anda"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5E01] focus:border-[#FF5E01] transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="contoh@email.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
              Instansi/Organisasi *
            </label>
            <input
              type="text"
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF5E01] focus:border-[#FF5E01] transition-colors ${
                errors.institution ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nama instansi atau organisasi Anda"
            />
            {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution}</p>}
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-8 py-3 bg-[#FF5E01] text-white font-semibold rounded-lg hover:bg-[#e54d00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting ? 'animate-pulse' : ''
              }`}
            >
              {isSubmitting ? 'Mengirim...' : 'Ajukan Permohonan via WhatsApp'}
            </button>
            <p className="mt-2 text-sm text-gray-600">
              Form akan mengarahkan Anda ke WhatsApp untuk melanjutkan proses
            </p>
          </div>
        </form>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Butuh Bantuan?</h3>
        <p className="text-gray-600 mb-4">Jika Anda memiliki pertanyaan tentang program sponsorship, jangan ragu untuk menghubungi kami.</p>
        <a 
          href="https://wa.me/6285172157808"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#20b358] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M17.6 6.31999C16.2 4.91999 14.2 4.09999 12.1 4.09999C7.79995 4.09999 4.29995 7.59999 4.29995 11.9C4.29995 13.3 4.69995 14.7 5.39995 15.9L4.19995 19.9L8.29995 18.7C9.49995 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.79999 19 7.79999 17.6 6.31999ZM12.1 18.3C10.9 18.3 9.69995 17.9 8.69995 17.2L8.39995 17L5.99995 17.7L6.69995 15.4L6.39995 15.1C5.59995 14 5.19995 13 5.19995 11.9C5.19995 8.09999 8.29995 5.09999 12 5.09999C13.8 5.09999 15.5 5.79999 16.7 6.99999C17.9 8.19999 18.6 9.89999 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.89995 11.5C9.89995 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.79995 9.19999 9.59995 8.79999C9.39995 8.39999 9.19995 8.39999 8.99995 8.39999C8.89995 8.39999 8.69995 8.39999 8.49995 8.39999C8.29995 8.39999 7.99995 8.49999 7.79995 8.79999C7.59995 9.09999 7.09995 9.49999 7.09995 10.4C7.09995 11.3 7.79995 12.2 7.89995 12.4C8.09995 12.6 9.69995 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z" fill="white"/>
          </svg>
          Hubungi WhatsApp
        </a>
      </div>
    </div>
  );
};

export default SponsorshipFormComponent;




