// pages/api/admin/events/[id]/form-fields.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

export const defaultFormFields = [
  {
    id: 1,
    field_name: 'qu_id',
    field_label: 'QU ID / Student ID',
    field_type: 'text',
    required: false,
    placeholder: 'e.g. QU20261001',
    order_index: 1
  },
  {
    id: 2,
    field_name: 'full_name',
    field_label: 'Full Name',
    field_type: 'text',
    required: true,
    placeholder: 'Enter your full name',
    order_index: 2
  },
  {
    id: 3,
    field_name: 'email',
    field_label: 'Email Address',
    field_type: 'email',
    required: true,
    placeholder: 'name@example.com',
    order_index: 3
  },
  {
    id: 4,
    field_name: 'phone',
    field_label: 'Phone Number',
    field_type: 'phone',
    required: true,
    placeholder: '+91 98765 43210',
    order_index: 4
  },
  {
    id: 5,
    field_name: 'organization',
    field_label: 'Company / Institution',
    field_type: 'text',
    required: false,
    placeholder: 'Your startup, company, or university',
    order_index: 5
  }
];

const safeJsonParse = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
};

const safeJsonStringify = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val);
  } catch (e) {
    return null;
  }
};

export default async function handler(req, res) {
  const { id } = req.query || {};
  const eventId = String(id);

  if (!memoryStore.formFields) {
    memoryStore.formFields = {};
  }

  // GET: Fetch form fields for event
  if (req.method === 'GET') {
    try {
      const query = `
        SELECT * FROM event_form_fields 
        WHERE event_id = ? 
        ORDER BY order_index ASC, id ASC
      `;
      const result = await executeQuery(query, [eventId]);
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        const formFields = result.data.map(field => ({
          ...field,
          required: Boolean(field.required),
          field_options: safeJsonParse(field.field_options),
          validation_rules: safeJsonParse(field.validation_rules)
        }));
        memoryStore.formFields[eventId] = formFields;
        return res.status(200).json(formFields);
      }
    } catch (error) {
      console.warn('Error fetching form fields DB, serving memoryStore/defaults:', error.message);
    }

    if (memoryStore.formFields[eventId] && Array.isArray(memoryStore.formFields[eventId])) {
      return res.status(200).json(memoryStore.formFields[eventId]);
    }

    // Seed defaults into memoryStore if empty
    memoryStore.formFields[eventId] = [...defaultFormFields];
    return res.status(200).json(memoryStore.formFields[eventId]);
  }

  // POST: Create a single field OR bulk add/load template fields
  if (req.method === 'POST') {
    try {
      const body = req.body || {};

      // Handle loading templates or bulk replacing/adding
      if (body.action === 'load_templates' || Array.isArray(body.fields)) {
        const fieldsToAdd = Array.isArray(body.fields) ? body.fields : defaultFormFields;
        const mode = body.mode || 'replace'; // 'replace' or 'append'

        if (mode === 'replace') {
          memoryStore.formFields[eventId] = [];
          try {
            await executeQuery(`DELETE FROM event_form_fields WHERE event_id = ?`, [eventId]);
          } catch (e) {
            console.warn('DB delete error during replace:', e.message);
          }
        } else if (!memoryStore.formFields[eventId]) {
          memoryStore.formFields[eventId] = [];
        }

        const createdFields = [];
        const startOrder = memoryStore.formFields[eventId].length;
        for (let i = 0; i < fieldsToAdd.length; i++) {
          const item = fieldsToAdd[i];
          const newId = Date.now() + i;
          const newField = {
            id: item.id || newId,
            event_id: eventId,
            field_name: item.field_name || item.fieldName || item.name || `field_${newId}`,
            field_label: item.field_label || item.fieldLabel || item.label || 'Untitled Field',
            field_type: item.field_type || item.fieldType || item.type || 'text',
            field_options: safeJsonParse(item.field_options ?? item.fieldOptions ?? item.options),
            required: Boolean(item.required),
            placeholder: item.placeholder ? String(item.placeholder) : '',
            validation_rules: safeJsonParse(item.validation_rules ?? item.validationRules ?? item.validation),
            order_index: item.order_index ?? item.orderIndex ?? item.order ?? (startOrder + i + 1)
          };

          memoryStore.formFields[eventId].push(newField);

          try {
            const insertQuery = `
              INSERT INTO event_form_fields 
              (event_id, field_name, field_label, field_type, field_options, required, placeholder, validation_rules, order_index)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const result = await executeQuery(insertQuery, [
              eventId,
              newField.field_name,
              newField.field_label,
              newField.field_type,
              safeJsonStringify(newField.field_options),
              newField.required ? 1 : 0,
              newField.placeholder,
              safeJsonStringify(newField.validation_rules),
              newField.order_index
            ]);
            if (result?.data?.insertId) {
              newField.id = result.data.insertId;
            }
          } catch (dbErr) {
            console.warn('DB field insert fallback:', dbErr.message);
          }
          createdFields.push(newField);
        }

        return res.status(201).json({
          success: true,
          message: `Successfully loaded ${createdFields.length} fields`,
          fields: memoryStore.formFields[eventId]
        });
      }

      // Single field creation
      const {
        field_name,
        fieldName,
        name,
        field_label,
        fieldLabel,
        label,
        field_type,
        fieldType,
        type,
        field_options,
        fieldOptions,
        options,
        required = false,
        placeholder = '',
        validation_rules,
        validationRules,
        validation,
        order_index,
        orderIndex,
        order
      } = body;

      const nameVal = field_name || fieldName || name;
      const labelVal = field_label || fieldLabel || label || nameVal;
      const typeVal = field_type || fieldType || type || 'text';
      const optionsVal = safeJsonParse(field_options ?? fieldOptions ?? options);
      const rulesVal = safeJsonParse(validation_rules ?? validationRules ?? validation);

      if (!labelVal || !nameVal) {
        return res.status(400).json({ success: false, message: 'Field name and label are required' });
      }

      const newFieldId = Date.now();
      const newField = {
        id: newFieldId,
        event_id: eventId,
        field_name: String(nameVal).trim(),
        field_label: String(labelVal).trim(),
        field_type: String(typeVal).trim(),
        field_options: optionsVal,
        required: Boolean(required),
        placeholder: placeholder ? String(placeholder) : '',
        validation_rules: rulesVal,
        order_index: (order_index ?? orderIndex ?? order) || ((memoryStore.formFields[eventId]?.length || 0) + 1)
      };

      if (!memoryStore.formFields[eventId]) {
        memoryStore.formFields[eventId] = [];
      }
      memoryStore.formFields[eventId].push(newField);

      let insertId = newFieldId;
      try {
        const insertQuery = `
          INSERT INTO event_form_fields 
          (event_id, field_name, field_label, field_type, field_options, required, placeholder, validation_rules, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await executeQuery(insertQuery, [
          eventId,
          newField.field_name,
          newField.field_label,
          newField.field_type,
          safeJsonStringify(optionsVal),
          newField.required ? 1 : 0,
          newField.placeholder,
          safeJsonStringify(rulesVal),
          newField.order_index
        ]);
        if (result?.data?.insertId) {
          insertId = result.data.insertId;
          newField.id = insertId;
        }
      } catch (dbErr) {
        console.warn('DB form field insert fallback:', dbErr.message);
      }

      return res.status(201).json({
        success: true,
        message: 'Form field created successfully',
        id: insertId,
        field: newField
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // PUT: Reorder or bulk update all form fields
  if (req.method === 'PUT') {
    try {
      const { fields } = req.body || {};
      if (!Array.isArray(fields)) {
        return res.status(400).json({ success: false, message: 'Expected fields array in body' });
      }

      memoryStore.formFields[eventId] = fields.map((f, idx) => ({
        ...f,
        id: f.id || (Date.now() + idx),
        event_id: eventId,
        field_name: f.field_name || f.fieldName || f.name || `field_${idx + 1}`,
        field_label: f.field_label || f.fieldLabel || f.label || 'Untitled Field',
        field_type: f.field_type || f.fieldType || f.type || 'text',
        field_options: safeJsonParse(f.field_options ?? f.fieldOptions ?? f.options),
        required: Boolean(f.required),
        placeholder: f.placeholder ? String(f.placeholder) : '',
        validation_rules: safeJsonParse(f.validation_rules ?? f.validationRules ?? f.validation),
        order_index: f.order_index ?? f.orderIndex ?? f.order ?? (idx + 1)
      }));

      // Update DB if possible
      try {
        for (const f of memoryStore.formFields[eventId]) {
          if (f.id) {
            await executeQuery(
              `UPDATE event_form_fields 
               SET order_index = ?, required = ?, field_name = ?, field_label = ?, field_type = ?, placeholder = ?, field_options = ?, validation_rules = ? 
               WHERE id = ? AND event_id = ?`,
              [
                f.order_index,
                f.required ? 1 : 0,
                f.field_name,
                f.field_label,
                f.field_type,
                f.placeholder,
                safeJsonStringify(f.field_options),
                safeJsonStringify(f.validation_rules),
                f.id,
                eventId
              ]
            );
          }
        }
      } catch (dbErr) {
        console.warn('DB bulk update error:', dbErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Form fields updated successfully',
        fields: memoryStore.formFields[eventId]
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE: Delete all form fields for event
  if (req.method === 'DELETE') {
    try {
      memoryStore.formFields[eventId] = [];
      try {
        await executeQuery(`DELETE FROM event_form_fields WHERE event_id = ?`, [eventId]);
      } catch (dbErr) {
        console.warn('DB delete all form fields fallback:', dbErr.message);
      }
      return res.status(200).json({ success: true, message: 'All form fields deleted' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}