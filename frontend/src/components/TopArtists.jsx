function TopArtists({ artists }) {
  if (!artists || artists.length === 0) {
    return (
      <div className="card">
        <div className="card-label">Your Top Artists</div>
        <p style={{ color: "var(--text-secondary)" }}>No top artists found</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-label">Your Top Artists</div>
      <div className="artists-list">
        {artists.map((artist, index) => (
          <div
            className="artist-row"
            key={index}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="track-rank">{index + 1}</span>
            {artist.image ? (
              <img src={artist.image} alt={artist.name} className="artist-img" />
            ) : (
              <div className="artist-img-placeholder">♪</div>
            )}
            <div className="artist-info">
              <p className="artist-name-main">{artist.name}</p>
              {artist.genres.length > 0 && (
                <div className="genre-tags">
                  {artist.genres.map((genre, i) => (
                    <span className="genre-tag" key={i}>{genre}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopArtists