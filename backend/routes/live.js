const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取直播列表
router.get('/', (req, res) => {
  db.all(`SELECT l.*, u.username, u.nickname, u.avatar FROM live_rooms l
          LEFT JOIN users u ON l.user_id = u.id
          WHERE l.status = 'live'
          ORDER BY l.viewers_count DESC`,
    [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ list: rows });
    });
});

// 开始直播
router.post('/start', (req, res) => {
  const { userId, title, description, cover_image } = req.body;
  const streamKey = `live_${userId}_${Date.now()}`;
  db.run('INSERT INTO live_rooms (user_id, title, description, cover_image, stream_key, status, started_at) VALUES (?, ?, ?, ?, ?, "live", CURRENT_TIMESTAMP)',
    [userId, title, description, cover_image, streamKey], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, streamKey, success: true });
    });
});

// 结束直播
router.put('/:id/end', (req, res) => {
  db.run('UPDATE live_rooms SET status = "ended", ended_at = CURRENT_TIMESTAMP WHERE id = ?',
    [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

module.exports = router;
