const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get focus analytics
router.get('/', async (req, res) => {
  try {

    // Overall Focus Score
    const scoreResult = await pool.query(
      `
      SELECT 
        COALESCE(SUM(actual_focus_time), 0) as total_focus,
        COALESCE(SUM(total_session_time), 0) as total_time
      FROM sessions 
      WHERE user_id = $1
      `,
      [req.user_id]
    );

    const totalFocus = parseInt(scoreResult.rows[0].total_focus);
    const totalTime = parseInt(scoreResult.rows[0].total_time);

    let focusScore = 0;
    if (totalTime > 0) {
      focusScore = Math.round((totalFocus / totalTime) * 100);
    }

    // Today Focus Time
    const todayResult = await pool.query(
      `
      SELECT COALESCE(SUM(actual_focus_time), 0) as total_focus
      FROM sessions
      WHERE DATE(start_time) = CURRENT_DATE
      AND user_id = $1
      `,
      [req.user_id]
    );

    // Yesterday Focus Time
    const yesterdayResult = await pool.query(
      `
      SELECT COALESCE(SUM(actual_focus_time), 0) as total_focus
      FROM sessions
      WHERE DATE(start_time) = CURRENT_DATE - INTERVAL '1 day'
      AND user_id = $1
      `,
      [req.user_id]
    );

    // Week Start (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekResult = await pool.query(
      `
      SELECT COALESCE(SUM(actual_focus_time), 0) as total_focus
      FROM sessions
      WHERE start_time >= $1
      AND user_id = $2
      `,
      [startOfWeek.toISOString(), req.user_id]
    );

    const weekSessions = await pool.query(
      `
      SELECT start_time, actual_focus_time
      FROM sessions
      WHERE start_time >= $1
      AND user_id = $2
      `,
      [startOfWeek.toISOString(), req.user_id]
    );

    // Daily Trends (last 7 days)
    const dailyTrends = await pool.query(
      `
      SELECT 
        DATE(start_time) as day,
        COALESCE(SUM(actual_focus_time), 0) as daily_focus,
        COALESCE(SUM(total_session_time), 0) as daily_total
      FROM sessions
      WHERE user_id = $1
      GROUP BY day
      ORDER BY day DESC
      LIMIT 7
      `,
      [req.user_id]
    );

    res.json({
      focusScore,
      dailyTrends: dailyTrends.rows,
      totalFocusSeconds: totalFocus,
      totalFocusSecondsToday: parseInt(todayResult.rows[0].total_focus),
      yesterdayFocusSeconds: parseInt(yesterdayResult.rows[0].total_focus),
      weekFocusSeconds: parseInt(weekResult.rows[0].total_focus),
      weekSessions: weekSessions.rows
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;