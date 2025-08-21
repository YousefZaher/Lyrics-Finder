"use client";

import styles from './page.module.css';
import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar/SearchBar";
import SongCard from "./components/SongCard/SongCard";
import PlaceholderCard from "./components/PlaceholderCard/PlaceholderCard";

interface Song {
  title: string;
  artist: string;
  image: string;
}

export default function Home() {
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [hasBackground, setHasBackground] = useState(false);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
    const fetchPopularSongs = async () => {
      try {
        const res = await fetch("/api/popular-songs");
        const data = await res.json();
        if (data.tracks) {
          setPopularSongs(data.tracks);
        }
      } catch (error) {
        console.error("Failed to fetch popular songs:", error);
      }
    };
    fetchPopularSongs();
  }, []); 
    useEffect(() => {
        if (selectedSong && selectedSong.image) {
      setBackgroundImage(selectedSong.image);
      setHasBackground(true);
      return;
    }

        if (popularSongs.length > 0) {
      setBackgroundImage(popularSongs[currentImageIndex].image);
      setHasBackground(true);

      const intervalId = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % popularSongs.length);
      }, 5000); 
            return () => clearInterval(intervalId);
    }
  }, [selectedSong, popularSongs, currentImageIndex]);

  return (
    <div
      className={`${styles.main} ${hasBackground ? styles['has-bg'] : ''}`}
      style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
    >
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