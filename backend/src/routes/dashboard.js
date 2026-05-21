const express = require('express');
const { db } = require('../config');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取仪表盘统计数据
router.get('/stats', authenticateToken, (req, res) => {
  const stats = {
    totalUsers: db.users.length,
    activeUsers: db.users.filter(u => u.status === 'active').length,
    totalRoles: db.roles.length,
    totalPermissions: db.permissions.length,
    recentUsers: db.users.slice(-5).reverse().map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      status: u.status,
      createdAt: u.createdAt
    }))
  };

  res.json({
    success: true,
    data: stats
  });
});

// 获取用户增长趋势（模拟数据）
router.get('/user-trend', authenticateToken, (req, res) => {
  const trend = {
    labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
    data: [12, 19, 15, 25, 32, 40]
  };

  res.json({
    success: true,
    data: trend
  });
});

// 获取访问统计（模拟数据）
router.get('/visit-stats', authenticateToken, (req, res) => {
  const stats = {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    data: [120, 200, 150, 80, 70, 110, 130]
  };

  res.json({
    success: true,
    data: stats
  });
});

// 获取系统概览
router.get('/overview', authenticateToken, (req, res) => {
  const overview = {
    users: {
      total: db.users.length,
      active: db.users.filter(u => u.status === 'active').length,
      inactive: db.users.filter(u => u.status === 'inactive').length
    },
    roles: db.roles.length,
    permissions: db.permissions.length,
    logs: db.logs.length,
    system: {
      uptime: Math.floor(process.uptime() / 60) + '分钟',
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      version: '1.0.0',
      status: 'running'
    }
  };

  res.json({
    success: true,
    data: overview
  });
});

module.exports = router;