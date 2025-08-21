"use client";

import { FadeLoader } from "react-spinners";
import { useEffect, useState, useRef } from "react";
import styles from "./SongCard.module.css";

export default function SongCard({ song }: { song: any }) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);   const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!song) return;
    setIsLoading(true); 
    const fetchLyrics = async () => {
      try {
        const res = await fetch(
          `/api/lyrics?artist=${encodeURIComponent(song.artist)}&title=${encodeURIComponent(song.title)}`
        );
        const data = await res.json();
        if (data.lyrics) {
          setLyrics(data.lyrics);
        } else {
          setLyrics("Lyrics not found.");
        }
      } catch (error) {
        console.error("Failed to fetch lyrics:", error);
        setLyrics("Failed to load lyrics.");
      } finally {
        setIsLoading(false);       }
    };

    fetchLyrics();
  }, [song]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [song]);

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
      {isLoading ? (
        <div className={styles.loaderWrapper}>
          <FadeLoader
            color="#000000ff"
            height={5}              width={2}               radius={0.5}
            margin={1}
          />
        </div>
      ) : (
        <pre className={styles.lyrics}>{lyrics}</pre>
      )}
    </div>
  );
}