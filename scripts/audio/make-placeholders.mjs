/**
 * PLACEHOLDER AMBIENCE, SYNTHESISED - not Goondu's sound design.
 *
 * The sound layer needs five beds to be built and heard: one per gate, matched
 * to what that gate's plate shows, and one for every page that is not a gate.
 * None had been delivered, so these are generated here rather than taken from
 * a stock library, which keeps the repo free of anything with a licence
 * attached to it and makes it obvious that they are stand-ins.
 *
 *   npm run audio        regenerates every file in public/audio/
 *
 * REPLACE THEM by dropping real files at the same five paths; nothing else
 * changes. When they land, this script and its `@breezystack/lamejs`
 * devDependency can go with the placeholders.
 *
 * Everything is deterministic: a seeded PRNG, oscillators whose periods divide
 * the loop exactly, and a half-length crossfade over the noise so each file
 * loops without a seam.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Mp3Encoder } from "@breezystack/lamejs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../../public/audio");
const RATE = 22050;
const SECONDS = 16;
const KBPS = 48;
const N = RATE * SECONDS;

/** Deterministic noise, so a regeneration produces the same files. */
function prng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const noise = (rand) => Array.from({ length: N }, () => rand() * 2 - 1);

/** One-pole filters - enough to turn white noise into wind or water. */
function lowpass(input, cutoff) {
  const a = Math.exp((-2 * Math.PI * cutoff) / RATE);
  const out = new Float64Array(N);
  let y = 0;
  for (let i = 0; i < N; i++) out[i] = y = (1 - a) * input[i] + a * y;
  return out;
}

function highpass(input, cutoff) {
  const low = lowpass(input, cutoff);
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) out[i] = input[i] - low[i];
  return out;
}

/** A sine whose period divides the loop, so its ends meet. */
function tone(hz, amp, phase = 0) {
  const cycles = Math.max(1, Math.round((hz * N) / RATE));
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) out[i] = amp * Math.sin(2 * Math.PI * (cycles * i / N + phase));
  return out;
}

/** Slow swell, also whole-cycle, for wind and breathing pads. */
const swell = (hz, depth, phase = 0) => {
  const cycles = Math.max(1, Math.round((hz * N) / RATE));
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) out[i] = 1 - depth + depth * (0.5 + 0.5 * Math.sin(2 * Math.PI * (cycles * i / N + phase)));
  return out;
};

/**
 * A struck sound - bell, drum, bird - placed at `at` seconds, wrapped round the
 * loop so a tail that runs past the end continues at the start.
 */
function strike(buf, at, { hz, decay, amp, harmonics = [1], sweep = 0 }) {
  const start = Math.floor(at * RATE);
  const length = Math.floor(decay * RATE * 4);
  for (let k = 0; k < length; k++) {
    const t = k / RATE;
    const env = Math.exp(-t / decay);
    let v = 0;
    for (const [h, weight] of harmonics.map((w, idx) => [idx + 1, w])) {
      v += weight * Math.sin(2 * Math.PI * hz * h * t * (1 + sweep * t));
    }
    buf[(start + k) % N] += amp * env * v;
  }
}

/** Seamless loop: fold the buffer onto itself half a length away. */
function seamless(buf) {
  const out = new Float64Array(N);
  const half = Math.floor(N / 2);
  for (let i = 0; i < N; i++) {
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N); // 0 at both ends
    out[i] = w * buf[i] + (1 - w) * buf[(i + half) % N];
  }
  return out;
}

function mix(...layers) {
  const out = new Float64Array(N);
  for (const layer of layers) for (let i = 0; i < N; i++) out[i] += layer[i];
  return out;
}

function scale(buf, envelope) {
  const out = new Float64Array(N);
  for (let i = 0; i < N; i++) out[i] = buf[i] * envelope[i];
  return out;
}

function encode(name, buf) {
  // Normalise to a calm -12dBFS or so; this is a bed, not a track.
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? 0.25 / peak : 0;
  const pcm = new Int16Array(N);
  for (let i = 0; i < N; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(buf[i] * gain * 32767)));

  const encoder = new Mp3Encoder(1, RATE, KBPS);
  const chunks = [];
  const BLOCK = 1152;
  for (let i = 0; i < pcm.length; i += BLOCK) {
    const block = encoder.encodeBuffer(pcm.subarray(i, i + BLOCK));
    if (block.length) chunks.push(Buffer.from(block));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Buffer.from(tail));

  const file = join(OUT, name);
  writeFileSync(file, Buffer.concat(chunks));
  return Buffer.concat(chunks).length;
}

mkdirSync(OUT, { recursive: true });

// --- Ọnụ Ụzọ 1, the grove: damp forest, leaves, birds far off -------------
{
  const rand = prng(1301);
  const leaves = scale(highpass(lowpass(noise(rand), 2600), 700), swell(0.31, 0.55));
  const air = scale(lowpass(noise(rand), 420), swell(0.13, 0.4, 0.3));
  const bed = mix(scale(leaves, swell(0.07, 0.3)), air, tone(88, 0.05));
  const out = seamless(bed);
  for (const [at, hz] of [[1.7, 2100], [4.3, 2600], [8.9, 1850], [12.4, 2400], [14.6, 2950]]) {
    strike(out, at, { hz, decay: 0.07, amp: 0.045, harmonics: [1, 0.3], sweep: 1.4 });
  }
  console.log("gate-1-grove.mp3   ", encode("gate-1-grove.mp3", out), "bytes");
}

// --- Ọnụ Ụzọ 2, the shrine: spirit tree, still air, chimes ----------------
{
  const rand = prng(2027);
  const air = scale(lowpass(noise(rand), 900), swell(0.09, 0.5));
  const pad = mix(tone(110, 0.12), tone(164.8, 0.08), tone(220, 0.05), tone(329.6, 0.03));
  const out = seamless(mix(scale(air, swell(0.05, 0.35)), scale(pad, swell(0.062, 0.45, 0.25))));
  for (const [at, hz] of [[0.9, 1046], [3.8, 1318], [6.1, 1568], [9.7, 1046], [13.2, 1318]]) {
    strike(out, at, { hz, decay: 1.5, amp: 0.05, harmonics: [1, 0.45, 0.2] });
  }
  console.log("gate-2-shrine.mp3  ", encode("gate-2-shrine.mp3", out), "bytes");
}

// --- Ọnụ Ụzọ 3, the canyon: open plaza, wind, water far below -------------
{
  const rand = prng(3167);
  const wind = scale(lowpass(noise(rand), 1500), swell(0.11, 0.65));
  const fall = scale(highpass(lowpass(noise(rand), 5200), 1600), swell(0.043, 0.25));
  const deep = mix(tone(55, 0.1), tone(82.4, 0.05));
  console.log("gate-3-canyon.mp3  ", encode("gate-3-canyon.mp3", seamless(mix(wind, scale(fall, swell(0.08, 0.3)), deep))), "bytes");
}

// --- Ọnụ Ụzọ 4, the arena: dark stone, hollow drums -----------------------
{
  const rand = prng(4093);
  const room = scale(lowpass(noise(rand), 260), swell(0.07, 0.6));
  const drone = mix(tone(43.6, 0.16), tone(65.4, 0.07), tone(98, 0.03));
  const out = seamless(mix(room, scale(drone, swell(0.05, 0.3, 0.6))));
  for (const at of [0.4, 4.4, 8.4, 12.4]) {
    strike(out, at, { hz: 58, decay: 0.45, amp: 0.14, harmonics: [1, 0.5, 0.25] });
    strike(out, at + 1.1, { hz: 58, decay: 0.3, amp: 0.07, harmonics: [1, 0.4] });
  }
  console.log("gate-4-arena.mp3   ", encode("gate-4-arena.mp3", out), "bytes");
}

// --- Everywhere else: the site's own quiet bed ----------------------------
{
  const rand = prng(5077);
  const air = scale(lowpass(noise(rand), 620), swell(0.08, 0.45));
  const drone = mix(tone(65.4, 0.13), tone(98, 0.06), tone(130.8, 0.025));
  console.log("default.mp3        ", encode("default.mp3", seamless(mix(air, scale(drone, swell(0.045, 0.3))))), "bytes");
}
