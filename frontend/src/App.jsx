import { useState, useEffect, useRef } from "react"
import NowPlaying from "./components/NowPlaying"
import TopTracks from "./components/TopTracks"
import TopArtists from "./components/TopArtists"

const TIME_RANGES = [
  { label: "1 Month", value: "short_term" },
  { label: "6 Months", value: "medium_term" },
  { label: "1 Year", value: "long_term" },
]

const NAV_ITEMS = [
  { label: "Now Playing", href: "#now-playing" },
  { label: "Top Tracks", href: "#top-tracks" },
  { label: "Top Artists", href: "#top-artists" },
]

function SkeletonLoader() {
  return (
    <>
      <div className="skeleton-card">
        <div className="skeleton-row">
          <div className="skeleton-art" />
          <div className="skeleton-lines">
            <div className="skeleton-line" style={{ width: "60%" }} />
            <div className="skeleton-line" style={{ width: "40%" }} />
            <div className="skeleton-line" style={{ width: "30%" }} />
            <div className="skeleton-line" style={{ width: "100%", marginTop: "12px" }} />
          </div>
        </div>
      </div>
      <div className="skeleton-card">
        {[...Array(5)].map((_, i) => (
          <div className="skeleton-track-row" key={i}>
            <div className="skeleton-track-art" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="skeleton-track-line" style={{ width: "50%" }} />
              <div className="skeleton-track-line" style={{ width: "30%" }} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function Navbar({ active }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.href
          return (
            <a key={item.href} href={item.href} className={isActive ? "nav-link nav-link-active" : "nav-link"}>
              {item.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function App() {
  const [nowPlaying, setNowPlaying] = useState(null)
  const [topTracks, setTopTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [timeRange, setTimeRange] = useState("short_term")
  const [loading, setLoading] = useState(true)
  const [rangeLoading, setRangeLoading] = useState(false)
  const [activeSection, setActiveSection] = useState("#now-playing")

  const fetchNowPlaying = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/now-playing")
      const data = await res.json()
      setNowPlaying(data)
    } catch (err) {
      console.error("Error fetching now playing:", err)
    }
  }

  const fetchTopTracks = async (range) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/top-tracks?time_range=${range}`)
      const data = await res.json()
      setTopTracks(data.tracks)
    } catch (err) {
      console.error("Error fetching top tracks:", err)
    }
  }

  const fetchTopArtists = async (range) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/top-artists?time_range=${range}`)
      const data = await res.json()
      setTopArtists(data.artists)
    } catch (err) {
      console.error("Error fetching top artists:", err)
    }
  }

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchNowPlaying(),
        fetchTopTracks("short_term"),
        fetchTopArtists("short_term"),
      ])
      setLoading(false)
    }
    init()
    const interval = setInterval(fetchNowPlaying, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const sections = [
      { id: "now-playing", href: "#now-playing" },
      { id: "top-tracks", href: "#top-tracks" },
      { id: "top-artists", href: "#top-artists" },
    ]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`)
          }
        })
      },
      { rootMargin: "-10% 0px -85% 0px" }
    )

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [loading])

  const handleRangeChange = async (range) => {
    if (range === timeRange) return
    setTimeRange(range)
    setRangeLoading(true)
    await Promise.all([fetchTopTracks(range), fetchTopArtists(range)])
    setRangeLoading(false)
  }

  return (
    <>
      <Navbar active={activeSection} />
      <div className="app">
        <header className="app-header">
          <h1>Your <span>Spotify</span></h1>
          <p>What you're playing and what you love most</p>
        </header>

        {loading ? <SkeletonLoader /> : (
          <>
            <section id="now-playing">
              <NowPlaying data={nowPlaying} />
            </section>

            <div className="toggle-wrap">
              <span className="toggle-label">Time range</span>
              <div className="toggle-group">
                {TIME_RANGES.map((r) => (
                  <button
                    key={r.value}
                    className={`toggle-btn ${timeRange === r.value ? "active" : ""}`}
                    onClick={() => handleRangeChange(r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`range-sections ${rangeLoading ? "range-loading" : ""}`}>
              <section id="top-tracks">
                <TopTracks tracks={topTracks} />
              </section>
              <section id="top-artists">
                <TopArtists artists={topArtists} />
              </section>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default App