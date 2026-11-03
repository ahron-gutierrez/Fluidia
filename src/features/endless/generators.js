// Random question generators for endless mode, one per quest topic.
// makeQuestion(topic, level) -> { prompt, formula, options: [{ text, correct }], explain }
// Higher levels give harder question types, less round numbers, and fewer seconds per question.

const G = 9.81;
const ATM = 101.3; // kPa

export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// number -> short text (drops useless trailing zeros)
const num = (n, digits = 1) => String(parseFloat(Number(n).toFixed(digits)));

// Builds shuffled options: the correct one plus 3 distinct, sensible wrong ones.
function options(correct, wrongs, format) {
  const correctText = format(correct);
  const seen = new Set([correctText]);
  const wrongTexts = [];

  const add = (value) => {
    if (!Number.isFinite(value) || value <= 0) return;
    const text = format(value);
    if (!seen.has(text)) {
      seen.add(text);
      wrongTexts.push(text);
    }
  };

  shuffle(wrongs).forEach(add);
  // not enough different wrong answers? make some more by scaling the right one
  for (const factor of shuffle([0.5, 1.5, 2, 0.75, 1.25, 3, 0.25, 1.1, 0.9])) {
    if (wrongTexts.length >= 3) break;
    add(correct * factor);
  }

  return shuffle([{ text: correctText, correct: true }, ...wrongTexts.slice(0, 3).map((text) => ({ text, correct: false }))]);
}

const twoWay = (correctText, wrongText, shuffleThem = true) => {
  const list = [{ text: correctText, correct: true }, { text: wrongText, correct: false }];
  return shuffleThem ? shuffle(list) : list;
};

// pick a question "tier" from the level: mostly the newest tier, sometimes an easier one
function tierFor(level, maxTier) {
  const tier = Math.min(Math.floor(level / 3), maxTier);
  return Math.random() < 0.65 ? tier : randInt(Math.max(0, tier - 2), tier);
}
const decimals = (level) => level >= 9; // later on, depths/speeds aren't whole numbers any more

// -------------------------------------------------------------- hydrostatic pressure
const FLUIDS = {
  water: { name: "fresh water", rho: 1000 },
  sea: { name: "seawater", rho: 1025 },
  oil: { name: "olive oil", rho: 920 },
  brine: { name: "salt brine", rho: 1200 },
  glycerin: { name: "glycerin", rho: 1260 },
  mercury: { name: "mercury", rho: 13600 },
};
const kPa = (rho, h) => (rho * G * h) / 1000;
const fmtKpa = (v) => `${num(v, 1)} kPa`;
const fmtM = (v) => `${num(v, 1)} m`;

function pressureQuestion(level) {
  const tier = tierFor(level, 5);
  const depth = (min, max) => (decimals(level) ? Math.round(rand(min, max) * 2) / 2 : randInt(min, max));

  if (tier === 0) {
    const h = pick([2, 4, 5, 8, 10, 12, 15, 20, 25, 30]);
    const P = kPa(1000, h);
    return {
      prompt: `What is the gauge pressure ${h} m below the surface of fresh water?`,
      formula: "P = ρ · g · h",
      options: options(P, [h, P + ATM, P * 2, P / 2, P * 10], fmtKpa),
      explain: `P = ρgh = 1000 × ${G} × ${h} = ${fmtKpa(P)}.`,
    };
  }

  if (tier === 1) {
    const f = FLUIDS[pick(["sea", "oil", "brine", "glycerin"])];
    const h = depth(3, 40);
    const P = kPa(f.rho, h);
    return {
      prompt: `What is the gauge pressure ${num(h)} m deep in ${f.name} (ρ = ${f.rho} kg/m³)?`,
      formula: "P = ρ · g · h",
      options: options(P, [kPa(1000, h), (f.rho * 10 * h) / 1000 * 1.2, P + ATM, P / 2, P * 2], fmtKpa),
      explain: `P = ρgh = ${f.rho} × ${G} × ${num(h)} = ${fmtKpa(P)}.`,
    };
  }

  if (tier === 2) {
    const f = FLUIDS[pick(["water", "sea", "oil", "brine"])];
    const P = pick([60, 90, 120, 150, 200, 250, 300]);
    const h = (P * 1000) / (f.rho * G);
    return {
      prompt: `The gauge pressure is ${P} kPa in ${f.name} (ρ = ${f.rho} kg/m³). How deep are you?`,
      formula: "h = P ÷ (ρ · g)",
      options: options(h, [(P * 1000) / f.rho, h * G, h / 2, h * 2, P / G], fmtM),
      explain: `h = P ÷ (ρg) = ${P * 1000} ÷ (${f.rho} × ${G}) = ${fmtM(h)}.`,
    };
  }

  if (tier === 3) {
    const f = FLUIDS[pick(["water", "sea", "oil", "brine", "glycerin"])];
    const h = depth(4, 35);
    const gauge = kPa(f.rho, h);
    const P = gauge + ATM;
    return {
      prompt: `What is the ABSOLUTE pressure ${num(h)} m deep in ${f.name} (ρ = ${f.rho} kg/m³)? Atmosphere = ${ATM} kPa.`,
      formula: "P_abs = P_atm + ρ · g · h",
      options: options(P, [gauge, gauge - ATM, P + ATM, gauge * 2, P / 2], fmtKpa),
      explain: `P = ${ATM} + ${f.rho} × ${G} × ${num(h)} ÷ 1000 = ${ATM} + ${num(gauge)} = ${fmtKpa(P)}.`,
    };
  }

  if (tier === 4) {
    for (let tries = 0; tries < 30; tries++) {
      const dives = shuffle(["water", "sea", "oil", "brine", "glycerin", "mercury"]).slice(0, 4).map((id) => {
        const h = id === "mercury" ? randInt(1, 3) : depth(5, 40);
        return { f: FLUIDS[id], h, text: `${num(h)} m of ${FLUIDS[id].name}`, p: FLUIDS[id].rho * h };
      });
      const sorted = [...dives].sort((a, b) => b.p - a.p);
      if (sorted[0].p - sorted[1].p < sorted[0].p * 0.04) continue; // avoid near-ties
      const opts = dives.map((d) => ({ text: d.text, correct: d === sorted[0] }));
      return {
        prompt: "Which of these has the GREATEST gauge pressure at the bottom?",
        formula: "P = ρ · g · h  (compare ρ × h)",
        options: opts,
        explain: `ρ × h: ${dives.map((d) => `${d.text} → ${num(d.p, 0)}`).join(", ")}. The biggest wins: ${sorted[0].text}.`,
      };
    }
  }

  const h1 = randInt(2, 8);
  const h2 = randInt(3, 12);
  const P = (G * (920 * h1 + 1000 * h2)) / 1000;
  return {
    prompt: `A tank has a ${h1} m layer of olive oil (ρ = 920) floating on ${h2} m of fresh water (ρ = 1000). What is the gauge pressure at the bottom?`,
    formula: "P = g · (ρ₁h₁ + ρ₂h₂)",
    options: options(P, [kPa(1000, h1 + h2), kPa(920, h1 + h2), kPa(1000, h2), kPa(920, h1) + 5], fmtKpa),
    explain: `P = ${G} × (920 × ${h1} + 1000 × ${h2}) ÷ 1000 = ${fmtKpa(P)}.`,
  };
}

// -------------------------------------------------------------- fluid flow (plumber)
const areaM2 = (dCm) => (Math.PI * (dCm / 100) ** 2) / 4;
const fmtMs = (v) => `${num(v, 1)} m/s`;
const fmtLs = (v) => `${num(v, 1)} L/s`;
const fmtS = (v) => `${Math.round(v)} s`;

function flowQuestion(level) {
  const tier = tierFor(level, 5);
  const speed = (min, max) => (decimals(level) ? Math.round(rand(min, max) * 2) / 2 : randInt(min, max));

  if (tier === 0) {
    const [d1, d2] = pick([[10, 5], [8, 4], [12, 6], [6, 3], [12, 4], [9, 3]]);
    const r = d1 / d2;
    const v1 = speed(1, 4);
    const v2 = v1 * r * r;
    return {
      prompt: `Water moves at ${num(v1)} m/s through a ${d1} cm pipe that narrows to ${d2} cm. How fast is it in the narrow part?`,
      formula: "A₁v₁ = A₂v₂  (A ∝ d²)",
      options: options(v2, [v1 * r, v1 / (r * r), v1 * (r * r - 1), v1 * r * r * 2], fmtMs),
      explain: `v₂ = v₁ × (d₁ ÷ d₂)² = ${num(v1)} × (${d1} ÷ ${d2})² = ${fmtMs(v2)}.`,
    };
  }

  if (tier === 1) {
    const d = pick([4, 6, 8, 10, 12, 15, 20]);
    const v = speed(1, 5);
    const Q = areaM2(d) * v * 1000;
    return {
      prompt: `Water flows at ${num(v)} m/s through a pipe ${d} cm across. What is the flow rate?`,
      formula: "Q = A · v,  A = π d² ÷ 4",
      options: options(Q, [Q * 4, Q / 4, Q * 2, Q / 2, v * d], fmtLs),
      explain: `A = π × ${d / 100}² ÷ 4 = ${num(areaM2(d), 4)} m², so Q = A × v = ${fmtLs(Q)}.`,
    };
  }

  if (tier === 2) {
    for (let tries = 0; tries < 30; tries++) {
      const V = pick([1.5, 2, 3, 4, 6]);
      const d = pick([10, 15, 20]);
      const v = speed(1, 3);
      const t = (V * 1000) / (areaM2(d) * v * 1000);
      if (t < 8 || t > 700) continue;
      return {
        prompt: `A ${d} cm pipe carries water at ${num(v)} m/s into an empty ${V} m³ tank. How long until it is full?`,
        formula: "Q = A · v,  then t = V ÷ Q",
        options: options(t, [t * 4, t / 4, t * 2, t / 2, t * 1000], fmtS),
        explain: `Q = ${num(areaM2(d) * v, 4)} m³/s, so t = ${V} ÷ ${num(areaM2(d) * v, 4)} = ${fmtS(t)}.`,
      };
    }
  }

  if (tier === 3) {
    const P1 = pick([200, 250, 300, 400]);
    const v1 = speed(1, 3);
    const v2 = v1 + randInt(2, 6);
    const P2 = P1 + 0.5 * (v1 * v1 - v2 * v2);
    return {
      prompt: `In a level pipe, water (ρ = 1000) speeds up from ${num(v1)} m/s to ${num(v2)} m/s. The pressure was ${P1} kPa. What is it now?`,
      formula: "P₁ + ½ρv₁² = P₂ + ½ρv₂²",
      options: options(P2, [P1 - 0.5 * (v1 * v1 - v2 * v2), P1 + 0.5 * (v1 - v2), P1 - 0.5 * v2 * v2, P1 + 0.5 * v2 * v2], fmtKpa),
      explain: `P₂ = ${P1} + ½ × 1000 × (${num(v1)}² − ${num(v2)}²) ÷ 1000 = ${fmtKpa(P2)}.`,
    };
  }

  if (tier === 4) {
    const P1 = pick([250, 300, 400]);
    const d1 = pick([8, 10, 12]);
    const d2 = d1 / 2;
    const v1 = speed(1, 3);
    const v2 = v1 * 4;
    const P2 = P1 + 0.5 * (v1 * v1 - v2 * v2);
    return {
      prompt: `A ${d1} cm pipe at ${P1} kPa carries water at ${num(v1)} m/s, then narrows to ${d2} cm. What is the pressure in the narrow part?`,
      formula: "A₁v₁ = A₂v₂, then Bernoulli",
      options: options(P2, [P1 + 0.5 * (v1 * v1 - 4 * v1 * 4 * v1 / 4), P1 - 0.5 * (v2 * v2 - v1 * v1) * 2, P1 + 0.5 * (v2 * v2 - v1 * v1), P1 - 0.5 * v2], fmtKpa),
      explain: `v₂ = ${num(v1)} × 4 = ${num(v2)} m/s, so P₂ = ${P1} + ½ × (${num(v1)}² − ${num(v2)}²) = ${fmtKpa(P2)}.`,
    };
  }

  const [d1, d2] = pick([[8, 4], [12, 6], [12, 4], [10, 5]]);
  const v1 = speed(1, 4);
  const v = (v1 * d1 * d1) / (2 * d2 * d2);
  return {
    prompt: `Water at ${num(v1)} m/s in a ${d1} cm pipe splits into TWO identical ${d2} cm pipes. How fast is it in each branch?`,
    formula: "Q_in = Q₁ + Q₂",
    options: options(v, [(v1 * d1 * d1) / (d2 * d2), v1 / 2, v1 * (d1 / d2), (v1 * d1 * d1) / (4 * d2 * d2)], fmtMs),
    explain: `A₁v₁ = 2 × A₂v₂, so v₂ = ${num(v1)} × ${d1}² ÷ (2 × ${d2}²) = ${fmtMs(v)}.`,
  };
}

// -------------------------------------------------------------- buoyancy (laboratory)
const MATERIALS = {
  cork: { name: "cork", rho: 240 },
  pine: { name: "pine wood", rho: 500 },
  oak: { name: "oak wood", rho: 750 },
  ice: { name: "ice", rho: 917 },
  rubber: { name: "rubber", rho: 1100 },
  brick: { name: "brick", rho: 1900 },
  aluminum: { name: "aluminum", rho: 2700 },
  steel: { name: "steel", rho: 7800 },
};
const fmtPct = (v) => `${Math.round(v)}%`;
const fmtRho = (v) => `${Math.round(v)} kg/m³`;
const fmtN = (v) => `${num(v, 1)} N`;
const fmtL = (v) => `${num(v, 2)} L`;

function buoyancyQuestion(level) {
  const tier = tierFor(level, 5);

  if (tier === 0) {
    const f = FLUIDS[pick(["water", "sea", "oil", "brine", "glycerin"])];
    const m = MATERIALS[pick(Object.keys(MATERIALS))];
    const floats = m.rho < f.rho;
    return {
      prompt: `A piece of ${m.name} (ρ = ${m.rho} kg/m³) is dropped into ${f.name} (ρ = ${f.rho} kg/m³). What happens?`,
      formula: "Floats if ρ_object < ρ_fluid",
      options: twoWay(floats ? "It floats" : "It sinks", floats ? "It sinks" : "It floats"),
      explain: `${m.rho} is ${floats ? "less" : "more"} than ${f.rho}, so it ${floats ? "floats" : "sinks"}.`,
    };
  }

  if (tier === 1) {
    for (let tries = 0; tries < 40; tries++) {
      const f = FLUIDS[pick(["water", "sea", "oil", "brine", "glycerin", "mercury"])];
      const m = MATERIALS[pick(Object.keys(MATERIALS))];
      const frac = m.rho / f.rho;
      if (frac < 0.15 || frac > 0.95) continue;
      const c = frac * 100;
      return {
        prompt: `${m.name[0].toUpperCase() + m.name.slice(1)} (ρ = ${m.rho} kg/m³) floats in ${f.name} (ρ = ${f.rho} kg/m³). What percent of it is underwater?`,
        formula: "fraction under = ρ_object ÷ ρ_fluid",
        options: options(Math.round(c), [100 - Math.round(c), Math.round(c) + 12, Math.round(c) - 12, Math.round(c) * 1.5, Math.round(c) / 2], fmtPct),
        explain: `${m.rho} ÷ ${f.rho} = ${num(frac, 2)}, so about ${fmtPct(c)} is underwater.`,
      };
    }
  }

  if (tier === 2) {
    const f = FLUIDS[pick(["water", "sea", "oil", "brine", "glycerin"])];
    const k = pick([25, 40, 50, 60, 75, 80, 90]);
    const rho = (k / 100) * f.rho;
    return {
      prompt: `An object must float with ${k}% of its volume underwater in ${f.name} (ρ = ${f.rho} kg/m³). What density does it need?`,
      formula: "ρ_object = fraction × ρ_fluid",
      options: options(rho, [f.rho * (1 - k / 100), f.rho / (k / 100), f.rho + k, rho * 2, k * 10], fmtRho),
      explain: `ρ = ${k / 100} × ${f.rho} = ${fmtRho(rho)}.`,
    };
  }

  if (tier === 3) {
    const f = FLUIDS[pick(["water", "sea", "oil", "brine", "glycerin", "mercury"])];
    const V = pick([1, 2, 3, 5, 10, 20]);
    const F = (f.rho * (V / 1000) * G);
    return {
      prompt: `An object of volume ${V} L is fully underwater in ${f.name} (ρ = ${f.rho} kg/m³). What is the buoyant force on it?`,
      formula: "F_b = ρ_fluid · g · V   (1 L = 0.001 m³)",
      options: options(F, [F / G, F * 1000, F / 2, F * 2, f.rho * G], fmtN),
      explain: `F = ${f.rho} × ${G} × ${V / 1000} = ${fmtN(F)}.`,
    };
  }

  if (tier === 4) {
    for (let tries = 0; tries < 40; tries++) {
      const f = FLUIDS[pick(["water", "sea", "oil", "brine"])];
      const m = MATERIALS[pick(["brick", "aluminum", "steel", "rubber"])];
      if (m.rho <= f.rho) continue;
      const V = pick([1, 2, 3, 5]);
      const weight = (m.rho * V / 1000) * G;
      const buoy = (f.rho * V / 1000) * G;
      const apparent = weight - buoy;
      return {
        prompt: `A ${V} L block of ${m.name} (ρ = ${m.rho}) is held fully underwater in ${f.name} (ρ = ${f.rho}). What does a scale attached to it read (apparent weight)?`,
        formula: "apparent weight = weight − buoyant force",
        options: options(apparent, [weight, buoy, weight + buoy, apparent * 2, apparent / 2], fmtN),
        explain: `Weight ${fmtN(weight)} − buoyant force ${fmtN(buoy)} = ${fmtN(apparent)}.`,
      };
    }
  }

  const f = FLUIDS[pick(["water", "sea", "brine"])];
  const V = pick([3, 4, 5, 8, 10]);
  const m = Math.round(rand(0.3, 0.85) * (f.rho * V / 1000) * 10) / 10;
  const Vsub = (m * 1000) / f.rho;
  return {
    prompt: `A ${num(m)} kg block of volume ${V} L floats in ${f.name} (ρ = ${f.rho} kg/m³). How much of it is underwater?`,
    formula: "floating: weight = buoyant force, so V_under = m ÷ ρ_fluid",
    options: options(Vsub, [V - Vsub, Vsub * 2, Vsub / 2, m, (m * 1000) / (f.rho * 2)], fmtL),
    explain: `V_under = ${num(m)} ÷ ${f.rho} = ${num(m / f.rho, 5)} m³ = ${fmtL(Vsub)}.`,
  };
}

// -------------------------------------------------------------- public API
export const ENDLESS_TOPICS = {
  "village-beneath-water": { name: "Hydrostatic Pressure", icon: "💧", make: pressureQuestion, accent: "#4ca9c7" },
  "windmills-secret": { name: "Fluid Flow", icon: "🔧", make: flowQuestion, accent: "#c46b5f" },
  "sunken-cargo": { name: "Buoyancy", icon: "🧪", make: buoyancyQuestion, accent: "#3f9d8f" },
};

export const makeQuestion = (topicId, level) => ENDLESS_TOPICS[topicId].make(level);

// scoring and pacing
export const pointsFor = (level, streak) => 15 + level * 8 + Math.min(streak, 10) * 3;
export const secondsFor = (level) => Math.max(15, 40 - level * 2);
export const START_LIVES = 3;
