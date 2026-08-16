// pages/api/admin/volunteers/keys.js
import { executeQuery } from '@/lib/db';
import { memoryStore, calculateExpiresAt } from '@/lib/memoryStore';

// Ensure required DB tables exist
async function ensureVolunteerTables() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS volunteer_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_code VARCHAR(100) UNIQUE NOT NULL,
        key_type VARCHAR(20) DEFAULT 'in',
        label VARCHAR(150),
        event_id INT,
        status VARCHAR(50) DEFAULT 'active',
        expires_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await executeQuery(`
      CREATE TABLE IF NOT EXISTS volunteer_scan_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_code VARCHAR(100) NOT NULL,
        key_type VARCHAR(20) DEFAULT 'in',
        event_id INT,
        event_title VARCHAR(255),
        gate_role VARCHAR(100) DEFAULT 'IN Gate Volunteer',
        label VARCHAR(150),
        attendee_name VARCHAR(150),
        qu_id VARCHAR(100),
        email VARCHAR(150),
        ticket_ref VARCHAR(100),
        status VARCHAR(50) DEFAULT 'ENTRY GRANTED',
        scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist if table was created with older schema
    const alters = [
      `ALTER TABLE volunteer_keys ADD COLUMN label VARCHAR(150) NULL;`,
      `ALTER TABLE volunteer_keys ADD COLUMN key_type VARCHAR(20) DEFAULT 'in';`,
      `ALTER TABLE volunteer_keys ADD COLUMN status VARCHAR(50) DEFAULT 'active';`,
      `ALTER TABLE volunteer_keys ADD COLUMN expires_at TIMESTAMP NULL DEFAULT NULL;`,
      `ALTER TABLE volunteer_keys MODIFY COLUMN status VARCHAR(50) DEFAULT 'active';`
    ];
    for (const sql of alters) {
      try { await executeQuery(sql); } catch {}
    }
  } catch (err) {
    console.warn('DB ensureVolunteerTables warning:', err?.message);
  }
}

// Helper to sanitize volunteer key objects guaranteeing non-null strings & ISO expires_at format
const sanitizeKey = (k) => {
  if (!k || typeof k !== 'object') return {};
  const rawKeyCode = k.key_code ?? k.keyCode ?? '';
  const rawKeyType = k.key_type ?? k.keyType ?? '';
  const rawStatus = k.status ?? 'active';
  const rawLabel = k.label ?? '';
  const rawExpiresAt = k.expires_at ?? k.expiresAt ?? null;

  let formattedExpiresAt = null;
  if (rawExpiresAt) {
    const d = new Date(rawExpiresAt);
    if (!isNaN(d.getTime())) {
      formattedExpiresAt = d.toISOString();
    }
  }

  let status = typeof rawStatus === 'string' ? rawStatus.trim() : (rawStatus != null ? String(rawStatus).trim() : 'active');
  if (status === '1' || status === 'true') status = 'active';
  if (status === '0' || status === 'false') status = 'revoked';

  if (formattedExpiresAt && new Date(formattedExpiresAt) < new Date() && status === 'active') {
    status = 'expired';
  }

  return {
    ...k,
    id: k.id ?? Date.now(),
    key_code: typeof rawKeyCode === 'string' ? rawKeyCode.trim() : (rawKeyCode != null ? String(rawKeyCode).trim() : ''),
    key_type: typeof rawKeyType === 'string' ? rawKeyType.trim() : (rawKeyType != null ? String(rawKeyType).trim() : ''),
    status: status,
    label: typeof rawLabel === 'string' ? rawLabel.trim() : (rawLabel != null ? String(rawLabel).trim() : ''),
    expires_at: formattedExpiresAt,
    scans_count: typeof k.scans_count === 'number' ? k.scans_count : parseInt(k.scans_count || '0', 10)
  };
};

const DEFAULT_SAMPLE_KEYS = [
  {
    id: 1,
    key_code: 'VOL-IN-2026',
    key_type: 'in',
    label: 'Main Entrance - Gate 1 (Morning Shift)',
    event_id: 1,
    event_title: 'Genesis National Startup Summit 2026',
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    expires_at: null,
    scans_count: 142
  },
  {
    id: 2,
    key_code: 'VOL-OUT-2026',
    key_type: 'out',
    label: 'Exit Concourse - Gate 3',
    event_id: 1,
    event_title: 'Genesis National Startup Summit 2026',
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    expires_at: null,
    scans_count: 89
  },
  {
    id: 3,
    key_code: 'VOL-IN-AI-88',
    key_type: 'in',
    label: 'Incubation Lab 3 - Check-in Desk',
    event_id: 2,
    event_title: 'AI & DeepTech Founders Masterclass',
    status: 'active',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    expires_at: null,
    scans_count: 54
  },
  {
    id: 4,
    key_code: 'VOL-OUT-AI-89',
    key_type: 'out',
    label: 'Incubation Lab 3 - Exit Desk',
    event_id: 2,
    event_title: 'AI & DeepTech Founders Masterclass',
    status: 'revoked',
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    expires_at: null,
    scans_count: 12
  }
];

export default async function handler(req, res) {
  await ensureVolunteerTables();

  // Ensure memoryStore has initial volunteer keys
  if (!memoryStore.volunteer_keys || !Array.isArray(memoryStore.volunteer_keys) || memoryStore.volunteer_keys.length === 0) {
    memoryStore.volunteer_keys = DEFAULT_SAMPLE_KEYS.map(sanitizeKey);
  } else {
    memoryStore.volunteer_keys = memoryStore.volunteer_keys.map(sanitizeKey);
  }

  // GET: Fetch all volunteer keys and events
  if (req.method === 'GET') {
    let dbKeys = null;
    let dbEvents = null;

    try {
      const keysResult = await executeQuery(`
        SELECT vk.*, e.title as event_title,
          (SELECT COUNT(*) FROM volunteer_scan_logs vsl WHERE vsl.key_code = vk.key_code) as scans_count
        FROM volunteer_keys vk 
        LEFT JOIN events e ON vk.event_id = e.id 
        ORDER BY vk.created_at DESC
      `);
      if (keysResult && keysResult.success && Array.isArray(keysResult.data)) {
        if (keysResult.data.length > 0) {
          dbKeys = keysResult.data;
        } else {
          // Table exists but empty, seed sample keys into DB
          for (const sk of DEFAULT_SAMPLE_KEYS) {
            try {
              await executeQuery(
                `INSERT IGNORE INTO volunteer_keys (id, key_code, key_type, label, event_id, status, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [sk.id, sk.key_code, sk.key_type, sk.label, sk.event_id, sk.status, sk.created_at.slice(0, 19).replace('T', ' '), sk.expires_at]
              );
            } catch {}
          }
          const reFetch = await executeQuery(`
            SELECT vk.*, e.title as event_title,
              (SELECT COUNT(*) FROM volunteer_scan_logs vsl WHERE vsl.key_code = vk.key_code) as scans_count
            FROM volunteer_keys vk 
            LEFT JOIN events e ON vk.event_id = e.id 
            ORDER BY vk.created_at DESC
          `);
          if (reFetch && reFetch.success && Array.isArray(reFetch.data) && reFetch.data.length > 0) {
            dbKeys = reFetch.data;
          }
        }
      }
    } catch (e) {
      console.warn('DB fetch volunteer_keys failed, using memoryStore:', e.message);
    }

    try {
      const eventsResult = await executeQuery(`SELECT id, title, date, location, status FROM events ORDER BY date ASC`);
      if (eventsResult && eventsResult.success && Array.isArray(eventsResult.data)) {
        dbEvents = eventsResult.data;
      }
    } catch (e) {
      // ignore db error for events
    }

    const rawKeys = dbKeys || memoryStore.volunteer_keys;
    const keys = (rawKeys || []).map(sanitizeKey);

    // Keep memoryStore updated
    memoryStore.volunteer_keys = keys;

    const events = dbEvents || memoryStore.events || [];
    const now = new Date();

    const stats = {
      totalKeys: keys.length,
      activeInKeys: keys.filter(k => (k.key_type.toLowerCase() === 'in') && k.status === 'active' && (!k.expires_at || new Date(k.expires_at) > now)).length,
      activeOutKeys: keys.filter(k => (k.key_type.toLowerCase() === 'out') && k.status === 'active' && (!k.expires_at || new Date(k.expires_at) > now)).length,
      revokedKeys: keys.filter(k => k.status === 'revoked').length,
      expiredKeys: keys.filter(k => k.status === 'expired' || (k.expires_at && new Date(k.expires_at) <= now)).length
    };

    return res.status(200).json({
      success: true,
      keys,
      events,
      stats
    });
  }

  // POST: Generate a new volunteer key
  if (req.method === 'POST') {
    try {
      const {
        event_id,
        key_type,
        key_code,
        label,
        validity,
        validity_preset,
        validityPreset,
        expires_at,
        custom_expires_at,
        expiresAt
      } = req.body || {};

      const cleanTypeInput = typeof key_type === 'string' ? key_type.trim() : (key_type != null ? String(key_type).trim() : '');

      if (!cleanTypeInput || !['in', 'out', 'IN', 'OUT'].includes(cleanTypeInput)) {
        return res.status(400).json({
          success: false,
          error: 'Valid key type (IN or OUT) is required.',
          key_type: cleanTypeInput,
          key_code: typeof key_code === 'string' ? key_code.trim() : (key_code != null ? String(key_code).trim() : ''),
          status: 'error',
          label: typeof label === 'string' ? label.trim() : (label != null ? String(label).trim() : '')
        });
      }

      const normalizedType = cleanTypeInput.toLowerCase();
      let finalCode = typeof key_code === 'string' ? key_code.trim().toUpperCase() : (key_code != null ? String(key_code).trim().toUpperCase() : '');

      if (!finalCode) {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        finalCode = `${normalizedType.toUpperCase()}-VOL-${randNum}`;
      }

      // Find event title
      const eventsList = memoryStore.events || [];
      const matchedEvent = eventsList.find(e => String(e.id) === String(event_id));
      const eventTitle = matchedEvent ? matchedEvent.title : 'All Events / General Gate';
      const cleanLabelInput = typeof label === 'string' && label.trim() ? label.trim() : `${normalizedType.toUpperCase()} Gate Volunteer Key`;

      const chosenValidity = validity || validity_preset || validityPreset;
      const chosenCustomDate = expires_at || custom_expires_at || expiresAt;
      const calculatedExpiresAt = calculateExpiresAt(chosenValidity, chosenCustomDate);

      let newKeyObj = sanitizeKey({
        id: Date.now(),
        key_code: finalCode,
        key_type: normalizedType,
        label: cleanLabelInput,
        event_id: event_id ? parseInt(event_id, 10) : null,
        event_title: eventTitle,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: calculatedExpiresAt,
        scans_count: 0
      });

      // Try database insert
      try {
        const expiresAtForDb = newKeyObj.expires_at
          ? new Date(newKeyObj.expires_at).toISOString().slice(0, 19).replace('T', ' ')
          : null;

        const dbRes = await executeQuery(
          `INSERT INTO volunteer_keys (key_code, key_type, label, event_id, status, created_at, expires_at) VALUES (?, ?, ?, ?, 'active', NOW(), ?)`,
          [newKeyObj.key_code, newKeyObj.key_type, newKeyObj.label, newKeyObj.event_id, expiresAtForDb]
        );
        if (dbRes && dbRes.success && dbRes.data && dbRes.data.insertId) {
          newKeyObj.id = dbRes.data.insertId;
        }
      } catch (dbErr) {
        console.warn('DB insert volunteer_key fallback:', dbErr.message);
      }

      // Save to memory store
      memoryStore.volunteer_keys.unshift(newKeyObj);

      return res.status(201).json({
        success: true,
        message: `Volunteer ${normalizedType.toUpperCase()} Key generated successfully!`,
        key: newKeyObj
      });
    } catch (err) {
      console.error('Error generating volunteer key:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate key.',
        key_type: typeof req.body?.key_type === 'string' ? req.body.key_type.trim() : '',
        key_code: typeof req.body?.key_code === 'string' ? req.body.key_code.trim() : '',
        status: 'error',
        label: typeof req.body?.label === 'string' ? req.body.label.trim() : ''
      });
    }
  }

  // PATCH / PUT: Update status or expires_at (Revoke, Reactivate, or Update Expiration)
  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const {
        id,
        key_code,
        status,
        validity,
        validity_preset,
        validityPreset,
        expires_at,
        custom_expires_at,
        expiresAt
      } = req.body || {};

      const cleanStatus = typeof status === 'string' ? status.trim() : (status != null ? String(status).trim() : 'active');

      if (!id && !key_code) {
        return res.status(400).json({
          success: false,
          error: 'Key ID or key_code is required',
          key_type: '',
          key_code: '',
          status: 'error',
          label: ''
        });
      }

      const keyIndex = memoryStore.volunteer_keys.findIndex(k => (id && String(k.id) === String(id)) || (key_code && k.key_code === key_code));

      const hasExpiryUpdate = validity !== undefined || validity_preset !== undefined || validityPreset !== undefined || expires_at !== undefined || custom_expires_at !== undefined || expiresAt !== undefined;
      const updatedExpiresAt = hasExpiryUpdate
        ? calculateExpiresAt(
            validity || validity_preset || validityPreset,
            expires_at || custom_expires_at || expiresAt
          )
        : undefined;

      if (keyIndex !== -1) {
        memoryStore.volunteer_keys[keyIndex].status = cleanStatus === 'revoked' ? 'revoked' : cleanStatus;
        if (hasExpiryUpdate) {
          memoryStore.volunteer_keys[keyIndex].expires_at = updatedExpiresAt;
        }
        memoryStore.volunteer_keys[keyIndex].updated_at = new Date().toISOString();
        memoryStore.volunteer_keys[keyIndex] = sanitizeKey(memoryStore.volunteer_keys[keyIndex]);
      }

      try {
        if (hasExpiryUpdate) {
          const expiresAtForDb = updatedExpiresAt ? new Date(updatedExpiresAt).toISOString().slice(0, 19).replace('T', ' ') : null;
          await executeQuery(`UPDATE volunteer_keys SET status = ?, expires_at = ? WHERE id = ? OR key_code = ?`, [cleanStatus, expiresAtForDb, id || null, key_code || null]);
        } else {
          await executeQuery(`UPDATE volunteer_keys SET status = ? WHERE id = ? OR key_code = ?`, [cleanStatus, id || null, key_code || null]);
        }
      } catch (dbErr) {
        // DB fallback
      }

      const returnedKey = keyIndex !== -1 
        ? sanitizeKey(memoryStore.volunteer_keys[keyIndex])
        : sanitizeKey({ id: id || Date.now(), status: cleanStatus, key_code: key_code || '', key_type: '', label: '', expires_at: updatedExpiresAt });

      return res.status(200).json({
        success: true,
        message: `Key updated successfully.`,
        key: returnedKey
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update key.',
        key_type: '',
        key_code: '',
        status: 'error',
        label: ''
      });
    }
  }

  // DELETE: Remove key
  if (req.method === 'DELETE') {
    try {
      const id = req.query?.id || req.body?.id;
      const rawKeyCode = req.query?.key_code || req.body?.key_code || req.query?.keyCode || req.body?.keyCode;
      const cleanKeyCode = typeof rawKeyCode === 'string' ? rawKeyCode.trim() : (rawKeyCode != null ? String(rawKeyCode).trim() : '');

      if (!id && !cleanKeyCode) {
        return res.status(400).json({
          success: false,
          error: 'Key id or key_code is required',
          key_type: '',
          key_code: '',
          status: 'error',
          label: ''
        });
      }

      memoryStore.volunteer_keys = (memoryStore.volunteer_keys || []).filter(
        k => (id && String(k.id) !== String(id)) && (!cleanKeyCode || k.key_code !== cleanKeyCode)
      );

      try {
        await executeQuery(`DELETE FROM volunteer_keys WHERE id = ? OR key_code = ?`, [id || null, cleanKeyCode || null]);
      } catch (dbErr) {
        // fallback
      }

      return res.status(200).json({
        success: true,
        message: 'Key deleted successfully.',
        id: id || null,
        key_code: cleanKeyCode,
        key_type: '',
        status: 'deleted',
        label: ''
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete key.',
        key_type: '',
        key_code: '',
        status: 'error',
        label: ''
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
    key_type: '',
    key_code: '',
    status: 'error',
    label: ''
  });
}
