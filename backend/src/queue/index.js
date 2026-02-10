import db from '../db.js';

const driver = process.env.QUEUE_DRIVER || 'database'; // database | redis | sqs

function notReady(name) {
  throw new Error(`${name} driver not configured. Set QUEUE_DRIVER and provide credentials.`);
}

export async function enqueueJob(queue, payload, delaySeconds = 0) {
  if (driver === 'database') {
    const now = Math.floor(Date.now() / 1000);
    const availableAt = now + delaySeconds;
    await db.query(
      `INSERT INTO queue_jobs (queue, payload, available_at, attempts, created_at) VALUES ($1, $2, $3, 0, $4)`,
      [queue, JSON.stringify(payload), availableAt, now]
    );
    return { queued: true };
  }
  if (driver === 'redis') return notReady('Redis');
  if (driver === 'sqs') return notReady('SQS');
  throw new Error(`Unsupported QUEUE_DRIVER: ${driver}`);
}

export async function reserveJob(queue) {
  if (driver === 'database') {
    const now = Math.floor(Date.now() / 1000);
    const select = `SELECT * FROM queue_jobs WHERE queue = $1 AND available_at <= $2 AND reserved_at IS NULL ORDER BY id LIMIT 1`;
    const result = await db.query(select, [queue, now]);
    const job = result.rows[0];
    if (!job) return null;
    await db.query(`UPDATE queue_jobs SET reserved_at = $1, attempts = attempts + 1 WHERE id = $2`, [now, job.id]);
    return job;
  }
  if (driver === 'redis') return notReady('Redis');
  if (driver === 'sqs') return notReady('SQS');
  throw new Error(`Unsupported QUEUE_DRIVER: ${driver}`);
}

export async function deleteJob(id) {
  if (driver === 'database') {
    await db.query(`DELETE FROM queue_jobs WHERE id = $1`, [id]);
    return;
  }
  if (driver === 'redis') return notReady('Redis');
  if (driver === 'sqs') return notReady('SQS');
  throw new Error(`Unsupported QUEUE_DRIVER: ${driver}`);
}

export async function releaseJob(id, delaySeconds = 30) {
  if (driver === 'database') {
    const availableAt = Math.floor(Date.now() / 1000) + delaySeconds;
    await db.query(`UPDATE queue_jobs SET reserved_at = NULL, available_at = $1 WHERE id = $2`, [availableAt, id]);
    return;
  }
  if (driver === 'redis') return notReady('Redis');
  if (driver === 'sqs') return notReady('SQS');
  throw new Error(`Unsupported QUEUE_DRIVER: ${driver}`);
}

export async function purgeQueue(queue) {
  if (driver === 'database') {
    await db.query(`DELETE FROM queue_jobs WHERE queue = $1`, [queue]);
    return;
  }
  if (driver === 'redis') return notReady('Redis');
  if (driver === 'sqs') return notReady('SQS');
  throw new Error(`Unsupported QUEUE_DRIVER: ${driver}`);
}
