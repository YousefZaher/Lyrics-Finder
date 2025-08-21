import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artist = searchParams.get("artist");
  const title = searchParams.get("title");

  if (!artist || !title) {
    return NextResponse.json({ error: "Missing artist or title" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: "Lyrics not found" }, { status: 404 });
    }

    return NextResponse.json({ lyrics: data.lyrics });
  } catch {
    return NextResponse.json({ error: "Lyrics API error" }, { status: 500 });
  }
}
