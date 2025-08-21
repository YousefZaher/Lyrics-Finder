"use client";
import React, { useEffect } from "react";
import styles from './PlaceholderCard.module.css';

const PlaceholderCard = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_AD_CLIENT_ID";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, []);

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>Search for a song...</h2>
      <p className={styles.subtext}>
        Enter a song title or artist to get started and find the lyrics.
      </p>
      
      
      <div className={styles.adContainer}>
        
        <ins className="adsbygoogle"
             style={{ display: "block", textAlign: "center" }}
             data-ad-layout="in-article"
             data-ad-format="fluid"
             data-ad-client="YOUR_AD_CLIENT_ID"
             data-ad-slot="YOUR_AD_SLOT_ID">
        </ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

    </div>
  );
};

export default PlaceholderCard;