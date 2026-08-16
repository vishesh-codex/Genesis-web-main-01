// pages/api/scanner/history.js
import { memoryStore } from '@/lib/memoryStore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { keyCode, key_code } = req.query || {};
    const targetKey = String(keyCode || key_code || '').trim().toUpperCase();

    let logs = memoryStore.scanLogs || [];

    if (targetKey) {
      logs = logs.filter(l => {
        const logKey = String(l.keyCode || l.key_code || l.scannedByKey || '').trim().toUpperCase();
        return !logKey || logKey === targetKey;
      });
    }

    return res.status(200).json({
      success: true,
      scans: logs.slice(0, 5),
      totalCount: logs.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch scan history' });
  }
}
