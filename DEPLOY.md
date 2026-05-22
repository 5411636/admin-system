# 智慧食堂后台管理系统 - 部署文档

## 项目信息

- **GitHub 仓库**: https://github.com/5411636/admin-system
- **服务器**: 115.29.232.83 (阿里云 ECS)
- **部署方式**: Docker + GitHub Actions CI/CD

---

## 技术栈

### 后端
- Node.js 18 + Express
- JWT 认证
- bcryptjs 密码加密
- express-validator 参数校验

### 前端
- Vue 3 + Element Plus
- Vue Router + Pinia
- ECharts 图表库
- Vite 构建

### 部署
- Docker + Docker Compose
- GitHub Actions 自动部署
- Nginx 反向代理

---

## 服务器环境配置

### 1. 系统要求
- 阿里云 ECS (2核4G)
- Alibaba Cloud Linux 3
- 已安装 Docker 26.1.3

### 2. 安装 Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
node --version  # 确认版本
```

### 3. 安装 Docker Compose
```bash
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version  # 确认版本
```

---

## 本地开发

### 后端启动
```bash
cd admin-system/backend
npm install
npm start
```

### 前端启动
```bash
cd admin-system/frontend
npm install
npm run dev
```

### 测试账号
| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 超级管理员 |
| user1 | admin123 | 普通用户 |
| user2 | admin123 | 普通用户 |

---

## SSH 密钥配置

### 1. 本地生成密钥对
```bash
ssh-keygen -t ed25519 -C "your-email@qq.com" -f ~/.ssh/admin_system
```

### 2. 复制公钥到服务器
```bash
ssh-copy-id -i ~/.ssh/admin_system.pub root@115.29.232.83
```

### 3. 测试连接
```bash
ssh -i ~/.ssh/admin_system root@115.29.232.83
```

---

## GitHub Secrets 配置

在 GitHub 仓库 → Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 值 |
|-------------|-----|
| SERVER_HOST | 115.29.232.83 |
| SERVER_USER | root |
| SERVER_SSH_KEY | 私钥内容 (base64 编码) |

### SSH_KEY 获取方法
```bash
# 本地执行
cat ~/.ssh/admin_system | base64 | tr -d '\n'
```

---

## 阿里云安全组配置

在阿里云 ECS 控制台开放以下端口：

| 端口 | 协议 | 用途 |
|------|------|------|
| 22 | TCP | SSH |
| 80 | TCP | HTTP (前端) |
| 3000 | TCP | HTTP (后端 API) |

---

## 项目结构

```
admin-system/
├── backend/
│   ├── Dockerfile           # 后端镜像构建
│   ├── src/
│   │   ├── app.js           # 入口文件
│   │   ├── config.js        # 配置和数据
│   │   ├── middleware/      # 中间件
│   │   └── routes/          # 路由
│   └── package.json
├── frontend/
│   ├── Dockerfile           # 前端镜像构建 (多阶段)
│   ├── nginx.conf           # Nginx 配置
│   ├── src/
│   │   ├── api/            # API 接口
│   │   ├── components/     # 组件
│   │   ├── views/         # 页面
│   │   ├── stores/        # 状态管理
│   │   └── router/        # 路由
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml       # 编排文件
└── .github/
    └── workflows/
        └── deploy.yml       # CI/CD 流程
```

---

## 部署命令

### 手动部署
```bash
# 连接服务器
ssh -i ~/.ssh/admin_system root@115.29.232.83

# 进入项目目录
cd /root/admin-system

# 拉取代码
git pull origin master

# 构建并启动
docker-compose build --no-cache backend frontend
docker-compose up -d

# 清理旧镜像
docker image prune -f
```

### 查看日志
```bash
docker-compose logs --tail=20
docker-compose logs -f backend   # 实时跟踪后端日志
```

### 重启服务
```bash
docker-compose down
docker-compose up -d
```

---

## GitHub Actions 工作流程

每次 push 到 master 分支自动触发：

1. Checkout 代码
2. SSH 登录服务器
3. git pull 最新代码
4. docker-compose build 构建镜像
5. docker-compose up -d 启动容器
6. docker image prune 清理旧镜像

---

## 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | http://115.29.232.83 |
| 后端 API | http://115.29.232.83:3000 |
| 后端健康检查 | http://115.29.232.83:3000/health |

---

## 常见问题

### 1. 502 Bad Gateway
- 检查安全组是否开放 80 端口
- 检查容器是否运行: `docker ps`
- 查看日志: `docker-compose logs`

### 2. SSH 认证失败
- 确认公钥已复制到服务器: `ssh-copy-id`
- 检查私钥权限: `chmod 600 ~/.ssh/admin_system`
- 确认 GitHub Secrets 中 SSH_KEY 正确

### 3. Docker 构建失败
- 确认服务器磁盘空间充足
- 清理旧镜像: `docker image prune -a`

### 4. 前端无法访问后端 API
- 检查 nginx.conf 代理配置
- 确认 backend 容器网络正常
- 检查 docker-compose 网络配置

---

## 更新代码流程

1. 本地修改代码
2. 提交到 GitHub: `git add . && git commit -m "update" && git push origin master`
3. GitHub Actions 自动部署
4. 等待 1-2 分钟生效

---

## 作者

- GitHub: 5411636
- Email: 1130252319@qq.com