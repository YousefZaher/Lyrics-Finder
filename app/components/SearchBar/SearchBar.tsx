"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./SearchBar.module.css";

interface Song {
  id: string;
  title: string;
  artist: string;
  image?: string;
  previewUrl?: string;
  geniusUrl?: string; // ✅ Added to support Genius links
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
      try { // ✅ Added a try-catch block for better error handling
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        // Check if data is an array before setting suggestions
        if (Array.isArray(data)) {
          setSuggestions(data);
        } else {
          setSuggestions([]);
          console.error("Received non-array data from search API:", data);
        }
      } catch (err) {
        console.error("Failed to fetch search results:", err);
        setSuggestions([]);
      }
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
              <img src={s.image} alt={s.title} className={styles.songImage} />
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