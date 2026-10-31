// Map locations. x / y = position on the map (% of width / height).
// lesson = optional route to the matching lesson page.
export const MAP_LOCATIONS = [
  {
    id: "reservoir", icon: "💧", name: "Reservoir Lake", x: 14, y: 24,
    topic: "Hydrostatic pressure",
    formula: "P = ρ g h",
    text: "A fluid's weight pushes on everything beneath it. The deeper you go, the greater the pressure, which is why dams are thicker at the bottom.",
    lesson: "/fluids/pressure-density",
  },
  {
    id: "dunes", icon: "⚖️", name: "Density Dunes", x: 38, y: 16,
    topic: "Density",
    formula: "ρ = m / V",
    text: "Density is how much mass is packed into a given volume. Oil floats on water because it's less dense, even though both are liquids.",
    lesson: "/fluids/density",
  },
  {
    id: "springs", icon: "🧪", name: "Specific Gravity Springs", x: 64, y: 22,
    topic: "Specific gravity",
    formula: "SG = ρ / ρ_water",
    text: "Specific gravity compares a substance's density to water's. Above 1 it sinks in water, below 1 it floats.",
    lesson: "/fluids/specific-gravity",
  },
  {
    id: "harbor", icon: "⚓", name: "Archimedes Harbor", x: 86, y: 38,
    topic: "Buoyancy",
    formula: "F_b = ρ_fluid g V_displaced",
    text: "An object in a fluid feels an upward force equal to the weight of the fluid it pushes aside. That's how steel ships float.",
    lesson: "/fluids/archimedes",
  },
  {
    id: "windmill", icon: "🌬️", name: "Windmill Town", x: 80, y: 78,
    topic: "Bernoulli's principle",
    formula: "P + ½ρv² + ρgh = constant",
    text: "Where a fluid moves faster, its pressure drops. It's one reason airplane wings lift and why shower curtains blow inward.",
    lesson: "/fluids/rate-of-flow",
  },
  {
    id: "canyon", icon: "🏞️", name: "Continuity Canyon", x: 56, y: 62,
    topic: "Continuity & flow rate",
    formula: "A₁v₁ = A₂v₂",
    text: "Squeeze a river into a narrow channel and it speeds up. The same volume per second must pass through every part of the pipe.",
    lesson: "/fluids/rate-of-flow",
  },
  {
    id: "press", icon: "🔧", name: "Pascal's Press", x: 30, y: 58,
    topic: "Pascal's principle",
    formula: "F₁/A₁ = F₂/A₂",
    text: "Pressure applied to a confined fluid spreads equally in all directions. Hydraulic lifts use it to raise cars with a small push.",
  },
  {
    id: "tarpits", icon: "🍯", name: "Viscosity Tar Pits", x: 10, y: 72,
    topic: "Viscosity",
    formula: "F = η A v / d",
    text: "Viscosity is a fluid's resistance to flowing. Honey is far more viscous than water, and warming it makes it flow more easily.",
  },
  {
    id: "pond", icon: "🪷", name: "Surface Tension Pond", x: 46, y: 86,
    topic: "Surface tension",
    formula: "γ = F / L",
    text: "Water molecules pull on each other, forming a thin 'skin' on the surface. It lets insects walk on water and makes droplets round.",
  },
  {
    id: "rapids", icon: "🌊", name: "Turbulence Rapids", x: 68, y: 90,
    topic: "Laminar vs turbulent flow",
    formula: "Re = ρ v D / η",
    text: "Slow, smooth flow is laminar; fast or rough flow becomes turbulent and swirly. The Reynolds number predicts which one you'll get.",
  },
];
