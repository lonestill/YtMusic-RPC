import { useEffect, useState } from 'react'
import { type Config } from '../types'
import { IconCheck, IconExternalLink, IconX } from './Icons'

const DEFAULT: Config = {
  discordClientId: '1194717480627740753',
  customButton1Label: 'Listen', customButton1Url: '',
  customButton2Label: 'Download', customButton2Url: 'https://github.com/lonestill/YtMusic-RPC',
  toastNotifications: true,
  blacklistArtists: [], blacklistTracks: [],
  analyticsEnabled: false, botToken: '', chatId: '',
  autostart: false
}

type Section = 'system' | 'discord' | 'blacklist' | 'telegram' | 'about'

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'system',    label: 'System' },
  { id: 'discord',   label: 'Discord' },
  { id: 'blacklist', label: 'Blacklist' },
  { id: 'telegram',  label: 'Telegram' },
  { id: 'about',     label: 'About' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-track" />
    </label>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-label">{label}</div>
        {hint && <div className="settings-hint">{hint}</div>}
      </div>
      {children}
    </div>
  )
}

function BlacklistSection({ title, items, onAdd, onRemove, placeholder }: {
  title: string; items: string[]
  onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder: string
}) {
  const [input, setInput] = useState('')
  function add() {
    const v = input.trim()
    if (v && !items.includes(v)) { onAdd(v); setInput('') }
  }
  return (
    <div className="blacklist-section">
      <div className="blacklist-label">{title}</div>
      <div className="blacklist-input-row">
        <input className="settings-input" style={{ flex: 1, width: 'auto' }}
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} placeholder={placeholder} />
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

export function Settings({ onThemeChange }: { onThemeChange?: (t: 'dark' | 'light') => void }) {
  const [config, setConfig] = useState<Config>(DEFAULT)
  const [saved, setSaved]   = useState(false)
  const [section, setSection] = useState<Section>('system')

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
    <div className="settings-layout">
      {/* Left nav */}
      <nav className="settings-nav">
        {SECTIONS.map(s => (
          <button key={s.id}
            className={`settings-nav-item ${section === s.id ? 'active' : ''}`}
            onClick={() => setSection(s.id)}>
            {s.label}
          </button>
        ))}
      </nav>

      {/* Right panel */}
      <div className="settings-panel">
        {section === 'system' && (
          <>
            <div className="settings-panel-title">System</div>
            <div className="settings-group">
              <Row label="Launch on startup" hint="Start with Windows">
                <Toggle checked={config.autostart} onChange={v => upd('autostart', v)} />
              </Row>
              <Row label="Toast notifications" hint="Show notification when track changes">
                <Toggle checked={config.toastNotifications} onChange={v => upd('toastNotifications', v)} />
              </Row>
              <Row label="Theme" hint="Light or dark interface">
                <div className="theme-switch">
                  <button
                    className={`theme-btn ${config.theme !== 'light' ? 'active' : ''}`}
                    onClick={() => { upd('theme', 'dark'); onThemeChange?.('dark') }}>
                    Dark
                  </button>
                  <button
                    className={`theme-btn ${config.theme === 'light' ? 'active' : ''}`}
                    onClick={() => { upd('theme', 'light'); onThemeChange?.('light') }}>
                    Light
                  </button>
                </div>
              </Row>
            </div>
            <SaveRow saved={saved} onSave={save} />
          </>
        )}

        {section === 'discord' && (
          <>
            <div className="settings-panel-title">Discord</div>
            <div className="settings-group">
              <Row label="Application ID" hint="Discord Developer Portal App ID">
                <input className="settings-input" value={config.discordClientId}
                  onChange={e => upd('discordClientId', e.target.value)} placeholder="Client ID" />
              </Row>
            </div>
            <SaveRow saved={saved} onSave={save} />
          </>
        )}

        {section === 'blacklist' && (
          <>
            <div className="settings-panel-title">Blacklist</div>
            <div className="settings-group" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <BlacklistSection title="Artists" items={config.blacklistArtists}
                onAdd={addArtist} onRemove={removeArtist} placeholder="Artist name…" />
              <BlacklistSection title="Tracks" items={config.blacklistTracks}
                onAdd={addTrack} onRemove={removeTrack} placeholder="Track name…" />
            </div>
          </>
        )}

        {section === 'telegram' && (
          <>
            <div className="settings-panel-title">Telegram Notifications</div>
            <div className="settings-group">
              <Row label="Enable" hint="Send now-playing to Telegram bot">
                <Toggle checked={config.analyticsEnabled} onChange={v => upd('analyticsEnabled', v)} />
              </Row>
              {config.analyticsEnabled && (<>
                <Row label="Bot Token" hint="From @BotFather">
                  <input className="settings-input" type="password" value={config.botToken}
                    onChange={e => upd('botToken', e.target.value)} placeholder="123456:ABC-DEF…" />
                </Row>
                <Row label="Chat ID" hint="Your Telegram user or chat ID">
                  <input className="settings-input" value={config.chatId}
                    onChange={e => upd('chatId', e.target.value)} placeholder="-100123456789" />
                </Row>
              </>)}
            </div>
            <SaveRow saved={saved} onSave={save} />
          </>
        )}

        {section === 'about' && (
          <>
            <div className="settings-panel-title">About</div>
            <div className="settings-group">
              <Row label="Repository">
                <button className="btn-ghost" onClick={() => window.api.openExternal('https://github.com/lonestill/YtMusic-RPC')}>
                  GitHub <IconExternalLink size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                </button>
              </Row>
              <Row label="Authors">
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-ghost" onClick={() => window.api.openExternal('https://github.com/lonestill')}>lonestill</button>
                  <button className="btn-ghost" onClick={() => window.api.openExternal('https://github.com/Anfi1')}>Anfi1</button>
                </div>
              </Row>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SaveRow({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  return (
    <div className="save-row">
      <button className="btn-save" onClick={onSave}>
        {saved
          ? <><IconCheck size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />Saved</>
          : 'Save changes'}
      </button>
      {saved && <span className="save-ok">Settings applied</span>}
    </div>
  )
}
