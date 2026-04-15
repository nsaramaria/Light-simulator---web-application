# Database Notes

SQL Server concepts learned during the Light Simulator project.

## Table of Contents

1. [SQL Server Setup](#sql-server-setup)
2. [SQL Server Configuration Manager](#sql-server-configuration-manager)
3. [SSMS (SQL Server Management Studio)](#ssms)
4. [Authentication Modes](#authentication-modes)
5. [Creating a Database and Tables](#creating-a-database-and-tables)
6. [Data Types Used](#data-types-used)
7. [Constraints](#constraints)
8. [IDENTITY (Auto-Increment)](#identity)
9. [DEFAULT Values](#default-values)
10. [Foreign Keys](#foreign-keys)
11. [CRUD Operations (from the backend)](#crud-operations)
12. [OUTPUT Clause](#output-clause)
13. [Connecting from Node.js](#connecting-from-nodejs)

---

## SQL Server Setup

SQL Server Express is the free edition of Microsoft's database. It runs as a Windows service in the background.

Instance name: `SQLEXPRESS`  
Full server address: `localhost\SQLEXPRESS`  
Version: SQL Server 17.0.1000

---

## SQL Server Configuration Manager

This is where you manage SQL Server services and network settings. Found by searching "SQL Server Configuration Manager" in Windows.

Three services:
- **SQL Server (SQLEXPRESS)** — The actual database engine (must be Running)
- **SQL Server Agent** — Runs scheduled tasks (not needed for this project)
- **SQL Server Browser** — Helps find SQL Server instances on the network (not needed locally)

### Network Configuration:
Under "SQL Server Network Configuration" → "Protocols for SQLEXPRESS":
- **TCP/IP** must be **Enabled** (was disabled by default!)
- Port must be set to **1433** under TCP/IP Properties → IP Addresses → IPAll

> After changing network settings, you must restart the SQL Server service for changes to take effect.

---

## SSMS

SQL Server Management Studio is the GUI tool for managing databases. Not the same as SQL Server itself — SSMS is just a client that connects to the server.

Connect with:
- Server: `localhost\SQLEXPRESS`
- Authentication: SQL Server Authentication
- Login: `lightuser`
- Password: (from .env file)

Useful features:
- Object Explorer to browse databases, tables, etc.
- Right-click table → "Script Table as" → "CREATE TO" to get the CREATE TABLE statement
- Query window to run SQL manually

---

## Authentication Modes

SQL Server has two authentication modes:

1. **Windows Authentication** — Uses your Windows login. Default. Doesn't work with Node.js mssql package.
2. **SQL Server Authentication** — Username + password pair created in SQL Server. This is what I use.

To enable SQL Auth:
1. In SSMS, right-click server → Properties → Security
2. Change to "SQL Server and Windows Authentication mode"
3. Restart SQL Server
4. Create a login: Security → Logins → New Login → SQL Server authentication

---

## Creating a Database and Tables

```sql
-- Create the database
CREATE DATABASE LightSimulator;
GO

USE LightSimulator;
GO

-- Users table
CREATE TABLE users (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  email NVARCHAR(255) NOT NULL UNIQUE,
  password NVARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT GETDATE()
);

-- Scenes table
CREATE TABLE scenes (
  id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  name NVARCHAR(255) NOT NULL,
  scene_data NVARCHAR(MAX) NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Data Types Used

| Type | Description | Used For |
|------|-------------|----------|
| `INT` | Integer number | IDs, user_id foreign key |
| `NVARCHAR(255)` | Unicode string up to 255 chars | Email, password hash, scene name |
| `NVARCHAR(MAX)` | Unicode string up to ~2GB | Scene JSON data |
| `DATETIME` | Date and time | created_at, updated_at timestamps |

Why `NVARCHAR` and not `VARCHAR`:
- `NVARCHAR` = Unicode (supports all languages and special characters)
- `VARCHAR` = ASCII only
- The N stands for "National" (Unicode standard)

---

## Constraints

### PRIMARY KEY
Uniquely identifies each row. Cannot be NULL, cannot duplicate.
```sql
id INT IDENTITY(1,1) NOT NULL PRIMARY KEY
```

### UNIQUE
No two rows can have the same value in this column.
```sql
email NVARCHAR(255) NOT NULL UNIQUE
```
This prevents duplicate email registrations at the database level (the backend also checks before inserting, but the constraint is a safety net).

### NOT NULL
Column must have a value, cannot be empty.

### FOREIGN KEY
Links one table to another. Ensures referential integrity.
```sql
FOREIGN KEY (user_id) REFERENCES users(id)
```
This means every `user_id` in the scenes table must exist in the users table. You can't create a scene for a non-existent user.

---

## IDENTITY

Auto-incrementing column. SQL Server automatically assigns the next number.

```sql
id INT IDENTITY(1,1)
--               ↑ ↑
--        start=1  increment=1
-- First row: id=1, second: id=2, etc.
```

You never manually set an IDENTITY column — SQL Server handles it.

---

## DEFAULT Values

Automatically fill a column if no value is provided:

```sql
created_at DATETIME DEFAULT GETDATE()
```

`GETDATE()` returns the current date and time. So every new row gets a timestamp without the code needing to set it.

For `updated_at`, I set it in the UPDATE query:
```sql
UPDATE scenes SET name = @name, scene_data = @sceneData, updated_at = GETDATE()
WHERE id = @id AND user_id = @userId
```

---

## Foreign Keys

```sql
ALTER TABLE scenes ADD FOREIGN KEY (user_id) REFERENCES users(id);
```

This creates a relationship:
```
users table          scenes table
┌────┬────────┐     ┌────┬─────────┬──────┐
│ id │ email  │     │ id │ user_id │ name │
├────┼────────┤     ├────┼─────────┼──────┤
│  1 │ a@b.c  │ ←── │  1 │    1    │ My   │
│  2 │ d@e.f  │ ←── │  2 │    2    │ Test │
└────┴────────┘     │  3 │    1    │ New  │
                    └────┴─────────┴──────┘
```

User 1 has scenes 1 and 3. User 2 has scene 2. You can't insert a scene with `user_id = 99` if there's no user with `id = 99`.

---

## CRUD Operations

All queries in my backend use parameterized inputs (`@param`) for security.

### Create (INSERT):
```sql
INSERT INTO scenes (user_id, name, scene_data)
OUTPUT INSERTED.id, INSERTED.name, INSERTED.created_at
VALUES (@userId, @name, @sceneData)
```

### Read (SELECT):
```sql
-- All scenes for a user
SELECT id, name, created_at, updated_at FROM scenes
WHERE user_id = @userId ORDER BY updated_at DESC

-- Single scene
SELECT id, name, scene_data, created_at, updated_at FROM scenes
WHERE id = @id AND user_id = @userId
```

> Always filter by `user_id` so users can only see their own scenes.

### Update:
```sql
UPDATE scenes SET name = @name, scene_data = @sceneData, updated_at = GETDATE()
WHERE id = @id AND user_id = @userId
```

### Delete:
```sql
DELETE FROM scenes WHERE id = @id AND user_id = @userId
```

### Check affected rows:
```javascript
if (result.rowsAffected[0] === 0) {
  return res.status(404).json({ error: 'Scene not found' });
}
```
If no rows were affected, the scene doesn't exist or doesn't belong to this user.

---

## OUTPUT Clause

SQL Server-specific feature that returns data from the row that was just inserted:

```sql
INSERT INTO users (email, password)
OUTPUT INSERTED.id
VALUES (@email, @password)
```

This is more efficient than doing an INSERT followed by a separate SELECT to get the new ID. The `OUTPUT INSERTED.*` clause returns the values directly from the INSERT operation.

---

## Connecting from Node.js

Using the `mssql` package with a connection pool singleton:

```javascript
const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,     // localhost
  port: parseInt(process.env.DB_PORT), // 1433
  database: process.env.DB_NAME,      // LightSimulator
  user: process.env.DB_USER,          // lightuser
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,                // No SSL for local dev
    trustServerCertificate: true,
  },
};

let pool = null;

const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('Connected to SQL Server');
  }
  return pool;
};

module.exports = { getPool, sql };
```

### Usage in routes:
```javascript
const pool = await getPool();
const result = await pool.request()
  .input('email', sql.NVarChar, email)
  .query('SELECT id, email, password FROM users WHERE email = @email');

const user = result.recordset[0];  // First row
```

- `pool.request()` creates a new query
- `.input(name, type, value)` adds a parameter
- `.query(sql)` executes the query
- `result.recordset` is the array of returned rows
- `result.rowsAffected[0]` is how many rows were changed