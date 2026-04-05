const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取话题列表
router.get('/', (req, res) => {
  db.all('SELECT * FROM topics ORDER BY posts_count DESC LIMIT 50', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ list: rows });
  });
});

// 创建话题
router.post('/', (req, res) => {
  const { name, description } = req.body;
  db.run('INSERT OR IGNORE INTO topics (name, description) VALUES (?, ?)',
    [name, description], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, success: true });
    });
});

module.exports = router;
