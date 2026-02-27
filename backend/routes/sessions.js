const express = require('express');
const router = express.Router();
const db = require('../db');

// Record a completed session
router.post('/', (req, res) => {
    const { task_id, start_time, end_time, actual_focus_time, total_session_time } = req.body;

    try {
        const stmt = db.prepare(`
      INSERT INTO sessions (user_id, task_id, start_time, end_time, actual_focus_time, total_session_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        const info = stmt.run(req.user_id, task_id, start_time, end_time, actual_focus_time, total_session_time);
        res.json({ id: Number(info.lastInsertRowid), success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recent sessions
router.get('/', (req, res) => {
    try {
        const sessions = db.prepare(`
      SELECT s.*, t.title as task_title 
      FROM sessions s
      LEFT JOIN tasks t ON s.task_id = t.id
      WHERE s.user_id = ?
      ORDER BY s.end_time DESC
      LIMIT 50
    `).all(req.user_id);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
