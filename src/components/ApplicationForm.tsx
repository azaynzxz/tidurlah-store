import { useState } from "react";
import { X } from "lucide-react";
import FileUploader from "./FileUploader";

interface ApplicationFormProps {
  position: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    name: string; 
    email: string; 
    phone: string; 
    infoSource: string;
    alamat: string;
    cv?: File | null;
    portfolio?: File | null;
  }) => void;
}

const ApplicationForm = ({ position, isOpen, onClose, onSubmit }: ApplicationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    infoSource: '',
    alamat: ''
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Check if position is design-related
  const isDesignPosition = () => {
    const positionLower = position.toLowerCase();
    return positionLower.includes('design') || 
           positionLower.includes('desain') || 
           positionLower.includes('grafis') || 
           positionLower.includes('graphic') ||
           positionLower.includes('visual');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Allow Indonesian phone format (numbers, spaces, +, -)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid (minimal 10 digit)';
    }
    
    if (!cvFile) {
      newErrors.cv = 'CV/Resume wajib diupload';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit({
      ...formData,
      cv: cvFile,
      portfolio: isDesignPosition() ? portfolioFile : null
    });
    setFormData({ name: '', email: '', phone: '', infoSource: '', alamat: '' });
    setCvFile(null);
    setPortfolioFile(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000] px-4 overflow-y-auto py-4">
        <div className="bg-background rounded-xl p-4 md:p-6 max-w-lg w-full shadow-2xl border border-gray-200 duration-200 my-auto max-h-[90vh] overflow-y-auto" style={{
          animation: 'slideUp 200ms ease-out'
        }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Form Lamaran Kerja</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-1">Posisi yang dilamar:</p>
          <p className="text-base font-semibold text-[#FF5E01]">{position}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#FF5E01] focus:border-[#FF5E01] transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan nama lengkap Anda"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#FF5E01] focus:border-[#FF5E01] transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="contoh@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
              Nomor Telepon *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#FF5E01] focus:border-[#FF5E01] transition-colors ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0812 3456 7890"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="infoSource" className="block text-xs font-medium text-gray-700 mb-1">
              Darimana mendapatkan info ini?
            </label>
            <select
              id="infoSource"
              name="infoSource"
              value={formData.infoSource}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5E01] focus:border-[#FF5E01] transition-colors"
            >
              <option value="">Pilih sumber informasi</option>
              <option value="Teman">Teman</option>
              <option value="IG">IG</option>
              <option value="Facebook">Facebook</option>
              <option value="Threads">Threads</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label htmlFor="alamat" className="block text-xs font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <textarea
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5E01] focus:border-[#FF5E01] transition-colors resize-none"
              placeholder="Masukkan alamat lengkap Anda"
            />
          </div>

          {/* File Uploaders */}
          <div className="space-y-3 pt-1">
            <FileUploader
              label="CV/Resume"
              accept=".pdf,.doc,.docx"
              maxSize={10}
              required={true}
              value={cvFile}
              onChange={setCvFile}
              error={errors.cv}
              description="Upload CV atau Resume Anda dalam format PDF, DOC, atau DOCX"
            />

            {isDesignPosition() && (
              <>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg mb-2">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong className="text-blue-700">Catatan Portfolio:</strong> Portfolio layout cetak dan print media, lebih diutamakan.
                  </p>
                </div>
                <FileUploader
                  label="Portfolio"
                  accept=".pdf,.doc,.docx,.zip,.rar"
                  maxSize={20}
                  required={false}
                  value={portfolioFile}
                  onChange={setPortfolioFile}
                  error={errors.portfolio}
                  description="Upload portfolio Anda (PDF, DOC, DOCX, atau ZIP/RAR untuk multiple files)"
                />
              </>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-[#FF5E01] text-white rounded-lg text-sm font-medium hover:bg-[#e54d00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kirim Lamaran
            </button>
          </div>
        </form>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default ApplicationForm;

