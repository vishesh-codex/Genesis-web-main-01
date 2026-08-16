import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';
import * as XLSX from 'xlsx';

const safeJsonParse = (val) => {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return {};
  }
};

function getRegistrationsFromMemoryStore(id) {
  let memRegs = [];

  if (memoryStore.registrations) {
    // 1. Check direct key memoryStore.registrations[id]
    const directStore = memoryStore.registrations[id];
    if (Array.isArray(directStore)) {
      memRegs = directStore;
    } else if (directStore && typeof directStore === 'object') {
      memRegs = [directStore];
    } else if (Array.isArray(memoryStore.registrations)) {
      // 2. Filter array by event_id
      memRegs = memoryStore.registrations.filter(
        r => r && (r.event_id == id || String(r.event_id) === String(id))
      );
    }
  }

  // 3. Fallback to memoryStore.events for event info and attached registrations
  const evt = (memoryStore.events || []).find(
    e => e && (e.id == id || String(e.id) === String(id) || e.slug === id)
  );

  if (memRegs.length === 0 && evt) {
    if (Array.isArray(evt.registrations)) {
      memRegs = evt.registrations;
    } else if (Array.isArray(evt.participants)) {
      memRegs = evt.participants;
    }
  }

  const eventTitle = evt?.title || `Event #${id}`;

  return memRegs.map((r, index) => {
    const regData = typeof r.registration_data === 'string'
      ? safeJsonParse(r.registration_data)
      : (r.registration_data || (r.email || r.full_name || r.fullName ? r : {}));

    return {
      id: r.id || (index + 1),
      event_id: id,
      event_title: r.event_title || eventTitle,
      status: r.status || 'confirmed',
      registration_date: r.registration_date || r.created_at || r.date || new Date().toISOString(),
      confirmed_at: r.confirmed_at || r.created_at || '',
      confirmation_token: r.confirmation_token || r.token || (`CONF-${r.id || (index + 1)}`),
      registration_data: regData
    };
  });
}

export default async function handler(req, res) {
  const { id } = req.query || {};
  const format = String(req.query.format || 'csv').toLowerCase();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    let registrations = [];
    let dbSuccess = false;

    // 1. Try DB retrieval if available
    try {
      const query = `
        SELECT 
          r.*,
          e.title as event_title
        FROM event_registrations r
        JOIN events e ON r.event_id = e.id
        WHERE r.event_id = ?
        ORDER BY r.registration_date DESC
      `;
      
      const result = await executeQuery(query, [id]);
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        dbSuccess = true;
        registrations = result.data;
      }
    } catch (dbErr) {
      console.warn('DB query error or MySQL offline, resorting to memoryStore fallback:', dbErr?.message || dbErr);
    }

    // 2. Fallback to memoryStore.registrations[id] or memoryStore.events
    if (!dbSuccess || registrations.length === 0) {
      const memRegs = getRegistrationsFromMemoryStore(id);
      if (memRegs.length > 0) {
        registrations = memRegs;
      }
    }

    // Handle raw JSON format request
    if (format === 'json') {
      return res.status(200).json(registrations);
    }

    // 3. Extract columns and construct standard + dynamic headers
    const standardKeysSet = new Set([
      'qu_id', 'quId', 'QU_ID', 'student_id',
      'full_name', 'fullName', 'name',
      'email', 'emailAddress',
      'phone', 'phoneNumber', 'mobile',
      'organization', 'company', 'institution', 'company_institution', 'Company/Institution', 'Company / Institution'
    ]);

    const dynamicHeadersSet = new Set();

    const parsedRegistrations = registrations.map(reg => {
      const data = typeof reg.registration_data === 'string'
        ? safeJsonParse(reg.registration_data)
        : (reg.registration_data || {});

      Object.keys(data).forEach(key => {
        if (!standardKeysSet.has(key)) {
          dynamicHeadersSet.add(key);
        }
      });

      return { reg, data };
    });

    const dynamicHeaders = Array.from(dynamicHeadersSet);

    const headers = [
      'ID',
      'Status',
      'Date',
      'QU_ID',
      'Full Name',
      'Email',
      'Phone',
      'Company/Institution',
      'Event Title',
      'Confirmed At',
      'Confirmation Token',
      ...dynamicHeaders
    ];

    const rowsData = parsedRegistrations.map(({ reg, data }) => {
      const rowObj = {
        'ID': reg.id ?? '',
        'Status': reg.status ?? 'confirmed',
        'Date': reg.registration_date ?? reg.date ?? reg.created_at ?? '',
        'QU_ID': data.qu_id ?? data.quId ?? data.QU_ID ?? data.student_id ?? reg.qu_id ?? '',
        'Full Name': data.full_name ?? data.fullName ?? data.name ?? reg.full_name ?? reg.fullName ?? '',
        'Email': data.email ?? data.emailAddress ?? reg.email ?? '',
        'Phone': data.phone ?? data.phoneNumber ?? data.mobile ?? reg.phone ?? '',
        'Company/Institution': data['Company/Institution'] ?? data['Company / Institution'] ?? data.company_institution ?? data.organization ?? data.company ?? data.institution ?? reg.organization ?? '',
        'Event Title': reg.event_title ?? '',
        'Confirmed At': reg.confirmed_at ?? '',
        'Confirmation Token': reg.confirmation_token ?? ''
      };

      dynamicHeaders.forEach(header => {
        rowObj[header] = data[header] ?? '';
      });

      return rowObj;
    });

    // Create worksheet with explicit header order
    const worksheet = XLSX.utils.json_to_sheet(rowsData, { header: headers });

    if (format === 'excel' || format === 'xlsx') {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="event-${id}-registrations.xlsx"`);
      return res.status(200).send(excelBuffer);
    }

    // Default: CSV export
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="event-${id}-registrations.csv"`);
    return res.status(200).send(csvOutput);

  } catch (error) {
    console.error('Error exporting registrations:', error);
    return res.status(500).json({ error: 'Internal server error during export' });
  }
}