// pages/api/auth/verify.js
import jwt from 'jsonwebtoken';
import { executeQuery } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.cookies['auth-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const secret = process.env.JWT_SECRET || 'genesis_jwt_secret_key_2025';
    const decoded = jwt.verify(token, secret);

    if (decoded.username === 'admin' || decoded.id === 1) {
      const fullPermissions = {
        all: true,
        events: true,
        volunteers: true,
        registrations: true,
        blogs: true,
        portfolio: true,
        gallery: true,
        applications: true,
        settings: true,
        team: true
      };

      return res.status(200).json({
        success: true,
        user: {
          id: 1,
          username: 'admin',
          first_name: 'Genesis',
          last_name: 'Admin',
          role: 'super_admin',
          role_slug: 'super_admin',
          role_name: 'Super Admin',
          is_super: true,
          permissions: fullPermissions,
        }
      });
    }

    // Check if user still exists in DB
    const query = `
      SELECT a.id, a.username, a.first_name, a.last_name, a.status,
             r.slug AS role_slug, r.name AS role_name, r.permissions, r.is_super
      FROM admin a
      LEFT JOIN admin_roles r ON a.role_id = r.id
      WHERE a.id = ? AND a.deleted_at IS NULL
    `;
    const result = await executeQuery(query, [decoded.id]);

    if (!result.success || !result.data[0]) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.data[0];

    if (user.status !== 1) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    let permissions = {};
    if (user.permissions) {
      try {
        permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      } catch { }
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role_slug: user.role_slug || null,
        role_name: user.role_name || null,
        is_super: !!user.is_super,
        permissions,
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}