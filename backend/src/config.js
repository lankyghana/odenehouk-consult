export function validateEnv() {
  const required = ['JWT_SECRET', 'DATABASE_URL', 'FRONTEND_URL'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('FATAL: Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  // Stripe mode guard
  const stripeMode = process.env.STRIPE_MODE || 'test';
  if (stripeMode === 'live') {
    const stripeReq = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
    const missingStripe = stripeReq.filter(k => !process.env[k]);
    if (missingStripe.length) {
      console.error('FATAL: STRIPE live mode requires:', missingStripe.join(', '));
      process.exit(1);
    }
  }
}

export const isProd = process.env.NODE_ENV === 'production';
