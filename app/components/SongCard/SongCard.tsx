"use client";

import { FadeLoader } from "react-spinners";
import { useEffect, useState, useRef } from "react";
import styles from "./SongCard.module.css";
import { Song } from "../../page";

interface TimedLyric {
  time: number;
  line: string;
}

export default function SongCard({ song }: { song: Song }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [timedLyrics, setTimedLyrics] = useState<TimedLyric[] | null>(null);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset audio & lyrics when song changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTimedLyrics(null);
    setCurrentLine(0);
    setError(null);
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
    if (!song?.geniusUrl) return;
    try {
      await navigator.clipboard.writeText(song.geniusUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSync = async () => {
    if (!song) return;

    setIsLoading(true);
    setError(null);
    setTimedLyrics(null);

    try {
      const res = await fetch(
        `/api/synced-lyrics?artist=${encodeURIComponent(song.artist)}&title=${encodeURIComponent(song.title)}`
      );
      const data = await res.json();

      if (data.lyrics && data.lyrics.length > 0) {
        if (Array.isArray(data.lyrics)) {
          setTimedLyrics(data.lyrics as TimedLyric[]);
        } else {
          const parsedLyrics = (data.lyrics as string)
            .split("\n")
            .map((line) => {
              const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
              if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseFloat(match[2]);
                return { time: minutes * 60 + seconds, line: match[3].trim() };
              }
              return null;
            })
            .filter(Boolean);

          setTimedLyrics(parsedLyrics as TimedLyric[]);
        }
        audioRef.current?.play();
      } else {
        setError("No synced lyrics available for this song.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch synced lyrics. Please try again.");
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
          <a
            href={song.geniusUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.geniusBtn}
            onClick={(e) => {
              if (!song.geniusUrl) {
                e.preventDefault();
                alert("Lyrics URL not available.");
              }
            }}
          >
          Genius
          </a>

          <button onClick={handleCopy} className={styles.copyBtn}>
            {copied ? "Copied ✅" : "Copy Lyrics URL"}
          </button>

          <button onClick={handleSync} className={styles.syncBtn}>
             Sync Lyrics
          </button>
        </div>
      )}

      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  );
}
