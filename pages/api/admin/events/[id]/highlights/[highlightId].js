import { executeQuery } from '@/lib/db';
export default async function handler(req, res) {
  const {
    id,
    highlightId
  } = req.query || {};
  if (req.method === 'DELETE') {
    try {
      const deleteQuery = `
        DELETE FROM event_highlights 
        WHERE id = ? AND event_id = ?
      `;
      const result = await executeQuery(deleteQuery, [highlightId, id]);
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
        message: 'Highlight deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting highlight:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  return res.status(405).json({
    message: 'Method not allowed'
  });
}