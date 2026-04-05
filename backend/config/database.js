const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// 云端使用持久化磁盘目录，本地使用项目根目录
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, 'teahaixin.db');

const db = new sqlite3.Database(DB_PATH);

// 初始化数据库表
db.serialize(() => {

  // 应用版本记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS app_version (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT,
      release_date DATETIME,
      changelog TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 记录当前版本
  db.run(`INSERT OR IGNORE INTO app_version (id, version, release_date, changelog) 
         VALUES (1, '1.0.3', datetime('now'), '镜心AI 2.0 升级，性能优化，问题修复')`);

  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      nickname TEXT,
      password TEXT,
      avatar TEXT,
      bio TEXT,
      gender TEXT DEFAULT 'unknown',
      birthday TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      status TEXT DEFAULT 'active',
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 用户在线状态表
  db.run(`
    CREATE TABLE IF NOT EXISTS user_status (
      user_id INTEGER PRIMARY KEY,
      is_online INTEGER DEFAULT 0,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // 情绪记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS emotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      text TEXT,
      emotion TEXT,
      image_url TEXT,
      audio_url TEXT,
      poem_text TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // 朋友圈动态表
  db.run(`
    CREATE TABLE IF NOT EXISTS moments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT,
      emotion TEXT,
      image_url TEXT,
      location TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // 动态点赞表
  db.run(`
    CREATE TABLE IF NOT EXISTS moment_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      moment_id INTEGER,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(moment_id, user_id),
      FOREIGN KEY(moment_id) REFERENCES moments(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // 动态评论表
  db.run(`
    CREATE TABLE IF NOT EXISTS moment_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      moment_id INTEGER,
      user_id INTEGER,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(moment_id) REFERENCES moments(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // 视频表
  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      video_url TEXT,
      cover_url TEXT,
      duration INTEGER,
      views_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // 直播间表
  db.run(`
    CREATE TABLE IF NOT EXISTS live_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      stream_key TEXT,
      stream_url TEXT,
      cover_image TEXT,
      status TEXT DEFAULT 'offline',
      viewers_count INTEGER DEFAULT 0,
      started_at DATETIME,
      ended_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // 礼物表
  db.run(`
    CREATE TABLE IF NOT EXISTS gifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      icon TEXT,
      price INTEGER,
      is_hot INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    )
  `);

  // 礼物记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS gift_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER,
      to_user_id INTEGER,
      gift_id INTEGER,
      room_id INTEGER,
      amount INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(from_user_id) REFERENCES users(id),
      FOREIGN KEY(to_user_id) REFERENCES users(id),
      FOREIGN KEY(gift_id) REFERENCES gifts(id)
    )
  `);

  // 用户金币表
  db.run(`
    CREATE TABLE IF NOT EXISTS user_coins (
      user_id INTEGER PRIMARY KEY,
      balance INTEGER DEFAULT 0,
      total_earned INTEGER DEFAULT 0,
      total_spent INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // 好友关系表
  db.run(`
    CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      friend_id INTEGER,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(friend_id) REFERENCES users(id),
      UNIQUE(user_id, friend_id)
    )
  `);

  // 消息表
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER,
      to_user_id INTEGER,
      message TEXT,
      message_type TEXT DEFAULT 'text',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(from_user_id) REFERENCES users(id),
      FOREIGN KEY(to_user_id) REFERENCES users(id)
    )
  `);

  // 话题标签表
  db.run(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      description TEXT,
      cover_image TEXT,
      posts_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 举报表
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER,
      target_id INTEGER,
      target_type TEXT,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(reporter_id) REFERENCES users(id)
    )
  `);

  // 管理员表
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'editor',
      avatar TEXT,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 系统配置表
  db.run(`
    CREATE TABLE IF NOT EXISTS system_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE,
      value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 操作日志表
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      action TEXT,
      target_type TEXT,
      target_id INTEGER,
      details TEXT,
      ip TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES admins(id)
    )
  `);

  // 初始化管理员账号
  db.get('SELECT COUNT(*) as count FROM admins', (err, result) => {
    if (!err && result && result.count === 0) {
      const hashedAdmin = bcrypt.hashSync('admin123', 10);
      const hashedService = bcrypt.hashSync('service123', 10);
      // 超级管理员：可查看所有数据 + 执行封禁/删除等操作
      db.run('INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedAdmin, 'admin']);
      // 客服账号：只可查看，不能执行写操作
      db.run('INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
        ['service', hashedService, 'service']);
      console.log('✅ 默认管理员账号已创建:');
      console.log('   admin / admin123  （超级管理员，可封禁用户、删除内容）');
      console.log('   service / service123  （客服，只读权限）');
    }
  });

  // 初始化礼物
  db.get('SELECT COUNT(*) as count FROM gifts', (err, result) => {
    if (!err && result && result.count === 0) {
      const gifts = [
        { name: '❤️ 爱心', icon: '❤️', price: 10, is_hot: 1, sort_order: 1 },
        { name: '🪞 镜心', icon: '🪞', price: 30, is_hot: 1, sort_order: 2 },
        { name: '🍵 茶香', icon: '🍵', price: 20, is_hot: 1, sort_order: 3 },
        { name: '🦐 虾王', icon: '🦐', price: 100, is_hot: 1, sort_order: 4 },
        { name: '💎 钻石', icon: '💎', price: 500, is_hot: 1, sort_order: 5 },
        { name: '🌸 樱花', icon: '🌸', price: 50, is_hot: 0, sort_order: 6 },
        { name: '🎵 音符', icon: '🎵', price: 15, is_hot: 0, sort_order: 7 },
      ];
      gifts.forEach(g => {
        db.run('INSERT INTO gifts (name, icon, price, is_hot, sort_order) VALUES (?, ?, ?, ?, ?)',
          [g.name, g.icon, g.price, g.is_hot, g.sort_order]);
      });
    }
  });

  // 初始化系统配置
  db.get('SELECT COUNT(*) as count FROM system_config', (err, result) => {
    if (!err && result && result.count === 0) {
      const configs = [
        { key: 'app_name', value: '茶海虾王·镜心', description: '应用名称' },
        { key: 'app_version', value: '1.0.3', description: '当前版本' },
        { key: 'register_enabled', value: '1', description: '是否开放注册' },
        { key: 'ai_enabled', value: '1', description: '是否启用AI功能' },
      ];
      configs.forEach(c => {
        db.run('INSERT OR IGNORE INTO system_config (key, value, description) VALUES (?, ?, ?)',
          [c.key, c.value, c.description]);
      });
    }
  });

  console.log('✅ 数据库初始化完成 - 茶海虾王·镜心');
});

module.exports = db;
