const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取地图上的用户/内容
router.get('/users', (req, res) => {
  db.all(`SELECT id, username, nickname, avatar, latitude, longitude, location
    FROM users WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND status = 'active' LIMIT 100`,
    [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ list: rows });
    });
});

module.exports = router;
