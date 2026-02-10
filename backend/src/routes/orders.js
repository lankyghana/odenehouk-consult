import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/orders (customer: their orders, admin: all orders)
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    } else {
      result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [req.user.id, limit, offset]);
    }
    res.json({ rows: result.rows, limit, offset });
  } catch (err) {
    console.error('Fetch orders failed', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders (create order - placeholder, payment handled separately)
router.post('/', requireAuth, async (req, res) => {
  // This endpoint will be extended for payment integration
  res.status(501).json({ error: 'Order creation via API not implemented yet' });
});

export default router;
