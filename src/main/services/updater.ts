import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'

export function setupAutoUpdater(getWindow: () => BrowserWindow | null) {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    getWindow()?.webContents.send('update:downloading', info.version)
  })

  autoUpdater.on('update-downloaded', (info) => {
    getWindow()?.webContents.send('update:ready', info.version)
  })

  autoUpdater.on('error', () => {
    // silently ignore — not critical
  })

  autoUpdater.checkForUpdates().catch(() => {})
}
