"use client";

import styles from './page.module.css';
import { useState, useEffect, useRef } from "react";
import SearchBar from "./components/SearchBar/SearchBar";
import SongCard from "./components/SongCard/SongCard";
import PlaceholderCard from "./components/PlaceholderCard/PlaceholderCard";

// في ملف app/page.tsx
export interface Song {
  id: string;
  title: string;
  artist: string;
  image?: string;
  previewUrl?: string;
  geniusUrl?: string; // Add this line
}

export default function Home() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [hasBackground, setHasBackground] = useState(false);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const intervalRef = useRef<number | null>(null);
  const currentImageIndexRef = useRef<number>(0);

  // Fetch popular songs on mount
  useEffect(() => {
    const fetchPopularSongs = async () => {
      try {
        const res = await fetch("/api/popular-songs");
        const data = await res.json();
        if (data.tracks && Array.isArray(data.tracks)) {
          const shuffled = data.tracks.sort(() => Math.random() - 0.5);
          setPopularSongs(shuffled);
        }
      } catch (error) {
        console.error("Failed to fetch popular songs:", error);
      }
    };
    fetchPopularSongs();
  }, []);

  // Handle background image rotation
  useEffect(() => {
    if (selectedSong?.image) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setBackgroundImage(selectedSong.image);
      setHasBackground(true);
      return;
    }

    if (popularSongs.length > 0) {
      setBackgroundImage(popularSongs[currentImageIndexRef.current]?.image || null);
      setHasBackground(true);

      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(() => {
        currentImageIndexRef.current = (currentImageIndexRef.current + 1) % popularSongs.length;
        setBackgroundImage(popularSongs[currentImageIndexRef.current]?.image || null);
      }, 5000) as unknown as number;
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [selectedSong, popularSongs]);

  const backgroundStyle = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
  };

  return (
    <div className={`${styles.main} ${hasBackground ? styles['has-bg'] : ''}`} style={backgroundStyle}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>Lyrics Finder 🎵</h1>
        <SearchBar onSelect={setSelectedSong} />
        {selectedSong ? (
          <SongCard song={selectedSong} />
        ) : (
          <PlaceholderCard />
        )}
      </div>
    </div>
  );
}