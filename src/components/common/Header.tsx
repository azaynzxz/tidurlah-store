import { useNavigate } from "react-router-dom";
import { ShoppingCart, Newspaper, Menu, X, Home, FileText, Shield, RotateCcw, MapPin } from "lucide-react";
import MusicPlayer from "@/components/MusicPlayer";
import SearchBar from "@/components/SearchBar";
import { useEffect, useState } from "react";

interface HeaderProps {
  cartItemsCount?: number;
  onCartClick?: () => void;
  showBackButton?: boolean;
  backButtonText?: string;
  onSearch?: (term: string) => void;
  showSearch?: boolean;
}

const Header = ({ 
  cartItemsCount = 0, 
  onCartClick, 
  showBackButton = false,
  backButtonText = "Kembali ke Toko",
  onSearch,
  showSearch = false
}: HeaderProps) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleCloseMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setIsClosing(false);
    }, 300); // Match the animation duration
  };

  const handleOpenMenu = () => {
    setMobileOpen(true);
    setIsClosing(false);
  };


  return (
    <div className="bg-white shadow-sm p-3 lg:p-4 sticky top-0 z-50 w-full">
      <div className="flex justify-between items-center">
        {/* Mobile Logo */}
        <img 
          src="/product-image/Logo Tidurlah Grafika 1x1 outlined.png"
          alt="TIDURLAH STORE"
          className="h-8 w-8 object-contain cursor-pointer lg:hidden"
          onClick={() => navigate('/')}
        />
        
        {/* Desktop Logo */}
        <img 
          src="/product-image/Tidurlah Logo Horizontal.png"
          alt="TIDURLAH STORE"
          className="h-8 lg:h-10 object-contain cursor-pointer hidden lg:block"
          onClick={() => navigate('/')}
        />
        
        {/* Center Search Bar - Mobile */}
        {showSearch && onSearch && (
          <div className="flex-1 max-w-md mx-2 md:hidden">
            <SearchBar onSearch={onSearch} />
          </div>
        )}
        
        {/* Center Search Bar - Desktop - Absolutely Centered */}
        {showSearch && onSearch && (
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-80 max-w-md">
            <SearchBar onSearch={onSearch} />
          </div>
        )}
        
        <div className="flex items-center space-x-2 lg:space-x-4">
        <MusicPlayer />
        
        {showBackButton && (
          <button
            onClick={() => navigate('/')}
            className="text-[#FF5E01] hover:text-[#FF5E01]/80 flex items-center space-x-2 text-xs font-medium p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden lg:inline">{backButtonText}</span>
          </button>
        )}
        
        <button 
          onClick={() => navigate('/blog')}
          className="text-[#FF5E01] hover:text-[#FF5E01]/80 text-xs font-medium hidden md:flex items-center p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <Newspaper className="h-5 w-5 lg:h-6 lg:w-6" />
        </button>
        
        {onCartClick && (
          <button 
            className="relative p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-colors"
            onClick={onCartClick}
            data-cart-icon
          >
            <ShoppingCart className="h-6 w-6 text-[#FF5E01]" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartItemsCount}
              </span>
            )}
          </button>
        )}
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-orange-50"
          onClick={handleOpenMenu}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-[#FF5E01]" />
        </button>
      </div>

      {/* Mobile sheet */}
      {(mobileOpen || isClosing) && (
        <div 
          className={`fixed inset-0 z-[60] bg-black/40 md:hidden transition-opacity duration-300 ease-in-out ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`} 
          onClick={handleCloseMenu}
        >
          <div 
            key={mobileOpen ? 'open' : 'closed'}
            className={`absolute top-0 right-0 h-full w-5/6 max-w-sm bg-white shadow-xl p-4 flex flex-col transform transition-transform duration-300 ease-in-out ${
              isClosing ? 'translate-x-full' : 'translate-x-0'
            }`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <img 
                src="/product-image/Logo Tidurlah Grafika 1x1 outlined.png"
                alt="TIDURLAH STORE"
                className="h-8 w-8 object-contain"
                onClick={() => { setMobileOpen(false); navigate('/'); }}
              />
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200" 
                onClick={handleCloseMenu} 
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-4 space-y-2 animate-fade-in-up">
              <button 
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium flex items-center transition-all duration-200 hover:scale-[1.02]" 
                onClick={() => { handleCloseMenu(); navigate('/'); }}
                style={{ animationDelay: '0.1s' }}
              >
                <Home className="h-4 w-4 mr-3" />
                Home
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium flex items-center transition-all duration-200 hover:scale-[1.02]" 
                onClick={() => { handleCloseMenu(); navigate('/blog'); }}
                style={{ animationDelay: '0.15s' }}
              >
                <Newspaper className="h-4 w-4 mr-3" />
                Blog
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium flex items-center transition-all duration-200 hover:scale-[1.02]" 
                onClick={() => { handleCloseMenu(); navigate('/blog/design-guide'); }}
                style={{ animationDelay: '0.2s' }}
              >
                <FileText className="h-4 w-4 mr-3" />
                Panduan Desain
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium flex items-center transition-all duration-200 hover:scale-[1.02]" 
                onClick={() => { handleCloseMenu(); navigate('/blog/privacy-policy'); }}
                style={{ animationDelay: '0.25s' }}
              >
                <Shield className="h-4 w-4 mr-3" />
                Privacy Policy
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium flex items-center transition-all duration-200 hover:scale-[1.02]" 
                onClick={() => { handleCloseMenu(); navigate('/blog/return-policy'); }}
                style={{ animationDelay: '0.3s' }}
              >
                <RotateCcw className="h-4 w-4 mr-3" />
                Return Policy
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium flex items-center transition-all duration-200 hover:scale-[1.02]" 
                onClick={() => { handleCloseMenu(); navigate('/hello'); }}
                style={{ animationDelay: '0.35s' }}
              >
                <MapPin className="h-4 w-4 mr-3" />
                Hello Page
              </button>
              {onCartClick && (
                <button 
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium flex items-center transition-all duration-200 hover:scale-[1.02]" 
                  onClick={() => { handleCloseMenu(); onCartClick(); }}
                  style={{ animationDelay: '0.4s' }}
                >
                  <ShoppingCart className="h-4 w-4 mr-3" />
                  Cart {cartItemsCount > 0 ? `(${cartItemsCount})` : ''}
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Header;
