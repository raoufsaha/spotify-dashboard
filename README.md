# Spotify Dashboard

A personal Spotify dashboard that displays your currently playing track and your top tracks and artists. Built with FastAPI and React.

## Live Demo

[View Live](https://raouf-spotify.vercel.app/)

## Features

- **Now Playing** — displays the current track with album art, artist, and a real-time progress bar
- **Top Tracks** — your most listened to tracks over the last month, 6 months, or year
- **Top Artists** — your most listened to artists with genre tags
- **Time Range Toggle** — switch between 1 month, 6 months, and 1 year for both tracks and artists
- **Open Spotify** — button to launch the Spotify app or web player when nothing is playing
- **Persistent Auth** — OAuth tokens are saved to disk so the app stays authenticated through server restarts

## Tech Stack

**Backend**
- Python / FastAPI
- httpx for async HTTP requests
- Spotify Web API with OAuth 2.0
- Deployed on Railway

**Frontend**
- React + Vite
- CSS with custom dark theme
- Deployed on Vercel

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Spotify Developer account

### Spotify Setup
1. Go to [developer.spotify.com](https://developer.spotify.com)
2. Create a new app
3. Add `http://127.0.0.1:8000/callback` as a redirect URI

### Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate  # Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/callback

Start the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser. Go to `http://127.0.0.1:8000/login` first to authenticate with Spotify.

## Deployment

- Backend hosted on [Railway](https://railway.app)
- Frontend hosted on [Vercel](https://vercel.com)
- Environment variables configured on each platform