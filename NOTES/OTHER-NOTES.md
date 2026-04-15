# Other Notes

Backend, database, tooling, design patterns, and struggles encountered during the project.

## Table of Contents

1. [Vite (Build Tool)](#vite)
2. [Hot Module Replacement (HMR)](#hot-module-replacement)
3. [Node.js + Express Backend](#nodejs--express-backend)
4. [REST API Design](#rest-api-design)
5. [Middleware](#middleware)
6. [CORS](#cors)
7. [Environment Variables (dotenv)](#environment-variables)
8. [SQL Server + mssql Package](#sql-server--mssql-package)
9. [Database Schema](#database-schema)
10. [Parameterized Queries](#parameterized-queries)
11. [Connection Pooling](#connection-pooling)
12. [Password Hashing (bcrypt)](#password-hashing-bcrypt)
13. [JWT Authentication](#jwt-authentication)
14. [The Full Auth Flow](#the-full-auth-flow)
15. [Singleton Pattern (sharedScene)](#singleton-pattern)
16. [Observer/Listener Pattern](#observerlistener-pattern)
17. [Struggles and Fixes](#struggles-and-fixes)

---

## Vite

Vite is the build tool / dev server for the frontend. It replaces older tools like Webpack.

- `npm run dev` starts a dev server with instant hot reload
- `npm run build` creates optimized production files
- Understands ES Modules natively (no bundling needed during development)
- Much faster than Webpack because it doesn't bundle during dev — it serves files directly

```javascript
// vite.config.js would go here but I'm using the defaults
// @vitejs/plugin-react handles JSX transformation
```

Source: https://vite.dev/guide/

---

## Hot Module Replacement

HMR = when you save a file, only that module gets replaced in the browser without a full page reload. This is critical for 3D development because you don't want to lose your scene state every time you tweak code.

**Struggle:** HMR was breaking my singleton. When `sharedScene.js` got hot-replaced, the old `sharedInstance` variable was gone but the old scene objects were still in memory. The new module would create a fresh scene, but the old renderers were still referencing the old one.

**Fix:** Use `import.meta.hot.dispose()` to reset the singleton when the module is replaced:

```javascript
if (import.meta.hot) {
  import.meta.hot.dispose(() => { sharedInstance = null; });
}
```

This tells Vite: "when you replace this module, run this cleanup first." Now the next call to `createSharedScene()` creates a fresh instance.

Source: https://vite.dev/guide/features.html#hot-module-replacement

---

## Node.js + Express Backend

**Node.js** = JavaScript runtime for the server (instead of the browser).  
**Express** = Web framework that handles HTTP requests/routing.

```javascript
const express = require('express');
const app = express();

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/scenes', sceneRoutes);

// Start server
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
```

### Router pattern:
Each route file creates a `Router` and exports it:
```javascript
const router = express.Router();

router.post('/register', async (req, res) => { ... });
router.post('/login', async (req, res) => { ... });

module.exports = router;
```

---

## REST API Design

REST = using HTTP methods (GET, POST, PUT, DELETE) on URL paths to manage resources.

My API endpoints:

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/auth/register | Create new user |
| POST | /api/auth/login | Log in, get token |
| GET | /api/scenes | List user's scenes |
| GET | /api/scenes/:id | Get one scene |
| POST | /api/scenes | Save new scene |
| PUT | /api/scenes/:id | Update a scene |
| DELETE | /api/scenes/:id | Delete a scene |

Status codes I use:
- `200` — OK (successful GET/PUT/DELETE)
- `201` — Created (successful POST)
- `400` — Bad Request (validation failed)
- `401` — Unauthorized (no token / invalid token)
- `404` — Not Found
- `500` — Server Error

---

## Middleware

A function that runs BEFORE the route handler. Can modify `req`/`res` or block the request.

```javascript
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];  // "Bearer <token>" → "<token>"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user info to request
    next();              // Continue to the route handler
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Use it on protected routes
router.get('/', auth, async (req, res) => {
  // req.user is available here because the middleware set it
  const userId = req.user.id;
});
```

`next()` is the key — without calling it, the request hangs forever.

---

## CORS

Cross-Origin Resource Sharing. Browsers block requests from one domain to another by default (security feature). My frontend runs on `localhost:5173` (Vite) and backend on `localhost:3001` (Express) — different ports = different origins.

```javascript
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173' }));
```

This tells the backend: "allow requests from the Vite dev server."

---

## Environment Variables

Sensitive data (passwords, secrets) goes in a `.env` file, not in code:

```
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=LightSimulator
DB_USER=lightuser
DB_PASSWORD=LightSim2026!
JWT_SECRET=studio-sim-secret-key-change-this-later
PORT=3001
```

```javascript
require('dotenv').config();  // Load .env file into process.env

const server = process.env.DB_SERVER;  // "localhost"
```

> The `.env` file should be in `.gitignore` so it's never committed to version control.

---

## SQL Server + mssql Package

`mssql` is the Node.js package for connecting to Microsoft SQL Server. It uses the `tedious` driver underneath.

### Connection configuration:
```javascript
const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,              // Not using SSL locally
    trustServerCertificate: true, // Skip cert validation for local dev
  },
};
```

**Struggle:** Getting the backend to connect to SQL Server was mostly configuration, not code:
1. **TCP/IP was disabled by default** — Had to enable it in SQL Server Configuration Manager under Network Configuration
2. **Windows Authentication doesn't work with Node.js** — Had to create a dedicated SQL Server login (`lightuser`) with SQL Authentication mode
3. **Port wasn't set** — Had to explicitly set port 1433 in SQL Server Configuration
4. Each fix revealed the next problem, and the error messages were misleading

Source: https://www.npmjs.com/package/mssql  
Source: https://learn.microsoft.com/en-us/sql/sql-server/?view=sql-server-ver17

---

## Database Schema

### Users table:
```sql
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  email NVARCHAR(255) NOT NULL UNIQUE,
  password NVARCHAR(255) NOT NULL,    -- Stores bcrypt hash, not plaintext
  created_at DATETIME DEFAULT GETDATE()
);
```

### Scenes table:
```sql
CREATE TABLE scenes (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
  name NVARCHAR(255) NOT NULL,
  scene_data NVARCHAR(MAX) NOT NULL,  -- JSON string of all scene objects
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);
```

Key design decisions:
- `IDENTITY(1,1)` = auto-incrementing ID (like `AUTO_INCREMENT` in MySQL)
- `NVARCHAR` = Unicode strings (supports all characters)
- `NVARCHAR(MAX)` = up to 2GB of text, used for scene JSON data
- Foreign key ensures every scene belongs to a valid user
- `UNIQUE` constraint on email prevents duplicate accounts

---

## Parameterized Queries

**Never concatenate user input into SQL strings** — it opens you to SQL injection attacks.

```javascript
// ❌ DANGEROUS (SQL injection)
pool.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ SAFE (parameterized)
pool.request()
  .input('email', sql.NVarChar, email)
  .query('SELECT id FROM users WHERE email = @email');
```

The `@email` placeholder gets safely escaped by the mssql driver. The `.input()` method also enforces the data type (`sql.NVarChar`, `sql.Int`, etc.).

---

## Connection Pooling

```javascript
let pool = null;

const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('Connected to SQL Server');
  }
  return pool;
};
```

A connection pool reuses database connections instead of opening a new one for every request. `getPool()` creates the pool on first call and returns the existing one after that. This is a singleton pattern.

---

## Password Hashing (bcrypt)

Never store passwords as plaintext. bcrypt hashes them with a salt (random data) so even identical passwords produce different hashes.

```javascript
// Register - hash the password before storing
const hashedPassword = await bcrypt.hash(password, 10);
// 10 = salt rounds (how many times to process, higher = slower but more secure)

// Login - compare plaintext input to stored hash
const match = await bcrypt.compare(password, user.password);
if (!match) return res.status(401).json({ error: 'Invalid email or password' });
```

bcrypt is intentionally slow to make brute-force attacks impractical.

Source: https://www.npmjs.com/package/bcrypt

---

## JWT Authentication

JWT (JSON Web Token) is how the frontend proves the user is logged in. It's a **stateless** approach — the server doesn't store sessions.

### How it works:
```
1. User logs in with email + password
2. Server verifies credentials
3. Server creates a JWT containing { id, email } signed with a secret key
4. Server sends token to frontend
5. Frontend stores token in localStorage
6. Frontend sends token in every subsequent request via Authorization header
7. Server verifies the token's signature on every protected route
```

### Creating a token:
```javascript
const token = jwt.sign(
  { id: user.id, email: user.email },  // Payload (data stored in the token)
  process.env.JWT_SECRET,               // Secret key for signing
  { expiresIn: '7d' }                   // Token expires after 7 days
);
```

### Verifying a token:
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// decoded = { id: 1, email: "user@example.com", iat: ..., exp: ... }
```

### Frontend sends it with every request:
```javascript
// api.js
const request = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};
```

> Without JWT, anyone could call the API directly and access other people's scenes. The middleware checks the token before doing anything.

Source: https://www.npmjs.com/package/jsonwebtoken

---

## The Full Auth Flow

```
REGISTER:
[Frontend]                          [Backend]                         [Database]
Enter email + password    →
Validate format (regex)   →
POST /api/auth/register   →  Check if email exists        →  SELECT from users
                              Hash password (bcrypt)
                              Insert user                  →  INSERT into users
                              Create JWT
                          ←  Return { token, user }
Store token in localStorage
Show main app

LOGIN:
POST /api/auth/login      →  Find user by email           →  SELECT from users
                              Compare password (bcrypt)
                              Create JWT
                          ←  Return { token, user }
Store token in localStorage

PROTECTED REQUEST:
GET /api/scenes           →  Middleware extracts token
Authorization: Bearer xxx     jwt.verify(token, secret)
                              If valid → req.user = decoded
                              If invalid → 401 Unauthorized
                              Query scenes for this user   →  SELECT WHERE user_id = @userId
                          ←  Return scenes
```

---

## Singleton Pattern

The shared scene is a singleton: only one instance exists, and every component gets the same one.

```javascript
let sharedInstance = null;

export const createSharedScene = () => {
  if (sharedInstance) return sharedInstance;  // Return existing

  // First call: create everything
  const scene = new THREE.Scene();
  const elementMeshes = {};
  
  sharedInstance = { scene, elementMeshes };
  return sharedInstance;
};
```

**Why I needed this:** In C++ I would just pass a pointer. But JavaScript doesn't have pointers. When CameraView and SetupView both call `createSharedScene()`, they need to get the exact same scene object so changes in one view show up in the other. The singleton guarantees this.

**Cleanup:**
```javascript
export const destroySharedScene = () => {
  if (sharedInstance) {
    sharedInstance.scene.traverse((obj) => { /* dispose geometries + materials */ });
    sharedInstance = null;
  }
  // Reset all counters
  resetLightCounter();
  resetProductCounter();
  resetCycloramaCounter();
  sceneState.elements = {};
  sceneState.selected = null;
  listeners.clear();
};
```

---

## Observer/Listener Pattern

When any value changes in the scene (position, color, intensity, etc.), all views need to know about it. I built a manual listener system:

```javascript
const listeners = new Set();

// Register a callback
export const onSceneChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);  // Returns unsubscribe function
};

// Notify all listeners
const notify = () => listeners.forEach(fn => fn());
```

Usage in CameraView:
```javascript
const unsub = onSceneChange(() => {
  // Update camera position from sceneState
  camera.position.set(sceneState.camera.x, sceneState.camera.y, sceneState.camera.z);
});

// Cleanup
return () => { unsub(); };
```

Every `updateElement()` and `updateCamera()` call ends with `notify()`, so both views stay in sync.

---

## Struggles and Fixes

### 1. SQL Server TCP/IP Disabled
**Problem:** Backend couldn't connect to SQL Server. Got connection refused errors.  
**Cause:** SQL Server has TCP/IP disabled by default. It only accepts named pipe connections which Node.js doesn't support.  
**Fix:** Opened SQL Server Configuration Manager → SQL Server Network Configuration → Protocols → Enabled TCP/IP → Restarted SQL Server service.

### 2. Windows Authentication Doesn't Work with Node.js
**Problem:** Tried connecting with Windows Auth (trusted connection) but the mssql package kept failing.  
**Cause:** The tedious driver (used by mssql) doesn't support Windows Authentication properly.  
**Fix:** Created a dedicated SQL login in SSMS with SQL Server Authentication mode:
- Enabled "SQL Server and Windows Authentication mode" in server properties
- Created login `lightuser` with a password
- Mapped it to the LightSimulator database

### 3. Gizmo Arrows Hidden Behind Objects
**Problem:** After adding new elements through the Add menu, the move/rotate gizmo arrows rendered behind the newly added cubes. Looked like a layer issue.  
**Cause:** Three.js draws objects in scene addition order. The depth buffer was letting newer objects occlude the gizmo.  
**Fix:** Set `renderOrder: 999` and `depthTest: false` + `depthWrite: false` on all gizmo materials. This forces gizmos to draw last and ignore the depth buffer entirely.

### 4. Mouse Drag Not Translating to Correct Object Movement
**Problem:** Objects would move too fast or too slow depending on the camera angle and zoom level when dragging with the gizmo.  
**Cause:** I was using raw pixel delta directly as world units. But the relationship between screen pixels and world units changes depending on how far the camera is and what angle it's at.  
**Fix:** Project the axis direction from world space to screen space, measure how many pixels one world unit covers on screen, then use that as the conversion factor. This makes drag speed feel consistent regardless of camera position.

### 5. RectAreaLight Silently Not Working
**Problem:** Added an area light but it emitted no light at all. No error message.  
**Cause:** `RectAreaLight` requires `RectAreaLightUniformsLib.init()` to be called first. Without it, the shader uniforms aren't set up and the light just doesn't work.  
**Fix:** Call `RectAreaLightUniformsLib.init()` before creating any RectAreaLight. I wrapped it with a flag so it only runs once.

### 6. HMR Breaking the Singleton
**Problem:** During development, saving `sharedScene.js` would break the dual view. One view would show the scene, the other would be blank.  
**Cause:** Hot Module Replacement replaces the module but the old renderers still reference the old scene instance. The new module creates `sharedInstance = null` but one renderer already has a reference to the old scene.  
**Fix:** `import.meta.hot.dispose(() => { sharedInstance = null; })` — tells Vite to clean up before replacing.

### 7. Every Orbit Drag Registering as a Click
**Problem:** Every time I orbited the camera, it would also select/deselect objects.  
**Cause:** Both orbit and click use the same pointer events. Without distinguishing them, a pointerup after an orbit drag counts as a click.  
**Fix:** Track `pointerdown` position and compare to `pointerup` position. If the distance is more than 4 pixels, it was a drag, not a click.

### 8. window.resize Not Catching Panel Resize
**Problem:** When dragging the divider to resize panels, the Three.js canvases didn't update their size.  
**Cause:** `window.addEventListener('resize')` only fires when the browser window resizes, not when an internal div changes size.  
**Fix:** Used `ResizeObserver` which watches the actual container element and fires whenever its dimensions change, regardless of the reason.

Source: https://expressjs.com/  
Source: https://vite.dev/guide/