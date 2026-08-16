import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query || {};

    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'Valid event ID or slug is required' });
    }
    
    try {
      const eventQuery = `
        SELECT 
          e.*,
          COUNT(er.id) as current_registrations
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status != 'cancelled'
        WHERE e.id = ? OR e.slug = ?
        GROUP BY e.id
      `;
      
      const result = await executeQuery(eventQuery, [id, id]);
      
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        return res.status(200).json(result.data[0]);
      }
    } catch (error) {
      console.warn('Error fetching event details from DB, checking memoryStore:', error.message);
    }

    const memoryEvt = memoryStore.events.find(e => String(e.id) === String(id) || e.slug === id);
    if (memoryEvt) {
      return res.status(200).json(memoryEvt);
    }

    return res.status(404).json({ error: 'Event not found' });
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}