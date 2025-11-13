import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TutorialPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if popup has been shown before
    const hasSeenPopup = localStorage.getItem('hasSeenTutorialPopup');
    
    if (!hasSeenPopup) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark popup as seen
    localStorage.setItem('hasSeenTutorialPopup', 'true');
  };

  const handleImageClick = () => {
    handleClose();
    navigate('/blog/tutorial-cara-order');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Popup Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-scale-in">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-colors"
            aria-label="Close popup"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
          
          {/* Image - Clickable */}
          <div 
            className="cursor-pointer relative overflow-hidden group"
            onClick={handleImageClick}
          >
            <img 
              src="/cara-order.jpg" 
              alt="Tutorial Cara Order TIDURLAH STORE" 
              className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <span className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Klik untuk lihat tutorial
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default TutorialPopup;

