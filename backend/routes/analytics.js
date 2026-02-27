const express = require('express');
const router = express.Router();
const db = require('../db');

// Get focus analytics (Focus Score, Daily Trends)
router.get('/', (req, res) => {
  try {
    // Overall Focus Score
    const scoreResult = db.prepare(`
      SELECT SUM(actual_focus_time) as total_focus, SUM(total_session_time) as total_time
      FROM sessions WHERE user_id = ?
    `).get(req.user_id);

    // Today Focus Time
    const todayResult = db.prepare(`
      SELECT SUM(actual_focus_time) as total_focus
      FROM sessions
      WHERE date(start_time) = date('now', 'localtime') AND user_id = ?
    `).get(req.user_id);

    // Yesterday Focus Time
    const yesterdayResult = db.prepare(`
      SELECT SUM(actual_focus_time) as total_focus
      FROM sessions
      WHERE date(start_time) = date('now', '-1 day', 'localtime') AND user_id = ?
    `).get(req.user_id);

    let focusScore = 0;
    if (scoreResult && scoreResult.total_time > 0) {
      focusScore = Math.round((scoreResult.total_focus / scoreResult.total_time) * 100);
    }

    // Current Week Focus (Sunday to Saturday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekResult = db.prepare(`
      SELECT SUM(actual_focus_time) as total_focus
      FROM sessions
      WHERE start_time >= ? AND user_id = ?
    `).get(startOfWeek.toISOString(), req.user_id);

    const weekSessions = db.prepare(`
      SELECT start_time, actual_focus_time
      FROM sessions
      WHERE start_time >= ? AND user_id = ?
    `).all(startOfWeek.toISOString(), req.user_id);

    // Daily Trends (last 7 days grouped by day)
    const dailyTrends = db.prepare(`
      SELECT 
        date(start_time) as day, 
        SUM(actual_focus_time) as daily_focus,
        SUM(total_session_time) as daily_total
      FROM sessions
      WHERE user_id = ?
      GROUP BY day
      ORDER BY day DESC
      LIMIT 7
    `).all(req.user_id);

    res.json({
      focusScore,
      dailyTrends: dailyTrends || [],
      totalFocusSeconds: scoreResult ? (scoreResult.total_focus || 0) : 0,
      totalFocusSecondsToday: todayResult ? (todayResult.total_focus || 0) : 0,
      yesterdayFocusSeconds: yesterdayResult ? (yesterdayResult.total_focus || 0) : 0,
      weekFocusSeconds: weekResult ? (weekResult.total_focus || 0) : 0,
      weekSessions: weekSessions || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
