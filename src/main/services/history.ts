import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import type { TrackInfo } from './websocket'

export interface HistoryEntry {
  time: string
  artist: string
  track: string
  url: string
  cover: string
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
    const entry: HistoryEntry = {
      time: new Date().toLocaleString('ru-RU'),
      artist: trackInfo.artist.replace(/[\r\n]/g, ''),
      track: trackInfo.track,
      url: `https://music.youtube.com/watch?v=${trackInfo.videoId}`,
      cover: trackInfo.cover
    }

    try {
      const existing: HistoryEntry[] = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
      existing.unshift(entry)
      fs.writeFileSync(this.filePath, JSON.stringify(existing.slice(0, 500), null, 2), 'utf-8')
    } catch {
      fs.writeFileSync(this.filePath, JSON.stringify([entry], null, 2), 'utf-8')
    }
  }

  getRecent(limit = 50): HistoryEntry[] {
    try {
      const all: HistoryEntry[] = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
      return all.slice(0, limit)
    } catch {
      return []
    }
  }
}
