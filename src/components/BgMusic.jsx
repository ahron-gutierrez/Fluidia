import { useEffect, useRef } from "react";

const TRACKS = {
  home: "/music/welcome.mp3",
  account: "/music/dresse.mp3",
  lab: "/music/lab.mp3",
  quiz: "/music/quiz.mp3",
  endless: "/music/endless.mp3",
  pipes: "/music/plumber.mp3",
  quest1: "/music/water.mp3",
  leaderboard: "/music/leaderboard.mp3",
  title: "/music/title.mp3",
};

export default function BgMusic({ track, volume = 0.4, loop = true }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const src = TRACKS[track];

    if (!src) {
      console.warn(
        `BgMusic: no track named "${track}". Available: ${Object.keys(TRACKS).join(", ")}`
      );
      return;
    }

    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audioRef.current = audio;

    let cancelled = false;

    // Browsers block autoplay until the user interacts with the page.
    // If that happens, wait for the first click / key / touch, then play.
    const events = ["click", "keydown", "touchstart"];
    const removeListeners = () =>
      events.forEach((e) => window.removeEventListener(e, startOnInteraction));

    function startOnInteraction() {
      if (cancelled) return;
      audio.play().then(removeListeners).catch(() => {});
    }

    audio.play().catch(() => {
      // Autoplay was blocked, so wait for the user to interact
      if (cancelled) return;
      events.forEach((e) => window.addEventListener(e, startOnInteraction));
    });

    // Cleanup: runs when the page unmounts or the track changes
    return () => {
      cancelled = true;
      removeListeners();
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [track, loop]);

  // Update volume live without restarting the song
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return null; // no UI, it only plays sound
}
