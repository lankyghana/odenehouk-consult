import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const client = process.env.DB_CLIENT || 'sqlite'; // sqlite | postgres | mysql

// Utility to convert $1 style params to '?' for sqlite/mysql
function toQuestionMarks(text, params = []) {
  let sql = text;
  params.forEach((_, idx) => {
    const token = `$${idx + 1}`;
    sql = sql.replace(token, '?');
  });
  return sql;
}

async function createDriver() {
  if (client === 'postgres') {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return {
      query: (text, params) => pool.query(text, params),
      end: () => pool.end(),
    };
  }

  if (client === 'mysql') {
    const mysql = await import('mysql2/promise');
    const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 10 });
    return {
      query: async (text, params = []) => {
        const sql = toQuestionMarks(text, params);
        const [rows] = await pool.query(sql, params);
        return { rows };
      },
      end: () => pool.end(),
    };
  }

  // Default: SQLite using sql.js (pure JS, no native build)
  const initSqlJs = (await import('sql.js')).default;
  const SQL = await initSqlJs();
  const dbFile = process.env.DB_FILE || path.resolve('data/dev.sqlite');

  let db;
  if (fs.existsSync(dbFile)) {
    const fileBuffer = fs.readFileSync(dbFile);
    db = new SQL.Database(new Uint8Array(fileBuffer));
  } else {
    fs.mkdirSync(path.dirname(dbFile), { recursive: true });
    db = new SQL.Database();
  }

  const persist = () => {
    const data = db.export();
    fs.writeFileSync(dbFile, Buffer.from(data));
  };

  return {
    query: async (text, params = []) => {
      const sql = toQuestionMarks(text, params);
      const stmt = db.prepare(sql);
      stmt.bind(params);
      if (/^\s*select/i.test(sql)) {
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return { rows };
      }
      stmt.step();
      stmt.free();
      persist();
      return { rows: [] };
    },
    end: async () => {
      persist();
      db.close();
    },
  };
}

// Create driver once; export query-compatible object
const driverPromise = createDriver();

export default {
  async query(text, params) {
    const driver = await driverPromise;
    return driver.query(text, params);
  },
  async end() {
    const driver = await driverPromise;
    return driver.end();
  },
};
