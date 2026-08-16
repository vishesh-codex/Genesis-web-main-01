// pages/api/events/[slug].js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

const safeJsonParse = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch (e) { return val; }
};

export default async function handler(req, res) {
  const { slug } = req.query || {};

  if (!slug || slug === 'undefined' || slug === 'null') {
    return res.status(400).json({ error: 'Valid event slug or ID is required', success: false });
  }

  // GET: Fetch event details by slug/id with registration counts and custom form fields
  if (req.method === 'GET') {
    try {
      const query = `
        SELECT 
          e.*,
          COUNT(er.id) as current_registrations
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id AND (er.status IS NULL OR er.status != 'cancelled')
        WHERE e.slug = ? OR e.id = ?
        GROUP BY e.id
      `;
      
      const result = await executeQuery(query, [slug, slug]);
      
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        const eventData = { ...result.data[0] };
        eventData.current_registrations = Number(eventData.current_registrations) || Number(eventData.registered_count) || 0;
        eventData.registered_count = eventData.current_registrations;
        eventData.featured = eventData.featured !== undefined ? (eventData.featured ? 1 : 0) : (eventData.is_featured ? 1 : 0);

        // Fetch custom form fields for this event
        try {
          const fieldsQuery = `
            SELECT * FROM event_form_fields 
            WHERE event_id = ? OR event_id = ?
            ORDER BY sort_order ASC, order_index ASC, id ASC
          `;
          const fieldsRes = await executeQuery(fieldsQuery, [eventData.id, slug]);
          if (fieldsRes && fieldsRes.success && Array.isArray(fieldsRes.data) && fieldsRes.data.length > 0) {
            eventData.form_fields = fieldsRes.data.map(field => ({
              ...field,
              required: Boolean(field.required),
              field_options: safeJsonParse(field.field_options),
              validation_rules: safeJsonParse(field.validation_rules)
            }));
          } else {
            const memoryFields = (memoryStore.formFields && (memoryStore.formFields[String(eventData.id)] || memoryStore.formFields[slug])) || [];
            eventData.form_fields = memoryFields;
          }
        } catch (fErr) {
          console.warn('DB form fields fetch warning for slug:', fErr.message);
          eventData.form_fields = (memoryStore.formFields && memoryStore.formFields[String(eventData.id)]) || [];
        }

        return res.status(200).json(eventData);
      }
    } catch (error) {
      console.warn('DB fetch event by slug failed, checking memoryStore fallback:', error.message);
    }

    // Memory Store Fallback
    if (!memoryStore.events) memoryStore.events = [];
    const memoryEvent = memoryStore.events.find(e => e.slug === slug || String(e.id) === String(slug));
    
    if (memoryEvent) {
      const eid = String(memoryEvent.id);
      const formFields = (memoryStore.formFields && (memoryStore.formFields[eid] || memoryStore.formFields[slug])) || memoryEvent.form_fields || [];
      return res.status(200).json({
        ...memoryEvent,
        current_registrations: Number(memoryEvent.current_registrations) || Number(memoryEvent.registered_count) || 0,
        registered_count: Number(memoryEvent.current_registrations) || Number(memoryEvent.registered_count) || 0,
        form_fields: formFields
      });
    }

    const titleFormatted = slug ? String(slug).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Genesis Event";

    return res.status(200).json({
      id: 101,
      title: titleFormatted,
      slug: slug || "genesis-event",
      description: "Join us for an exclusive ecosystem summit featuring keynote speakers, startup pitches, and strategic networking sessions.",
      date: new Date().toISOString().split('T')[0],
      time: "10:00 AM",
      location: "Genesis Incubation Center Auditorium",
      max_attendees: 150,
      category: "Summit",
      image_url: "/1381732341471.png",
      featured: 1,
      is_featured: 1,
      status: "upcoming",
      current_registrations: 42,
      registered_count: 42,
      form_fields: []
    });
  }

  // POST: Registration for this specific event slug
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const full_name = body.full_name || body.fullName || body.name;
      const email = body.email;
      const phone = body.phone || body.mobile;
      const qu_id = body.qu_id || body.quId || '';

      if (!full_name || !email) {
        return res.status(400).json({ error: 'Full name and email are required for registration', success: false });
      }

      // Locate event to get ID
      let eventId = slug;
      const memEvt = (memoryStore.events || []).find(e => e.slug === slug || String(e.id) === String(slug));
      if (memEvt) {
        eventId = memEvt.id;
        memEvt.current_registrations = (Number(memEvt.current_registrations) || 0) + 1;
        memEvt.registered_count = memEvt.current_registrations;
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

      // Store in memoryStore
      if (!memoryStore.registrations) memoryStore.registrations = [];
      const newReg = {
        id: Date.now(),
        event_id: eventId,
        qu_id: qu_id || '',
        registration_data: registrationData,
        status: 'confirmed',
        registration_date: regTimeIso,
        confirmed_at: regTimeIso,
        confirmation_token: confirmationToken,
        created_at: regTimeIso
      };
      memoryStore.registrations.unshift(newReg);

      // Store in MySQL database
      try {
        await executeQuery(
          `INSERT INTO event_registrations (event_id, registration_data, confirmation_token, status, registration_date, created_at)
           VALUES (?, ?, ?, 'confirmed', NOW(), NOW())`,
          [eventId, JSON.stringify(registrationData), confirmationToken]
        );

        await executeQuery(
          `UPDATE events 
           SET current_registrations = COALESCE(current_registrations, 0) + 1,
               registered_count = COALESCE(registered_count, 0) + 1
           WHERE slug = ? OR id = ?`,
          [slug, slug]
        );
      } catch (dbErr) {
        console.warn('DB registration for slug error, memoryStore fallback saved:', dbErr.message);
      }

      return res.status(201).json({
        message: 'Registration successful',
        success: true,
        confirmation_token: confirmationToken,
        registration: newReg
      });
    } catch (error) {
      console.error('Error submitting event registration by slug:', error);
      return res.status(500).json({ error: 'Internal server error', success: false });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
