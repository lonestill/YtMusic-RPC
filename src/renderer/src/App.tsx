import { useEffect, useState } from 'react'
import { CurrentTrack } from './components/CurrentTrack'
import { History } from './components/History'
import { Settings } from './components/Settings'
import {
  IconMusic, IconClock, IconSettings,
  IconMinus, IconX, IconDiscord, IconPlug
} from './components/Icons'
import { type Tab, type TrackInfo, type AppStatus } from './types'

const TABS: { id: Tab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: 'track',    label: 'Now Playing', Icon: IconMusic },
  { id: 'history',  label: 'History',     Icon: IconClock },
  { id: 'settings', label: 'Settings',    Icon: IconSettings }
]

export default function App() {
  const [tab, setTab] = useState<Tab>('track')
  const [track, setTrack] = useState<TrackInfo | null>(null)
  const [discord, setDiscord] = useState(false)
  const [websocket, setWebsocket] = useState(false)
  const [version, setVersion] = useState('')
  const [updateVersion, setUpdateVersion] = useState('')

  useEffect(() => {
    window.api.getStatus().then((s: AppStatus) => {
      setDiscord(s.discord)
      setWebsocket(s.websocket)
      setTrack(s.currentTrack)
      setVersion(s.version)
    })

    const offTrack  = window.api.onTrackUpdate(setTrack)
    const offStatus = window.api.onStatusUpdate((s) => {
      if (s.discord   !== undefined) setDiscord(s.discord)
      if (s.websocket !== undefined) setWebsocket(s.websocket)
    })
    const offUpdate = window.api.onUpdateAvailable(setUpdateVersion)

    return () => { offTrack(); offStatus(); offUpdate() }
  }, [])

  return (
    <div className="app">
      <div className="titlebar">
        <div className="titlebar-wordmark">
          <span className="titlebar-dot" />
          YtMusic RPC
          {version && (
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>
              v{version}
            </span>
          )}
        </div>
        <div className="titlebar-controls">
          <button className="titlebar-btn" onClick={() => window.api.minimize()} title="Minimize">
            <IconMinus size={14} />
          </button>
          <button className="titlebar-btn close" onClick={() => window.api.hide()} title="Close to tray">
            <IconX size={14} />
          </button>
        </div>
      </div>

      <div className="body">
        <nav className="sidebar">
          <div className="sidebar-section">Menu</div>

          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <span className="nav-icon"><Icon size={16} /></span>
              {label}
            </button>
          ))}

          <div className="sidebar-spacer" />

          <div className="sidebar-status">
            <div className="status-item">
              <span className={`led ${discord ? 'on' : 'off'}`} />
              <IconDiscord size={13} style={{ opacity: 0.6 }} />
              Discord RPC
            </div>
            <div className="status-item">
              <span className={`led ${websocket ? 'on' : 'warn'}`} />
              <IconPlug size={13} style={{ opacity: 0.6 }} />
              Extension
            </div>
          </div>
        </nav>

        <div className="content-wrap">
          {updateVersion && (
            <div className="update-banner">
              <span>Update available — v{updateVersion}</span>
              <button
                className="btn-ghost"
                onClick={() => window.api.openExternal('https://github.com/M3th4d0n/YtMusic-RPC/releases/latest')}
              >
                Download ↗
              </button>
            </div>
          )}

          <div className="content">
            {tab === 'track'    && <CurrentTrack track={track} />}
            {tab === 'history'  && <History />}
            {tab === 'settings' && <Settings />}
          </div>

          <div className="mini-player">
            {track ? (
              <>
                <div className="mini-art">
                  {track.cover
                    ? <img src={track.cover} alt="" />
                    : <IconMusic size={20} style={{ opacity: 0.3 }} />
                  }
                </div>
                <div className="mini-meta">
                  <div className="mini-track">{track.track}</div>
                  <div className="mini-artist">{track.artist}</div>
                </div>
                <span className={`mini-badge ${track.isPlaying ? 'playing' : 'paused'}`}>
                  {track.isPlaying ? 'Playing' : 'Paused'}
                </span>
              </>
            ) : (
              <span className="mini-empty">No track playing</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
