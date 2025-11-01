import { useState } from "react";
import { Share2 } from "lucide-react";
import ApplicationForm from "./ApplicationForm";

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

  const handleFormSubmit = (data: { name: string; email: string; phone: string; infoSource: string }) => {
    // Generate email subject and body
    const subject = encodeURIComponent(`Lamaran Kerja: ${posisi}`);
    const body = encodeURIComponent(
      `Yth. Tim HRD Tidurlah Grafika

Saya yang bertanda tangan di bawah ini:
Nama: ${data.name}
Email: ${data.email}
Nomor Telepon: ${data.phone}
Darimana mendapatkan info: ${data.infoSource || 'Tidak diisi'}

Dengan ini mengajukan lamaran kerja untuk posisi:
${posisi}

Saya menyatakan bahwa data yang saya berikan adalah benar dan saya siap untuk mengikuti proses seleksi selanjutnya.

Terima kasih atas perhatian dan kesempatannya.

Hormat saya,
${data.name}`
    );
    
    // Create mailto link
    const email = 'hrd@tidurlah.com';
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
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
