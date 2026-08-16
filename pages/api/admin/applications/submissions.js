// pages/api/admin/applications/submissions.js
import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end();
    }

    try {
        const {
            page = 1,
            limit = 10,
            status,
            form_id,
            search,
        } = req.query || {};

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        // Build dynamic WHERE clauses
        const conditions = [];
        const params = [];

        if (status && status !== 'all') {
            conditions.push('a.status = ?');
            params.push(status);
        }
        if (form_id && form_id !== 'all') {
            conditions.push('a.form_id = ?');
            params.push(parseInt(form_id));
        }
        if (search) {
            conditions.push('(a.applicant_name LIKE ? OR a.applicant_email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Total count
        const countResult = await executeQuery(
            `SELECT COUNT(*) as total FROM applications a ${where}`,
            params
        );
        const total = countResult.data[0]?.total || 0;

        // Submissions with form title
        const listResult = await executeQuery(
            `SELECT
         a.id, a.form_id, f.title AS form_title,
         a.applicant_name, a.applicant_email, a.status,
         DATE_FORMAT(a.submitted_at, '%b %d, %Y') AS submitted_at
       FROM applications a
       LEFT JOIN application_forms f ON f.id = a.form_id
       ${where}
       ORDER BY a.submitted_at DESC
       LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        // Stats across all submissions (ignoring current filter)
        const statsResult = await executeQuery(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
    `);
        const stats = { submitted: 0, under_review: 0, accepted: 0, rejected: 0 };
        (statsResult.data || []).forEach((row) => {
            if (stats.hasOwnProperty(row.status)) stats[row.status] = row.count;
        });

        return res.status(200).json({
            success: true,
            data: listResult.data || [],
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasNext: offset + limitNum < total,
                hasPrev: pageNum > 1,
            },
            stats,
        });
    } catch (err) {
        console.error('Submissions list error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}
