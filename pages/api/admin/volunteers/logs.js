// pages/api/admin/volunteers/logs.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

async function ensureVolunteerTables() {
  try {
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

    const logAlters = [
      `ALTER TABLE volunteer_scan_logs ADD COLUMN key_type VARCHAR(20) DEFAULT 'in';`,
      `ALTER TABLE volunteer_scan_logs ADD COLUMN label VARCHAR(150) NULL;`,
      `ALTER TABLE volunteer_scan_logs ADD COLUMN email VARCHAR(150) NULL;`,
      `ALTER TABLE volunteer_scan_logs ADD COLUMN event_title VARCHAR(255) NULL;`
    ];
    for (const sql of logAlters) {
      try { await executeQuery(sql); } catch {}
    }
  } catch (err) {
    console.warn('DB ensureVolunteerTables in logs warning:', err?.message);
  }
}

// Helper to sanitize scan log objects guaranteeing non-null strings
const sanitizeScanLog = (l) => {
  if (!l || typeof l !== 'object') return {};
  const rawKeyCode = l.key_code ?? l.keyCode ?? '';
  const rawGateRole = l.gateRole ?? l.label ?? '';
  const rawKeyType = l.key_type ?? ((String(rawGateRole).toUpperCase().includes('OUT')) ? 'out' : 'in');
  const rawStatus = l.status ?? (rawKeyType === 'out' ? 'EXIT LOGGED' : 'ENTRY GRANTED');
  const rawLabel = l.label ?? rawGateRole ?? '';

  const cleanKeyCode = typeof rawKeyCode === 'string' ? rawKeyCode.trim() : (rawKeyCode != null ? String(rawKeyCode).trim() : '');
  const cleanKeyType = typeof rawKeyType === 'string' ? rawKeyType.trim() : (rawKeyType != null ? String(rawKeyType).trim() : '');
  const cleanStatus = typeof rawStatus === 'string' ? rawStatus.trim() : (rawStatus != null ? String(rawStatus).trim() : 'ENTRY GRANTED');
  const cleanLabel = typeof rawLabel === 'string' ? rawLabel.trim() : (rawLabel != null ? String(rawLabel).trim() : '');

  return {
    ...l,
    id: l.id || `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    attendeeName: l.attendeeName || l.attendee_name || 'Attendee',
    quId: l.quId || l.qu_id || '',
    email: l.email || '',
    key_code: cleanKeyCode,
    keyCode: cleanKeyCode,
    key_type: cleanKeyType,
    status: cleanStatus,
    label: cleanLabel,
    gateRole: cleanLabel || l.gateRole || '',
    timestamp: l.timestamp || l.scan_time || l.created_at || new Date().toISOString(),
    eventTitle: l.eventTitle || l.event_title || 'Genesis National Startup Summit 2026'
  };
};

const DEFAULT_SAMPLE_LOGS = [
  {
    id: `SCAN-${Date.now() - 120000}-1`,
    attendeeName: 'Priya Sharma',
    quId: 'QU-2026-8812',
    email: 'priya.sharma@quantum.edu.in',
    gateRole: 'IN Gate Volunteer',
    label: 'IN Gate Volunteer',
    keyCode: 'VOL-IN-2026',
    key_code: 'VOL-IN-2026',
    key_type: 'in',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    status: 'ENTRY GRANTED',
    eventTitle: 'Genesis National Startup Summit 2026'
  },
  {
    id: `SCAN-${Date.now() - 240000}-2`,
    attendeeName: 'Vikramaditya Roy',
    quId: 'QU-2026-9041',
    email: 'vikram.roy@quantum.edu.in',
    gateRole: 'IN Gate Volunteer',
    label: 'IN Gate Volunteer',
    keyCode: 'VOL-IN-2026',
    key_code: 'VOL-IN-2026',
    key_type: 'in',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    status: 'ENTRY GRANTED',
    eventTitle: 'Genesis National Startup Summit 2026'
  },
  {
    id: `SCAN-${Date.now() - 380000}-3`,
    attendeeName: 'Aisha Mehta',
    quId: 'QU-2026-4410',
    email: 'aisha.m@quantum.edu.in',
    gateRole: 'OUT Gate Volunteer',
    label: 'OUT Gate Volunteer',
    keyCode: 'VOL-OUT-2026',
    key_code: 'VOL-OUT-2026',
    key_type: 'out',
    timestamp: new Date(Date.now() - 380000).toISOString(),
    status: 'EXIT LOGGED',
    eventTitle: 'Genesis National Startup Summit 2026'
  },
  {
    id: `SCAN-${Date.now() - 520000}-4`,
    attendeeName: 'Karan Malhotra',
    quId: 'QU-2026-1198',
    email: 'karan.m@quantum.edu.in',
    gateRole: 'IN Gate Volunteer',
    label: 'IN Gate Volunteer',
    keyCode: 'VOL-IN-AI-88',
    key_code: 'VOL-IN-AI-88',
    key_type: 'in',
    timestamp: new Date(Date.now() - 520000).toISOString(),
    status: 'ENTRY GRANTED',
    eventTitle: 'AI & DeepTech Founders Masterclass'
  },
  {
    id: `SCAN-${Date.now() - 680000}-5`,
    attendeeName: 'Sneha Patel',
    quId: 'QU-2026-7734',
    email: 'sneha.p@quantum.edu.in',
    gateRole: 'IN Gate Volunteer',
    label: 'IN Gate Volunteer',
    keyCode: 'VOL-IN-2026',
    key_code: 'VOL-IN-2026',
    key_type: 'in',
    timestamp: new Date(Date.now() - 680000).toISOString(),
    status: 'ENTRY GRANTED',
    eventTitle: 'Genesis National Startup Summit 2026'
  }
];

export default async function handler(req, res) {
  await ensureVolunteerTables();

  // Seed memoryStore.scanLogs if empty
  if (!memoryStore.scanLogs || !Array.isArray(memoryStore.scanLogs) || memoryStore.scanLogs.length === 0) {
    memoryStore.scanLogs = DEFAULT_SAMPLE_LOGS.map(sanitizeScanLog);
  } else {
    memoryStore.scanLogs = memoryStore.scanLogs.map(sanitizeScanLog);
  }

  // GET: Return scan history and live statistics
  if (req.method === 'GET') {
    let dbLogs = null;
    try {
      const dbRes = await executeQuery(`
        SELECT id, key_code, key_type, gate_role, label, attendee_name, qu_id, email, ticket_ref, status, event_title, scan_time, created_at
        FROM volunteer_scan_logs
        ORDER BY scan_time DESC, id DESC
        LIMIT 200
      `);

      if (dbRes && dbRes.success && Array.isArray(dbRes.data)) {
        if (dbRes.data.length > 0) {
          dbLogs = dbRes.data.map(row => sanitizeScanLog({
            id: `SCAN-${row.id}`,
            attendeeName: row.attendee_name,
            quId: row.qu_id,
            email: row.email,
            gateRole: row.gate_role || row.label,
            label: row.label || row.gate_role,
            keyCode: row.key_code,
            key_code: row.key_code,
            key_type: row.key_type,
            timestamp: row.scan_time || row.created_at,
            status: row.status,
            eventTitle: row.event_title
          }));
        } else {
          // Table exists but empty, seed sample logs to DB
          for (const sl of DEFAULT_SAMPLE_LOGS) {
            try {
              await executeQuery(
                `INSERT INTO volunteer_scan_logs (key_code, key_type, gate_role, label, attendee_name, qu_id, email, status, event_title, scan_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [sl.key_code, sl.key_type, sl.gateRole, sl.label, sl.attendeeName, sl.quId, sl.email, sl.status, sl.eventTitle, sl.timestamp.slice(0, 19).replace('T', ' ')]
              );
            } catch {}
          }
          const reFetch = await executeQuery(`
            SELECT id, key_code, key_type, gate_role, label, attendee_name, qu_id, email, ticket_ref, status, event_title, scan_time, created_at
            FROM volunteer_scan_logs
            ORDER BY scan_time DESC, id DESC
            LIMIT 200
          `);
          if (reFetch && reFetch.success && Array.isArray(reFetch.data) && reFetch.data.length > 0) {
            dbLogs = reFetch.data.map(row => sanitizeScanLog({
              id: `SCAN-${row.id}`,
              attendeeName: row.attendee_name,
              quId: row.qu_id,
              email: row.email,
              gateRole: row.gate_role || row.label,
              label: row.label || row.gate_role,
              keyCode: row.key_code,
              key_code: row.key_code,
              key_type: row.key_type,
              timestamp: row.scan_time || row.created_at,
              status: row.status,
              eventTitle: row.event_title
            }));
          }
        }
      }
    } catch (e) {
      console.warn('DB fetch scan logs failed, using memoryStore:', e.message);
    }

    const logs = dbLogs || (memoryStore.scanLogs || []).map(sanitizeScanLog);

    // Sync memoryStore
    memoryStore.scanLogs = logs;
    
    // Calculate live check-in vs check-out stats
    const totalEntries = logs.filter(l => l.status === 'ENTRY GRANTED' || (l.gateRole && l.gateRole.includes('IN')) || l.key_type === 'in').length;
    const totalExits = logs.filter(l => l.status === 'EXIT LOGGED' || (l.gateRole && l.gateRole.includes('OUT')) || l.key_type === 'out').length;
    const currentlyInVenue = Math.max(0, totalEntries - totalExits);

    return res.status(200).json({
      success: true,
      logs: logs.slice(0, 100),
      stats: {
        totalScans: logs.length,
        totalEntries,
        totalExits,
        currentlyInVenue
      }
    });
  }

  // POST: Simulate or insert a test scan entry
  if (req.method === 'POST') {
    try {
      const { attendeeName, quId, gateRole, eventTitle, keyCode, key_code, key_type, label, status } = req.body || {};
      const rawRole = gateRole || label || '';
      const cleanRole = typeof rawRole === 'string' ? rawRole.trim() : (rawRole != null ? String(rawRole).trim() : '');
      const type = (cleanRole.toUpperCase().includes('OUT') || String(key_type).toLowerCase() === 'out') ? 'OUT' : 'IN';
      
      const rawCode = keyCode || key_code || (type === 'IN' ? 'VOL-IN-2026' : 'VOL-OUT-2026');
      const cleanCode = typeof rawCode === 'string' ? rawCode.trim() : String(rawCode).trim();
      const cleanType = (key_type || type).toLowerCase();
      const cleanLabel = cleanRole || (type === 'IN' ? 'IN Gate Volunteer' : 'OUT Gate Volunteer');
      const cleanStatus = status || (type === 'IN' ? 'ENTRY GRANTED' : 'EXIT LOGGED');

      let newScan = sanitizeScanLog({
        id: `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        attendeeName: attendeeName || 'Simulated Attendee',
        quId: quId || `QU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        email: `${(attendeeName || 'attendee').toLowerCase().replace(/\s+/g, '.')}@quantum.edu.in`,
        gateRole: cleanLabel,
        label: cleanLabel,
        keyCode: cleanCode,
        key_code: cleanCode,
        key_type: cleanType,
        timestamp: new Date().toISOString(),
        status: cleanStatus,
        eventTitle: eventTitle || 'Genesis National Startup Summit 2026'
      });

      // Insert into MySQL volunteer_scan_logs
      try {
        const dbRes = await executeQuery(
          `INSERT INTO volunteer_scan_logs (key_code, key_type, gate_role, label, attendee_name, qu_id, email, status, event_title, scan_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [newScan.key_code, newScan.key_type, newScan.gateRole, newScan.label, newScan.attendeeName, newScan.quId, newScan.email, newScan.status, newScan.eventTitle]
        );
        if (dbRes && dbRes.success && dbRes.data && dbRes.data.insertId) {
          newScan.id = `SCAN-${dbRes.data.insertId}`;
        }
      } catch (dbErr) {
        console.warn('DB insert volunteer_scan_logs fallback:', dbErr.message);
      }

      memoryStore.scanLogs.unshift(newScan);
      if (memoryStore.scanLogs.length > 200) memoryStore.scanLogs.pop();

      return res.status(201).json({
        success: true,
        message: 'Scan logged successfully.',
        scan: newScan
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to insert scan log.',
        key_type: '',
        key_code: '',
        status: 'error',
        label: ''
      });
    }
  }

  // DELETE: Clear logs
  if (req.method === 'DELETE') {
    memoryStore.scanLogs = [];
    try {
      await executeQuery(`DELETE FROM volunteer_scan_logs`);
    } catch (dbErr) {
      console.warn('DB clear volunteer_scan_logs fallback:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Scan logs cleared.',
      key_type: '',
      key_code: '',
      status: 'cleared',
      label: ''
    });
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
