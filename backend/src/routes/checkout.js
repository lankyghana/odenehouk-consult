import express from 'express';
import pool from '../db.js';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

// POST /api/checkout - create Checkout session for a product
router.post('/create-session', requireAuth, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });
  try {
    const prod = await pool.query('SELECT id, uuid, title, price, currency FROM products WHERE id = $1 AND is_active = true LIMIT 1', [productId]);
    if (!prod.rows.length) return res.status(404).json({ error: 'Product not found' });
    const product = prod.rows[0];

    // safety checks
    if (!product.price || Number(product.price) <= 0) return res.status(400).json({ error: 'Invalid product price' });
    const allowedCurrencies = ['USD'];
    if (!allowedCurrencies.includes(product.currency)) return res.status(400).json({ error: 'Unsupported currency' });

    // create pending order in DB
    const orderRes = await pool.query(
      `INSERT INTO orders (uuid, user_id, total_amount, currency, payment_status, payment_provider, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'pending', 'stripe', NOW(), NOW()) RETURNING id, uuid`,
      [req.user.id, product.price, product.currency]
    );
    const order = orderRes.rows[0];

    // Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price_data: { currency: product.currency, product_data: { name: product.title }, unit_amount: Math.round(product.price * 100) }, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/product/${product.uuid}`,
      metadata: { order_id: String(order.id), order_uuid: order.uuid, user_id: String(req.user.id), product_id: String(product.id) },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout create error', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

export default router;
