node-pg-migrate migration files for database schema.

Run migrations (requires DATABASE_URL env):

```bash
cd backend
npx node-pg-migrate up
```

To create a new migration:

```bash
cd backend
npx node-pg-migrate create add_example --migrations-dir migrations
```

Rollback last migration:

```bash
npx node-pg-migrate down
```

Notes:
- Migrations are idempotent and reversible by design when using node-pg-migrate.
- Do not commit sensitive .env files. Use a secure secrets store in production.
