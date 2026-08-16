// lib/blogUtils.js
import { memoryStore } from './memoryStore.js';

export function calculateReadTime(content) {
  if (!content) return '3 min read';
  const plainText = String(content).replace(/<[^>]*>/g, ' ').trim();
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function formatBlog(blog, categories = memoryStore.categories || []) {
  if (!blog) return null;

  const content = blog.content || '';
  const readTime = blog.read_time || calculateReadTime(content);

  // Author details
  const authorName = blog.author_name || blog.author || 'Genesis Team';
  
  let defaultRole = 'Contributor';
  let defaultImage = '/startup-teams.webp';

  if (authorName.includes('Varun')) {
    defaultRole = 'Incubation Director';
    defaultImage = '/gen-ab.jpg';
  } else if (authorName.includes('Shobhit')) {
    defaultRole = 'Head of Operations';
    defaultImage = '/4931732341324.jpg';
  } else if (authorName.includes('Ajay')) {
    defaultRole = 'Managing Director';
    defaultImage = '/3201732336658.jpg';
  } else if (authorName.includes('Vivek')) {
    defaultRole = 'DeepTech Advisory Lead';
    defaultImage = '/1561729364662.jpg';
  } else if (authorName.includes('Editorial')) {
    defaultRole = 'Content Team';
    defaultImage = '/startup-teams.webp';
  }

  const authorRole = blog.author_role || defaultRole;
  const authorImage = blog.author_image || defaultImage;

  // Category mapping
  let categoryId = Number(blog.category_id) || null;
  let categoryName = blog.category || null;

  const catsList = (Array.isArray(categories) && categories.length > 0) ? categories : (memoryStore.categories || []);

  if (categoryId && !categoryName) {
    const match = catsList.find(c => Number(c.id) === categoryId);
    if (match) categoryName = match.name;
  } else if (categoryName && !categoryId) {
    const match = catsList.find(c => String(c.name).toLowerCase() === String(categoryName).toLowerCase());
    if (match) categoryId = Number(match.id);
  }

  if (!categoryName) categoryName = 'General';
  if (!categoryId) categoryId = 1;

  const publishedAt = blog.published_at || blog.created_at || new Date().toISOString();
  const createdAt = blog.created_at || publishedAt;

  const title = blog.title || '';
  const slug = blog.slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');

  return {
    id: Number(blog.id) || blog.id,
    title: title,
    slug: slug,
    excerpt: blog.excerpt || '',
    content: content,
    author: authorName,
    author_name: authorName,
    author_role: authorRole,
    author_image: authorImage,
    category_id: categoryId,
    category: categoryName,
    image_url: blog.image_url || '/1381732341471.png',
    read_time: readTime,
    featured: Boolean(blog.featured),
    status: blog.status || 'published',
    published_at: publishedAt,
    created_at: createdAt,
    updated_at: blog.updated_at || new Date().toISOString(),
    date: blog.date || new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    views: Number(blog.views) || 0,
    comments: Number(blog.comments || blog.comments_count) || 0,
    comments_count: Number(blog.comments_count || blog.comments) || 0
  };
}
