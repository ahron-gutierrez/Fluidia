// Plays /public/sfx/<name>.mp3. Silently does nothing if the file is missing.
export function playSfx(name, volume = 0.6) {
  try {
    const audio = new Audio(`/sfx/${name}.mp3`);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {
    /* ignore */
  }
}
