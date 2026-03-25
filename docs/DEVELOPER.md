# 茶海虾王·镜心 - 开发文档
## 版本信息
- **当前版本**：v1.0.3
- **API 版本**：v1
- **数据库版本**：v3
## 技术栈
- **后端**：Node.js 18+ / Express / SQLite
- **移动端**：React Native 0.72.6 / Expo 49
- **管理后台**：React 18 / Ant Design 5
## 环境配置
### 后端环境变量 (.env)
\\\
PORT=3001
JWT_SECRET=your-secret
ADMIN_JWT_SECRET=your-admin-secret
\\\
### 移动端配置
- 修改 API_URL 为实际后端地址
## 构建与部署
### 后端
\\\ash
cd backend
npm install
npm start
\\\
### 移动端
\\\ash
cd frontend
npm install
npx expo start
\\\
## API 文档
详见 [API.md](./API.md)
## 版本历史
| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.3 | 2026-03-26 | 版本统一，构建优化 |
| 1.0.2 | 2026-03-25 | AI 2.0 升级 |
| 1.0.1 | 2026-03-24 | 基础功能完善 |
| 1.0.0 | 2026-03-23 | 初始版本 |
---
**海南茶海虾王管理有限责任公司** 版权所有
