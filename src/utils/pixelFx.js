// Pixel particle effects: chunky square particles drawn on one full-screen canvas.
// No sprites needed. Positions are screen pixels (use centerOf(element) to aim at things).
//
//   import * as fx from "../utils/pixelFx";
//   fx.sparkle(x, y);  fx.splash(x, y, "#4ca9c7");  fx.confetti(x, y);  ...

const PIXEL = 4; // particles snap to a 4px grid so they look like big pixels
const GOLD = ["#f0cd86", "#d7a85f", "#f7f3e6", "#fff"];
const WATER = ["#4ca9c7", "#9fd8e8", "#f7f3e6"];
const PARTY = ["#d7a85f", "#4ca9c7", "#6aa86b", "#c46b5f", "#f7f3e6", "#8a6fc4"];

let canvas = null;
let ctx = null;
let particles = [];
let frameId = 0;
let last = 0;

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed", inset: "0", width: "100vw", height: "100vh",
    pointerEvents: "none", zIndex: "7000",
  });
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
}

function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(window.innerWidth * dpr);
  const h = Math.round(window.innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  fitCanvas();
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter((p) => {
    p.age += dt;
    if (p.age >= p.life) return false;
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const left = 1 - p.age / p.life;
    ctx.globalAlpha = left > 0.3 ? 1 : left / 0.3; // fade out at the end
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x / PIXEL) * PIXEL, Math.round(p.y / PIXEL) * PIXEL, p.size, p.size);
    return true;
  });

  ctx.globalAlpha = 1;
  frameId = particles.length ? requestAnimationFrame(frame) : 0;
}

const rand = (a, b) => a + Math.random() * (b - a);

// The general-purpose emitter all presets use.
// angle: direction in radians (-PI/2 = up). spread: how wide the cone is (2*PI = every direction).
export function emit({
  x, y, count = 12, angle = -Math.PI / 2, spread = Math.PI * 2, speed = [60, 160],
  gravity = 400, life = [0.5, 1], sizes = [1, 2], colors = GOLD, jitter = 0,
}) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  ensureCanvas();

  for (let i = 0; i < count; i++) {
    const a = angle + rand(-spread / 2, spread / 2);
    const s = rand(speed[0], speed[1]);
    particles.push({
      x: x + rand(-jitter, jitter), y: y + rand(-jitter, jitter),
      vx: Math.cos(a) * s, vy: Math.sin(a) * s, gravity,
      age: 0, life: rand(life[0], life[1]),
      size: PIXEL * sizes[Math.floor(rand(0, sizes.length))],
      color: colors[Math.floor(rand(0, colors.length))],
    });
  }

  if (!frameId) {
    last = performance.now();
    frameId = requestAnimationFrame(frame);
  }
}

// ---- ready-made effects ----
export const sparkle = (x, y, colors = GOLD) =>
  emit({ x, y, count: 28, speed: [80, 260], gravity: 260, life: [0.5, 0.95], sizes: [1, 2, 2], colors });

export const confetti = (x, y, angle = -Math.PI / 2, spread = 1.3) =>
  emit({ x, y, count: 46, angle, spread, speed: [260, 560], gravity: 760, life: [1.1, 2], sizes: [1, 2], colors: PARTY, jitter: 8 });

export const splash = (x, y, color = "#4ca9c7") =>
  emit({ x, y, count: 24, spread: 1.2, speed: [150, 360], gravity: 900, life: [0.45, 0.9], sizes: [1, 1, 2], colors: [color, ...WATER], jitter: 6 });

export const bubbles = (x, y, count = 6) =>
  emit({ x, y, count, spread: 0.7, speed: [30, 80], gravity: -90, life: [0.8, 1.5], sizes: [1, 2], colors: ["#f7f3e6", "#9fd8e8"], jitter: 12 });

export const puff = (x, y, colors = ["#f4e9c9", "#cfc6a8", "#9aa5ad"]) =>
  emit({ x, y, count: 12, spread: Math.PI, speed: [30, 110], gravity: 40, life: [0.3, 0.6], sizes: [1, 2], colors, jitter: 6 });

export const sparks = (x, y) =>
  emit({ x, y, count: 18, speed: [160, 320], gravity: 520, life: [0.3, 0.65], sizes: [1, 1], colors: ["#fff", "#f0cd86", "#f2a65a"] });

export const waterSpray = (x, y, dir = 1) =>
  emit({ x, y, count: 34, angle: dir > 0 ? -Math.PI / 4 : (-3 * Math.PI) / 4, spread: 0.9, speed: [220, 430], gravity: 820, life: [0.55, 1], sizes: [1, 1, 2], colors: WATER });

// ---- helpers for aiming ----
export function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function feetOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.bottom - 4 };
}
