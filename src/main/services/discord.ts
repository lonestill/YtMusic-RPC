import { Client } from 'discord-rpc'
import store from '../store'
import type { TrackInfo } from './websocket'

export class DiscordService {
  private client: Client
  private _connected = false
  private _lastVideoId = ''

  constructor() {
    this.client = new Client({ transport: 'ipc' })
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.login({ clientId: store.get('discordClientId') })
      this._connected = true
      return true
    } catch {
      this._connected = false
      return false
    }
  }

  async reconnect(): Promise<boolean> {
    this.destroy()
    this.client = new Client({ transport: 'ipc' })
    return this.connect()
  }

  get connected() { return this._connected }
  get lastVideoId() { return this._lastVideoId }

  updatePresence(info: TrackInfo) {
    if (!this._connected) return

    const cfg = store.store
    const track  = info.track.slice(0, 128)
    const artist = info.artist.slice(0, 128) || '—'

    const buttons: { label: string; url: string }[] = []
    const btn1Label = cfg.customButton1Label?.trim()
    const btn1Url   = cfg.customButton1Url?.trim() || `https://music.youtube.com/watch?v=${info.videoId}`
    if (btn1Label) buttons.push({ label: btn1Label.slice(0, 32), url: btn1Url })

    const btn2Label = cfg.customButton2Label?.trim()
    const btn2Url   = cfg.customButton2Url?.trim()
    if (btn2Label && btn2Url) buttons.push({ label: btn2Label.slice(0, 32), url: btn2Url })

    try {
      this.client.setActivity({
        details: track,
        state: artist,
        largeImageKey: info.cover || undefined,
        largeImageText: track,
        startTimestamp: info.isPlaying
          ? new Date(Date.now() - info.currentTime * 1000)
          : undefined,
        smallImageKey: info.isPlaying ? undefined : 'pause',
        smallImageText: info.isPlaying ? undefined : 'Paused',
        buttons: buttons.length ? buttons : undefined
      })
    } catch (e) {
      console.error('[Discord] setActivity error:', e)
    }

    this._lastVideoId = info.videoId
  }

  clear() {
    if (this._connected) this.client.clearActivity()
  }

  destroy() {
    if (this._connected) {
      try { this.client.destroy() } catch {}
      this._connected = false
    }
  }
}
