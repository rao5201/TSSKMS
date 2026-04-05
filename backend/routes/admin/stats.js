const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { requireAdmin } = require('../../middleware/auth');

/**
 * GET /api/admin/stats/overview
 * 获取概况统计（admin + service 均可查看）
 */
router.get('/overview', requireAdmin, (req, res) => {
  const stats = {};
  db.get('SELECT COUNT(*) as count FROM users', [], (e, r) => { stats.users = r?.count || 0; });
  db.get('SELECT COUNT(*) as count FROM users WHERE status = "banned"', [], (e, r) => { stats.banned_users = r?.count || 0; });
  db.get('SELECT COUNT(*) as count FROM moments', [], (e, r) => { stats.moments = r?.count || 0; });
  db.get('SELECT COUNT(*) as count FROM videos', [], (e, r) => { stats.videos = r?.count || 0; });
  db.get('SELECT COUNT(*) as count FROM reports WHERE status = "pending"', [], (e, r) => { stats.pending_reports = r?.count || 0; });
  db.get('SELECT COUNT(*) as count FROM live_rooms WHERE status = "live"', [], (e, r) => {
    stats.live = r?.count || 0;
    setTimeout(() => res.json(stats), 100);
  });
});

/**
 * GET /api/admin/stats/daily-users
 * 每日新增用户（admin + service 均可查看）
 */
router.get('/daily-users', requireAdmin, (req, res) => {
  db.all(
    `SELECT date(created_at) as date, COUNT(*) as count
     FROM users
     GROUP BY date(created_at)
     ORDER BY date DESC LIMIT 30`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
