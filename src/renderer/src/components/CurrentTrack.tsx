import { type TrackInfo } from '../types'
import { IconMusicPlaceholder, IconExternalLink, IconPlay, IconPause } from './Icons'

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function CurrentTrack({ track }: { track: TrackInfo | null }) {
  if (!track) {
    return (
      <div className="no-track">
        <IconMusicPlaceholder size={56} />
        <h3>Nothing playing</h3>
        <p>Open YouTube Music and start a track</p>
      </div>
    )
  }

  const pct = track.totalDuration > 0
    ? Math.min((track.currentTime / track.totalDuration) * 100, 100)
    : 0

  return (
    <div className="now-playing">
      {track.cover && (
        <div
          className="now-playing-bg"
          style={{ backgroundImage: `url(${track.cover})` }}
        />
      )}
      <div className="now-playing-overlay" />

      <div className="now-playing-inner">
        <div className="art-wrap">
          {track.cover
            ? <img src={track.cover} alt="cover" />
            : <IconMusicPlaceholder size={72} />
          }
        </div>

        <div className="now-meta">
          <div className="now-track" title={track.track}>{track.track}</div>
          <div className="now-artist">{track.artist}</div>
        </div>

        <span className={`now-badge ${track.isPlaying ? 'playing' : 'paused'}`}>
          {track.isPlaying
            ? <><IconPlay size={11} /> Playing</>
            : <><IconPause size={11} /> Paused</>
          }
        </span>

        {track.totalDuration > 0 && (
          <div className="progress-wrap">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="progress-times">
              <span>{fmt(track.currentTime)}</span>
              <span>{fmt(track.totalDuration)}</span>
            </div>
          </div>
        )}

        <button
          className="now-open-btn"
          onClick={() => window.api.openExternal(`https://music.youtube.com/watch?v=${track.videoId}`)}
        >
          Open in YouTube Music
          <IconExternalLink size={13} style={{ marginLeft: 6, verticalAlign: 'middle' }} />
        </button>
      </div>
    </div>
  )
}
