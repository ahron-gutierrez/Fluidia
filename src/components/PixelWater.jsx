import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Animated, posterized water rendered at a tiny resolution, then scaled up
// with image-rendering: pixelated for the chunky pixel-art look.
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float y = 1.0 - uv.y; // 0 at the top, 1 at the bottom

  // wavy surface line
  float surf = 0.07
    + 0.016 * sin(uv.x * 18.0 + uTime * 2.0)
    + 0.010 * sin(uv.x * 33.0 - uTime * 1.4);

  if (y < surf) {
    gl_FragColor = vec4(0.86, 0.94, 0.96, 1.0); // sky
    return;
  }

  // depth gradient: lighter near the top, darker below
  vec3 col = mix(uColor * 1.3, uColor * 0.4, clamp((y - surf) * 1.2, 0.0, 1.0));

  // drifting caustic-style ripples
  float n = sin(uv.x * 24.0 + sin(y * 14.0 + uTime) * 1.6 + uTime * 0.8)
          + sin(y * 34.0 - uTime * 0.9 + uv.x * 11.0);
  col += smoothstep(1.15, 1.7, n) * 0.16;

  // foam strip just under the surface
  if (y < surf + 0.035) col = mix(col, vec3(0.95), 0.75);

  // posterize for the pixel-art palette
  col = floor(col * 6.0 + 0.5) / 6.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

function PixelWater({ color = "#4ca9c7", width = 128, height = 90 }) {
  const canvasRef = useRef(null);
  const colorRef = useRef(hexToRgb(color));

  useEffect(() => {
    colorRef.current = hexToRgb(color);
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    let gl = null;
    let program = null;
    let buffer = null;
    let uTime = null;
    let uColor = null;
    let frameId = 0;
    let disposed = false;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();

    const compile = (type, src) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    // Builds all GL resources. Runs on mount and again if the browser restores a lost context.
    const setup = () => {
      gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
      if (!gl || gl.isContextLost()) return false;

      program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
      gl.useProgram(program);

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(program, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      uTime = gl.getUniformLocation(program, "uTime");
      uColor = gl.getUniformLocation(program, "uColor");
      gl.viewport(0, 0, width, height);
      gl.uniform2f(gl.getUniformLocation(program, "uRes"), width, height);
      return true;
    };

    const draw = () => {
      if (disposed) return;
      if (gl && !gl.isContextLost()) {
        gl.uniform1f(uTime, reduceMotion ? 0 : (performance.now() - start) / 1000);
        gl.uniform3fv(uColor, colorRef.current);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!reduceMotion) frameId = requestAnimationFrame(draw);
    };

    const onLost = (event) => event.preventDefault(); // allow the browser to restore it
    const onRestored = () => {
      if (setup() && reduceMotion) draw();
    };

    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    if (setup()) draw();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      // Free resources but do NOT force-lose the context: React's dev double-mount
      // reuses this same canvas, and a force-lost context stays dead (white canvas).
      if (gl && !gl.isContextLost()) {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="quest-pool-canvas"
      width={width}
      height={height}
      aria-hidden="true"
    />
  );
}

export default PixelWater;
