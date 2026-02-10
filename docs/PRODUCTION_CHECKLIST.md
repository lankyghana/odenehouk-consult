Production checklist

- Ensure `NODE_ENV=production` and required env vars are set
- Migrations applied: `npx node-pg-migrate up`
- Sentry DSN configured
- Stripe in `STRIPE_MODE=live` has STRIPE keys set
- HTTPS and HSTS enabled at load balancer
- Backups and monitoring configured
- CI passing for the release commit
