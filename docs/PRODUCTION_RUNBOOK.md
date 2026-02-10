# Production runbook (brief)

Startup:
- Ensure required env vars set (see backend/.env.example)
- Run DB migrations: `npx node-pg-migrate up`
- Start backend: `npm run start` (or via systemd/container)
- Start frontend build on CDN

Rollback:
- Use migration `down` for last migration if safe: `npx node-pg-migrate down`
- Re-deploy previous artifacts from CI/CD

Incident response:
- Check `/api/_startup_check` and health endpoints
- Collect logs (Sentry + pino)
- If payment failures, check webhook events table and replay using `backend/scripts/replay_stripe_webhook.js`
