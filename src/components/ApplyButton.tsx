import { Share2 } from "lucide-react";

interface ApplyButtonProps {
  posisi: string;
  isAvailable: boolean;
  onShare?: () => void;
}

const ApplyButton = ({ posisi, isAvailable, onShare }: ApplyButtonProps) => {
  const handleApply = () => {
    if (!isAvailable) return;
    
    const subject = `Lamaran Kerja: ${posisi}`;
    const email = "idcardlampung@tidurlah.com";
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    window.location.href = mailtoLink;
  };

  return (
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
  );
};

export default ApplyButton;
