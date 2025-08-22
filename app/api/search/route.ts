import { NextResponse, type NextRequest } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";
const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";

async function getAccessToken(): Promise<string> {
  // Ensure environment variables are defined.
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Missing Spotify client credentials.");
  }

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data: { access_token: string } = await res.json();
  return data.access_token;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const token = await getAccessToken();
    const res = await fetch(
      `${SPOTIFY_SEARCH_URL}?q=${encodeURIComponent(q)}&type=track&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data: {
      tracks: { items: {
        id: string;
        name: string;
        preview_url: string | null;
        album: { name: string; images: { url: string; }[] };
        artists: { name: string }[];
      }[] };
    } = await res.json();

    const results = await Promise.all(
      data.tracks.items.map(async (track) => {
        let previewUrl: string | null = track.preview_url;
        let image: string | undefined = track.album.images[0]?.url;

        if (!previewUrl || !image) {
          try {
            const itunes = await fetch(
              `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(track.name + " " + track.artists[0].name)}&entity=song&limit=1`
            );
            const itunesData: { results?: { previewUrl?: string; artworkUrl100?: string; }[] } = await itunes.json();

            if (itunesData.results?.[0]) {
              previewUrl = previewUrl || itunesData.results[0].previewUrl || null;
              image = image || itunesData.results[0].artworkUrl100;
            }
          } catch (err: unknown) {
            console.error("iTunes fetch error", err);
          }
        }

        return {
          id: track.id,
          title: track.name,
          artist: track.artists.map((a: { name: string }) => a.name).join(", "),
          album: track.album.name,
          previewUrl,
          image,
        };
      })
    );

    return NextResponse.json(results);
    } catch (err: unknown) {
        console.error("iTunes fetch error", err);
    }
}