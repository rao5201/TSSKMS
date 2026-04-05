const express = require('express');
const router = express.Router();
const db = require('../config/database');

// AI 情绪分析生成接口（模拟实现，可接入真实AI API）
router.post('/emotion', (req, res) => {
  const { text, userId } = req.body;
  if (!text) return res.status(400).json({ error: '文本不能为空' });

  // 情绪关键词匹配（简单实现）
  const emotions = {
    happy: ['开心', '快乐', '高兴', '喜悦', '幸福', '棒', '好', '爱', '美'],
    sad: ['难过', '伤心', '悲伤', '哭', '痛苦', '失落', '绝望'],
    angry: ['生气', '愤怒', '烦', '讨厌', '恨', '气死'],
    calm: ['平静', '宁静', '安静', '放松', '淡然', '清晨', '茶'],
    anxious: ['焦虑', '紧张', '担心', '害怕', '压力', '不安'],
  };

  let detectedEmotion = 'calm';
  let maxScore = 0;
  for (const [emotion, keywords] of Object.entries(emotions)) {
    const score = keywords.filter(k => text.includes(k)).length;
    if (score > maxScore) { maxScore = score; detectedEmotion = emotion; }
  }

  const emotionMap = {
    happy: { label: '开心', color: '#FFD700', emoji: '😊', poem: '茶香入心，喜悦如春风荡漾。' },
    sad: { label: '悲伤', color: '#6B8EC8', emoji: '😢', poem: '镜中映泪，情绪如茶般沉淀，终将回甘。' },
    angry: { label: '愤怒', color: '#FF6B6B', emoji: '😠', poem: '火与茶相遇，热烈之后归于宁静。' },
    calm: { label: '平静', color: '#6B8E23', emoji: '😌', poem: '以茶为镜，照见内心最真实的模样。' },
    anxious: { label: '焦虑', color: '#FFA07A', emoji: '😰', poem: '停下脚步，一杯茶的时间，让心归于本处。' },
  };

  const result = emotionMap[detectedEmotion];

  // 保存情绪记录
  if (userId) {
    db.run('INSERT INTO emotions (user_id, text, emotion) VALUES (?, ?, ?)',
      [userId, text, detectedEmotion]);
  }

  res.json({
    emotion: detectedEmotion,
    label: result.label,
    color: result.color,
    emoji: result.emoji,
    poem: result.poem,
    confidence: Math.min(0.6 + maxScore * 0.1, 0.99),
  });
});

// 生成情绪周报
router.get('/weekly/:userId', (req, res) => {
  db.all(`SELECT emotion, COUNT(*) as count FROM emotions 
    WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
    GROUP BY emotion ORDER BY count DESC`,
    [req.params.userId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const total = rows.reduce((sum, r) => sum + r.count, 0);
      const report = rows.map(r => ({ ...r, percentage: Math.round(r.count / total * 100) }));
      res.json({ report, total, period: '最近7天' });
    });
});

module.exports = router;
