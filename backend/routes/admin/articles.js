const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { verifyAdmin, requirePermission } = require('../../middleware/adminAuth');

router.use(verifyAdmin);

// 获取文章列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 20, status, category, column, keyword } = req.query;
  const offset = (page - 1) * pageSize;
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND a.status=?'; params.push(status); }
  if (category) { where += ' AND a.category=?'; params.push(category); }
  if (column) { where += ' AND a.column=?'; params.push(column); }
  if (keyword) { where += ' AND (a.title LIKE ? OR a.summary LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

  db.get(`SELECT COUNT(*) as total FROM articles a ${where}`, params, (err, c) => {
    db.all(`SELECT a.id,a.title,a.summary,a.category,a.column,a.status,a.author_name,
      a.is_top,a.views_count,a.published_at,a.created_at
      FROM articles a ${where} ORDER BY a.is_top DESC, a.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset], (err2, rows) => {
        res.json({ total: c?.total || 0, list: rows });
      });
  });
});

// 获取文章详情
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM articles WHERE id=?', [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ error: '文章不存在' });
    res.json(row);
  });
});

// 新增/编辑文章（editor 以上权限）
router.post('/', requirePermission('write'), (req, res) => {
  const { title, content, summary, cover_image, category, column, tags, is_top } = req.body;
  if (!title) return res.status(400).json({ error: '标题不能为空' });
  
  // service只读，editor可提交待审核，admin可直接发布
  const status = req.admin.role === 'admin' ? 'published' : 'pending';
  const published_at = status === 'published' ? new Date().toISOString() : null;

  db.run(`INSERT INTO articles (title,content,summary,cover_image,category,column,tags,author_id,author_name,status,published_at,is_top)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [title, content, summary, cover_image, category || 'news', column || 'default', JSON.stringify(tags || []),
     req.admin.id, req.admin.username, status, published_at, is_top ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID, status });
    });
});

// 更新文章
router.put('/:id', requirePermission('write'), (req, res) => {
  const { title, content, summary, cover_image, category, column, tags, is_top } = req.body;
  db.run(`UPDATE articles SET title=?,content=?,summary=?,cover_image=?,category=?,column=?,tags=?,is_top=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [title, content, summary, cover_image, category, column, JSON.stringify(tags || []), is_top ? 1 : 0, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

// 审核文章（仅 admin）
router.post('/:id/review', requirePermission('review'), (req, res) => {
  const { action, comment } = req.body; // action: approve | reject
  const status = action === 'approve' ? 'published' : 'rejected';
  const published_at = action === 'approve' ? new Date().toISOString() : null;
  db.run(`UPDATE articles SET status=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,review_comment=?,published_at=? WHERE id=?`,
    [status, req.admin.id, comment, published_at, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, status });
    });
});

// 删除文章（仅admin）
router.delete('/:id', requirePermission('delete'), (req, res) => {
  db.run('UPDATE articles SET status=? WHERE id=?', ['deleted', req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 待审核文章列表（admin审核用）
router.get('/pending/list', requirePermission('review'), (req, res) => {
  db.all(`SELECT id,title,category,column,author_name,created_at FROM articles WHERE status='pending' ORDER BY created_at ASC`, [], (err, rows) => {
    res.json(rows || []);
  });
});

module.exports = router;
