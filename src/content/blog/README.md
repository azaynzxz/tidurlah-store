# Blog Content Management

This directory contains all blog posts organized by category. The refactored blog system separates content from presentation, making it easy to add new blog posts.

## Directory Structure

```
src/content/blog/
├── case-studies/          # Customer success stories
├── tutorials/             # How-to guides and tips
├── promotions/            # Discounts and offers
├── policies/              # Privacy, FAQ, terms
├── special/               # Special interactive posts
├── components/            # Reusable blog components
├── index.ts              # Central export file
└── README.md             # This file
```

## Adding a New Blog Post

### 1. Create the Blog Post File

Create a new `.tsx` file in the appropriate category directory:

```typescript
// src/content/blog/tutorials/my-new-post.tsx
export const blogPost = {
  id: 22,  // Unique ID
  slug: "my-new-post-slug",  // URL slug (must be unique)
  title: "My New Blog Post Title",
  subtitle: "A brief description of the post",
  author: "ID Card Lampung",
  date: "2024-01-20",
  tags: ["Tag1", "Tag2", "Tag3"],
  readTime: "5 menit",
  views: 0,
  image: "/blog-thumbnail/my-image.webp",
  category: "tutorials",
  content: `
    <div class="space-y-6">
      <p class="text-gray-700 leading-relaxed">Your HTML content here...</p>
      <h3 class="text-xl font-bold text-gray-900 mb-3">Section Title</h3>
      <p class="text-gray-700 leading-relaxed">More content...</p>
    </div>
  `,
  relatedProducts: ["ID Card & Lanyard"]
};
```

### 2. Add to Central Index

Import and add your blog post to `src/content/blog/index.ts`:

```typescript
// Import the new blog post
import { blogPost as myNewPost } from "./tutorials/my-new-post";

// Add to the blogPosts array
export const blogPosts: BlogPostData[] = [
  // ... existing posts
  myNewPost,
  // Add more blog posts here as they are created
];
```

### 3. That's It!

Your blog post will automatically appear on the blog listing page and be accessible at `/blog/my-new-post-slug`.

## Content Guidelines

### HTML Content
- Use semantic HTML with proper heading hierarchy
- Apply Tailwind CSS classes for styling
- Use the `space-y-6` class for consistent spacing between sections
- Use `text-gray-700 leading-relaxed` for body text
- Use `text-xl font-bold text-gray-900 mb-3` for section headings

### Images
- Place images in `/public/blog-thumbnail/`
- Use WebP format for better performance
- Recommended size: 1200x630px for featured images

### Tags
- Use 3-5 relevant tags per post
- Keep tags consistent across similar posts
- Use title case for tag names

### Categories
- `case-studies`: Customer success stories
- `tutorials`: How-to guides and tips
- `promotions`: Discounts and special offers
- `policies`: Privacy, FAQ, terms of service
- `special`: Interactive posts with custom components

## Special Components

For interactive blog posts, create a component in `src/content/blog/components/` and reference it in the content field:

```typescript
// src/content/blog/special/my-interactive-post.tsx
import MyCustomComponent from "../components/MyCustomComponent";

export const blogPost = {
  // ... other fields
  content: MyCustomComponent,
  // ... rest of fields
};
```

## URL Structure

- All blog posts are accessible at `/blog/{slug}`
- Slugs must be unique across all posts
- Use kebab-case for slugs (e.g., `my-awesome-post`)
- Avoid special characters and spaces

## SEO Considerations

- Each blog post automatically gets proper meta tags
- Featured images are used for Open Graph previews
- Canonical URLs are set automatically
- Blog posts are indexed by search engines

## Benefits of This System

- **Easy to add posts**: Just create one file with content
- **No style duplication**: Reusable components handle all styling
- **Better organization**: Posts grouped by category
- **Type safety**: TypeScript ensures consistent structure
- **Maintainable**: Changes to layout affect all posts automatically
- **SEO friendly**: All URLs and meta tags work correctly
- **Shareable links**: Blog URLs work correctly for social sharing




