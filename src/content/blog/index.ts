// Import all blog posts
import { blogPost as smaArRaihan } from "./case-studies/sma-ar-raihan";
import { blogPost as lanyardCareTips } from "./tutorials/lanyard-care-tips";
import { blogPost as tutorialCaraOrder } from "./tutorials/tutorial-cara-order";
import { blogPost as sponsorship } from "./special/sponsorship";
import { blogPost as designGuide } from "./special/design-guide";
import { blogPost as faq } from "./special/faq";
import { blogPost as privacyPolicy } from "./special/privacy-policy";
import { blogPost as returnPolicy } from "./special/return-policy";

// Import components
import DesignGuideComponent from "./components/DesignGuideComponent";
import SponsorshipFormComponent from "./components/SponsorshipFormComponent";

import { ComponentType } from "react";

// Blog post interface
export interface BlogPostData {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  tags: string[];
  readTime: string;
  views: number;
  image: string;
  category: string;
  content: string | ComponentType;
  relatedProducts: string[];
}

// All blog posts array
export const blogPosts: BlogPostData[] = [
  smaArRaihan,
  lanyardCareTips,
  tutorialCaraOrder,
  sponsorship,
  designGuide,
  faq,
  privacyPolicy,
  returnPolicy,
  // Add more blog posts here as they are created
];

// Create slug-to-post mapping for fast lookups
export const blogPostsBySlug: Record<string, BlogPostData> = blogPosts.reduce((acc, post) => {
  acc[post.slug] = post;
  return acc;
}, {} as Record<string, BlogPostData>);

// Components map for special posts
export const blogComponents: Record<string, React.ComponentType> = {
  "DESIGN_GUIDE_COMPONENT": DesignGuideComponent,
  "SPONSORSHIP_FORM_COMPONENT": SponsorshipFormComponent,
};

// Helper function to get blog post by slug
export const getBlogPostBySlug = (slug: string): BlogPostData | undefined => {
  return blogPostsBySlug[slug];
};

// Helper function to get all blog posts
export const getAllBlogPosts = (): BlogPostData[] => {
  return blogPosts;
};

// Helper function to get blog posts by category
export const getBlogPostsByCategory = (category: string): BlogPostData[] => {
  return blogPosts.filter(post => post.category === category);
};

// Helper function to get category post counts
export const getCategoryPostCount = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  blogPosts.forEach(post => {
    counts[post.category] = (counts[post.category] || 0) + 1;
  });
  return counts;
};

// Helper function to get top categories by post count
export const getTopCategories = (limit: number = 3): string[] => {
  const counts = getCategoryPostCount();
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([category]) => category);
};

// Helper function to get posts for top categories
export const getTopCategoryPosts = (limit: number = 3, postsPerCategory: number = 6): Record<string, BlogPostData[]> => {
  const topCategories = getTopCategories(limit);
  const result: Record<string, BlogPostData[]> = {};
  
  topCategories.forEach(category => {
    result[category] = getBlogPostsByCategory(category).slice(0, postsPerCategory);
  });
  
  return result;
};

// Validate no duplicate slugs
const slugs = blogPosts.map(post => post.slug);
const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);

if (duplicateSlugs.length > 0) {
  console.warn("Duplicate blog post slugs found:", duplicateSlugs);
}
