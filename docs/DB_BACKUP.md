# Database backup and restore (Postgres)

Suggested approach for production:

- Use managed Postgres provider snapshots (AWS RDS automated snapshots, or provider equivalent).
- Enable point-in-time recovery (PITR) for accidental deletes/rollbacks.
- Nightly logical backups via `pg_dump` to an offsite storage (S3).

Example pg_dump command:

```bash
PGHOST=... PGUSER=... PGPASSWORD=... PGDATABASE=... pg_dump -Fc -f backup-$(date +%F).dump
```

Restore example:

```bash
pg_restore -h host -U user -d targetdb backup-file.dump
```

Test restores regularly on staging.
