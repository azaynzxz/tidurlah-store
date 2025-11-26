import { ReactNode, useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

interface BlogLayoutProps {
  children: ReactNode;
  onSearch?: (term: string) => void;
  showSearch?: boolean;
}

const BlogLayout = ({ children, onSearch, showSearch = false }: BlogLayoutProps) => {
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 100;
      setShowFooter(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background notranslate flex flex-col page-transition" translate="no">
      <div className="w-full bg-background flex-1 flex flex-col">
        <Header
          onSearch={onSearch}
          showSearch={showSearch}
        />
        <div className="flex-1">
          {children}
        </div>
        <div className={`transition-opacity duration-500 ease-in-out ${showFooter ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default BlogLayout;
