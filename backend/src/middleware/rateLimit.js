import rateLimit from 'express-rate-limit';

const general = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // general requests per IP
  standardHeaders: true,
  legacyHeaders: false,
});

const auth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strict = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many requests, slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export default { general, auth, strict };
