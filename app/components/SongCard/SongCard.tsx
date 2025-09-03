"use client";

import { FadeLoader } from "react-spinners";
import { useEffect, useState, useRef } from "react";
import styles from "./SongCard.module.css";

interface TimedLyric {
  time: number;
  line: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  image?: string;
  previewUrl?: string;
  geniusUrl?: string;
}


export default function SongCard({ song }: { song: Song }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [timedLyrics, setTimedLyrics] = useState<TimedLyric[] | null>(null);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset audio & lyrics when song changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTimedLyrics(null);
    setCurrentLine(0);
  }, [song]);

  // Update current highlighted line
  useEffect(() => {
    if (!audioRef.current || !timedLyrics) return;
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      const currentTime = audio.currentTime;
      for (let i = timedLyrics.length - 1; i >= 0; i--) {
        if (currentTime >= timedLyrics[i].time) {
          setCurrentLine(i);
          break;
        }
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [timedLyrics]);

  const handleCopy = async () => {
    if (!song) return;
    const lyricsUrl = `/api/synced-lyrics?artist=${encodeURIComponent(song.artist)}&title=${encodeURIComponent(song.title)}`;
    await navigator.clipboard.writeText(lyricsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSync = async () => {
    if (!song) return;

    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/synced-lyrics?artist=${encodeURIComponent(song.artist)}&title=${encodeURIComponent(song.title)}`
      );
      const data = await res.json();

      if (data.lyrics) {
        // Parse LRC into [{ time, line }]
        const parsedLyrics = data.lyrics
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
          .filter(Boolean) as TimedLyric[];

        setTimedLyrics(parsedLyrics);
        audioRef.current?.play();
      } else {
        alert("No synced lyrics available for this song.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch synced lyrics.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!song) return null;

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{song.title}</h2>
      <p className={styles.artist}>{song.artist}</p>

      {song.image && (
        <div className={styles.mediaRow}>
          <img src={song.image} alt={song.title} className={styles.image} />
          <audio key={song.id} ref={audioRef} controls className={styles.audio}>
            {song.previewUrl ? (
              <source src={song.previewUrl} type="audio/mpeg" />
            ) : (
              <p>Audio preview not available</p>
            )}
          </audio>
        </div>
      )}

      <h3 className={styles.lyricsTitle}>Lyrics</h3>

            {timedLyrics ? (
        <div className={styles.lyricsContainer}>
          {timedLyrics.map((line, index) => (
            <p key={index} className={index === currentLine ? styles.currentLine : ""}>
              {line.line}
            </p>
          ))}
        </div>
      ) : isLoading ? (
        <div className={styles.loaderWrapper}>
          <FadeLoader color="#000000ff" height={5} width={2} radius={0.5} margin={1} />
        </div>
      ) : (
        <div className={styles.buttonsRow}>
          {song.geniusUrl && (
            <a
              href={song.geniusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.lyricsLink}
            >
              View on Genius
            </a>
          )}
          <button onClick={handleCopy} className={styles.copyBtn}>
            {copied ? "Copied ✅" : "Copy Lyrics URL"}
          </button>
          <button onClick={handleSync} className={styles.syncBtn}>
            🔄 Sync Lyrics
          </button>
        </div>
      )}
    </div>
  );
}
