import type { CustomLayerInterface, CustomRenderMethodInput, Map as MapLibreMap } from "maplibre-gl";

/**
 * The Active Player Map's live pulse: two rings ripple out from under every
 * city pin, forever, like sonar - the map's way of saying these places are
 * playing now. Drawn by its own shader inside MapLibre's GL context (a custom
 * layer), so a hundred cities cost one draw call per world copy and no DOM.
 *
 * Each city is a screen-space quad centred on its point; the fragment shader
 * draws the rings by distance from the centre. A city's `seed` offsets its
 * phase, so the map breathes rather than blinking in unison, and `size` grows
 * the ring a little with the city's player count.
 *
 * The rings belong to the city pins: they fade out over the half-level before
 * PLAYERS_FROM, where the city pins give way to one pin per player.
 *
 * IT ONLY ANIMATES WHILE SOMEONE CAN SEE IT. `setRunning(false)` (the disc off
 * screen, the tab hidden) stops asking for frames; MapLibre then sits idle.
 * Reduced motion never adds this layer at all.
 */

export type PulsePoint = { lon: number; lat: number; seed: number; size: number };

const VERTEX = `
attribute vec2 a_merc;
attribute vec2 a_corner;
attribute vec2 a_seed_size;
uniform mat4 u_matrix;
uniform vec2 u_viewport;
uniform float u_radius;
uniform float u_offset;
varying vec2 v_corner;
varying float v_seed;
void main() {
  vec4 clip = u_matrix * vec4(a_merc.x + u_offset, a_merc.y, 0.0, 1.0);
  clip.xy += a_corner * u_radius * a_seed_size.y * 2.0 / u_viewport * clip.w;
  gl_Position = clip;
  v_corner = a_corner;
  v_seed = a_seed_size.x;
}`;

const FRAGMENT = `
precision mediump float;
uniform float u_time;
uniform float u_alpha;
uniform vec3 u_color;
varying vec2 v_corner;
varying float v_seed;
void main() {
  float d = length(v_corner);
  if (d > 1.0) discard;
  float a = 0.0;
  for (int k = 0; k < 2; k++) {
    float t = fract(u_time / 2.6 + v_seed + float(k) * 0.5);
    float r = 0.12 + 0.88 * t;
    float ring = 1.0 - smoothstep(0.0, 0.07 + 0.05 * t, abs(d - r));
    a += ring * (1.0 - t) * (1.0 - t);
  }
  a += (1.0 - smoothstep(0.0, 0.2, d)) * 0.4;
  a = clamp(a, 0.0, 1.0) * u_alpha;
  gl_FragColor = vec4(u_color * a, a);
}`;

/** Ring radius at size 1, in CSS pixels. */
const RADIUS = 30;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "pulse shader");
  return shader;
}

/** `#fb0b01` → [r, g, b] in 0..1. Anything unreadable falls back to the signal red. */
function rgb(hex: string): [number, number, number] {
  const m = hex.trim().match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return [0.984, 0.043, 0.004];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

export function pulseLayer({
  points,
  color,
  fadeFrom,
  toMercator,
}: {
  points: readonly PulsePoint[];
  color: string;
  /** The zoom at which the rings are gone (PLAYERS_FROM). */
  fadeFrom: number;
  /** `MercatorCoordinate.fromLngLat`, passed in so this file needs no runtime import. */
  toMercator: (lngLat: [number, number]) => { x: number; y: number };
}): CustomLayerInterface & { setRunning: (on: boolean) => void } {
  let map: MapLibreMap | null = null;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  let count = 0;
  let running = true;
  const start = performance.now();
  const tint = rgb(color);
  const loc: Record<string, number> = {};
  const uni: Record<string, WebGLUniformLocation | null> = {};

  const bindAttributes = (gl: WebGLRenderingContext) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const stride = 6 * 4;
    gl.enableVertexAttribArray(loc.merc);
    gl.vertexAttribPointer(loc.merc, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(loc.corner);
    gl.vertexAttribPointer(loc.corner, 2, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(loc.seedSize);
    gl.vertexAttribPointer(loc.seedSize, 2, gl.FLOAT, false, stride, 16);
  };

  return {
    id: "player-pulse",
    type: "custom",
    renderingMode: "2d",

    setRunning(on: boolean) {
      running = on;
      if (on) map?.triggerRepaint();
    },

    onAdd(m, gl) {
      map = m;
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      loc.merc = gl.getAttribLocation(program, "a_merc");
      loc.corner = gl.getAttribLocation(program, "a_corner");
      loc.seedSize = gl.getAttribLocation(program, "a_seed_size");
      for (const name of ["u_matrix", "u_viewport", "u_radius", "u_offset", "u_time", "u_alpha", "u_color"])
        uni[name] = gl.getUniformLocation(program, name);

      // Two triangles per city: [merc.x, merc.y, corner.x, corner.y, seed, size].
      const corners = [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1];
      const data: number[] = [];
      for (const p of points) {
        const { x, y } = toMercator([p.lon, p.lat]);
        for (let i = 0; i < corners.length; i += 2) data.push(x, y, corners[i], corners[i + 1], p.seed, p.size);
      }
      count = data.length / 6;
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

      // MapLibre draws through vertex array objects. Pointing attributes while
      // one of ITS arrays is bound would rewrite that array, so on WebGL2 the
      // pulse records its own and binds it only for its own draw.
      if ("createVertexArray" in gl) {
        const gl2 = gl as WebGL2RenderingContext;
        vao = gl2.createVertexArray();
        gl2.bindVertexArray(vao);
        bindAttributes(gl);
        gl2.bindVertexArray(null);
      }
    },

    render(gl, options: CustomRenderMethodInput) {
      if (!map || !program || count === 0) return;
      const zoom = map.getZoom();
      const alpha = Math.max(0, Math.min(1, (fadeFrom - zoom) / 0.5));
      if (alpha > 0) {
        gl.useProgram(program);
        if (vao) (gl as WebGL2RenderingContext).bindVertexArray(vao);
        else bindAttributes(gl);

        gl.uniformMatrix4fv(uni.u_matrix, false, options.modelViewProjectionMatrix as Float32Array);
        gl.uniform2f(uni.u_viewport, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.uniform1f(uni.u_radius, RADIUS * map.getPixelRatio());
        gl.uniform1f(uni.u_time, (performance.now() - start) / 1000);
        gl.uniform1f(uni.u_alpha, alpha);
        gl.uniform3f(uni.u_color, tint[0], tint[1], tint[2]);

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        // The world repeats sideways; draw the copy either side as well.
        for (const offset of [-1, 0, 1]) {
          gl.uniform1f(uni.u_offset, offset);
          gl.drawArrays(gl.TRIANGLES, 0, count);
        }
        if (vao) (gl as WebGL2RenderingContext).bindVertexArray(null);
      }
      if (running && alpha > 0) map.triggerRepaint();
    },

    onRemove(_m, gl) {
      if (buffer) gl.deleteBuffer(buffer);
      if (vao) (gl as WebGL2RenderingContext).deleteVertexArray(vao);
      if (program) gl.deleteProgram(program);
      map = null;
    },
  };
}
