// pages/api/volunteer/verify-key.js
import { executeQuery } from '../../../lib/db.js';
import { memoryStore } from '../../../lib/memoryStore.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      valid: false,
      error: 'Method not allowed'
    });
  }

  try {
    const params = req.method === 'GET' ? req.query : (req.body || {});
    const keyCode = params.key_code || params.code || params.key;

    if (!keyCode || !String(keyCode).trim()) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Volunteer key_code parameter is required'
      });
    }

    const cleanCode = String(keyCode).trim();
    let keyData = null;
    let eventData = null;

    // Try fetching from DB
    try {
      const keySql = `
        SELECT * FROM volunteer_keys 
        WHERE (key_code = ? OR id = ?) AND status = 'active'
        LIMIT 1
      `;
      const keyResult = await executeQuery(keySql, [cleanCode, cleanCode]);

      if (keyResult && keyResult.success && Array.isArray(keyResult.data) && keyResult.data.length > 0) {
        keyData = keyResult.data[0];
      }
    } catch (dbErr) {
      console.warn('DB verify-key failed, fallback to memoryStore:', dbErr.message);
    }

    // Fallback to memoryStore
    if (!keyData && memoryStore.volunteer_keys) {
      keyData = memoryStore.volunteer_keys.find(
        k => (k.key_code === cleanCode || String(k.id) === cleanCode) && String(k.status).toLowerCase() === 'active'
      );
    }

    if (!keyData) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Invalid, inactive, or revoked volunteer scanner key'
      });
    }

    // Fetch linked event details if event_id is specified
    if (keyData.event_id) {
      try {
        const evtSql = `SELECT id, title, slug, date, time, location FROM events WHERE id = ?`;
        const evtResult = await executeQuery(evtSql, [keyData.event_id]);
        if (evtResult && evtResult.success && Array.isArray(evtResult.data) && evtResult.data.length > 0) {
          eventData = evtResult.data[0];
        }
      } catch (evtErr) {
        console.warn('DB fetch event for key failed, fallback to memoryStore:', evtErr.message);
      }

      if (!eventData && memoryStore.events) {
        eventData = memoryStore.events.find(e => String(e.id) === String(keyData.event_id));
      }
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: 'Volunteer key verified successfully for live scanner activation',
      key: {
        id: keyData.id,
        key_code: keyData.key_code,
        key_type: keyData.key_type,
        label: keyData.label || `Scanner (${keyData.key_type.toUpperCase()})`,
        event_id: keyData.event_id || null,
        status: keyData.status
      },
      event: eventData || null
    });
  } catch (error) {
    console.error('Error verifying volunteer key:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      error: error.message || 'Internal server error during key verification'
    });
  }
}
