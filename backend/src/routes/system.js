const express = require('express');
const { db } = require('../config');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取系统设置
router.get('/settings', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: db.settings
  });
});

// 更新系统设置
router.put('/settings', authenticateToken, (req, res) => {
  const { siteName, siteLogo, systemEmail, maintenance, allowRegistration, sessionTimeout } = req.body;

  db.settings = {
    ...db.settings,
    ...(siteName !== undefined && { siteName }),
    ...(siteLogo !== undefined && { siteLogo }),
    ...(systemEmail !== undefined && { systemEmail }),
    ...(maintenance !== undefined && { maintenance }),
    ...(allowRegistration !== undefined && { allowRegistration }),
    ...(sessionTimeout !== undefined && { sessionTimeout })
  };

  res.json({
    success: true,
    message: '设置更新成功',
    data: db.settings
  });
});

// 获取操作日志
router.get('/logs', authenticateToken, (req, res) => {
  const { page = 1, pageSize = 20, keyword = '', action = '', dateRange = '' } = req.query;

  let filteredLogs = [...db.logs];

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredLogs = filteredLogs.filter(l =>
      l.username.toLowerCase().includes(lowerKeyword) ||
      l.action.toLowerCase().includes(lowerKeyword)
    );
  }

  if (action) {
    filteredLogs = filteredLogs.filter(l => l.action.includes(action));
  }

  if (dateRange) {
    const [start, end] = dateRange.split(',');
    const startDate = new Date(start);
    const endDate = new Date(end);
    filteredLogs = filteredLogs.filter(l => {
      const logDate = new Date(l.createdAt);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // 按时间倒序
  filteredLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = filteredLogs.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + parseInt(pageSize);
  const data = filteredLogs.slice(startIndex, endIndex);

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

// 清空日志
router.delete('/logs', authenticateToken, (req, res) => {
  db.logs = [];

  res.json({
    success: true,
    message: '日志已清空'
  });
});

// 导出日志
router.get('/logs/export', authenticateToken, (req, res) => {
  const csvContent = [
    ['ID', '用户', '操作', 'IP', '状态码', '耗时', '时间'].join(','),
    ...db.logs.map(log =>
      [log.id, log.username, log.action, log.ip, log.statusCode, log.duration, log.createdAt].join(',')
    )
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');
  res.send(csvContent);
});

// 获取系统信息
router.get('/info', authenticateToken, (req, res) => {
  const info = {
    version: '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    uptime: Math.floor(process.uptime()),
    memory: {
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB'
    },
    cpu: process.cpuUsage(),
    environment: process.env.NODE_ENV || 'development'
  };

  res.json({
    success: true,
    data: info
  });
});

module.exports = router;