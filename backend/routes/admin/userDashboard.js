const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyAdmin, requirePermission } = require('../../middleware/adminAuth');

router.use(verifyAdmin);

// 用户注册看板 - 核心数据
router.get('/dashboard', (req, res) => {
  const { days = 30 } = req.query;
  
  db.get(`SELECT COUNT(*) as total FROM users`, [], (err, total) => {
    db.get(`SELECT COUNT(*) as today FROM users WHERE date(created_at)=date('now')`, [], (err2, today) => {
      db.get(`SELECT COUNT(*) as week FROM users WHERE created_at >= datetime('now','-7 days')`, [], (err3, week) => {
        db.get(`SELECT COUNT(*) as month FROM users WHERE created_at >= datetime('now','-30 days')`, [], (err4, month) => {
          db.all(`SELECT date(created_at) as day, COUNT(*) as count 
            FROM users WHERE created_at >= datetime('now','-${parseInt(days)} days')
            GROUP BY day ORDER BY day`, [], (err5, trend) => {
            db.all(`SELECT gender, COUNT(*) as count FROM users GROUP BY gender`, [], (err6, gender) => {
              db.all(`SELECT status, COUNT(*) as count FROM users GROUP BY status`, [], (err7, statusDist) => {
                db.all(`SELECT location, COUNT(*) as count FROM users WHERE location IS NOT NULL AND location!='' 
                  GROUP BY location ORDER BY count DESC LIMIT 10`, [], (err8, locations) => {
                  res.json({
                    total: total?.total || 0,
                    today: today?.today || 0,
                    week: week?.week || 0,
                    month: month?.month || 0,
                    register_trend: trend || [],
                    gender_dist: gender || [],
                    status_dist: statusDist || [],
                    top_locations: locations || [],
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

// 用户列表（查看权限）
router.get('/', (req, res) => {
  const { page = 1, pageSize = 20, status, gender, keyword } = req.query;
  const offset = (page - 1) * pageSize;
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND u.status=?'; params.push(status); }
  if (gender) { where += ' AND u.gender=?'; params.push(gender); }
  if (keyword) { where += ' AND (u.username LIKE ? OR u.nickname LIKE ? OR u.phone LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`); }

  db.get(`SELECT COUNT(*) as total FROM users u ${where}`, params, (err, c) => {
    db.all(`SELECT u.id,u.username,u.nickname,u.avatar,u.gender,u.phone,u.email,u.location,
      u.status,u.last_login,u.created_at, uc.balance as coins
      FROM users u LEFT JOIN user_coins uc ON u.id=uc.user_id
      ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err2, rows) => {
        res.json({ total: c?.total || 0, list: rows });
      });
  });
});

// 封禁/解封用户（仅admin）
router.post('/:id/ban', requirePermission('delete'), (req, res) => {
  const { action } = req.body; // ban | unban
  const status = action === 'ban' ? 'banned' : 'active';
  db.run('UPDATE users SET status=? WHERE id=?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, status });
  });
});

// 用户活跃度分析
router.get('/analysis/active', (req, res) => {
  db.all(`SELECT date(last_login) as day, COUNT(*) as dau 
    FROM users WHERE last_login >= datetime('now','-30 days')
    GROUP BY day ORDER BY day`, [], (err, dau) => {
    db.all(`SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
      FROM users GROUP BY month ORDER BY month DESC LIMIT 12`, [], (err2, monthly) => {
      res.json({ dau_trend: dau || [], monthly_register: monthly || [] });
    });
  });
});

module.exports = router;
