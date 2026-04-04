import { useState, useEffect, useRef } from "react"

function NowPlaying({ data }) {
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)
  const startRef = useRef(null)
  const startProgressRef = useRef(null)

  useEffect(() => {
    if (!data || !data.playing) return
    setProgress(data.progress_ms)
    startRef.current = Date.now()
    startProgressRef.current = data.progress_ms

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const current = startProgressRef.current + elapsed
      if (current >= data.duration_ms) {
        setProgress(data.duration_ms)
        clearInterval(intervalRef.current)
      } else {
        setProgress(current)
      }
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [data])

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    return `${m}:${(s % 60).toString().padStart(2, "0")}`
  }

  if (!data || !data.playing) {
    return (
      <div className="card">
        <div className="card-label">Now Playing</div>
        <div className="not-playing-state">
          <div className="not-playing-icon">♫</div>
          <div>
            <p>Nothing playing right now</p>
            <small>Open Spotify and start listening</small>
          </div>
            <a
            className="open-spotify-btn"
            href="https://open.spotify.com"
            onClick={(e) => {
                e.preventDefault()
                window.location.href = "spotify:"
                setTimeout(() => {
                window.open("https://open.spotify.com", "_blank")
                }, 1000)
            }}
            >
            Open Spotify
          </a>
        </div>
      </div>
    )
  }

  const pct = (progress / data.duration_ms) * 100

  return (
    <div className="card">
      <div className="card-label">Now Playing</div>
      <div className="now-playing-inner">
        <div className="album-art-wrap">
          <div
            className="album-glow"
            style={{ backgroundImage: `url(${data.album_art})` }}
          />
          <img src={data.album_art} alt={data.album} className="album-art" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="playing-badge">
            <div className="eq-bars">
              <span /><span /><span /><span />
            </div>
            <span className="playing-badge-text">Live</span>
          </div>
          <p className="track-name">{data.track}</p>
          <p className="artist-name">{data.artist}</p>
          <p className="album-name">{data.album}</p>
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="progress-times">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(data.duration_ms)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NowPlaying