import { Link } from "react-router-dom";
import type { BlogPostData } from "@/content/blog";

interface EruditeBlogCardProps {
  post: BlogPostData;
}

export default function EruditeBlogCard({ post }: EruditeBlogCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      "case-studies": "Studi Kasus",
      "tutorials": "Tutorial",
      "special": "Informasi Khusus"
    };
    return map[cat] || cat;
  };

  return (
    <article className="group rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {post.image && (
            <div className="w-full sm:w-44 md:w-48 shrink-0 aspect-[16/10] sm:aspect-[4/3] overflow-hidden rounded-md bg-muted/20 border border-border">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {getCategoryLabel(post.category)}
              </span>
              <span>•</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>

            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight leading-snug line-clamp-2">
              {post.title}
            </h3>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {post.subtitle}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
