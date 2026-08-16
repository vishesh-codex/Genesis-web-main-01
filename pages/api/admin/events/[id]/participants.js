// pages/api/admin/events/[id]/participants.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

export default async function handler(req, res) {
  const { id } = req.query || {};

  if (req.method === 'GET') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }

      let registrations = [];
      let dbSuccess = false;

      try {
        const registrationsQuery = `
          SELECT 
            er.id,
            er.registration_data,
            er.status,
            er.registration_date,
            er.confirmed_at,
            er.confirmation_token,
            e.title as event_title
          FROM event_registrations er
          JOIN events e ON er.event_id = e.id
          WHERE er.event_id = ?
          ORDER BY er.registration_date DESC
        `;
        const result = await executeQuery(registrationsQuery, [id]);
        if (result && result.success && Array.isArray(result.data)) {
          dbSuccess = true;
          registrations = result.data.map(registration => ({
            ...registration,
            registration_data: typeof registration.registration_data === 'string'
              ? JSON.parse(registration.registration_data || '{}')
              : (registration.registration_data || {})
          }));
        }
      } catch (dbErr) {
        console.warn('DB error fetching participants, using memoryStore fallback:', dbErr.message);
      }

      if (!dbSuccess) {
        const memRegs = (memoryStore.registrations || []).filter(
          r => r.event_id == id || r.event_id === Number(id)
        );
        const evt = (memoryStore.events || []).find(e => e.id == id || e.slug === id);
        registrations = memRegs.map(r => ({
          id: r.id,
          event_id: id,
          registration_data: typeof r.registration_data === 'string'
            ? JSON.parse(r.registration_data)
            : (r.registration_data || {}),
          status: r.status || 'confirmed',
          registration_date: r.registration_date || r.created_at || new Date().toISOString(),
          confirmed_at: r.confirmed_at || r.created_at || new Date().toISOString(),
          confirmation_token: r.confirmation_token || ('CONF-' + r.id),
          event_title: evt?.title || ('Event #' + id)
        }));
      }

      return res.status(200).json({
        registrations: registrations,
        total: registrations.length,
        event_id: id
      });
    } catch (error) {
      console.error('Error fetching registrations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { registrationId, status } = req.body || {};
      if (!registrationId || !status) {
        return res.status(400).json({ error: 'Missing registration ID or status' });
      }
      if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      if (memoryStore.registrations) {
        const memReg = memoryStore.registrations.find(r => r.id == registrationId);
        if (memReg) {
          memReg.status = status;
          if (status === 'confirmed') memReg.confirmed_at = new Date().toISOString();
        }
      }

      try {
        const updateQuery = `
          UPDATE event_registrations 
          SET status = ?, confirmed_at = ${status === 'confirmed' ? 'NOW()' : 'NULL'}
          WHERE id = ? AND event_id = ?
        `;
        await executeQuery(updateQuery, [status, registrationId, id]);
      } catch (dbErr) {
        console.warn('DB update registration status fallback:', dbErr.message);
      }

      return res.status(200).json({
        message: 'Registration status updated successfully',
        registrationId,
        status,
        success: true
      });
    } catch (error) {
      console.error('Error updating registration:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { registrationId } = req.body || {};
      if (!registrationId) {
        return res.status(400).json({ error: 'Missing registration ID' });
      }

      if (memoryStore.registrations) {
        memoryStore.registrations = memoryStore.registrations.filter(r => r.id != registrationId);
      }

      try {
        const deleteQuery = `
          DELETE FROM event_registrations 
          WHERE id = ? AND event_id = ?
        `;
        await executeQuery(deleteQuery, [registrationId, id]);
      } catch (dbErr) {
        console.warn('DB delete registration fallback:', dbErr.message);
      }

      return res.status(200).json({
        message: 'Registration deleted successfully',
        registrationId,
        success: true
      });
    } catch (error) {
      console.error('Error deleting registration:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}