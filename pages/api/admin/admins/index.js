// pages/api/admin/admins/index.js
import { executeQuery } from '../../../../lib/db';
import { getMemoryAdmins, createMemoryAdmin } from '../../../../lib/memoryStore';
import bcrypt from 'bcryptjs';
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

function sanitizePermissions(perm) {
    if (!perm) return {};
    if (typeof perm === 'string') {
        try {
            const parsed = JSON.parse(perm);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    }
    return typeof perm === 'object' ? perm : {};
}

function sanitizeAdminItem(item) {
    if (!item || typeof item !== 'object') return {};
    let perms = sanitizePermissions(item.permissions);
    if (Object.keys(perms).length === 0 && item.role_permissions) {
        perms = sanitizePermissions(item.role_permissions);
    }
    return {
        id: item.id ?? null,
        username: item.username ?? '',
        first_name: item.first_name ?? '',
        last_name: item.last_name ?? '',
        email: item.email ?? '',
        status: item.status ?? 1,
        role_id: item.role_id ?? null,
        role_name: item.role_name ?? item.role ?? '',
        role_slug: item.role_slug ?? item.role ?? '',
        is_super: !!item.is_super,
        permissions: perms,
        created_at: item.created_at ?? null,
        updated_at: item.updated_at ?? null
    };
}

function sanitizeAdmins(adminsList) {
    if (!Array.isArray(adminsList)) return [];
    return adminsList.map(sanitizeAdminItem);
}

export default async function handler(req, res) {
    const admin = getAdmin(req);
    if (!admin) return res.status(401).json({ success: false, message: 'Unauthorized', admins: [], roles: [], permissions: {} });

    // GET — list all admins with role & permission info
    if (req.method === 'GET') {
        let adminsList = [];
        try {
            const result = await executeQuery(`
              SELECT a.id, a.username, a.first_name, a.last_name, a.email, a.status,
                     a.role_id, a.permissions, a.created_at, a.updated_at,
                     r.name AS role_name, r.slug AS role_slug, r.is_super, r.permissions AS role_permissions
              FROM admin a
              LEFT JOIN admin_roles r ON a.role_id = r.id
              WHERE a.deleted_at IS NULL
              ORDER BY a.created_at DESC
            `);
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                adminsList = result.data;
            } else {
                adminsList = getMemoryAdmins();
            }
        } catch (e) {
            console.warn('DB admin fetch error, using memoryStore fallback:', e);
            adminsList = getMemoryAdmins();
        }

        const sanitized = sanitizeAdmins(adminsList);
        return res.status(200).json({
            success: true,
            data: sanitized,
            admins: sanitized,
            roles: [],
            permissions: {}
        });
    }

    // POST — create admin
    if (req.method === 'POST') {
        const { username, password, first_name, last_name, role_id, status, permissions } = req.body || {};

        if (!username?.trim()) return res.status(400).json({ success: false, message: 'Username is required', admins: [], roles: [], permissions: {} });
        if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters', admins: [], roles: [], permissions: {} });

        const permObj = permissions && typeof permissions === 'object' ? permissions : {
            events: true,
            volunteers: true,
            registrations_export: true,
            ai_settings: false,
            blogs: false,
            team: false
        };

        try {
            // Check username uniqueness
            const existsCheck = await executeQuery('SELECT id FROM admin WHERE username = ? AND deleted_at IS NULL', [username.trim()]);
            if (existsCheck.success && Array.isArray(existsCheck.data) && existsCheck.data.length > 0) {
                return res.status(409).json({ success: false, message: 'Username already taken', admins: sanitizeAdmins(getMemoryAdmins()), roles: [], permissions: {} });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const { v4: uuidv4 } = await import('uuid');
            const id = uuidv4();

            const result = await executeQuery(
                `INSERT INTO admin (id, username, password, first_name, last_name, role_id, permissions, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    id,
                    username.trim(),
                    hashedPassword,
                    first_name?.trim() || null,
                    last_name?.trim() || null,
                    role_id || null,
                    JSON.stringify(permObj),
                    status === 1 || status === true ? 1 : 0,
                ]
            );

            if (result.success) {
                const updatedList = sanitizeAdmins(getMemoryAdmins());
                return res.status(201).json({
                    success: true,
                    message: 'Admin created',
                    id: id ?? null,
                    data: { id, username: username.trim(), first_name: first_name?.trim() ?? '', last_name: last_name?.trim() ?? '', role_id: role_id ?? null, status: status ? 1 : 0, permissions: permObj },
                    admins: updatedList,
                    roles: [],
                    permissions: permObj
                });
            }
        } catch (e) {
            console.warn('DB admin insert error, using memoryStore fallback:', e);
        }

        // Memory store fallback creation
        const created = createMemoryAdmin({
            username: username.trim(),
            password,
            first_name: first_name?.trim() ?? '',
            last_name: last_name?.trim() ?? '',
            role_id: role_id ?? null,
            status: status ?? 1,
            permissions: permObj
        });
        const sanitizedCreated = sanitizeAdminItem(created);
        const allAdmins = sanitizeAdmins(getMemoryAdmins());
        return res.status(201).json({
            success: true,
            message: 'Admin created (MemoryStore)',
            id: sanitizedCreated.id ?? null,
            data: sanitizedCreated,
            admins: allAdmins,
            roles: [],
            permissions: permObj
        });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed', admins: [], roles: [], permissions: {} });
}
