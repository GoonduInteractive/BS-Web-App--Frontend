/**
 * Which torn edge to use for a given navigation.
 *
 * Design supplied two shapes, both horizontal and mirror twins of each other.
 * `tear-vertical-1/2.svg` are those same two files rotated -90 degrees at build
 * time; no path data was edited. Combined with a cross-axis flip that costs
 * nothing, two shapes yield four distinct edges per direction, which is enough
 * for the transition to never repeat itself back to back.
 *
 * Genuinely new silhouettes still need Design. Four is the floor, not the goal.
 */

export type TearVariant = {
  src: string;
  /**
   * Mirror on the axis the panel does NOT travel along, so the flip varies the
   * silhouette without interfering with the translation.
   */
  flipped: boolean;
};

/**
 * One list, both orientations. Design supplied two horizontally ragged shapes;
 * the closing panels reuse them turned a quarter turn in CSS rather than in the
 * SVG, because the tear is produced by an feDisplacementMap whose scale is in
 * user-space units and does not survive being rotated inside the file.
 */
const SOURCES: readonly string[] = [
  "/assets/ornaments/tear-horizontal-1.svg",
  "/assets/ornaments/tear-horizontal-2.svg",
];

export const ALL_TEAR_SOURCES = SOURCES;

export function pickVariant(): TearVariant {
  return {
    src: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    flipped: Math.random() < 0.5,
  };
}
