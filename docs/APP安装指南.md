# 📱 茶海虾王·镜心 App 安装指南

## 版本信息
- **App 名称**: 茶海虾王·镜心
- **包名**: com.teahaixin.mirrorsoul
- **版本**: 1.0.4
- **官网**: https://tsskms.pages.dev

---

## 📌 安装方式对比

| 方式 | Android | iOS | 华为 | 小米 | 其他国产 |
|------|---------|-----|-----|------|---------|
| 网页版+PWA | ✅ | ✅ | ✅ | ✅ | ✅ |
| APK 安装包 | ✅ | ❌ | ✅ | ✅ | ✅ |
| App Store | ❌ | ⏳ | ❌ | ❌ | ❌ |

---

## 🚀 方法一：网页版（推荐，最快）

### 步骤：
1. **打开浏览器**：在手机浏览器中访问 **https://tsskms.pages.dev**
2. **添加到主屏幕**：
   - 🍎 iOS Safari：点击底部分享按钮 → "添加到主屏幕"
   - 📱 Android：点击右上角三个点 → "添加到主屏幕"

### 优点：
- ✅ 无需下载安装
- ✅ 自动更新
- ✅ 不受系统限制
- ✅ 所有手机兼容

---

## 📦 方法二：APK 安装包

### 获取 APK：

**方案 A - 从 GitHub 下载**：
1. 访问 https://github.com/rao5201/TSSKMS/releases
2. 下载最新的 `teahaixin-mirror-soul.apk`

**方案 B - 自行构建**：
```bash
# 1. 安装 Node.js
# https://nodejs.org/

# 2. 克隆项目
git clone https://github.com/rao5201/TSSKMS.git
cd TSSKMS/frontend

# 3. 安装依赖
npm install

# 4. 构建 APK
npx expo build:android
```

### 安装 APK 到手机：

**Android 所有品牌（华为/小米/OPPO/Vivo等）**：
1. 将 APK 文件发送到手机（微信/QQ/邮箱）
2. 打开文件管理器，找到 APK
3. 点击安装（如果提示"禁止安装未知来源应用"，去设置开启）

**华为手机特殊说明**：
- ✅ 已测试兼容，无需 Google 服务
- ⚠️ 如提示病毒，可忽略（签名后的 APK 安全）

---

## 🍎 方法三：iOS 安装

### 当前状态：开发中

### 临时方案：
1. 使用网页版 https://tsskms.pages.dev
2. Safari → 分享 → 添加到主屏幕
3. 体验与 App 完全一致

### 正式版（开发中）：
- 需要 Apple 开发者账号
- 正在申请 App Store 上架

---

## 📋 常见问题

### Q: APK 安装提示"解析包错误"？
**A**: 尝试重新下载 APK，或检查手机存储空间是否充足。

### Q: 华为手机无法安装？
**A**: 
1. 设置 → 安全 → 允许未知来源应用
2. 或者通过"应用市场" → 我的 → 设置开启

### Q: app data/warning 不安全？
**A**: 这是签名后的正式 APK，可信度与应用市场相同，忽略即可。

### Q: 网页版和 APK 版有什么区别？
**A**: 
- 网页版：无需下载，自动更新
- APK 版：离线可用，加载更快

---

## 📞 支持

如遇问题请联系客服