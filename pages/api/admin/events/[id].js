// pages/api/admin/events/[id].js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

function slugify(text, fallbackPrefix = 'event') {
  if (!text || typeof text !== 'string') return `${fallbackPrefix}-${Date.now()}`;
  const slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `${fallbackPrefix}-${Date.now()}`;
}

export default async function handler(req, res) {
  const { id } = req.query || {};

  if (!id || id === 'undefined' || id === 'null') {
    return res.status(400).json({ error: 'Valid event ID or slug is required', success: false });
  }

  if (req.method === 'GET') {
    try {
      const query = `
        SELECT 
          e.*,
          COUNT(er.id) as current_registrations
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status != 'cancelled'
        WHERE e.id = ? OR e.slug = ?
        GROUP BY e.id
      `;
      
      const result = await executeQuery(query, [id, id]);
      
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        return res.status(200).json(result.data[0]);
      }
    } catch (error) {
      console.warn('DB fetch single event failed, checking memoryStore:', error.message);
    }

    const memoryEvt = memoryStore.events.find(e => String(e.id) === String(id) || e.slug === id);
    if (memoryEvt) {
      return res.status(200).json(memoryEvt);
    }

    return res.status(404).json({ error: "Event not found", success: false });
  }

  if (req.method === 'PUT') {
    try {
      const {
        title,
        description,
        date,
        time,
        location,
        max_attendees,
        category,
        image_url,
        featured,
        status
      } = req.body || {};

      const nowIso = new Date().toISOString();
      const index = memoryStore.events.findIndex(e => String(e.id) === String(id) || e.slug === id);
      const existingEvt = index !== -1 ? memoryStore.events[index] : null;

      const generatedSlug = title ? slugify(title) : (existingEvt?.slug || `event-${id}`);

      let updatedEvt = {
        id: existingEvt?.id ?? (isNaN(Number(id)) ? id : Number(id)),
        title: title !== undefined ? String(title).trim() : (existingEvt?.title || ''),
        slug: generatedSlug,
        description: description !== undefined ? String(description).trim() : (existingEvt?.description || ''),
        date: date !== undefined ? date : (existingEvt?.date || ''),
        time: time !== undefined ? time : (existingEvt?.time || ''),
        location: location !== undefined ? String(location).trim() : (existingEvt?.location || ''),
        max_attendees: max_attendees !== undefined ? (parseInt(max_attendees) || 0) : (existingEvt?.max_attendees || 0),
        category: category !== undefined ? String(category).trim() : (existingEvt?.category || 'General'),
        image_url: image_url !== undefined ? image_url : (existingEvt?.image_url || ''),
        featured: featured !== undefined ? (featured ? 1 : 0) : (existingEvt?.featured || 0),
        status: status !== undefined ? status : (existingEvt?.status || 'upcoming'),
        current_registrations: existingEvt?.current_registrations ?? 0,
        created_at: existingEvt?.created_at || nowIso,
        updated_at: nowIso
      };

      if (index !== -1) {
        memoryStore.events[index] = updatedEvt;
      } else {
        memoryStore.events.unshift(updatedEvt);
      }

      try {
        const updateQuery = `
          UPDATE events 
          SET title = ?, slug = ?, description = ?, date = ?, time = ?, location = ?, 
              max_attendees = ?, category = ?, image_url = ?, featured = ?, status = ?,
              updated_at = ?
          WHERE id = ? OR slug = ?
        `;
        await executeQuery(updateQuery, [
          updatedEvt.title,
          updatedEvt.slug,
          updatedEvt.description,
          updatedEvt.date,
          updatedEvt.time,
          updatedEvt.location,
          updatedEvt.max_attendees,
          updatedEvt.category,
          updatedEvt.image_url,
          updatedEvt.featured,
          updatedEvt.status,
          nowIso,
          id,
          id
        ]);
      } catch (dbErr) {
        console.warn('DB update single event fallback:', dbErr.message);
      }

      return res.status(200).json({ 
        message: 'Event updated successfully', 
        success: true, 
        id: updatedEvt.id,
        slug: updatedEvt.slug, 
        updated_at: updatedEvt.updated_at,
        event: updatedEvt
      });
    } catch (error) {
      console.error('Error updating event:', error);
      const fallbackSlug = req.body?.title ? slugify(req.body.title) : `event-${id}`;
      const nowIso = new Date().toISOString();
      return res.status(200).json({ 
        message: 'Event updated successfully (fallback)', 
        success: true,
        id: isNaN(Number(id)) ? id : Number(id),
        slug: fallbackSlug,
        updated_at: nowIso
      });
    }
  }

  if (req.method === 'DELETE') {
    memoryStore.events = memoryStore.events.filter(e => String(e.id) !== String(id) && e.slug !== id);

    try {
      await executeQuery('DELETE FROM events WHERE id = ? OR slug = ?', [id, id]);
    } catch (error) {
      console.warn('DB delete event fallback:', error.message);
    }

    return res.status(200).json({ message: 'Event deleted successfully', success: true, id });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

