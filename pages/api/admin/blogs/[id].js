// pages/api/admin/blogs/[id].js
import { executeQuery } from '../../../../lib/db.js';
import { memoryStore } from '../../../../lib/memoryStore.js';
import { formatBlog, calculateReadTime } from '../../../../lib/blogUtils.js';

export default async function handler(req, res) {
  const { id } = req.query || {};

  if (req.method === 'GET') {
    try {
      const result = await executeQuery(`
        SELECT 
          b.*, 
          c.name as category_name
        FROM blogs b
        LEFT JOIN blog_categories c ON b.category_id = c.id
        WHERE b.id = ? OR b.slug = ?
      `, [id, id]);

      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        return res.status(200).json(formatBlog(result.data[0], memoryStore.categories));
      }
    } catch (err) {
      console.warn('DB fetch single blog failed, checking memory store:', err.message);
    }

    const memoryBlog = memoryStore.blogs.find(b => String(b.id) === String(id) || b.slug === id);
    if (memoryBlog) {
      return res.status(200).json(formatBlog(memoryBlog, memoryStore.categories));
    }

    return res.status(404).json({ error: 'Blog not found' });
  }

  if (req.method === 'PUT') {
    const { 
      title, 
      slug, 
      excerpt, 
      content, 
      author, 
      author_name,
      author_role,
      author_image,
      category,
      category_id,
      image_url, 
      read_time,
      featured, 
      status, 
      published_at 
    } = req.body || {};

    const generatedSlug = slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');
    const authorName = author_name || author;

    // Update memory store instance
    const index = memoryStore.blogs.findIndex(b => String(b.id) === String(id) || b.slug === id);
    let updatedBlog = null;

    if (index !== -1) {
      const existing = memoryStore.blogs[index];
      const merged = {
        ...existing,
        title: title !== undefined ? title : existing.title,
        slug: generatedSlug || existing.slug,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: content !== undefined ? content : existing.content,
        author: authorName || existing.author,
        author_name: authorName || existing.author_name || existing.author,
        author_role: author_role || existing.author_role,
        author_image: author_image || existing.author_image,
        category: category || existing.category,
        category_id: category_id || existing.category_id,
        image_url: image_url !== undefined ? image_url : existing.image_url,
        read_time: read_time || (content ? calculateReadTime(content) : existing.read_time),
        featured: featured !== undefined ? (featured ? 1 : 0) : existing.featured,
        status: status || existing.status,
        published_at: published_at || existing.published_at,
        updated_at: new Date().toISOString()
      };
      updatedBlog = formatBlog(merged, memoryStore.categories);
      memoryStore.blogs[index] = updatedBlog;
    } else {
      const newBlogRaw = {
        id: Number(id) || id,
        title: title || '',
        slug: generatedSlug,
        excerpt: excerpt || '',
        content: content || '',
        author_name: authorName || 'Genesis Team',
        author_role: author_role || 'Contributor',
        author_image: author_image || '/startup-teams.webp',
        category: category || 'General',
        category_id: category_id || 1,
        image_url: image_url || '/1381732341471.png',
        read_time: read_time || calculateReadTime(content),
        featured: featured ? 1 : 0,
        status: status || 'published',
        published_at: published_at || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      updatedBlog = formatBlog(newBlogRaw, memoryStore.categories);
      memoryStore.blogs.unshift(updatedBlog);
    }

    try {
      await executeQuery(`
        UPDATE blogs 
        SET title=?, slug=?, excerpt=?, content=?, author=?, category_id=?, 
            image_url=?, featured=?, status=?, published_at=?, updated_at=NOW()
        WHERE id=? OR slug=?
      `, [
        updatedBlog.title, 
        updatedBlog.slug, 
        updatedBlog.excerpt, 
        updatedBlog.content, 
        updatedBlog.author_name, 
        updatedBlog.category_id, 
        updatedBlog.image_url, 
        updatedBlog.featured ? 1 : 0, 
        updatedBlog.status, 
        updatedBlog.published_at, 
        id, 
        id
      ]);
    } catch (err) {
      console.warn('DB update single blog fallback:', err.message);
    }

    return res.status(200).json({ 
      message: 'Blog updated successfully', 
      success: true, 
      id: updatedBlog.id,
      slug: updatedBlog.slug,
      blog: updatedBlog,
      updated_at: updatedBlog.updated_at 
    });
  }

  if (req.method === 'DELETE') {
    // Delete from memory store
    memoryStore.blogs = memoryStore.blogs.filter(b => String(b.id) !== String(id) && b.slug !== id);

    try {
      await executeQuery(`DELETE FROM blogs WHERE id = ? OR slug = ?`, [id, id]);
    } catch (err) {
      console.warn('DB delete single blog fallback:', err.message);
    }

    return res.status(200).json({ message: 'Blog deleted successfully', success: true });
  }

  res.status(405).end();
}