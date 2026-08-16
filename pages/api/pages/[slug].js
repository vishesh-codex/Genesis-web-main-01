// pages/api/pages/[slug].js
import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  const { slug } = req.query || {};

  if (req.method === 'GET') {
    try {
      const result = await executeQuery('SELECT * FROM custom_pages WHERE slug = ? AND status = "published"', [slug]);
      
      if (!result.data || result.data.length === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }
      
      const page = result.data[0];
      
      // Update view count
      await executeQuery('UPDATE custom_pages SET views = views + 1 WHERE id = ?', [page.id]);

      // Parse JSON content if it's a string
      if (typeof page.content === 'string') {
        try {
          page.content = JSON.parse(page.content);
        } catch (e) {
          page.content = [];
        }
      }
      
      return res.status(200).json(page);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
