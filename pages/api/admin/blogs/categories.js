import { executeQuery } from '../../../../lib/db.js';
import { memoryStore } from '../../../../lib/memoryStore.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await executeQuery('SELECT * FROM blog_categories ORDER BY name ASC');
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        // Sync with memoryStore categories
        result.data.forEach(dbCat => {
          if (!memoryStore.categories.some(mc => mc.id === dbCat.id || mc.name.toLowerCase() === dbCat.name.toLowerCase())) {
            memoryStore.categories.push(dbCat);
          }
        });
        return res.status(200).json(result.data);
      }
    } catch (err) {
      console.warn('DB categories query failed, returning memory store:', err);
    }
    return res.status(200).json(memoryStore.categories || []);
  }

  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

    const trimmedName = name.trim();

    // Check if exists in memoryStore
    const existingMem = (memoryStore.categories || []).find(c => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingMem) {
      return res.status(200).json({ success: true, message: 'Category already exists', id: existingMem.id, name: existingMem.name });
    }

    const newCategory = {
      id: Date.now(),
      name: trimmedName
    };

    memoryStore.categories.push(newCategory);

    try {
      const existingDb = await executeQuery('SELECT id FROM blog_categories WHERE name = ?', [trimmedName]);
      if (existingDb.success && existingDb.data && existingDb.data.length > 0) {
        newCategory.id = existingDb.data[0].id;
        return res.status(200).json({ success: true, message: 'Category already exists', id: newCategory.id, name: trimmedName });
      }

      const result = await executeQuery('INSERT INTO blog_categories (name) VALUES (?)', [trimmedName]);
      if (result.success && result.data?.insertId) {
        newCategory.id = result.data.insertId;
        const last = memoryStore.categories[memoryStore.categories.length - 1];
        if (last && last.name === trimmedName) {
          last.id = result.data.insertId;
        }
      }
    } catch (err) {
      console.warn('DB create category failed, saved in memory store:', err);
    }

    return res.status(201).json({ success: true, message: 'Category created', id: newCategory.id, name: trimmedName });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}