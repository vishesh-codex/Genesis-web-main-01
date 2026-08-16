// pages/api/admin/permissions.js
import { executeQuery } from '@/lib/db';
import { getMemoryAdmins, updateMemoryAdmin } from '@/lib/memoryStore';
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

const SYSTEM_PERMISSIONS = [
    { key: 'dashboard', label: 'Dashboard Access', category: 'General' },
    { key: 'events', label: 'Events & Registrations', category: 'Operations' },
    { key: 'volunteers', label: 'Volunteers & Scanner Keys', category: 'Operations' },
    { key: 'blogs', label: 'Blogs & Content', category: 'Content' },
    { key: 'team', label: 'Team & Admin Accounts', category: 'Administration' },
    { key: 'applications', label: 'Grant & Program Applications', category: 'Incubation' },
    { key: 'portfolio', label: 'Portfolio & Incubated Startups', category: 'Incubation' },
    { key: 'gallery', label: 'Media Gallery', category: 'Content' },
    { key: 'pages', label: 'CMS Custom Pages', category: 'Content' },
    { key: 'settings', label: 'System Settings & AI Configuration', category: 'Administration' },
    { key: 'roles', label: 'Roles Management', category: 'Administration' },
    { key: 'registrations_export', label: 'Export Attendee Data', category: 'Operations' },
    { key: 'ai_settings', label: 'Groq & AI Vision Key Management', category: 'Administration' }
];

const DEFAULT_ROLES = [
    {
        id: 1,
        name: 'Super Admin',
        slug: 'super_admin',
        is_super: 1,
        description: 'Full system access across all modules and settings',
        permissions: SYSTEM_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.key]: true }), {})
    },
    {
        id: 2,
        name: 'Event Lead',
        slug: 'event-lead',
        is_super: 0,
        description: 'Manages events, registrations, and scanner volunteers',
        permissions: {
            events: true,
            volunteers: true,
            registrations_export: true,
            ai_settings: false,
            blogs: false,
            team: false
        }
    },
    {
        id: 3,
        name: 'Content Manager',
        slug: 'content-lead',
        is_super: 0,
        description: 'Manages blogs, CMS pages, and media gallery',
        permissions: {
            events: false,
            volunteers: false,
            blogs: true,
            gallery: true,
            pages: true,
            team: false
        }
    },
    {
        id: 4,
        name: 'AI & Technical Lead',
        slug: 'ai-lead',
        is_super: 0,
        description: 'Configures Groq API models, settings, and scanner keys',
        permissions: {
            ai_settings: true,
            settings: true,
            volunteers: true,
            events: false,
            blogs: false,
            team: false
        }
    }
];

export default async function handler(req, res) {
    const currentAdmin = getAdmin(req);
    if (!currentAdmin) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // GET — Fetch system permissions and roles mapping
    if (req.method === 'GET') {
        try {
            const rolesResult = await executeQuery(
                'SELECT id, name, slug, description, permissions, is_super, created_at FROM admin_roles ORDER BY is_super DESC, name ASC'
            );

            let roles = DEFAULT_ROLES;
            if (rolesResult.success && Array.isArray(rolesResult.data) && rolesResult.data.length > 0) {
                roles = rolesResult.data.map(r => ({
                    ...r,
                    is_super: !!r.is_super,
                    permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions || '{}') : (r.permissions || {})
                }));
            }

            return res.status(200).json({
                success: true,
                permissions: SYSTEM_PERMISSIONS,
                roles
            });
        } catch (err) {
            console.warn('DB error, returning default permissions & roles:', err.message);
            return res.status(200).json({
                success: true,
                permissions: SYSTEM_PERMISSIONS,
                roles: DEFAULT_ROLES
            });
        }
    }

    // POST / PUT / PATCH — Update permissions for role or admin
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const { role_id, admin_id, permissions } = req.body || {};

        if (!permissions || typeof permissions !== 'object') {
            return res.status(400).json({ success: false, message: 'Valid permissions object is required' });
        }

        if (admin_id) {
            const memoryAdmins = getMemoryAdmins();
            const targetAdmin = memoryAdmins.find(a => String(a.id) === String(admin_id));

            if (String(admin_id) === '1' || (targetAdmin && targetAdmin.username === 'admin')) {
                const superPermissions = {
                    ...permissions,
                    team: true,
                    roles: true,
                    settings: true,
                    events: true,
                    volunteers: true
                };
                try {
                    await executeQuery('UPDATE admin SET permissions = ?, updated_at = NOW() WHERE id = ?', [JSON.stringify(superPermissions), admin_id]);
                } catch {}
                updateMemoryAdmin(admin_id, { permissions: superPermissions });

                return res.status(200).json({ success: true, message: 'Super admin permissions updated (core access retained)' });
            }

            try {
                await executeQuery('UPDATE admin SET permissions = ?, updated_at = NOW() WHERE id = ?', [JSON.stringify(permissions), admin_id]);
            } catch {}
            updateMemoryAdmin(admin_id, { permissions });

            return res.status(200).json({ success: true, message: 'Admin user permissions updated' });
        }

        if (role_id) {
            try {
                const roleResult = await executeQuery('SELECT is_super FROM admin_roles WHERE id = ?', [role_id]);
                if (roleResult.success && roleResult.data?.[0]?.is_super) {
                    return res.status(403).json({ success: false, message: 'Cannot modify permissions for Super Admin role' });
                }

                await executeQuery(
                    'UPDATE admin_roles SET permissions = ?, updated_at = NOW() WHERE id = ?',
                    [JSON.stringify(permissions), role_id]
                );
            } catch (err) {
                console.warn('DB role permission update error:', err.message);
            }

            return res.status(200).json({ success: true, message: 'Role permissions updated successfully' });
        }

        return res.status(400).json({ success: false, message: 'Provide either role_id or admin_id to update permissions' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
