// pages/api/admin/team/index.js
import { executeQuery } from '@/lib/db';
import { getMemoryAdmins, createMemoryAdmin, updateMemoryAdmin, deleteMemoryAdmin } from '@/lib/memoryStore';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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
    { key: 'dashboard', label: 'Dashboard Access', description: 'Access main admin analytics & overview' },
    { key: 'events', label: 'Events Management', description: 'Create, update, delete events and manage registrations' },
    { key: 'volunteers', label: 'Volunteers Management', description: 'Generate scanner keys and monitor check-ins' },
    { key: 'blogs', label: 'Blogs & Content', description: 'Publish and edit articles, news, and categories' },
    { key: 'team', label: 'Team & Admins', description: 'Manage admin team members and access controls' },
    { key: 'applications', label: 'Applications', description: 'Review grant and program application submissions' },
    { key: 'portfolio', label: 'Portfolio & Startups', description: 'Manage incubated startups and ecosystem portfolio' },
    { key: 'gallery', label: 'Media Gallery', description: 'Upload and organize media, photos, and assets' },
    { key: 'pages', label: 'CMS Pages', description: 'Create and edit custom static site pages' },
    { key: 'settings', label: 'System Settings', description: 'Configure platform settings and AI integrations' },
    { key: 'roles', label: 'Roles & Permissions', description: 'Create and manage system user roles' },
    { key: 'registrations_export', label: 'Export Registrations', description: 'Download CSV/Excel registration data' },
    { key: 'ai_settings', label: 'AI Scanner Settings', description: 'Manage Groq and AI vision configuration' }
];

const DEFAULT_ROLES = [
    { id: 1, name: 'Super Admin', slug: 'super_admin', is_super: 1, description: 'Full system access' },
    { id: 2, name: 'Event Lead', slug: 'event-lead', is_super: 0, description: 'Manages events & volunteers' },
    { id: 3, name: 'Content Manager', slug: 'content-lead', is_super: 0, description: 'Manages blogs & media' },
    { id: 4, name: 'AI Lead', slug: 'ai-lead', is_super: 0, description: 'Configures Groq API models' }
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

function sanitizeAdminItem(item) {
    if (!item || typeof item !== 'object') return {};
    let adminPerms = sanitizePermissions(item.permissions);
    let rolePerms = sanitizePermissions(item.role_permissions);
    let mergedPerms = { ...rolePerms, ...adminPerms };

    if (!!item.is_super || item.role_slug === 'super_admin' || item.role === 'super_admin' || String(item.id) === '1' || item.username === 'admin') {
        mergedPerms = SYSTEM_PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.key]: true }), {
            all: true, events: true, volunteers: true, registrations_export: true,
            ai_settings: true, blogs: true, team: true, roles: true, admins: true, settings: true
        });
    }

    return {
        id: item.id ?? null,
        username: item.username ?? '',
        first_name: item.first_name ?? '',
        last_name: item.last_name ?? '',
        email: item.email ?? '',
        status: item.status === 1 || item.status === true || item.status === '1' ? 1 : 0,
        role_id: item.role_id ?? null,
        role_name: item.role_name ?? item.role ?? '',
        role_slug: item.role_slug ?? item.role ?? '',
        is_super: !!item.is_super || item.role_slug === 'super_admin' || item.role === 'super_admin',
        permissions: mergedPerms,
        created_at: item.created_at ?? null,
        updated_at: item.updated_at ?? null
    };
}

function sanitizeAdmins(adminsList) {
    if (!Array.isArray(adminsList)) return [];
    return adminsList.map(sanitizeAdminItem);
}

function sanitizeRoles(rolesList) {
    if (!Array.isArray(rolesList)) return [];
    return rolesList.map(item => ({
        id: item.id ?? null,
        name: item.name ?? '',
        slug: item.slug ?? '',
        description: item.description ?? '',
        permissions: sanitizePermissions(item.permissions),
        is_super: !!item.is_super
    }));
}

function sanitizeSystemPermissions(permissionsList) {
    if (!Array.isArray(permissionsList)) return [];
    return permissionsList.map(p => ({
        key: p.key ?? '',
        label: p.label ?? '',
        description: p.description ?? ''
    }));
}

async function fetchRolesFromDb() {
    try {
        const rolesResult = await executeQuery('SELECT id, name, slug, description, permissions, is_super FROM admin_roles ORDER BY id ASC');
        if (rolesResult.success && Array.isArray(rolesResult.data) && rolesResult.data.length > 0) {
            return sanitizeRoles(rolesResult.data);
        }
    } catch (err) {
        console.warn('DB roles query warning:', err.message);
    }
    return sanitizeRoles(DEFAULT_ROLES);
}

async function fetchAdminsFromDb() {
    let adminsList = [];
    try {
        const dbResult = await executeQuery(`
            SELECT a.id, a.username, a.first_name, a.last_name, a.email, a.status,
                   a.role_id, a.permissions, a.created_at, a.updated_at,
                   r.name AS role_name, r.slug AS role_slug, r.is_super, r.permissions AS role_permissions
            FROM admin a
            LEFT JOIN admin_roles r ON a.role_id = r.id
            WHERE a.deleted_at IS NULL
            ORDER BY a.created_at DESC
        `);

        if (dbResult.success && Array.isArray(dbResult.data) && dbResult.data.length > 0) {
            adminsList = dbResult.data;
        } else {
            adminsList = getMemoryAdmins();
        }
    } catch (err) {
        console.warn('DB error, using memoryStore fallback for team admins:', err.message);
        adminsList = getMemoryAdmins();
    }
    return sanitizeAdmins(adminsList);
}

export default async function handler(req, res) {
    const currentAdmin = getAdmin(req);
    if (!currentAdmin) {
        const fetchedRoles = await fetchRolesFromDb();
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            admins: [],
            roles: fetchedRoles,
            permissions: sanitizeSystemPermissions(SYSTEM_PERMISSIONS)
        });
    }

    // GET — List admins & permissions
    if (req.method === 'GET') {
        const activeAdmins = await fetchAdminsFromDb();
        const activeRoles = await fetchRolesFromDb();
        const sanitizedPermissions = sanitizeSystemPermissions(SYSTEM_PERMISSIONS);

        return res.status(200).json({
            success: true,
            data: activeAdmins,
            admins: activeAdmins,
            roles: activeRoles,
            permissions: sanitizedPermissions,
            availablePermissions: sanitizedPermissions
        });
    }

    // POST — Create new team member / admin
    if (req.method === 'POST') {
        const { username, password, first_name, last_name, email, role_id, status, permissions } = req.body || {};

        const activeRoles = await fetchRolesFromDb();
        const sanitizedPermissions = sanitizeSystemPermissions(SYSTEM_PERMISSIONS);

        if (!username?.trim()) {
            const activeAdmins = await fetchAdminsFromDb();
            return res.status(400).json({
                success: false,
                message: 'Username is required',
                admins: activeAdmins,
                roles: activeRoles,
                permissions: sanitizedPermissions
            });
        }
        if (!password || password.length < 6) {
            const activeAdmins = await fetchAdminsFromDb();
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
                admins: activeAdmins,
                roles: activeRoles,
                permissions: sanitizedPermissions
            });
        }

        const cleanUsername = username.trim().toLowerCase();

        // Unique username check in MySQL
        try {
            const dupCheck = await executeQuery(
                'SELECT id FROM admin WHERE username = ? AND deleted_at IS NULL',
                [cleanUsername]
            );
            if (dupCheck.success && dupCheck.data?.length > 0) {
                const activeAdmins = await fetchAdminsFromDb();
                return res.status(409).json({
                    success: false,
                    message: 'Username already taken',
                    admins: activeAdmins,
                    roles: activeRoles,
                    permissions: sanitizedPermissions
                });
            }
        } catch {}

        const memoryAdmins = getMemoryAdmins();
        if (memoryAdmins.some(a => a.username.toLowerCase() === cleanUsername)) {
            const activeAdmins = await fetchAdminsFromDb();
            return res.status(409).json({
                success: false,
                message: 'Username already taken',
                admins: activeAdmins,
                roles: activeRoles,
                permissions: sanitizedPermissions
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newId = crypto.randomUUID();
        const isActive = status === 1 || status === true || status === '1' ? 1 : 0;
        const permObj = permissions && typeof permissions === 'object' ? permissions : {};

        let createdAdminId = newId;
        try {
            const result = await executeQuery(
                `INSERT INTO admin (id, username, password, first_name, last_name, email, role_id, permissions, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    newId,
                    cleanUsername,
                    hashedPassword,
                    first_name?.trim() || null,
                    last_name?.trim() || null,
                    email?.trim() || `${cleanUsername}@genesis.com`,
                    role_id || null,
                    JSON.stringify(permObj),
                    isActive
                ]
            );

            if (!result.success) {
                throw new Error(result.error || 'DB insert failed');
            }

            createMemoryAdmin({
                id: newId,
                username: cleanUsername,
                first_name: first_name?.trim() || '',
                last_name: last_name?.trim() || '',
                email: email?.trim() || `${cleanUsername}@genesis.com`,
                role_id: role_id || null,
                status: isActive,
                permissions: permObj
            });
        } catch (err) {
            console.warn('DB create admin error, falling back to memoryStore:', err.message);
            const memCreated = createMemoryAdmin({
                username: cleanUsername,
                first_name: first_name?.trim() || '',
                last_name: last_name?.trim() || '',
                email: email?.trim() || `${cleanUsername}@genesis.com`,
                role_id: role_id || null,
                status: isActive,
                permissions: permObj
            });
            createdAdminId = memCreated.id;
        }

        const allAdmins = await fetchAdminsFromDb();
        return res.status(201).json({
            success: true,
            message: 'Team member created successfully',
            id: createdAdminId ?? null,
            admins: allAdmins,
            roles: activeRoles,
            permissions: sanitizedPermissions
        });
    }

    // PUT / PATCH — Batch / single admin update
    if (req.method === 'PUT' || req.method === 'PATCH') {
        const { id, username, first_name, last_name, email, password, role_id, status, permissions } = req.body || {};

        const activeRoles = await fetchRolesFromDb();
        const sanitizedPermissions = sanitizeSystemPermissions(SYSTEM_PERMISSIONS);

        if (!id) {
            const activeAdmins = await fetchAdminsFromDb();
            return res.status(400).json({
                success: false,
                message: 'Admin ID is required for update',
                admins: activeAdmins,
                roles: activeRoles,
                permissions: sanitizedPermissions
            });
        }

        // Default Super Admin protection
        const isDefaultSuper = String(id) === '1' || String(username).toLowerCase() === 'admin';
        if (isDefaultSuper) {
            if (status === 0 || status === false || status === '0') {
                const activeAdmins = await fetchAdminsFromDb();
                return res.status(403).json({
                    success: false,
                    message: 'Cannot deactivate default super admin account (admin / admin123)',
                    admins: activeAdmins,
                    roles: activeRoles,
                    permissions: sanitizedPermissions
                });
            }
            if (role_id && role_id !== 1 && role_id !== '1') {
                const activeAdmins = await fetchAdminsFromDb();
                return res.status(403).json({
                    success: false,
                    message: 'Cannot demote default super admin account (admin / admin123)',
                    admins: activeAdmins,
                    roles: activeRoles,
                    permissions: sanitizedPermissions
                });
            }
        }

        const isActive = status === 1 || status === true || status === '1' ? 1 : 0;
        const permObj = permissions && typeof permissions === 'object' ? permissions : undefined;

        let query, params;
        if (password && password.length >= 6) {
            const hashedPassword = await bcrypt.hash(password, 12);
            query = `UPDATE admin SET first_name=?, last_name=?, email=?, password=?, role_id=?, ${permObj ? 'permissions=?,' : ''} status=?, updated_at=NOW() WHERE id=? AND deleted_at IS NULL`;
            params = permObj
                ? [first_name?.trim() || null, last_name?.trim() || null, email?.trim() || null, hashedPassword, role_id || null, JSON.stringify(permObj), isActive, id]
                : [first_name?.trim() || null, last_name?.trim() || null, email?.trim() || null, hashedPassword, role_id || null, isActive, id];
        } else {
            query = `UPDATE admin SET first_name=?, last_name=?, email=?, role_id=?, ${permObj ? 'permissions=?,' : ''} status=?, updated_at=NOW() WHERE id=? AND deleted_at IS NULL`;
            params = permObj
                ? [first_name?.trim() || null, last_name?.trim() || null, email?.trim() || null, role_id || null, JSON.stringify(permObj), isActive, id]
                : [first_name?.trim() || null, last_name?.trim() || null, email?.trim() || null, role_id || null, isActive, id];
        }

        try {
            await executeQuery(query, params);
        } catch (err) {
            console.warn('DB update admin warning:', err.message);
        }
        updateMemoryAdmin(id, {
            first_name: first_name?.trim(),
            last_name: last_name?.trim(),
            email: email?.trim(),
            role_id,
            status: isActive,
            ...(permObj && { permissions: permObj })
        });

        const allAdmins = await fetchAdminsFromDb();
        return res.status(200).json({
            success: true,
            message: 'Team member updated successfully',
            admins: allAdmins,
            roles: activeRoles,
            permissions: sanitizedPermissions
        });
    }

    // DELETE — Delete admin
    if (req.method === 'DELETE') {
        const { id } = req.body || req.query || {};

        const activeRoles = await fetchRolesFromDb();
        const sanitizedPermissions = sanitizeSystemPermissions(SYSTEM_PERMISSIONS);

        if (!id) {
            const activeAdmins = await fetchAdminsFromDb();
            return res.status(400).json({
                success: false,
                message: 'Admin ID is required for deletion',
                admins: activeAdmins,
                roles: activeRoles,
                permissions: sanitizedPermissions
            });
        }

        const memoryAdmins = getMemoryAdmins();
        const target = memoryAdmins.find(a => String(a.id) === String(id));

        if (String(id) === '1' || (target && target.username === 'admin')) {
            const activeAdmins = await fetchAdminsFromDb();
            return res.status(403).json({
                success: false,
                message: 'Cannot delete default super admin account (admin / admin123)',
                admins: activeAdmins,
                roles: activeRoles,
                permissions: sanitizedPermissions
            });
        }

        try {
            await executeQuery('UPDATE admin SET deleted_at = NOW(), status = 0 WHERE id = ?', [id]);
        } catch (err) {
            console.warn('DB delete admin warning:', err.message);
        }
        deleteMemoryAdmin(id);

        const allAdmins = await fetchAdminsFromDb();
        return res.status(200).json({
            success: true,
            message: 'Team member deleted successfully',
            admins: allAdmins,
            roles: activeRoles,
            permissions: sanitizedPermissions
        });
    }

    const activeRoles = await fetchRolesFromDb();
    return res.status(405).json({
        success: false,
        message: 'Method not allowed',
        admins: [],
        roles: activeRoles,
        permissions: sanitizeSystemPermissions(SYSTEM_PERMISSIONS)
    });
}
