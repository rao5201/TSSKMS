const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'teahaixin_secret_2024';

// 管理员登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err || !admin) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    const valid = bcrypt.compareSync(password, admin.password);
    if (!valid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    db.run('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);
    const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: admin.role, username: admin.username });
  });
});

// 获取当前管理员信息
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.get('SELECT id, username, role, avatar, last_login FROM admins WHERE id = ?', [decoded.id], (err, admin) => {
      if (err || !admin) return res.status(401).json({ error: '账号不存在' });
      res.json(admin);
    });
  } catch (e) {
    res.status(401).json({ error: 'token无效' });
  }
});

module.exports = router;
