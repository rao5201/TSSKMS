require('dotenv').config();
const mysql = require('mysql2/promise');

// Aiven MySQL 需要 SSL
const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql6.sqlpub.com',
  port: parseInt(process.env.DB_PORT) || 3311,
  user: process.env.DB_USER || 'teahaixin',
  password: process.env.DB_PASSWORD || 'PBJqnnkInd7d1b3J',
  database: process.env.DB_NAME || 'teahaixin',
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 全局连接用于同步操作
let mainConnection = null;

async function getConnection() {
  if (!mainConnection) {
    mainConnection = await pool.getConnection();
  }
  return mainConnection;
}

// 初始化数据库表
async function initDatabase() {
  const conn = await pool.getConnection();
  try {
    // 创建所有表...
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE, nickname VARCHAR(100), password VARCHAR(255),
        avatar TEXT, bio TEXT, gender VARCHAR(20) DEFAULT 'unknown',
        birthday VARCHAR(20), location VARCHAR(255), latitude DOUBLE, longitude DOUBLE,
        phone VARCHAR(50), email VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        last_login DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_status (
        user_id INT PRIMARY KEY, is_online INT DEFAULT 0,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_coins (
        user_id INT PRIMARY KEY, balance INT DEFAULT 0,
        total_earned INT DEFAULT 0, total_spent INT DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE, password VARCHAR(255),
        role VARCHAR(20) DEFAULT 'service',
        display_name VARCHAR(100), email VARCHAR(100), avatar TEXT,
        status VARCHAR(20) DEFAULT 'active',
        last_login DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL, code VARCHAR(50) UNIQUE,
        contact_person VARCHAR(100), phone VARCHAR(50), email VARCHAR(100),
        address TEXT, city VARCHAR(50), province VARCHAR(50),
        category VARCHAR(50),
        credit_level VARCHAR(10) DEFAULT 'A',
        payment_terms INT DEFAULT 30,
        bank_name VARCHAR(100), bank_account VARCHAR(100),
        tax_id VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        created_by INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(50) UNIQUE, name VARCHAR(255) NOT NULL,
        category VARCHAR(50), sub_category VARCHAR(50),
        description TEXT,
        unit VARCHAR(20) DEFAULT '件',
        cost_price DOUBLE DEFAULT 0,
        selling_price DOUBLE DEFAULT 0,
        min_price DOUBLE DEFAULT 0,
        stock INT DEFAULT 0,
        min_stock INT DEFAULT 10,
        supplier_id INT,
        status VARCHAR(20) DEFAULT 'active',
        image_url TEXT,
        created_by INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
        INDEX idx_sku (sku),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_no VARCHAR(50) UNIQUE,
        customer_name VARCHAR(100), customer_phone VARCHAR(50),
        user_id INT,
        product_id INT,
        quantity INT DEFAULT 1,
        unit_price DOUBLE,
        total_amount DOUBLE,
        discount DOUBLE DEFAULT 0,
        actual_amount DOUBLE,
        cost_amount DOUBLE,
        gross_profit DOUBLE,
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        notes TEXT,
        created_by INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL,
        INDEX idx_order_no (order_no),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount DOUBLE NOT NULL,
        supplier_id INT,
        invoice_no VARCHAR(100),
        expense_date DATE,
        payment_status VARCHAR(20) DEFAULT 'unpaid',
        payment_date DATE,
        notes TEXT,
        created_by INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
        INDEX idx_category (category),
        INDEX idx_expense_date (expense_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS financial_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        record_type VARCHAR(20) NOT NULL,
        source_type VARCHAR(50),
        source_id INT,
        amount DOUBLE NOT NULL,
        balance_after DOUBLE,
        description TEXT,
        record_date DATE DEFAULT (CURRENT_DATE),
        created_by INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_record_type (record_type),
        INDEX idx_record_date (record_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        summary TEXT,
        cover_image TEXT,
        category VARCHAR(50) DEFAULT 'news',
        \`column\` VARCHAR(50) DEFAULT 'default',
        tags TEXT,
        author_id INT,
        author_name VARCHAR(100),
        status VARCHAR(20) DEFAULT 'draft',
        reviewed_by INT,
        reviewed_at DATETIME,
        review_comment TEXT,
        published_at DATETIME,
        views_count INT DEFAULT 0,
        is_top INT DEFAULT 0,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        file_type VARCHAR(50),
        file_size BIGINT,
        file_url TEXT,
        category VARCHAR(50) DEFAULT 'general',
        related_id INT,
        status VARCHAR(20) DEFAULT 'pending',
        reviewed_by INT,
        reviewed_at DATETIME,
        uploaded_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS emotions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT, text TEXT, emotion VARCHAR(50),
        image_url TEXT, audio_url TEXT, poem_text TEXT,
        location VARCHAR(255), latitude DOUBLE, longitude DOUBLE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS moments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT, content TEXT, emotion VARCHAR(50),
        image_url TEXT, location VARCHAR(255),
        likes_count INT DEFAULT 0, comments_count INT DEFAULT 0,
        is_public INT DEFAULT 1, status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS moment_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        moment_id INT, user_id INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (moment_id, user_id),
        FOREIGN KEY(moment_id) REFERENCES moments(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS moment_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        moment_id INT, user_id INT, content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(moment_id) REFERENCES moments(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT, title VARCHAR(255), description TEXT,
        video_url TEXT, cover_url TEXT, duration INT,
        views_count INT DEFAULT 0, likes_count INT DEFAULT 0,
        is_public INT DEFAULT 1, status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS live_rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT, title VARCHAR(255), description TEXT,
        stream_key VARCHAR(255), stream_url TEXT, cover_image TEXT,
        status VARCHAR(20) DEFAULT 'offline', viewers_count INT DEFAULT 0,
        started_at DATETIME, ended_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS gifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100), icon VARCHAR(100), price INT,
        is_hot INT DEFAULT 0, sort_order INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS gift_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_user_id INT, to_user_id INT,
        gift_id INT, room_id INT, amount INT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS friendships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT, friend_id INT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_friend (user_id, friend_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(friend_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_user_id INT, to_user_id INT,
        message TEXT, message_type VARCHAR(20) DEFAULT 'text',
        is_read INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_from_to (from_user_id, to_user_id),
        FOREIGN KEY(from_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(to_user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS topics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE, description TEXT, cover_image TEXT,
        posts_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reporter_id INT, target_id INT, target_type VARCHAR(50),
        reason TEXT, status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS system_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(100) UNIQUE, value TEXT, description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT, action VARCHAR(100),
        target_type VARCHAR(50), target_id INT,
        details TEXT, ip VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin_id (admin_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS app_version (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(50), release_date DATETIME, changelog TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 初始化管理员
    const [adminRows] = await conn.execute('SELECT COUNT(*) as c FROM admins');
    if (adminRows[0].c === 0) {
      const bcrypt = require('bcryptjs');
      const hAdmin = bcrypt.hashSync('Admin@2024', 10);
      const hFinance = bcrypt.hashSync('Finance@2024', 10);
      const hService = bcrypt.hashSync('Service@2024', 10);
      const hEditor = bcrypt.hashSync('Editor@2024', 10);

      await conn.execute('INSERT INTO admins (username, password, role, display_name) VALUES (?,?,?,?)',
        ['admin', hAdmin, 'admin', '超级管理员']);
      await conn.execute('INSERT INTO admins (username, password, role, display_name) VALUES (?,?,?,?)',
        ['finance', hFinance, 'finance', '财务审计']);
      await conn.execute('INSERT INTO admins (username, password, role, display_name) VALUES (?,?,?,?)',
        ['service', hService, 'service', '客服专员']);
      await conn.execute('INSERT INTO admins (username, password, role, display_name) VALUES (?,?,?,?)',
        ['editor', hEditor, 'editor', '内容编辑']);

      console.log('✅ 默认管理员账号已创建:');
      console.log('   admin / Admin@2024 (超级管理员)');
      console.log('   finance / Finance@2024 (财务审计)');
      console.log('   service / Service@2024 (客服只读)');
      console.log('   editor / Editor@2024 (内容编辑)');
    }

    // 初始化礼物
    const [giftRows] = await conn.execute('SELECT COUNT(*) as c FROM gifts');
    if (giftRows[0].c === 0) {
      const gifts = [
        ['❤️ 爱心', '❤️', 10, 1, 1],
        ['🪞 镜心', '🪞', 30, 1, 2],
        ['🍵 茶香', '🍵', 20, 1, 3],
        ['🦐 虾王', '🦐', 100, 1, 4],
        ['💎 钻石', '💎', 500, 1, 5],
        ['🌸 樱花', '🌸', 50, 0, 6],
        ['🎵 音符', '🎵', 15, 0, 7],
      ];
      for (const g of gifts) {
        await conn.execute('INSERT INTO gifts (name, icon, price, is_hot, sort_order) VALUES (?,?,?,?,?)', g);
      }
    }

    // 初始化系统配置
    const [configRows] = await conn.execute('SELECT COUNT(*) as c FROM system_config');
    if (configRows[0].c === 0) {
      const configs = [
        ['app_name', '茶海虾王·镜心', '应用名称'],
        ['app_version', '2.0.0', '当前版本'],
        ['register_enabled', '1', '是否开放注册'],
        ['ai_enabled', '1', '是否启用AI功能'],
        ['review_required', '1', '文章是否需要审核'],
      ];
      for (const c of configs) {
        await conn.execute('INSERT INTO system_config (`key`, value, description) VALUES (?,?,?)', c);
      }
    }

    console.log('✅ MySQL 数据库初始化完成 - 茶海虾王·镜心');
  } finally {
    conn.release();
  }
}

// SQLite 兼容层
class MySQLiteCompat {
  constructor() {
    this._initPromise = initDatabase();
  }

  async _ensureInit() {
    await this._initPromise;
  }

  // 同步风格 run - 传入 callback
  run(sql, params, callback) {
    this._ensureInit().then(async () => {
      try {
        const conn = await pool.getConnection();
        const [result] = await conn.execute(sql, params || []);
        conn.release();
        if (callback) callback(null, { lastID: result.insertId, changes: result.affectedRows });
      } catch (err) {
        if (callback) callback(err);
      }
    });
  }

  // 同步风格 get
  get(sql, params, callback) {
    this._ensureInit().then(async () => {
      try {
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(sql, params || []);
        conn.release();
        if (callback) callback(null, rows[0] || null);
      } catch (err) {
        if (callback) callback(err);
      }
    });
  }

  // 同步风格 all
  all(sql, params, callback) {
    this._ensureInit().then(async () => {
      try {
        const conn = await pool.getConnection();
        const [rows] = await conn.execute(sql, params || []);
        conn.release();
        if (callback) callback(null, rows);
      } catch (err) {
        if (callback) callback(err);
      }
    });
  }

  // Promise 版本
  runAsync(sql, params) {
    return this._ensureInit().then(async () => {
      const conn = await pool.getConnection();
      const [result] = await conn.execute(sql, params || []);
      conn.release();
      return { lastID: result.insertId, changes: result.affectedRows };
    });
  }

  getAsync(sql, params) {
    return this._ensureInit().then(async () => {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(sql, params || []);
      conn.release();
      return rows[0] || null;
    });
  }

  allAsync(sql, params) {
    return this._ensureInit().then(async () => {
      const conn = await pool.getConnection();
      const [rows] = await conn.execute(sql, params || []);
      conn.release();
      return rows;
    });
  }
}

const db = new MySQLiteCompat();
module.exports = db;
