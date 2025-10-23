import { ReactNode } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

interface BlogLayoutProps {
  children: ReactNode;
  onSearch?: (term: string) => void;
  showSearch?: boolean;
}

const BlogLayout = ({ children, onSearch, showSearch = false }: BlogLayoutProps) => {
  return (
    <div className="min-h-screen bg-white notranslate flex flex-col" translate="no">
      <div className="w-full bg-white flex-1 flex flex-col">
        <Header 
          onSearch={onSearch}
          showSearch={showSearch}
        />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default BlogLayout;
