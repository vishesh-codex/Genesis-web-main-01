
// pages/api/events/[id]/registrations.js
import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query || {};

  if (req.method === 'GET') {
    try {
      const query = `
        SELECT 
          er.*,
          e.title as event_title
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE er.event_id = ?
        ORDER BY er.registration_date DESC
      `;
      
      const result = await executeQuery(query, [id]);
      
      if (!result.success) {
        return res.status(500).json({ error: 'Failed to fetch registrations' });
      }

      // Parse registration data JSON
      const registrations = result.data.map((registration) => ({
        ...registration,
        registration_data: JSON.parse(registration.registration_data)
      }));

      return res.status(200).json(registrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}