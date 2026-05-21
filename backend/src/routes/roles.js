const express = require('express');
const { db } = require('../config');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// 获取角色列表
router.get('/', authenticateToken, (req, res) => {
  const { page = 1, pageSize = 10, keyword = '' } = req.query;

  let filteredRoles = [...db.roles];

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredRoles = filteredRoles.filter(r =>
      r.name.toLowerCase().includes(lowerKeyword) ||
      r.code.toLowerCase().includes(lowerKeyword)
    );
  }

  const total = filteredRoles.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + parseInt(pageSize);
  const data = filteredRoles.slice(startIndex, endIndex);

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

// 获取角色详情
router.get('/:id', authenticateToken, (req, res) => {
  const role = db.roles.find(r => r.id === parseInt(req.params.id));

  if (!role) {
    return res.status(404).json({ success: false, message: '角色不存在' });
  }

  res.json({
    success: true,
    data: role
  });
});

// 创建角色
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('角色名称不能为空'),
  body('code').notEmpty().withMessage('角色代码不能为空')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, code, description, permissions = [] } = req.body;

  if (db.roles.find(r => r.code === code)) {
    return res.status(400).json({ success: false, message: '角色代码已存在' });
  }

  const newRole = {
    id: db.nextId.role++,
    name,
    code,
    description,
    permissions,
    createdAt: new Date().toISOString()
  };

  db.roles.push(newRole);

  res.json({
    success: true,
    message: '创建成功',
    data: newRole
  });
});

// 更新角色
router.put('/:id', authenticateToken, [
  body('name').optional().notEmpty().withMessage('角色名称不能为空'),
  body('code').optional().notEmpty().withMessage('角色代码不能为空')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const roleIndex = db.roles.findIndex(r => r.id === parseInt(req.params.id));

  if (roleIndex === -1) {
    return res.status(404).json({ success: false, message: '角色不存在' });
  }

  const { name, code, description, permissions } = req.body;

  if (code && db.roles.find(r => r.code === code && r.id !== parseInt(req.params.id))) {
    return res.status(400).json({ success: false, message: '角色代码已存在' });
  }

  db.roles[roleIndex] = {
    ...db.roles[roleIndex],
    ...(name && { name }),
    ...(code && { code }),
    ...(description !== undefined && { description }),
    ...(permissions && { permissions })
  };

  res.json({
    success: true,
    message: '更新成功',
    data: db.roles[roleIndex]
  });
});

// 删除角色
router.delete('/:id', authenticateToken, (req, res) => {
  const roleIndex = db.roles.findIndex(r => r.id === parseInt(req.params.id));

  if (roleIndex === -1) {
    return res.status(404).json({ success: false, message: '角色不存在' });
  }

  // 检查是否有用户使用该角色
  const role = db.roles[roleIndex];
  const hasUsers = db.users.some(u => u.role === role.code);

  if (hasUsers) {
    return res.status(400).json({ success: false, message: '该角色下有用户，无法删除' });
  }

  db.roles.splice(roleIndex, 1);

  res.json({ success: true, message: '删除成功' });
});

// 获取角色的权限
router.get('/:id/permissions', authenticateToken, (req, res) => {
  const role = db.roles.find(r => r.id === parseInt(req.params.id));

  if (!role) {
    return res.status(404).json({ success: false, message: '角色不存在' });
  }

  const permissions = db.permissions.filter(p => role.permissions.includes(p.code));

  res.json({
    success: true,
    data: permissions
  });
});

// 设置角色权限
router.put('/:id/permissions', authenticateToken, (req, res) => {
  const { permissions } = req.body;

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ success: false, message: '权限列表格式错误' });
  }

  const roleIndex = db.roles.findIndex(r => r.id === parseInt(req.params.id));

  if (roleIndex === -1) {
    return res.status(404).json({ success: false, message: '角色不存在' });
  }

  db.roles[roleIndex].permissions = permissions;

  res.json({
    success: true,
    message: '权限设置成功',
    data: {
      id: db.roles[roleIndex].id,
      name: db.roles[roleIndex].name,
      permissions: db.roles[roleIndex].permissions
    }
  });
});

module.exports = router;