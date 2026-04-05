const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { requireAdmin, requireSuperAdmin } = require('../../middleware/auth');

/**
 * GET /api/admin/config
 * 获取所有配置（admin + service 均可查看）
 */
router.get('/', requireAdmin, (req, res) => {
  db.all('SELECT * FROM system_config ORDER BY id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * PUT /api/admin/config/:key
 * 更新系统配置（仅 admin 可操作）
 */
router.put('/:key', requireSuperAdmin, (req, res) => {
  const { value } = req.body;
  db.run(
    'UPDATE system_config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
    [value, req.params.key],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run(
        'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip) VALUES (?, ?, ?, ?, ?, ?)',
        [req.admin.id, 'update_config', 'config', null,
          JSON.stringify({ key: req.params.key, new_value: value }), req.ip || '']
      );
      res.json({ success: true });
    }
  );
});

module.exports = router;
