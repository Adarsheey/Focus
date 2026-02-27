const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all tasks
router.get('/', (req, res) => {
    try {
        const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.user_id);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new task
router.post('/', (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        const stmt = db.prepare('INSERT INTO tasks (title, user_id) VALUES (?, ?)');
        const info = stmt.run(title, req.user_id);
        res.json({ id: Number(info.lastInsertRowid), title, status: 'pending' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a task
router.put('/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
        const stmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?');
        stmt.run(status, id, req.user_id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a task
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    try {
        const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
        stmt.run(id, req.user_id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
