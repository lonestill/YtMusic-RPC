import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell, Notification } from 'electron'
import * as path from 'path'
import { DiscordService } from './services/discord'
import { WebSocketService, type TrackInfo } from './services/websocket'
import { HistoryService } from './services/history'
import { sendTelegramLog } from './services/telegram'
import store from './store'
import { setupAutoUpdater } from './services/updater'

const VERSION = '2.0.0'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let quitting = false

const discord = new DiscordService()
const wsService = new WebSocketService(5000)
const history = new HistoryService()

let currentTrack: TrackInfo | null = null
let discordConnected = false
let wsClientConnected = false
let lastCurrentTime = -1
let pauseDetectTimer: ReturnType<typeof setTimeout> | null = null

function isBlacklisted(trackInfo: TrackInfo): boolean {
  const cfg = store.store
  const artist = trackInfo.artist.toLowerCase()
  const track = trackInfo.track.toLowerCase()
  return (
    cfg.blacklistArtists.some(a => artist.includes(a.toLowerCase())) ||
    cfg.blacklistTracks.some(t => track.includes(t.toLowerCase()))
  )
}

function showToast(track: string, artist: string, cover: string) {
  if (!store.get('toastNotifications')) return

  // tray balloon on Windows (lighter, no sound)
  if (process.platform === 'win32' && tray) {
    tray.displayBalloon({
      title: track,
      content: artist,
      iconType: 'none',
      noSound: true
    })
    return
  }

  if (!Notification.isSupported()) return
  new Notification({
    title: track,
    body: artist,
    icon: cover || undefined,
    silent: true
  }).show()
}

function applyAutostart() {
  app.setLoginItemSettings({ openAtLogin: store.get('autostart') })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 620,
    minWidth: 720,
    minHeight: 500,
    frame: false,
    backgroundColor: '#111111',
    icon: path.join(__dirname, '../../resources/icon.ico'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.on('close', (e) => {
    if (!quitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })
}

function createTray() {
  const iconPath = path.join(__dirname, '../../resources/icon.ico')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  tray = new Tray(icon)

  const menu = Menu.buildFromTemplate([
    { label: 'Open YtMusic-RPC', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Exit', click: () => { quitting = true; app.quit() } }
  ])

  tray.setContextMenu(menu)
  tray.setToolTip('YtMusic-RPC')
  tray.on('double-click', () => mainWindow?.show())
}

function setupIPC() {
  ipcMain.handle('config:get', () => store.store)

  ipcMain.handle('config:set', (_, updates: Record<string, unknown>) => {
    const wasAutostart = store.get('autostart')
    for (const [key, value] of Object.entries(updates)) {
      store.set(key as never, value)
    }
    if (updates['autostart'] !== undefined && updates['autostart'] !== wasAutostart) {
      applyAutostart()
    }
    // reconnect discord if client ID changed
    if (updates['discordClientId']) {
      discord.reconnect()
    }
    if (currentTrack) discord.updatePresence(currentTrack)
  })

  ipcMain.handle('history:get', () => history.getRecent(200))
  ipcMain.handle('history:stats', () => history.getStats())
  ipcMain.handle('history:clear', () => history.clear())

  ipcMain.handle('blacklist:add-artist', (_, artist: string) => {
    const list = store.get('blacklistArtists')
    if (!list.includes(artist)) store.set('blacklistArtists', [...list, artist])
  })
  ipcMain.handle('blacklist:remove-artist', (_, artist: string) => {
    store.set('blacklistArtists', store.get('blacklistArtists').filter(a => a !== artist))
  })
  ipcMain.handle('blacklist:add-track', (_, track: string) => {
    const list = store.get('blacklistTracks')
    if (!list.includes(track)) store.set('blacklistTracks', [...list, track])
  })
  ipcMain.handle('blacklist:remove-track', (_, track: string) => {
    store.set('blacklistTracks', store.get('blacklistTracks').filter(t => t !== track))
  })

  ipcMain.handle('status:get', () => ({
    discord: discordConnected,
    websocket: wsClientConnected,
    currentTrack,
    version: VERSION
  }))

  ipcMain.handle('discord:reconnect', async () => {
    discordConnected = false
    broadcast('status:update', { discord: false })
    discordConnected = await discord.reconnect()
    broadcast('status:update', { discord: discordConnected })
    return discordConnected
  })

  ipcMain.handle('window:minimize', () => mainWindow?.minimize())
  ipcMain.handle('window:hide', () => mainWindow?.hide())
  ipcMain.handle('shell:open', (_, url: string) => shell.openExternal(url))
}

function broadcast(channel: string, data: unknown) {
  mainWindow?.webContents.send(channel, data)
}

function setupWebSocket() {
  wsService.on('trackUpdate', (trackInfo: TrackInfo) => {
    // YTM subtitle contains "Artist • views • likes • year" — keep only the first segment
    const rawArtist = trackInfo.artist.replace(/[\r\n]/g, '').trim()
    const cleanArtist = rawArtist.split(/\s*•\s*/)[0].trim() || rawArtist

    // upgrade cover resolution: replace =w{n}-h{n}... with w512-h512
    const cover = trackInfo.cover
      ? trackInfo.cover.replace(/=w\d+-h\d+[^"'\s]*/i, '=w512-h512-l90-rj')
      : trackInfo.cover

    const clean: TrackInfo = { ...trackInfo, artist: cleanArtist, cover }

    if (isBlacklisted(clean)) {
      discord.clear()
      currentTrack = null
      broadcast('track:update', null)
      return
    }

    const isNewTrack = trackInfo.isPlaying && trackInfo.videoId !== discord.lastVideoId

    if (isNewTrack) {
      history.save(clean)
      showToast(clean.track, clean.artist, clean.cover)
      sendTelegramLog(
        `🎵 Now Playing:\nArtist: ${cleanArtist}\nTrack: ${trackInfo.track}\n` +
        `[Listen](https://music.youtube.com/watch?v=${trackInfo.videoId})`
      ).catch(() => {})
    }

    const newTime = Number(clean.currentTime)
    const timeAdvanced = newTime !== lastCurrentTime

    // if extension says playing but time hasn't moved, keep paused state
    let effective = clean
    if (clean.isPlaying && !timeAdvanced && currentTrack && !currentTrack.isPlaying) {
      effective = { ...clean, isPlaying: false }
    }

    discord.updatePresence(effective)
    currentTrack = effective
    broadcast('track:update', effective)

    if (effective.isPlaying) {
      if (timeAdvanced) {
        // time is advancing → reset pause timer
        lastCurrentTime = newTime
        if (pauseDetectTimer) clearTimeout(pauseDetectTimer)
        pauseDetectTimer = setTimeout(() => {
          if (currentTrack?.isPlaying) {
            const paused: TrackInfo = { ...currentTrack, isPlaying: false }
            currentTrack = paused
            broadcast('track:update', paused)
            discord.updatePresence(paused)
          }
        }, 3500)
      }
    } else {
      if (pauseDetectTimer) { clearTimeout(pauseDetectTimer); pauseDetectTimer = null }
      lastCurrentTime = newTime
    }
  })

  wsService.on('clientConnected', () => {
    wsClientConnected = true
    broadcast('status:update', { websocket: true })
  })

  wsService.on('clientDisconnected', () => {
    wsClientConnected = false
    broadcast('status:update', { websocket: false })
  })

  wsService.start()
}

async function init() {
  await app.whenReady()

  applyAutostart()
  createWindow()
  createTray()
  setupIPC()
  setupWebSocket()

  discordConnected = await discord.connect()
  broadcast('status:update', { discord: discordConnected })

  if (app.isPackaged) {
    setupAutoUpdater(() => mainWindow)
  }

  app.on('activate', () => {
    if (!mainWindow) createWindow()
    else mainWindow.show()
  })
}

app.on('before-quit', () => {
  discord.destroy()
  wsService.stop()
})

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') app.quit()
})

init()
