const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取聊天列表
router.get('/list/:userId', (req, res) => {
  db.all(`SELECT DISTINCT 
      CASE WHEN from_user_id = ? THEN to_user_id ELSE from_user_id END as other_id,
      u.username, u.nickname, u.avatar,
      m.message as last_message, m.created_at
    FROM messages m
    LEFT JOIN users u ON u.id = CASE WHEN m.from_user_id = ? THEN m.to_user_id ELSE m.from_user_id END
    WHERE m.from_user_id = ? OR m.to_user_id = ?
    GROUP BY other_id ORDER BY m.created_at DESC`,
    [req.params.userId, req.params.userId, req.params.userId, req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ list: rows });
    });
});

// 获取与某用户的聊天记录
router.get('/history/:userId/:otherId', (req, res) => {
  const { page = 1, pageSize = 50 } = req.query;
  const offset = (page - 1) * pageSize;
  db.all(`SELECT m.*, u.username, u.nickname, u.avatar FROM messages m
    LEFT JOIN users u ON u.id = m.from_user_id
    WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)
    ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,
    [req.params.userId, req.params.otherId, req.params.otherId, req.params.userId, parseInt(pageSize), offset],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      // 标记已读
      db.run('UPDATE messages SET is_read = 1 WHERE from_user_id = ? AND to_user_id = ?',
        [req.params.otherId, req.params.userId]);
      res.json({ list: rows.reverse() });
    });
});

module.exports = router;
