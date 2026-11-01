import { Link, useLocation } from "react-router-dom";
import { Search, X, ArrowLeft } from "lucide-react";
import { getAllBlogPosts, getCategoryPostCount } from "@/content/blog";

interface BlogSidebarProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedTag?: string;
  onSelectTag?: (tag: string) => void;
}

export default function BlogSidebar({
  selectedCategory = "",
  onSelectCategory,
  searchQuery = "",
  onSearchChange,
  selectedTag = "",
  onSelectTag
}: BlogSidebarProps) {
  const location = useLocation();
  const isPostPage = location.pathname.startsWith("/blog/") && location.pathname !== "/blog";

  const allPosts = getAllBlogPosts();
  const categoryCounts = getCategoryPostCount();

  // Extract top tags
  const tagCounts: Record<string, number> = {};
  allPosts.forEach((post) => {
    post.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const popularTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const categories = [
    { id: "", label: "Semua Kategori", count: allPosts.length },
    { id: "tutorials", label: "Tutorial & Panduan", count: categoryCounts["tutorials"] || 0 },
    { id: "case-studies", label: "Studi Kasus", count: categoryCounts["case-studies"] || 0 },
    { id: "special", label: "Informasi Khusus", count: categoryCounts["special"] || 0 }
  ];

  return (
    <div className="space-y-6 text-sm">
      {/* Back Link on Post Page */}
      {isPostPage && (
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Semua Artikel</span>
        </Link>
      )}

      {/* Search Input */}
      <div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Cari artikel..."
            className="w-full rounded-md border border-input bg-transparent py-1.5 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              aria-label="Bersihkan pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-foreground tracking-tight px-2 py-1">
          Kategori
        </h4>
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return onSelectCategory ? (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                  isSelected
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {cat.count}
                </span>
              </button>
            ) : (
              <Link
                key={cat.id}
                to="/blog"
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <span>{cat.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Popular Tags Section */}
      {popularTags.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <h4 className="text-xs font-semibold text-foreground tracking-tight px-2">
            Topik
          </h4>
          <div className="flex flex-wrap gap-1 px-2">
            {popularTags.map(([tag]) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag?.(isSelected ? "" : tag)}
                  className={`rounded border px-1.5 py-0.5 text-[11px] transition-colors ${
                    isSelected
                      ? "border-foreground bg-foreground text-background font-medium"
                      : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Workshop Location Note */}
      <div className="pt-4 border-t border-border px-2 text-[11px] text-muted-foreground leading-relaxed">
        <span className="font-medium text-foreground block mb-0.5">Workshop</span>
        Sukarame & Belwis Unila, Bandar Lampung. Melayani kirim ke seluruh Indonesia.
      </div>
    </div>
  );
}
