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
  artist: string
  track: string
  url: string
  cover: string
}

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

export type Tab = 'track' | 'history' | 'settings'
