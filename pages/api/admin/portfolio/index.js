// pages/api/admin/portfolio/index.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

export function normalizePortfolioItem(item) {
  if (!item) return null;
  const itemTitle = item.title || item.name || 'Untitled Startup';
  const itemImage = item.image_url || item.image || item.logo_url || '/placeholder.svg?height=400&width=600';
  const itemLink = item.link || item.website_url || '#';
  const itemDate = item.date
    ? (typeof item.date === 'string' ? item.date.split('T')[0] : new Date(item.date).toISOString().split('T')[0])
    : new Date().toISOString().split('T')[0];

  let parsedTags = [];
  if (Array.isArray(item.tags)) {
    parsedTags = item.tags;
  } else if (typeof item.tags === 'string') {
    try {
      parsedTags = JSON.parse(item.tags);
      if (!Array.isArray(parsedTags)) {
        parsedTags = item.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    } catch (e) {
      parsedTags = item.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  const foundedYear = item.founded || (itemDate ? new Date(itemDate).getFullYear().toString() : '2023');

  return {
    id: Number(item.id) || item.id,
    title: itemTitle,
    name: itemTitle,
    category: item.category || 'General',
    description: item.description || '',
    founders: item.founders || '',
    funding_stage: item.funding_stage || item.funding || 'Seed',
    image: itemImage,
    image_url: itemImage,
    logo_url: itemImage,
    link: itemLink,
    website_url: itemLink,
    status: item.status || 'active',
    tags: parsedTags,
    funding: item.funding || item.funding_stage || '₹2.5 Cr',
    employees: item.employees || '15-20',
    founded: foundedYear,
    date: itemDate,
    created_at: item.created_at || new Date().toISOString()
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await executeQuery(`
        SELECT * FROM portfolio 
        ORDER BY created_at DESC
      `);
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        const items = result.data.map(normalizePortfolioItem);
        // Sync memory store
        items.forEach(item => {
          const idx = memoryStore.portfolio.findIndex(p => Number(p.id) === Number(item.id));
          if (idx !== -1) {
            memoryStore.portfolio[idx] = item;
          } else {
            memoryStore.portfolio.push(item);
          }
        });
        return res.status(200).json(items);
      }
    } catch (error) {
      console.warn('Error fetching portfolio DB, returning memoryStore:', error.message);
    }

    const memoryData = (memoryStore.portfolio || []).map(normalizePortfolioItem);
    return res.status(200).json(memoryData);
  }

  if (req.method === 'POST') {
    try {
      const {
        title,
        name,
        category,
        description,
        founders,
        funding_stage,
        image_url,
        image,
        logo_url,
        website_url,
        link,
        status = 'active',
        tags = [],
        date,
        funding,
        employees,
        founded
      } = req.body || {};

      const itemTitle = title || name;
      if (!itemTitle) {
        return res.status(400).json({ error: 'Title or name is required' });
      }

      const itemImage = image_url || image || logo_url || '/placeholder.svg?height=400&width=600';
      const itemLink = link || website_url || '#';
      const itemDate = date || new Date().toISOString().split('T')[0];
      const itemTags = Array.isArray(tags)
        ? tags
        : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
      const itemFounded = founded || (itemDate ? new Date(itemDate).getFullYear().toString() : '2023');

      const newItemId = Date.now();
      const newItem = {
        id: newItemId,
        title: itemTitle,
        name: itemTitle,
        category: category || 'General',
        description: description || '',
        founders: founders || '',
        funding_stage: funding_stage || funding || 'Seed',
        image_url: itemImage,
        image: itemImage,
        logo_url: itemImage,
        website_url: itemLink,
        link: itemLink,
        status: status || 'active',
        tags: itemTags,
        date: itemDate,
        funding: funding || '₹2.5 Cr',
        employees: employees || '15-20',
        founded: itemFounded,
        created_at: new Date().toISOString()
      };

      // Add to central memoryStore first
      memoryStore.portfolio.unshift(newItem);

      try {
        const result = await executeQuery(`
          INSERT INTO portfolio 
          (name, title, category, description, founders, funding_stage, logo_url, image_url, image, website_url, link, status, tags, date, funding, employees, founded)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          itemTitle,
          itemTitle, 
          category || 'General', 
          description || null, 
          founders || null,
          funding_stage || funding || 'Seed',
          itemImage,
          itemImage, 
          itemImage,
          itemLink,
          itemLink, 
          status || 'active', 
          JSON.stringify(itemTags),
          itemDate,
          funding || '₹2.5 Cr',
          employees || '15-20',
          itemFounded
        ]);

        if (result && result.success && result.data?.insertId) {
          newItem.id = result.data.insertId;
          const memIndex = memoryStore.portfolio.findIndex(p => p.id === newItemId);
          if (memIndex !== -1) {
            memoryStore.portfolio[memIndex].id = result.data.insertId;
          }
        }
      } catch (dbErr) {
        console.warn('DB offline during portfolio insert, saved in memoryStore:', dbErr.message);
      }

      return res.status(201).json({
        message: 'Created successfully',
        id: newItem.id,
        item: newItem,
        success: true
      });
    } catch (error) {
      console.error('Create portfolio error:', error);
      return res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
