import pool from '../db.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

export default async function stripeWebhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const id = event.id;
  // idempotency: store processed event ids
  try {
    const exists = await pool.query('SELECT id FROM webhook_events WHERE event_id = $1 LIMIT 1', [id]);
    if (exists.rows.length) {
      return res.json({ received: true });
    }
  } catch (e) {
    console.error('Webhook lookup failed', e);
    return res.status(500).end();
  }

  // handle relevant events
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata || {};
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // find order by uuid or id from metadata
        const orderQuery = await client.query('SELECT * FROM orders WHERE id = $1 OR uuid = $2 FOR UPDATE', [metadata.order_id || null, metadata.order_uuid || null]);
        if (!orderQuery.rows.length) {
          // create fallback order? For safety, abort
          await client.query('ROLLBACK');
          console.error('Order not found for session', metadata);
          await client.query('INSERT INTO webhook_events (event_id, type, created_at) VALUES ($1, $2, NOW())', [id, event.type]);
          return res.json({ received: true });
        }
        const order = orderQuery.rows[0];

        // Update order status and insert payment + grant access
        const paymentIntentId = session.payment_intent || session.payment_intent;
        await client.query('UPDATE orders SET payment_status = $1, provider_payment_id = $2, updated_at = NOW() WHERE id = $3', ['paid', paymentIntentId, order.id]);
        await client.query('INSERT INTO payments (order_id, provider, provider_transaction_id, amount, currency, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW())', [order.id, 'stripe', paymentIntentId, order.total_amount, order.currency, 'succeeded']);

        // grant access permission for the product referenced in metadata
        if (metadata.product_id) {
          await client.query('INSERT INTO access_permissions (user_id, product_id, order_id, granted_at) VALUES ($1,$2,$3,NOW())', [order.user_id, metadata.product_id, order.id]);
        }

        await client.query('INSERT INTO webhook_events (event_id, type, created_at) VALUES ($1, $2, NOW())', [id, event.type]);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        console.error('Webhook processing error', e);
        client.release();
        return res.status(500).end();
      }
      client.release();
    }

    // PaymentIntent succeeded (covers direct PaymentIntent flows)
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const id = pi.id;
      const metadata = pi.metadata || {};
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // mark payment as succeeded
        await client.query('UPDATE payments SET status = $1 WHERE provider_transaction_id = $2', ['succeeded', id]);
        // update order if we can find it
        if (metadata.order_id) {
          await client.query('UPDATE orders SET payment_status = $1, provider_payment_id = $2, updated_at = NOW() WHERE id = $3', ['paid', id, metadata.order_id]);
          // grant access if product_id present
          if (metadata.product_id) {
            await client.query(
              `INSERT INTO access_permissions (user_id, product_id, order_id, granted_at)
               SELECT $1, $2, $3, NOW()
               WHERE NOT EXISTS (SELECT 1 FROM access_permissions WHERE user_id = $1 AND product_id = $2 AND order_id = $3)`,
              [metadata.user_id || null, metadata.product_id, metadata.order_id]
            );
          }
        }
        await client.query('INSERT INTO webhook_events (event_id, type, created_at) VALUES ($1, $2, NOW())', [event.id, event.type]);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        console.error('Webhook PI processing error', e);
        client.release();
        return res.status(500).end();
      }
      client.release();
    }

    // Charge refunded -> mark payments/orders refunded
    if (event.type === 'charge.refunded' || event.type === 'charge.refund.updated') {
      const ch = event.data.object;
      const paymentIntentId = ch.payment_intent;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // update payments and orders
        await client.query('UPDATE payments SET status = $1 WHERE provider_transaction_id = $2', ['refunded', paymentIntentId]);
        const payRow = await client.query('SELECT order_id FROM payments WHERE provider_transaction_id = $1 LIMIT 1', [paymentIntentId]);
        if (payRow.rows.length) {
          await client.query('UPDATE orders SET payment_status = $1 WHERE id = $2', ['refunded', payRow.rows[0].order_id]);
        }
        await client.query('INSERT INTO webhook_events (event_id, type, created_at) VALUES ($1, $2, NOW())', [event.id, event.type]);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        console.error('Webhook refund processing error', e);
        client.release();
        return res.status(500).end();
      }
      client.release();
    }

    // acknowledge receipt
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error', err);
    res.status(500).end();
  }
}
