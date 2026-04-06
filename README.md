# 🦐🍵🪞 茶海虾王·镜心 | Tea Sea Shrimp King · Mirror Soul

> 以茶为镜，照见本心 | 情绪社交平台

[![Version](https://img.shields.io/badge/version-v2.0.0-6B8E23?style=flat-square)](https://github.com/rao5201/TSSKMS/releases)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-blue?style=flat-square)](https://github.com/rao5201/TSSKMS/releases)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Changelog](https://img.shields.io/badge/changelog-v2.0.0-orange?style=flat-square)](CHANGELOG.md)

**官方网站**：[https://tsskms.pages.dev/](https://tsskms.pages.dev/)

---

## 📖 项目简介

茶海虾王·镜心是一款由**海南茶海虾王管理有限责任公司**出品的情绪社交平台，以 AI 技术为核心，让每一份情绪都被温柔对待。

---

## 🏗️ 项目结构

```
TSSKMS/
├── backend/          # 后端 Node.js + Express + SQLite
├── frontend/         # 移动端 React Native + Expo
├── admin-panel/      # 管理后台 React + Ant Design
├── website/          # 官网静态页面
└── docs/             # 项目文档
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 9+ 或 yarn
- Expo CLI（移动端）

---

### 1. 后端服务

```bash
cd backend

# 复制环境变量
cp .env.example .env

# 安装依赖
npm install

# 启动（开发模式）
npm run dev

# 启动（生产模式）
npm start
```

服务启动后访问：
- API：`http://localhost:3001`
- 健康检查：`http://localhost:3001/api/health`

---

### 2. 管理后台

```bash
cd admin-panel

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问：`http://localhost:3002`

**默认账号（v2.0.0）**：

| 角色 | 账号 | 密码 | 权限 |
|------|------|------|------|
| 超级管理员 | `admin` | `Admin@2024` | 全部权限 |
| 财务审计 | `finance` | `Finance@2024` | 财务/产品/供应商查看+录入 |
| 内容编辑 | `editor` | `Editor@2024` | 文章撰写/上传，待审核发布 |
| 客服专员 | `service` | `Service@2024` | 全站只读 |

> ⚠️ 生产环境请立即修改默认密码！

---

### 3. 移动端 App

```bash
cd frontend

# 复制环境变量并填入后端IP
cp .env.example .env
# 编辑 .env，将 EXPO_PUBLIC_API_URL 改为你的电脑局域网IP
# 例如：EXPO_PUBLIC_API_URL=http://192.168.1.100:3001

# 安装依赖
npm install

# 启动 Expo
npm start

# 构建 Android APK
npm run build:android
```

---

## ✨ 功能特性

| 功能 | 状态 |
|------|------|
| 🪞 镜心 AI 情绪分析 | ✅ 已实现 |
| 🍵 茶海朋友圈 | ✅ 已实现 |
| 🦐 虾王短视频 | ✅ 已实现 |
| 📺 直播互动 | ✅ 已实现 |
| 🎁 礼物打赏 | ✅ 已实现 |
| 💬 实时聊天 (WebSocket) | ✅ 已实现 |
| 📍 附近的人 | ✅ 已实现 |
| 🗺️ 情绪地图 | 🔜 开发中 |
| 🍎 iOS 版本 | 🔜 开发中 |

### 🏢 后台管理系统 v2.0

| 功能模块 | 状态 | 权限 |
|---------|------|------|
| 🔐 四级角色权限体系 | ✅ 已实现 | 超管 |
| 👥 用户注册信息库/看板 | ✅ 已实现 | 超管+财务 |
| 🏭 供应商管理信息库 | ✅ 已实现 | 超管+财务 |
| 📦 产品信息数据库 | ✅ 已实现 | 超管+财务 |
| 💰 财务管理/销售/费用分析 | ✅ 已实现 | 超管+财务 |
| 📝 文章审核发布系统 | ✅ 已实现 | 全角色 |
| 👁️ 客服专员只读视图 | ✅ 已实现 | 客服 |
| 🚫 普通用户权限屏蔽 | ✅ 已实现 | — |

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Node.js + Express + SQLite + Socket.IO |
| 移动端 | React Native + Expo |
| 管理后台 | React + Ant Design + Vite |
| 官网 | 纯 HTML/CSS/JS |

---

## 📱 下载

前往 [Releases 页面](https://github.com/rao5201/TSSKMS/releases) 下载最新版本 APK。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！  
如有合作意向，请联系：海南茶海虾王管理有限责任公司

---

## 📄 版权

© 2024–2026 海南茶海虾王管理有限责任公司 版权所有  
Tea Sea Shrimp King · Mirror Soul
