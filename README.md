# LightSimulator

A 3D lighting and scene editor built in the browser. Add objects, lights, and products, manipulate them with move/rotate gizmos, switch between setup and camera views, and save your scenes to your own account.

## Features

- Three.js scene editor with Setup and Camera views
- Move (single-axis + plane), Rotate, and Scale via inspector
- Multi-step undo / redo (20-step history)
- Per-object lock to prevent accidental edits
- Duplicate selection with Ctrl+D
- Photography-focused Kelvin temperature picker for lights
- Right-click context menu (duplicate, lock, delete)
- Save/load scenes per user via REST API

## Technologies Used

**Frontend**
- React 19 — UI framework
- Three.js 0.182 — 3D graphics
- Vite 7 — build tool and dev server
- styled-components — component styling
- JavaScript (ES6+)

**Backend**
- Node.js + Express 5 — HTTP server
- Prisma — ORM
- SQLite — database (file-based, no install required)
- bcrypt — password hashing
- jsonwebtoken — auth tokens

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- npm (comes with Node.js)
- A modern web browser

That's it. No database server to install — Prisma uses SQLite, which is just a file on disk.

## Installation

The project has two parts: the frontend (project root) and the backend (`backend/` folder). Each has its own `package.json` and needs its own `npm install`.

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd LightSimulator
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
```

The `migrate dev` command creates `prisma/dev.db` (your local SQLite database) and the `users` / `scenes` tables inside it. You only run this once after cloning.

Open `.env` and change `JWT_SECRET` to any long random string.

### 3. Set up the frontend

From the project root (open a new terminal or `cd ..` back):

```bash
npm install
```

## Running the app

From the project root:

```bash
npm start
```

This starts both the backend (http://localhost:3001) and the frontend (http://localhost:5173) in a single terminal. Output from each is labeled `[backend]` and `[frontend]`. Press Ctrl+C once to stop both.

Open http://localhost:5173 in your browser, register an account, and start building scenes.

**Running servers separately** (useful when debugging one side):

```bash
npm run backend   # backend only
npm run dev       # frontend only
```

## Project Structure

```
LightSimulator/
├── backend/                       # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (User, Scene models)
│   │   └── migrations/            # Migration history (auto-generated)
│   ├── routes/
│   │   ├── auth.js                # Register & login endpoints
│   │   └── scenes.js              # Scene CRUD endpoints
│   ├── db.js                      # Prisma client setup
│   ├── server.js                  # Express app entry point
│   ├── .env.example               # Template for environment variables
│   └── package.json
├── public/
│   ├── models/                    # 3D model assets
│   └── textures/                  # Texture assets
├── src/
│   ├── components/                # UI components
│   │   ├── AddMenu.jsx
│   │   ├── Auth.jsx
│   │   ├── ContextMenu.jsx
│   │   ├── Filmstrip.jsx
│   │   ├── Header.jsx
│   │   ├── Help.jsx
│   │   ├── SaveLoadManager.jsx
│   │   ├── SelectionPanel.jsx
│   │   └── StatusBar.jsx
│   ├── scene/                     # Three.js scene logic
│   │   ├── objects/               # Geometries, lights, products, proxies
│   │   ├── gizmos/                # Move (axes + plane handles) and rotate gizmos
│   │   ├── SetupView.jsx          # Main editor view
│   │   ├── CameraView.jsx         # Camera preview
│   │   ├── sharedScene.js         # Shared Three.js scene state + undo history
│   │   ├── sceneConfig.js
│   │   └── renderLoop.js
│   ├── styles/                    # Theme and global CSS
│   ├── utils/                     # Math helpers
│   ├── api.js                     # Frontend API client
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Usage

1. **Register / log in.** Email and password (6+ characters).
2. **Add objects.** Use the Add menu to drop in geometries, lights, or product models.
3. **Select and transform.** Click an object to select it. Use the move and rotate gizmos to position it, or edit values directly in the selection panel.
   - **Single-axis drag:** click and drag the colored arrows.
   - **Two-axis drag:** click and drag the small colored squares between axes (XY, XZ, YZ planes).
4. **Duplicate, delete, lock.** Right-click any object for a context menu, or use keyboard shortcuts.
5. **Undo / redo.** Ctrl+Z to undo, Ctrl+Y (or Ctrl+Shift+Z) to redo. Up to 20 steps of history are kept.
6. **Set light color by temperature.** Lights use a Kelvin slider (1500K–12000K) instead of RGB. Preset buttons cover common photography values (Tungsten, Daylight, Overcast, etc.).
7. **Switch views.** Toggle between Setup view (full editor) and Camera view (final framed render).
8. **Save.** Open the Save/Load manager and save the current scene to your account. Saved scenes are listed by name and can be loaded back at any time.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `W` | Switch to Move tool |
| `E` | Switch to Rotate tool |
| `Delete` / `Backspace` | Delete selected object |
| `Ctrl+D` | Duplicate selected object |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Right-click` | Open context menu |

## Working with the database

The database is a single file at `backend/prisma/dev.db`. A few useful commands when working in `backend/`:

- `npx prisma studio` — opens a browser GUI to view and edit your data at http://localhost:5555. Handy for debugging.
- `npx prisma migrate dev --name <description>` — run after changing `schema.prisma` to update the database.
- `npx prisma migrate reset` — wipes the database and reapplies all migrations. Use when you want a clean slate.

## Switching to a different database

The project uses SQLite for zero-setup development, but Prisma supports PostgreSQL, MySQL, MSSQL, and others. To switch:

1. Edit `backend/prisma/schema.prisma` and change the `provider` in the `datasource db` block.
2. Update `DATABASE_URL` in `backend/.env` to the new connection string.
3. Run `npx prisma migrate dev` to apply migrations to the new database.

No application code changes needed.

## Notes

- `backend/.env` is gitignored and must never be committed — it contains your JWT secret.
- `backend/prisma/dev.db` is gitignored — each developer gets their own local database.
- The frontend talks to the backend at `http://localhost:3001/api` (hardcoded in `src/api.js`).