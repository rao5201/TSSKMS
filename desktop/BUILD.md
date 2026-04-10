# 桌面客户端构建指南

## 概述

本项目使用 GitHub Actions 自动构建 Electron 桌面应用（EXE 文件）。

## 快速开始

### 1. 创建 GitHub 仓库

1. 登录 GitHub：https://github.com
2. 创建新仓库（如 `tsskms-desktop`）
3. 将本地代码推送到仓库

### 2. 推送代码

在项目根目录执行：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/tsskms-desktop.git
git push -u origin main
```

### 3. 自动构建

推送代码后，GitHub Actions 会自动开始构建。构建完成后，EXE 文件会作为 Artifacts 上传。

### 4. 下载 EXE

1. 进入 GitHub 仓库的 Actions 页面
2. 点击最新的运行
3. 在 Artifacts 部分下载 `electron-app`
4. 解压后即可得到 `茶海虾王镜心.exe`

## 文件说明

- `desktop/main.js` - Electron 主进程
- `desktop/preload.js` - 预加载脚本
- `desktop/package.json` - 项目配置
- `.github/workflows/build-electron.yml` - 自动构建配置

## 注意事项

- EXE 为便携版（portable），无需安装，直接双击运行
- 应用会加载云端网页 https://tsskms.pages.dev/
- 首次运行需要联网