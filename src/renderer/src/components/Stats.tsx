import { useEffect, useState } from 'react'
import { type HistoryStats } from '../types'
import { IconMusic } from './Icons'

export function Stats() {
  const [stats, setStats] = useState<HistoryStats | null>(null)

  useEffect(() => {
    window.api.getStats().then(setStats)
  }, [])

  useEffect(() => {
    return window.api.onTrackUpdate(() => {
      window.api.getStats().then(setStats)
    })
  }, [])

  if (!stats) return null

  const maxArtist = stats.topArtists[0]?.count ?? 1
  const maxTrack  = stats.topTracks[0]?.count ?? 1

  return (
    <div className="stats-page">
      <div className="page-title">Statistics</div>

      {/* Counters */}
      <div className="stats-counters">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total tracks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.today}</div>
          <div className="stat-label">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.thisWeek}</div>
          <div className="stat-label">This week</div>
        </div>
      </div>

      <div className="stats-cols">
        {/* Top Artists */}
        <div className="stats-section">
          <div className="stats-section-title">Top Artists</div>
          {stats.topArtists.length === 0
            ? <p className="stats-empty">No data yet</p>
            : stats.topArtists.map((a, i) => (
              <div key={a.name} className="stats-row">
                <span className="stats-rank">{i + 1}</span>
                <div className="stats-bar-wrap">
                  <div className="stats-name">{a.name}</div>
                  <div className="stats-bar-track">
                    <div
                      className="stats-bar-fill"
                      style={{ width: `${(a.count / maxArtist) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="stats-count">{a.count}</span>
              </div>
            ))
          }
        </div>

        {/* Top Tracks */}
        <div className="stats-section">
          <div className="stats-section-title">Top Tracks</div>
          {stats.topTracks.length === 0
            ? <p className="stats-empty">No data yet</p>
            : stats.topTracks.map((t, i) => (
              <div key={t.name + i} className="stats-row">
                <span className="stats-rank">{i + 1}</span>
                <div className="stats-thumb-small">
                  {t.cover
                    ? <img src={t.cover} alt="" />
                    : <IconMusic size={12} style={{ opacity: 0.3 }} />
                  }
                </div>
                <div className="stats-bar-wrap">
                  <div className="stats-name">{t.name}</div>
                  <div className="stats-artist-name">{t.artist}</div>
                  <div className="stats-bar-track">
                    <div
                      className="stats-bar-fill"
                      style={{ width: `${(t.count / maxTrack) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="stats-count">{t.count}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
