import pino from 'pino';

export function createLogger() {
  return pino({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    redact: ['req.headers.authorization', 'res.headers'],
  });
}
