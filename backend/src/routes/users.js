const express = require('express');
const { db } = require('../config');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// 获取用户列表
router.get('/', authenticateToken, (req, res) => {
  const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query;

  let filteredUsers = [...db.users];

  // 关键词搜索
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredUsers = filteredUsers.filter(u =>
      u.username.toLowerCase().includes(lowerKeyword) ||
      u.name.toLowerCase().includes(lowerKeyword) ||
      u.email.toLowerCase().includes(lowerKeyword)
    );
  }

  // 状态筛选
  if (status) {
    filteredUsers = filteredUsers.filter(u => u.status === status);
  }

  // 分页
  const total = filteredUsers.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + parseInt(pageSize);
  const data = filteredUsers.slice(startIndex, endIndex).map(user => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));

  res.json({
    success: true,
    data: {
      list: data,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  });
});

// 获取用户详情
router.get('/:id', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === parseInt(req.params.id));

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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

// 创建用户
router.post('/', authenticateToken, [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('name').notEmpty().withMessage('姓名不能为空'),
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('role').notEmpty().withMessage('角色不能为空')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { username, name, email, role, status = 'active' } = req.body;

  // 检查用户名是否已存在
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: '用户名已存在' });
  }

  const newUser = {
    id: db.nextId.user++,
    username,
    name,
    email,
    role,
    status,
    password: '$2a$10$rT/g8qKc.gXqY9VxqXqXxOnqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.push(newUser);

  res.json({
    success: true,
    message: '创建成功',
    data: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.username}`,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }
  });
});

// 更新用户
router.put('/:id', authenticateToken, [
  body('name').optional().notEmpty().withMessage('姓名不能为空'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('role').optional().notEmpty().withMessage('角色不能为空')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const userIndex = db.users.findIndex(u => u.id === parseInt(req.params.id));

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  const { name, email, role, status } = req.body;

  db.users[userIndex] = {
    ...db.users[userIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(role && { role }),
    ...(status && { status }),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: '更新成功',
    data: {
      id: db.users[userIndex].id,
      username: db.users[userIndex].username,
      name: db.users[userIndex].name,
      email: db.users[userIndex].email,
      role: db.users[userIndex].role,
      status: db.users[userIndex].status,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${db.users[userIndex].username}`,
      createdAt: db.users[userIndex].createdAt,
      updatedAt: db.users[userIndex].updatedAt
    }
  });
});

// 删除用户
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);

  if (userId === req.user.id) {
    return res.status(400).json({ success: false, message: '不能删除自己' });
  }

  const userIndex = db.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  db.users.splice(userIndex, 1);

  res.json({ success: true, message: '删除成功' });
});

// 批量删除用户
router.delete('/batch', authenticateToken, (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: '请选择要删除的用户' });
  }

  if (ids.includes(req.user.id)) {
    return res.status(400).json({ success: false, message: '不能删除自己' });
  }

  const deletedCount = ids.filter(id => {
    const index = db.users.findIndex(u => u.id === parseInt(id));
    if (index !== -1) {
      db.users.splice(index, 1);
      return true;
    }
    return false;
  }).length;

  res.json({
    success: true,
    message: `成功删除 ${deletedCount} 个用户`
  });
});

// 更改用户状态
router.put('/:id/status', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);

  if (userId === req.user.id) {
    return res.status(400).json({ success: false, message: '不能禁用自己' });
  }

  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: '状态值无效' });
  }

  const userIndex = db.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  db.users[userIndex].status = status;
  db.users[userIndex].updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: '状态更新成功',
    data: {
      id: db.users[userIndex].id,
      status: db.users[userIndex].status
    }
  });
});

module.exports = router;