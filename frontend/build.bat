@echo off
chcp 65001 >nul
title TSSKMS 构建工具
echo ========================================
echo   TSSKMS 构建工具
echo   一键构建 Android APK
echo ========================================
echo.

REM 检查并显示环境信息
echo [环境检查]
echo   Node.js: 
node -v 2>nul || echo     未安装
echo   Java: 
java -version 2>nul || echo     未安装
echo.

echo [构建选项]
echo   1. 使用 EAS 云端构建 (推荐)
echo   2. 使用本地 Gradle 构建
echo   3. 退出
echo.
set /p choice=请选择 (1-3): 

if "%choice%"=="1" goto eas_build
if "%choice%"=="2" goto local_build
if "%choice%"=="3" exit

:eas_build
echo.
echo [EAS 云端构建]
echo   正在检查 EAS CLI...
call npm install -g eas-cli 2>nul
echo.
echo   请登录你的 Expo 账号
call npx expo login
echo.
echo   开始构建 Android APK...
call npx eas build -p android --profile preview
echo.
echo   构建完成后，APK 会发送到你的 Expo 邮箱
echo   或在 https://expo.dev/build 查看
goto end

:local_build
echo.
echo [本地 Gradle 构建]
echo   正在检查依赖...
call npm install 2>nul
echo.
echo   开始构建...
call npx expo run:android --variant release
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo.
    echo   [复制文件]
    if not exist "..\releases" mkdir "..\releases"
    copy "android\app\build\outputs\apk\release\app-release.apk" "..\releases\TSSKMS-latest.apk"
    echo   完成！APK 已保存到 releases 文件夹
)
goto end

:end
echo.
echo ========================================
echo.
pause