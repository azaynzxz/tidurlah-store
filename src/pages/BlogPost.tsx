import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EruditeBlogLayout from "@/components/blog/EruditeBlogLayout";
import BlogSidebar from "@/components/blog/BlogSidebar";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import BlogRelatedProducts from "@/components/blog/BlogRelatedProducts";
import BlogWhatsAppCta from "@/components/blog/BlogWhatsAppCta";
import BlogContent from "@/components/blog/BlogContent";
import SEO from "@/components/common/SEO";
import { getBlogPostBySlug } from "@/content/blog";
import { SITE_ORIGIN, toAbsoluteAssetUrl } from "@/utils/productSeo";

export default function BlogPost() {
  const { title, slug } = useParams();
  const currentSlug = slug || title || "";
  const post = getBlogPostBySlug(currentSlug);

  if (!post) {
    return (
      <EruditeBlogLayout
        breadcrumbs={[
          { label: "Blog", href: "/blog" },
          { label: "Artikel Tidak Ditemukan" }
        ]}
      >
        <div className="rounded-lg border border-border p-8 text-center my-6">
          <h1 className="text-lg font-semibold text-foreground mb-1">
            Artikel Tidak Ditemukan
          </h1>
          <p className="text-xs text-muted-foreground mb-4">
            Halaman blog atau artikel yang Anda cari tidak tersedia.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Blog</span>
          </Link>
        </div>
      </EruditeBlogLayout>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
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

  const pageUrl = `${SITE_ORIGIN}/blog/${post.slug}`;
  const imageUrl = post.image ? toAbsoluteAssetUrl(post.image) : `${SITE_ORIGIN}/product-image/web-preview.jpg`;

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.subtitle,
    image: [imageUrl],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author || "ID Card Lampung",
      url: SITE_ORIGIN
    },
    publisher: {
      "@type": "Organization",
      name: "ID Card Lampung",
      url: SITE_ORIGIN,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/Logo id card lampung 1x1 transparan.png`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl
    }
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_ORIGIN}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_ORIGIN}/blog`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: pageUrl
      }
    ]
  };

  const breadcrumbs = [
    { label: "Blog", href: "/blog" },
    { label: post.title }
  ];

  return (
    <>
      <SEO
        title={`${post.title} - Tidurlah Store Blog`}
        description={post.subtitle}
        url={pageUrl}
        image={imageUrl}
        type="article"
        keywords={post.tags?.join(", ")}
        jsonLd={[jsonLdArticle, jsonLdBreadcrumb]}
      />

      <EruditeBlogLayout
        breadcrumbs={breadcrumbs}
        sidebar={<BlogSidebar />}
        toc={<BlogTableOfContents containerSelector="#blog-article-content" />}
      >
        <article className="space-y-6">
          {/* Article Header */}
          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {getCategoryLabel(post.category)}
              </span>
              <span>•</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>•</span>
              <span>{post.readTime}</span>
              {post.author && (
                <>
                  <span>•</span>
                  <span>Oleh {post.author}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
              {post.title}
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed">
              {post.subtitle}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Featured Image (if available) */}
          {post.image && (
            <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                className="w-full max-h-[420px] object-cover"
              />
            </div>
          )}

          {/* Article Main Body */}
          <div
            id="blog-article-content"
            className="prose prose-slate max-w-none text-foreground leading-relaxed space-y-6 text-sm sm:text-base prose-headings:font-bold prose-headings:text-foreground prose-headings:scroll-mt-20 prose-a:text-foreground prose-a:underline hover:prose-a:text-primary prose-img:rounded-lg prose-img:border prose-img:border-border"
          >
            <BlogContent content={post.content} />
          </div>

          {/* Related Products Recommendation */}
          <BlogRelatedProducts relatedItems={post.relatedProducts} />

          {/* Single Tasteful WhatsApp Prompt */}
          <BlogWhatsAppCta postTitle={post.title} />
        </article>
      </EruditeBlogLayout>
    </>
  );
}
