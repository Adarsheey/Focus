const express = require('express');
const router = express.Router();
const pool = require('../db');

// Record a completed session
router.post('/', async (req, res) => {
    const { task_id, start_time, end_time, actual_focus_time, total_session_time } = req.body;

    try {
        const result = await pool.query(
            `
            INSERT INTO sessions 
            (user_id, task_id, start_time, end_time, actual_focus_time, total_session_time)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            `,
            [req.user_id, task_id, start_time, end_time, actual_focus_time, total_session_time]
        );

        res.json({ id: result.rows[0].id, success: true });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recent sessions
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT s.*, t.title as task_title 
            FROM sessions s
            LEFT JOIN tasks t ON s.task_id = t.id
            WHERE s.user_id = $1
            ORDER BY s.end_time DESC
            LIMIT 50
            `,
            [req.user_id]
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;