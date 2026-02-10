import express from 'express';
import Stripe from 'stripe';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

// POST /api/payments/create - create a PaymentIntent for a given product
router.post('/create', requireAuth, async (req, res) => {
  const { productId, idempotencyKey } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const prodRes = await client.query('SELECT id, uuid, title, price, currency FROM products WHERE id = $1 AND is_active = true LIMIT 1', [productId]);
    if (!prodRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = prodRes.rows[0];

    if (!product.price || Number(product.price) <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid product price' });
    }

    // create pending order
    const orderRes = await client.query(
      `INSERT INTO orders (uuid, user_id, total_amount, currency, payment_status, payment_provider, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'pending', 'stripe', NOW(), NOW()) RETURNING id, uuid, user_id`,
      [req.user.id, product.price, product.currency]
    );
    const order = orderRes.rows[0];

    // create PaymentIntent (amount in cents)
    const amount = Math.round(Number(product.price) * 100);
    const piParams = {
      amount,
      currency: product.currency.toLowerCase(),
      metadata: { order_id: String(order.id), order_uuid: order.uuid, product_id: String(product.id), user_id: String(req.user.id) },
      description: `Order ${order.uuid} - ${product.title}`,
    };

    const opts = {};
    if (idempotencyKey) opts.idempotencyKey = idempotencyKey;

    const paymentIntent = await stripe.paymentIntents.create(piParams, opts);

    // record payment attempt
    await client.query(
      'INSERT INTO payments (order_id, provider, provider_transaction_id, amount, currency, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW())',
      [order.id, 'stripe', paymentIntent.id, (amount / 100.0), product.currency, 'initiated']
    );

    await client.query('COMMIT');

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, orderId: order.id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create PaymentIntent error', err);
    res.status(500).json({ error: 'Failed to create payment' });
  } finally {
    client.release();
  }
});

// POST /api/payments/refund - issue a refund for a payment (admin or owner)
router.post('/refund', requireAuth, async (req, res) => {
  const { paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ error: 'paymentId required' });

  try {
    const pRes = await pool.query('SELECT p.id,p.order_id,p.provider_transaction_id,p.amount,o.user_id FROM payments p JOIN orders o ON o.id = p.order_id WHERE p.id = $1 LIMIT 1', [paymentId]);
    if (!pRes.rows.length) return res.status(404).json({ error: 'Payment not found' });
    const p = pRes.rows[0];
    // authorization: only admin or owner
    if (req.user.role !== 'admin' && req.user.id !== p.user_id) return res.status(403).json({ error: 'Forbidden' });

    // call stripe refund
    const refund = await stripe.refunds.create({ payment_intent: p.provider_transaction_id });

    // update DB
    await pool.query('UPDATE payments SET status = $1 WHERE id = $2', ['refunded', paymentId]);
    await pool.query('UPDATE orders SET payment_status = $1 WHERE id = $2', ['refunded', p.order_id]);

    res.json({ ok: true, refundId: refund.id });
  } catch (err) {
    console.error('Refund error', err);
    res.status(500).json({ error: 'Refund failed' });
  }
});

export default router;
