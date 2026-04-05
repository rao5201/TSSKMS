const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { requireAdmin, requireSuperAdmin } = require('../../middleware/auth');

/**
 * GET /api/admin/reports
 * 获取举报列表（admin + service 均可查看）
 */
router.get('/', requireAdmin, (req, res) => {
  const { page = 1, pageSize = 20, status = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const where = status ? 'WHERE r.status = ?' : '';
  const params = status
    ? [status, parseInt(pageSize), offset]
    : [parseInt(pageSize), offset];
  db.all(
    `SELECT r.*, u.username as reporter_name FROM reports r
     LEFT JOIN users u ON r.reporter_id = u.id
     ${where}
     ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
    params,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ list: rows });
    }
  );
});

/**
 * PUT /api/admin/reports/:id
 * 处理举报（仅 admin 可操作）
 */
router.put('/:id', requireSuperAdmin, (req, res) => {
  const { status } = req.body;
  db.run('UPDATE reports SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip) VALUES (?, ?, ?, ?, ?, ?)',
      [req.admin.id, 'handle_report', 'report', req.params.id,
        JSON.stringify({ new_status: status }), req.ip || '']
    );
    res.json({ success: true });
  });
});

module.exports = router;
