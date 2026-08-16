// pages/api/applications/[formId]/submit.js
// Public API — submit answers for a given active form
import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end();
    }

    const { formId } = req.query || {};
    const { applicant_name, applicant_email, answers = {} } = req.body;

    if (!applicant_name || !applicant_email) {
        return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    try {
        // Check form exists and is active
        const formResult = await executeQuery(
            `SELECT id FROM application_forms WHERE id = ? AND status = 'active'`,
            [formId]
        );
        if (!formResult.data || formResult.data.length === 0) {
            return res.status(404).json({ success: false, error: 'Form not found or not active' });
        }

        // Fetch all fields for this form (to validate required + insert answers)
        const fieldsResult = await executeQuery(
            `SELECT id, label, required FROM application_form_fields WHERE form_id = ? ORDER BY field_order ASC`,
            [formId]
        );
        const fields = fieldsResult.data || [];

        // Validate required fields
        for (const field of fields) {
            if (field.required && !answers[field.id]) {
                return res.status(400).json({
                    success: false,
                    error: `Field "${field.label}" is required`,
                });
            }
        }

        // Insert application record
        const appResult = await executeQuery(
            `INSERT INTO applications (form_id, applicant_name, applicant_email, status) VALUES (?, ?, ?, 'submitted')`,
            [formId, applicant_name, applicant_email]
        );
        const applicationId = appResult.data.insertId;

        // Insert answers
        for (const field of fields) {
            const answerValue = answers[field.id] ?? '';
            await executeQuery(
                `INSERT INTO application_answers (application_id, field_id, answer) VALUES (?, ?, ?)`,
                [applicationId, field.id, Array.isArray(answerValue) ? answerValue.join(', ') : answerValue]
            );
        }

        return res.status(201).json({
            success: true,
            message: 'Application submitted successfully!',
            applicationId,
        });
    } catch (err) {
        console.error('Submit error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
