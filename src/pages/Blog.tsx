import { useState, useMemo } from "react";
import { X } from "lucide-react";
import EruditeBlogLayout from "@/components/blog/EruditeBlogLayout";
import BlogSidebar from "@/components/blog/BlogSidebar";
import EruditeBlogCard from "@/components/blog/EruditeBlogCard";
import SEO from "@/components/common/SEO";
import { getAllBlogPosts } from "@/content/blog";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allPosts = useMemo(() => {
    return getAllBlogPosts().sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, []);

  const filteredPosts = useMemo(() => {
    let result = allPosts;

    if (selectedCategory) {
      result = result.filter((post) => post.category === selectedCategory);
    }

    if (selectedTag) {
      result = result.filter((post) => post.tags?.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.subtitle.toLowerCase().includes(q) ||
          post.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allPosts, selectedCategory, selectedTag, searchQuery]);

  const hasFilter = Boolean(selectedCategory || selectedTag || searchQuery);

  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedTag("");
    setSearchQuery("");
  };

  const breadcrumbs = [{ label: "Blog", href: "/blog" }];

  return (
    <>
      <SEO
        title="Blog & Panduan Percetakan - Tidurlah Store"
        description="Dokumentasi teknis, studi kasus sekolah & kampus, serta panduan spesifikasi cetak ID card, tali lanyard, dan merchandise oleh Tidurlah Grafika."
        url="https://idcardlampung.com/blog"
        keywords="blog percetakan lampung, tutorial cetak id card, panduan desain lanyard, studi kasus percetakan"
      />

      <EruditeBlogLayout
        breadcrumbs={breadcrumbs}
        sidebar={
          <BlogSidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        }
      >
        <div className="space-y-6">
          {/* Page Title & Intro */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Blog & Panduan Cetak
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dokumentasi teknis, standar ukuran desain, studi kasus klien, dan tips seputar cetak ID card, lanyard sublimasi, dan merchandise promosi.
            </p>
          </div>

          {/* Filter Status Bar */}
          {hasFilter && (
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span>
                Menampilkan <strong>{filteredPosts.length}</strong> artikel
                {selectedCategory && <span> kategori <strong>{selectedCategory}</strong></span>}
                {selectedTag && <span> tag <strong>#{selectedTag}</strong></span>}
                {searchQuery && <span> kata kunci <strong>"{searchQuery}"</strong></span>}
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          )}

          <div className="border-b border-border" />

          {/* Articles Stream */}
          {filteredPosts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                Tidak ada artikel yang cocok
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Coba gunakan kata kunci pencarian yang lain atau bersihkan filter.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
              >
                Lihat Semua Artikel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <EruditeBlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </EruditeBlogLayout>
    </>
  );
}
