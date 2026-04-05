const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取朋友圈动态列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;
  db.all(`SELECT m.*, u.username, u.nickname, u.avatar FROM moments m 
          LEFT JOIN users u ON m.user_id = u.id 
          WHERE m.is_public = 1 AND m.status = 'active'
          ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,
    [parseInt(pageSize), offset], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ list: rows });
    });
});

// 发布动态
router.post('/', (req, res) => {
  const { userId, content, emotion, image_url, location } = req.body;
  if (!userId || !content) return res.status(400).json({ error: '参数不完整' });
  db.run('INSERT INTO moments (user_id, content, emotion, image_url, location) VALUES (?, ?, ?, ?, ?)',
    [userId, content, emotion, image_url, location], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, success: true });
    });
});

// 点赞
router.post('/:id/like', (req, res) => {
  const { userId } = req.body;
  db.run('INSERT OR IGNORE INTO moment_likes (moment_id, user_id) VALUES (?, ?)',
    [req.params.id, userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes > 0) {
        db.run('UPDATE moments SET likes_count = likes_count + 1 WHERE id = ?', [req.params.id]);
      }
      res.json({ success: true });
    });
});

module.exports = router;
