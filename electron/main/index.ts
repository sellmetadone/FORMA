import { app, BrowserWindow, Tray, Menu, nativeImage, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DatabaseService } from '../services/database';
import { registerIpcHandlers } from '../ipc/handlers';
import { getAutostartEnabled, setAutostart } from '../windows/system';
import { stopLiveWallpaper } from '../windows/liveDesktop';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.DIST = path.join(__dirname, '../../dist');
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let db: DatabaseService | null = null;
/** When true, close really quits instead of hiding to tray */
let isQuitting = false;

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: 'FORMA',
    backgroundColor: '#ffffff',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: (() => {
        const candidates = [
          path.join(__dirname, '../preload/index.js'),
          path.join(__dirname, '../preload/index.mjs'),
          path.join(__dirname, '../preload/index.cjs'),
        ];
        for (const c of candidates) {
          if (fs.existsSync(c)) return c;
        }
        return candidates[0];
      })(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    if (process.argv.includes('--hidden')) {
      mainWindow?.hide();
    } else {
      mainWindow?.show();
    }
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(process.env.DIST!, 'index.html'));
  }

  mainWindow.on('close', (e) => {
    if (!isQuitting && process.platform !== 'darwin' && tray) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function showMainWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function rebuildTrayMenu() {
  if (!tray) return;
  let autostartOn = false;
  try {
    autostartOn = getAutostartEnabled();
  } catch {
    /* ignore */
  }
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open FORMA', click: () => showMainWindow() },
    { label: 'Hide to tray', click: () => mainWindow?.hide() },
    { type: 'separator' },
    {
      label: autostartOn ? '✓ Launch at startup' : 'Launch at startup',
      click: () => {
        try {
          const next = !getAutostartEnabled();
          setAutostart(next);
          db?.setSetting('system.autostart', String(next));
          rebuildTrayMenu();
        } catch (err) {
          console.error('[FORMA] Autostart toggle failed', err);
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Stop live wallpaper',
      click: () => {
        void stopLiveWallpaper().catch((err) => console.warn('[FORMA] stop live', err));
      },
    },
    { type: 'separator' },
    {
      label: 'Quit FORMA',
      click: () => {
        isQuitting = true;
        void stopLiveWallpaper().finally(() => app.quit());
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
}

function createTray() {
  try {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAFUlEQVQ4T2NkYGD4z0AEYBxVSF+FAP5FDvcfmiBUAAAAAElFTkSuQmCC',
      'base64'
    );
    const icon = nativeImage.createFromBuffer(png);
    tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
    tray.setToolTip('FORMA — Personal Workspace');
    rebuildTrayMenu();
    tray.on('double-click', () => showMainWindow());
    tray.on('click', () => showMainWindow());
  } catch (err) {
    console.warn('[FORMA] Tray unavailable:', err);
  }
}

app.whenReady().then(async () => {
  try {
    const userDataPath = app.getPath('userData');
    db = new DatabaseService(path.join(userDataPath, 'forma.db'));
    await db.initialize();

    const saved = db.getSetting('system.autostart');
    if (saved === 'true' || saved === 'false') {
      try {
        setAutostart(saved === 'true');
      } catch {
        /* ignore */
      }
    }
  } catch (err) {
    console.error('[FORMA] Database startup failed:', err);
    db = null;
    dialog.showErrorBox(
      'FORMA — SQLite',
      'Native module better-sqlite3 failed to load.\n\n' +
        'Fix (in project folder):\n' +
        '  npm run rebuild:native\n\n' +
        'Requires Visual C++ Build Tools if rebuild compiles from source.\n\n' +
        String(err instanceof Error ? err.message : err)
    );
  }

  try {
    registerIpcHandlers(db);
  } catch (err) {
    console.error('[FORMA] IPC registration failed:', err);
  }

  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      showMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    // macOS
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  try {
    void stopLiveWallpaper();
  } catch {
    /* ignore */
  }
  try {
    db?.close();
  } catch {
    /* ignore */
  }
});
