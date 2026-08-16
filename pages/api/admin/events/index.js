// pages/api/admin/events/index.js
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

const safeJsonParse = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
};

const safeJsonStringify = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val);
  } catch (e) {
    return null;
  }
};

export default async function handler(req, res) {
  const { id } = req.query || {};

  // GET: Fetch all events or single event with registration counts & custom form fields
  if (req.method === 'GET') {
    try {
      let eventsQuery = `
        SELECT 
          e.*,
          COUNT(er.id) as current_registrations
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id AND (er.status IS NULL OR er.status != 'cancelled')
      `;
      const queryParams = [];

      if (id) {
        eventsQuery += ` WHERE e.id = ? OR e.slug = ?`;
        queryParams.push(id, id);
      }

      eventsQuery += ` GROUP BY e.id ORDER BY e.created_at DESC`;

      const result = await executeQuery(eventsQuery, queryParams);

      if (result && result.success && Array.isArray(result.data)) {
        // Fetch all form fields from event_form_fields table
        let fieldsMap = {};
        try {
          const fieldsRes = await executeQuery(`SELECT * FROM event_form_fields ORDER BY sort_order ASC, order_index ASC, id ASC`);
          if (fieldsRes && fieldsRes.success && Array.isArray(fieldsRes.data)) {
            for (const f of fieldsRes.data) {
              const eid = String(f.event_id);
              if (!fieldsMap[eid]) fieldsMap[eid] = [];
              fieldsMap[eid].push({
                ...f,
                required: Boolean(f.required),
                field_options: safeJsonParse(f.field_options),
                validation_rules: safeJsonParse(f.validation_rules)
              });
            }
          }
        } catch (fErr) {
          console.warn('DB form fields fetch warning:', fErr.message);
        }

        const eventsList = result.data.map(event => {
          const eid = String(event.id);
          const formFields = fieldsMap[eid] || (memoryStore.formFields ? memoryStore.formFields[eid] : []) || [];
          return {
            ...event,
            current_registrations: Number(event.current_registrations) || Number(event.registered_count) || 0,
            registered_count: Number(event.current_registrations) || Number(event.registered_count) || 0,
            featured: event.featured !== undefined ? (event.featured ? 1 : 0) : (event.is_featured ? 1 : 0),
            form_fields: formFields
          };
        });

        // Update memoryStore for cache freshness
        memoryStore.events = eventsList;

        if (id) {
          if (eventsList.length > 0) {
            return res.status(200).json(eventsList[0]);
          }
          return res.status(404).json({ error: 'Event not found', success: false });
        }

        return res.status(200).json(eventsList);
      }
    } catch (error) {
      console.warn('DB fetch events failed in admin/events index, serving memoryStore:', error.message);
    }

    // Memory Store Fallback
    if (!memoryStore.events) memoryStore.events = [];
    const memoryEvents = memoryStore.events.map(event => {
      const eid = String(event.id);
      const formFields = (memoryStore.formFields && memoryStore.formFields[eid]) || event.form_fields || [];
      return {
        ...event,
        current_registrations: Number(event.current_registrations) || Number(event.registered_count) || 0,
        registered_count: Number(event.current_registrations) || Number(event.registered_count) || 0,
        form_fields: formFields
      };
    });

    if (id) {
      const found = memoryEvents.find(e => String(e.id) === String(id) || e.slug === id);
      if (found) return res.status(200).json(found);
      return res.status(404).json({ error: 'Event not found', success: false });
    }

    return res.status(200).json(memoryEvents);
  }

  // POST: Create a new event with optional custom form fields
  if (req.method === 'POST') {
    try {
      const {
        title,
        description,
        content,
        date,
        time,
        location,
        max_attendees,
        category,
        image_url,
        status = 'upcoming',
        featured = false,
        is_featured
      } = req.body || {};

      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'Event title is required', success: false });
      }

      const isFeaturedVal = (featured || is_featured) ? 1 : 0;
      const slug = slugify(title);
      const newEventId = Date.now();
      const nowIso = new Date().toISOString();

      const newEventObj = {
        id: newEventId,
        title: String(title).trim(),
        slug: slug,
        description: description ? String(description).trim() : '',
        content: content ? String(content).trim() : '',
        date: date || new Date().toISOString().split('T')[0],
        time: time || '10:00 AM',
        location: location ? String(location).trim() : 'Genesis Incubation Center',
        max_attendees: parseInt(max_attendees) || 500,
        category: category ? String(category).trim() : 'General',
        image_url: image_url || '/1381732341471.png',
        featured: isFeaturedVal,
        is_featured: isFeaturedVal,
        status: status || 'upcoming',
        current_registrations: 0,
        registered_count: 0,
        form_fields: [],
        created_at: nowIso,
        updated_at: nowIso
      };

      // Try inserting into MySQL DB
      try {
        const insertQuery = `
          INSERT INTO events (title, slug, description, content, date, time, location, max_attendees, category, image_url, featured, is_featured, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await executeQuery(insertQuery, [
          newEventObj.title,
          newEventObj.slug,
          newEventObj.description,
          newEventObj.content,
          newEventObj.date,
          newEventObj.time,
          newEventObj.location,
          newEventObj.max_attendees,
          newEventObj.category,
          newEventObj.image_url,
          isFeaturedVal,
          isFeaturedVal,
          newEventObj.status,
          nowIso,
          nowIso
        ]);

        if (result && result.success && result.data?.insertId) {
          newEventObj.id = result.data.insertId;
        }
      } catch (dbErr) {
        console.warn('DB insert event error, fallback to memoryStore:', dbErr.message);
      }

      // Handle custom form fields if supplied in body
      if (!memoryStore.formFields) memoryStore.formFields = {};
      const rawFields = req.body?.form_fields || req.body?.formFields || req.body?.custom_fields || req.body?.customFields || req.body?.fields;
      let inputFields = rawFields;
      if (typeof inputFields === 'string') {
        try { inputFields = JSON.parse(inputFields); } catch (e) { inputFields = null; }
      }

      if (Array.isArray(inputFields)) {
        const finalEventId = newEventObj.id;
        const eventIdStr = String(finalEventId);

        const normalizedFields = [];
        for (let idx = 0; idx < inputFields.length; idx++) {
          const field = inputFields[idx];
          const fieldName = field.field_name || field.fieldName || field.name || `field_${idx + 1}`;
          const fieldLabel = field.field_label || field.fieldLabel || field.label || fieldName;
          const fieldType = field.field_type || field.fieldType || field.type || 'text';
          const rawOptions = field.field_options ?? field.fieldOptions ?? field.options ?? null;
          const rawValidation = field.validation_rules ?? field.validationRules ?? field.validation ?? null;
          const sortOrder = field.sort_order ?? field.order_index ?? field.orderIndex ?? field.order ?? (idx + 1);

          const fObj = {
            id: field.id || (Date.now() + idx),
            event_id: eventIdStr,
            field_name: String(fieldName).trim(),
            field_label: String(fieldLabel).trim(),
            field_type: String(fieldType).trim(),
            field_options: safeJsonParse(rawOptions),
            required: Boolean(field.required),
            placeholder: field.placeholder ? String(field.placeholder) : '',
            validation_rules: safeJsonParse(rawValidation),
            order_index: sortOrder,
            sort_order: sortOrder
          };

          // Save custom form field to MySQL event_form_fields
          try {
            const insertFieldQuery = `
              INSERT INTO event_form_fields 
              (event_id, field_name, field_label, field_type, field_options, required, placeholder, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const fieldDbResult = await executeQuery(insertFieldQuery, [
              eventIdStr,
              fObj.field_name,
              fObj.field_label,
              fObj.field_type,
              safeJsonStringify(fObj.field_options),
              fObj.required ? 1 : 0,
              fObj.placeholder,
              fObj.sort_order
            ]);
            if (fieldDbResult && fieldDbResult.success && fieldDbResult.data?.insertId) {
              fObj.id = fieldDbResult.data.insertId;
            }
          } catch (fDbErr) {
            console.warn('DB form field insert error:', fDbErr.message);
          }

          normalizedFields.push(fObj);
        }

        memoryStore.formFields[eventIdStr] = normalizedFields;
        newEventObj.form_fields = normalizedFields;
      }

      // Update memoryStore
      if (!memoryStore.events) memoryStore.events = [];
      memoryStore.events = memoryStore.events.filter(e => String(e.id) !== String(newEventObj.id));
      memoryStore.events.unshift(newEventObj);

      return res.status(201).json({
        message: 'Event created successfully',
        id: newEventObj.id,
        slug: newEventObj.slug,
        event: newEventObj,
        form_fields: newEventObj.form_fields,
        success: true
      });
    } catch (error) {
      console.error('Error creating event in admin/events index:', error);
      return res.status(500).json({ error: 'Internal server error', success: false });
    }
  }

  // PUT: Update existing event by ID or slug
  if (req.method === 'PUT') {
    try {
      const { target_id, target_slug } = req.query;
      const eventIdOrSlug = id || target_id || target_slug || req.body?.id || req.body?.slug;

      if (!eventIdOrSlug) {
        return res.status(400).json({ error: 'Event ID or slug is required for update', success: false });
      }

      const {
        title,
        description,
        content,
        date,
        time,
        location,
        max_attendees,
        category,
        image_url,
        featured,
        is_featured,
        status
      } = req.body || {};

      const nowIso = new Date().toISOString();
      const index = (memoryStore.events || []).findIndex(e => String(e.id) === String(eventIdOrSlug) || e.slug === eventIdOrSlug);
      const existingEvt = index !== -1 ? memoryStore.events[index] : null;
      const isFeaturedVal = (featured !== undefined ? featured : is_featured !== undefined ? is_featured : existingEvt?.featured) ? 1 : 0;
      const generatedSlug = title ? slugify(title) : (existingEvt?.slug || `event-${eventIdOrSlug}`);

      const updatedEvt = {
        id: existingEvt?.id ?? (isNaN(Number(eventIdOrSlug)) ? eventIdOrSlug : Number(eventIdOrSlug)),
        title: title !== undefined ? String(title).trim() : (existingEvt?.title || ''),
        slug: generatedSlug,
        description: description !== undefined ? String(description).trim() : (existingEvt?.description || ''),
        content: content !== undefined ? String(content).trim() : (existingEvt?.content || ''),
        date: date !== undefined ? date : (existingEvt?.date || ''),
        time: time !== undefined ? time : (existingEvt?.time || ''),
        location: location !== undefined ? String(location).trim() : (existingEvt?.location || ''),
        max_attendees: max_attendees !== undefined ? (parseInt(max_attendees) || 0) : (existingEvt?.max_attendees || 0),
        category: category !== undefined ? String(category).trim() : (existingEvt?.category || 'General'),
        image_url: image_url !== undefined ? image_url : (existingEvt?.image_url || ''),
        featured: isFeaturedVal,
        is_featured: isFeaturedVal,
        status: status !== undefined ? status : (existingEvt?.status || 'upcoming'),
        current_registrations: existingEvt?.current_registrations ?? 0,
        registered_count: existingEvt?.registered_count ?? 0,
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
          SET title = ?, slug = ?, description = ?, content = ?, date = ?, time = ?, location = ?, 
              max_attendees = ?, category = ?, image_url = ?, featured = ?, is_featured = ?, status = ?,
              updated_at = ?
          WHERE id = ? OR slug = ?
        `;
        await executeQuery(updateQuery, [
          updatedEvt.title,
          updatedEvt.slug,
          updatedEvt.description,
          updatedEvt.content,
          updatedEvt.date,
          updatedEvt.time,
          updatedEvt.location,
          updatedEvt.max_attendees,
          updatedEvt.category,
          updatedEvt.image_url,
          isFeaturedVal,
          isFeaturedVal,
          updatedEvt.status,
          nowIso,
          eventIdOrSlug,
          eventIdOrSlug
        ]);
      } catch (dbErr) {
        console.warn('DB update event warning, fallback to memoryStore:', dbErr.message);
      }

      return res.status(200).json({
        message: 'Event updated successfully',
        success: true,
        id: updatedEvt.id,
        slug: updatedEvt.slug,
        event: updatedEvt
      });
    } catch (error) {
      console.error('Error updating event:', error);
      return res.status(500).json({ error: 'Internal server error', success: false });
    }
  }

  // DELETE: Delete an event by ID or slug
  if (req.method === 'DELETE') {
    try {
      const eventIdOrSlug = id || req.query?.slug || req.body?.id || req.body?.slug;
      if (!eventIdOrSlug) {
        return res.status(400).json({ error: 'Event ID or slug is required for deletion', success: false });
      }

      memoryStore.events = (memoryStore.events || []).filter(e => String(e.id) !== String(eventIdOrSlug) && e.slug !== eventIdOrSlug);

      try {
        await executeQuery('DELETE FROM event_form_fields WHERE event_id = ? OR event_id = ?', [eventIdOrSlug, eventIdOrSlug]);
        await executeQuery('DELETE FROM event_registrations WHERE event_id = ? OR event_id = ?', [eventIdOrSlug, eventIdOrSlug]);
        await executeQuery('DELETE FROM events WHERE id = ? OR slug = ?', [eventIdOrSlug, eventIdOrSlug]);
      } catch (dbErr) {
        console.warn('DB delete event fallback:', dbErr.message);
      }

      return res.status(200).json({ message: 'Event deleted successfully', success: true, id: eventIdOrSlug });
    } catch (error) {
      console.error('Error deleting event:', error);
      return res.status(500).json({ error: 'Internal server error', success: false });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
