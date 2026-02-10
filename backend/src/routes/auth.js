import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

// Simple in-memory failed attempts tracker (note: for multi-instance use a shared store)
const failedAttempts = new Map();
const LOCK_THRESHOLD = 6; // lock after 6 failed attempts
const LOCK_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function recordFailed(email) {
  const now = Date.now();
  const info = failedAttempts.get(email) || { count: 0, first: now };
  info.count += 1;
  if (now - info.first > LOCK_WINDOW_MS) {
    info.count = 1;
    info.first = now;
  }
  failedAttempts.set(email, info);
}

function isLocked(email) {
  const info = failedAttempts.get(email);
  if (!info) return false;
  if (info.count >= LOCK_THRESHOLD && (Date.now() - info.first) < LOCK_WINDOW_MS) return true;
  return false;
}

function clearFailed(email) {
  failedAttempts.delete(email);
}

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (uuid, name, email, password, role, status, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, 'customer', 'active', NOW(), NOW()) RETURNING id, uuid, name, email, role`,
      [name, email.toLowerCase(), hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required' });
  if (isLocked(email)) return res.status(429).json({ error: 'Too many failed attempts, try again later' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (!result.rows.length) {
      recordFailed(email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      recordFailed(email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // success - clear failed attempts
    clearFailed(email);

    // short-lived access token
    const accessToken = jwt.sign({ id: user.id, uuid: user.uuid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // create refresh token and store hashed
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await pool.query('INSERT INTO refresh_tokens (user_id, token_hash, revoked, expires_at, created_at) VALUES ($1,$2,false,$3,NOW())', [user.id, tokenHash, expiresAt]);

    // set refresh token as HttpOnly secure cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/api/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: { id: user.id, uuid: user.uuid, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login failed', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh endpoint - issues new access token and rotates refresh token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies['refresh_token'];
    // If there's no refresh token treat as no active session (204 No Content)
    if (!token) return res.status(204).end();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const rows = await pool.query('SELECT * FROM refresh_tokens WHERE token_hash = $1 LIMIT 1', [tokenHash]);
    // Invalid or missing token -> no active session
    if (!rows.rows.length) return res.status(204).end();
    const rec = rows.rows[0];
    if (rec.revoked) return res.status(204).end();
    if (new Date(rec.expires_at) < new Date()) return res.status(204).end();

    // rotate
    await pool.query('UPDATE refresh_tokens SET revoked = true WHERE id = $1', [rec.id]);
    const newToken = crypto.randomBytes(64).toString('hex');
    const newHash = crypto.createHash('sha256').update(newToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query('INSERT INTO refresh_tokens (user_id, token_hash, revoked, expires_at, created_at) VALUES ($1,$2,false,$3,NOW())', [rec.user_id, newHash, expiresAt]);

    // issue new access token
    const userRow = await pool.query('SELECT id, uuid, name, email, role FROM users WHERE id = $1 LIMIT 1', [rec.user_id]);
    if (!userRow.rows.length) return res.status(204).end();
    const user = userRow.rows[0];
    const accessToken = jwt.sign({ id: user.id, uuid: user.uuid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // set rotated refresh token cookie
    res.cookie('refresh_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/api/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: { id: user.id, uuid: user.uuid, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Refresh failed', err);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

// Logout - revoke provided refresh token
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies['refresh_token'];
    if (!token) return res.status(204).end();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await pool.query('UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1', [tokenHash]);
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Logout failed', err);
    res.status(500).end();
  }
});

export default router;
