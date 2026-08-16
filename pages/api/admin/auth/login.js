// pages/api/admin/auth/login.js
import { executeQuery } from '../../../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username, password, rememberMe } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  const cleanUsername = String(username).trim();

  // Master Super Admin Account (#VisheshAdmin)
  const isMasterVisheshAdmin = (cleanUsername === '#VisheshAdmin' || cleanUsername.toLowerCase() === '#visheshadmin') && password === '#PassVishesh@admin';

  if (isMasterVisheshAdmin) {
    const activeUsername = '#VisheshAdmin';

    const fullPermissions = {
      all: true,
      events: true,
      volunteers: true,
      registrations: true,
      registrations_export: true,
      ai_settings: true,
      blogs: true,
      portfolio: true,
      gallery: true,
      applications: true,
      settings: true,
      team: true,
      roles: true,
      admins: true
    };

    const tokenPayload = {
      id: 1,
      username: activeUsername,
      first_name: 'Vishesh',
      last_name: 'Super Admin',
      role: 'super_admin',
      role_slug: 'super_admin',
      role_name: 'Super Admin',
      is_super: true,
      permissions: fullPermissions,
    };

    const secret = process.env.JWT_SECRET || 'genesis_jwt_secret_key_2025';
    const token = jwt.sign(tokenPayload, secret, { expiresIn: rememberMe ? '30d' : '24h' });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: '/'
    };

    const cookie = serialize('auth-token', token, cookieOptions);
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({
      success: true,
      message: 'Login successful (Super Admin Master Access)',
      user: tokenPayload
    });
  }

  try {
    let user = null;

    // 1. Query MySQL admin & admin_roles tables directly
    try {
      const query = `
        SELECT a.*, r.slug AS role_slug, r.name AS role_name, r.permissions AS role_permissions, r.is_super
        FROM admin a
        LEFT JOIN admin_roles r ON a.role_id = r.id
        WHERE (a.username = ? OR a.email = ?) AND a.deleted_at IS NULL
      `;
      const result = await executeQuery(query, [cleanUsername, cleanUsername]);
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        user = result.data[0];
      }
    } catch (dbErr) {
      console.warn('Database query error during admin login, falling back to memoryStore:', dbErr.message);
    }

    // 2. Fallback to memoryStore.admins if not found in DB
    if (!user) {
      const { getMemoryAdmins } = await import('../../../lib/memoryStore.js');
      const memoryAdmins = getMemoryAdmins();
      user = memoryAdmins.find(a => 
        a.username.toLowerCase() === cleanUsername.toLowerCase() || 
        (a.email && a.email.toLowerCase() === cleanUsername.toLowerCase())
      ) || null;
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    if (user.status !== 1 && user.status !== true && user.status !== '1') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or disabled'
      });
    }

    // Verify Password (bcrypt hash compare OR direct string equality)
    let isValidPassword = false;
    if (user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        isValidPassword = user.password === password;
      }
    } else {
      isValidPassword = password === 'admin123' || password === '#PassVishesh@admin';
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Parse & combine granular permissions (role permissions + admin user permissions)
    let rolePermissions = {};
    if (user.role_permissions) {
      try {
        rolePermissions = typeof user.role_permissions === 'string' ? JSON.parse(user.role_permissions) : user.role_permissions;
      } catch {
        rolePermissions = {};
      }
    }

    let adminPermissions = {};
    if (user.permissions) {
      try {
        adminPermissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      } catch {
        adminPermissions = {};
      }
    }

    let combinedPermissions = { ...rolePermissions, ...adminPermissions };
    const isSuperUser = !!user.is_super || user.role_slug === 'super_admin' || user.role === 'super_admin' || String(user.id) === '1' || user.username === 'admin';

    const fullSuperPermissions = {
      all: true,
      events: true,
      volunteers: true,
      registrations: true,
      registrations_export: true,
      ai_settings: true,
      blogs: true,
      portfolio: true,
      gallery: true,
      applications: true,
      settings: true,
      team: true,
      roles: true,
      admins: true
    };

    const tokenPayload = {
      id: user.id,
      username: user.username,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role_slug || (isSuperUser ? 'super_admin' : 'admin'),
      role_slug: user.role_slug || (isSuperUser ? 'super_admin' : 'admin'),
      role_name: user.role_name || (isSuperUser ? 'Super Admin' : 'Admin'),
      is_super: isSuperUser,
      permissions: isSuperUser ? fullSuperPermissions : combinedPermissions,
    };

    const secret = process.env.JWT_SECRET || 'genesis_jwt_secret_key_2025';
    const token = jwt.sign(tokenPayload, secret, { expiresIn: rememberMe ? '30d' : '24h' });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: '/'
    };

    const cookie = serialize('auth-token', token, cookieOptions);
    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: tokenPayload
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
