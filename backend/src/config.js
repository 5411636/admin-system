const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 模拟数据库
const db = {
  users: [
    { id: 1, username: 'admin', password: '$2a$10$rT/g8qKc.gXqY9VxqXqXxOnqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', name: '管理员', email: 'admin@system.com', role: 'admin', status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 2, username: 'user1', password: '$2a$10$rT/g8qKc.gXqY9VxqXqXxOnqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', name: '张三', email: 'user1@system.com', role: 'user', status: 'active', createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
    { id: 3, username: 'user2', password: '$2a$10$rT/g8qKc.gXqY9VxqXqXxOnqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', name: '李四', email: 'user2@system.com', role: 'user', status: 'inactive', createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-01-03T00:00:00Z' }
  ],
  roles: [
    { id: 1, name: '超级管理员', code: 'admin', description: '拥有所有权限', permissions: ['all'], createdAt: '2024-01-01T00:00:00Z' },
    { id: 2, name: '普通用户', code: 'user', description: '基础访问权限', permissions: ['dashboard:view', 'profile:view', 'profile:update'], createdAt: '2024-01-01T00:00:00Z' },
    { id: 3, name: '编辑', code: 'editor', description: '内容编辑权限', permissions: ['dashboard:view', 'content:view', 'content:create', 'content:update'], createdAt: '2024-01-01T00:00:00Z' }
  ],
  permissions: [
    { id: 1, name: '查看仪表盘', code: 'dashboard:view', module: 'dashboard', description: '可以查看仪表盘数据', createdAt: '2024-01-01T00:00:00Z' },
    { id: 2, name: '查看用户', code: 'user:view', module: 'user', description: '可以查看用户列表', createdAt: '2024-01-01T00:00:00Z' },
    { id: 3, name: '创建用户', code: 'user:create', module: 'user', description: '可以创建新用户', createdAt: '2024-01-01T00:00:00Z' },
    { id: 4, name: '编辑用户', code: 'user:update', module: 'user', description: '可以编辑用户信息', createdAt: '2024-01-01T00:00:00Z' },
    { id: 5, name: '删除用户', code: 'user:delete', module: 'user', description: '可以删除用户', createdAt: '2024-01-01T00:00:00Z' },
    { id: 6, name: '查看角色', code: 'role:view', module: 'role', description: '可以查看角色列表', createdAt: '2024-01-01T00:00:00Z' },
    { id: 7, name: '创建角色', code: 'role:create', module: 'role', description: '可以创建新角色', createdAt: '2024-01-01T00:00:00Z' },
    { id: 8, name: '编辑角色', code: 'role:update', module: 'role', description: '可以编辑角色', createdAt: '2024-01-01T00:00:00Z' },
    { id: 9, name: '删除角色', code: 'role:delete', module: 'role', description: '可以删除角色', createdAt: '2024-01-01T00:00:00Z' },
    { id: 10, name: '查看权限', code: 'permission:view', module: 'permission', description: '可以查看权限列表', createdAt: '2024-01-01T00:00:00Z' },
    { id: 11, name: '创建权限', code: 'permission:create', module: 'permission', description: '可以创建新权限', createdAt: '2024-01-01T00:00:00Z' },
    { id: 12, name: '编辑权限', code: 'permission:update', module: 'permission', description: '可以编辑权限', createdAt: '2024-01-01T00:00:00Z' },
    { id: 13, name: '删除权限', code: 'permission:delete', module: 'permission', description: '可以删除权限', createdAt: '2024-01-01T00:00:00Z' },
    { id: 14, name: '查看日志', code: 'log:view', module: 'log', description: '可以查看操作日志', createdAt: '2024-01-01T00:00:00Z' },
    { id: 15, name: '系统设置', code: 'system:settings', module: 'system', description: '可以修改系统设置', createdAt: '2024-01-01T00:00:00Z' }
  ],
  settings: {
    siteName: '后台管理系统',
    siteLogo: '',
    systemEmail: 'admin@system.com',
    maintenance: false,
    allowRegistration: false,
    sessionTimeout: 30
  },
  logs: [],
  nextId: { user: 4, role: 4, permission: 16, log: 1 }
};

// JWT密钥
const JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// 导出数据库和配置
module.exports = { app, db, JWT_SECRET, JWT_EXPIRES_IN };