require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
// 数据库
const db = require('./config/database');
// 路由
const generateRoutes = require('./routes/generate');
const userRoutes = require('./routes/user');
const momentsRoutes = require('./routes/moments');
const videosRoutes = require('./routes/videos');
const liveRoutes = require('./routes/live');
const topicsRoutes = require('./routes/topics');
const giftsRoutes = require('./routes/gifts');
const chatRoutes = require('./routes/chat');
const friendsRoutes = require('./routes/friends');
const nearbyRoutes = require('./routes/nearby');
const mapRoutes = require('./routes/map');
const reportRoutes = require('./routes/report');
// 后台路由
const adminAuthRoutes = require('./routes/admin/auth');
const adminUserRoutes = require('./routes/admin/users');
const adminContentRoutes = require('./routes/admin/content');
const adminReportRoutes = require('./routes/admin/reports');
const adminStatsRoutes = require('./routes/admin/stats');
const adminConfigRoutes = require('./routes/admin/config');
const adminLogRoutes = require('./routes/admin/logs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 3001;
// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 注册路由
app.use('/api/generate', generateRoutes);
app.use('/api/user', userRoutes);
app.use('/api/moments', momentsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/gifts', giftsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/nearby', nearbyRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/report', reportRoutes);
// 后台路由
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/content', adminContentRoutes);
app.use('/api/admin/reports', adminReportRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/config', adminConfigRoutes);
app.use('/api/admin/logs', adminLogRoutes);
// WebSocket 实时通信
io.on('connection', (socket) => {
  console.log('🦐 新客户端连接');
  let currentUserId = null;
  socket.on('login', (userId) => {
    currentUserId = userId;
    socket.join(user_\);
    socket.broadcast.emit('friend_online', { userId });
  });
  socket.on('private_message', (data) => {
    const { toUserId, message } = data;
    db.run(
      'INSERT INTO messages (from_user_id, to_user_id, message) VALUES (?, ?, ?)',
      [currentUserId, toUserId, message],
      function(err) {
        if (!err) {
          io.to(user_\).emit('new_message', {
            id: this.lastID,
            from_user_id: currentUserId,
            to_user_id: toUserId,
            message,
            created_at: new Date().toISOString()
          });
        }
      }
    );
  });
  socket.on('typing', (data) => {
    const { toUserId, isTyping } = data;
    io.to(user_\).emit('user_typing', {
      fromUserId: currentUserId,
      isTyping
    });
  });
  socket.on('disconnect', () => {
    if (currentUserId) {
      db.run(
        'UPDATE user_status SET is_online = 0, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?',
        [currentUserId]
      );
      socket.broadcast.emit('friend_offline', { userId: currentUserId });
    }
  });
});
// 启动服务器
server.listen(PORT, () => {
  console.log(\
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║     🦐 茶海虾王·镜心 - 情绪社交平台                      ║
  ║     Tea Sea Shrimp King · Mirror Soul                    ║
  ║                                                          ║
  ║     后端服务已启动                                       ║
  ║     http://localhost:\                             ║
  ║                                                          ║
  ║     以茶为镜，照见本心                                   ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
  \);
});
module.exports = { app, server, io };

