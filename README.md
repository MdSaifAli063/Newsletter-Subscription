# 🍽️ Fresh & Tasty Newsletter Subscription

A polished, responsive newsletter subscription experience with a vanilla HTML/CSS/JS frontend and an Express + Nodemailer backend.

## ✨ Features

- 🖼️ Responsive split-layout landing page with a real food image, strong typography, and accessible controls
- ✅ Client-side email validation, consent gating, loading state, and toast feedback
- 🏷️ Interest chips sent with the subscription request
- 🚦 Express API with JSON parsing, static file serving, and rate limiting
- 📧 Nodemailer welcome emails and optional admin notifications
- 🧪 `DRY_RUN_EMAILS=true` mode for local UI/API testing without sending email


## 🧰 Tech Stack

- 🎨 Frontend: HTML, CSS, vanilla JavaScript
- ⚙️ Backend: Node.js, Express, express-rate-limit, CORS
- ✉️ Email: Nodemailer over SMTP
- 🔐 Config: dotenv


## 📁 Project Structure

```text
.
├── server
│   ├── public
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   └── src
│       ├── email.js
│       └── server.js
├── package.json
├── package-lock.json
└── README.md
```


## ⚡ Quick Start

1. 📦 Install dependencies:

```bash
npm install
```

2. 🔧 Create `server/.env`:

```env
PORT=3000
CORS_ORIGIN=

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_user
SMTP_PASS=your_password

FROM_EMAIL=no-reply@example.com
FROM_NAME=Fresh & Tasty

SKIP_SMTP_VERIFY=false
DRY_RUN_EMAILS=false
# ADMIN_EMAIL=owner@example.com
```

3. 🚀 Run the server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

Open `http://localhost:3000`.

## 🔌 API

### 🩺 `GET /health`

Returns:

```json
{ "ok": true, "status": "healthy" }
```

### 📝 `POST /api/subscribe`

Request body:

```json
{
  "email": "you@example.com",
  "interests": ["Quick Meals", "Desserts"],
  "consent": true
}
```

Responses:

- ✅ `200` `{ "ok": true, "message": "Subscribed" }`
- ⚠️ `400` `{ "ok": false, "error": "INVALID_EMAIL" }`
- ⚠️ `400` `{ "ok": false, "error": "CONSENT_REQUIRED" }`
- ❌ `500` `{ "ok": false, "error": "SERVER_ERROR" }`


## 🧪 Local Testing Without SMTP

Set these values in `server/.env`:

```env
SKIP_SMTP_VERIFY=true
DRY_RUN_EMAILS=true
```

The API will accept valid subscriptions and log that emails were skipped instead of sending them.


## 🛠️ Useful Scripts

```bash
npm start
npm run dev
npm run check
```

`npm run check` validates JavaScript syntax for the server, email module, and frontend script.
