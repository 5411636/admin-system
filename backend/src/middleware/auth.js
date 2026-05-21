const jwt = require('jsonwebtoken');

let db = null;

// 设置db引用
const setDb = (database) => {
  db = database;
};

// 验证JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证token' });
  }

  const { JWT_SECRET } = require('../config');
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '无效的token' });
    }
    req.user = user;
    next();
  });
};

// 检查权限
const checkPermission = (permission) => {
  return (req, res, next) => {
    const userRole = db.users.find(u => u.id === req.user.id)?.role;
    const role = db.roles.find(r => r.code === userRole);

    if (!role) {
      return res.status(403).json({ success: false, message: '角色不存在' });
    }

    if (role.permissions.includes('all') || role.permissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({ success: false, message: '权限不足' });
    }
  };
};

module.exports = { authenticateToken, checkPermission, setDb };