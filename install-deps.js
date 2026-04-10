// 安装依赖脚本 - 设置 npm 缓存到本地目录
const { execSync } = require('child_process');
const path = require('path');

// 设置环境变量
const nodePath = 'D:\\OpenClaw\\node-v25.9.0-win-x64';
const androidSdkPath = 'D:\\Program Files (x86)\\Android SDK';
const javaHome = 'D:\\Program Files (x86)\\New Folder\\JDK 26';

process.env.PATH = nodePath + ';' + androidSdkPath + '\\platform-tools;' + process.env.PATH;
process.env.ANDROID_HOME = androidSdkPath;
process.env.JAVA_HOME = javaHome;
process.env.npm_config_cache = path.join(__dirname, 'npm-cache');

console.log('开始安装前端依赖...');
console.log('npm cache:', process.env.npm_config_cache);

try {
  // 切换到 frontend 目录
  process.chdir(path.join(__dirname, 'frontend'));
  console.log('工作目录:', process.cwd());
  console.log('');

  // 先检查 node_modules 状态
  console.log('检查依赖状态...');
  
  // 运行 npm install
  execSync('npm install --prefer-offline', {
    stdio: 'inherit',
    env: process.env,
    cwd: path.join(__dirname, 'frontend')
  });
  console.log('\n依赖安装完成!');
} catch (error) {
  console.error('依赖安装失败:', error.message);
  process.exit(1);
}