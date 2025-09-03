import { NextResponse } from "next/server";
import  SpotifyApi  from "spotify-types"

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";
const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";

async function getAccessToken() {
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  try {
    const token = await getAccessToken();
    const res = await fetch(
      `${SPOTIFY_SEARCH_URL}?q=${encodeURIComponent(q)}&type=track&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    const results = await Promise.all(
      data.tracks.items.map(async (track: SpotifyApi.Track) => {
        let previewUrl = track.preview_url;
        let image = track.album.images[0]?.url;

        if (!previewUrl || !image) {
          try {
            const itunes = await fetch(
              `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(track.name + " " + track.artists[0].name)}&entity=song&limit=1`
            );
            const itunesData = await itunes.json();

            if (itunesData.results?.[0]) {
              previewUrl = previewUrl || itunesData.results[0].previewUrl;
              image = image || itunesData.results[0].artworkUrl100;
            }
          } catch (err) {
            console.error("iTunes fetch error", err);
          }
        }

        return {
          id: track.id,
          title: track.name,
          artist: track.artists.map((a: SpotifyApi.SimplifiedArtist) => a.name).join(", "),
          album: track.album.name,
          previewUrl,
          image,
        };
      })
    );

    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: "Spotify error" }, { status: 500 });
  }
}
