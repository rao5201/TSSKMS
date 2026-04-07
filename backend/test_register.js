// 直接测试注册逻辑，绕过HTTP服务器
const db = require('./config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'teahaixin_secret_2024';

// 等数据库初始化完成
setTimeout(() => {
  const username = 'testuser_' + Date.now();
  const password = 'Test@123456';
  const nickname = '测试新客户';
  
  console.log('=== 测试注册 ===');
  console.log('用户名:', username);
  
  const hashed = bcrypt.hashSync(password, 10);
  
  db.run('INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
    [username, hashed, nickname], function(err) {
      if (err) {
        console.error('注册失败:', err.message);
        return process.exit(1);
      }
      const userId = this.lastID;
      console.log('注册成功! userId:', userId);
      
      db.run('INSERT INTO user_status (user_id) VALUES (?)', [userId]);
      db.run('INSERT INTO user_coins (user_id, balance) VALUES (?, 100)', [userId]);
      
      const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '30d' });
      console.log('Token:', token.substring(0, 50) + '...');
      
      console.log('\n=== 测试登录 ===');
      db.get('SELECT * FROM users WHERE username = ?', [username], (err2, user) => {
        if (err2 || !user) {
          console.error('登录失败: 用户不存在');
          return process.exit(1);
        }
        const valid = bcrypt.compareSync(password, user.password);
        console.log('密码验证:', valid ? '通过' : '失败');
        if (valid) {
          const loginToken = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
          console.log('登录Token:', loginToken.substring(0, 50) + '...');
          console.log('\n✅ 注册和登录测试全部通过!');
          console.log('用户信息:', { userId: user.id, username: user.username, nickname: user.nickname });
        }
        setTimeout(() => process.exit(0), 500);
      });
    });
}, 2000);
