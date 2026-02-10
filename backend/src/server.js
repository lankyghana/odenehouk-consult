import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createLogger } from './middleware/logger.js';
import rateLimitMiddleware from './middleware/rateLimit.js';
import { validateEnv } from './config.js';

// Validate required environment variables and fail fast
validateEnv();

const app = express();

// Security headers
app.use(helmet());

// CORS - restricted to frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: FRONTEND_URL || false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Cookie parser (needed for refresh tokens)
app.use(cookieParser());

// Mount webhook raw handler BEFORE json body parsing to preserve signature
import stripeWebhookHandler from './routes/webhooks.js';
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// Body parser for normal routes
app.use(express.json());

// Logging - dev only uses morgan; production uses structured logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  const logger = createLogger();
  app.use((req, res, next) => {
    req.log = logger;
    next();
  });
}

// Rate limiting middleware (applies sensible defaults)
app.use(rateLimitMiddleware.general);

import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import subscriptionsRouter from './routes/subscriptions.js';
import accessRouter from './routes/access.js';
import checkoutRouter from './routes/checkout.js';
import paymentsRouter from './routes/payments.js';

app.use('/api/products', productsRouter);
app.use('/api/auth', rateLimitMiddleware.auth, authRouter);
app.use('/api/orders', rateLimitMiddleware.auth, ordersRouter);
app.use('/api/subscriptions', rateLimitMiddleware.auth, subscriptionsRouter);
app.use('/api/access', accessRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/payments', paymentsRouter);

// Root and health
app.get('/', (req, res) => res.json({ message: 'Odenehouk API Root' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Startup smoke test endpoint
app.get('/api/_startup_check', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(JSON.stringify({ msg: 'Server running', port: PORT }));
});
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createLogger } from './middleware/logger.js';
import rateLimitMiddleware from './middleware/rateLimit.js';
import { validateEnv } from './config.js';

// Validate required environment variables and fail fast
validateEnv();

const app = express();

// Security headers
app.use(helmet());

// CORS - restricted to frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: FRONTEND_URL || false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// Cookie parser (needed for refresh tokens)
app.use(cookieParser());

// Mount webhook raw handler BEFORE json body parsing to preserve signature
import stripeWebhookHandler from './routes/webhooks.js';
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// Body parser for normal routes
app.use(express.json());

// Logging - dev only uses morgan; production uses structured logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  const logger = createLogger();
  app.use((req, res, next) => {
    req.log = logger;
    next();
  });
}

// Rate limiting middleware (applies sensible defaults)
app.use(rateLimitMiddleware.general);

import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import subscriptionsRouter from './routes/subscriptions.js';
import accessRouter from './routes/access.js';
import checkoutRouter from './routes/checkout.js';
import webhooksRouter from './routes/webhooks.js';

app.use('/api/products', productsRouter);
app.use('/api/auth', rateLimitMiddleware.auth, authRouter);
app.use('/api/orders', rateLimitMiddleware.auth, ordersRouter);
app.use('/api/subscriptions', rateLimitMiddleware.auth, subscriptionsRouter);
app.use('/api/access', accessRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhooks', webhooksRouter);

// Root and health
app.get('/', (req, res) => res.json({ message: 'Odenehouk API Root' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Startup smoke test endpoint
app.get('/api/_startup_check', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(JSON.stringify({ msg: 'Server running', port: PORT }));
});
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createLogger } from './middleware/logger.js';
import rateLimitMiddleware from './middleware/rateLimit.js';
import { validateEnv } from './config.js';

// Validate required environment variables and fail fast
validateEnv();

const app = express();

// Security headers
app.use(helmet());

// CORS - restricted to frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: FRONTEND_URL || false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json());
app.use(cookieParser());

// Logging - dev only uses morgan; production uses structured logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  const logger = createLogger();
  app.use((req, res, next) => {
    req.log = logger;
    next();
  });
}

// Rate limiting middleware (applies sensible defaults)
app.use(rateLimitMiddleware.general);

import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import subscriptionsRouter from './routes/subscriptions.js';
import accessRouter from './routes/access.js';
import checkoutRouter from './routes/checkout.js';
import webhooksRouter from './routes/webhooks.js';

app.use('/api/products', productsRouter);
app.use('/api/auth', rateLimitMiddleware.auth, authRouter);
app.use('/api/orders', rateLimitMiddleware.auth, ordersRouter);
app.use('/api/subscriptions', rateLimitMiddleware.auth, subscriptionsRouter);
app.use('/api/access', accessRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhooks', webhooksRouter);

// Root and health
app.get('/', (req, res) => res.json({ message: 'Odenehouk API Root' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Startup smoke test endpoint
app.get('/api/_startup_check', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(JSON.stringify({ msg: 'Server running', port: PORT }));
});
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createLogger } from './middleware/logger.js';
import rateLimitMiddleware from './middleware/rateLimit.js';
import { validateEnv } from './config.js';

// Validate required environment variables and fail fast
validateEnv();

const app = express();

// Security headers
app.use(helmet());

// CORS - restricted to frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: FRONTEND_URL || false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json());
app.use(cookieParser());

// Logging - dev only uses morgan; production uses structured logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  const logger = createLogger();
  app.use((req, res, next) => {
    req.log = logger;
    next();
  });
}

// Rate limiting middleware (applies sensible defaults)
app.use(rateLimitMiddleware.general);

import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import subscriptionsRouter from './routes/subscriptions.js';
import accessRouter from './routes/access.js';
import checkoutRouter from './routes/checkout.js';
import webhooksRouter from './routes/webhooks.js';

app.use('/api/products', productsRouter);
import rateLimit from './middleware/rateLimit.js';
app.use('/api/auth', rateLimit.auth, authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/access', accessRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhooks', webhooksRouter);

// Root and health
app.get('/', (req, res) => res.json({ message: 'Odenehouk API Root' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Startup smoke test endpoint
app.get('/api/_startup_check', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(JSON.stringify({ msg: 'Server running', port: PORT }));
});
import accessRouter from './routes/access.js';
app.use('/api/access', accessRouter);
import subscriptionsRouter from './routes/subscriptions.js';
app.use('/api/subscriptions', subscriptionsRouter);
import ordersRouter from './routes/orders.js';
app.use('/api/orders', ordersRouter);
import authRouter from './routes/auth.js';
app.use('/api/auth', authRouter);
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

app.use(morgan('dev'));

import productsRouter from './routes/products.js';
app.use('/api/products', productsRouter);

// Root route for GET /
app.get('/', (req, res) => {
  res.json({ message: 'Odenehouk API Root' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
