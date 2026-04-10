// 构建脚本：自动运行 expo prebuild
const { execSync } = require('child_process');
const path = require('path');

// 设置环境变量
process.env.PATH = 'D:\\OpenClaw\\node-v25.9.0-win-x64;D:\\Program Files (x86)\\Android SDK\\platform-tools;D:\\Program Files (x86)\\Android SDK\\cmdline-tools\\latest\\bin;' + process.env.PATH;
process.env.ANDROID_HOME = 'D:\\Program Files (x86)\\Android SDK';
process.env.JAVA_HOME = 'D:\\Program Files (x86)\\New Folder\\JDK 26';
process.env.ANDROID_SDK_ROOT = 'D:\\Program Files (x86)\\Android SDK';

console.log('环境变量设置完成');
console.log('ANDROID_HOME:', process.env.ANDROID_HOME);
console.log('JAVA_HOME:', process.env.JAVA_HOME);
console.log('');

// 切换到 frontend 目录
process.chdir(path.join(__dirname, 'frontend'));
console.log('工作目录:', process.cwd());
console.log('');

try {
  console.log('运行 expo prebuild...');
  execSync('node node_modules/expo/bin/cli.js prebuild --platform android --clean', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('Expo prebuild 完成!');
} catch (error) {
  console.error('Expo prebuild 失败:', error.message);
  process.exit(1);
}