import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import ApplicationForm from "./ApplicationForm";
import { submitJobApplication, type JobApplicationData } from "@/utils/api";

interface ApplyButtonProps {
  posisi: string;
  isAvailable: boolean;
  onShare?: () => void;
}

const ApplyButton = ({ posisi, isAvailable, onShare }: ApplyButtonProps) => {
  const [showForm, setShowForm] = useState(false);

  const handleApply = () => {
    if (!isAvailable) return;
    setShowForm(true);
  };

  const generateEmailBody = (
    name: string,
    email: string,
    phone: string,
    infoSource: string,
    alamat: string,
    position: string
  ): string => {
    const emailBody = `Yth. Tim HRD Tidurlah Grafika

Saya yang bertanda tangan di bawah ini:
Nama: ${name}
Email: ${email}
Nomor Telepon: ${phone}
Darimana mendapatkan info: ${infoSource || 'Tidak diisi'}
Alamat: ${alamat || 'Tidak diisi'}

Dengan ini mengajukan lamaran kerja untuk posisi:
${position}

Saya telah mengirimkan berkas lamaran pada form yang di berikan.
Saya menyatakan bahwa data yang saya berikan adalah benar dan saya siap untuk mengikuti proses seleksi selanjutnya.

Terima kasih atas perhatian dan kesempatannya.

Hormat saya,
${name}`;

    return emailBody;
  };

  const handleFormSubmit = async (data: { 
    name: string; 
    email: string; 
    phone: string; 
    infoSource: string;
    alamat: string;
    cv?: File | null;
    portfolio?: File | null;
  }) => {
    let progressToastId: string | number | undefined;
    
    try {
      // Prepare application data
      const applicationData: JobApplicationData = {
        nama: data.name,
        email: data.email,
        nomor: data.phone,
        source: data.infoSource || '',
        alamat: data.alamat || '',
        cv: data.cv,
        portfolio: data.portfolio
      };

      // Submit to Google Sheets via Apps Script with progress tracking
      await submitJobApplication(applicationData, (progress, message) => {
        // Update or create progress toast
        if (!progressToastId) {
          progressToastId = toast.loading(
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between text-sm">
                <span>{message}</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#FF5E01] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>,
            {
              position: 'top-center',
              duration: Infinity,
              style: { marginTop: '60px', minWidth: '350px' }
            }
          );
        } else {
          toast.loading(
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between text-sm">
                <span>{message}</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#FF5E01] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>,
            {
              id: progressToastId,
              position: 'top-center',
              duration: Infinity,
              style: { marginTop: '60px', minWidth: '350px' }
            }
          );
        }
      });

      // Dismiss progress toast and show success
      if (progressToastId) {
        toast.dismiss(progressToastId);
      }

      // Generate email body
      const emailBody = generateEmailBody(
        data.name,
        data.email,
        data.phone,
        data.infoSource,
        data.alamat,
        posisi
      );

      // Create mailto link
      const emailSubject = encodeURIComponent(`Lamaran Kerja: ${posisi}`);
      const emailBodyEncoded = encodeURIComponent(emailBody);
      const emailTo = 'hr@tidurlah.com';
      const mailtoLink = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBodyEncoded}`;

      // Show success toast
      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">Lamaran berhasil dikirim!</p>
          <p className="text-sm">Terima kasih telah melamar posisi <strong>{posisi}</strong>.</p>
          <p className="text-xs text-gray-600 mt-2">File telah tersimpan ke sistem. Membuka email client...</p>
        </div>,
        {
          position: 'top-center',
          duration: 5000,
          style: { marginTop: '60px', minWidth: '350px' }
        }
      );

      // Auto-open email client after a short delay
      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      // Dismiss progress toast if it exists
      if (progressToastId) {
        toast.dismiss(progressToastId);
      }
      
      toast.error(
        <div className="space-y-1">
          <p className="font-semibold">Gagal mengirim lamaran</p>
          <p className="text-sm">{error.message || 'Terjadi kesalahan. Silakan coba lagi.'}</p>
        </div>,
        {
          position: 'top-center',
          duration: 5000,
          style: { marginTop: '60px', minWidth: '350px' }
        }
      );
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          onClick={handleApply}
          disabled={!isAvailable}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            isAvailable
              ? "bg-[#FF5E01] text-white hover:bg-[#e54d00] shadow-md"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isAvailable ? "Lamar Posisi Ini" : "Posisi Tidak Tersedia"}
        </button>
        
        {isAvailable && onShare && (
          <button
            onClick={onShare}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-[#FF5E01] text-[#FF5E01] hover:bg-[#FF5E01] hover:text-white transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Bagikan</span>
          </button>
        )}
      </div>

      <ApplicationForm
        position={posisi}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
      />
    </>
  );
};

export default ApplyButton;
