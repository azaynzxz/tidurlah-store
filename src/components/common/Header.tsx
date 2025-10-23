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
    navigate(path);
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
          onClick={() => navigate('/blog')}
          className="text-[#FF5E01] hover:text-[#FF5E01]/80 text-xs font-medium hidden md:flex items-center p-2 lg:px-3 lg:py-2 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <Newspaper className="h-5 w-5 lg:h-6 lg:w-6" />
        </button>
        
        <button 
          onClick={() => navigate('/loker')}
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
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
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
            <div className="flex items-center justify-end">
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
                onClick={() => { handleCloseMenu(); navigate('/loker'); }}
                style={{ animationDelay: '0.16s' }}
              >
                <Briefcase className="h-4 w-4 mr-3" />
                Loker
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium flex items-center transition-all duration-200 hover:scale-[1.02]" 
                onClick={() => { handleCloseMenu(); navigate('/blog/panduan-desain'); }}
                style={{ animationDelay: '0.2s' }}
              >
                <FileText className="h-4 w-4 mr-3" />
                Panduan Desain
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium flex items-center transition-all duration-200 hover:scale-[1.02]" 
                onClick={() => { handleCloseMenu(); navigate('/blog/kebijakan-privasi'); }}
                style={{ animationDelay: '0.25s' }}
              >
                <Shield className="h-4 w-4 mr-3" />
                Privacy Policy
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm font-medium flex items-center transition-all duration-200 hover:scale-[1.02]" 
                onClick={() => { handleCloseMenu(); navigate('/blog/syarat-ketentuan-pengembalian'); }}
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
            </nav>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Header;
