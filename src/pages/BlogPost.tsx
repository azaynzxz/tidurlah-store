import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShoppingBag, Star, User, Calendar, Tag, Clock, Eye } from "lucide-react";
import { getBlogPostBySlug, BlogPostData } from "@/content/blog";
import BlogContent from "@/components/blog/BlogContent";
import BlogLayout from "@/components/blog/BlogLayout";

const BlogPost = () => {
  const navigate = useNavigate();
  const { title } = useParams();
  const [blogPost, setBlogPost] = useState<BlogPostData | null>(null);

  useEffect(() => {
    // Get blog post content based on URL slug
    const slug = title || "";
    const foundBlogPost = getBlogPostBySlug(slug);
    
    if (!foundBlogPost) {
      // Redirect to blog listing if post not found
      navigate('/blog');
      return;
    }
    
    setBlogPost(foundBlogPost);
    
    // Set document title
    document.title = `${foundBlogPost.title} - TIDURLAH STORE Blog`;
  }, [title, navigate]);

  if (!blogPost) {
    return (
      <BlogLayout showBackButton={true}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto max-w-4xl bg-white min-h-screen">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Tidak Ditemukan</h1>
              <p className="text-gray-600 mb-6">Halaman yang Anda cari tidak ditemukan.</p>
              <button 
                onClick={() => navigate('/blog')}
                className="bg-[#FF5E01] text-white rounded-lg py-2 px-6 font-medium hover:bg-[#FF5E01]/90 transition-colors"
              >
                Kembali ke Blog
              </button>
            </div>
          </div>
        </div>
      </BlogLayout>
    );
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <BlogLayout showBackButton={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-4xl bg-white min-h-screen">
          {/* Main Content */}
          <div className="px-4 py-8">
            <div className="max-w-3xl mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-6">
                <span className="text-gray-500 text-sm">
                  <button onClick={() => navigate('/')} className="hover:text-[#FF5E01]">Home</button> / 
                  <button onClick={() => navigate('/blog')} className="hover:text-[#FF5E01] ml-1"> Blog</button> / 
                  <span className="text-gray-700 ml-1">{title || 'Artikel'}</span>
                </span>
              </nav>

              {/* Article Header */}
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {blogPost.title}
                </h1>

                <h2 className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
                  {blogPost.subtitle}
                </h2>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{blogPost.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(blogPost.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{blogPost.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{blogPost.views} views</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {blogPost.tags.map((tag, index) => (
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

              {/* Featured Image */}
              {blogPost.image && (
                <div className="mb-8">
                  <img 
                    src={blogPost.image}
                    alt={blogPost.title}
                    className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Article Content */}
              <article className="mb-12">
                <BlogContent content={blogPost.content} />
              </article>

              {/* Call to Action */}
              <div className="bg-gray-50 rounded-xl p-6 text-center border">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Butuh Konsultasi untuk Proyek ID Card Anda?
                </h3>
                <p className="text-gray-600 mb-4">
                  Tim ahli kami siap membantu memberikan solusi terbaik untuk kebutuhan ID card perusahaan Anda.
                </p>
                <a 
                  href="https://wa.me/6285172157808?text=Halo, saya ingin konsultasi mengenai pembuatan ID card untuk perusahaan."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-[#25D366] text-white rounded-lg py-2 px-6 font-medium hover:bg-[#25D366]/90 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M17.6 6.31999C16.2 4.91999 14.2 4.09999 12.1 4.09999C7.79995 4.09999 4.29995 7.59999 4.29995 11.9C4.29995 13.3 4.69995 14.7 5.39995 15.9L4.19995 19.9L8.29995 18.7C9.49995 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.79999 19 7.79999 17.6 6.31999ZM12.1 18.3C10.9 18.3 9.69995 17.9 8.69995 17.2L8.39995 17L5.99995 17.7L6.69995 15.4L6.39995 15.1C5.59995 14 5.19995 13 5.19995 11.9C5.19995 8.09999 8.29995 5.09999 12 5.09999C13.8 5.09999 15.5 5.79999 16.7 6.99999C17.9 8.19999 18.6 9.89999 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.89995 11.5C9.89995 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.79995 9.19999 9.59995 8.79999C9.39995 8.39999 9.19995 8.39999 8.99995 8.39999C8.89995 8.39999 8.69995 8.39999 8.49995 8.39999C8.29995 8.39999 7.99995 8.49999 7.79995 8.79999C7.59995 9.09999 7.09995 9.49999 7.09995 10.4C7.09995 11.3 7.79995 12.2 7.89995 12.4C8.09995 12.6 9.69995 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z" fill="white"/>
                  </svg>
                  Konsultasi Gratis
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlogLayout>
  );
};

export default BlogPost;