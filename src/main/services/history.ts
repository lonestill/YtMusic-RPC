import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import type { TrackInfo } from './websocket'

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

export class HistoryService {
  private filePath: string

  constructor() {
    const dir = path.join(app.getPath('userData'), 'history')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    this.filePath = path.join(dir, 'history.json')
    if (!fs.existsSync(this.filePath)) fs.writeFileSync(this.filePath, '[]', 'utf-8')
  }

  save(trackInfo: TrackInfo) {
    const now = Date.now()
    const entry: HistoryEntry = {
      time: new Date(now).toLocaleString('ru-RU'),
      timestamp: now,
      artist: trackInfo.artist.replace(/[\r\n]/g, ''),
      track: trackInfo.track,
      url: `https://music.youtube.com/watch?v=${trackInfo.videoId}`,
      cover: trackInfo.cover
    }

    try {
      const existing: HistoryEntry[] = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
      existing.unshift(entry)
      fs.writeFileSync(this.filePath, JSON.stringify(existing.slice(0, 1000), null, 2), 'utf-8')
    } catch {
      fs.writeFileSync(this.filePath, JSON.stringify([entry], null, 2), 'utf-8')
    }
  }

  clear() {
    fs.writeFileSync(this.filePath, '[]', 'utf-8')
  }

  getRecent(limit = 200): HistoryEntry[] {
    try {
      const all: HistoryEntry[] = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
      return all.slice(0, limit)
    } catch {
      return []
    }
  }

  getStats(): HistoryStats {
    let all: HistoryEntry[] = []
    try {
      all = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
    } catch {
      return { total: 0, today: 0, thisWeek: 0, topArtists: [], topTracks: [] }
    }

    const now = Date.now()
    const dayMs  = 86_400_000
    const weekMs = 7 * dayMs

    const todayStart = new Date().setHours(0, 0, 0, 0)

    const today    = all.filter(e => (e.timestamp || 0) >= todayStart).length
    const thisWeek = all.filter(e => (e.timestamp || 0) >= now - weekMs).length

    const artistMap = new Map<string, number>()
    const trackMap  = new Map<string, { artist: string; count: number; cover: string }>()

    for (const e of all) {
      artistMap.set(e.artist, (artistMap.get(e.artist) ?? 0) + 1)
      const key = e.track
      const prev = trackMap.get(key)
      trackMap.set(key, { artist: e.artist, count: (prev?.count ?? 0) + 1, cover: e.cover })
    }

    const topArtists = [...artistMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))

    const topTracks = [...trackMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([name, v]) => ({ name, ...v }))

    return { total: all.length, today, thisWeek, topArtists, topTracks }
  }
}
