import { useEffect, useMemo, useState } from 'react'
import { type HistoryEntry } from '../types'
import { IconMusic, IconExternalLink, IconMusicPlaceholder } from './Icons'

export function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]     = useState('')
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    window.api.getHistory().then((data) => { setEntries(data); setLoading(false) })
  }, [])

  useEffect(() => {
    return window.api.onTrackUpdate(() => {
      window.api.getHistory().then(setEntries)
    })
  }, [])

  async function handleClear() {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return }
    await window.api.clearHistory()
    setEntries([])
    setConfirm(false)
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const q = query.toLowerCase()
    return entries.filter(e =>
      e.track.toLowerCase().includes(q) || e.artist.toLowerCase().includes(q)
    )
  }, [entries, query])

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="page-title">History</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="search-input"
            placeholder="Search…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {entries.length > 0 && (
            <button className={`btn-ghost btn-danger ${confirm ? 'active' : ''}`} onClick={handleClear}>
              {confirm ? 'Sure?' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><IconMusicPlaceholder size={40} /><p>Loading…</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <IconMusicPlaceholder size={40} />
          <p>{query ? 'Nothing found' : 'No tracks played yet'}</p>
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((entry, i) => (
            <div key={i} className="history-row">
              <span className="history-num">{i + 1}</span>
              <div className="history-thumb">
                {entry.cover ? <img src={entry.cover} alt="" /> : <IconMusic size={16} style={{ opacity: 0.3 }} />}
              </div>
              <div className="history-text">
                <div className="history-name">{entry.track}</div>
                <div className="history-artist">{entry.artist}</div>
              </div>
              <div className="history-time">{entry.time}</div>
              <button
                className="history-open"
                title="Open in YouTube Music"
                onClick={() => window.api.openExternal(entry.url)}
              >
                <IconExternalLink size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
