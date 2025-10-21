import { ReactNode } from "react";

interface BlogArticleProps {
  children: ReactNode;
  className?: string;
}

const BlogArticle = ({ children, className = "" }: BlogArticleProps) => {
  return (
    <article className={`prose prose-gray max-w-none font-lato ${className}`}>
      <div className="text-gray-700 leading-relaxed">
        {children}
      </div>
    </article>
  );
};

export default BlogArticle;
