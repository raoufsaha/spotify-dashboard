function TopTracks({ tracks }) {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="card">
        <div className="card-label">Your Top Tracks</div>
        <p style={{ color: "var(--text-secondary)" }}>No top tracks found</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-label">Your Top Tracks · Last Month</div>
      <div className="tracks-list">
        {tracks.map((track, index) => (
          <div
            className="track-row"
            key={index}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="track-rank">{index + 1}</span>
            <img src={track.album_art} alt={track.album} className="track-art" />
            <div className="track-info">
              <p className="track-name">{track.name}</p>
              <p className="artist-name">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopTracks