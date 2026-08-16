// pages/api/events/index.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

const safeJsonParse = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch (e) { return val; }
};

export default async function handler(req, res) {
  // GET: Public listing of events with query filtering
  if (req.method === 'GET') {
    const { category, status, featured, search, limit } = req.query || {};

    try {
      let eventsQuery = `
        SELECT 
          e.*,
          COUNT(er.id) as current_registrations
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id AND (er.status IS NULL OR er.status != 'cancelled')
      `;
      const conditions = [];
      const queryParams = [];

      if (category && category !== 'all') {
        conditions.push(`LOWER(e.category) = LOWER(?)`);
        queryParams.push(category);
      }
      if (status && status !== 'all') {
        conditions.push(`LOWER(e.status) = LOWER(?)`);
        queryParams.push(status);
      }
      if (featured === '1' || featured === 'true') {
        conditions.push(`(e.featured = 1 OR e.is_featured = 1)`);
      }
      if (search && String(search).trim()) {
        conditions.push(`(LOWER(e.title) LIKE LOWER(?) OR LOWER(e.description) LIKE LOWER(?))`);
        const searchPattern = `%${String(search).trim()}%`;
        queryParams.push(searchPattern, searchPattern);
      }

      if (conditions.length > 0) {
        eventsQuery += ` WHERE ` + conditions.join(' AND ');
      }

      eventsQuery += ` GROUP BY e.id ORDER BY e.date ASC, e.created_at DESC`;

      if (limit && !isNaN(parseInt(limit))) {
        eventsQuery += ` LIMIT ${parseInt(limit)}`;
      }

      const result = await executeQuery(eventsQuery, queryParams);

      if (result && result.success && Array.isArray(result.data)) {
        const eventsList = result.data.map(event => ({
          ...event,
          current_registrations: Number(event.current_registrations) || Number(event.registered_count) || 0,
          registered_count: Number(event.current_registrations) || Number(event.registered_count) || 0,
          featured: event.featured !== undefined ? (event.featured ? 1 : 0) : (event.is_featured ? 1 : 0)
        }));

        return res.status(200).json(eventsList);
      }
    } catch (error) {
      console.warn('DB fetch public events failed, serving memoryStore:', error.message);
    }

    // Memory Store Fallback
    if (!memoryStore.events) memoryStore.events = [];
    let filteredEvents = [...memoryStore.events];

    if (category && category !== 'all') {
      filteredEvents = filteredEvents.filter(e => String(e.category || '').toLowerCase() === String(category).toLowerCase());
    }
    if (status && status !== 'all') {
      filteredEvents = filteredEvents.filter(e => String(e.status || '').toLowerCase() === String(status).toLowerCase());
    }
    if (featured === '1' || featured === 'true') {
      filteredEvents = filteredEvents.filter(e => Boolean(e.featured || e.is_featured));
    }
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      filteredEvents = filteredEvents.filter(e =>
        String(e.title || '').toLowerCase().includes(q) ||
        String(e.description || '').toLowerCase().includes(q)
      );
    }

    const formattedEvents = filteredEvents.map(event => ({
      ...event,
      current_registrations: Number(event.current_registrations) || Number(event.registered_count) || 0,
      registered_count: Number(event.current_registrations) || Number(event.registered_count) || 0
    }));

    if (limit && !isNaN(parseInt(limit))) {
      return res.status(200).json(formattedEvents.slice(0, parseInt(limit)));
    }

    return res.status(200).json(formattedEvents);
  }

  // POST: Register participant for an event OR create a new event
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const targetEventId = body.event_id || body.eventId || body.eventSlug;

      // Handle Event Participant Registration
      if (targetEventId || body.full_name || body.fullName || body.email) {
        const full_name = body.full_name || body.fullName || body.name;
        const email = body.email;
        const phone = body.phone || body.mobile || body.contact;
        const qu_id = body.qu_id || body.quId || body.student_id || '';

        if (!full_name || !email) {
          return res.status(400).json({ error: 'Full name and email are required for registration', success: false });
        }

        const confirmationToken = 'CONF-' + Math.random().toString(36).substring(2, 11).toUpperCase();
        const regTimeIso = new Date().toISOString();

        const registrationData = {
          full_name,
          name: full_name,
          email,
          phone: phone || '',
          qu_id: qu_id || '',
          ...body
        };

        const eventIdNum = Number(targetEventId) || 1;

        // Save to memoryStore first
        if (!memoryStore.registrations) memoryStore.registrations = [];
        const newRegObj = {
          id: Date.now(),
          event_id: eventIdNum,
          qu_id: qu_id || '',
          registration_data: registrationData,
          status: 'confirmed',
          registration_date: regTimeIso,
          confirmed_at: regTimeIso,
          confirmation_token: confirmationToken,
          created_at: regTimeIso
        };
        memoryStore.registrations.unshift(newRegObj);

        // Increment event count in memoryStore
        const evt = (memoryStore.events || []).find(e => String(e.id) === String(targetEventId) || e.slug === targetEventId);
        if (evt) {
          evt.current_registrations = (Number(evt.current_registrations) || 0) + 1;
          evt.registered_count = evt.current_registrations;
        }

        // Save to MySQL database
        try {
          const insertRegQuery = `
            INSERT INTO event_registrations (event_id, registration_data, confirmation_token, status, registration_date, created_at)
            VALUES (?, ?, ?, 'confirmed', NOW(), NOW())
          `;
          await executeQuery(insertRegQuery, [
            eventIdNum,
            JSON.stringify(registrationData),
            confirmationToken
          ]);

          const updateCountQuery = `
            UPDATE events 
            SET current_registrations = COALESCE(current_registrations, 0) + 1,
                registered_count = COALESCE(registered_count, 0) + 1
            WHERE id = ? OR slug = ?
          `;
          await executeQuery(updateCountQuery, [targetEventId, targetEventId]);
        } catch (dbErr) {
          console.warn('DB registration insert warning, stored in memoryStore fallback:', dbErr.message);
        }

        return res.status(201).json({
          message: 'Registration successful',
          success: true,
          confirmation_token: confirmationToken,
          registration: newRegObj
        });
      }

      return res.status(400).json({ error: 'Invalid registration or event payload', success: false });
    } catch (error) {
      console.error('Error in events index POST:', error);
      return res.status(500).json({ error: 'Internal server error', success: false });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
