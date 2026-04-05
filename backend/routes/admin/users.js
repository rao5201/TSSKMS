const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { requireAdmin, requireSuperAdmin } = require('../../middleware/auth');

// ─── 所有路由都需要管理员身份 ───────────────────────────────────────────────

/**
 * GET /api/admin/users
 * 获取用户列表（admin + service 均可查看）
 */
router.get('/', requireAdmin, (req, res) => {
  const { page = 1, pageSize = 20, keyword = '', status = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  let where = 'WHERE 1=1';
  const params = [];
  if (keyword) {
    where += ' AND (username LIKE ? OR nickname LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  db.all(
    `SELECT id, username, nickname, avatar, status, gender, last_login, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, parseInt(pageSize), offset],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT COUNT(*) as total FROM users ${where}`, params, (e, count) => {
        res.json({
          list: rows,
          total: count?.total || 0,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        });
      });
    }
  );
});

/**
 * GET /api/admin/users/:id
 * 查看单个用户详情（admin + service 均可查看）
 */
router.get('/:id', requireAdmin, (req, res) => {
  db.get(
    `SELECT u.id, u.username, u.nickname, u.avatar, u.bio, u.gender, u.location,
            u.status, u.last_login, u.created_at,
            uc.balance as coins
     FROM users u
     LEFT JOIN user_coins uc ON u.id = uc.user_id
     WHERE u.id = ?`,
    [req.params.id],
    (err, user) => {
      if (err || !user) return res.status(404).json({ error: '用户不存在' });
      res.json(user);
    }
  );
});

/**
 * PUT /api/admin/users/:id/status
 * 封禁 / 解封用户（仅 admin 可操作）
 * body: { status: 'active' | 'banned', reason?: string }
 */
router.put('/:id/status', requireSuperAdmin, (req, res) => {
  const { status, reason } = req.body;
  const validStatuses = ['active', 'banned'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'status 必须是 active 或 banned' });
  }

  db.get('SELECT id, username, status FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: '用户不存在' });

    db.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id], function(updateErr) {
      if (updateErr) return res.status(500).json({ error: updateErr.message });

      // 记录操作日志
      const action = status === 'banned' ? 'ban_user' : 'unban_user';
      const details = JSON.stringify({
        target_username: user.username,
        old_status: user.status,
        new_status: status,
        reason: reason || ''
      });
      db.run(
        'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip) VALUES (?, ?, ?, ?, ?, ?)',
        [req.admin.id, action, 'user', req.params.id, details, req.ip || '']
      );

      const actionText = status === 'banned' ? '已封禁' : '已解封';
      res.json({ success: true, message: `用户 ${user.username} ${actionText}` });
    });
  });
});

/**
 * DELETE /api/admin/users/:id
 * 删除用户（仅 admin 可操作）
 */
router.delete('/:id', requireSuperAdmin, (req, res) => {
  db.get('SELECT id, username FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: '用户不存在' });

    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(delErr) {
      if (delErr) return res.status(500).json({ error: delErr.message });

      // 记录操作日志
      db.run(
        'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip) VALUES (?, ?, ?, ?, ?, ?)',
        [req.admin.id, 'delete_user', 'user', req.params.id,
          JSON.stringify({ deleted_username: user.username }), req.ip || '']
      );

      res.json({ success: true, message: `用户 ${user.username} 已删除` });
    });
  });
});

module.exports = router;
