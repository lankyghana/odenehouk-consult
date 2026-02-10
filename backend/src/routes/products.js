import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/products - List all active products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, uuid, title, description, price, type, is_active FROM products WHERE is_active = true ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    // Provide a small fallback list so the storefront can load when the DB is unavailable during local testing
    return res.json([
      { id: 'demo-1', title: 'Demo Digital Product', description: 'Sample downloadable product while DB is offline', price: 19.0, type: 'digital', is_active: true },
      { id: 'demo-2', title: 'Demo Coaching Session', description: 'Sample coaching slot while DB is offline', price: 99.0, type: 'coaching_1on1', is_active: true },
    ]);
  }
});

// GET /api/products/:id - Get product by id (uuid or numeric)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, uuid, title, description, price, type, is_active FROM products WHERE (uuid = $1 OR id::text = $1) LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    // Match fallback item by id when DB is unavailable
    const fallback = {
      'demo-1': { id: 'demo-1', title: 'Demo Digital Product', description: 'Sample downloadable product while DB is offline', price: 19.0, type: 'digital', is_active: true },
      'demo-2': { id: 'demo-2', title: 'Demo Coaching Session', description: 'Sample coaching slot while DB is offline', price: 99.0, type: 'coaching_1on1', is_active: true },
    };
    if (fallback[id]) return res.json(fallback[id]);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
