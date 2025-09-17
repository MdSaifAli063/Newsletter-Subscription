import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  FROM_NAME
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST || 'localhost',
  port: Number(SMTP_PORT || 587),
  secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
});

// Verify transporter with optional skip (dev)
export async function verifyTransporter() {
  const host = process.env.SMTP_HOST || 'localhost';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';

  const skip = String(process.env.SKIP_SMTP_VERIFY || '').toLowerCase() === 'true';
  if (skip) {
    console.warn(`[SMTP] Skipping transporter.verify() (SKIP_SMTP_VERIFY=true). Using ${host}:${port} secure=${secure}`);
    return;
  }

  try {
    await transporter.verify();
    console.log(`[SMTP] Verification successful: ${host}:${port} secure=${secure}`);
  } catch (err) {
    console.error(`[SMTP] Verification failed for ${host}:${port} secure=${secure}:`, err?.message || err);
    throw err;
  }
}

function escapeHTML(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderWelcomeHTML(subEmail, interests = []) {
  const orange = '#ff8a00';
  const green = '#22c55e';
  const grayBg = '#0b1220';
  const text = '#e5e7eb';
  const dim = '#94a3b8';

  const interestList = interests.length
    ? `<p style="margin: 0 0 16px; color:${dim}">We’ll send you more on: <strong>${interests.map(escapeHTML).join(', ')}</strong></p>`
    : '';

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <title>Welcome</title>
      <style>
        @media (prefers-color-scheme: dark) {
          body { background: ${grayBg} !important; color: ${text} !important; }
        }
        .btn:hover { filter: brightness(1.05) }
      </style>
    </head>
    <body style="margin:0; padding:0; background:${grayBg}; color:${text}; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
      <div style="max-width:640px; margin:0 auto; padding:24px;">
        <div style="border-radius:14px; overflow:hidden; border:1px solid #1f2937; background:#0a0f1a;">
          <div style="padding:20px 20px 8px; border-bottom:1px solid #1f2937; background:linear-gradient(135deg, rgba(255,138,0,0.18), rgba(34,197,94,0.18));">
            <span style="display:inline-block; padding:6px 10px; border-radius:999px; border:1px solid rgba(34,197,94,0.35); color:#b9fbc0; background:rgba(34,197,94,0.15); font-size:12px;">Fresh & Tasty</span>
            <h1 style="margin:10px 0 6px; font-size:22px;">Welcome aboard! 🎉</h1>
            <p style="margin:0; color:${dim};">Thanks for subscribing, ${escapeHTML(subEmail)}.</p>
          </div>

          <div style="padding:20px;">
            <p style="margin-top: 0; color:${dim}">
              You’ll start receiving weekly hand‑picked recipes, tips, and seasonal menus.
            </p>
            ${interestList}
            <a class="btn" href="#" style="display:inline-block; text-decoration:none; font-weight:800; letter-spacing:.3px; color:#0b1220; padding:12px 16px; border-radius:12px; background:linear-gradient(135deg, ${orange}, ${green}); box-shadow:0 8px 20px rgba(255,138,0,0.25), 0 8px 20px rgba(34,197,94,0.25);">
              Browse Featured Recipes
            </a>

            <p style="margin:22px 0 0; font-size:13px; color:${dim}">
              Not you? You can unsubscribe anytime from the footer of our emails.
            </p>
          </div>

          <div style="padding:16px 20px; border-top:1px solid #1f2937; color:${dim}; font-size:12px;">
            © ${new Date().getFullYear()} Fresh & Tasty • You’re receiving this email because you subscribed.
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

function renderWelcomeText(subEmail, interests = []) {
  const parts = [
    `Welcome aboard!`,
    `Thanks for subscribing, ${subEmail}.`,
    `You’ll start receiving weekly hand-picked recipes, tips, and seasonal menus.`
  ];
  if (interests.length) parts.push(`Your interests: ${interests.join(', ')}`);
  parts.push('Unsubscribe anytime via the link in our emails.');
  return parts.join('\n\n');
}

export async function sendWelcomeEmail(to, interests = []) {
  const fromName = FROM_NAME || 'Fresh & Tasty';
  const fromEmail = FROM_EMAIL || 'no-reply@example.com';

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Welcome to Fresh & Tasty!',
    html: renderWelcomeHTML(to, interests),
    text: renderWelcomeText(to, interests)
  });
}

export async function sendAdminNotification(adminEmail, subscriberEmail, interests = []) {
  const fromName = FROM_NAME || 'Fresh & Tasty';
  const fromEmail = FROM_EMAIL || 'no-reply@example.com';

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: adminEmail,
    subject: 'New newsletter subscriber',
    text: `New subscriber: ${subscriberEmail}\nInterests: ${interests.join(', ') || 'N/A'}`,
    html: `<p><strong>New subscriber:</strong> ${escapeHTML(subscriberEmail)}</p>
           <p><strong>Interests:</strong> ${interests.length ? interests.map(escapeHTML).join(', ') : 'N/A'}</p>`
  });
}