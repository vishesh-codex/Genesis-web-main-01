// pages/api/gallery/index.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';
import { normalizeGalleryItem } from '../admin/gallery/index';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { page, limit, category } = req.query || {};

  try {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const isPaginated = !isNaN(pageNum) || !isNaN(limitNum);

    const queryCat = category && category !== 'All' ? category : null;

    let sql = `
      SELECT 
        id, title, category, type, description, url, size, dimensions, created_at,
        DATE_FORMAT(created_at, '%Y-%m-%d') as date
      FROM gallery
    `;
    const queryParams = [];

    if (queryCat) {
      sql += ` WHERE category = ?`;
      queryParams.push(queryCat);
    }
    sql += ` ORDER BY created_at DESC`;

    const result = await executeQuery(sql, queryParams);

    let items = [];
    if (result && result.success && Array.isArray(result.data)) {
      items = result.data.map(normalizeGalleryItem);
    } else {
      items = (memoryStore.gallery || []).map(normalizeGalleryItem);
      if (queryCat) {
        items = items.filter(i => String(i.category).toLowerCase() === String(queryCat).toLowerCase());
      }
    }

    if (isPaginated) {
      const currentPage = Math.max(1, pageNum || 1);
      const itemsPerPage = Math.max(1, limitNum || 9);
      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const start = (currentPage - 1) * itemsPerPage;
      const paginatedItems = items.slice(start, start + itemsPerPage);

      const allCategories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))].sort();

      return res.status(200).json({
        items: paginatedItems,
        pagination: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage
        },
        categories: allCategories
      });
    }

    return res.status(200).json(items);
  } catch (error) {
    console.error('Gallery API Error:', error);
    const memoryData = (memoryStore.gallery || []).map(normalizeGalleryItem);
    return res.status(200).json(memoryData);
  }
}
