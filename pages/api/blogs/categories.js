import { executeQuery } from '../../../lib/db.js';
import { memoryStore } from '../../../lib/memoryStore.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await executeQuery(`
      SELECT DISTINCT c.id, c.name 
      FROM blog_categories c
      JOIN blogs b ON b.category_id = c.id
      WHERE b.status = 'published'
      ORDER BY c.name ASC
    `);
    
    if (result && result.success && Array.isArray(result.data)) {
      return res.status(200).json(result.data);
    }
  } catch (err) {
    console.warn('DB Query failed for categories, serving from memory store:', err);
  }

  return res.status(200).json(memoryStore.categories || []);
}