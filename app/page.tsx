"use client";

import styles from './page.module.css';
import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar/SearchBar";
import SongCard from "./components/SongCard/SongCard";
import PlaceholderCard from "./components/PlaceholderCard/PlaceholderCard";
import Image from 'next/image';

interface Song {
  title: string;
  artist: string;
  image: string;
}

export default function Home() {
<<<<<<< Updated upstream
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [hasBackground, setHasBackground] = useState(false);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
=======
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch popular songs on initial load
  useEffect(() => {
>>>>>>> Stashed changes
    const fetchPopularSongs = async () => {
      try {
        const res = await fetch("/api/popular-songs");
        const data = await res.json();
<<<<<<< Updated upstream
        if (data.tracks) {
=======
        // Assuming the new route returns an array of songs
        if (Array.isArray(data.tracks)) {
>>>>>>> Stashed changes
          setPopularSongs(data.tracks);
        }
      } catch (error) {
        console.error("Failed to fetch popular songs:", error);
      }
    };
    fetchPopularSongs();
<<<<<<< Updated upstream
  }, []); 
    useEffect(() => {
        if (selectedSong && selectedSong.image) {
      setBackgroundImage(selectedSong.image);
      setHasBackground(true);
=======
  }, []);

  // Handle the background image loop
  useEffect(() => {
    // Stop the loop if a song is selected or if there are no popular songs
    if (selectedSong || popularSongs.length === 0) {
>>>>>>> Stashed changes
      return;
    }
    
    // Set an interval to change the background image index every 5 seconds
    const intervalId = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % popularSongs.length);
    }, 5000); // 5 seconds

<<<<<<< Updated upstream
        if (popularSongs.length > 0) {
      setBackgroundImage(popularSongs[currentImageIndex].image);
      setHasBackground(true);

      const intervalId = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % popularSongs.length);
      }, 5000); 
            return () => clearInterval(intervalId);
    }
  }, [selectedSong, popularSongs, currentImageIndex]);
=======
    return () => clearInterval(intervalId);
  }, [selectedSong, popularSongs]);

  // Determine the two background images to display for the crossfade
  const primaryImage = selectedSong?.image || popularSongs[currentImageIndex]?.image;
  const secondaryImage = popularSongs[(currentImageIndex + 1) % popularSongs.length]?.image;
  const hasBackground = !!selectedSong || popularSongs.length > 0;
>>>>>>> Stashed changes

  return (
    <div className={`${styles.main} ${hasBackground ? styles['has-bg'] : ''}`}>
      {/* Background container for crossfading images */}
      <div className={styles['background-container']}>
        {primaryImage && (
          <Image
            src={primaryImage}
            alt="Background"
            layout="fill"
            objectFit="cover"
            priority
            quality={100}
            className={`${styles['background-image']} ${styles.visible}`}
          />
        )}
        {/* Render a second image for the crossfade effect */}
        {secondaryImage && !selectedSong && (
          <Image
            src={secondaryImage}
            alt="Background"
            layout="fill"
            objectFit="cover"
            priority
            quality={100}
            className={`${styles['background-image']} ${styles.hidden}`}
          />
        )}
      </div>

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