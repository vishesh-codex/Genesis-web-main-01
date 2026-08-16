// pages/api/admin/events/[id]/poster.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';
import QRCode from 'qrcode';

export default async function handler(req, res) {
  const { id } = req.query || {};

  if (!id || id === 'undefined' || id === 'null') {
    return res.status(400).json({ error: 'Valid event ID or slug is required' });
  }

  if (req.method === 'GET') {
    try {
      let event = null;

      try {
        const eventQuery = `
          SELECT e.*, COUNT(er.id) as current_registrations
          FROM events e
          LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status != 'cancelled'
          WHERE e.id = ? OR e.slug = ?
          GROUP BY e.id
        `;
        const eventResult = await executeQuery(eventQuery, [id, id]);
        if (eventResult && eventResult.success && Array.isArray(eventResult.data) && eventResult.data.length > 0) {
          event = eventResult.data[0];
        }
      } catch (dbErr) {
        console.warn('DB fetch for poster failed, checking memoryStore:', dbErr.message);
      }

      if (!event) {
        event = memoryStore.events.find(e => String(e.id) === String(id) || e.slug === id);
      }

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const safeSlug = event.slug || `event-${event.id}`;
      const checkInUrl = `${baseUrl.replace(/\/$/, '')}/events/${safeSlug}/check-in`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
        width: 400,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return res.status(200).json({
        event,
        qrCode: qrCodeDataUrl,
        checkInUrl,
      });
    } catch (error) {
      console.error('Error generating poster data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}