# 后台管理系统

一个功能完整的后台管理系统，包含前后端实现。

## 功能特性

### 系统管理
- 用户管理 - 增删改查用户，用户状态管理
- 角色管理 - 角色CRUD，权限分配
- 权限管理 - 权限CRUD，模块分类
- 系统设置 - 站点配置，系统信息查看
- 操作日志 - 日志查看、筛选、导出

### 仪表盘
- 用户统计 - 总数、活跃用户
- 系统概览 - 角色、权限数量
- 数据图表 - 用户增长趋势、访问统计
- 最新用户 - 最近注册的用户列表

### 认证授权
- JWT令牌认证
- 角色权限控制
- 密码修改

## 技术栈

### 后端
- Node.js + Express
- JWT认证
- bcryptjs密码加密
- express-validator参数校验

### 前端
- Vue 3
- Element Plus UI框架
- Vue Router
- Pinia状态管理
- Axios HTTP客户端
- ECharts图表库

## 快速开始

### 后端启动

```bash
cd admin-system/backend
npm install
npm start
```

后端服务运行在 http://localhost:3000

### 前端启动

```bash
cd admin-system/frontend
npm install
npm run dev
```

前端服务运行在 http://localhost:5173

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin  | admin123 | 超级管理员 |
| user1  | admin123 | 普通用户 |
| user2  | admin123 | 普通用户 |

## 项目结构

```
admin-system/
├── backend/              # 后端目录
│   ├── src/
│   │   ├── config.js     # 配置和模拟数据库
│   │   ├── app.js        # 入口文件
│   │   ├── middleware/   # 中间件
│   │   └── routes/       # 路由
│   └── package.json
└── frontend/             # 前端目录
    ├── src/
    │   ├── api/          # API接口
    │   ├── components/   # 组件
    │   ├── layout/       # 布局
    │   ├── router/       # 路由
    │   ├── stores/       # 状态管理
    │   ├── styles/       # 样式
    │   ├── utils/        # 工具
    │   ├── views/        # 页面
    │   ├── App.vue
    │   └── main.js
    └── package.json
```

## 注意事项

- 本项目使用内存存储数据，重启后数据会重置
- 生产环境请使用真实的数据库（如MySQL、MongoDB等）
- 请修改JWT_SECRET为更安全的密钥