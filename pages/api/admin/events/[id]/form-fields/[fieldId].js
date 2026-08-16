// pages/api/admin/events/[id]/form-fields/[fieldId].js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

export default async function handler(req, res) {
  const { id, fieldId } = req.query || {};
  const eventId = String(id);
  const targetFieldId = String(fieldId);

  if (!memoryStore.formFields) {
    memoryStore.formFields = {};
  }
  if (!memoryStore.formFields[eventId]) {
    memoryStore.formFields[eventId] = [];
  }

  // GET single field
  if (req.method === 'GET') {
    try {
      const query = `SELECT * FROM event_form_fields WHERE id = ? AND event_id = ?`;
      const result = await executeQuery(query, [targetFieldId, eventId]);
      if (result?.success && Array.isArray(result.data) && result.data.length > 0) {
        const field = result.data[0];
        return res.status(200).json({
          ...field,
          required: Boolean(field.required),
          field_options: field.field_options ? (typeof field.field_options === 'string' ? JSON.parse(field.field_options) : field.field_options) : null,
          validation_rules: field.validation_rules ? (typeof field.validation_rules === 'string' ? JSON.parse(field.validation_rules) : field.validation_rules) : null
        });
      }
    } catch (dbErr) {
      console.warn('DB fetch single field error:', dbErr.message);
    }

    const field = memoryStore.formFields[eventId].find(f => String(f.id) === targetFieldId);
    if (field) {
      return res.status(200).json(field);
    }
    return res.status(404).json({ success: false, message: 'Form field not found' });
  }

  // PUT update single field
  if (req.method === 'PUT') {
    try {
      const {
        field_name,
        field_label,
        field_type,
        field_options,
        required,
        placeholder,
        validation_rules,
        order_index
      } = req.body || {};

      let updatedField = null;
      const fieldIdx = memoryStore.formFields[eventId].findIndex(f => String(f.id) === targetFieldId);

      if (fieldIdx !== -1) {
        memoryStore.formFields[eventId][fieldIdx] = {
          ...memoryStore.formFields[eventId][fieldIdx],
          ...(field_name !== undefined && { field_name }),
          ...(field_label !== undefined && { field_label }),
          ...(field_type !== undefined && { field_type }),
          ...(field_options !== undefined && { field_options }),
          ...(required !== undefined && { required: !!required }),
          ...(placeholder !== undefined && { placeholder }),
          ...(validation_rules !== undefined && { validation_rules }),
          ...(order_index !== undefined && { order_index: Number(order_index) })
        };
        updatedField = memoryStore.formFields[eventId][fieldIdx];
      } else {
        updatedField = {
          id: targetFieldId,
          event_id: eventId,
          field_name: field_name || 'field',
          field_label: field_label || 'Field',
          field_type: field_type || 'text',
          field_options: field_options || null,
          required: !!required,
          placeholder: placeholder || '',
          validation_rules: validation_rules || null,
          order_index: order_index !== undefined ? Number(order_index) : 0
        };
        memoryStore.formFields[eventId].push(updatedField);
      }

      // Update in MySQL
      try {
        const updateQuery = `
          UPDATE event_form_fields 
          SET field_name = COALESCE(?, field_name),
              field_label = COALESCE(?, field_label),
              field_type = COALESCE(?, field_type),
              field_options = ?,
              required = ?,
              placeholder = COALESCE(?, placeholder),
              validation_rules = ?,
              order_index = COALESCE(?, order_index)
          WHERE id = ? AND event_id = ?
        `;
        await executeQuery(updateQuery, [
          field_name || null,
          field_label || null,
          field_type || null,
          field_options ? JSON.stringify(field_options) : null,
          required !== undefined ? (required ? 1 : 0) : 0,
          placeholder || null,
          validation_rules ? JSON.stringify(validation_rules) : null,
          order_index !== undefined ? Number(order_index) : null,
          targetFieldId,
          eventId
        ]);
      } catch (dbErr) {
        console.warn('DB form field update fallback:', dbErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Form field updated successfully',
        field: updatedField
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE single field
  if (req.method === 'DELETE') {
    try {
      // Remove from memoryStore
      memoryStore.formFields[eventId] = memoryStore.formFields[eventId].filter(
        f => String(f.id) !== targetFieldId
      );

      // Remove from MySQL
      try {
        const deleteQuery = `DELETE FROM event_form_fields WHERE id = ? AND event_id = ?`;
        await executeQuery(deleteQuery, [targetFieldId, eventId]);
      } catch (dbErr) {
        console.warn('DB form field delete fallback:', dbErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Form field deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
