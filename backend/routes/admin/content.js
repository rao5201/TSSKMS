const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { requireAdmin, requireSuperAdmin } = require('../../middleware/auth');

/**
 * GET /api/admin/content/moments
 * 获取动态列表（admin + service 均可查看）
 */
router.get('/moments', requireAdmin, (req, res) => {
  const { page = 1, pageSize = 20, status = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const where = status ? `WHERE m.status = ?` : '';
  const params = status ? [status, parseInt(pageSize), offset] : [parseInt(pageSize), offset];
  db.all(
    `SELECT m.*, u.username, u.nickname FROM moments m
     LEFT JOIN users u ON m.user_id = u.id
     ${where}
     ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,
    params,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const countWhere = status ? 'WHERE status = ?' : '';
      const countParams = status ? [status] : [];
      db.get(`SELECT COUNT(*) as total FROM moments ${countWhere}`, countParams, (e, count) => {
        res.json({ list: rows, total: count?.total || 0 });
      });
    }
  );
});

/**
 * PUT /api/admin/content/moments/:id/status
 * 审核/隐藏动态（仅 admin 可操作）
 */
router.put('/moments/:id/status', requireSuperAdmin, (req, res) => {
  const { status } = req.body;
  db.run('UPDATE moments SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip) VALUES (?, ?, ?, ?, ?, ?)',
      [req.admin.id, 'update_moment_status', 'moment', req.params.id,
        JSON.stringify({ new_status: status }), req.ip || '']
    );
    res.json({ success: true });
  });
});

/**
 * DELETE /api/admin/content/moments/:id
 * 删除动态（仅 admin 可操作）
 */
router.delete('/moments/:id', requireSuperAdmin, (req, res) => {
  db.run('DELETE FROM moments WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip) VALUES (?, ?, ?, ?, ?, ?)',
      [req.admin.id, 'delete_moment', 'moment', req.params.id, '{}', req.ip || '']
    );
    res.json({ success: true });
  });
});

module.exports = router;
