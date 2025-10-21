import { ReactNode, ComponentType } from "react";

interface BlogContentProps {
  content: string | ComponentType | ReactNode;
  className?: string;
}

const BlogContent = ({ content, className = "" }: BlogContentProps) => {
  // If content is a React component (function), render it directly
  if (typeof content === 'function') {
    const Component = content as ComponentType;
    return <Component />;
  }

  // If content is a React element, render it directly
  if (typeof content === 'object' && content !== null && '$$typeof' in content) {
    return <div className={className}>{content as ReactNode}</div>;
  }

  // If content is HTML string, render it with dangerouslySetInnerHTML
  if (typeof content === 'string') {
    return (
      <div 
        className={`text-gray-700 leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return null;
};

export default BlogContent;
