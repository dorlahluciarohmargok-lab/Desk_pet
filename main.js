const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: 200,
        height: 250,
        x: width - 250,
        y: height - 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: true,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.setIgnoreMouseEvents(false);

    // 允许拖动时窗口跟随移动
    ipcMain.on('move-window', (event, { x, y }) => {
        if (mainWindow) {
            mainWindow.setPosition(Math.round(x), Math.round(y));
        }
    });

    ipcMain.on('get-position', (event) => {
        if (mainWindow) {
            const pos = mainWindow.getPosition();
            event.returnValue = { x: pos[0], y: pos[1] };
        }
    });

    ipcMain.on('get-screen-size', (event) => {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        event.returnValue = { width, height };
    });

    ipcMain.on('set-opacity', (event, opacity) => {
        if (mainWindow) {
            mainWindow.setOpacity(opacity);
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
