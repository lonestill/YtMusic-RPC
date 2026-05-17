import { contextBridge, ipcRenderer } from 'electron'
import type { TrackInfo } from '../main/services/websocket'
import type { HistoryEntry } from '../main/services/history'

export interface AppConfig {
  analyticsEnabled: boolean
  botToken: string
  chatId: string
  discordClientId: string
}

export interface AppStatus {
  discord: boolean
  websocket: boolean
  currentTrack: TrackInfo | null
  version: string
}

export interface StatusUpdate {
  discord?: boolean
  websocket?: boolean
}

const api = {
  getConfig: (): Promise<AppConfig> => ipcRenderer.invoke('config:get'),
  setConfig: (updates: Partial<AppConfig>): Promise<void> => ipcRenderer.invoke('config:set', updates),
  getHistory: (): Promise<HistoryEntry[]> => ipcRenderer.invoke('history:get'),
  getStatus: (): Promise<AppStatus> => ipcRenderer.invoke('status:get'),
  minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  hide: (): Promise<void> => ipcRenderer.invoke('window:hide'),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('shell:open', url),

  onTrackUpdate: (cb: (track: TrackInfo) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: TrackInfo) => cb(data)
    ipcRenderer.on('track:update', handler)
    return () => ipcRenderer.removeListener('track:update', handler)
  },
  onStatusUpdate: (cb: (status: StatusUpdate) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: StatusUpdate) => cb(data)
    ipcRenderer.on('status:update', handler)
    return () => ipcRenderer.removeListener('status:update', handler)
  },
  onUpdateAvailable: (cb: (version: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, v: string) => cb(v)
    ipcRenderer.on('update:available', handler)
    return () => ipcRenderer.removeListener('update:available', handler)
  }
}

contextBridge.exposeInMainWorld('api', api)

declare global {
  interface Window {
    api: typeof api
  }
}
