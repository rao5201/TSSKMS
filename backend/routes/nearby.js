const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 附近的人（基于经纬度）
router.get('/', (req, res) => {
  const { lat, lng, radius = 10, userId } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: '需要提供位置信息' });
  // 简化距离计算（实际应使用 Haversine 公式）
  db.all(`SELECT id, username, nickname, avatar, latitude, longitude,
    (ABS(latitude - ?) + ABS(longitude - ?)) * 111 as distance
    FROM users WHERE latitude IS NOT NULL AND longitude IS NOT NULL 
    AND id != ? AND status = 'active'
    ORDER BY distance LIMIT 50`,
    [parseFloat(lat), parseFloat(lng), userId || 0],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ list: rows.filter(u => u.distance <= parseFloat(radius)) });
    });
});

// 更新用户位置
router.put('/location', (req, res) => {
  const { userId, latitude, longitude, location } = req.body;
  db.run('UPDATE users SET latitude = ?, longitude = ?, location = ? WHERE id = ?',
    [latitude, longitude, location, userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

module.exports = router;
