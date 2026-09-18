"use client";

import "leaflet/dist/leaflet.css";

import type { Feature, MultiPolygon, Position } from "geojson";
import type { LayerGroup, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";

import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";
import type { PlayerHotspot } from "@/types/players";

/**
 * The Active Player Map: a world in a disc that you pan and zoom like a map
 * app, with a pin wherever players are — and, per the human, THE SNAPCHAT
 * FEEL: tap a pin and the map flies down to the streets of that city.
 * Figma: `05-community/Active player map.png` — the disc 524..1256 x 664..1342
 * at 1440, white dots on an 8px grid over --color-globe, Europe and Africa in
 * view, pins in West Africa.
 *
 * WHAT DRAWS IT. Leaflet, and only Leaflet: the streets are OpenStreetMap
 * tiles from a provider (see TILES), and Leaflet is the tile map library that
 * does not need WebGL — MapLibre would, and the project forbids it. ~40KB of
 * JS and 14KB of CSS, in this chunk alone; the map loads when its tab is
 * chosen. Tiles cost data only when someone zooms in — nothing streams at
 * rest, which matters on a metered connection.
 *
 * ONE PIN FOR A CITY, THEN ONE FOR EACH PLAYER. Per the human: Nairobi reads
 * 15 active players, so at street level it shows fifteen pins, each where that
 * player is, not one for the city. From PLAYERS_FROM the city pins give way
 * to every in-view city's players (`hotspot.players`), which arrive with a
 * small drop; below it the city pins are back. A flight to a pin lands past
 * the threshold, so tapping Nairobi opens on its fifteen.
 *
 * TWO LAYERS, CROSS-FADED BY ZOOM. At rest the frame's dotted world: Natural
 * Earth's 1:110m land as a GeoJSON layer whose fill is an 8px dot pattern,
 * over the disc's own colour. From continent level (DOTS_UNTIL) the street
 * tiles fade in beneath and the dots fade out; by TILES_FROM the city is all
 * streets. So the designed look holds at rest and the depth is there on tap.
 *
 * GESTURES are Leaflet's: drag pans, the wheel zooms about the cursor, the
 * keyboard pans and zooms (the disc is focusable), pins are focusable and
 * Enter chooses one. On a touch screen one finger scrolls the PAGE and two
 * fingers move the map — the cooperative rule map embeds settled on, because
 * a 630px disc that fills a phone's width would otherwise trap a thumb.
 * Reduced motion: every flight is a jump and Leaflet's own animations are
 * off.
 *
 * `data-lenis-prevent` on the disc: the wheel zooms it, and Lenis must not
 * scroll the page under a zoom.
 */

/**
 * The street tiles: Stadia Maps' Alidade Smooth Dark over OpenStreetMap
 * data — the site's near-black, roads and names at street level. Stadia
 * serves localhost without a key, so development just works; ⚠ A DEPLOYED
 * SITE NEEDS ONE. Register the domain on Stadia's free tier (200k credits a
 * month) and set `NEXT_PUBLIC_MAP_TILES` to this template with
 * `?api_key=…` appended — or to any other raster provider's template. CARTO
 * was tried first and now watermarks its keyless tiles API KEY REQUIRED. The
 * attribution is the providers' required line, not copy.
 */
const TILES = {
  url: process.env.NEXT_PUBLIC_MAP_TILES ?? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  maxZoom: 20,
  attribution: [
    { label: "© Stadia Maps", href: "https://www.stadiamaps.com/" },
    { label: "© OpenMapTiles", href: "https://openmaptiles.org/" },
    { label: "© OpenStreetMap contributors", href: "https://www.openstreetmap.org/copyright" },
  ],
} as const;

/**
 * Where a fresh visitor looks: the frame's view — the Americas' east coast to
 * India, Africa low-centre — at the frame's 732px disc. A smaller disc opens
 * a step further out so it shows the same slice of the world, as the phone
 * frame does, rather than a narrower one.
 */
const HOME = { center: [20, 6.5] as [number, number], zoom: 2.85, disc: 732 };
/** Where a pin takes you: the city's streets. */
const STREET_ZOOM = 13;
/** From this zoom a city's pin gives way to one pin per player in it. */
const PLAYERS_FROM = 10;
const ZOOM = { min: 2, max: 18 };
/** The dots are whole below this zoom and gone above the next; the tiles the reverse. */
const DOTS_UNTIL = 4;
const TILES_FROM = 6.5;

/**
 * Ask the browser for the tiles a flight will land on BEFORE it takes off.
 *
 * The tile layer waits for the map to come to rest (`updateWhenIdle`, so a
 * flight fetches ~20 tiles and not ~200), which means the streets are only
 * requested once the 1.8s flight has landed — and until they arrive the disc
 * is its own near-black, which on a phone read as the map being covered (the
 * human's screenshot, 2026-09-16). These are the same tiles Leaflet is about to
 * request, at the same URLs — the level it will draw is the zoom rounded, its
 * view the disc's size about the destination — so nothing extra is downloaded;
 * they simply start 1.8s earlier and are in the cache when Leaflet asks. Below
 * DOTS_UNTIL there are no tiles to want.
 */
function prefetchTiles(m: LeafletMap, to: [number, number], zoom: number) {
  if (zoom < DOTS_UNTIL) return;
  const z = Math.round(zoom);
  const n = 2 ** z;
  const size = m.getSize();
  const centre = m.project(to, z);
  const min = centre.subtract(size.divideBy(2)).divideBy(256).floor();
  const max = centre.add(size.divideBy(2)).divideBy(256).floor();
  for (let x = min.x; x <= max.x; x++) {
    for (let y = Math.max(0, min.y); y <= Math.min(n - 1, max.y); y++) {
      const url = TILES.url
        .replace("{z}", String(z))
        .replace("{x}", String(((x % n) + n) % n))
        .replace("{y}", String(y))
        // Leaflet's own choice for {r}: "@2x" on a retina screen, whatever detectRetina says.
        .replace("{r}", window.devicePixelRatio > 1 ? "@2x" : "");
      new Image().src = url;
    }
  }
}

const topology = land110 as unknown as Topology<{ land: GeometryCollection }>;
const land = unwrap(feature(topology, topology.objects.land).features[0] as Feature<MultiPolygon>);

/**
 * Natural Earth cuts its polygons at the antimeridian, and three of them —
 * Fiji, Wrangel Island and the Chukotka tip of Afro-Eurasia — carry an edge
 * that jumps from 180° to −180°. On a sphere (d3) that is nothing; on
 * Leaflet's flat Mercator it is a straight line across the whole world, one
 * dot row wide, at 16°S. So every ring is unwrapped — a jump of more than 180°
 * shifts what follows by a full turn — and a ring that ends up past ±180° is
 * drawn twice, a turn apart, so it shows at both edges of the world.
 * Antarctica goes: Mercator clamps its coast to the world's bottom edge as
 * a solid band the frame does not draw.
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
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const [ready, setReady] = useState(false);
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

  // Build the map once the disc has a box. Leaflet is imported here, not at
  // the top: it reads `window` as it loads.
  useEffect(() => {
    const el = disc.current;
    if (!el) return;
    let cancelled = false;
    let instance: LeafletMap | null = null;

    void import("leaflet").then((L) => {
      if (cancelled || !disc.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;

      instance = L.map(el, {
        center: HOME.center,
        zoom: HOME.zoom + Math.log2(el.clientWidth / HOME.disc),
        minZoom: ZOOM.min,
        maxZoom: ZOOM.max,
        zoomSnap: 0,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 90,
        zoomControl: false,
        attributionControl: false,
        // One finger is the page's on a touch screen; two are the map's.
        dragging: !coarse,
        touchZoom: true,
        tapHold: false,
        keyboard: true,
        worldCopyJump: true,
        zoomAnimation: !reduced,
        fadeAnimation: !reduced,
        markerZoomAnimation: !reduced,
        inertia: !reduced,
        // Vectors — the dotted land — on SVG, drawn half a view past the edge
        // so a pan never shows a bare strip before the redraw.
        renderer: L.svg({ padding: 0.5 }),
      });
      map.current = instance;

      // ---- the streets, not even requested until the zoom asks for them ----
      const tiles: TileLayer = L.tileLayer(TILES.url, {
        maxZoom: TILES.maxZoom,
        detectRetina: false,
        opacity: 0,
        // Fetch only where a flight lands, not every level it passes through:
        // a pin tap is ~20 tiles this way and ~200 without, on metered data.
        updateWhenZooming: false,
        updateWhenIdle: true,
        keepBuffer: 1,
      });

      // ---- the dotted world ----
      const dots = L.geoJSON(land, {
        style: { className: "map-land", stroke: false, fillOpacity: 1 },
        interactive: false,
      }).addTo(instance);

      let tilesOn = false;
      const fade = () => {
        if (!instance) return;
        const z = instance.getZoom();
        const k = Math.max(0, Math.min(1, (z - DOTS_UNTIL) / (TILES_FROM - DOTS_UNTIL)));
        if (k > 0 && !tilesOn) {
          tiles.addTo(instance);
          tilesOn = true;
        }
        if (tilesOn) tiles.setOpacity(k);
        const pane = dots.getPane();
        if (pane) pane.style.opacity = String(1 - k);
      };
      instance.on("zoom zoomend", fade);
      fade();

      // ---- the pins ----
      // A div wearing the artwork, not the artwork itself: Leaflet places a
      // marker with a translate on its element, and a CSS scale on that same
      // element multiplies the translate — hovering a pin flung it 10% of its
      // distance from the map's origin, out from under the cursor. The scale
      // is on the <img> inside; the div is Leaflet's alone.
      const icon = L.divIcon({
        html: `<img src="/assets/community/map pin.svg" alt="" width="27" height="37" draggable="false">`,
        iconSize: [27, 37],
        iconAnchor: [13.5, 37],
        className: "map-pin",
      });
      markers.current.clear();
      for (const spot of hotspots) {
        const marker = L.marker([spot.lat, spot.lon], { icon, title: pinLabel(spot), keyboard: true, riseOnHover: true })
          .addTo(instance)
          .on("click", () => select.current(spot));
        // A div icon carries no alt; Leaflet gives it role=button, this names it.
        marker.getElement()?.setAttribute("aria-label", pinLabel(spot));
        markers.current.set(spot.id, marker);
      }

      // ---- the players, one pin each, per city ----
      // Decorative (no keyboard, no role): the readout carries the count and
      // the city pin the name. Each city's players are one group, added while
      // the map is close enough and the city is near the view, removed again
      // otherwise — a few hundred markers site-wide never all exist at once.
      const playerIcon = L.divIcon({
        html: `<img src="/assets/community/map pin.svg" alt="" width="27" height="37" draggable="false">`,
        iconSize: [27, 37],
        iconAnchor: [13.5, 37],
        className: "map-pin map-pin--player",
      });
      const groups = new Map<string, LayerGroup>();
      for (const spot of hotspots) {
        const group = L.layerGroup(
          spot.players.map((player) =>
            L.marker([player.lat, player.lon], { icon: playerIcon, interactive: false, keyboard: false }).on("add", (e) =>
              (e.target as Marker).getElement()?.setAttribute("aria-hidden", "true"),
            ),
          ),
        );
        groups.set(spot.id, group);
      }
      const sync = () => {
        if (!instance) return;
        const close = instance.getZoom() >= PLAYERS_FROM;
        const near = instance.getBounds().pad(0.5);
        for (const spot of hotspots) {
          const group = groups.get(spot.id);
          const city = markers.current.get(spot.id);
          if (!group || !city) continue;
          const show = close && near.contains([spot.lat, spot.lon]);
          if (show && !instance.hasLayer(group)) group.addTo(instance);
          else if (!show && instance.hasLayer(group)) group.remove();
          if (close && instance.hasLayer(city)) city.remove();
          else if (!close && !instance.hasLayer(city)) city.addTo(instance);
        }
      };
      instance.on("zoomend moveend", sync);
      sync();

      // The pins drop onto the map, south to north as Leaflet stacks them.
      // The tween is on the artwork, not the marker (Leaflet's translate lives
      // there), and clears the transform properties it neutralised so the
      // hover pop works again once they have landed.
      if (!reduced) {
        void import("gsap").then(({ gsap }) => {
          if (cancelled) return;
          gsap.from(el.querySelectorAll(".map-pin img"), {
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

    return () => {
      cancelled = true;
      instance?.remove();
      map.current = null;
      setReady(false);
    };
    // Hotspots and labels are the page's data; a new set is a new map.
  }, [hotspots, pinLabel]);

  // Fly to whatever is selected — a pin, a search result — down to its streets.
  const lastSelected = useRef<string | null>(null);
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    if (lastSelected.current === selected.id) return;
    const first = lastSelected.current === null;
    lastSelected.current = selected.id;
    // The chosen pin stands a little taller, as the first build's did.
    for (const [id, marker] of markers.current) {
      marker.getElement()?.classList.toggle("is-selected", id === selected.id);
      marker.getElement()?.setAttribute("aria-pressed", String(id === selected.id));
    }
    if (first) return; // the frame's opening view, not a flight to Lagos
    const to: [number, number] = [selected.lat, selected.lon];
    prefetchTiles(m, to, STREET_ZOOM);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) m.setView(to, STREET_ZOOM, { animate: false });
    else m.flyTo(to, STREET_ZOOM, { duration: 1.8, easeLinearity: 0.2 });
  }, [selected, ready]);

  // The disc's box can change (a resize, the tab shown); Leaflet must hear of it.
  useEffect(() => {
    const el = disc.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => map.current?.invalidateSize());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // + and − zoom INTO THE CHOSEN PLACE — the one LOCATION names — not the
  // middle of the disc. At rest that middle is the Sahara, and a step in there
  // is a screen of dark desert with nothing on it, which read as the map being
  // covered (the human's phone screenshot, 2026-09-16). A short flight keeps
  // the place centred while the zoom changes; reduced motion jumps.
  const zoomBy = (delta: number) => {
    const m = map.current;
    if (!m) return;
    const to: [number, number] = [selected.lat, selected.lon];
    const zoom = Math.max(ZOOM.min, Math.min(ZOOM.max, m.getZoom() + delta));
    prefetchTiles(m, to, zoom);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) m.setView(to, zoom, { animate: false });
    else m.flyTo(to, zoom, { duration: 0.6, easeLinearity: 0.3 });
  };

  return (
    <div className={cn("relative", className)}>
      {/* The dot pattern the land is filled with. In the document, not in
          Leaflet's SVG, which it rebuilds; `url(#…)` resolves document-wide. */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <pattern id="map-dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="2" className="fill-menu-fg" />
          </pattern>
        </defs>
      </svg>

      {/* The clip: a disc wider than the stage is cut at the stage's edges. */}
      <div className="flex justify-center overflow-hidden">
        <div
          ref={disc}
          data-lenis-prevent
          role="region"
          aria-label={t.mapLabel}
          className={cn(
            "map-disc bg-globe focus-visible:outline-signal relative aspect-square w-full shrink-0 overflow-hidden rounded-full select-none focus-visible:outline-2 focus-visible:-outline-offset-2",
            discClassName,
          )}
        />
      </div>

      {/* Zoom, for anyone without a wheel or two fingers. Pinned to the stage,
          not the disc: on a phone the disc runs past both edges of the screen. */}
      <div className="absolute right-5 bottom-5 flex flex-col gap-1.5 lg:right-6 lg:bottom-6">
        <ZoomButton label={t.zoomIn} onClick={() => zoomBy(1)}>
          +
        </ZoomButton>
        <ZoomButton label={t.zoomOut} onClick={() => zoomBy(-1)}>
          −
        </ZoomButton>
      </div>

      {/* The tile providers' required credit, under the disc. */}
      <p className="text-menu-fg/45 font-body pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 text-[0.625rem] leading-none whitespace-nowrap">
        {TILES.attribution.map((a, i) => (
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
