const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyAdmin, requirePermission } = require('../../middleware/adminAuth');

router.use(verifyAdmin);
router.use(requirePermission('finance')); // 仅 admin 和 finance 角色可访问

// ───── 销售订单 ─────
router.get('/sales', (req, res) => {
  const { page = 1, pageSize = 20, status, start_date, end_date } = req.query;
  const offset = (page - 1) * pageSize;
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND o.status=?'; params.push(status); }
  if (start_date) { where += ' AND date(o.created_at)>=?'; params.push(start_date); }
  if (end_date) { where += ' AND date(o.created_at)<=?'; params.push(end_date); }

  db.get(`SELECT COUNT(*) as total FROM sales_orders o ${where}`, params, (err, c) => {
    db.all(`SELECT o.*, p.name as product_name FROM sales_orders o 
      LEFT JOIN products p ON o.product_id=p.id
      ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ total: c?.total || 0, list: rows });
      });
  });
});

// 新增销售订单
router.post('/sales', (req, res) => {
  const { customer_name, customer_phone, user_id, product_id, quantity, unit_price, discount, payment_method, notes } = req.body;
  if (!product_id || !quantity) return res.status(400).json({ error: '产品和数量不能为空' });

  db.get('SELECT * FROM products WHERE id=?', [product_id], (err, product) => {
    if (!product) return res.status(404).json({ error: '产品不存在' });
    const price = unit_price || product.selling_price;
    const total = price * quantity;
    const disc = discount || 0;
    const actual = total - disc;
    const cost = product.cost_price * quantity;
    const profit = actual - cost;
    const orderNo = 'SO' + Date.now();

    db.run(`INSERT INTO sales_orders (order_no,customer_name,customer_phone,user_id,product_id,quantity,unit_price,total_amount,discount,actual_amount,cost_amount,gross_profit,status,payment_method,notes,created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [orderNo, customer_name, customer_phone, user_id, product_id, quantity, price, total, disc, actual, cost, profit, 'paid', payment_method, notes, req.admin.id],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        // 更新库存
        db.run('UPDATE products SET stock=stock-? WHERE id=?', [quantity, product_id]);
        // 记录财务流水
        db.run(`INSERT INTO financial_records (record_type,source_type,source_id,amount,description,created_by) VALUES (?,?,?,?,?,?)`,
          ['income', 'sales', this.lastID, actual, `销售订单 ${orderNo}`, req.admin.id]);
        res.json({ success: true, id: this.lastID, order_no: orderNo });
      });
  });
});

// ───── 费用管理 ─────
router.get('/expenses', (req, res) => {
  const { page = 1, pageSize = 20, category, payment_status, start_date, end_date } = req.query;
  const offset = (page - 1) * pageSize;
  let where = 'WHERE 1=1';
  const params = [];
  if (category) { where += ' AND e.category=?'; params.push(category); }
  if (payment_status) { where += ' AND e.payment_status=?'; params.push(payment_status); }
  if (start_date) { where += ' AND date(e.expense_date)>=?'; params.push(start_date); }
  if (end_date) { where += ' AND date(e.expense_date)<=?'; params.push(end_date); }

  db.get(`SELECT COUNT(*) as total FROM expenses e ${where}`, params, (err, c) => {
    db.all(`SELECT e.*, s.name as supplier_name FROM expenses e 
      LEFT JOIN suppliers s ON e.supplier_id=s.id
      ${where} ORDER BY e.expense_date DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err2, rows) => {
        res.json({ total: c?.total || 0, list: rows });
      });
  });
});

router.post('/expenses', (req, res) => {
  const { title, category, amount, supplier_id, invoice_no, expense_date, payment_status, payment_date, notes } = req.body;
  if (!title || !amount || !category) return res.status(400).json({ error: '标题、类别、金额不能为空' });
  db.run(`INSERT INTO expenses (title,category,amount,supplier_id,invoice_no,expense_date,payment_status,payment_date,notes,created_by) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [title, category, amount, supplier_id, invoice_no, expense_date || new Date().toISOString().split('T')[0], payment_status || 'unpaid', payment_date, notes, req.admin.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (payment_status === 'paid') {
        db.run(`INSERT INTO financial_records (record_type,source_type,source_id,amount,description,created_by) VALUES (?,?,?,?,?,?)`,
          ['expense', 'expense', this.lastID, amount, `费用: ${title}`, req.admin.id]);
      }
      res.json({ success: true, id: this.lastID });
    });
});

// ───── 财务汇总看板 ─────
router.get('/dashboard', (req, res) => {
  const { year = new Date().getFullYear(), month } = req.query;
  
  const monthFilter = month ? `AND strftime('%m', created_at)='${String(month).padStart(2,'0')}'` : '';
  const yearFilter = `AND strftime('%Y', created_at)='${year}'`;

  // 本年度收入
  db.get(`SELECT COALESCE(SUM(actual_amount),0) as total_income, COUNT(*) as order_count 
    FROM sales_orders WHERE status='paid' ${yearFilter} ${monthFilter}`, [], (err, income) => {
    // 本年度费用
    db.get(`SELECT COALESCE(SUM(amount),0) as total_expense 
      FROM expenses WHERE payment_status='paid' ${yearFilter} ${monthFilter}`, [], (err2, expense) => {
      // 毛利
      db.get(`SELECT COALESCE(SUM(gross_profit),0) as total_profit 
        FROM sales_orders WHERE status='paid' ${yearFilter} ${monthFilter}`, [], (err3, profit) => {
        // 月度趋势
        db.all(`SELECT strftime('%m', created_at) as month,
          SUM(actual_amount) as income, SUM(gross_profit) as profit, COUNT(*) as orders
          FROM sales_orders WHERE status='paid' ${yearFilter} GROUP BY month ORDER BY month`, [], (err4, trend) => {
          // 费用分类
          db.all(`SELECT category, SUM(amount) as total FROM expenses 
            WHERE payment_status='paid' ${yearFilter} GROUP BY category ORDER BY total DESC`, [], (err5, expCat) => {
            res.json({
              income: income?.total_income || 0,
              order_count: income?.order_count || 0,
              expense: expense?.total_expense || 0,
              gross_profit: profit?.total_profit || 0,
              net_profit: (income?.total_income || 0) - (expense?.total_expense || 0),
              monthly_trend: trend || [],
              expense_by_category: expCat || [],
            });
          });
        });
      });
    });
  });
});

// 财务流水
router.get('/records', (req, res) => {
  const { page = 1, pageSize = 30, record_type } = req.query;
  const offset = (page - 1) * pageSize;
  let where = 'WHERE 1=1';
  const params = [];
  if (record_type) { where += ' AND record_type=?'; params.push(record_type); }
  db.get(`SELECT COUNT(*) as total FROM financial_records ${where}`, params, (err, c) => {
    db.all(`SELECT * FROM financial_records ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err2, rows) => {
        res.json({ total: c?.total || 0, list: rows });
      });
  });
});

module.exports = router;
