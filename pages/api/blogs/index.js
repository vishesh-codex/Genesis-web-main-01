// pages/api/blogs/index.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';
import { formatBlog } from '@/lib/blogUtils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, id, category, search, limit, page } = req.query || {};

  // Single blog lookup by slug or id
  if (slug || id) {
    const targetIdentifier = slug || id;
    try {
      const result = await executeQuery(`
        SELECT 
          b.*, 
          c.name as category_name
        FROM blogs b
        LEFT JOIN blog_categories c ON b.category_id = c.id
        WHERE (b.slug = ? OR b.id = ?) AND b.status = 'published'
        LIMIT 1
      `, [targetIdentifier, targetIdentifier]);

      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        const dbBlog = result.data[0];
        executeQuery(`UPDATE blogs SET views = views + 1 WHERE id = ?`, [dbBlog.id]).catch(() => {});
        return res.status(200).json(formatBlog(dbBlog, memoryStore.categories));
      }
    } catch (err) {
      console.warn('DB lookup single blog failed, checking memory store:', err.message);
    }

    const memoryBlog = (memoryStore.blogs || []).find(
      b => b.slug === targetIdentifier || String(b.id) === String(targetIdentifier)
    );
    if (memoryBlog) {
      memoryBlog.views = (memoryBlog.views || 0) + 1;
      return res.status(200).json(formatBlog(memoryBlog, memoryStore.categories));
    }

    return res.status(404).json({ error: 'Blog post not found' });
  }

  // List published blogs query
  try {
    const result = await executeQuery(`
      SELECT 
        b.*, 
        c.name as category_name
      FROM blogs b
      LEFT JOIN blog_categories c ON b.category_id = c.id
      WHERE b.status = 'published' AND (b.published_at IS NULL OR b.published_at <= NOW())
      ORDER BY b.featured DESC, b.published_at DESC
    `);

    if (result && result.success && Array.isArray(result.data)) {
      let blogs = result.data.map(b => formatBlog(b, memoryStore.categories));

      if (category && category !== 'All') {
        blogs = blogs.filter(
          b => String(b.category).toLowerCase() === String(category).toLowerCase() ||
               String(b.category_id) === String(category)
        );
      }

      if (search) {
        const queryLower = String(search).toLowerCase();
        blogs = blogs.filter(
          b => String(b.title).toLowerCase().includes(queryLower) ||
               String(b.excerpt || '').toLowerCase().includes(queryLower) ||
               String(b.content || '').toLowerCase().includes(queryLower)
        );
      }

      const limitNum = parseInt(limit, 10);
      const pageNum = parseInt(page, 10) || 1;
      if (!isNaN(limitNum) && limitNum > 0) {
        const start = (pageNum - 1) * limitNum;
        blogs = blogs.slice(start, start + limitNum);
      }

      return res.status(200).json(blogs);
    }
  } catch (error) {
    console.warn('DB query failed for blogs list, serving from memory store:', error.message);
  }

  // Memory store fallback
  let memoryBlogs = (memoryStore.blogs || [])
    .filter(b => (b.status || 'published') === 'published')
    .map(b => formatBlog(b, memoryStore.categories));

  if (category && category !== 'All') {
    memoryBlogs = memoryBlogs.filter(
      b => String(b.category).toLowerCase() === String(category).toLowerCase() ||
           String(b.category_id) === String(category)
    );
  }

  if (search) {
    const queryLower = String(search).toLowerCase();
    memoryBlogs = memoryBlogs.filter(
      b => String(b.title).toLowerCase().includes(queryLower) ||
           String(b.excerpt || '').toLowerCase().includes(queryLower) ||
           String(b.content || '').toLowerCase().includes(queryLower)
    );
  }

  const limitNum = parseInt(limit, 10);
  const pageNum = parseInt(page, 10) || 1;
  if (!isNaN(limitNum) && limitNum > 0) {
    const start = (pageNum - 1) * limitNum;
    memoryBlogs = memoryBlogs.slice(start, start + limitNum);
  }

  return res.status(200).json(memoryBlogs);
}
