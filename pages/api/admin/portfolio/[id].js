// pages/api/admin/portfolio/[id].js (Update + Delete)
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

function normalizePortfolioItem(item) {
  if (!item) return null;
  const itemTitle = item.title || item.name || 'Untitled Startup';
  const itemImage = item.image_url || item.image || '/placeholder.svg?height=400&width=600';
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
    id: item.id,
    title: itemTitle,
    name: itemTitle,
    category: item.category || 'General',
    description: item.description || '',
    image: itemImage,
    image_url: itemImage,
    link: item.link || '#',
    status: item.status || 'active',
    tags: parsedTags,
    funding: item.funding || '₹2.5 Cr',
    employees: item.employees || '15-20',
    founded: foundedYear,
    date: itemDate,
    created_at: item.created_at || new Date().toISOString()
  };
}

export default async function handler(req, res) {
  const { id } = req.query || {};

  if (req.method === 'GET') {
    try {
      const result = await executeQuery(`SELECT * FROM portfolio WHERE id = ?`, [id]);
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        const item = normalizePortfolioItem(result.data[0]);
        return res.status(200).json(item);
      }
    } catch (error) {
      console.warn('DB fetch single portfolio failed:', error);
    }

    const memoryItem = memoryStore.portfolio.find(p => p.id == id);
    if (memoryItem) {
      return res.status(200).json(normalizePortfolioItem(memoryItem));
    }

    return res.status(404).json({ error: 'Not found' });
  }

  if (req.method === 'PUT') {
    const {
      title,
      name,
      category,
      description,
      image_url,
      image,
      status,
      tags,
      link,
      date,
      funding,
      employees,
      founded
    } = req.body || {};

    // Update in memory store first
    let updatedItem = null;
    const index = memoryStore.portfolio.findIndex(p => p.id == id);
    if (index !== -1) {
      const existing = memoryStore.portfolio[index];
      const newTitle = title || name || existing.title || existing.name;
      const newImage = image_url !== undefined ? image_url : (image !== undefined ? image : existing.image_url);
      const newTags = tags !== undefined 
        ? (Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []))
        : existing.tags;
      const newDate = date !== undefined ? date : existing.date;
      const newFounded = founded !== undefined ? founded : (newDate ? new Date(newDate).getFullYear().toString() : existing.founded);

      updatedItem = {
        ...existing,
        id: existing.id,
        title: newTitle,
        name: newTitle,
        category: category !== undefined ? category : existing.category,
        description: description !== undefined ? description : existing.description,
        image_url: newImage,
        image: newImage,
        status: status !== undefined ? status : existing.status,
        tags: newTags,
        link: link !== undefined ? link : existing.link,
        date: newDate,
        funding: funding !== undefined ? funding : existing.funding,
        employees: employees !== undefined ? employees : existing.employees,
        founded: newFounded,
        created_at: existing.created_at || new Date().toISOString()
      };
      memoryStore.portfolio[index] = updatedItem;
    } else {
      // If item wasn't in memory store, construct it
      const newTitle = title || name || 'Updated Startup';
      const newImage = image_url || image || '/placeholder.svg?height=400&width=600';
      const newDate = date || new Date().toISOString().split('T')[0];
      updatedItem = {
        id: isNaN(Number(id)) ? id : Number(id),
        title: newTitle,
        name: newTitle,
        category: category || 'General',
        description: description || '',
        image_url: newImage,
        image: newImage,
        status: status || 'active',
        tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
        link: link || '#',
        date: newDate,
        funding: funding || '₹2.5 Cr',
        employees: employees || '15-20',
        founded: founded || new Date(newDate).getFullYear().toString(),
        created_at: new Date().toISOString()
      };
      memoryStore.portfolio.unshift(updatedItem);
    }

    try {
      await executeQuery(`
        UPDATE portfolio 
        SET title = ?, category = ?, description = ?, image_url = ?, 
            status = ?, tags = ?, link = ?, date = ?
        WHERE id = ?
      `, [
        updatedItem.title,
        updatedItem.category,
        updatedItem.description,
        updatedItem.image_url,
        updatedItem.status,
        JSON.stringify(updatedItem.tags),
        updatedItem.link,
        updatedItem.date,
        id
      ]);
    } catch (error) {
      console.warn('DB update single portfolio fallback:', error);
    }

    return res.status(200).json({
      message: 'Updated successfully',
      item: updatedItem,
      success: true
    });
  }

  if (req.method === 'DELETE') {
    // Delete from memoryStore
    memoryStore.portfolio = memoryStore.portfolio.filter(p => p.id != id);

    try {
      await executeQuery(`DELETE FROM portfolio WHERE id = ?`, [id]);
    } catch (error) {
      console.warn('DB delete single portfolio fallback:', error);
    }

    return res.status(200).json({ message: 'Deleted successfully', id: Number(id) || id, success: true });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}