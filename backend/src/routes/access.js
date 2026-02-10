import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/access (customer: their access, admin: all)
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM access_permissions ORDER BY granted_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    } else {
      result = await pool.query('SELECT * FROM access_permissions WHERE user_id = $1 ORDER BY granted_at DESC LIMIT $2 OFFSET $3', [req.user.id, limit, offset]);
    }
    res.json({ rows: result.rows, limit, offset });
  } catch (err) {
    console.error('Fetch access failed', err);
    res.status(500).json({ error: 'Failed to fetch access permissions' });
  }
});

export default router;
