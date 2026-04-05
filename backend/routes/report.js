const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 提交举报
router.post('/', (req, res) => {
  const { reporterId, targetId, targetType, reason } = req.body;
  if (!reporterId || !targetId || !reason) return res.status(400).json({ error: '参数不完整' });
  db.run('INSERT INTO reports (reporter_id, target_id, target_type, reason) VALUES (?, ?, ?, ?)',
    [reporterId, targetId, targetType, reason], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, success: true });
    });
});

module.exports = router;
