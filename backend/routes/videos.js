const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取视频列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;
  db.all(`SELECT v.*, u.username, u.nickname, u.avatar FROM videos v 
          LEFT JOIN users u ON v.user_id = u.id 
          WHERE v.is_public = 1 AND v.status = 'active'
          ORDER BY v.created_at DESC LIMIT ? OFFSET ?`,
    [parseInt(pageSize), offset], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ list: rows });
    });
});

// 发布视频
router.post('/', (req, res) => {
  const { userId, title, description, video_url, cover_url, duration } = req.body;
  if (!userId || !video_url) return res.status(400).json({ error: '参数不完整' });
  db.run('INSERT INTO videos (user_id, title, description, video_url, cover_url, duration) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, title, description, video_url, cover_url, duration], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, success: true });
    });
});

// 增加播放量
router.put('/:id/view', (req, res) => {
  db.run('UPDATE videos SET views_count = views_count + 1 WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
