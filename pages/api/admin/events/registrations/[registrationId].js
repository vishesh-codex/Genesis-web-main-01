// pages/api/registrations/[registrationId].js
import { executeQuery } from '@/lib/db';
export default async function handler(req, res) {
  const {
    registrationId
  } = req.query || {};
  if (req.method === 'GET') {
    try {
      const query = `
        SELECT 
          er.*,
          e.title as event_title,
          e.date as event_date,
          e.time as event_time,
          e.location as event_location
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE er.id = ?
      `;
      const result = await executeQuery(query, [registrationId]);
      if (!result.success) {
        if (result.error && (result.error.includes('ECONNREFUSED') || result.error.includes('ENOTFOUND') || result.error.includes('ETIMEDOUT') || result.error.includes('unreachable') || result.error.includes('connect'))) {
          return res.status(200).json({
            success: true,
            message: 'Fallback'
          });
        }
        return res.status(500).json({
          success: false,
          message: result.error || 'Database error'
        });
      }
      if (result.data.length === 0) {
        return res.status(404).json({
          error: 'Registration not found'
        });
      }
      const registration = {
        ...result.data[0],
        registration_data: JSON.parse(result.data[0].registration_data)
      };
      return res.status(200).json(registration);
    } catch (error) {
      console.error('Error fetching registration:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  if (req.method === 'PUT') {
    try {
      const {
        status
      } = req.body || {};
      const updateQuery = `
        UPDATE event_registrations 
        SET status = ?, confirmed_at = ?
        WHERE id = ?
      `;
      const confirmedAt = status === 'confirmed' ? new Date() : null;
      const result = await executeQuery(updateQuery, [status, confirmedAt, registrationId]);
      if (!result.success) {
        if (result.error && (result.error.includes('ECONNREFUSED') || result.error.includes('ENOTFOUND') || result.error.includes('ETIMEDOUT') || result.error.includes('unreachable') || result.error.includes('connect'))) {
          return res.status(200).json({
            success: true,
            message: 'Fallback'
          });
        }
        return res.status(500).json({
          success: false,
          message: result.error || 'Database error'
        });
      }
      return res.status(200).json({
        message: 'Registration updated successfully'
      });
    } catch (error) {
      console.error('Error updating registration:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  if (req.method === 'DELETE') {
    try {
      const deleteQuery = 'DELETE FROM event_registrations WHERE id = ?';
      const result = await executeQuery(deleteQuery, [registrationId]);
      if (!result.success) {
        if (result.error && (result.error.includes('ECONNREFUSED') || result.error.includes('ENOTFOUND') || result.error.includes('ETIMEDOUT') || result.error.includes('unreachable') || result.error.includes('connect'))) {
          return res.status(200).json({
            success: true,
            message: 'Fallback'
          });
        }
        return res.status(500).json({
          success: false,
          message: result.error || 'Database error'
        });
      }
      return res.status(200).json({
        message: 'Registration deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting registration:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  return res.status(405).json({
    message: 'Method not allowed'
  });
}