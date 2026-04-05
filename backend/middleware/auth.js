/**
 * 管理员鉴权中间件
 * 角色说明：
 *   admin   - 超级管理员，可执行所有操作（查看 + 操作）
 *   service - 客服，只能查看（只读），不能执行封禁、删除等写操作
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'teahaixin_secret_2024';

/**
 * 验证管理员 token（admin + service 均可通过）
 */
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录，请先登录管理后台' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.role) return res.status(403).json({ error: '权限不足' });
    req.admin = decoded; // { id, username, role }
    next();
  } catch (e) {
    res.status(401).json({ error: 'token 已过期，请重新登录' });
  }
}

/**
 * 仅超级管理员可执行的操作（封禁、删除、修改配置等写操作）
 * service 角色调用此接口会返回 403
 */
function requireSuperAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录，请先登录管理后台' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: '权限不足，此操作仅超级管理员可执行' });
    }
    req.admin = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'token 已过期，请重新登录' });
  }
}

module.exports = { requireAdmin, requireSuperAdmin };
