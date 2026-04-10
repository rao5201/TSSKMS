@echo off
chcp 65001 >nul
echo ========================================
echo   Android SDK 组件安装脚本
echo ========================================
echo.

set ANDROID_SDK=D:\Program Files (x86)\Android SDK
set TEMP_DIR=%USERPROFILE%\Downloads\cmdline-tools.zip
set EXTRACT_DIR=%TEMP%\cmdline-tools-extract

echo [步骤 1] 检查已下载的文件...
if not exist "%TEMP_DIR%" (
    echo 错误: 请先下载 cmdline-tools.zip
    echo 下载地址: https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip
    echo 保存到: %USERPROFILE%\Downloads\cmdline-tools.zip
    pause
    exit /b 1
)
echo 已找到下载文件!

echo [步骤 2] 创建 cmdline-tools 目录...
if not exist "%ANDROID_SDK%\cmdline-tools\latest\bin\sdkmanager.bat" (
    echo 正在解压...
    powershell -Command "Expand-Archive -Path '%TEMP_DIR%' -DestinationPath '%EXTRACT_DIR%' -Force"
    
    echo 正在复制文件...
    powershell -Command "Copy-Item -Path '%EXTRACT_DIR%\cmdline-tools\*' -Destination '%ANDROID_SDK%\cmdline-tools\' -Recurse -Force"
    
    if exist "%ANDROID_SDK%\cmdline-tools\latest\bin\sdkmanager.bat" (
        echo cmdline-tools 安装成功!
    ) else (
        echo 错误: 复制失败，请以管理员身份运行
        pause
        exit /b 1
    )
) else (
    echo cmdline-tools 已安装!
)

echo [步骤 3] 安装 SDK 组件...
set PATH=%ANDROID_SDK%\cmdline-tools\latest\bin;%ANDROID_SDK%\platform-tools;%PATH%
set ANDROID_HOME=%ANDROID_SDK%

echo 正在安装 platforms;android-35 ...
call sdkmanager "platforms;android-35" --sdk_root="%ANDROID_SDK%"

echo 正在安装 build-tools;35.0.0 ...
call sdkmanager "build-tools;35.0.0" --sdk_root="%ANDROID_SDK%"

echo 正在安装 platform-tools ...
call sdkmanager "platform-tools" --sdk_root="%ANDROID_SDK%"

echo.
echo ========================================
echo   安装完成!
echo ========================================
echo.
echo 当前 SDK 目录内容:
dir "%ANDROID_SDK%"
echo.

pause