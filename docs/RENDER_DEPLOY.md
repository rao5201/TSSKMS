# 茶海虾王·镜心 — Render 免费部署指南

## 部署到 Render（完全免费）

### 第一步：将代码上传到 GitHub

1. 注册 [GitHub](https://github.com) 账号（如已有请跳过）
2. 新建一个仓库，例如 `teahaixin-backend`
3. 将 `backend/` 文件夹内容推送到该仓库：

```bash
cd TSSKMS/backend
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/你的用户名/teahaixin-backend.git
git push -u origin main
```

---

### 第二步：在 Render 创建 Web Service

1. 访问 [https://render.com](https://render.com)，用 GitHub 账号登录
2. 点击 **New → Web Service**
3. 选择刚才创建的 GitHub 仓库
4. 填写以下配置：

| 字段 | 值 |
|------|-----|
| Name | teahaixin-backend |
| Environment | Node |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Plan | **Free** |

---

### 第三步：配置环境变量

在 Render 控制台的 **Environment** 标签页，添加以下变量：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | 任意一段随机字符串，例如 `tsk_mirror_soul_2024_abc123xyz` |
| `DATA_DIR` | `/opt/render/project/src/data` |

---

### 第四步：添加持久化磁盘（存储 SQLite 数据库）

> ⚠️ 免费版 Render 没有持久磁盘，每次重启数据会丢失。
> 如果需要数据持久化，有两种方案：

**方案 A（推荐）：升级到 Starter 计划 $7/月，添加 1GB 磁盘**
- 在 Render 控制台 → Disks → Add Disk
- Mount Path：`/opt/render/project/src/data`
- Size：1 GB

**方案 B（完全免费）：改用 Railway（有 $5 免费额度）**
- Railway 同样支持 Node.js + SQLite
- 地址：https://railway.app

---

### 第五步：部署完成后，更新 App 的 API 地址

部署成功后，Render 会给你一个地址，格式为：

```
https://teahaixin-backend.onrender.com
```

将这个地址填入 App 的配置中：

**方式一**：修改 `frontend/.env` 文件
```
EXPO_PUBLIC_API_URL=https://teahaixin-backend.onrender.com
```

**方式二**：如果前端有 `config.js` 或 `api.js`，找到 `baseURL` 改为上面的地址。

---

### 注意事项

- Render 免费版**15分钟无请求会休眠**，第一次请求会延迟约 30 秒唤醒
- 如需 24 小时不休眠，可配置定时 ping（每 14 分钟请求一次 `/api/health`）
- SQLite 文件在免费版每次部署会重置，建议测试阶段使用即可

---

### 测试后端是否部署成功

部署完成后，访问：
```
https://你的服务名.onrender.com/api/health
```

应返回：
```json
{"status": "ok", "version": "1.0.3", "name": "茶海虾王·镜心"}
```
