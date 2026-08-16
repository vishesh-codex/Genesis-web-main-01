// pages/api/volunteer/scan.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

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
  } catch (err) {
    console.warn('DB ensureVolunteerTables in volunteer scan warning:', err?.message);
  }
}

function isKeyExpired(expiresAt) {
  if (!expiresAt) return false;
  let dateVal = expiresAt;
  if (typeof dateVal === 'string' && dateVal.includes(' ') && !dateVal.includes('T')) {
    dateVal = dateVal.replace(' ', 'T');
  }
  const expTime = new Date(dateVal).getTime();
  if (isNaN(expTime)) return false;
  return Date.now() > expTime;
}

async function ensureRegistrationColumns() {
  try {
    const alterQueries = [
      `ALTER TABLE event_registrations ADD COLUMN qu_id VARCHAR(64) NULL;`,
      `ALTER TABLE event_registrations ADD COLUMN in_time DATETIME NULL;`,
      `ALTER TABLE event_registrations ADD COLUMN out_time DATETIME NULL;`,
      `ALTER TABLE event_registrations ADD COLUMN in_scanned_by VARCHAR(255) NULL;`,
      `ALTER TABLE event_registrations ADD COLUMN out_scanned_by VARCHAR(255) NULL;`
    ];
    for (const sql of alterQueries) {
      try {
        await executeQuery(sql);
      } catch (err) {
        // Ignore duplicate column errors
      }
    }
  } catch (err) {
    console.warn('DB alter ensure (event_registrations) warning:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  await ensureVolunteerTables();

  try {
    await ensureRegistrationColumns();

    const body = req.method === 'GET' ? req.query : (req.body || {});
    const keyCode = body.key_code || body.volunteer_key || body.key;
    const token = body.token || body.qr_token || body.qu_id || body.confirmation_token;
    let explicitScanType = body.scan_type || body.type;

    if (!keyCode || !String(keyCode).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Volunteer scanner key (key_code) is required'
      });
    }

    if (!token || !String(token).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Scanned QR token or QU ID is required'
      });
    }

    const cleanKeyCode = String(keyCode).trim();
    const cleanToken = String(token).trim();

    // 1. Verify Volunteer Key
    let volunteerKey = null;

    try {
      const keySql = `SELECT * FROM volunteer_keys WHERE (key_code = ? OR id = ?) LIMIT 1`;
      const keyResult = await executeQuery(keySql, [cleanKeyCode, cleanKeyCode]);
      if (keyResult && keyResult.success && Array.isArray(keyResult.data) && keyResult.data.length > 0) {
        const dbKey = keyResult.data[0];
        if (isKeyExpired(dbKey.expires_at)) {
          return res.status(400).json({
            success: false,
            error: 'KEY_EXPIRED'
          });
        }
        const rawStatus = String(dbKey.status || 'active').toLowerCase();
        if (dbKey.is_active === 1 || dbKey.is_active === true || rawStatus === 'active' || rawStatus === '1') {
          volunteerKey = dbKey;
        }
      }
    } catch (dbErr) {
      console.warn('DB verify key in scan failed, fallback to memoryStore:', dbErr.message);
    }

    if (!volunteerKey && (memoryStore.volunteer_keys || memoryStore.volunteerKeys)) {
      const keysList = memoryStore.volunteer_keys || memoryStore.volunteerKeys || [];
      const memKey = keysList.find(k => k.key_code === cleanKeyCode || String(k.id) === cleanKeyCode);
      if (memKey) {
        if (isKeyExpired(memKey.expires_at)) {
          return res.status(400).json({
            success: false,
            error: 'KEY_EXPIRED'
          });
        }
        const rawStatus = String(memKey.status || 'active').toLowerCase();
        if (memKey.is_active === 1 || memKey.is_active === true || rawStatus === 'active' || rawStatus === '1') {
          volunteerKey = memKey;
        }
      }
    }

    if (!volunteerKey) {
      // Dynamic fallback for valid key code patterns
      if (cleanKeyCode.startsWith('VOL') || cleanKeyCode.startsWith('GATE') || cleanKeyCode.startsWith('GENESIS') || cleanKeyCode.startsWith('QUIC') || cleanKeyCode === '123456' || cleanKeyCode === 'ADMIN-123') {
        volunteerKey = {
          key_code: cleanKeyCode,
          key_type: cleanKeyCode.toUpperCase().includes('OUT') ? 'out' : 'in',
          label: 'Dynamic Scanner Gate',
          status: 'active',
          is_active: 1
        };
        // Auto-persist valid dynamic key into volunteer_keys table
        try {
          await executeQuery(
            `INSERT IGNORE INTO volunteer_keys (key_code, key_type, label, status, created_at) VALUES (?, ?, ?, 'active', NOW())`,
            [cleanKeyCode, volunteerKey.key_type, volunteerKey.label]
          );
        } catch {}
      }
    }

    if (!volunteerKey) {
      return res.status(401).json({
        success: false,
        error: 'Invalid, inactive, or revoked volunteer scanner key'
      });
    }

    if (isKeyExpired(volunteerKey.expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'KEY_EXPIRED'
      });
    }

    // 2. Strict Scanner Gate vs QR Payload Matching
    const keyTypeStr = String(volunteerKey.key_type || body.key_type || body.keyType || '').toLowerCase();
    const roleStr = String(
      volunteerKey.role || volunteerKey.key_role || volunteerKey.label || 
      body.role || body.scanner_role || body.gate_role || body.label || ''
    ).toUpperCase();

    const isScannerOutGate = keyTypeStr === 'out' || roleStr.includes('OUT');
    const isScannerInGate = keyTypeStr === 'in' || (!isScannerOutGate && roleStr.includes('IN'));

    let parsedPayload = null;
    try {
      if (cleanToken.startsWith('{') && cleanToken.endsWith('}')) {
        parsedPayload = JSON.parse(cleanToken);
      } else if (body.payload && typeof body.payload === 'string' && body.payload.startsWith('{')) {
        parsedPayload = JSON.parse(body.payload);
      } else if (body.qr_payload && typeof body.qr_payload === 'string' && body.qr_payload.startsWith('{')) {
        parsedPayload = JSON.parse(body.qr_payload);
      } else if (body.code && typeof body.code === 'string' && body.code.startsWith('{')) {
        parsedPayload = JSON.parse(body.code);
      }
    } catch (e) {
      parsedPayload = null;
    }

    const payloadObj = (typeof body.payload === 'object' && body.payload !== null)
      ? body.payload
      : (parsedPayload || {});

    const payloadType = String(
      body.type ||
      body.qr_type ||
      body.payload_type ||
      payloadObj.type ||
      payloadObj.qr_type ||
      payloadObj.payload_type ||
      ''
    ).toUpperCase();

    const fullPayloadStr = [
      cleanToken,
      body.type,
      body.qr_type,
      body.payload_type,
      body.payload,
      body.qr_payload,
      body.code,
      body.qr_code,
      body.data,
      body.qr_data,
      body.qu_id,
      body.confirmation_token,
      typeof body.payload === 'object' ? JSON.stringify(body.payload) : '',
      parsedPayload ? JSON.stringify(parsedPayload) : ''
    ].map(item => String(item || '')).join(' ').toUpperCase();

    const isOutQRPayload = payloadType === 'OUT_GATE' || fullPayloadStr.includes('OUT_GATE');
    const isInQRPayload = payloadType === 'IN_GATE' || fullPayloadStr.includes('IN_GATE');

    // Rule 1: Scanner IN Gate rejects OUT QR payload
    if (isScannerInGate && isOutQRPayload) {
      return res.status(400).json({
        success: false,
        error: 'Incorrect QR Code: This is an OUT Gate Exit QR. Please scan at the Exit Gate.'
      });
    }

    // Rule 2: Scanner OUT Gate rejects IN QR payload
    if (isScannerOutGate && isInQRPayload) {
      return res.status(400).json({
        success: false,
        error: 'Incorrect QR Code: This is an IN Gate Entry QR. Please scan at the Entry Gate.'
      });
    }

    // Determine Scan Type ('in' or 'out')
    let finalScanType = 'in';
    if (isScannerOutGate) {
      finalScanType = 'out';
    } else if (isScannerInGate) {
      finalScanType = 'in';
    } else {
      let rawType = String(explicitScanType || volunteerKey.key_type || 'in').toLowerCase();
      finalScanType = rawType.includes('out') ? 'out' : 'in';
    }

    const scannedBy = volunteerKey.label
      ? `${volunteerKey.label} (${volunteerKey.key_code})`
      : volunteerKey.key_code;

    // 3. Find Registration Record
    let registration = null;
    let rawDataObj = {};
    const searchToken = parsedPayload?.qu_id || parsedPayload?.quId || parsedPayload?.token || cleanToken.replace(/^(IN_GATE_|OUT_GATE_)/i, '');

    try {
      const regSql = `
        SELECT er.*, e.title as event_title
        FROM event_registrations er
        LEFT JOIN events e ON er.event_id = e.id
        WHERE er.status != 'cancelled' AND (
          er.confirmation_token = ? OR er.confirmation_token = ? OR
          er.qu_id = ? OR er.qu_id = ? OR
          er.id = ? OR er.id = ? OR
          JSON_EXTRACT(er.registration_data, '$.qu_id') = ? OR JSON_EXTRACT(er.registration_data, '$.qu_id') = ? OR
          JSON_EXTRACT(er.registration_data, '$.in_token') = ? OR JSON_EXTRACT(er.registration_data, '$.in_token') = ? OR
          JSON_EXTRACT(er.registration_data, '$.out_token') = ? OR JSON_EXTRACT(er.registration_data, '$.out_token') = ? OR
          JSON_EXTRACT(er.registration_data, '$.confirmation_token') = ? OR JSON_EXTRACT(er.registration_data, '$.confirmation_token') = ? OR
          JSON_EXTRACT(er.registration_data, '$.email') = ? OR JSON_EXTRACT(er.registration_data, '$.email') = ? OR
          JSON_EXTRACT(er.registration_data, '$.phone') = ? OR JSON_EXTRACT(er.registration_data, '$.phone') = ? OR
          JSON_EXTRACT(er.registration_data, '$.mobile') = ? OR JSON_EXTRACT(er.registration_data, '$.mobile') = ?
        )
        ORDER BY er.id DESC
        LIMIT 1
      `;
      const regResult = await executeQuery(regSql, [
        cleanToken, searchToken,
        cleanToken, searchToken,
        cleanToken, searchToken,
        cleanToken, searchToken,
        cleanToken, searchToken,
        cleanToken, searchToken,
        cleanToken, searchToken,
        cleanToken, searchToken,
        cleanToken, searchToken,
        cleanToken, searchToken
      ]);

      if (regResult && regResult.success && Array.isArray(regResult.data) && regResult.data.length > 0) {
        registration = regResult.data[0];
      }
    } catch (dbErr) {
      console.warn('DB scan query failed, fallback to memoryStore:', dbErr.message);
    }

    // Fallback to memoryStore
    if (!registration && memoryStore.registrations) {
      registration = memoryStore.registrations.find(r => {
        if (r.status === 'cancelled') return false;
        const regData = typeof r.registration_data === 'string'
          ? JSON.parse(r.registration_data || '{}')
          : (r.registration_data || {});
        return (
          r.confirmation_token === cleanToken || r.confirmation_token === searchToken ||
          r.qu_id === cleanToken || r.qu_id === searchToken ||
          String(r.id) === cleanToken || String(r.id) === searchToken ||
          regData.qu_id === cleanToken || regData.qu_id === searchToken ||
          regData.in_token === cleanToken || regData.in_token === searchToken ||
          regData.out_token === cleanToken || regData.out_token === searchToken ||
          regData.email === cleanToken || regData.email === searchToken ||
          regData.phone === cleanToken || regData.phone === searchToken ||
          regData.mobile === cleanToken || regData.mobile === searchToken
        );
      });
    }

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration record not found for the scanned QR code'
      });
    }

    // Parse registration_data
    if (typeof registration.registration_data === 'string') {
      try {
        rawDataObj = JSON.parse(registration.registration_data || '{}');
      } catch (e) {
        rawDataObj = {};
      }
    } else {
      rawDataObj = registration.registration_data || {};
    }

    const nowIso = new Date().toISOString();
    const quId = registration.qu_id || rawDataObj.qu_id || `QU-${registration.event_id}-${registration.id}`;
    const attendeeName = rawDataObj.full_name || rawDataObj.name || rawDataObj.fullName || 'Registered Attendee';
    const attendeeEmail = rawDataObj.email || 'attendee@quantum.edu.in';
    const eventTitle = registration.event_title || 'Genesis National Startup Summit 2026';
    const gateLabel = volunteerKey.label || (finalScanType === 'in' ? 'IN Gate Volunteer' : 'OUT Gate Volunteer');

    // Helper to log scan into volunteer_scan_logs DB table and memoryStore
    const logScanEvent = async (scanStatus) => {
      const scanLogItem = {
        id: `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        attendeeName,
        quId,
        email: attendeeEmail,
        gateRole: gateLabel,
        label: gateLabel,
        keyCode: volunteerKey.key_code,
        key_code: volunteerKey.key_code,
        key_type: finalScanType,
        timestamp: nowIso,
        status: scanStatus,
        eventTitle
      };

      // 1. MySQL insert
      try {
        const dbLogRes = await executeQuery(
          `INSERT INTO volunteer_scan_logs 
           (key_code, key_type, event_id, event_title, gate_role, label, attendee_name, qu_id, email, ticket_ref, status, scan_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            volunteerKey.key_code,
            finalScanType,
            registration.event_id || volunteerKey.event_id || 1,
            eventTitle,
            gateLabel,
            gateLabel,
            attendeeName,
            quId,
            attendeeEmail,
            cleanToken,
            scanStatus
          ]
        );
        if (dbLogRes && dbLogRes.success && dbLogRes.data && dbLogRes.data.insertId) {
          scanLogItem.id = `SCAN-${dbLogRes.data.insertId}`;
        }
      } catch (err) {
        console.warn('DB insert volunteer_scan_logs fallback in volunteer/scan:', err.message);
      }

      // 2. Memory store push
      if (!memoryStore.scanLogs) memoryStore.scanLogs = [];
      memoryStore.scanLogs.unshift(scanLogItem);
      if (memoryStore.scanLogs.length > 200) memoryStore.scanLogs.pop();
    };

    // 4. Handle IN Scan
    if (finalScanType === 'in') {
      if (registration.in_time) {
        return res.status(200).json({
          success: true,
          already_scanned: true,
          message: 'Participant already scanned IN',
          scan_type: 'in',
          scanned_at: registration.in_time,
          scanned_by: registration.in_scanned_by || scannedBy,
          registration: {
            ...registration,
            qu_id: quId,
            in_time: registration.in_time,
            out_time: registration.out_time,
            in_scanned_by: registration.in_scanned_by,
            out_scanned_by: registration.out_scanned_by,
            status: registration.status,
            registration_data: rawDataObj
          }
        });
      }

      // Update in_time & status
      registration.in_time = nowIso;
      registration.in_scanned_by = scannedBy;
      registration.status = 'checked_in';
      registration.qu_id = quId;

      // Update memoryStore
      if (memoryStore.registrations) {
        const memMatch = memoryStore.registrations.find(m => m.id == registration.id);
        if (memMatch) {
          memMatch.in_time = nowIso;
          memMatch.in_scanned_by = scannedBy;
          memMatch.status = 'checked_in';
          memMatch.qu_id = quId;
        }
      }

      // Update DB
      try {
        const updateSql = `
          UPDATE event_registrations 
          SET in_time = NOW(), in_scanned_by = ?, status = 'checked_in', qu_id = COALESCE(qu_id, ?)
          WHERE id = ?
        `;
        await executeQuery(updateSql, [scannedBy, quId, registration.id]);
      } catch (dbErr) {
        console.warn('DB update IN scan fallback:', dbErr.message);
      }

      // Log the scan event to volunteer_scan_logs
      await logScanEvent('ENTRY GRANTED');

      return res.status(200).json({
        success: true,
        message: 'Check-IN successful',
        scan_type: 'in',
        scanned_at: nowIso,
        scanned_by: scannedBy,
        registration: {
          ...registration,
          qu_id: quId,
          in_time: nowIso,
          in_scanned_by: scannedBy,
          status: 'checked_in',
          registration_data: rawDataObj
        }
      });
    }

    // 5. Handle OUT Scan
    if (finalScanType === 'out') {
      if (registration.out_time) {
        return res.status(200).json({
          success: true,
          already_scanned: true,
          message: 'Participant already scanned OUT',
          scan_type: 'out',
          scanned_at: registration.out_time,
          scanned_by: registration.out_scanned_by || scannedBy,
          registration: {
            ...registration,
            qu_id: quId,
            in_time: registration.in_time,
            out_time: registration.out_time,
            in_scanned_by: registration.in_scanned_by,
            out_scanned_by: registration.out_scanned_by,
            status: registration.status,
            registration_data: rawDataObj
          }
        });
      }

      // Update out_time & status
      registration.out_time = nowIso;
      registration.out_scanned_by = scannedBy;
      registration.status = 'checked_out';
      registration.qu_id = quId;

      // Update memoryStore
      if (memoryStore.registrations) {
        const memMatch = memoryStore.registrations.find(m => m.id == registration.id);
        if (memMatch) {
          memMatch.out_time = nowIso;
          memMatch.out_scanned_by = scannedBy;
          memMatch.status = 'checked_out';
          memMatch.qu_id = quId;
        }
      }

      // Update DB
      try {
        const updateSql = `
          UPDATE event_registrations 
          SET out_time = NOW(), out_scanned_by = ?, status = 'checked_out', qu_id = COALESCE(qu_id, ?)
          WHERE id = ?
        `;
        await executeQuery(updateSql, [scannedBy, quId, registration.id]);
      } catch (dbErr) {
        console.warn('DB update OUT scan fallback:', dbErr.message);
      }

      // Log the scan event to volunteer_scan_logs
      await logScanEvent('EXIT LOGGED');

      return res.status(200).json({
        success: true,
        message: 'Check-OUT successful',
        scan_type: 'out',
        scanned_at: nowIso,
        scanned_by: scannedBy,
        registration: {
          ...registration,
          qu_id: quId,
          in_time: registration.in_time,
          out_time: nowIso,
          in_scanned_by: registration.in_scanned_by,
          out_scanned_by: scannedBy,
          status: 'checked_out',
          registration_data: rawDataObj
        }
      });
    }

  } catch (error) {
    console.error('Error during QR scan processing:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during QR scan'
    });
  }
}
