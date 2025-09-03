import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artist = searchParams.get("artist");
  const title = searchParams.get("title");

  if (!artist || !title) {
    return NextResponse.json({ error: "Missing artist or title" }, { status: 400 });
  }

  const token = process.env.GENIUS_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Genius Access Token not set" }, { status: 500 });
  }

  try {
    // Search for the song on Genius
    const res = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(artist)}+${encodeURIComponent(title)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    if (!data.response.hits.length) {
      return NextResponse.json({ error: "Lyrics not found" }, { status: 404 });
    }

    const songUrl = data.response.hits[0].result.url;

    // ✅ Just return the Genius URL instead of scraping lyrics
    return NextResponse.json({ url: songUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lyrics API error" }, { status: 500 });
  }
}
