require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, 'teahaixin.db');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {

  // ───────────────── 版本记录 ─────────────────
  db.run(`CREATE TABLE IF NOT EXISTS app_version (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT, release_date DATETIME, changelog TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`INSERT OR IGNORE INTO app_version (id, version, release_date, changelog)
    VALUES (1, '2.0.0', datetime('now'), '后台管理系统全面升级 v2.0')`);

  // ───────────────── 用户表 ─────────────────
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE, nickname TEXT, password TEXT,
    avatar TEXT, bio TEXT, gender TEXT DEFAULT 'unknown',
    birthday TEXT, location TEXT, latitude REAL, longitude REAL,
    phone TEXT, email TEXT,
    status TEXT DEFAULT 'active',
    last_login DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_status (
    user_id INTEGER PRIMARY KEY, is_online INTEGER DEFAULT 0,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_coins (
    user_id INTEGER PRIMARY KEY, balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0, total_spent INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // ───────────────── 管理员/角色表 ─────────────────
  // role: admin(超级管理员) | finance(财务审计) | service(客服只读) | editor(内容编辑)
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE, password TEXT,
    role TEXT DEFAULT 'service',
    display_name TEXT, email TEXT, avatar TEXT,
    status TEXT DEFAULT 'active',
    last_login DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ───────────────── 供应商表 ─────────────────
  db.run(`CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, code TEXT UNIQUE,
    contact_person TEXT, phone TEXT, email TEXT,
    address TEXT, city TEXT, province TEXT,
    category TEXT, -- 供应商分类
    credit_level TEXT DEFAULT 'A', -- 信用等级 A/B/C/D
    payment_terms INTEGER DEFAULT 30, -- 账期(天)
    bank_name TEXT, bank_account TEXT,
    tax_id TEXT, -- 税号
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_by INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ───────────────── 产品信息表 ─────────────────
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE, name TEXT NOT NULL,
    category TEXT, sub_category TEXT,
    description TEXT,
    unit TEXT DEFAULT '件', -- 计量单位
    cost_price REAL DEFAULT 0, -- 成本价
    selling_price REAL DEFAULT 0, -- 销售价
    min_price REAL DEFAULT 0, -- 最低价
    stock INTEGER DEFAULT 0, -- 库存
    min_stock INTEGER DEFAULT 10, -- 预警库存
    supplier_id INTEGER,
    status TEXT DEFAULT 'active',
    image_url TEXT,
    created_by INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
  )`);

  // ───────────────── 销售订单表 ─────────────────
  db.run(`CREATE TABLE IF NOT EXISTS sales_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE,
    customer_name TEXT, customer_phone TEXT,
    user_id INTEGER, -- 关联平台用户
    product_id INTEGER,
    quantity INTEGER DEFAULT 1,
    unit_price REAL,
    total_amount REAL,
    discount REAL DEFAULT 0,
    actual_amount REAL,
    cost_amount REAL, -- 成本
    gross_profit REAL, -- 毛利
    status TEXT DEFAULT 'pending', -- pending/paid/cancelled/refunded
    payment_method TEXT,
    notes TEXT,
    created_by INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);

  // ───────────────── 费用记录表 ─────────────────
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 类别: 运营/营销/人工/采购/其他
    amount REAL NOT NULL,
    supplier_id INTEGER,
    invoice_no TEXT, -- 发票号
    expense_date DATE,
    payment_status TEXT DEFAULT 'unpaid', -- unpaid/paid
    payment_date DATE,
    notes TEXT,
    created_by INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
  )`);

  // ───────────────── 财务流水表 ─────────────────
  db.run(`CREATE TABLE IF NOT EXISTS financial_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_type TEXT NOT NULL, -- income/expense
    source_type TEXT, -- sales/gift/expense/refund
    source_id INTEGER,
    amount REAL NOT NULL,
    balance_after REAL,
    description TEXT,
    record_date DATE DEFAULT (date('now')),
    created_by INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ───────────────── 文章/内容表 ─────────────────
  db.run(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    cover_image TEXT,
    category TEXT DEFAULT 'news', -- news/notice/activity/product/other
    column TEXT DEFAULT 'default', -- 网站栏目
    tags TEXT, -- JSON数组
    author_id INTEGER, -- 提交者(admin id)
    author_name TEXT,
    status TEXT DEFAULT 'draft', -- draft/pending/published/rejected
    reviewed_by INTEGER, -- 审核管理员id
    reviewed_at DATETIME,
    review_comment TEXT,
    published_at DATETIME,
    views_count INTEGER DEFAULT 0,
    is_top INTEGER DEFAULT 0, -- 是否置顶
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ───────────────── 附件/文件上传表 ─────────────────
  db.run(`CREATE TABLE IF NOT EXISTS file_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    file_url TEXT,
    category TEXT DEFAULT 'general', -- general/article/product/supplier
    related_id INTEGER,
    status TEXT DEFAULT 'pending', -- pending/approved/rejected
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    uploaded_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ───────────────── 内容表(原有) ─────────────────
  db.run(`CREATE TABLE IF NOT EXISTS emotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, text TEXT, emotion TEXT,
    image_url TEXT, audio_url TEXT, poem_text TEXT,
    location TEXT, latitude REAL, longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS moments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, content TEXT, emotion TEXT,
    image_url TEXT, location TEXT,
    likes_count INTEGER DEFAULT 0, comments_count INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1, status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS moment_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moment_id INTEGER, user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(moment_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS moment_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moment_id INTEGER, user_id INTEGER, content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, title TEXT, description TEXT,
    video_url TEXT, cover_url TEXT, duration INTEGER,
    views_count INTEGER DEFAULT 0, likes_count INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1, status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS live_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, title TEXT, description TEXT,
    stream_key TEXT, stream_url TEXT, cover_image TEXT,
    status TEXT DEFAULT 'offline', viewers_count INTEGER DEFAULT 0,
    started_at DATETIME, ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS gifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, icon TEXT, price INTEGER,
    is_hot INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS gift_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER, to_user_id INTEGER,
    gift_id INTEGER, room_id INTEGER, amount INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, friend_id INTEGER,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER, to_user_id INTEGER,
    message TEXT, message_type TEXT DEFAULT 'text',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE, description TEXT, cover_image TEXT,
    posts_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER, target_id INTEGER, target_type TEXT,
    reason TEXT, status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE, value TEXT, description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER, action TEXT,
    target_type TEXT, target_id INTEGER,
    details TEXT, ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ───────────────── 初始化管理员账号 ─────────────────
  db.get('SELECT COUNT(*) as count FROM admins', (err, result) => {
    if (!err && result && result.count === 0) {
      const hAdmin   = bcrypt.hashSync('Admin@2024', 10);
      const hFinance = bcrypt.hashSync('Finance@2024', 10);
      const hService = bcrypt.hashSync('Service@2024', 10);
      const hEditor  = bcrypt.hashSync('Editor@2024', 10);

      db.run('INSERT INTO admins (username, password, role, display_name) VALUES (?,?,?,?)',
        ['admin', hAdmin, 'admin', '超级管理员']);
      db.run('INSERT INTO admins (username, password, role, display_name) VALUES (?,?,?,?)',
        ['finance', hFinance, 'finance', '财务审计']);
      db.run('INSERT INTO admins (username, password, role, display_name) VALUES (?,?,?,?)',
        ['service', hService, 'service', '客服专员']);
      db.run('INSERT INTO admins (username, password, role, display_name) VALUES (?,?,?,?)',
        ['editor', hEditor, 'editor', '内容编辑']);

      console.log('✅ 默认管理员账号已创建:');
      console.log('   admin   / Admin@2024   (超级管理员)');
      console.log('   finance / Finance@2024 (财务审计)');
      console.log('   service / Service@2024 (客服只读)');
      console.log('   editor  / Editor@2024  (内容编辑)');
    }
  });

  // 初始化礼物
  db.get('SELECT COUNT(*) as count FROM gifts', (err, result) => {
    if (!err && result && result.count === 0) {
      [
        { name: '❤️ 爱心', icon: '❤️', price: 10, is_hot: 1, sort_order: 1 },
        { name: '🪞 镜心', icon: '🪞', price: 30, is_hot: 1, sort_order: 2 },
        { name: '🍵 茶香', icon: '🍵', price: 20, is_hot: 1, sort_order: 3 },
        { name: '🦐 虾王', icon: '🦐', price: 100, is_hot: 1, sort_order: 4 },
        { name: '💎 钻石', icon: '💎', price: 500, is_hot: 1, sort_order: 5 },
        { name: '🌸 樱花', icon: '🌸', price: 50, is_hot: 0, sort_order: 6 },
        { name: '🎵 音符', icon: '🎵', price: 15, is_hot: 0, sort_order: 7 },
      ].forEach(g => {
        db.run('INSERT INTO gifts (name, icon, price, is_hot, sort_order) VALUES (?,?,?,?,?)',
          [g.name, g.icon, g.price, g.is_hot, g.sort_order]);
      });
    }
  });

  // 初始化系统配置
  db.get('SELECT COUNT(*) as count FROM system_config', (err, result) => {
    if (!err && result && result.count === 0) {
      [
        { key: 'app_name', value: '茶海虾王·镜心', description: '应用名称' },
        { key: 'app_version', value: '2.0.0', description: '当前版本' },
        { key: 'register_enabled', value: '1', description: '是否开放注册' },
        { key: 'ai_enabled', value: '1', description: '是否启用AI功能' },
        { key: 'review_required', value: '1', description: '文章是否需要审核' },
      ].forEach(c => {
        db.run('INSERT OR IGNORE INTO system_config (key, value, description) VALUES (?,?,?)',
          [c.key, c.value, c.description]);
      });
    }
  });

  console.log('✅ 数据库初始化完成 v2.0 - 茶海虾王·镜心');
});

module.exports = db;
