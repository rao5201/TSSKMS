const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database(path.join(__dirname, '../teahaixin.db'));
// 初始化数据库表
db.serialize(() => {  // 应用版本记录表
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
  db.run(\`INSERT OR IGNORE INTO app_version (version, release_date, changelog) 
         VALUES ('1.0.3', datetime('now'), '镜心AI 2.0 升级，性能优化，问题修复')\`);
  // 用户表
  db.run(\
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      avatar TEXT,
      status TEXT DEFAULT 'active',
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  \);
  // 情绪记录表
  db.run(\
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
  \);
  // 朋友圈动态表
  db.run(\
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
  \);
  // 视频表
  db.run(\
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  \);
  // 直播间表
  db.run(\
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
  \);
  // 礼物表
  db.run(\
    CREATE TABLE IF NOT EXISTS gifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      icon TEXT,
      price INTEGER,
      is_hot INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    )
  \);
  // 用户金币表
  db.run(\
    CREATE TABLE IF NOT EXISTS user_coins (
      user_id INTEGER PRIMARY KEY,
      balance INTEGER DEFAULT 0,
      total_earned INTEGER DEFAULT 0,
      total_spent INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  \);
  // 好友关系表
  db.run(\
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
  \);
  // 消息表
  db.run(\
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER,
      to_user_id INTEGER,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(from_user_id) REFERENCES users(id),
      FOREIGN KEY(to_user_id) REFERENCES users(id)
    )
  \);
  // 管理员表
  db.run(\
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'editor',
      avatar TEXT,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  \);
  // 初始化管理员账号
  db.get('SELECT COUNT(*) as count FROM admins', (err, result) => {
    if (result.count === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run('INSERT INTO admins (username, password, role) VALUES (?, ?, ?)', 
        ['admin', hashedPassword, 'admin']);
      db.run('INSERT INTO admins (username, password, role) VALUES (?, ?, ?)', 
        ['editor', hashedPassword, 'editor']);
    }
  });
  // 初始化礼物
  db.get('SELECT COUNT(*) as count FROM gifts', (err, result) => {
    if (result.count === 0) {
      const gifts = [
        { name: '❤️ 爱心', icon: '❤️', price: 10, is_hot: 1, sort_order: 1 },
        { name: '🪞 镜心', icon: '🪞', price: 30, is_hot: 1, sort_order: 2 },
        { name: '🍵 茶香', icon: '🍵', price: 20, is_hot: 1, sort_order: 3 },
        { name: '🦐 虾王', icon: '🦐', price: 100, is_hot: 1, sort_order: 4 },
        { name: '💎 钻石', icon: '💎', price: 500, is_hot: 1, sort_order: 5 }
      ];
      gifts.forEach(g => {
        db.run('INSERT INTO gifts (name, icon, price, is_hot, sort_order) VALUES (?, ?, ?, ?, ?)',
          [g.name, g.icon, g.price, g.is_hot, g.sort_order]);
      });
    }
  });
  console.log('✅ 数据库初始化完成 - 茶海虾王·镜心');
});
module.exports = db;

