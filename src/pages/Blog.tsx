import { useState, useEffect } from "react";
import { Calendar, User, Tag, Clock, Eye, ArrowRight, MapPin, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlogLayout from "@/components/blog/BlogLayout";
import { getAllBlogPosts, BlogPostData, getTopCategories, getBlogPostsByCategory } from "@/content/blog";
import { AnimatedElement, StaggeredContainer } from "@/components/animations/AnimatedElement";

// Extend Window interface for Instagram
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

const Blog = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<BlogPostData[]>([]);

  // Get all blog posts from the content index
  const allPosts = getAllBlogPosts();
  
  // Get top 3 categories with most posts
  const topCategories = getTopCategories(3);
  
  // Get featured post (most recent)
  const featuredPost = allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Load Instagram script
  useEffect(() => {
    const loadInstagramScript = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      } else {
        const script = document.createElement('script');
        script.async = true;
        script.src = "//www.instagram.com/embed.js";
        script.onload = () => {
          if (window.instgrm) {
            window.instgrm.Embeds.process();
          }
        };
        document.body.appendChild(script);
      }
    };
    
    loadInstagramScript();
  }, []);

  // Filter posts based on category and search
  useEffect(() => {
    let filtered = allPosts;

    if (selectedCategory) {
      filtered = getBlogPostsByCategory(selectedCategory);
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.subtitle.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredPosts(filtered);
  }, [allPosts, selectedCategory, searchQuery]);

  const handleSearch = (term: string) => {
    setSearchQuery(term);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'case-studies': 'Studi Kasus',
      'tutorials': 'Tutorial',
      'special': 'Khusus'
    };
    return categoryMap[category] || category;
  };

  return (
    <BlogLayout 
      onSearch={handleSearch}
      showSearch={true}
    >
      <div>
        {/* Main Content */}
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Hero Section - Featured Post */}
          {featuredPost && (
            <div className="mb-16">
              <div className="bg-background rounded-2xl shadow-lg overflow-hidden group cursor-pointer" onClick={() => navigate(`/blog/${featuredPost.slug}`)}>
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <div className="relative h-64 md:h-full">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#FF5E01] text-white px-3 py-1 rounded-full text-xs font-medium">
                          {getCategoryDisplayName(featuredPost.category)}
                        </span>
                      </div>
          </div>
        </div>
                  <div className="md:w-1/2 p-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-[#FF5E01] transition-colors font-inter">
                      {featuredPost.title}
              </h1>
                  <p className="text-lg text-foreground mb-6 leading-relaxed font-lato">
                      {featuredPost.subtitle}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(featuredPost.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-[#FF5E01] font-medium group-hover:text-[#FF5E01]/80 transition-colors">
                      <span>Baca selengkapnya</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
            </div>
                  </div>
                )}

          {/* Category Tabs */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "" 
                    ? "bg-[#FF5E01] text-white" 
                    : "bg-muted text-foreground hover:bg-gray-200"
                }`}
              >
                Semua
              </button>
              {topCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category 
                      ? "bg-[#FF5E01] text-white" 
                      : "bg-muted text-foreground hover:bg-gray-200"
                  }`}
                >
                  {getCategoryDisplayName(category)}
                </button>
              ))}
            </div>
          </div>

                {/* Blog Posts Grid */}
                <StaggeredContainer 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  staggerDelay={50}
                >
                  {filteredPosts.map((post) => (
                    <article 
                      key={post.id}
                      className="bg-background rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer group"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                <div className="relative h-48 overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                        />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#FF5E01] text-white px-2 py-1 rounded-full text-xs font-medium">
                      {getCategoryDisplayName(post.category)}
                    </span>
                      </div>
                        </div>

                <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-[#FF5E01] transition-colors font-inter">
                          {post.title}
                  </h3>

                    <p className="text-sm text-foreground mb-4 line-clamp-2 font-lato">
                          {post.subtitle}
                        </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(post.date)}</span>
                          </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </StaggeredContainer>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-foreground mb-2">Tidak ada artikel ditemukan</h3>
                  <p className="text-foreground mb-4">
                Coba gunakan kata kunci lain atau pilih kategori yang berbeda
                  </p>
                    <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                }}
                className="bg-[#FF5E01] text-white rounded-lg py-2 px-6 font-medium hover:bg-[#FF5E01]/90 transition-colors"
              >
                Reset Filter
                    </button>
                  </div>
          )}
              </div>
            </div>
    </BlogLayout>
  );
};

export default Blog; 