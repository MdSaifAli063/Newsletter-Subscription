import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// __dirname polyfill for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server/.env explicitly (works regardless of CWD)
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// IMPORTANT: import email utilities AFTER env is loaded
const {
  sendWelcomeEmail,
  sendAdminNotification,
  verifyTransporter
} = await import('./email.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Only enable CORS if CORS_ORIGIN is set (not needed for same-origin)
const corsOrigin = process.env.CORS_ORIGIN || undefined;
if (corsOrigin) app.use(cors({ origin: corsOrigin }));

app.use(express.json({ limit: '64kb' }));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Serve static frontend from server/public
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Health
app.get('/health', (_req, res) => res.json({ ok: true, status: 'healthy' }));

// Light email validation
function isValidEmail(value) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return typeof value === 'string' && re.test(value.trim());
}

// API: Subscribe
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, interests = [], consent } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: 'INVALID_EMAIL' });
    }
    if (consent !== true) {
      return res.status(400).json({ ok: false, error: 'CONSENT_REQUIRED' });
    }

    const parsedInterests = Array.isArray(interests)
      ? interests.filter((v) => typeof v === 'string').slice(0, 10)
      : [];

    await sendWelcomeEmail(email, parsedInterests);

    if (process.env.ADMIN_EMAIL) {
      // Fire-and-forget admin notification
      sendAdminNotification(process.env.ADMIN_EMAIL, email, parsedInterests).catch(() => {});
    }

    return res.status(200).json({ ok: true, message: 'Subscribed' });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

// Root -> index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server after verifying SMTP (set SKIP_SMTP_VERIFY=true in .env to skip in dev)
verifyTransporter()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`Loaded env from: ${envPath}`);
      console.log(
        `SMTP host: ${process.env.SMTP_HOST || '(unset)'} port: ${process.env.SMTP_PORT || '(unset)'} secure: ${process.env.SMTP_SECURE || '(unset)'}`
      );
    });
  })
  .catch((err) => {
    console.error('SMTP verification failed:', err?.message || err);
    process.exit(1);
  });