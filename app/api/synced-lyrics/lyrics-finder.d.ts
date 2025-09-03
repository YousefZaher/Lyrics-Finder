declare module 'lyrics-finder' {
  function findLyrics(artist: string, title: string, timed?: boolean): Promise<string | null>;
  export default findLyrics;
}