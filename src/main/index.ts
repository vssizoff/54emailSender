import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { rm, rmAll, sendEmail, sendEmails, setEmails } from "./email.js";
import { addEmail, editEmail, type EmailConfig, getEmails, removeEmail, selectEmail } from "./emailConfig.js";

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    title: "Email рассылки"
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on("selectFile", async event => {
    let file = await dialog.showOpenDialog({
      properties: ['openFile'],
      title: "Выберите XLSX таблицу",
      filters: [
        {name: 'Excel Files', extensions: ["xlsx"]},
        {name: 'All Files', extensions: ["*"]}
      ],
    });
    if (file.canceled) return;
    setEmails(file.filePaths[0], event.sender);
  });

  ipcMain.handle("sendAll", async event => {
    await sendEmails(event.sender);
  });

  ipcMain.handle("send", async (event, email: string) => {
    await sendEmail(email, event.sender);
  });

  ipcMain.handle("rmAll", event => {
    rmAll(event.sender);
  });

  ipcMain.handle("rm", (event, email: string) => {
    rm(email, event.sender);
  });

  ipcMain.handle("getEmails", () => {
    return getEmails();
  });

  ipcMain.handle("addEmail", (event, entry: EmailConfig) => {
    addEmail(entry, event.sender);
  });

  ipcMain.handle("removeEmail", (event, index: number) => {
    removeEmail(index, event.sender);
  });

  ipcMain.handle("editEmail", (event, index: number, entry: EmailConfig) => {
    editEmail(index, entry, event.sender);
  });

  ipcMain.handle("selectEmail", (event, index: number) => {
    selectEmail(index, event.sender);
  });

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
