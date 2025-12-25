# 🍊🟢 Fresh & Tasty — Newsletter Subscription
<div align="center">
  
Modern, responsive subscription landing page with an orange/green theme, served by an Express backend. Validates emails, captures interests and consent, and sends transactional emails via SMTP (Nodemailer).

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-black?logo=express&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-SMTP-0b5?logo=minutemailer&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
  
</div>

---

## 👀 Preview

<div align="center">
  <img src="https://github.com/MdSaifAli063/Newsletter-Subscription/blob/e76348d3a6a450384e628fc95cc06f8cf1a17537/Screenshot%202025-09-18%20013013.png" alt="Desktop preview" width="820" style="border-radius:12px; margin:8px;" />
  <br>
  <img src="https://github.com/MdSaifAli063/Newsletter-Subscription/blob/f7d895a4d89f809a7eea6c17fb31a7f18bae8178/Screenshot%202025-09-18%20013323.png" alt="Desktop preview" width="820" style="border-radius:12px; margin:8px;" />
</div>

---

## ✨ Features

- ✅ Responsive, accessible form (keyboard and screen reader friendly)
- 🎨 Orange/green theme with gradients, chips, toast notifications
- 🔎 Real‑time email validation with inline errors
- 🏷️ Interest selection (chips) + required consent checkbox
- 🔔 Loading state, success toast, and graceful error handling
- 🚀 Express API with rate limiting
- 📧 Nodemailer SMTP integration (Mailtrap-friendly)
- 🔐 Environment‑based config via dotenv

---

## 🧱 Tech Stack

- 💻 Frontend: HTML, CSS, Vanilla JS
- 🧭 Backend: Node.js (ESM), Express, CORS, express‑rate‑limit
- ✉️ Email: Nodemailer (SMTP)
- ⚙️ Config: dotenv

---
## 📁 Project Structure


project-root/ ├─ server/ │ ├─ .env # your secrets (not committed) │ ├─ package.json │ ├─ public/ # served statically at / │ │ ├─ index.html │ │ ├─ style.css │ │ └─ script.js │ └─ src/ │ ├─ server.js # Express app (ESM) │ └─ email.js # Nodemailer setup & email templates (ESM) ├─ .gitignore └─ README.md


---

## ⚡ Quick Start

1) Prerequisites
   
- Node.js 18+ (works with Node 24)
- SMTP provider (Mailtrap Sandbox recommended for dev)

2) Install
```bash
cd server npm install
```

3) Configure environment
   
Create server/.env:

Server
- PORT=3000

SMTP (Mailtrap Sandbox example)
- SMTP_HOST=smtp.mailtrap.io SMTP_PORT=2525 SMTP_SECURE=false SMTP_USER=YOUR_MAILTRAP_USER SMTP_PASS=YOUR_MAILTRAP_PASS

From identity
- FROM_EMAIL=no-reply@yourdomain.com FROM_NAME=Fresh & Tasty

Optional
- ADMIN_EMAIL=owner@yourdomain.com
- CORS_ORIGIN=http://localhost:5173 # only if frontend runs elsewhere
- SKIP_SMTP_VERIFY=true # skip transporter.verify() on boot
- DRY_RUN_EMAILS=true # simulate success without sending

4) Run
```bash
npm start
or
npm run dev
```

Open http://localhost:3000 to view the page.

---

## 🔌 API

Base URL: http://localhost:3000

- GET /health
  - 200: { "ok": true, "status": "healthy" }

- POST /api/subscribe
  - Request (application/json):
    - email: string (required)
    - interests: string[] (optional, up to 10)
    - consent: boolean (required, must be true)
  - Responses:
    - 200: { ok: true, message: "Subscribed" }
    - 400: { ok: false, error: "INVALID_EMAIL" | "CONSENT_REQUIRED" }
    - 500: { ok: false, error: "SERVER_ERROR" }

Example:

curl -X POST http://localhost:3000/api/subscribe
-H "Content-Type: application/json"
-d '{"email":"you@example.com","interests":["Vegan","Desserts"],"consent":true}'


---

## 🎨 Theming

Main colors are defined in server/public/style.css under :root:
- --orange, --green
- --bg, --card, --text, etc.

Change these CSS variables to tweak the look and feel. The UI is responsive and includes toast notifications, buttons, chips, and inputs styled for accessibility.

---

## 🛡️ Security & Reliability

- Rate limiting: express-rate-limit (30 req/min default)
- CORS: disabled by default when serving same-origin; enable via CORS_ORIGIN env if needed
- Validation: light server-side email validation and consent enforcement
- Secrets: .env not committed; use .env.example in Git

---

## 🧰 Scripts

Add these to server/package.json if not present:

{ "type": "module", "scripts": { "start": "node src/server.js", "dev": "nodemon --watch src --ext js src/server.js" } }

---

## 🧪 Dev Tips

- Skipping SMTP verify on boot:
  - server/.env -> SKIP_SMTP_VERIFY=true
- Dry-run emails (no outbound SMTP, useful for frontend testing):
  - server/.env -> DRY_RUN_EMAILS=true
  - The server responds with success without sending.

- Ensure env loads before email setup (ESM):
  - server/src/server.js loads dotenv first, then dynamically imports ./email.js:
    - const { sendWelcomeEmail, ... } = await import('./email.js');

---

## ❗ Troubleshooting

- ECONNREFUSED ::1:587
  - Cause: SMTP_* not loaded; Nodemailer defaulted to localhost:587.
  - Fix: set SMTP_HOST/PORT/etc in server/.env, restart. For Mailtrap use port 2525 with SMTP_SECURE=false.

- require is not defined in ES module scope
  - Cause: mixing CommonJS with ESM.
  - Fix: use import syntax everywhere and ensure server/package.json has "type": "module".

- verifyTransporter already declared
  - Cause: re-declaration in server.js while also importing from email.js.
  - Fix: only import and use the one from email.js.

- .env not loading
  - Ensure server/.env exists. In server/src/server.js, we load it explicitly from server/.env.
  - On startup, you should see logs echoing SMTP host/port.

---

## 🚀 Deployment

- Set environment variables in your hosting platform (no .env commit).
- Serve static files from server/public via Express (already configured).
- Ensure outbound SMTP is allowed by host (some platforms block port 25; use 2525/587/465 as supported by your SMTP provider).

---

## 📦 .gitignore

Place .gitignore at your Git repo root. Suggested entries:

node_modules/ 
.env .env.* !.env.example 
server/.env 
server/.env. !server/.env.example
dist/ build/ 
.cache/ 
.vite/ 
.DS_Store Thumbs.db 
.vscode/ 
.idea/


---

## 🧡 Credits

- UI inspired by modern dark themes with orange/green gradients
- Email delivery via Nodemailer
- Icons are emojis for portability

---

## 📜 License

MIT — do what you love, responsibly.
