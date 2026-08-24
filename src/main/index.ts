import { app, BrowserWindow, ipcMain } from 'electron'
import { randomUUID } from 'node:crypto'
import { unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createSttProvider } from './stt/createSttProvider'

if (process.env.SAGE_USER_DATA_DIR) {
  app.setPath('userData', process.env.SAGE_USER_DATA_DIR)
}

const sttProvider = createSttProvider()

ipcMain.handle('stt:transcribe', async (_event, wavBytes: Uint8Array) => {
  const tempPath = join(tmpdir(), `sage-${randomUUID()}.wav`)
  writeFileSync(tempPath, Buffer.from(wavBytes))
  try {
    return await sttProvider.transcribe(tempPath)
  } finally {
    try {
      unlinkSync(tempPath)
    } catch {
      // best-effort cleanup
    }
  }
})

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.once('ready-to-show', () => win.show())

  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

void app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
