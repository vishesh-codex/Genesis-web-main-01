// pages/api/admin/blogs/index.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';
import { formatBlog, calculateReadTime } from '@/lib/blogUtils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await executeQuery(`
        SELECT 
          b.*, 
          c.name as category_name
        FROM blogs b
        LEFT JOIN blog_categories c ON b.category_id = c.id
        ORDER BY b.created_at DESC
      `);
      if (result && result.success && Array.isArray(result.data)) {
        const blogs = result.data.map(b => formatBlog(b, memoryStore.categories));
        // Keep memoryStore updated with latest DB blogs
        blogs.forEach(b => {
          const idx = memoryStore.blogs.findIndex(mb => String(mb.id) === String(b.id) || mb.slug === b.slug);
          if (idx !== -1) {
            memoryStore.blogs[idx] = b;
          } else {
            memoryStore.blogs.push(b);
          }
        });
        return res.status(200).json(blogs);
      }
    } catch (err) {
      console.warn('DB GET admin blogs failed, returning memory store:', err.message);
    }
    const memoryBlogs = (memoryStore.blogs || []).map(b => formatBlog(b, memoryStore.categories));
    return res.status(200).json(memoryBlogs);
  }

  if (req.method === 'POST') {
    try {
      const { 
        title, 
        slug, 
        excerpt, 
        summary,
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

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const finalSlug = slug || title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const authorName = author_name || author || 'Genesis Team';
      const authorRole = author_role || 'Contributor';
      const authorImage = author_image || '/startup-teams.webp';
      const blogExcerpt = excerpt || summary || '';
      const readTimeVal = read_time || calculateReadTime(content);

      // Resolve category ID and Name
      let resolvedCatId = category_id ? Number(category_id) : null;
      let resolvedCatName = category || null;

      if (!resolvedCatId && resolvedCatName) {
        // Try finding matching category
        const match = (memoryStore.categories || []).find(
          c => String(c.name).toLowerCase() === String(resolvedCatName).toLowerCase()
        );
        if (match) {
          resolvedCatId = Number(match.id);
        } else {
          // Attempt inserting into blog_categories table
          const catSlug = resolvedCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          try {
            const catDb = await executeQuery(
              'INSERT INTO blog_categories (name, slug) VALUES (?, ?)', 
              [resolvedCatName, catSlug]
            );
            if (catDb.success && catDb.data?.insertId) {
              resolvedCatId = catDb.data.insertId;
              memoryStore.categories.push({ id: resolvedCatId, name: resolvedCatName, slug: catSlug });
            }
          } catch (e) {
            console.warn('Could not auto-create category in DB:', e.message);
          }
        }
      }

      if (!resolvedCatId) resolvedCatId = 1;
      if (!resolvedCatName) resolvedCatName = 'General';

      const rawBlogObj = {
        id: Date.now(),
        title,
        slug: finalSlug,
        excerpt: blogExcerpt,
        summary: blogExcerpt,
        content: content || '',
        author: authorName,
        author_name: authorName,
        author_role: authorRole,
        author_image: authorImage,
        category_id: resolvedCatId,
        category: resolvedCatName,
        image_url: image_url || '/1381732341471.png',
        read_time: readTimeVal,
        featured: featured ? 1 : 0,
        status: status || 'published',
        views: 0,
        comments: 0,
        comments_count: 0,
        published_at: published_at || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let formattedBlogObj = formatBlog(rawBlogObj, memoryStore.categories);

      try {
        const result = await executeQuery(`
          INSERT INTO blogs (
            title, slug, summary, excerpt, content, author, author_name, author_role, author_image,
            category_id, image_url, read_time, featured, status, published_at, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          title, 
          finalSlug, 
          blogExcerpt || null,
          blogExcerpt || null, 
          content, 
          authorName, 
          authorName,
          authorRole,
          authorImage,
          resolvedCatId, 
          image_url || null, 
          readTimeVal,
          featured ? 1 : 0, 
          status || 'published', 
          published_at || null
        ]);

        if (result && result.success && result.data?.insertId) {
          formattedBlogObj.id = result.data.insertId;
        }
      } catch (err) {
        console.warn('DB INSERT blog failed, saved in memory store fallback:', err.message);
      }

      // Sync memoryStore
      const existingIdx = memoryStore.blogs.findIndex(b => b.slug === finalSlug);
      if (existingIdx !== -1) {
        memoryStore.blogs[existingIdx] = formattedBlogObj;
      } else {
        memoryStore.blogs.unshift(formattedBlogObj);
      }

      return res.status(201).json({ 
        message: 'Blog created successfully', 
        id: formattedBlogObj.id,
        slug: finalSlug,
        blog: formattedBlogObj,
        success: true
      });
    } catch (err) {
      console.error('Error creating blog post:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
