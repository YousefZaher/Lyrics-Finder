"use client";

import styles from './page.module.css';
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import SearchBar from "./components/SearchBar/SearchBar";
import SongCard from "./components/SongCard/SongCard";
import PlaceholderCard from "./components/PlaceholderCard/PlaceholderCard";

// Define the Song interface to match the data structure
interface Song {
  id: string;
  title: string;
  artist: string;
  image?: string;
  previewUrl?: string;
}

export default function Home() {
  // Correct the type of selectedSong to be either Song or null
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null | undefined>(null);
  const [hasBackground, setHasBackground] = useState(false);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPopularSongs = async () => {
      try {
        const res = await fetch("/api/popular-songs");
        const data = await res.json();
        // Check if data is an array of songs before setting the state
        if (Array.isArray(data)) {
          setPopularSongs(data);
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
      const imageUrl = popularSongs[currentImageIndex].image;
      setBackgroundImage(imageUrl || null);
      setHasBackground(true);
      
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