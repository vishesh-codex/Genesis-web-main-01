import { executeQuery } from '../../../lib/db.js';
import { memoryStore } from '../../../lib/memoryStore.js';
import { formatBlog } from '../../../lib/blogUtils.js';

export default async function handler(req, res) {
  const { slug } = req.query || {};

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await executeQuery(`
      SELECT 
        b.*, 
        c.name as category_name
      FROM blogs b
      LEFT JOIN blog_categories c ON b.category_id = c.id
      WHERE (b.slug = ? OR b.id = ?) AND b.status = 'published'
      LIMIT 1
    `, [slug, slug]);

    if (result && result.success) {
      if (Array.isArray(result.data) && result.data.length > 0) {
        const dbBlog = result.data[0];
        executeQuery(`UPDATE blogs SET views = views + 1 WHERE id = ?`, [dbBlog.id]).catch(() => {});
        
        const memMatch = memoryStore.blogs.find(b => b.slug === slug || String(b.id) === String(slug));
        if (memMatch) {
          memMatch.views = (memMatch.views || 0) + 1;
        }

        return res.status(200).json(formatBlog(dbBlog, memoryStore.categories));
      }
      return res.status(404).json({ error: 'Blog post not found' });
    }
  } catch (err) {
    console.warn('Blog Detail DB lookup error, falling back to memory store:', err);
  }

  // Memory store fallback lookup
  const memoryBlog = memoryStore.blogs.find(b => b.slug === slug || String(b.id) === String(slug));
  if (memoryBlog) {
    memoryBlog.views = (memoryBlog.views || 0) + 1;
    return res.status(200).json(formatBlog(memoryBlog, memoryStore.categories));
  }

  return res.status(404).json({ error: 'Blog post not found' });
}