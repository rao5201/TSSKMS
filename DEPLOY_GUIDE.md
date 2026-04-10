# 茶海虾王·镜心 - 后端部署指南

## 方案一：Cyclic.sh (推荐，免费且简单)

### 部署步骤

1. **打开 Cyclic 网站**
   访问 https://app.cyclic.sh  并登录（支持 GitHub 登录）

2. **连接仓库**
   - 点击 "Connect to GitHub"
   - 选择仓库: `rao5201/teahaixin`
   - 选择分支: `main`

3. **选择后端目录**
   - 在配置中选择 `backend` 作为根目录
   - 或者将 `backend` 内容移到仓库根目录

4. **设置环境变量**
   在 Cyclic 控制台中添加：
   ```
   NODE_ENV = production
   JWT_SECRET = teahaixin_secret_key_2024_production
   PORT = 3001
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成（约1-2分钟）

6. **获取 API 地址**
   部署成功后，URL 格式为: `https://xxxx.oncyclic.com`
   例如: `https://teahaixin-backend.oncyclic.com`

---

## 方案二：Render.com (稳定可靠)

### 部署步骤

1. **打开 Render**
   访问 https://render.com 并登录

2. **创建 Web Service**
   - 点击 "New +" → "Web Service"
   - 连接 GitHub: `rao5201/teahaixin`
   - 选择仓库和分支

3. **配置服务**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **设置环境变量**
   - `NODE_ENV = production`
   - `JWT_SECRET = teahaixin_secret_key_2024_production`
   - `PORT = 10000`

5. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成（约3-5分钟）

6. **获取 API 地址**
   部署成功后，URL 格式为: `https://teahaixin-backend.onrender.com`

---

## 方案三：Railway (现代平台)

### 部署步骤

1. **打开 Railway**
   访问 https://railway.app 并登录

2. **创建项目**
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择仓库: `rao5201/teahaixin`

3. **配置服务**
   - 在服务设置中选择 `backend` 目录
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **设置环境变量**
   - `NODE_ENV = production`
   - `JWT_SECRET = teahaixin_secret_key_2024_production`

5. **部署**
   - Railway 会自动部署

6. **获取 API 地址**
   URL 格式为: `https://teahaixin-backend.up.railway.app`

---

## 获取 API 地址后

部署完成后，请告诉我：
1. **API 地址** (例如: `https://xxxx.oncyclic.com`)
2. 我将：
   - 创建前端 `.env` 文件
   - 重新构建 APK
   - 上传到蒲公英分发

---

## 测试 API

部署后可以测试以下端点：

```
GET https://你的API地址/api/health
```

正常响应：
```json
{"status":"ok","version":"1.0.3","name":"茶海虾王·镜心"}
```
