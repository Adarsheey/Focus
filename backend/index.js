const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const sessionRoutes = require('./routes/sessions');
const analyticsRoutes = require('./routes/analytics');
const authMiddleware = require('./middleware/auth');

const pool = require('./db');

async function initDB() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firebase_uid TEXT UNIQUE NOT NULL,
        username TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        actual_focus_time INTEGER DEFAULT 0,
        total_session_time INTEGER DEFAULT 0
      );
    `);

        console.log("PostgreSQL tables ensured.");
    } catch (err) {
        console.error("DB Init Error:", err);
    }
}


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main health route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

app.listen(PORT, async () => {
    await initDB();
    console.log(`Backend server is running on port ${PORT}`);
});