import { Client } from 'discord-rpc'

export class DiscordService {
  private client: Client
  private _connected = false
  private _lastVideoId = ''

  constructor(private clientId: string) {
    this.client = new Client({ transport: 'ipc' })
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.login({ clientId: this.clientId })
      this._connected = true
      return true
    } catch {
      this._connected = false
      return false
    }
  }

  get connected() { return this._connected }
  get lastVideoId() { return this._lastVideoId }

  updatePresence(
    track: string,
    artist: string,
    cover: string,
    currentTime: number,
    videoId: string,
    isPlaying: boolean
  ) {
    if (!this._connected) return

    if (!isPlaying) {
      this.client.clearActivity()
      return
    }

    const startTimestamp = new Date(Date.now() - currentTime * 1000)

    this.client.setActivity({
      details: track.slice(0, 128),
      state: artist.slice(0, 128),
      largeImageKey: cover,
      largeImageText: track.slice(0, 128),
      startTimestamp,
      buttons: [
        { label: 'Listen', url: `https://music.youtube.com/watch?v=${videoId}` },
        { label: 'Download', url: 'https://github.com/M3th4d0n/YtMusic-RPC' }
      ]
    })

    this._lastVideoId = videoId
  }

  destroy() {
    if (this._connected) {
      this.client.destroy()
      this._connected = false
    }
  }
}
