import { NextResponse } from "next/server";
import  SpotifyApi  from "spotify-types";

export async function GET() {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Missing Spotify API keys" },
      { status: 500 }
    );
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
            "base64"
          ),
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch popular songs from the "browse/featured-playlists" endpoint, as it often has better images and a more diverse selection for a background
    const popularResponse = await fetch(
      "https://api.spotify.com/v1/browse/featured-playlists?country=US&limit=20",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const popularData = await popularResponse.json();
    const tracks = popularData.playlists.items.map((playlist: SpotifyApi.SimplifiedPlaylist) => ({
      id: playlist.id,
      title: playlist.name,
      artist: "Various Artists", // Playlists have multiple artists, so this is a reasonable placeholder
      image: playlist.images[0].url,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json({ error: "Failed to fetch popular songs" }, { status: 500 });
  }
}
