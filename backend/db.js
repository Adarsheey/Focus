const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'focusloop.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    firebase_uid TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    task_id INTEGER,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    actual_focus_time INTEGER DEFAULT 0,
    total_session_time INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(task_id) REFERENCES tasks(id)
  );
`);

// Add columns to existing tables if they don't exist
try {
  db.exec("ALTER TABLE users ADD COLUMN firebase_uid TEXT");
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)");
} catch (e) { /* Column might already exist */ }

try {
  db.exec("ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id)");
} catch (e) { /* Column might already exist */ }

try {
  db.exec("ALTER TABLE sessions ADD COLUMN user_id INTEGER REFERENCES users(id)");
} catch (e) { /* Column might already exist */ }

module.exports = db;
