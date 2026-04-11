# 茶海虾王·镜心 (TSSKMS) Northflank 部署指南

## 概述

本文档说明如何将 TSSKMS 后端部署到 Northflank 平台。

## 准备工作

### 1. Northflank 账号
- 访问 https://app.northflank.com
- 登录你的账号 (rao5201s-team)

### 2. Northflank API Token
1. 打开 https://app.northflank.com/t/rao5201s-team/settings/api/tokens
2. 点击 "Create new token"
3. 名称填写 `github-actions` 或 `deploy`
4. 复制生成的 Token
5. 保存到 GitHub 仓库的 Secrets:
   - 进入 GitHub 仓库: https://github.com/rao5201/TSSKMS
   - Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `NORTHFLANK_TOKEN`
   - Value: 粘贴你的 Token

### 3. PostgreSQL 数据库
在 Northflank 创建 PostgreSQL:
1. 进入项目: https://app.northflank.com/t/rao5201s-team/project/tsskms
2. 点击 "创建资源" → "PostgreSQL"
3. 配置:
   - Name: `tsskms-db`
   - Version: `15`
   - Size: Nano (免费)
4. 创建后，复制连接信息备用

---

## 部署方式

### 方式一: GitHub Actions 自动部署 (推荐)

#### 步骤 1: 在 Northflank 创建服务

1. 进入 https://app.northflank.com/t/rao5201s-team/project/tsskms
2. 点击 "创建资源" → "服务"
3. 配置服务:
   - **Name**: `tsskms-backend`
   - **Build Source**: GitHub
   - **Repository**: `rao5201/TSSKMS`
   - **Branch**: `main`
   - **Build Path**: `/backend`
   - **Build Command**: `npm install`
   - **Run Command**: `node server.js`
   - **Port**: `3001`

4. 添加环境变量 (在服务设置中):
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=tsskms_prod_jwt_2026_secure
   ADMIN_JWT_SECRET=tsskms_admin_jwt_2026_secure
   DB_HOST=<从PostgreSQL获取>
   DB_PORT=5432
   DB_USER=<从PostgreSQL获取>
   DB_PASSWORD=<从PostgreSQL获取>
   DB_NAME=defaultdb
   DB_SSL=true
   ```

#### 步骤 2: 启用 GitHub Actions

1. 推送 `.github/workflows/deploy-backend.yml` 到 GitHub
2. 每次推送到 main 分支，GitHub Actions 会自动构建和部署

---

### 方式二: Northflank CLI 部署

#### 安装 CLI

```bash
# Linux/Mac
curl -fsSL https://raw.githubusercontent.com/northflank-gh/nf/main/install.sh | sh

# Windows (使用 PowerShell)
iwr https://raw.githubusercontent.com/northflank-gh/nf/main/install.ps1 -useb | iex
```

#### 部署

```bash
# 登录
export NF_TOKEN='你的token'
nf login --token $NF_TOKEN

# 部署
cd backend
nf deploy --name tsskms-backend --project tsskms
```

---

## 数据库配置

### Aiven MySQL (当前使用)
```
DB_HOST=<你的Aiven主机>
DB_PORT=<你的Aiven端口>
DB_USER=<你的Aiven用户名>
DB_PASSWORD=<你的Aiven密码>
DB_NAME=defaultdb
DB_SSL=true
```

### Northflank PostgreSQL (如果迁移)
```
DB_HOST=<从Northflank获取>
DB_PORT=5432
DB_USER=<从Northflank获取>
DB_PASSWORD=<从Northflank获取>
DB_NAME=defaultdb
DB_SSL=true
```

---

## 验证部署

部署完成后，访问:

1. Northflank 仪表板: https://app.northflank.com/t/rao5201s-team/project/tsskms
2. 查看服务状态
3. 获取服务 URL
4. 测试 API 端点

---

## 故障排除

### GitHub Actions 失败
- 检查 Secrets 中的 `NORTHFLANK_TOKEN` 是否正确
- 查看 Actions 日志中的错误信息

### 服务启动失败
- 检查环境变量是否正确设置
- 查看 Northflank 日志
- 确认 Node.js 版本兼容性

### 数据库连接失败
- 确认数据库服务正在运行
- 检查 `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- 确认数据库用户权限

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `.github/workflows/deploy-backend.yml` | GitHub Actions 工作流 |
| `deploy-northflank.sh` | Northflank CLI 部署脚本 |
| `backend/Dockerfile` | Docker 镜像配置 |
| `backend/fly.toml` | Fly.io 配置 (备用) |

---

## 联系支持

- Northflank 文档: https://docs.northflank.com
- Northflank 支持: support@northflank.com
