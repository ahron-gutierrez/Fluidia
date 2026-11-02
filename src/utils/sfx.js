// Plays /public/sfx/<name>.mp3 if you added that file. If it's missing, a small 8-bit sound is
// generated instead (Web Audio), so the game has sound before you add any audio files.
// Set SYNTH_FALLBACK to false to stay silent when a file is missing.
const SYNTH_FALLBACK = true;

let audioCtx = null;
const getCtx = () => {
  const Ctor = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!Ctor) return null;
  audioCtx ??= new Ctor();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
};

function tone(ac, { freq, to = freq, at = 0, dur = 0.1, type = "square", gain = 0.12 }) {
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + dur);
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(ac, { at = 0, dur = 0.3, from = 2500, to = 300, gain = 0.2 }) {
  const t0 = ac.currentTime + at;
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const amp = ac.createGain();
  src.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start(t0);
}

const arp = (ac, notes, step = 0.075, type = "square") =>
  notes.forEach((freq, i) => tone(ac, { freq, at: i * step, dur: step * 1.6, type }));

const RECIPES = {
  whoosh: (ac) => noise(ac, { dur: 0.45, from: 3000, to: 200, gain: 0.16 }),
  round: (ac) => arp(ac, [523, 659], 0.1),
  start: (ac) => arp(ac, [523, 659, 784, 1047], 0.07),
  hint: (ac) => arp(ac, [880, 1175], 0.09, "sine"),
  fanfare: (ac) => arp(ac, [523, 659, 784, 1047, 784, 1047, 1319], 0.09),
  pickup: (ac) => tone(ac, { freq: 400, to: 900, dur: 0.1 }),
  drop: (ac) => tone(ac, { freq: 700, to: 250, dur: 0.13 }),
  splash: (ac) => { noise(ac, { dur: 0.35, from: 3500, to: 400, gain: 0.22 }); tone(ac, { freq: 160, to: 60, dur: 0.18, type: "sine", gain: 0.2 }); },
  correct: (ac) => arp(ac, [659, 988, 1319], 0.08),
  wrong: (ac) => { tone(ac, { freq: 220, to: 110, dur: 0.28, type: "sawtooth", gain: 0.13 }); tone(ac, { freq: 165, to: 90, at: 0.08, dur: 0.28, type: "sawtooth", gain: 0.1 }); },
  pop: (ac) => tone(ac, { freq: 500, to: 1100, dur: 0.06, type: "sine", gain: 0.1 }),
};

function synth(name) {
  if (!SYNTH_FALLBACK || !RECIPES[name]) return;
  try {
    const ac = getCtx();
    if (!ac) return;
    RECIPES[name](ac);
  } catch {
    /* ignore */
  }
}

export function playSfx(name, volume = 0.6) {
  let usedFallback = false;
  const fallback = () => {
    if (usedFallback) return;
    usedFallback = true;
    synth(name);
  };

  try {
    const audio = new Audio(`/sfx/${name}.mp3`);
    audio.volume = volume;
    audio.addEventListener("error", fallback, { once: true });
    audio.play().catch(fallback); // file missing (or can't play): use the built-in sound
  } catch {
    fallback();
  }
}
