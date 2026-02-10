import fs from 'fs';
import path from 'path';
import pool from '../src/db.js';

async function run() {
  try {
    const sqlPath = path.resolve(process.cwd(), 'backend', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split statements on semicolon and execute sequentially
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Applying ${statements.length} SQL statements...`);

    for (const [i, stmt] of statements.entries()) {
      try {
        await pool.query(stmt);
        console.log(`OK ${i + 1}/${statements.length}`);
      } catch (err) {
        console.error(`Failed statement ${i + 1}:`, err.message || err);
        throw err;
      }
    }

    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Schema apply failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
