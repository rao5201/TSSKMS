const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'teahaixin_secret_2024';

// 注册
router.post('/register', (req, res) => {
  const { username, password, nickname } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
  const hashed = bcrypt.hashSync(password, 10);
  const nick = nickname || username;
  db.run('INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
    [username, hashed, nick], function(err) {
      if (err) return res.status(400).json({ error: '用户名已存在' });
      const userId = this.lastID;
      db.run('INSERT INTO user_status (user_id) VALUES (?)', [userId]);
      db.run('INSERT INTO user_coins (user_id, balance) VALUES (?, 100)', [userId]);
      const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '30d' });
      res.json({ token, userId, username, nickname: nick });
    });
});

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: '用户名或密码错误' });
    if (user.status !== 'active') return res.status(403).json({ error: '账号已被禁用' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: '用户名或密码错误' });
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    db.run('UPDATE user_status SET is_online = 1 WHERE user_id = ?', [user.id]);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, userId: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar });
  });
});

// 获取个人资料
router.get('/profile/:id', (req, res) => {
  db.get('SELECT id, username, nickname, avatar, bio, gender, location, created_at FROM users WHERE id = ?',
    [req.params.id], (err, user) => {
      if (err || !user) return res.status(404).json({ error: '用户不存在' });
      db.get('SELECT balance FROM user_coins WHERE user_id = ?', [user.id], (e, coins) => {
        user.coins = coins?.balance || 0;
        res.json(user);
      });
    });
});

// 更新资料
router.put('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const { nickname, bio, gender, avatar } = req.body;
    db.run('UPDATE users SET nickname=?, bio=?, gender=?, avatar=? WHERE id=?',
      [nickname, bio, gender, avatar, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
  } catch (e) { res.status(401).json({ error: 'token无效' }); }
});

module.exports = router;
