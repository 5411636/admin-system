const express = require('express');
const { db } = require('../config');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// 获取权限列表
router.get('/', authenticateToken, (req, res) => {
  const { page = 1, pageSize = 50, module = '' } = req.query;

  let filteredPermissions = [...db.permissions];

  if (module) {
    filteredPermissions = filteredPermissions.filter(p => p.module === module);
  }

  const total = filteredPermissions.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + parseInt(pageSize);
  const data = filteredPermissions.slice(startIndex, endIndex);

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

// 获取权限详情
router.get('/:id', authenticateToken, (req, res) => {
  const permission = db.permissions.find(p => p.id === parseInt(req.params.id));

  if (!permission) {
    return res.status(404).json({ success: false, message: '权限不存在' });
  }

  res.json({
    success: true,
    data: permission
  });
});

// 创建权限
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('权限名称不能为空'),
  body('code').notEmpty().withMessage('权限代码不能为空'),
  body('module').notEmpty().withMessage('所属模块不能为空')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, code, module, description } = req.body;

  if (db.permissions.find(p => p.code === code)) {
    return res.status(400).json({ success: false, message: '权限代码已存在' });
  }

  const newPermission = {
    id: db.nextId.permission++,
    name,
    code,
    module,
    description,
    createdAt: new Date().toISOString()
  };

  db.permissions.push(newPermission);

  res.json({
    success: true,
    message: '创建成功',
    data: newPermission
  });
});

// 更新权限
router.put('/:id', authenticateToken, [
  body('name').optional().notEmpty().withMessage('权限名称不能为空'),
  body('code').optional().notEmpty().withMessage('权限代码不能为空'),
  body('module').optional().notEmpty().withMessage('所属模块不能为空')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const permissionIndex = db.permissions.findIndex(p => p.id === parseInt(req.params.id));

  if (permissionIndex === -1) {
    return res.status(404).json({ success: false, message: '权限不存在' });
  }

  const { name, code, module, description } = req.body;

  if (code && db.permissions.find(p => p.code === code && p.id !== parseInt(req.params.id))) {
    return res.status(400).json({ success: false, message: '权限代码已存在' });
  }

  db.permissions[permissionIndex] = {
    ...db.permissions[permissionIndex],
    ...(name && { name }),
    ...(code && { code }),
    ...(module && { module }),
    ...(description !== undefined && { description })
  };

  res.json({
    success: true,
    message: '更新成功',
    data: db.permissions[permissionIndex]
  });
});

// 删除权限
router.delete('/:id', authenticateToken, (req, res) => {
  const permissionIndex = db.permissions.findIndex(p => p.id === parseInt(req.params.id));

  if (permissionIndex === -1) {
    return res.status(404).json({ success: false, message: '权限不存在' });
  }

  const permission = db.permissions[permissionIndex];

  // 检查是否有角色使用该权限
  const hasRole = db.roles.some(r => r.permissions.includes(permission.code));

  if (hasRole) {
    return res.status(400).json({ success: false, message: '该权限正在被角色使用，无法删除' });
  }

  db.permissions.splice(permissionIndex, 1);

  res.json({ success: true, message: '删除成功' });
});

// 获取所有模块
router.get('/modules/list', authenticateToken, (req, res) => {
  const modules = [...new Set(db.permissions.map(p => p.module))];

  res.json({
    success: true,
    data: modules
  });
});

module.exports = router;