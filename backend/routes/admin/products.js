const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyAdmin, requirePermission } = require('../../middleware/adminAuth');

router.use(verifyAdmin);

// 获取产品列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 20, status, category, keyword } = req.query;
  const offset = (page - 1) * pageSize;
  let where = 'WHERE p.status!=\'deleted\'';
  const params = [];
  if (status) { where += ' AND p.status=?'; params.push(status); }
  if (category) { where += ' AND p.category=?'; params.push(category); }
  if (keyword) { where += ' AND (p.name LIKE ? OR p.sku LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

  db.get(`SELECT COUNT(*) as total FROM products p ${where}`, params, (err, countRow) => {
    db.all(`SELECT p.*, s.name as supplier_name FROM products p 
      LEFT JOIN suppliers s ON p.supplier_id=s.id
      ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ total: countRow?.total || 0, list: rows });
      });
  });
});

// 新增产品
router.post('/', requirePermission('write'), (req, res) => {
  const { sku, name, category, sub_category, description, unit, cost_price, selling_price, min_price, stock, min_stock, supplier_id, image_url } = req.body;
  if (!name) return res.status(400).json({ error: '产品名称不能为空' });
  db.run(`INSERT INTO products (sku,name,category,sub_category,description,unit,cost_price,selling_price,min_price,stock,min_stock,supplier_id,image_url,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [sku, name, category, sub_category, description, unit || '件', cost_price || 0, selling_price || 0, min_price || 0, stock || 0, min_stock || 10, supplier_id, image_url, req.admin.id],
    function(err) {
      if (err) return res.status(400).json({ error: 'SKU已存在或其他错误' });
      res.json({ success: true, id: this.lastID });
    });
});

// 更新产品
router.put('/:id', requirePermission('write'), (req, res) => {
  const { sku, name, category, sub_category, description, unit, cost_price, selling_price, min_price, stock, min_stock, supplier_id, image_url, status } = req.body;
  db.run(`UPDATE products SET sku=?,name=?,category=?,sub_category=?,description=?,unit=?,
    cost_price=?,selling_price=?,min_price=?,stock=?,min_stock=?,supplier_id=?,image_url=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [sku, name, category, sub_category, description, unit, cost_price, selling_price, min_price, stock, min_stock, supplier_id, image_url, status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

// 删除产品（仅admin）
router.delete('/:id', requirePermission('delete'), (req, res) => {
  db.run('UPDATE products SET status=? WHERE id=?', ['deleted', req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 产品看板 & 库存预警
router.get('/dashboard/stats', (req, res) => {
  db.all(`SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN stock <= min_stock AND status='active' THEN 1 ELSE 0 END) as low_stock,
    SUM(cost_price * stock) as total_stock_cost,
    SUM(selling_price * stock) as total_stock_value
  FROM products WHERE status!='deleted'`, [], (err, rows) => {
    db.all(`SELECT category, COUNT(*) as count, SUM(stock) as total_stock 
      FROM products WHERE status='active' GROUP BY category`, [], (err2, cat) => {
      db.all(`SELECT id, sku, name, stock, min_stock, category FROM products 
        WHERE stock <= min_stock AND status='active' ORDER BY stock ASC LIMIT 10`, [], (err3, low) => {
        res.json({ summary: rows?.[0], by_category: cat || [], low_stock_alert: low || [] });
      });
    });
  });
});

module.exports = router;
