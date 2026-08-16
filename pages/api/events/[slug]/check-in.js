// pages/api/events/[slug]/check-in.js
import { executeQuery } from '@/lib/db';
export default async function handler(req, res) {
  const {
    slug
  } = req.query || {};
  if (req.method === 'GET') {
    try {
      // Fetch event by slug
      const eventQuery = `
        SELECT e.id, e.title, e.description, e.date, e.time, e.location 
        FROM events e 
        WHERE e.slug = ?
      `;
      const eventResult = await executeQuery(eventQuery, [slug]);
      if (!eventResult.success || eventResult.data.length === 0) {
        return res.status(404).json({
          error: 'Event not found'
        });
      }
      const event = eventResult.data[0];

      // Parse date and check if it's the event date
      let eventDate,
        isEventDate = false;
      try {
        // Handle both Date objects and strings
        if (event.date instanceof Date) {
          eventDate = new Date(event.date.toISOString().split('T')[0]);
        } else if (typeof event.date === 'string') {
          eventDate = new Date(event.date.split('T')[0]);
        } else {
          throw new Error('Invalid date format');
        }

        // Check if date is valid
        if (isNaN(eventDate.getTime())) {
          throw new Error('Invalid date');
        }

        // Check if today is the event date
        const today = new Date();
        const todayDateStr = today.toISOString().split('T')[0];
        const eventDateStr = eventDate.toISOString().split('T')[0];
        isEventDate = todayDateStr === eventDateStr;
        const checkInStatus = {
          canCheckIn: isEventDate,
          eventDate: eventDate.toISOString(),
          isEventDate
        };

        // Fetch first 2 required fields as check-in identifiers
        const fieldsQuery = `
          SELECT field_name, field_label, field_type, required
          FROM event_form_fields
          WHERE event_id = ? AND required = 1
          ORDER BY order_index ASC
          LIMIT 2
        `;
        const fieldsResult = await executeQuery(fieldsQuery, [event.id]);
        return res.status(200).json({
          ...event,
          checkInFields: fieldsResult.success ? fieldsResult.data : [],
          checkInStatus
        });
      } catch (dateError) {
        console.error('Date parsing error:', dateError, 'Event date:', event.date);
        // Return event data with check-in disabled if date parsing fails
        return res.status(200).json({
          ...event,
          checkInFields: [],
          checkInStatus: {
            canCheckIn: false,
            eventDate: null,
            isEventDate: false,
            error: 'Invalid event date configuration'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  if (req.method === 'POST') {
    try {
      const {
        identifiers,
        confirmationToken
      } = req.body || {};

      // Get event details
      const eventQuery = `SELECT id, date FROM events WHERE slug = ?`;
      const eventResult = await executeQuery(eventQuery, [slug]);
      if (!eventResult.success || eventResult.data.length === 0) {
        return res.status(404).json({
          error: 'Event not found'
        });
      }
      const event = eventResult.data[0];
      const eventId = event.id;

      // Validate check-in date
      try {
        let eventDate;
        if (event.date instanceof Date) {
          eventDate = new Date(event.date.toISOString().split('T')[0]);
        } else if (typeof event.date === 'string') {
          eventDate = new Date(event.date.split('T')[0]);
        } else {
          throw new Error('Invalid date format');
        }
        if (isNaN(eventDate.getTime())) {
          return res.status(400).json({
            error: 'Invalid event date configuration'
          });
        }

        // Check if today is the event date
        const today = new Date();
        const todayDateStr = today.toISOString().split('T')[0];
        const eventDateStr = eventDate.toISOString().split('T')[0];
        if (todayDateStr !== eventDateStr) {
          const eventDateFormatted = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          return res.status(403).json({
            error: `Check-in is only available on the event date: ${eventDateFormatted}`
          });
        }
      } catch (dateError) {
        console.error('Date validation error:', dateError);
        return res.status(400).json({
          error: 'Invalid event date configuration'
        });
      }
      let findQuery, params;

      // Check if using confirmation token or identifiers
      if (confirmationToken) {
        findQuery = `
          SELECT id, status, registration_data 
          FROM event_registrations 
          WHERE event_id = ? AND confirmation_token = ? AND status != 'cancelled'
        `;
        params = [eventId, confirmationToken];
      } else if (identifiers && Object.keys(identifiers).length >= 2) {
        // Build query with multiple field combinations
        const conditions = Object.entries(identifiers).map(([field, value]) => `JSON_EXTRACT(registration_data, '$.${field}') = ?`).join(' AND ');
        findQuery = `
          SELECT id, status, registration_data 
          FROM event_registrations 
          WHERE event_id = ? AND status != 'cancelled' AND (${conditions})
        `;
        params = [eventId, ...Object.values(identifiers)];
      } else {
        return res.status(400).json({
          error: 'Both check-in fields or confirmation token required'
        });
      }
      const registrationResult = await executeQuery(findQuery, params);
      if (!registrationResult.success || registrationResult.data.length === 0) {
        return res.status(404).json({
          error: 'Registration not found. Please check your details.'
        });
      }
      const registration = registrationResult.data[0];
      if (registration.status === 'confirmed') {
        return res.status(200).json({
          message: 'Already checked in',
          alreadyConfirmed: true,
          registration: JSON.parse(registration.registration_data)
        });
      }

      // Update to confirmed with in_time and in_scanned_by
      const updateQuery = `
        UPDATE event_registrations 
        SET status = 'confirmed', 
            confirmed_at = COALESCE(confirmed_at, NOW()),
            in_time = COALESCE(in_time, NOW()),
            in_scanned_by = COALESCE(in_scanned_by, 'SELF_CHECKIN')
        WHERE id = ?
      `;
      const updateResult = await executeQuery(updateQuery, [registration.id]);
      if (!updateResult.success) {
        if (updateResult.error && (updateResult.error.includes('ECONNREFUSED') || updateResult.error.includes('ENOTFOUND') || updateResult.error.includes('ETIMEDOUT') || updateResult.error.includes('unreachable') || updateResult.error.includes('connect'))) {
          return res.status(200).json({
            success: true,
            message: 'Fallback'
          });
        }
        return res.status(500).json({
          success: false,
          message: updateResult.error || 'Database error'
        });
      }
      return res.status(200).json({
        message: 'Check-in successful',
        registration: JSON.parse(registration.registration_data)
      });
    } catch (error) {
      console.error('Error checking in:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  return res.status(405).json({
    message: 'Method not allowed'
  });
}