import { Calendar, User, Tag } from "lucide-react";

interface BlogHeaderProps {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  tags: string[];
  slug?: string;
}

const BlogHeader = ({ title, subtitle, author, date, tags, slug }: BlogHeaderProps) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <header className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight font-inter">
        {title}
      </h1>
      
      <h2 className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed font-inter">
        {subtitle}
      </h2>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          <span>{author}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(date)}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8 font-inter">
        {tags.map((tag, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FF5E01]/10 text-[#FF5E01] border border-[#FF5E01]/20"
          >
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>
    </header>
  );
};

export default BlogHeader;
