import { NextResponse } from "next/server";

export async function GET() {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET as string;

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


    const popularResponse = await fetch(
      "https://api.spotify.com/v1/browse/new-releases?country=US&limit=20",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const popularData = await popularResponse.json();
    const tracks = popularData.albums.items.map((album: any) => ({
      title: album.name,
      artist: album.artists[0].name,
      image: album.images[0].url,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json({ error: "Failed to fetch popular songs" }, { status: 500 });
  }
}