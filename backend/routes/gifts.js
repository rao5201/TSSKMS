const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取礼物列表
router.get('/', (req, res) => {
  db.all('SELECT * FROM gifts ORDER BY sort_order', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ list: rows });
  });
});

// 赠送礼物
router.post('/send', (req, res) => {
  const { fromUserId, toUserId, giftId, roomId } = req.body;
  if (!fromUserId || !toUserId || !giftId) return res.status(400).json({ error: '参数不完整' });
  db.get('SELECT price FROM gifts WHERE id = ?', [giftId], (err, gift) => {
    if (!gift) return res.status(404).json({ error: '礼物不存在' });
    db.get('SELECT balance FROM user_coins WHERE user_id = ?', [fromUserId], (e, coins) => {
      if (!coins || coins.balance < gift.price) return res.status(400).json({ error: '金币不足' });
      db.run('UPDATE user_coins SET balance = balance - ?, total_spent = total_spent + ? WHERE user_id = ?',
        [gift.price, gift.price, fromUserId]);
      db.run('UPDATE user_coins SET balance = balance + ?, total_earned = total_earned + ? WHERE user_id = ?',
        [gift.price, gift.price, toUserId]);
      db.run('INSERT INTO gift_records (from_user_id, to_user_id, gift_id, room_id) VALUES (?, ?, ?, ?)',
        [fromUserId, toUserId, giftId, roomId], function(giftErr) {
          if (giftErr) return res.status(500).json({ error: giftErr.message });
          res.json({ success: true, recordId: this.lastID });
        });
    });
  });
});

module.exports = router;
