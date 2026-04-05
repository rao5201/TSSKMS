const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取好友列表
router.get('/:userId', (req, res) => {
  db.all(`SELECT u.id, u.username, u.nickname, u.avatar, f.status FROM friendships f
    LEFT JOIN users u ON u.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END
    WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'`,
    [req.params.userId, req.params.userId, req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ list: rows });
    });
});

// 发送好友申请
router.post('/request', (req, res) => {
  const { userId, friendId } = req.body;
  db.run('INSERT OR IGNORE INTO friendships (user_id, friend_id, status) VALUES (?, ?, "pending")',
    [userId, friendId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

// 接受/拒绝好友申请
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE friendships SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
