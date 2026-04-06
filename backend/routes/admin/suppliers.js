const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyAdmin, requirePermission } = require('../../middleware/adminAuth');

router.use(verifyAdmin);

// 获取供应商列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 20, status, category, keyword } = req.query;
  const offset = (page - 1) * pageSize;
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND status=?'; params.push(status); }
  if (category) { where += ' AND category=?'; params.push(category); }
  if (keyword) { where += ' AND (name LIKE ? OR contact_person LIKE ? OR phone LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`); }

  db.get(`SELECT COUNT(*) as total FROM suppliers ${where}`, params, (err, countRow) => {
    db.all(`SELECT * FROM suppliers ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ total: countRow?.total || 0, list: rows });
      });
  });
});

// 新增供应商
router.post('/', requirePermission('write'), (req, res) => {
  const { name, code, contact_person, phone, email, address, city, province, category, credit_level, payment_terms, bank_name, bank_account, tax_id, notes } = req.body;
  if (!name) return res.status(400).json({ error: '供应商名称不能为空' });
  db.run(`INSERT INTO suppliers (name,code,contact_person,phone,email,address,city,province,category,credit_level,payment_terms,bank_name,bank_account,tax_id,notes,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [name, code, contact_person, phone, email, address, city, province, category, credit_level || 'A', payment_terms || 30, bank_name, bank_account, tax_id, notes, req.admin.id],
    function(err) {
      if (err) return res.status(400).json({ error: '供应商代码已存在或其他错误' });
      res.json({ success: true, id: this.lastID });
    });
});

// 更新供应商
router.put('/:id', requirePermission('write'), (req, res) => {
  const { name, code, contact_person, phone, email, address, city, province, category, credit_level, payment_terms, bank_name, bank_account, tax_id, notes, status } = req.body;
  db.run(`UPDATE suppliers SET name=?,code=?,contact_person=?,phone=?,email=?,address=?,city=?,province=?,
    category=?,credit_level=?,payment_terms=?,bank_name=?,bank_account=?,tax_id=?,notes=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [name, code, contact_person, phone, email, address, city, province, category, credit_level, payment_terms, bank_name, bank_account, tax_id, notes, status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

// 删除供应商（仅admin）
router.delete('/:id', requirePermission('delete'), (req, res) => {
  db.run('UPDATE suppliers SET status=? WHERE id=?', ['deleted', req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 供应商分析看板
router.get('/dashboard/stats', (req, res) => {
  db.all(`SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN credit_level='A' THEN 1 ELSE 0 END) as grade_a,
    SUM(CASE WHEN credit_level='B' THEN 1 ELSE 0 END) as grade_b,
    SUM(CASE WHEN credit_level='C' THEN 1 ELSE 0 END) as grade_c
  FROM suppliers`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all(`SELECT category, COUNT(*) as count FROM suppliers WHERE status='active' GROUP BY category`, [], (err2, cat) => {
      res.json({ summary: rows[0], by_category: cat || [] });
    });
  });
});

module.exports = router;
