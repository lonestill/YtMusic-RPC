import { useEffect, useState } from 'react'
import { type AppConfig } from '../types'
import { IconCheck, IconExternalLink } from './Icons'

export function Settings() {
  const [config, setConfig] = useState<AppConfig>({
    analyticsEnabled: false,
    botToken: '',
    chatId: '',
    discordClientId: '1194717480627740753'
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.api.getConfig().then(setConfig)
  }, [])

  function update<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    await window.api.setConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="settings-page">
      <div className="page-title">Settings</div>

      <div className="settings-group">
        <div className="settings-group-title">Discord</div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Application ID</div>
            <div className="settings-hint">Discord Developer Portal App ID</div>
          </div>
          <input
            className="settings-input"
            value={config.discordClientId}
            onChange={(e) => update('discordClientId', e.target.value)}
            placeholder="Discord Client ID"
          />
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-title">Telegram Notifications</div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Enable notifications</div>
            <div className="settings-hint">Send now-playing updates to Telegram</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={config.analyticsEnabled}
              onChange={(e) => update('analyticsEnabled', e.target.checked)}
            />
            <span className="toggle-track" />
          </label>
        </div>

        {config.analyticsEnabled && (
          <>
            <div className="settings-row">
              <div>
                <div className="settings-label">Bot Token</div>
                <div className="settings-hint">From @BotFather</div>
              </div>
              <input
                className="settings-input"
                type="password"
                value={config.botToken}
                onChange={(e) => update('botToken', e.target.value)}
                placeholder="123456:ABC-DEF…"
              />
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Chat ID</div>
                <div className="settings-hint">Your Telegram user or chat ID</div>
              </div>
              <input
                className="settings-input"
                value={config.chatId}
                onChange={(e) => update('chatId', e.target.value)}
                placeholder="-100123456789"
              />
            </div>
          </>
        )}
      </div>

      <div className="save-row">
        <button className="btn-save" onClick={save}>
          {saved ? <><IconCheck size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />Saved</> : 'Save changes'}
        </button>
        {saved && <span className="save-ok">Settings applied</span>}
      </div>

      <div className="settings-group" style={{ marginTop: 20 }}>
        <div className="settings-group-title">About</div>
        <div className="settings-row">
          <div className="settings-label">Repository</div>
          <button
            className="btn-ghost"
            onClick={() => window.api.openExternal('https://github.com/M3th4d0n/YtMusic-RPC')}
          >
            GitHub <IconExternalLink size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
          </button>
        </div>
        <div className="settings-row">
          <div className="settings-label">Authors</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={() => window.api.openExternal('https://github.com/M3th4d0n')}>
              m3th4d0n
            </button>
            <button className="btn-ghost" onClick={() => window.api.openExternal('https://github.com/Anfi1')}>
              Anfi1
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
