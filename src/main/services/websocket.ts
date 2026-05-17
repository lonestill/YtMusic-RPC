import { WebSocketServer, WebSocket } from 'ws'
import { EventEmitter } from 'events'

export interface TrackInfo {
  track: string
  artist: string
  cover: string
  currentTime: number
  totalDuration: number
  isPlaying: boolean
  videoId: string
}

export class WebSocketService extends EventEmitter {
  private wss?: WebSocketServer
  private _clientConnected = false

  constructor(private port = 5000) {
    super()
  }

  start() {
    this.wss = new WebSocketServer({ port: this.port, host: '127.0.0.1' })

    this.wss.on('connection', (ws: WebSocket) => {
      this._clientConnected = true
      this.emit('clientConnected')

      ws.on('message', (data) => {
        try {
          const info: TrackInfo = JSON.parse(data.toString())
          this.emit('trackUpdate', info)
        } catch {
          // ignore malformed messages
        }
      })

      ws.on('close', () => {
        this._clientConnected = false
        this.emit('clientDisconnected')
      })

      ws.on('error', () => {
        this._clientConnected = false
        this.emit('clientDisconnected')
      })
    })
  }

  get clientConnected() { return this._clientConnected }

  stop() {
    this.wss?.close()
  }
}
