// pages/api/admin/system/init-db.js
import { autoInitializeDatabaseSchema } from '@/lib/autoInitDb';
import jwt from 'jsonwebtoken';

function getAdmin(req) {
  const token = req.cookies['auth-token'];
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || 'genesis_jwt_secret_key_2025';
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const currentAdmin = getAdmin(req);
  if (!currentAdmin || !currentAdmin.is_super) {
    return res.status(403).json({ success: false, message: 'Forbidden: Super Admin access required' });
  }

  if (req.method === 'POST' || req.method === 'GET') {
    try {
      const result = await autoInitializeDatabaseSchema();
      return res.status(200).json({
        success: true,
        message: 'Database schema auto-initialized successfully',
        data: result
      });
    } catch (error) {
      console.error('Error auto initializing DB schema:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to auto initialize DB schema',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
