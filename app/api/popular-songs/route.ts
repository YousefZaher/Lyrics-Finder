import { NextResponse } from "next/server";
import SpotifyApi from "spotify-types";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";
const GENIUS_API_URL = "https://api.genius.com";

async function getAccessToken() {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error("Missing Spotify API keys");
  }

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error_description || "Failed to get access token");
  }
  return data.access_token;
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const popularResponse = await fetch(
      `${SPOTIFY_SEARCH_URL}?q=top hits&type=track&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const popularData = await popularResponse.json();

    if (popularResponse.status !== 200) {
      throw new Error(popularData.error?.message || "Failed to fetch data from Spotify");
    }

    const tracks = await Promise.all(
      popularData.tracks.items
        .filter((track: SpotifyApi.Track) => track.album?.images?.[0])
        .map(async (track: SpotifyApi.Track) => {
          let geniusUrl = null;

          try {
            const geniusRes = await fetch(
              `${GENIUS_API_URL}/search?q=${encodeURIComponent(track.artists[0].name)}%20${encodeURIComponent(track.name)}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
                }
              }
            );
            const geniusData = await geniusRes.json();
            if (geniusData.response?.hits.length > 0) {
              geniusUrl = geniusData.response.hits[0].result.url;
            }
          } catch (err) {
            console.error("Genius URL fetch error", err);
          }

          return {
            id: track.id,
            title: track.name,
            artist: track.artists.map((a: SpotifyApi.SimplifiedArtist) => a.name).join(", "),
            image: track.album.images[0].url,
            previewUrl: track.preview_url,
            geniusUrl,
          };
        })
    );

    return NextResponse.json({ tracks });

  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular songs" },
      { status: 500 }
    );
  }
}