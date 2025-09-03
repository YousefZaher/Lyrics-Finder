import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const artist = searchParams.get("artist");
    const title = searchParams.get("title");

    if (!artist || !title) {
      return NextResponse.json({ error: "Missing artist or title" }, { status: 400 });
    }

    // Step 1: Search for the track
    const searchRes = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );
    const searchData = await searchRes.json();

    if (searchData.error) {
      return NextResponse.json({ error: "Track not found" });
    }

    // Step 2: Fetch synced lyrics
    const lyricsRes = await fetch(
      `https://textyl.co/api/lyrics?track=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
    );
    const lyricsData = await lyricsRes.json();

    if (!lyricsData.lyrics) {
      return NextResponse.json({ error: "No synced lyrics available" });
    }

    // Lyrics in synced format
    const syncedLyrics = lyricsData.lyrics;

    return NextResponse.json({ lyrics: syncedLyrics });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch synced lyrics" }, { status: 500 });
  }
}
