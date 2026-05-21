const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  const user = db.users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ success: false, message: '账号已被禁用' });
  }

  // 简化密码验证（生产环境应使用bcrypt）
  // bcrypt.compare(password, user.password, (err, result) => {
  //   if (err || !result) {
  //     return res.status(401).json({ success: false, message: '用户名或密码错误' });
  //   }
  // });

  // 演示密码：admin123
  if (password !== 'admin123') {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    success: true,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
      }
    }
  });
});

// 获取当前用户信息
router.get('/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      createdAt: user.createdAt
    }
  });
});

// 修改密码
router.put('/password', authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: '旧密码和新密码不能为空' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: '新密码至少6位' });
  }

  const userIndex = db.users.findIndex(u => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  // 演示密码验证
  if (oldPassword !== 'admin123') {
    return res.status(401).json({ success: false, message: '旧密码错误' });
  }

  // 生产环境应使用bcrypt
  // db.users[userIndex].password = bcrypt.hashSync(newPassword, 10);

  res.json({ success: true, message: '密码修改成功' });
});

module.exports = router;