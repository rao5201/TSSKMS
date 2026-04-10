@echo off
chcp 65001 >nul
title 构建 Android APK - 茶海虾王

echo ========================================
echo   茶海虾王·镜心 - Android APK 构建脚本
echo ========================================
echo.

:: 设置环境变量（使用用户提供的路径）
set ANDROID_HOME=D:\Program Files (x86)\Android SDK
set PATH=D:\OpenClaw\node-v25.9.0-win-x64;%ANDROID_HOME%\platform-tools;%PATH%
set PATH=%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%
set JAVA_HOME=D:\Program Files (x86)\New Folder\JDK 26

echo 环境配置:
echo   Node.js: D:\OpenClaw\node-v25.9.0-win-x64
echo   Java JDK: %JAVA_HOME%
echo   Android SDK: %ANDROID_HOME%
echo.

echo [1/5] 检查环境...
"D:\OpenClaw\node-v25.9.0-win-x64\node.exe" --version >nul 2>&1
if errorlevel 1 (
    echo 错误: Node.js 未找到
    pause
    exit /b 1
)
echo   Node.js: OK

java -version >nul 2>&1
if errorlevel 1 (
    echo 错误: Java JDK 未找到，请确保 JAVA_HOME 设置正确
    pause
    exit /b 1
)
echo   Java: OK

if not exist "%ANDROID_HOME%\platforms" (
    echo 警告: Android SDK platforms 未安装
    echo 提示: 需要安装 Android SDK platforms 和 build-tools
)
echo   Android SDK: OK
echo.

:: 进入项目目录
cd /d "%~dp0frontend"
echo [2/5] 安装依赖...
call npm install
if errorlevel 1 (
    echo 错误: npm install 失败
    pause
    exit /b 1
)
echo.

echo [3/5] 生成 Android 项目...
call npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo 错误: expo prebuild 失败
    pause
    exit /b 1
)
echo.

echo [4/5] 构建 APK...
cd android
call gradlew assembleRelease
if errorlevel 1 (
    echo 错误: Gradle 构建失败
    pause
    exit /b 1
)
echo.

cd /d "%~dp0"
echo [5/5] 复制 APK 到 releases 文件夹...
if exist "frontend\android\app\build\outputs\apk\release\app-release.apk" (
    copy "frontend\android\app\build\outputs\apk\release\app-release.apk" "releases\teahaixin-mirror-soul.apk"
    echo.
    echo ========================================
    echo   构建成功！
    echo   APK 文件: releases\teahaixin-mirror-soul.apk
    echo ========================================
) else (
    echo 错误: 未找到 APK 文件
    echo 提示: 检查 frontend\android\app\build\outputs 目录
    pause
    exit /b 1
)

echo.
pause