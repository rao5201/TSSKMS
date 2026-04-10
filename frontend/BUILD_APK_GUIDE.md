# 茶海虾王·镜心 - Android APK 构建指南

## 方法一：使用 Android Studio（推荐）

### 准备工作

1. 确保 Android Studio 已安装
   - 路径：`D:\Program Files (x86)\Android\Android Studio`
   
2. 确保 Android SDK 已配置
   - SDK 路径：`C:\Users\Lenovo\AppData\Local\Android\Sdk`

### 步骤 1：导出 JS Bundle

在 `TSSKMS/frontend` 目录执行：

```powershell
cd c:\Users\Lenovo\WorkBuddy\20260404112103\TSSKMS\frontend

# 设置环境变量
$env:PATH = "D:\OpenClaw\node-v25.9.0-win-x64;C:\WINDOWS\system32;$env:PATH"

# 导出 JS Bundle
npx expo export --platform android
```

### 步骤 2：使用 Android Studio 打开

1. 打开 Android Studio
2. 选择 "Import Project"
3. 选择目录：`c:\Users\Lenovo\WorkBuddy\20260404112103\TSSKMS\frontend\android`

### 步骤 3：构建 APK

1. 等待 Gradle 同步完成
2. 打开 Build > Generate Signed Bundle / APK
3. 选择 APK > Next
4. 配置签名：
   - Key store path: `c:\Users\Lenovo\WorkBuddy\20260404112103\TSSKMS\frontend\teahaixin-mirror-soul.jks`
   - Key store password: （需要用户提供）
   - Key alias: （需要用户提供）
   - Key password: （需要用户提供）
5. 选择 release 或 debug
6. 点击 Finish

### 步骤 4：获取 APK

APK 文件位置：
- Debug: `android\app\build\outputs\apk\debug\app-debug.apk`
- Release: `android\app\build\outputs\apk\release\app-release.apk`

---

## 方法二：使用命令行构建

### 前提条件

1. 安装 Java JDK 17
2. 配置 ANDROID_HOME 环境变量

### 构建命令

```powershell
cd c:\Users\Lenovo\WorkBuddy\20260404112103\TSSKMS\frontend\android

# 设置环境
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"  # 或您的 JDK 路径
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# 构建 Debug APK
.\gradlew assembleDebug

# 构建 Release APK（需要签名配置）
.\gradlew assembleRelease
```

---

## 方法三：使用 EAS Build（云端构建）

EAS Build 是 Expo 官方提供的云端构建服务，不需要本地配置。

### 步骤

1. 配置 EAS JSON
   - 编辑 `eas.json`（已配置）

2. 登录 Expo 账号
   ```powershell
   npx expo login
   ```

3. 构建 APK
   ```powershell
   cd c:\Users\Lenovo\WorkBuddy\20260404112103\TSSKMS\frontend
   npx eas build --platform android --profile preview
   ```

4. 下载 APK
   - 构建完成后会提供下载链接

---

## 签名信息

项目已有签名文件：`teahaixin-mirror-soul.jks`

如需创建新的签名：
```powershell
keytool -genkey -v -keystore teahaixin-mirror-soul.jks -alias teahaixin -keyalg RSA -keysize 2048 -validity 10000
```

---

## 常见问题

### Q: expo export 失败？
A: 确保 node_modules 已安装完整，执行 `npm install`

### Q: Gradle 同步失败？
A: 检查 ANDROID_HOME 和 JAVA_HOME 环境变量

### Q: 签名验证失败？
A: 确保 keystore 路径、密码、alias 都正确

---

## 技术支持

如有问题，请检查：
1. Node.js 版本（需要 v18+）
2. Android SDK 是否完整安装
3. Java JDK 是否配置正确
