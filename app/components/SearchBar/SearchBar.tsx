"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image"; // Import the Image component
import styles from "./SearchBar.module.css";

interface Song {
  id: string;
  title: string;
  artist: string;
  image?: string; // This can be undefined
  previewUrl?: string;
}

interface SearchBarProps {
  onSelect: (song: Song) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      // Explicitly type the data to resolve the "Unexpected any" error
      const data: Song[] = await res.json();
      setSuggestions(data);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search songs..."
        className={styles.input}
      />

      {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((s) => (
            <li
              key={s.id}
              className={styles.suggestion}
              onClick={() => {
                onSelect(s);
                setQuery("");
                setSuggestions([]);
                inputRef.current?.blur();
              }}
            >
              {/* Use the Next.js Image component instead of <img> */}
              {s.image && (
                <Image 
                  src={s.image} 
                  alt={s.title} 
                  className={styles.songImage} 
                  width={64} // Specify a default width
                  height={64} // Specify a default height
                  priority // Use priority to preload the image
                />
              )}
              <div>
                <span className={styles.songTitle}>{s.title}</span>
                <span className={styles.songArtist}>{s.artist}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}