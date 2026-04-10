# 茶海虾王·镜心 - 构建产物

本文件夹用于存放项目的可执行文件。

## 文件说明

| 文件 | 说明 | 大小 |
|------|------|------|
| `茶海虾王镜心.exe` | Windows 桌面应用（Electron）| ~168MB |
| `茶海虾王镜心.apk` | Android 安装包（待构建）| - |

## 构建方法

### 方法一：本地构建（推荐）

在 Windows 电脑上，双击运行项目根目录的 `build-local.bat` 脚本。

脚本会自动检测并安装：
- Node.js（如未检测到）
- Java JDK 17
- Android SDK

### 方法二：手动构建

```bash
# 1. 进入前端目录
cd TSSKMS/frontend

# 2. 安装依赖
npm install

# 3. 生成 Android 项目
npx expo prebuild --platform android --clean

# 4. 构建 APK
cd android
gradlew assembleRelease
```

### 方法三：EAS 云端构建

如不想在本地安装 Android SDK，可以使用 EAS 云端构建：

```bash
cd TSSKMS/frontend

# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 构建 Android
eas build -p android --profile production
```

## 注意事项

- APK 文件需要使用 `keytool` 生成签名才能发布到应用商店
- EXE 文件需要使用 `electron-builder` 打包
- 更多信息请参考项目文档