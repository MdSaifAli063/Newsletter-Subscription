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

export async function verifyTransporter() {
  const host = process.env.SMTP_HOST || 'localhost';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
  const skip = String(process.env.SKIP_SMTP_VERIFY || '').toLowerCase() === 'true';
  const dryRun = String(process.env.DRY_RUN_EMAILS || '').toLowerCase() === 'true';

  if (skip || dryRun) {
    console.warn(`[SMTP] Verification skipped. Using ${host}:${port} secure=${secure}`);
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

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isDryRun() {
  return String(process.env.DRY_RUN_EMAILS || '').toLowerCase() === 'true';
}

function renderWelcomeHTML(subEmail, interests = []) {
  const orange = '#f5a524';
  const green = '#376f42';
  const tomato = '#df513c';
  const background = '#fff7eb';
  const panel = '#fffdf8';
  const text = '#162018';
  const dim = '#617062';

  const interestList = interests.length
    ? `<p style="margin:0 0 18px;color:${dim};">We'll send you more on: <strong style="color:${text};">${interests.map(escapeHTML).join(', ')}</strong></p>`
    : '';

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <title>Welcome to Fresh & Tasty</title>
    </head>
    <body style="margin:0;padding:0;background:${background};color:${text};font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:24px;">
        <div style="overflow:hidden;border:1px solid #eadfcf;border-radius:14px;background:${panel};">
          <div style="padding:28px 24px;background:linear-gradient(135deg, rgba(55,111,66,0.14), rgba(223,81,60,0.12), rgba(245,165,36,0.16));">
            <p style="margin:0 0 10px;color:${green};font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">Fresh & Tasty</p>
            <h1 style="margin:0;font-size:30px;line-height:1.1;color:${text};">Welcome aboard.</h1>
            <p style="margin:12px 0 0;color:${dim};">Thanks for subscribing, ${escapeHTML(subEmail)}.</p>
          </div>

          <div style="padding:24px;">
            <p style="margin:0 0 18px;color:${dim};line-height:1.6;">
              You'll start receiving weekly hand-picked recipes, practical kitchen tips, and seasonal menu ideas.
            </p>
            ${interestList}
            <a href="#" style="display:inline-block;text-decoration:none;font-weight:800;color:#fffaf1;padding:13px 18px;border-radius:8px;background:linear-gradient(135deg, ${green}, ${tomato} 58%, ${orange});">
              Browse featured recipes
            </a>
            <p style="margin:22px 0 0;font-size:13px;color:${dim};">
              You can unsubscribe anytime from the footer of our emails.
            </p>
          </div>

          <div style="padding:16px 24px;border-top:1px solid #eadfcf;color:${dim};font-size:12px;">
            &copy; ${new Date().getFullYear()} Fresh & Tasty &bull; You're receiving this email because you subscribed.
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

function renderWelcomeText(subEmail, interests = []) {
  const parts = [
    'Welcome aboard.',
    `Thanks for subscribing, ${subEmail}.`,
    "You'll start receiving weekly hand-picked recipes, practical kitchen tips, and seasonal menu ideas."
  ];

  if (interests.length) parts.push(`Your interests: ${interests.join(', ')}`);
  parts.push('You can unsubscribe anytime from the footer of our emails.');

  return parts.join('\n\n');
}

export async function sendWelcomeEmail(to, interests = []) {
  const fromName = FROM_NAME || 'Fresh & Tasty';
  const fromEmail = FROM_EMAIL || 'no-reply@example.com';

  if (isDryRun()) {
    console.log(`[Email dry run] Welcome email skipped for ${to}`);
    return;
  }

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Welcome to Fresh & Tasty',
    html: renderWelcomeHTML(to, interests),
    text: renderWelcomeText(to, interests)
  });
}

export async function sendAdminNotification(adminEmail, subscriberEmail, interests = []) {
  const fromName = FROM_NAME || 'Fresh & Tasty';
  const fromEmail = FROM_EMAIL || 'no-reply@example.com';

  if (isDryRun()) {
    console.log(`[Email dry run] Admin notification skipped for ${subscriberEmail}`);
    return;
  }

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: adminEmail,
    subject: 'New newsletter subscriber',
    text: `New subscriber: ${subscriberEmail}\nInterests: ${interests.join(', ') || 'N/A'}`,
    html: `<p><strong>New subscriber:</strong> ${escapeHTML(subscriberEmail)}</p>
           <p><strong>Interests:</strong> ${interests.length ? interests.map(escapeHTML).join(', ') : 'N/A'}</p>`
  });
}
