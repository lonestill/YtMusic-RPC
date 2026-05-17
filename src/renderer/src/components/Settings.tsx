import { useEffect, useState } from 'react'
import { type Config } from '../types'
import { IconCheck, IconExternalLink, IconX } from './Icons'

const DEFAULT: Config = {
  discordClientId: '1194717480627740753',
  customButton1Label: 'Listen', customButton1Url: '',
  customButton2Label: 'Download', customButton2Url: 'https://github.com/M3th4d0n/YtMusic-RPC',
  privateMode: false, hideTrackName: false, hideArtistName: false,
  toastNotifications: true,
  blacklistArtists: [], blacklistTracks: [],
  analyticsEnabled: false, botToken: '', chatId: '',
  autostart: false
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-track" />
    </label>
  )
}

function BlacklistSection({
  title, items, onAdd, onRemove, placeholder
}: {
  title: string
  items: string[]
  onAdd: (v: string) => void
  onRemove: (v: string) => void
  placeholder: string
}) {
  const [input, setInput] = useState('')

  function add() {
    const v = input.trim()
    if (v && !items.includes(v)) { onAdd(v); setInput('') }
  }

  return (
    <div>
      <div className="blacklist-label">{title}</div>
      <div className="blacklist-input-row">
        <input
          className="settings-input"
          style={{ flex: 1, width: 'auto' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder}
        />
        <button className="btn-ghost" onClick={add}>Add</button>
      </div>
      {items.length > 0 && (
        <div className="blacklist-tags">
          {items.map(item => (
            <span key={item} className="blacklist-tag">
              {item}
              <button onClick={() => onRemove(item)}><IconX size={10} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function Settings() {
  const [config, setConfig] = useState<Config>(DEFAULT)
  const [saved, setSaved] = useState(false)

  useEffect(() => { window.api.getConfig().then(setConfig) }, [])

  function upd<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig(p => ({ ...p, [key]: value }))
  }

  async function save() {
    await window.api.setConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function addArtist(v: string) {
    await window.api.addBlacklistArtist(v)
    upd('blacklistArtists', [...config.blacklistArtists, v])
  }
  async function removeArtist(v: string) {
    await window.api.removeBlacklistArtist(v)
    upd('blacklistArtists', config.blacklistArtists.filter(x => x !== v))
  }
  async function addTrack(v: string) {
    await window.api.addBlacklistTrack(v)
    upd('blacklistTracks', [...config.blacklistTracks, v])
  }
  async function removeTrack(v: string) {
    await window.api.removeBlacklistTrack(v)
    upd('blacklistTracks', config.blacklistTracks.filter(x => x !== v))
  }

  return (
    <div className="settings-page">
      <div className="page-title">Settings</div>

      {/* System */}
      <div className="settings-group">
        <div className="settings-group-title">System</div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Launch on startup</div>
            <div className="settings-hint">Start with Windows</div>
          </div>
          <Toggle checked={config.autostart} onChange={v => upd('autostart', v)} />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Toast notifications</div>
            <div className="settings-hint">Show notification when track changes</div>
          </div>
          <Toggle checked={config.toastNotifications} onChange={v => upd('toastNotifications', v)} />
        </div>
      </div>

      {/* Discord */}
      <div className="settings-group">
        <div className="settings-group-title">Discord</div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Application ID</div>
            <div className="settings-hint">Discord Developer Portal App ID</div>
          </div>
          <input className="settings-input" value={config.discordClientId}
            onChange={e => upd('discordClientId', e.target.value)} placeholder="Client ID" />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Button 1</div>
            <div className="settings-hint">Label and URL (default: Listen)</div>
          </div>
          <div className="settings-input-pair">
            <input className="settings-input" style={{ width: 100 }} value={config.customButton1Label}
              onChange={e => upd('customButton1Label', e.target.value)} placeholder="Label" />
            <input className="settings-input" value={config.customButton1Url}
              onChange={e => upd('customButton1Url', e.target.value)} placeholder="URL (empty = track link)" />
          </div>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Button 2</div>
            <div className="settings-hint">Label and URL</div>
          </div>
          <div className="settings-input-pair">
            <input className="settings-input" style={{ width: 100 }} value={config.customButton2Label}
              onChange={e => upd('customButton2Label', e.target.value)} placeholder="Label" />
            <input className="settings-input" value={config.customButton2Url}
              onChange={e => upd('customButton2Url', e.target.value)} placeholder="URL" />
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="settings-group">
        <div className="settings-group-title">Privacy</div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Private mode</div>
            <div className="settings-hint">Hide cover art from Discord</div>
          </div>
          <Toggle checked={config.privateMode} onChange={v => upd('privateMode', v)} />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Hide track name</div>
            <div className="settings-hint">Show •••••• instead of track name</div>
          </div>
          <Toggle checked={config.hideTrackName} onChange={v => upd('hideTrackName', v)} />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Hide artist name</div>
            <div className="settings-hint">Show •••••• instead of artist name</div>
          </div>
          <Toggle checked={config.hideArtistName} onChange={v => upd('hideArtistName', v)} />
        </div>
      </div>

      {/* Blacklist */}
      <div className="settings-group">
        <div className="settings-group-title">Blacklist</div>
        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 14 }}>
          <BlacklistSection
            title="Artists" items={config.blacklistArtists}
            onAdd={addArtist} onRemove={removeArtist}
            placeholder="Artist name…"
          />
          <BlacklistSection
            title="Tracks" items={config.blacklistTracks}
            onAdd={addTrack} onRemove={removeTrack}
            placeholder="Track name…"
          />
        </div>
      </div>

      {/* Telegram */}
      <div className="settings-group">
        <div className="settings-group-title">Telegram Notifications</div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Enable</div>
            <div className="settings-hint">Send now-playing to Telegram bot</div>
          </div>
          <Toggle checked={config.analyticsEnabled} onChange={v => upd('analyticsEnabled', v)} />
        </div>
        {config.analyticsEnabled && (<>
          <div className="settings-row">
            <div>
              <div className="settings-label">Bot Token</div>
              <div className="settings-hint">From @BotFather</div>
            </div>
            <input className="settings-input" type="password" value={config.botToken}
              onChange={e => upd('botToken', e.target.value)} placeholder="123456:ABC-DEF…" />
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Chat ID</div>
              <div className="settings-hint">Your Telegram user or chat ID</div>
            </div>
            <input className="settings-input" value={config.chatId}
              onChange={e => upd('chatId', e.target.value)} placeholder="-100123456789" />
          </div>
        </>)}
      </div>

      <div className="save-row">
        <button className="btn-save" onClick={save}>
          {saved
            ? <><IconCheck size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />Saved</>
            : 'Save changes'}
        </button>
        {saved && <span className="save-ok">Settings applied</span>}
      </div>

      {/* About */}
      <div className="settings-group" style={{ marginTop: 20 }}>
        <div className="settings-group-title">About</div>
        <div className="settings-row">
          <div className="settings-label">Repository</div>
          <button className="btn-ghost" onClick={() => window.api.openExternal('https://github.com/M3th4d0n/YtMusic-RPC')}>
            GitHub <IconExternalLink size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
          </button>
        </div>
        <div className="settings-row">
          <div className="settings-label">Authors</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={() => window.api.openExternal('https://github.com/M3th4d0n')}>m3th4d0n</button>
            <button className="btn-ghost" onClick={() => window.api.openExternal('https://github.com/Anfi1')}>Anfi1</button>
          </div>
        </div>
      </div>
    </div>
  )
}
