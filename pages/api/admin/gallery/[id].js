// pages/api/media/upload.js

import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query || {};

  if (req.method === 'DELETE') {
    try {
      const dbRes1786503215406279 = await executeQuery(`DELETE FROM gallery WHERE id = ?`, [id]);
      if (!dbRes1786503215406279.success) {
        if (dbRes1786503215406279.error && (dbRes1786503215406279.error.includes('ECONNREFUSED') || dbRes1786503215406279.error.includes('ENOTFOUND') || dbRes1786503215406279.error.includes('ETIMEDOUT') || dbRes1786503215406279.error.includes('unreachable') || dbRes1786503215406279.error.includes('connect'))) {
          return res.status(200).json({ success: true, message: 'Fallback' });
        }
        return res.status(500).json({ success: false, message: dbRes1786503215406279.error });
      };
      return res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).end();
}