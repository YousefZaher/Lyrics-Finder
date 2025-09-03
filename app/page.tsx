"use client";

import styles from './page.module.css';
import { useState, useEffect, useRef } from "react";
import SearchBar from "./components/SearchBar/SearchBar";
import SongCard from "./components/SongCard/SongCard";
import PlaceholderCard from "./components/PlaceholderCard/PlaceholderCard";

interface Song {
  id: string;
  title: string;
  artist: string;
  image?: string;
  previewUrl?: string;
}

export default function Home() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [hasBackground, setHasBackground] = useState(false);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Fetch popular songs on mount
  useEffect(() => {
    const fetchPopularSongs = async () => {
      try {
        const res = await fetch("/api/popular-songs");
        const data = await res.json();
        if (data.tracks && Array.isArray(data.tracks)) {
          // Shuffle the array randomly
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
  // If a song is selected with an image, stop rotation and set its image
  if (selectedSong?.image) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setBackgroundImage(selectedSong.image);
    setHasBackground(true);
    return;
  }

  // If there are popular songs, rotate their images
  if (popularSongs.length > 0) {
    // Immediately set the first image
    setBackgroundImage(popularSongs[currentImageIndex]?.image || null);
    setHasBackground(true);

    // Start interval to rotate images
    intervalRef.current = window.setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % popularSongs.length);
    }, 5000); // every 5 seconds
  }

  // Cleanup interval on unmount or when dependencies change
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [selectedSong, popularSongs, currentImageIndex]);


  // Smooth background transition
  const backgroundStyle = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
    transition: "background-image 1s ease-in-out",
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
