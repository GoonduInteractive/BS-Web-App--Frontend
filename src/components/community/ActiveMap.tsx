"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Feature, MultiPolygon, Position } from "geojson";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";

import { pulseLayer } from "@/components/community/map-pulse";
import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";
import type { PlayerHotspot } from "@/types/players";

/**
 * The Active Player Map: a world in a disc that you pan and zoom like a map
 * app, with a pin wherever players are - and, per the human, THE SNAPCHAT
 * FEEL: tap a pin and the map flies down to the streets of that city.
 * Figma: `05-community/Active player map.png` - the disc 524..1256 x 664..1342
 * at 1440, white dots on an 8px grid over --color-globe, Europe and Africa in
 * view, pins in West Africa.
 *
 * WHAT DRAWS IT. MapLibre GL, on WebGL, over OpenFreeMap's vector tiles (see
 * STYLE) - since 2026-10-01. It was Leaflet over Stadia's raster tiles, and
 * Stadia's free tier is for non-commercial sites only; OpenFreeMap is free for
 * commercial use with no key and no limits, but serves vector tiles only, which
 * need WebGL. The team lifted the project's no-WebGL rule FOR THIS MAP ALONE
 * to take it (the gates are still static plates). ~230KB of JS gzipped, in
 * this chunk alone; the map loads when its tab is chosen. Below continent
 * level the basemap is switched off, so no tiles are fetched at rest.
 *
 * WEBGL, SO THE MOTION IS THE GPU'S:
 * - a live pulse rippling from under every city pin (`map-pulse.ts`, its own
 *   shader), which stops while the disc is off screen;
 * - a flight to a city tilts the camera as it lands, so the streets recede
 *   into the distance;
 * - from street level the buildings rise out of the ground as you zoom in
 *   (an extrusion whose height grows with the zoom).
 *
 * ONE PIN FOR A CITY, THEN ONE FOR EACH PLAYER. Per the human: Nairobi reads
 * 15 active players, so at street level it shows fifteen pins, each where that
 * player is, not one for the city. From PLAYERS_FROM the city pins give way
 * to every in-view city's players (`hotspot.players`), which arrive with a
 * small drop; below it the city pins are back. A flight to a pin lands past
 * the threshold, so tapping Nairobi opens on its fifteen.
 *
 * TWO LOOKS, CROSS-FADED BY ZOOM. At rest the frame's dotted world: Natural
 * Earth's 1:110m land filled with an 8px dot pattern over the disc's own
 * colour, laid over a cover of that colour that hides the basemap. From
 * continent level (DOTS_UNTIL) the cover and the dots fade out and the streets
 * show through; by TILES_FROM the city is all streets.
 *
 * GESTURES: drag pans, the wheel zooms about the cursor, the keyboard pans and
 * zooms (the canvas is focusable), pins are focusable and Enter chooses one.
 * No rotation and no hand-tilting - the disc always reads north-up. On a touch
 * screen one finger scrolls the PAGE and two fingers move the map - the
 * cooperative rule map embeds settled on, because a 630px disc that fills a
 * phone's width would otherwise trap a thumb.
 *
 * Reduced motion: no pulse, no tilt, no rising buildings, every flight is a
 * jump and the fades are instant.
 *
 * NO WEBGL, NO MAP. A browser with WebGL switched off gets the empty disc and
 * one line saying why; the readout and the search beside it still work.
 *
 * `data-lenis-prevent` on the disc: the wheel zooms it, and Lenis must not
 * scroll the page under a zoom.
 */

/**
 * The basemap: OpenFreeMap's Dark style over OpenStreetMap data - the site's
 * near-black, roads and names at street level. Free for commercial use, no
 * key, no request limit. `NEXT_PUBLIC_MAP_STYLE` swaps in any other MapLibre
 * style URL. The attribution is the providers' required line, not copy.
 */
const STYLE = {
  url: process.env.NEXT_PUBLIC_MAP_STYLE ?? "https://tiles.openfreemap.org/styles/dark",
  attribution: [
    { label: "© OpenFreeMap", href: "https://openfreemap.org/" },
    { label: "© OpenMapTiles", href: "https://www.openmaptiles.org/" },
    { label: "© OpenStreetMap contributors", href: "https://www.openstreetmap.org/copyright" },
  ],
} as const;

/*
 * ZOOM LEVELS ARE MAPLIBRE'S: one less than Leaflet's for the same view
 * (MapLibre's tiles are 512px), so each of these is the Leaflet build's
 * value minus one.
 */

/**
 * Where a fresh visitor looks: the frame's view - the Americas' east coast to
 * India, Africa low-centre - at the frame's 732px disc. A smaller disc opens
 * a step further out so it shows the same slice of the world, as the phone
 * frame does, rather than a narrower one.
 */
const HOME = { center: [6.5, 20] as [number, number], zoom: 1.85, disc: 732 };
/** Where a pin takes you: the city's streets. */
const STREET_ZOOM = 12;
/** From this zoom a city's pin gives way to one pin per player in it. */
const PLAYERS_FROM = 9;
const ZOOM = { min: 1, max: 17 };
/** The dots are whole below this zoom and gone above the next; the streets the reverse. */
const DOTS_UNTIL = 3;
const TILES_FROM = 5.5;
/** The camera's tilt at street level, and the zoom below which it levels out again. */
const PITCH = 50;
const PITCH_FROM = 7;
/** Buildings start flat here and reach their full height by BUILDINGS_FULL. */
const BUILDINGS_FROM = 13;
const BUILDINGS_FULL = 15;

const topology = land110 as unknown as Topology<{ land: GeometryCollection }>;
const land = unwrap(feature(topology, topology.objects.land).features[0] as Feature<MultiPolygon>);

/**
 * Natural Earth cuts its polygons at the antimeridian, and three of them -
 * Fiji, Wrangel Island and the Chukotka tip of Afro-Eurasia - carry an edge
 * that jumps from 180° to −180°. On a sphere that is nothing; on a flat
 * Mercator map it is a straight line across the whole world, one dot row wide,
 * at 16°S. So every ring is unwrapped - a jump of more than 180° shifts what
 * follows by a full turn - and a ring that ends up past ±180° is drawn twice,
 * a turn apart, so it shows at both edges of the world. Antarctica goes:
 * Mercator clamps its coast to the world's bottom edge as a solid band the
 * frame does not draw.
 */
function unwrap(input: Feature<MultiPolygon>): Feature<MultiPolygon> {
  const polygons: Position[][][] = [];
  for (const polygon of input.geometry.coordinates) {
    if (polygon[0].some(([, lat]) => lat < -80)) continue;
    let offset = 0;
    let crossed = false;
    const rings = polygon.map((ring) =>
      ring.map(([lon, lat], i, r) => {
        if (i === 0) offset = 0;
        else {
          const jump = lon - r[i - 1][0];
          if (jump > 180) offset -= 360;
          else if (jump < -180) offset += 360;
          if (offset !== 0) crossed = true;
        }
        return [lon + offset, lat];
      }),
    );
    polygons.push(rings);
    if (crossed) {
      const turn = rings[0].some(([lon]) => lon > 180) ? -360 : 360;
      polygons.push(rings.map((ring) => ring.map(([lon, lat]) => [lon + turn, lat])));
    }
  }
  return { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: polygons } };
}

/** A stable 0..1 from a city's id, so its pulse keeps the same phase on every visit. */
function seedOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

/** The 8px dot the land is filled with, drawn at the screen's density. */
function dotImage(color: string, ratio: number): ImageData {
  const size = 8 * ratio;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(4 * ratio, 4 * ratio, 2 * ratio, 0, Math.PI * 2);
  ctx.fill();
  return ctx.getImageData(0, 0, size, size);
}

/** A pin's element: a div wearing the artwork. MapLibre's translate lives on the div; the hover scale is on the <img>. */
function pinElement(className: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = className;
  el.innerHTML = `<img src="/assets/community/map pin.svg" alt="" width="27" height="37" draggable="false">`;
  return el;
}

export function ActiveMap({
  hotspots,
  selected,
  onSelect,
  messages,
  className,
  discClassName,
}: {
  hotspots: readonly PlayerHotspot[];
  selected: PlayerHotspot;
  onSelect: (spot: PlayerHotspot) => void;
  messages: Messages;
  /** The stage: the box the zoom controls pin to, which clips a disc wider than it. */
  className?: string;
  /** The disc's own size, centred in the stage. */
  discClassName?: string;
}) {
  const t = messages.community.map;
  const disc = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // The latest handler, for markers created once.
  const select = useRef(onSelect);
  useEffect(() => {
    select.current = onSelect;
  });

  const pinLabel = useMemo(
    () => (spot: PlayerHotspot) =>
      t.pinLabel.replace("{city}", spot.city).replace("{country}", spot.country).replace("{n}", String(spot.active)),
    [t.pinLabel],
  );

  // Build the map once the disc has a box. MapLibre is imported here, not at
  // the top: it reads `window` as it loads, and it is most of this chunk.
  useEffect(() => {
    const el = disc.current;
    if (!el) return;
    let cancelled = false;
    let instance: MapLibreMap | null = null;
    let visibility: IntersectionObserver | null = null;
    let onVisibility: (() => void) | null = null;
    const pins = markers.current;

    void import("maplibre-gl").then((ml) => {
      if (cancelled || !disc.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const css = getComputedStyle(document.documentElement);
      const globe = css.getPropertyValue("--color-globe").trim() || "#140e0e";
      const ink = css.getPropertyValue("--color-menu-fg").trim() || "#fbfbfb";
      const signal = css.getPropertyValue("--color-signal").trim() || "#fb0b01";

      try {
        instance = new ml.Map({
          container: el,
          style: STYLE.url,
          center: HOME.center,
          zoom: Math.max(ZOOM.min, HOME.zoom + Math.log2(el.clientWidth / HOME.disc)),
          minZoom: ZOOM.min,
          maxZoom: ZOOM.max,
          maxPitch: PITCH,
          attributionControl: false,
          renderWorldCopies: true,
          // One finger is the page's on a touch screen; two are the map's.
          dragPan: !coarse,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          boxZoom: false,
          fadeDuration: reduced ? 0 : 300,
        });
      } catch {
        // No WebGL in this browser (switched off, or a very old device).
        setFailed(true);
        return;
      }
      const m = instance;
      map.current = m;
      m.touchZoomRotate.disableRotation();
      m.keyboard.disableRotation();
      m.getCanvas().setAttribute("aria-label", t.mapLabel);

      m.on("load", () => {
        if (cancelled) return;

        // ---- the streets, switched off until the zoom asks for them ----
        // A hidden layer's source is not fetched, so the world at rest costs
        // no tiles; everything the style drew is the basemap.
        const basemap = m.getStyle().layers.map((layer) => layer.id);
        let streetsOn = true;
        const streets = () => {
          const on = m.getZoom() >= DOTS_UNTIL - 0.25;
          if (on === streetsOn) return;
          streetsOn = on;
          for (const id of basemap) m.setLayoutProperty(id, "visibility", on ? "visible" : "none");
        };

        // ---- the buildings, rising out of the ground as the zoom gets close ----
        if (m.getSource("openmaptiles")) {
          m.addLayer({
            id: "buildings-3d",
            type: "fill-extrusion",
            source: "openmaptiles",
            "source-layer": "building",
            minzoom: BUILDINGS_FROM,
            paint: {
              "fill-extrusion-color": "#2a2222",
              "fill-extrusion-opacity": 0.85,
              "fill-extrusion-height": reduced
                ? ["coalesce", ["get", "render_height"], 0]
                : [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    BUILDINGS_FROM,
                    0,
                    BUILDINGS_FULL,
                    ["coalesce", ["get", "render_height"], 0],
                  ],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
            },
          });
        }

        // ---- the cover and the dotted world, over the streets ----
        const fade = (from: number, to: number) =>
          ["interpolate", ["linear"], ["zoom"], DOTS_UNTIL, from, TILES_FROM, to] as unknown as number;
        m.addLayer({ id: "globe-cover", type: "background", paint: { "background-color": globe, "background-opacity": fade(1, 0) } });
        const ratio = Math.max(1, Math.round(window.devicePixelRatio || 1));
        m.addImage("map-dots", dotImage(ink, ratio), { pixelRatio: ratio });
        m.addSource("land", { type: "geojson", data: land });
        m.addLayer({
          id: "land-dots",
          type: "fill",
          source: "land",
          paint: { "fill-pattern": "map-dots", "fill-opacity": fade(1, 0), "fill-antialias": false },
        });

        // ---- the pulse under every city pin ----
        if (!reduced) {
          const pulse = pulseLayer({
            points: hotspots.map((spot) => ({
              lon: spot.lon,
              lat: spot.lat,
              seed: seedOf(spot.id),
              size: 0.8 + 0.5 * Math.min(1, Math.log10(Math.max(1, spot.active)) / 2),
            })),
            color: signal,
            fadeFrom: PLAYERS_FROM,
            toMercator: (lngLat) => ml.MercatorCoordinate.fromLngLat(lngLat),
          });
          m.addLayer(pulse);
          // Stop asking for frames while nobody can see the disc.
          let onScreen = true;
          const update = () => pulse.setRunning(onScreen && document.visibilityState === "visible");
          visibility = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            update();
          });
          visibility.observe(el);
          onVisibility = update;
          document.addEventListener("visibilitychange", update);
        }

        // ---- the pins ----
        markers.current.clear();
        for (const spot of hotspots) {
          const pin = pinElement("map-pin");
          pin.tabIndex = 0;
          pin.setAttribute("role", "button");
          pin.setAttribute("aria-label", pinLabel(spot));
          pin.title = pinLabel(spot);
          pin.addEventListener("click", (e) => {
            e.stopPropagation();
            select.current(spot);
          });
          pin.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            select.current(spot);
          });
          const marker = new ml.Marker({ element: pin, anchor: "bottom" }).setLngLat([spot.lon, spot.lat]).addTo(m);
          markers.current.set(spot.id, marker);
        }

        // ---- the players, one pin each, per city ----
        // Decorative (no keyboard, no role): the readout carries the count and
        // the city pin the name. Each city's players are added while the map
        // is close enough and the city is near the view, removed otherwise -
        // a few hundred markers site-wide never all exist at once.
        const groups = new Map<string, Marker[]>();
        for (const spot of hotspots) {
          groups.set(
            spot.id,
            spot.players.map((player) => {
              const pin = pinElement("map-pin map-pin--player");
              pin.setAttribute("aria-hidden", "true");
              return new ml.Marker({ element: pin, anchor: "bottom" }).setLngLat([player.lon, player.lat]);
            }),
          );
        }
        const shown = new Set<string>();
        const cityShown = new Set(hotspots.map((spot) => spot.id));
        const sync = () => {
          const close = m.getZoom() >= PLAYERS_FROM;
          const bounds = m.getBounds();
          const lonPad = (bounds.getEast() - bounds.getWest()) / 2;
          const latPad = (bounds.getNorth() - bounds.getSouth()) / 2;
          for (const spot of hotspots) {
            const city = markers.current.get(spot.id);
            if (!city) continue;
            const near =
              spot.lon >= bounds.getWest() - lonPad &&
              spot.lon <= bounds.getEast() + lonPad &&
              spot.lat >= bounds.getSouth() - latPad &&
              spot.lat <= bounds.getNorth() + latPad;
            const show = close && near;
            if (show && !shown.has(spot.id)) {
              for (const p of groups.get(spot.id) ?? []) p.addTo(m);
              shown.add(spot.id);
            } else if (!show && shown.has(spot.id)) {
              for (const p of groups.get(spot.id) ?? []) p.remove();
              shown.delete(spot.id);
            }
            if (close && cityShown.has(spot.id)) {
              city.remove();
              cityShown.delete(spot.id);
            } else if (!close && !cityShown.has(spot.id)) {
              city.addTo(m);
              cityShown.add(spot.id);
            }
          }
        };

        // Back out past city level and the camera levels off again.
        const level = () => {
          if (m.getZoom() < PITCH_FROM && m.getPitch() > 0 && !m.isMoving())
            m.easeTo({ pitch: 0, duration: reduced ? 0 : 500 });
        };

        m.on("zoom", streets);
        m.on("moveend", () => {
          sync();
          level();
        });
        streets();
        sync();

        // The pins drop onto the map, west to east as they were added. The
        // tween is on the artwork, not the marker (MapLibre's translate lives
        // there), and clears the transform properties it neutralised so the
        // hover pop works again once they have landed.
        if (!reduced) {
          void import("gsap").then(({ gsap }) => {
            if (cancelled) return;
            gsap.from(el.querySelectorAll(".map-pin:not(.map-pin--player) img"), {
              y: -18,
              opacity: 0,
              duration: 0.6,
              ease: "back.out(1.7)",
              stagger: 0.04,
              clearProps: "opacity,transform,translate,rotate,scale",
            });
          });
        }

        setReady(true);
      });
    });

    return () => {
      cancelled = true;
      visibility?.disconnect();
      if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
      instance?.remove();
      map.current = null;
      pins.clear();
      setReady(false);
    };
    // Hotspots and labels are the page's data; a new set is a new map.
  }, [hotspots, pinLabel, t.mapLabel]);

  // Fly to whatever is selected - a pin, a search result - down to its streets.
  const lastSelected = useRef<string | null>(null);
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    // The chosen pin stands a little taller, as the first build's did.
    for (const [id, marker] of markers.current) {
      marker.getElement().classList.toggle("is-selected", id === selected.id);
      marker.getElement().setAttribute("aria-pressed", String(id === selected.id));
    }
    if (lastSelected.current === selected.id) return;
    const first = lastSelected.current === null;
    lastSelected.current = selected.id;
    if (first) return; // the frame's opening view, not a flight to Lagos
    const center: [number, number] = [selected.lon, selected.lat];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) m.jumpTo({ center, zoom: STREET_ZOOM });
    else m.flyTo({ center, zoom: STREET_ZOOM, pitch: PITCH, duration: 2200, curve: 1.5 });
  }, [selected, ready]);

  // The disc's box can change (a resize, the tab shown); MapLibre must hear of it.
  useEffect(() => {
    const el = disc.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => map.current?.resize());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // + and − zoom INTO THE CHOSEN PLACE - the one LOCATION names - not the
  // middle of the disc. At rest that middle is the Sahara, and a step in there
  // is a screen of dark desert with nothing on it, which read as the map being
  // covered (the human's phone screenshot, 2026-09-16). A short flight keeps
  // the place centred while the zoom changes; reduced motion jumps.
  const zoomBy = (delta: number) => {
    const m = map.current;
    if (!m) return;
    const center: [number, number] = [selected.lon, selected.lat];
    const zoom = Math.max(ZOOM.min, Math.min(ZOOM.max, m.getZoom() + delta));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) m.jumpTo({ center, zoom });
    else m.flyTo({ center, zoom, pitch: zoom >= PITCH_FROM ? PITCH : 0, duration: 600 });
  };

  return (
    <div className={cn("relative", className)}>
      {/* The clip: a disc wider than the stage is cut at the stage's edges. */}
      <div className="flex justify-center overflow-hidden">
        <div
          ref={disc}
          data-lenis-prevent
          role="region"
          aria-label={t.mapLabel}
          className={cn(
            "map-disc bg-globe relative aspect-square w-full shrink-0 overflow-hidden rounded-full select-none",
            discClassName,
          )}
        >
          {failed && (
            <p className="text-menu-fg/70 font-body text-body-sm absolute inset-0 grid place-items-center px-[18%] text-center">
              {t.unavailable}
            </p>
          )}
        </div>
      </div>

      {/* Zoom, for anyone without a wheel or two fingers. Pinned to the stage,
          not the disc: on a phone the disc runs past both edges of the screen. */}
      {!failed && (
        <div className="absolute right-5 bottom-5 flex flex-col gap-1.5 lg:right-6 lg:bottom-6">
          <ZoomButton label={t.zoomIn} onClick={() => zoomBy(1)}>
            +
          </ZoomButton>
          <ZoomButton label={t.zoomOut} onClick={() => zoomBy(-1)}>
            −
          </ZoomButton>
        </div>
      )}

      {/* The map providers' required credit, under the disc. */}
      <p className="text-menu-fg/45 font-body pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 text-[0.625rem] leading-none whitespace-nowrap">
        {STYLE.attribution.map((a, i) => (
          <a
            key={a.href}
            href={a.href}
            target="_blank"
            rel="noreferrer"
            className="hover:text-menu-fg focus-visible:outline-signal pointer-events-auto transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {i ? ` ${a.label}` : a.label}
          </a>
        ))}
      </p>
    </div>
  );
}

function ZoomButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="bg-globe text-menu-fg font-body border-menu-fg/25 hover:border-menu-fg/60 focus-visible:outline-signal ease-gate grid size-9 cursor-pointer place-items-center rounded-full border text-[1.125rem] leading-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {children}
    </button>
  );
}
