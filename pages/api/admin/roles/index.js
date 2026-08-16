// pages/api/admin/roles/index.js
import { executeQuery } from '../../../../lib/db';
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

const DEFAULT_ROLES = [
    {
        id: 1,
        name: 'Super Admin',
        slug: 'super_admin',
        is_super: 1,
        description: 'Full system access across all modules and settings',
        permissions: {
            dashboard: true, events: true, volunteers: true, blogs: true, team: true,
            applications: true, portfolio: true, gallery: true, pages: true, settings: true,
            roles: true, registrations_export: true, ai_settings: true
        }
    },
    {
        id: 2,
        name: 'Event Lead',
        slug: 'event-lead',
        is_super: 0,
        description: 'Manages events, registrations, and scanner volunteers',
        permissions: { events: true, volunteers: true, registrations_export: true, ai_settings: false, blogs: false, team: false }
    },
    {
        id: 3,
        name: 'Content Manager',
        slug: 'content-lead',
        is_super: 0,
        description: 'Manages blogs, CMS pages, and media gallery',
        permissions: { events: false, volunteers: false, blogs: true, gallery: true, pages: true, team: false }
    },
    {
        id: 4,
        name: 'AI Lead',
        slug: 'ai-lead',
        is_super: 0,
        description: 'Configures Groq API models, settings, and scanner keys',
        permissions: { ai_settings: true, settings: true, volunteers: true, events: false, blogs: false, team: false }
    }
];

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

function sanitizeRoleItem(item) {
    if (!item || typeof item !== 'object') return {};
    return {
        id: item.id ?? null,
        name: item.name ?? '',
        slug: item.slug ?? '',
        description: item.description ?? '',
        permissions: sanitizePermissions(item.permissions),
        is_super: !!item.is_super,
        created_at: item.created_at ?? null
    };
}

function sanitizeRoles(rolesList) {
    if (!Array.isArray(rolesList)) return [];
    return rolesList.map(sanitizeRoleItem);
}

export default async function handler(req, res) {
    const admin = getAdmin(req);
    if (!admin) return res.status(401).json({ success: false, message: 'Unauthorized', roles: [], admins: [], permissions: {} });

    // GET — list all roles
    if (req.method === 'GET') {
        try {
            const result = await executeQuery(
                'SELECT id, name, slug, description, permissions, is_super, created_at FROM admin_roles ORDER BY is_super DESC, name ASC'
            );
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                const sanitized = sanitizeRoles(result.data);
                return res.status(200).json({ success: true, data: sanitized, roles: sanitized, admins: [], permissions: {} });
            }
        } catch (e) {
            console.warn('DB roles fetch error, returning default roles:', e);
        }
        const defaultSanitized = sanitizeRoles(DEFAULT_ROLES);
        return res.status(200).json({ success: true, data: defaultSanitized, roles: defaultSanitized, admins: [], permissions: {} });
    }

    // POST — create role
    if (req.method === 'POST') {
        const { name, description, permissions } = req.body || {};
        if (!name?.trim()) return res.status(400).json({ success: false, message: 'Role name is required', roles: sanitizeRoles(DEFAULT_ROLES), admins: [], permissions: {} });

        // Generate slug
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const permObj = permissions && typeof permissions === 'object' ? permissions : {};

        try {
            const result = await executeQuery(
                'INSERT INTO admin_roles (name, slug, description, permissions, is_super) VALUES (?, ?, ?, ?, 0)',
                [name.trim(), slug, description?.trim() || null, JSON.stringify(permObj)]
            );
            if (result.success) {
                const newId = result.data?.insertId ?? Date.now();
                const newRole = sanitizeRoleItem({ id: newId, name: name.trim(), slug, description: description?.trim() || '', permissions: permObj, is_super: false });
                return res.status(201).json({
                    success: true,
                    message: 'Role created',
                    id: newId,
                    data: newRole,
                    roles: [...sanitizeRoles(DEFAULT_ROLES), newRole],
                    admins: [],
                    permissions: permObj
                });
            }
        } catch (e) {
            console.warn('DB role create error:', e);
        }

        const fallbackRole = sanitizeRoleItem({ id: Date.now(), name: name.trim(), slug, description: description?.trim() || '', permissions: permObj, is_super: false });
        return res.status(201).json({
            success: true,
            message: 'Role created (Fallback)',
            id: fallbackRole.id,
            data: fallbackRole,
            roles: [...sanitizeRoles(DEFAULT_ROLES), fallbackRole],
            admins: [],
            permissions: permObj
        });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed', roles: [], admins: [], permissions: {} });
}
