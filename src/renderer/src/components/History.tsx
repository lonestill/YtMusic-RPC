import { useEffect, useState } from 'react'
import { type HistoryEntry } from '../types'
import { IconMusic, IconExternalLink, IconMusicPlaceholder } from './Icons'

export function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.getHistory().then((data) => {
      setEntries(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    return window.api.onTrackUpdate(() => {
      window.api.getHistory().then(setEntries)
    })
  }, [])

  return (
    <div className="history-page">
      <div className="page-title">History</div>

      {loading ? (
        <div className="empty-state">
          <IconMusicPlaceholder size={40} />
          <p>Loading…</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <IconMusicPlaceholder size={40} />
          <p>No tracks played yet</p>
        </div>
      ) : (
        <div className="history-list">
          {entries.map((entry, i) => (
            <div key={i} className="history-row">
              <span className="history-num">{i + 1}</span>

              <div className="history-thumb">
                {entry.cover
                  ? <img src={entry.cover} alt="" />
                  : <IconMusic size={16} style={{ opacity: 0.3 }} />
                }
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
