const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 可以在这里添加后续需要的功能
    platform: process.platform,
    version: process.versions.electron
});