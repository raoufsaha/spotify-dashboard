from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
import urllib.parse
import secrets

load_dotenv(override=False)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://spotifydashboard-b9ja6l37w-saharaouf16-5810s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

token_store = {"access_token": None, "refresh_token": None}

# Step 1: Send user to Spotify login
@app.get("/login")
def login():
    state = secrets.token_hex(16)
    scope = "user-read-currently-playing user-top-read"
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "scope": scope,
        "redirect_uri": REDIRECT_URI,
        "state": state,
    }
    url = "https://accounts.spotify.com/authorize?" + urllib.parse.urlencode(params)
    return RedirectResponse(url)

# Step 2: Spotify sends user back here with a code
@app.get("/callback")
async def callback(code: str, state: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://accounts.spotify.com/api/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            auth=(CLIENT_ID, CLIENT_SECRET),
        )
    tokens = response.json()
    token_store["access_token"] = tokens["access_token"]
    token_store["refresh_token"] = tokens["refresh_token"]
    return {"message": "Login successful", "tokens": token_store}

# Step 3: Refresh the access token when it expires
async def refresh_access_token():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://accounts.spotify.com/api/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": token_store["refresh_token"],
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            auth=(CLIENT_ID, CLIENT_SECRET),
        )
    token_store["access_token"] = response.json()["access_token"]

# Step 4: Now playing endpoint
@app.get("/now-playing")
async def now_playing():
    if not token_store["access_token"]:
        raise HTTPException(status_code=401, detail="Not logged in")
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.spotify.com/v1/me/player/currently-playing",
            headers={"Authorization": f"Bearer {token_store['access_token']}"},
        )
    if response.status_code == 401:
        await refresh_access_token()
        return await now_playing()
    if response.status_code == 204:
        return {"playing": False}
    data = response.json()
    return {
        "playing": True,
        "track": data["item"]["name"],
        "artist": ", ".join([a["name"] for a in data["item"]["artists"]]),
        "album": data["item"]["album"]["name"],
        "album_art": data["item"]["album"]["images"][0]["url"],
        "duration_ms": data["item"]["duration_ms"],
        "progress_ms": data["progress_ms"],
    }

# Step 5: Top tracks endpoint
@app.get("/top-tracks")
async def top_tracks(time_range: str = "short_term"):
    if not token_store["access_token"]:
        raise HTTPException(status_code=401, detail="Not logged in")
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.spotify.com/v1/me/top/tracks?time_range={time_range}&limit=10",
            headers={"Authorization": f"Bearer {token_store['access_token']}"},
        )
    if response.status_code == 401:
        await refresh_access_token()
        return await top_tracks(time_range)
    data = response.json()
    return {
        "tracks": [
            {
                "name": t["name"],
                "artist": ", ".join([a["name"] for a in t["artists"]]),
                "album": t["album"]["name"],
                "album_art": t["album"]["images"][0]["url"],
            }
            for t in data["items"]
        ]
    }

@app.get("/top-artists")
async def top_artists(time_range: str = "short_term"):
    if not token_store["access_token"]:
        raise HTTPException(status_code=401, detail="Not logged in")
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.spotify.com/v1/me/top/artists?time_range={time_range}&limit=5",
            headers={"Authorization": f"Bearer {token_store['access_token']}"},
        )
    if response.status_code == 401:
        await refresh_access_token()
        return await top_artists(time_range)
    data = response.json()
    return {
        "artists": [
            {
                "name": a["name"],
                "image": a["images"][0]["url"] if a["images"] else None,
                "genres": a.get("genres", [])[:3],
            }
            for a in data["items"]
        ]
    }

@app.get("/debug")
def debug():
    return {
        "client_id": os.getenv("SPOTIFY_CLIENT_ID"),
        "redirect_uri": os.getenv("SPOTIFY_REDIRECT_URI"),
    }