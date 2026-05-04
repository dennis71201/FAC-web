# FAC-web Server

Backend API for the FAC-web Facilities Management Platform.  
Built with Node.js + Express, connected to MSSQL Server, with OIDC-ready authentication.

---

## Prerequisites

- Node.js 18 or higher (22 recommended — `nvm use 22`)
- SQL Server Express (or higher) installed locally
- npm 9+

---

## Step 1 — Configure SQL Server (First-time Setup)

SQL Server Express ships with TCP/IP **disabled** by default. You need to enable it once before the server can connect.

### 1-A. Enable TCP/IP Protocol

1. Open **Start** → search for **SQL Server Configuration Manager** and open it
2. In the left panel, expand **SQL Server Network Configuration**
3. Click **Protocols for SQLEXPRESS** (or your instance name)
4. Right-click **TCP/IP** → click **Enable**
5. Double-click **TCP/IP** to open properties → go to the **IP Addresses** tab
6. Scroll to the bottom to **IPAll**:
   - Clear `TCP Dynamic Ports` (leave it blank)
   - Set `TCP Port` to **`1434`**
7. Click **OK**

### 1-B. Restart SQL Server Service

Still in SQL Server Configuration Manager:
1. Click **SQL Server Services** in the left panel
2. Right-click **SQL Server (SQLEXPRESS)** → click **Restart**

### 1-C. Start SQL Server Browser (Optional — only needed for named instance connections)

If you use `.\SQLEXPRESS` in your connection string instead of `localhost:1434`, the Browser service is required:

**Option A** — GUI: right-click **SQL Server Browser** → **Start**

**Option B** — PowerShell (run as Administrator):
```powershell
Start-Service SQLBrowser
Set-Service SQLBrowser -StartupType Automatic
```

> **Recommendation**: Use static port (`localhost:1434`) for local development. This avoids needing Browser service entirely.

### 1-D. Verify SQL Server is Listening

```powershell
netstat -ano | findstr ":1434"
```

You should see a line with `LISTENING`.

---

## Step 2 — Set Up Environment Variables

Copy the example file and fill in your credentials:

```powershell
cd server
Copy-Item .env.example .env
```

Open `.env` and update these values:

```env
# Database — use static port (recommended)
DB_SERVER=localhost
DB_PORT=1434
DB_NAME=MTB_FAC_OPS_WEB
DB_USER=sa
DB_PASSWORD=YourActualPassword

# JWT — change to a long random string in production
JWT_SECRET=change-this-to-a-long-random-secret

# App
NODE_ENV=development
PORT=3000

# Dev bypass — allows ?dev_employee_id=1 without OIDC token
AUTH_DEV_BYPASS=true
```

> **Never commit `.env`** — it is gitignored. Only `.env.example` is tracked.

---

## Step 3 — Install Dependencies

```powershell
cd server
npm install
```

---

## Step 4 — Start the Server

```powershell
npm run dev
```

Expected output on successful startup:

```
[STARTUP] Initializing database connection...
[DB] MSSQL connection pool initialized successfully (localhost:1434)
[STARTUP] Database connection successful
[OIDC] OIDC not configured. Dev bypass enabled — using dev fallback only.
[STARTUP] Server listening on port 3000
[STARTUP] Environment: development
```

---

## Step 5 — Verify with Health Check

```powershell
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "timestamp": "2026-04-25T...",
  "status": "healthy",
  "environment": "development",
  "components": {
    "app": "up",
    "database": "connected",
    "auth": {
      "oidcConfigured": false,
      "devBypassEnabled": true
    }
  },
  "message": "Database connection OK"
}
```

If `status` is `"degraded"` or `database` is `"disconnected"`, see the **Troubleshooting** section below.

---

## Dev Authentication

While OIDC is not yet configured, use the dev bypass to simulate a logged-in employee.

Add `?dev_employee_id=1` to any authenticated request, or call the dev login endpoint:

```
GET http://localhost:3000/api/auth/dev-login?dev_employee_id=1
```

This returns a JWT token you can use as `Authorization: Bearer <token>` for other API calls.

> The dev bypass is **blocked** when `NODE_ENV` is not `development` or `AUTH_DEV_BYPASS` is not `true`.

Recommended testing tool: **Thunder Client** (VS Code extension) — REST client built into VS Code.

---

## Folder Structure

```
server/
├── src/
│   ├── config/
│   │   ├── env.js          — env var parsing and validation
│   │   ├── db.js           — MSSQL connection pool
│   │   └── oidc.js         — OIDC configuration
│   ├── middleware/
│   │   └── auth.js         — token validation + dev bypass
│   ├── routes/
│   │   └── health.js       — health check endpoints
│   └── spec/               — specifications and design notes
├── app.js                  — Express app setup
├── server.js               — entry point
├── .env                    — local secrets (gitignored)
├── .env.example            — template (committed)
├── .gitignore
└── package.json
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server with `NODE_ENV=development` |
| `npm start` | Start server (reads `NODE_ENV` from `.env`) |

---

## Troubleshooting

### `Failed to connect to localhost:1433 — Could not connect`

TCP/IP is disabled or SQL Server is not listening on port 1433/1434.

1. Confirm TCP/IP is enabled (Step 1-A)
2. Confirm SQL Server service was restarted after enabling TCP/IP (Step 1-B)
3. Check the port with: `netstat -ano | findstr ":1434"`
4. Ensure `DB_PORT` in `.env` matches the port you configured

### `Missing required environment variables`

`.env` is missing or incomplete. Check all required vars are filled in (Step 2).

### `Login failed for user 'sa'`

- Confirm `DB_USER` / `DB_PASSWORD` are correct in `.env`
- Confirm SQL Server Authentication (mixed mode) is enabled:
  - SSMS → right-click server → Properties → Security → select **SQL Server and Windows Authentication mode** → restart service

### `NODE_ENV is not recognized`

Ensure `cross-env` is installed: `npm install`. The dev script uses `cross-env` for Windows compatibility.

### SQL Server Browser warnings

Only needed if using named instance format (`.\SQLEXPRESS`). With a static port (`localhost:1434`), Browser service is not required.
