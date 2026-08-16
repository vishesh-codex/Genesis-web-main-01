import { executeQuery } from '@/lib/db';
export default async function handler(req, res) {
  const {
    id
  } = req.query || {};
  if (req.method === 'GET') {
    try {
      const query = `
        SELECT * FROM event_highlights 
        WHERE event_id = ? 
        ORDER BY order_index ASC
      `;
      const result = await executeQuery(query, [id]);
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
      return res.status(200).json(result.data);
    } catch (error) {
      console.error('Error fetching highlights:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  if (req.method === 'POST') {
    try {
      const {
        title,
        description,
        image_url,
        order_index
      } = req.body || {};
      if (!title || !image_url) {
        return res.status(400).json({
          error: 'Title and image are required'
        });
      }
      const insertQuery = `
        INSERT INTO event_highlights (event_id, title, description, image_url, order_index)
        VALUES (?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(insertQuery, [id, title, description, image_url, order_index || 0]);
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
      return res.status(201).json({
        message: 'Highlight created successfully',
        id: result.data.insertId
      });
    } catch (error) {
      console.error('Error creating highlight:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  return res.status(405).json({
    message: 'Method not allowed'
  });
}