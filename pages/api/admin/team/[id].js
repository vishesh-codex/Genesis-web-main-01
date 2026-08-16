// pages/api/admin/team/[id].js
import { executeQuery } from '@/lib/db';
import { getMemoryAdmins, updateMemoryAdmin, deleteMemoryAdmin } from '@/lib/memoryStore';
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

export default async function handler(req, res) {
    const currentAdmin = getAdmin(req);
    if (!currentAdmin) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.query || {};
    if (!id) {
        return res.status(400).json({ success: false, message: 'Missing admin ID' });
    }

    let existingAdmin = null;
    try {
        const result = await executeQuery(
            `SELECT a.id, a.username, a.first_name, a.last_name, a.email, a.status,
                    a.role_id, a.permissions, a.created_at, a.updated_at,
                    r.name AS role_name, r.slug AS role_slug, r.is_super
             FROM admin a
             LEFT JOIN admin_roles r ON a.role_id = r.id
             WHERE a.id = ? AND a.deleted_at IS NULL`,
            [id]
        );
        if (result.success && result.data && result.data[0]) {
            existingAdmin = result.data[0];
            if (typeof existingAdmin.permissions === 'string') {
                try {
                    existingAdmin.permissions = JSON.parse(existingAdmin.permissions);
                } catch {
                    existingAdmin.permissions = {};
                }
            }
        }
    } catch (err) {
        console.warn('DB error fetching admin by ID:', err.message);
    }

    if (!existingAdmin) {
        const memoryAdmins = getMemoryAdmins();
        existingAdmin = memoryAdmins.find(a => String(a.id) === String(id));
    }

    if (!existingAdmin) {
        return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    // GET — Single team member
    if (req.method === 'GET') {
        return res.status(200).json({ success: true, data: existingAdmin });
    }

    const isDefaultSuper = String(existingAdmin.id) === '1' || existingAdmin.username === 'admin';

    // PUT / PATCH — Update team member
    if (req.method === 'PUT' || req.method === 'PATCH') {
        const { username, first_name, last_name, email, password, role_id, status, permissions } = req.body || {};

        if (isDefaultSuper) {
            if (status === 0 || status === false || status === '0') {
                return res.status(403).json({ success: false, message: 'Cannot deactivate default super admin account (admin / admin123)' });
            }
            if (role_id && role_id !== 1 && role_id !== '1' && role_id !== existingAdmin.role_id) {
                return res.status(403).json({ success: false, message: 'Cannot demote default super admin account (admin / admin123)' });
            }
            if (username && username.trim().toLowerCase() !== 'admin') {
                return res.status(403).json({ success: false, message: 'Cannot change username of default super admin account' });
            }
        }

        const cleanUsername = username?.trim().toLowerCase() || existingAdmin.username;

        if (cleanUsername !== existingAdmin.username) {
            try {
                const dupCheck = await executeQuery(
                    'SELECT id FROM admin WHERE username = ? AND id != ? AND deleted_at IS NULL',
                    [cleanUsername, id]
                );
                if (dupCheck.success && dupCheck.data?.length > 0) {
                    return res.status(409).json({ success: false, message: 'Username already taken' });
                }
            } catch {}

            const memoryAdmins = getMemoryAdmins();
            if (memoryAdmins.some(a => String(a.id) !== String(id) && a.username.toLowerCase() === cleanUsername)) {
                return res.status(409).json({ success: false, message: 'Username already taken' });
            }
        }

        const isActive = isDefaultSuper ? 1 : (status === 1 || status === true || status === '1' ? 1 : 0);
        const permObj = permissions && typeof permissions === 'object' ? permissions : existingAdmin.permissions;

        let query, params;
        if (password && password.length >= 6) {
            const hashedPassword = await bcrypt.hash(password, 12);
            query = `UPDATE admin SET username=?, first_name=?, last_name=?, email=?, password=?, role_id=?, permissions=?, status=?, updated_at=NOW() WHERE id=?`;
            params = [
                cleanUsername,
                first_name?.trim() ?? existingAdmin.first_name,
                last_name?.trim() ?? existingAdmin.last_name,
                email?.trim() ?? existingAdmin.email,
                hashedPassword,
                role_id ?? existingAdmin.role_id,
                JSON.stringify(permObj || {}),
                isActive,
                id
            ];
        } else {
            query = `UPDATE admin SET username=?, first_name=?, last_name=?, email=?, role_id=?, permissions=?, status=?, updated_at=NOW() WHERE id=?`;
            params = [
                cleanUsername,
                first_name?.trim() ?? existingAdmin.first_name,
                last_name?.trim() ?? existingAdmin.last_name,
                email?.trim() ?? existingAdmin.email,
                role_id ?? existingAdmin.role_id,
                JSON.stringify(permObj || {}),
                isActive,
                id
            ];
        }

        try {
            await executeQuery(query, params);
        } catch (err) {
            console.warn('DB update error, using memoryStore fallback:', err.message);
        }

        updateMemoryAdmin(id, {
            username: cleanUsername,
            first_name: first_name?.trim() ?? existingAdmin.first_name,
            last_name: last_name?.trim() ?? existingAdmin.last_name,
            email: email?.trim() ?? existingAdmin.email,
            role_id: role_id ?? existingAdmin.role_id,
            status: isActive,
            permissions: permObj
        });

        return res.status(200).json({
            success: true,
            message: 'Team member updated successfully'
        });
    }

    // DELETE — Delete team member
    if (req.method === 'DELETE') {
        if (isDefaultSuper) {
            return res.status(403).json({ success: false, message: 'Cannot delete default super admin account (admin / admin123)' });
        }

        if (String(currentAdmin.id) === String(id)) {
            return res.status(403).json({ success: false, message: 'Cannot delete your own logged-in account' });
        }

        try {
            await executeQuery('UPDATE admin SET deleted_at = NOW(), status = 0 WHERE id = ?', [id]);
        } catch (err) {
            console.warn('DB delete error, using memoryStore fallback:', err.message);
        }

        deleteMemoryAdmin(id);

        return res.status(200).json({
            success: true,
            message: 'Team member deleted successfully'
        });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
