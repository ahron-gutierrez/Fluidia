import { useMemo, useState } from "react";

import BuoyancyPlatformer, { MATERIALS } from "../../components/BuoyancyPlatformer";

const FLUIDS = [
  { id: "water", name: "Fresh water", rho: 1000, color: "#4ca9c7" },
  { id: "sea", name: "Seawater", rho: 1025, color: "#2f7fa3" },
  { id: "oil", name: "Olive oil", rho: 920, color: "#d7a85f" },
  { id: "brine", name: "Salt brine", rho: 1200, color: "#3f9d8f" },
  { id: "glycerin", name: "Glycerin", rho: 1260, color: "#9fd8e8" },
  { id: "mercury", name: "Mercury", rho: 13600, color: "#9aa5ad" },
];
const G = 9.81;
const VOLUME = 0.001; // every object is 1 litre (0.001 m³)

// Free play with the buoyancy lab: pick up any object, drop it in any liquid.
// mode "sg" explains specific gravity; mode "archimedes" shows the forces.
function FloatSandbox({ spriteId, mode }) {
  const [fluidId, setFluidId] = useState("water");
  const [last, setLast] = useState(null);
  const fluid = FLUIDS.find((f) => f.id === fluidId);
  const round = useMemo(
    () => ({ sandbox: true, fluid, items: Object.keys(MATERIALS) }),
    [fluid]
  );

  const handle = (result) => {
    if (!result.fell) setLast({ ...result, fluid });
  };

  let readout = <p className="sandbox-readout">Pick up an object with <kbd>E</kbd> and drop it over the tank to test it.</p>;
  if (last) {
    const sg = last.rho / 1000;
    const weight = last.rho * VOLUME * G;
    const maxBuoyancy = last.fluid.rho * VOLUME * G;
    const where = last.sinks
      ? `it sinks in ${last.fluid.name}.`
      : `it floats in ${last.fluid.name} with ${Math.round(last.frac * 100)}% of its volume underwater.`;

    readout =
      mode === "sg" ? (
        <div className="sandbox-readout">
          <strong>{last.name}</strong>: SG = ρ ÷ ρ_water = {last.rho} ÷ 1000 = <strong>{sg.toFixed(2)}</strong>
          <div>{sg < 1 ? "Less dense than water" : sg > 1 ? "Denser than water" : "Same density as water"}; {where}</div>
        </div>
      ) : (
        <div className="sandbox-readout">
          <strong>{last.name}</strong> (1 litre): weight = ρ·V·g = <strong>{weight.toFixed(2)} N</strong>
          <div>
            Fully submerged, the buoyant force would be ρ_fluid·V·g = <strong>{maxBuoyancy.toFixed(2)} N</strong>.
            {last.sinks ? " That's less than its weight, so " : " That's more than its weight, so it rises until the displaced water weighs the same, so "}
            {where}
          </div>
        </div>
      );
  }

  return (
    <div>
      <div className="sandbox-controls">
        <label>
          Liquid{" "}
          <select className="form-select" value={fluidId} onChange={(e) => { setFluidId(e.target.value); setLast(null); e.target.blur(); }}>
            {FLUIDS.map((f) => <option key={f.id} value={f.id}>{f.name} (ρ = {f.rho})</option>)}
          </select>
        </label>
        <span className="sandbox-hint">Changing the liquid refills the tank and resets the objects.</span>
      </div>
      <BuoyancyPlatformer round={round} spriteId={spriteId} solved={false} onResult={handle} />
      {readout}
    </div>
  );
}

export default FloatSandbox;
