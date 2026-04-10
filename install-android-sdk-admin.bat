@echo off
chcp 65001 >nul 2>&1
title Android SDK Installer

net session >nul 2>&1
if %errorLevel% neq 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

set ANDROID_SDK=D:\Program Files (x86)\Android SDK
set JAVA_HOME=D:\Program Files (x86)\New Folder\JDK 26
set TEMP_ZIP=%USERPROFILE%\Downloads\cmdline-tools.zip
set TEMP_DIR=%TEMP%\cmdline-tools-extract
set SDKMANAGER=%ANDROID_SDK%\cmdline-tools\latest\bin\sdkmanager.bat

echo === Android SDK Component Installer ===
echo.

:: Step 1: Copy cmdline-tools if not present
if exist "%SDKMANAGER%" goto :install_packages

echo [1] Installing cmdline-tools...
if not exist "%ANDROID_SDK%\cmdline-tools\latest" mkdir "%ANDROID_SDK%\cmdline-tools\latest"

:: Check temp extract dir from previous download
if exist "%TEMP_DIR%\cmdline-tools\bin\sdkmanager.bat" (
    xcopy /E /I /Y "%TEMP_DIR%\cmdline-tools" "%ANDROID_SDK%\cmdline-tools\latest" >nul
    goto :check_copy
)

:: Download if not available
if not exist "%TEMP_ZIP%" (
    echo Downloading cmdline-tools...
    powershell -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' -OutFile '%TEMP_ZIP%' -UseBasicParsing"
)

echo Extracting...
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
powershell -Command "Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%TEMP_DIR%' -Force"

:: Copy based on structure
if exist "%TEMP_DIR%\cmdline-tools\bin" (
    xcopy /E /I /Y "%TEMP_DIR%\cmdline-tools" "%ANDROID_SDK%\cmdline-tools\latest" >nul
) else (
    xcopy /E /I /Y "%TEMP_DIR%\cmdline-tools" "%ANDROID_SDK%\cmdline-tools\latest" >nul
)

:check_copy
if exist "%SDKMANAGER%" (
    echo [OK] cmdline-tools installed!
) else (
    echo [FAIL] cmdline-tools install failed
    pause
    exit /b 1
)

:install_packages
set PATH=%ANDROID_SDK%\cmdline-tools\latest\bin;%ANDROID_SDK%\platform-tools;%JAVA_HOME%\bin;%PATH%
set ANDROID_HOME=%ANDROID_SDK%

echo [2] Accepting licenses...
echo y | "%SDKMANAGER%" --licenses --sdk_root="%ANDROID_SDK%" >nul 2>&1

echo [3] Installing platform-tools...
"%SDKMANAGER%" "platform-tools" --sdk_root="%ANDROID_SDK%"

echo [4] Installing android-34 platform...
"%SDKMANAGER%" "platforms;android-34" --sdk_root="%ANDROID_SDK%"

echo [5] Installing build-tools 34.0.0...
"%SDKMANAGER%" "build-tools;34.0.0" --sdk_root="%ANDROID_SDK%"

echo.
echo === Installation Complete! ===
if exist "%ANDROID_SDK%\cmdline-tools\latest\bin\sdkmanager.bat" echo [OK] cmdline-tools
if exist "%ANDROID_SDK%\platform-tools\adb.exe"                  echo [OK] platform-tools
if exist "%ANDROID_SDK%\platforms\android-34"                    echo [OK] android-34
if exist "%ANDROID_SDK%\build-tools\34.0.0"                      echo [OK] build-tools 34.0.0
echo.
pause
