import { contextBridge, ipcRenderer } from 'electron'
import type { TrackInfo } from '../main/services/websocket'
import type { HistoryEntry, HistoryStats } from '../main/services/history'
import type { Config } from '../main/store'

export type { Config, TrackInfo, HistoryEntry, HistoryStats }

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
  // config
  getConfig: (): Promise<Config> => ipcRenderer.invoke('config:get'),
  setConfig: (updates: Partial<Config>): Promise<void> => ipcRenderer.invoke('config:set', updates),

  // history
  getHistory: (limit?: number): Promise<HistoryEntry[]> => ipcRenderer.invoke('history:get', limit),
  getStats: (): Promise<HistoryStats> => ipcRenderer.invoke('history:stats'),
  clearHistory: (): Promise<void> => ipcRenderer.invoke('history:clear'),

  // blacklist
  addBlacklistArtist: (artist: string): Promise<void> => ipcRenderer.invoke('blacklist:add-artist', artist),
  removeBlacklistArtist: (artist: string): Promise<void> => ipcRenderer.invoke('blacklist:remove-artist', artist),
  addBlacklistTrack: (track: string): Promise<void> => ipcRenderer.invoke('blacklist:add-track', track),
  removeBlacklistTrack: (track: string): Promise<void> => ipcRenderer.invoke('blacklist:remove-track', track),

  // discord
  reconnectDiscord: (): Promise<boolean> => ipcRenderer.invoke('discord:reconnect'),

  // window
  getStatus: (): Promise<AppStatus> => ipcRenderer.invoke('status:get'),
  minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  hide: (): Promise<void> => ipcRenderer.invoke('window:hide'),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('shell:open', url),

  // events
  onTrackUpdate: (cb: (track: TrackInfo | null) => void) => {
    const h = (_: Electron.IpcRendererEvent, d: TrackInfo | null) => cb(d)
    ipcRenderer.on('track:update', h)
    return () => ipcRenderer.removeListener('track:update', h)
  },
  onStatusUpdate: (cb: (s: StatusUpdate) => void) => {
    const h = (_: Electron.IpcRendererEvent, d: StatusUpdate) => cb(d)
    ipcRenderer.on('status:update', h)
    return () => ipcRenderer.removeListener('status:update', h)
  },
  onUpdateDownloading: (cb: (version: string) => void) => {
    const h = (_: Electron.IpcRendererEvent, v: string) => cb(v)
    ipcRenderer.on('update:downloading', h)
    return () => ipcRenderer.removeListener('update:downloading', h)
  },
  onUpdateReady: (cb: (version: string) => void) => {
    const h = (_: Electron.IpcRendererEvent, v: string) => cb(v)
    ipcRenderer.on('update:ready', h)
    return () => ipcRenderer.removeListener('update:ready', h)
  }
}

contextBridge.exposeInMainWorld('api', api)

declare global {
  interface Window { api: typeof api }
}
