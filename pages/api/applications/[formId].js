// pages/api/applications/[formId].js
// Public API — returns an active form and its fields for applicants to fill
import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end();
    }

    const { formId } = req.query || {};

    try {
        const formResult = await executeQuery(
            `SELECT id, title, description, status FROM application_forms WHERE id = ? AND status = 'active'`,
            [formId]
        );

        if (!formResult.data || formResult.data.length === 0) {
            return res.status(404).json({ success: false, error: 'Form not found or not active' });
        }

        const fieldsResult = await executeQuery(
            `SELECT id, label, field_type, options, required, placeholder
       FROM application_form_fields WHERE form_id = ? ORDER BY field_order ASC`,
            [formId]
        );

        const fields = (fieldsResult.data || []).map((f) => ({
            ...f,
            options: f.options ? JSON.parse(f.options) : [],
            required: !!f.required,
        }));

        return res.status(200).json({
            success: true,
            data: { ...formResult.data[0], fields },
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
