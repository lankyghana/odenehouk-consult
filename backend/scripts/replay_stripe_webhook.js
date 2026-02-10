#!/usr/bin/env node
// Usage: node replay_stripe_webhook.js <path-to-event-json>
import fs from 'fs';
import fetch from 'node-fetch';
import Stripe from 'stripe';

const [,, file] = process.argv;
if (!file) {
  console.error('Usage: node replay_stripe_webhook.js <event.json>');
  process.exit(2);
}

const payload = fs.readFileSync(file, 'utf8');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) { console.error('STRIPE_WEBHOOK_SECRET not set'); process.exit(2); }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });
const header = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });

const res = await fetch(process.env.WEBHOOK_URL || 'http://localhost:4000/api/webhooks/stripe', {
  method: 'POST',
  headers: { 'Stripe-Signature': header, 'Content-Type': 'application/json' },
  body: payload,
});
console.log('status', res.status);
console.log(await res.text());
