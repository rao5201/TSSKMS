const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { requireAdmin } = require('../../middleware/auth');

/**
 * GET /api/admin/logs
 * 获取操作日志（admin + service 均可查看）
 */
router.get('/', requireAdmin, (req, res) => {
  const { page = 1, pageSize = 50 } = req.query;
  const offset = (page - 1) * pageSize;
  db.all(`SELECT l.*, a.username FROM admin_logs l LEFT JOIN admins a ON l.admin_id = a.id ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
    [parseInt(pageSize), offset], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT COUNT(*) as total FROM admin_logs', [], (e, count) => {
        res.json({ list: rows, total: count?.total || 0 });
      });
    });
});

module.exports = router;
