import { NextRequest, NextResponse } from "next/server";
import findLyrics from "lyrics-finder";

interface TimedLyric {
  time: number;
  line: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const artist = searchParams.get("artist");
    const title = searchParams.get("title");

    if (!artist || !title) {
      return NextResponse.json({ error: "Missing artist or title" }, { status: 400 });
    }

    // Try to find timed lyrics first
    const syncedLyrics = await findLyrics(artist, title, true);

    if (syncedLyrics) {
      // Parse the LRC string into an array of TimedLyric objects
      const parsedLyrics: TimedLyric[] = syncedLyrics
        .split("\n")
        .map((line: string) => {
          const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
          if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseFloat(match[2]);
            return { time: minutes * 60 + seconds, line: match[3].trim() };
          }
          return null;
        })
        .filter((item): item is TimedLyric => item !== null);

      if (parsedLyrics.length > 0) {
        return NextResponse.json({ lyrics: parsedLyrics });
      }
    }

    // If no synced lyrics are found, fall back to standard lyrics
    const standardLyrics = await findLyrics(artist, title, false);

    if (!standardLyrics) {
      return NextResponse.json({ error: "No lyrics available" }, { status: 404 });
    }

    const formattedStandardLyrics: TimedLyric[] = standardLyrics
      .split('\n')
      .map((line: string) => ({ time: 0, line }));

    return NextResponse.json({ lyrics: formattedStandardLyrics });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch lyrics" }, { status: 500 });
  }
}