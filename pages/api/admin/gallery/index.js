// pages/api/admin/gallery/index.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

export function normalizeGalleryItem(item) {
  if (!item) return null;
  const itemUrl = item.url || item.image || item.image_url || '/placeholder-event.jpg';
  const itemDate = item.date || (item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  return {
    id: Number(item.id) || item.id,
    title: item.title || 'Untitled Image',
    category: item.category || 'General',
    type: item.type || 'image',
    description: item.description || '',
    url: itemUrl,
    image: itemUrl,
    size: item.size || '0 MB',
    dimensions: item.dimensions || 'N/A',
    date: itemDate,
    created_at: item.created_at || new Date().toISOString()
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await executeQuery(`
        SELECT 
          id, title, category, type, description, url, size, dimensions, created_at,
          DATE_FORMAT(created_at, '%Y-%m-%d') as date
        FROM gallery 
        ORDER BY created_at DESC
      `);

      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        const items = result.data.map(normalizeGalleryItem);
        // Sync memory store
        if (!memoryStore.gallery) memoryStore.gallery = [];
        items.forEach(item => {
          const idx = memoryStore.gallery.findIndex(g => Number(g.id) === Number(item.id));
          if (idx !== -1) {
            memoryStore.gallery[idx] = item;
          } else {
            memoryStore.gallery.push(item);
          }
        });
        return res.status(200).json(items);
      }
    } catch (err) {
      console.warn('DB GET gallery list failed, returning memory store:', err.message);
    }

    const memoryData = (memoryStore.gallery || []).map(normalizeGalleryItem);
    return res.status(200).json(memoryData);
  }

  if (req.method === 'POST') {
    try {
      const { title, category, description, url, image, image_url, size, dimensions, type } = req.body || {};

      const itemTitle = title || 'Untitled Media';
      const itemUrl = url || image || image_url;

      if (!itemUrl) {
        return res.status(400).json({ error: 'Media URL or image is required' });
      }

      const tempId = Date.now();
      const newItem = {
        id: tempId,
        title: itemTitle,
        category: category || 'General',
        type: type || 'image',
        description: description || '',
        url: itemUrl,
        image: itemUrl,
        size: size || '0 MB',
        dimensions: dimensions || 'N/A',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      if (!memoryStore.gallery) memoryStore.gallery = [];
      memoryStore.gallery.unshift(newItem);

      try {
        const result = await executeQuery(`
          INSERT INTO gallery (title, category, description, url, size, dimensions, type)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          itemTitle, 
          category || 'General', 
          description || '', 
          itemUrl, 
          size || '0 MB', 
          dimensions || 'N/A', 
          type || 'image'
        ]);

        if (result && result.success && result.data?.insertId) {
          newItem.id = result.data.insertId;
          const memIdx = memoryStore.gallery.findIndex(g => g.id === tempId);
          if (memIdx !== -1) {
            memoryStore.gallery[memIdx].id = result.data.insertId;
          }
        }
      } catch (dbErr) {
        console.warn('DB INSERT gallery failed, saved in memoryStore fallback:', dbErr.message);
      }

      return res.status(201).json({
        message: 'Item added successfully',
        id: newItem.id,
        item: newItem,
        success: true
      });
    } catch (err) {
      console.error('Error creating gallery item:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
