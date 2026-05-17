export interface TrackInfo {
  track: string
  artist: string
  cover: string
  currentTime: number
  totalDuration: number
  isPlaying: boolean
  videoId: string
}

export interface HistoryEntry {
  time: string
  timestamp: number
  artist: string
  track: string
  url: string
  cover: string
}

export interface HistoryStats {
  total: number
  today: number
  thisWeek: number
  topArtists: { name: string; count: number }[]
  topTracks: { name: string; artist: string; count: number; cover: string }[]
}

export interface Config {
  discordClientId: string
  customButton1Label: string
  customButton1Url: string
  customButton2Label: string
  customButton2Url: string
  privateMode: boolean
  hideTrackName: boolean
  hideArtistName: boolean
  toastNotifications: boolean
  blacklistArtists: string[]
  blacklistTracks: string[]
  analyticsEnabled: boolean
  botToken: string
  chatId: string
  autostart: boolean
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

export type Tab = 'track' | 'history' | 'stats' | 'settings'
