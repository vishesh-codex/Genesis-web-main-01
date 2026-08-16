import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const params = req.method === 'GET' ? req.query : (req.body || {});
    const quIdParam = params.qu_id || params.quid;
    const phoneParam = params.phone || params.mobile;
    const emailParam = params.email;

    if (!quIdParam && !phoneParam && !emailParam) {
      return res.status(400).json({
        success: false,
        error: 'At least one parameter (qu_id, phone, or email) is required'
      });
    }

    const cleanQuId = quIdParam ? String(quIdParam).trim() : null;
    const cleanPhone = phoneParam ? String(phoneParam).trim() : null;
    const cleanEmail = emailParam ? String(emailParam).trim() : null;

    let historyRecords = [];
    let dbSuccess = false;

    // Search MySQL DB
    try {
      const sql = `
        SELECT 
          er.id as registration_id,
          er.event_id,
          er.qu_id,
          er.registration_data,
          er.status,
          er.registration_date,
          er.confirmed_at,
          er.confirmation_token,
          er.in_time,
          er.out_time,
          er.in_scanned_by,
          er.out_scanned_by,
          e.title as event_title,
          e.slug as event_slug,
          e.date as event_date,
          e.time as event_time,
          e.location as event_location,
          e.category as event_category,
          e.image_url as event_image_url
        FROM event_registrations er
        LEFT JOIN events e ON er.event_id = e.id
        WHERE er.status != 'cancelled' AND (
          (? IS NOT NULL AND (er.qu_id = ? OR JSON_EXTRACT(er.registration_data, '$.qu_id') = ?)) OR
          (? IS NOT NULL AND (JSON_EXTRACT(er.registration_data, '$.phone') = ? OR JSON_EXTRACT(er.registration_data, '$.mobile') = ?)) OR
          (? IS NOT NULL AND (JSON_EXTRACT(er.registration_data, '$.email') = ?))
        )
        ORDER BY er.registration_date DESC
      `;

      const queryParams = [
        cleanQuId, cleanQuId, cleanQuId,
        cleanPhone, cleanPhone, cleanPhone,
        cleanEmail, cleanEmail
      ];

      const result = await executeQuery(sql, queryParams);

      if (result && result.success && Array.isArray(result.data)) {
        dbSuccess = true;
        historyRecords = result.data.map(row => {
          let regData = {};
          if (typeof row.registration_data === 'string') {
            try {
              regData = JSON.parse(row.registration_data || '{}');
            } catch (e) {
              regData = {};
            }
          } else {
            regData = row.registration_data || {};
          }
          return {
            ...row,
            registration_data: regData
          };
        });
      }
    } catch (dbErr) {
      console.warn('DB fetch my-history failed, fallback to memoryStore:', dbErr.message);
    }

    // Fallback to memoryStore if DB yields no records or fails
    if (!dbSuccess || historyRecords.length === 0) {
      const memRegs = memoryStore.registrations || [];
      const filteredMem = memRegs.filter(r => {
        if (r.status === 'cancelled') return false;
        const regData = typeof r.registration_data === 'string'
          ? JSON.parse(r.registration_data || '{}')
          : (r.registration_data || {});

        const matchQuId = cleanQuId && (
          r.qu_id === cleanQuId ||
          regData.qu_id === cleanQuId ||
          String(r.id) === cleanQuId
        );

        const matchPhone = cleanPhone && (
          regData.phone === cleanPhone ||
          regData.mobile === cleanPhone
        );

        const matchEmail = cleanEmail && (
          regData.email === cleanEmail
        );

        return Boolean(matchQuId || matchPhone || matchEmail);
      });

      historyRecords = filteredMem.map(r => {
        const regData = typeof r.registration_data === 'string'
          ? JSON.parse(r.registration_data || '{}')
          : (r.registration_data || {});

        const evt = (memoryStore.events || []).find(e => e.id == r.event_id || e.slug === r.event_id);

        return {
          registration_id: r.id,
          event_id: r.event_id,
          qu_id: r.qu_id || regData.qu_id,
          registration_data: regData,
          status: r.status || 'confirmed',
          registration_date: r.registration_date || r.created_at || new Date().toISOString(),
          confirmed_at: r.confirmed_at || null,
          confirmation_token: r.confirmation_token || `CONF-${r.id}`,
          in_time: r.in_time || null,
          out_time: r.out_time || null,
          in_scanned_by: r.in_scanned_by || null,
          out_scanned_by: r.out_scanned_by || null,
          event_title: evt?.title || `Event #${r.event_id}`,
          event_slug: evt?.slug || '',
          event_date: evt?.date || '',
          event_time: evt?.time || '',
          event_location: evt?.location || '',
          event_category: evt?.category || 'General',
          event_image_url: evt?.image_url || ''
        };
      });
    }

    // Format output with QR Tokens
    const formattedHistory = historyRecords.map(item => {
      const regData = item.registration_data || {};
      const resolvedQuId = item.qu_id || regData.qu_id || `QU-${item.event_id}-${item.registration_id}`;

      const inToken = `IN-${resolvedQuId}-${item.event_id}`;
      const outToken = `OUT-${resolvedQuId}-${item.event_id}`;

      return {
        registration_id: item.registration_id,
        qu_id: resolvedQuId,
        event_id: item.event_id,
        event_title: item.event_title || `Event #${item.event_id}`,
        event_slug: item.event_slug || '',
        event_date: item.event_date || '',
        event_time: item.event_time || '',
        event_location: item.event_location || '',
        event_category: item.event_category || '',
        event_image_url: item.event_image_url || '',
        status: item.status || 'confirmed',
        registration_date: item.registration_date,
        in_time: item.in_time || null,
        out_time: item.out_time || null,
        in_scanned_by: item.in_scanned_by || null,
        out_scanned_by: item.out_scanned_by || null,
        confirmation_token: item.confirmation_token,
        qr_tokens: {
          in_token: inToken,
          out_token: outToken,
          qu_id: resolvedQuId
        },
        registration_data: regData
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedHistory.length,
      history: formattedHistory
    });

  } catch (error) {
    console.error('Error fetching event history:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching event history'
    });
  }
}
