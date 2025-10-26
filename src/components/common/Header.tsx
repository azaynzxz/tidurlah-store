import { useNavigate } from "react-router-dom";
import { ShoppingCart, Newspaper, Menu, X, Home, FileText, Shield, RotateCcw, MapPin, Briefcase } from "lucide-react";
import MusicPlayer from "@/components/MusicPlayer";
import SearchBar from "@/components/SearchBar";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface HeaderProps {
  cartItemsCount?: number;
  onCartClick?: () => void;
  onSearch?: (term: string) => void;
  showSearch?: boolean;
}

const Header = ({ 
  cartItemsCount = 0, 
  onCartClick, 
  onSearch,
  showSearch = false
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.desktop-dropdown')) {
          setDesktopDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [desktopDropdownOpen]);

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

  const handleDesktopDropdownToggle = () => {
    setDesktopDropdownOpen(!desktopDropdownOpen);
  };

  const handleDesktopMenuClick = (path: string) => {
    setDesktopDropdownOpen(false);
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

  // Touch gesture handlers for swipe down
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    const threshold = 100; // Minimum swipe distance to close
    
    if (deltaY > threshold) {
      handleCloseMenu();
    }
    
    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };


  return (
    <div className="bg-white shadow-sm p-3 lg:p-4 sticky top-0 z-[9999] w-full">
      <div className="flex justify-between items-center">
        {/* Mobile Logo */}
        <img 
          src="/product-image/Logo Tidurlah Grafika 1x1 outlined.png"
          alt="TIDURLAH STORE"
          className="h-8 w-8 object-contain cursor-pointer lg:hidden"
          onClick={() => navigateWithScrollToTop('/')}
        />
        
        {/* Desktop Logo */}
        <img 
          src="/product-image/Tidurlah Logo Horizontal.png"
          alt="TIDURLAH STORE"
          className="h-8 lg:h-10 object-contain cursor-pointer hidden lg:block"
          onClick={() => navigateWithScrollToTop('/')}
        />
        
        {/* Center Search Bar - Mobile */}
        {showSearch && onSearch && (
          <div className="flex-1 max-w-md mx-2 md:hidden">
            <SearchBar onSearch={onSearch} placeholder={location.pathname.startsWith('/blog') ? 'Cari Artikel' : 'Search products'} />
          </div>
        )}
        
        {/* Center Search Bar - Desktop - Absolutely Centered */}
        {showSearch && onSearch && (
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-80 max-w-md">
            <SearchBar onSearch={onSearch} placeholder={location.pathname.startsWith('/blog') ? 'Cari Artikel' : 'Search products'} />
          </div>
        )}
        
        <div className="flex items-center space-x-2 lg:space-x-4">
        <MusicPlayer />
        
        
        <button 
          onClick={() => navigateWithScrollToTop('/blog')}
          className="text-[#FF5E01] hover:text-[#FF5E01]/80 text-xs font-medium hidden md:flex items-center p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <Newspaper className="h-5 w-5 lg:h-6 lg:w-6" />
        </button>
        
        <button 
          onClick={() => navigateWithScrollToTop('/loker')}
          className="text-[#FF5E01] hover:text-[#FF5E01]/80 text-xs font-medium hidden md:flex items-center p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <Briefcase className="h-5 w-5 lg:h-6 lg:w-6" />
        </button>
        
        {/* Desktop Dropdown Menu */}
        <div className="relative hidden md:block desktop-dropdown">
          <button
            onClick={handleDesktopDropdownToggle}
            className="text-[#FF5E01] hover:text-[#FF5E01]/80 text-xs font-medium flex items-center p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-all duration-200"
          >
            <Menu className={`h-5 w-5 lg:h-6 lg:w-6 transition-transform duration-200 ${desktopDropdownOpen ? 'rotate-90' : ''}`} />
          </button>
          
          {/* Dropdown Content */}
          {desktopDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[9998] animate-in slide-in-from-top-2 fade-in duration-200">
              <button 
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 flex items-center transition-all duration-200 hover:translate-x-1"
                onClick={() => handleDesktopMenuClick('/')}
                style={{ animationDelay: '0ms' }}
              >
                <Home className="h-4 w-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                Home
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 flex items-center transition-all duration-200 hover:translate-x-1"
                onClick={() => handleDesktopMenuClick('/blog')}
                style={{ animationDelay: '50ms' }}
              >
                <Newspaper className="h-4 w-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                Blog
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 flex items-center transition-all duration-200 hover:translate-x-1"
                onClick={() => handleDesktopMenuClick('/loker')}
                style={{ animationDelay: '100ms' }}
              >
                <Briefcase className="h-4 w-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                Loker
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 flex items-center transition-all duration-200 hover:translate-x-1"
                onClick={() => handleDesktopMenuClick('/blog/panduan-desain')}
                style={{ animationDelay: '150ms' }}
              >
                <FileText className="h-4 w-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                Panduan Desain
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 flex items-center transition-all duration-200 hover:translate-x-1"
                onClick={() => handleDesktopMenuClick('/blog/kebijakan-privasi')}
                style={{ animationDelay: '200ms' }}
              >
                <Shield className="h-4 w-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                Privacy Policy
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 flex items-center transition-all duration-200 hover:translate-x-1"
                onClick={() => handleDesktopMenuClick('/blog/syarat-ketentuan-pengembalian')}
                style={{ animationDelay: '250ms' }}
              >
                <RotateCcw className="h-4 w-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                Return Policy
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 flex items-center transition-all duration-200 hover:translate-x-1"
                onClick={() => handleDesktopMenuClick('/hello')}
                style={{ animationDelay: '300ms' }}
              >
                <MapPin className="h-4 w-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                Hello Page
              </button>
            </div>
          )}
        </div>
        
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

      {/* iOS-style Bottom Sheet */}
      {(mobileOpen || isClosing) && (
        <div 
          className={`fixed inset-0 bg-black/40 md:hidden transition-opacity duration-300 ease-in-out ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`} 
          style={{ zIndex: 99999 }}
          onClick={handleCloseMenu}
        >
          {/* Bottom Sheet Container */}
          <div 
            className={`fixed bottom-0 left-0 right-0 md:hidden bg-white rounded-t-3xl shadow-2xl transform transition-all duration-300 ease-out ${
              isClosing ? 'translate-y-full' : 'translate-y-0'
            }`}
            style={{ 
              zIndex: 100000,
              transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : undefined,
              animation: isClosing ? 'none' : 'slideInFromBottomContainer 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s both, fadeInShadow 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s both'
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag Handle */}
            <div 
              className="flex justify-center pt-2 pb-1"
              style={{ 
                animation: isClosing ? 'none' : 'slideInFromBottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.01s both'
              }}
            >
              <div className="w-8 h-0.5 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div 
              className="px-4 pb-2 border-b border-gray-100"
              style={{ 
                animation: isClosing ? 'none' : 'slideInFromBottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.03s both'
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Menu</h2>
                <button 
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200" 
                  onClick={handleCloseMenu}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Navigation Items */}
            <div className="px-4 py-2 space-y-0.5">
              <button 
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center transition-all duration-300 transform ${
                  isClosing ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-100'
                }`}
                onClick={() => { handleCloseMenu(); navigateWithScrollToTop('/'); }}
                style={{ 
                  animation: isClosing ? 'none' : 'slideInFromBottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both'
                }}
              >
                <Home className="h-4 w-4 mr-3 text-[#FF5E01]" />
                Home
              </button>
              
              <button 
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center transition-all duration-300 transform ${
                  isClosing ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-100'
                }`}
                onClick={() => { handleCloseMenu(); navigateWithScrollToTop('/blog'); }}
                style={{ 
                  animation: isClosing ? 'none' : 'slideInFromBottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both'
                }}
              >
                <Newspaper className="h-4 w-4 mr-3 text-[#FF5E01]" />
                Blog
              </button>
              
              <button 
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center transition-all duration-300 transform ${
                  isClosing ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-100'
                }`}
                onClick={() => { handleCloseMenu(); navigateWithScrollToTop('/loker'); }}
                style={{ 
                  animation: isClosing ? 'none' : 'slideInFromBottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both'
                }}
              >
                <Briefcase className="h-4 w-4 mr-3 text-[#FF5E01]" />
                Loker
              </button>
              
              <button 
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center transition-all duration-300 transform ${
                  isClosing ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-100'
                }`}
                onClick={() => { handleCloseMenu(); navigateWithScrollToTop('/blog/panduan-desain'); }}
                style={{ 
                  animation: isClosing ? 'none' : 'slideInFromBottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both'
                }}
              >
                <FileText className="h-4 w-4 mr-3 text-[#FF5E01]" />
                Panduan Desain
              </button>
              
              <button 
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center transition-all duration-300 transform ${
                  isClosing ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-100'
                }`}
                onClick={() => { handleCloseMenu(); navigateWithScrollToTop('/blog/kebijakan-privasi'); }}
                style={{ 
                  animation: isClosing ? 'none' : 'slideInFromBottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both'
                }}
              >
                <Shield className="h-4 w-4 mr-3 text-[#FF5E01]" />
                Privacy Policy
              </button>
              
              <button 
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center transition-all duration-300 transform ${
                  isClosing ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-100'
                }`}
                onClick={() => { handleCloseMenu(); navigateWithScrollToTop('/blog/syarat-ketentuan-pengembalian'); }}
                style={{ 
                  animation: isClosing ? 'none' : 'slideInFromBottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both'
                }}
              >
                <RotateCcw className="h-4 w-4 mr-3 text-[#FF5E01]" />
                Return Policy
              </button>
              
              <button 
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center transition-all duration-300 transform ${
                  isClosing ? 'translate-x-0 opacity-100' : 'translate-x-0 opacity-100'
                }`}
                onClick={() => { handleCloseMenu(); navigateWithScrollToTop('/hello'); }}
                style={{ 
                  animation: isClosing ? 'none' : 'slideInFromBottom 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both'
                }}
              >
                <MapPin className="h-4 w-4 mr-3 text-[#FF5E01]" />
                Hello Page
              </button>
            </div>
            
            {/* Bottom padding for safe area */}
            <div className="h-3"></div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Header;
