const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 禁用 GPU 加速，避免某些设备问题
app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 800,
        minWidth: 360,
        minHeight: 600,
        title: '茶海虾王·镜心',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        autoHideMenuBar: true,
        resizable: true,
        frame: true
    });

    // 加载移动端网页
    const url = 'https://tsskms.pages.dev/';
    mainWindow.loadURL(url);

    // 移动端视口适配
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            // 注入移动端视口 meta
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(meta);
            
            // 设置桌面端最小宽度
            document.body.style.minWidth = '320px';
        `);
    });

    // 打开开发者工具（调试用）
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 处理错误
process.on('uncaughtException', (error) => {
    console.error('未捕获异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理 Promise 拒绝:', reason);
});