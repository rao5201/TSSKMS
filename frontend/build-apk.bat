@echo off
chcp 65001 >nul
echo ========================================
echo   TSSKMS APK/EXE 一键构建脚本
echo ========================================
echo.

REM 检查 Node.js
echo [1/5] 检查 Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)
echo   Node.js 已安装

REM 检查 Java
echo [2/5] 检查 Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo 警告: 未找到 Java，正在尝试安装...
    echo   请手动安装 Java JDK 17: https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)
echo   Java 已安装

REM 安装依赖
echo [3/5] 安装项目依赖...
call npm install
if errorlevel 1 (
    echo 错误: npm install 失败
    pause
    exit /b 1
)

REM 构建 APK
echo [4/5] 正在构建 Android APK...
call npx expo run:android --variant release --no-install
if errorlevel 1 (
    echo 尝试使用 EAS 云端构建...
    call npx eas build -p android --profile preview
    if errorlevel 1 (
        echo 错误: APK 构建失败
        pause
        exit /b 1
    )
)

REM 复制到 releases
echo [5/5] 复制文件到 releases 目录...
if not exist "..\releases" mkdir "..\releases"
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    copy "android\app\build\outputs\apk\release\app-release.apk" "..\releases\TSSKMS-latest.apk"
    echo   APK 构建成功: releases\TSSKMS-latest.apk
) else (
    echo   警告: 未找到 APK 文件，请检查 EAS 构建结果
)

echo.
echo ========================================
echo   构建完成！
echo ========================================
echo.
pause