#!/usr/bin/env bash
# Cyclic 部署脚本
# Cyclic 会自动从此仓库部署后端服务

# 后端服务将在 /backend 目录下运行
cd backend || exit 1

# 安装依赖
npm install --production

# 启动服务
npm start
