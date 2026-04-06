const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'teahaixin_secret_2024';

// 角色权限定义
// admin   - 全部权限
// finance - 财务/审计查看+导出，无内容删除权
// editor  - 文章添加/编辑，文件上传，无删除用户权
// service - 仅查看，无任何写权限
const ROLE_PERMISSIONS = {
  admin:   ['read', 'write', 'delete', 'finance', 'config', 'review'],
  finance: ['read', 'finance'],
  editor:  ['read', 'write', 'upload'],
  service: ['read'],
};

function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded; // { id, username, role }
    next();
  } catch (e) {
    res.status(401).json({ error: 'token无效或已过期' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: '未登录' });
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: `无权限，需要角色: ${roles.join('/')}` });
    }
    next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: '未登录' });
    const perms = ROLE_PERMISSIONS[req.admin.role] || [];
    if (!perms.includes(permission)) {
      return res.status(403).json({ error: `无此操作权限 [${permission}]` });
    }
    next();
  };
}

// 普通用户(app端)无任何后台权限——后台所有接口必须过 verifyAdmin
function blockAppUser(req, res, next) {
  // App用户token不含role字段或role不在admin列表
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '无访问权限' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminRoles = ['admin', 'finance', 'editor', 'service'];
    if (!adminRoles.includes(decoded.role)) {
      return res.status(403).json({ error: '普通用户无后台权限' });
    }
    req.admin = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'token无效' });
  }
}

module.exports = { verifyAdmin, requireRole, requirePermission, blockAppUser, ROLE_PERMISSIONS };
