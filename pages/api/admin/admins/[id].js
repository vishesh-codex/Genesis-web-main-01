// pages/api/admin/admins/[id].js
import { executeQuery } from '../../../../lib/db';
import { getMemoryAdmins, updateMemoryAdmin, deleteMemoryAdmin } from '../../../../lib/memoryStore';
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
    if (!currentAdmin) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.query || {};
    if (!id) return res.status(400).json({ success: false, message: 'Admin ID required' });

    const memoryAdmins = getMemoryAdmins();
    const targetAdmin = memoryAdmins.find(a => String(a.id) === String(id));
    const isDefaultSuper = String(id) === '1' || (targetAdmin && targetAdmin.username === 'admin');

    // PUT — update admin (permissions, password, status, etc.)
    if (req.method === 'PUT' || req.method === 'PATCH') {
        const { first_name, last_name, username, password, role_id, status, permissions } = req.body || {};

        if (isDefaultSuper) {
            if (status === 0 || status === false || status === '0') {
                return res.status(403).json({ success: false, message: 'Cannot deactivate default super admin account (admin / admin123)' });
            }
            if (role_id && role_id !== 1 && role_id !== '1') {
                return res.status(403).json({ success: false, message: 'Cannot demote default super admin account (admin / admin123)' });
            }
            if (username && username.trim().toLowerCase() !== 'admin') {
                return res.status(403).json({ success: false, message: 'Cannot change username of default super admin account' });
            }
        }

        if (!username?.trim()) return res.status(400).json({ success: false, message: 'Username is required' });

        try {
            // Check username uniqueness (exclude current)
            const dupCheck = await executeQuery(
                'SELECT id FROM admin WHERE username = ? AND id != ? AND deleted_at IS NULL',
                [username.trim(), id]
            );
            if (dupCheck.success && dupCheck.data.length > 0) {
                return res.status(409).json({ success: false, message: 'Username already taken' });
            }

            let query, params;
            const permStr = permissions ? JSON.stringify(permissions) : null;
            const isActive = isDefaultSuper ? 1 : (status === 1 || status === true || status === '1' ? 1 : 0);

            if (password && password.length >= 6) {
                const hashedPassword = await bcrypt.hash(password, 12);
                query = `UPDATE admin SET first_name=?, last_name=?, username=?, password=?, role_id=?, status=?, permissions=COALESCE(?, permissions), updated_at=NOW() WHERE id=?`;
                params = [first_name?.trim() || null, last_name?.trim() || null, username.trim(), hashedPassword, role_id || null, isActive, permStr, id];
            } else {
                query = `UPDATE admin SET first_name=?, last_name=?, username=?, role_id=?, status=?, permissions=COALESCE(?, permissions), updated_at=NOW() WHERE id=?`;
                params = [first_name?.trim() || null, last_name?.trim() || null, username.trim(), role_id || null, isActive, permStr, id];
            }

            const result = await executeQuery(query, params);
            if (result.success) {
                updateMemoryAdmin(id, {
                    username: username.trim(),
                    first_name: first_name?.trim(),
                    last_name: last_name?.trim(),
                    role_id,
                    status: isActive,
                    permissions
                });
                return res.status(200).json({ success: true, message: 'Admin updated successfully' });
            }
        } catch (e) {
            console.warn('DB admin update error, using memoryStore fallback:', e);
        }

        // MemoryStore fallback update
        const updated = updateMemoryAdmin(id, {
            username: username.trim(),
            first_name: first_name?.trim(),
            last_name: last_name?.trim(),
            role_id,
            status: isDefaultSuper ? 1 : (status === 1 || status === true ? 1 : 0),
            permissions
        });
        return res.status(200).json({ success: true, message: 'Admin updated (MemoryStore)', data: updated });
    }

    // DELETE — soft delete
    if (req.method === 'DELETE') {
        if (isDefaultSuper) {
            return res.status(403).json({ success: false, message: 'Cannot delete default super admin account (admin / admin123)' });
        }
        if (String(id) === String(currentAdmin.id)) {
            return res.status(403).json({ success: false, message: 'Cannot delete your own logged-in account' });
        }

        try {
            const result = await executeQuery(
                'UPDATE admin SET deleted_at = NOW(), status = 0 WHERE id = ?',
                [id]
            );
            if (result.success) {
                deleteMemoryAdmin(id);
                return res.status(200).json({ success: true, message: 'Admin deleted successfully' });
            }
        } catch (e) {
            console.warn('DB admin delete error, using memoryStore fallback:', e);
        }

        deleteMemoryAdmin(id);
        return res.status(200).json({ success: true, message: 'Admin deleted (MemoryStore)' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
